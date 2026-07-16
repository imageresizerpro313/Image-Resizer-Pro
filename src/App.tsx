/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sliders, RefreshCw, Layers } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ControlPanel from './components/ControlPanel';
import PreviewPanel from './components/PreviewPanel';
import { ResizeOptions } from './utils/imageResizer';

export default function App() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    name: string;
    size: number;
    width: number;
    height: number;
    format: string;
  } | null>(null);

  const [options, setOptions] = useState<ResizeOptions>({
    width: 300,
    height: 300,
    mode: 'contain',
    format: 'image/png',
    quality: 0.9,
    resampleMethod: 'step-down',
    backgroundColor: 'transparent',
  });

  const [customFilename, setCustomFilename] = useState<string>('');

  const handleImageLoaded = (data: {
    img: HTMLImageElement;
    name: string;
    size: number;
    width: number;
    height: number;
    format: string;
  }) => {
    setOriginalImage(data.img);
    setImageMeta({
      name: data.name,
      size: data.size,
      width: data.width,
      height: data.height,
      format: data.format,
    });

    // Default target dimensions based on uploaded image or keeping the 300*300 preset
    setOptions((prev) => ({
      ...prev,
      width: 300,
      height: Math.round(300 / (data.width / data.height)), // Lock to keep original aspect ratio for width 300 by default, or 300*300
      mode: 'contain',
    }));
  };

  const handleReset = () => {
    setOriginalImage(null);
    setImageMeta(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-600 selection:text-white">
      {/* HEADER NAVBAR */}
      <header className="border-b border-slate-200 bg-white/80 dark:border-slate-900 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                OptiScale <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">High-Resolution Resizing Engine</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded text-slate-700 dark:text-slate-300">
              v2.4.0 Engine
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 md:py-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!originalImage ? (
            /* STATE 1: File Uploader */
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-center"
            >
              <div className="max-w-2xl mx-auto space-y-3 mb-6">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  High-Fidelity Image Downscaling
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
                  Avoid jagged pixelation. OptiScale preserves crisp borders and high-resolution aspect ratios. Automatically resize to 300×300 and 300×80 pixel dimensions or use custom constraints.
                </p>
              </div>

              <ImageUploader onImageLoaded={handleImageLoaded} />
            </motion.div>
          ) : (
            /* STATE 2: Custom Workspace */
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* CONFIG PANEL: Col span 5 on desktop */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white uppercase text-xs tracking-wider text-slate-400">
                    Configuration Console
                  </h2>
                </div>

                {imageMeta && (
                  <ControlPanel
                    originalWidth={imageMeta.width}
                    originalHeight={imageMeta.height}
                    originalSize={imageMeta.size}
                    originalName={imageMeta.name}
                    originalFormat={imageMeta.format}
                    options={options}
                    setOptions={setOptions}
                    customFilename={customFilename}
                    setCustomFilename={setCustomFilename}
                    onReset={handleReset}
                  />
                )}
              </div>

              {/* PREVIEW & EXPORT PANEL: Col span 7 on desktop */}
              <div className="lg:col-span-7 h-full flex flex-col">
                <div className="space-y-1.5 mb-6 lg:mb-4">
                  <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white uppercase text-xs tracking-wider text-slate-400">
                    Interactive Preview Window
                  </h2>
                </div>

                {imageMeta && (
                  <PreviewPanel
                    originalImage={originalImage}
                    originalSize={imageMeta.size}
                    originalWidth={imageMeta.width}
                    originalHeight={imageMeta.height}
                    options={options}
                    filename={customFilename}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-950 py-6 mt-12 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 OptiScale Pro. Crafted for pristine high resolution downsizings.</p>
          <div className="flex items-center space-x-4">
            <span>Lossless PNG Support</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-800"></span>
            <span>Progressive JPEG & WebP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

