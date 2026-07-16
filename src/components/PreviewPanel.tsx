/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Download, Check, Sparkles, Image as ImageIcon, Eye, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResizeOptions, performResize, calculateOutputSize, formatBytes, downloadCanvas } from '../utils/imageResizer';

interface PreviewPanelProps {
  originalImage: HTMLImageElement;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  options: ResizeOptions;
  filename: string;
}

export default function PreviewPanel({
  originalImage,
  originalSize,
  originalWidth,
  originalHeight,
  options,
  filename,
}: PreviewPanelProps) {
  const [resizedCanvas, setResizedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [resizedSize, setResizedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'resized' | 'comparison'>('resized');

  const containerRef = useRef<HTMLDivElement>(null);

  // Redraw and calculate whenever settings change
  useEffect(() => {
    let active = true;
    setIsProcessing(true);

    const process = async () => {
      try {
        // Run the high-quality resize algorithm
        const { canvas } = performResize(originalImage, options);

        if (!active) return;

        // Estimate file size in the background
        const size = await calculateOutputSize(canvas, options.format, options.quality);

        if (active) {
          setResizedCanvas(canvas);
          setResizedSize(size);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Error rendering image:', err);
        if (active) setIsProcessing(false);
      }
    };

    // Debounce processing slightly to avoid lagging inputs
    const timeoutId = setTimeout(process, 120);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [originalImage, options]);

  const handleDownload = () => {
    if (!resizedCanvas) return;
    downloadCanvas(resizedCanvas, filename, options.format, options.quality);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Compute stats
  const compressionRatio =
    resizedSize && originalSize ? ((originalSize - resizedSize) / originalSize) * 100 : 0;
  const scalePercentX = Math.round((options.width / originalWidth) * 100);
  const scalePercentY = Math.round((options.height / originalHeight) * 100);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      {/* TABS HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div className="flex space-x-1.5 bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl">
          <button
            id="tab-resized-preview"
            onClick={() => setActiveTab('resized')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'resized'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-neutral-900 dark:text-white border border-slate-200/50 dark:border-slate-800'
                : 'text-slate-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Resized Preview
          </button>
          <button
            id="tab-comparison-view"
            onClick={() => setActiveTab('comparison')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-neutral-900 dark:text-white border border-slate-200/50 dark:border-slate-800'
                : 'text-slate-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Comparison Side-by-Side
          </button>
        </div>

        <div className="text-[10px] font-bold font-mono uppercase bg-slate-100 dark:bg-neutral-800 text-slate-500 px-2.5 py-1 rounded">
          {isProcessing ? 'Rendering...' : 'Ready'}
        </div>
      </div>

      {/* RENDER STAGE */}
      <div
        ref={containerRef}
        className="flex-1 min-h-[350px] relative bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center p-4 overflow-hidden mb-5"
      >
        <AnimatePresence mode="wait">
          {isProcessing && !resizedCanvas ? (
            <motion.div
              id="processing-spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-slate-50/80 dark:bg-neutral-950/80 z-20"
            >
              <div className="w-8 h-8 border-3 border-slate-200 dark:border-neutral-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-600 dark:text-neutral-400">Processing image filters...</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="w-full h-full flex items-center justify-center max-h-[450px]">
          {activeTab === 'resized' && resizedCanvas ? (
            <motion.div
              id="resized-canvas-container"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-full max-h-full flex items-center justify-center shadow-lg rounded-lg overflow-hidden bg-checkered"
            >
              {/* Checkered pattern CSS included in container index.css */}
              <img
                id="resized-output-preview"
                src={resizedCanvas.toDataURL(options.format, options.quality)}
                alt="Resized Output"
                className="max-w-full max-h-[400px] object-contain select-none"
                style={{
                  backgroundColor: options.backgroundColor !== 'transparent' ? options.backgroundColor : 'transparent',
                }}
              />
            </motion.div>
          ) : activeTab === 'comparison' && resizedCanvas ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-h-full items-center">
              <div className="flex flex-col items-center space-y-1.5 h-full justify-center">
                <span className="text-[10px] font-mono bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  Original ({originalWidth} × {originalHeight})
                </span>
                <div className="w-full flex-1 min-h-[150px] relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-neutral-900 flex items-center justify-center">
                  <img
                    id="comparison-original-image"
                    src={originalImage.src}
                    alt="Original"
                    className="max-w-full max-h-[180px] object-contain select-none"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center space-y-1.5 h-full justify-center">
                <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  Resized ({options.width} × {options.height})
                </span>
                <div className="w-full flex-1 min-h-[150px] relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-neutral-900 flex items-center justify-center">
                  <img
                    id="comparison-resized-image"
                    src={resizedCanvas.toDataURL(options.format, options.quality)}
                    alt="Resized"
                    className="max-w-full max-h-[180px] object-contain select-none"
                    style={{
                      backgroundColor: options.backgroundColor !== 'transparent' ? options.backgroundColor : 'transparent',
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* METRICS & ANALYSIS PANEL */}
      <div className="bg-slate-50 dark:bg-neutral-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-3 mb-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" /> Optimization Assessment
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 font-medium block">Resized Output</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block font-mono mt-0.5">
              {options.width} × {options.height} px
            </span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 font-medium block">Scale Ratio</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block font-mono mt-0.5">
              {scalePercentX === scalePercentY ? `${scalePercentX}%` : `W:${scalePercentX}% H:${scalePercentY}%`}
            </span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 font-medium block">Estimated Size</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block font-mono mt-0.5">
              {resizedSize !== null ? formatBytes(resizedSize) : 'Calculating...'}
            </span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 font-medium block">File Reduction</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 block font-mono mt-0.5">
              {compressionRatio > 0 ? `-${compressionRatio.toFixed(1)}%` : compressionRatio < 0 ? `+${Math.abs(compressionRatio).toFixed(1)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* DOWNLOAD / ACTIONS PANEL */}
      <div className="flex flex-col space-y-3 mt-auto">
        <motion.button
          id="download-resized-image-button"
          onClick={handleDownload}
          disabled={!resizedCanvas || isProcessing}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
            downloadSuccess
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-emerald-950/20'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 dark:shadow-indigo-950/20'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {downloadSuccess ? (
            <>
              <Check className="w-5 h-5 animate-bounce" /> Saved Successfully!
            </>
          ) : (
            <>
              <Download className="w-5 h-5" /> Download Resized Image
            </>
          )}
        </motion.button>

        {downloadSuccess && (
          <motion.p
            id="download-success-helper-msg"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] text-center text-emerald-600 dark:text-emerald-400 font-medium"
          >
            Saved high resolution image as <span className="font-semibold">{filename}.{options.format.split('/')[1]}</span>
          </motion.p>
        )}
      </div>
    </div>
  );
}
