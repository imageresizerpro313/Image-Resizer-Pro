/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Lock,
  Unlock,
  Settings,
  Image as ImageIcon,
  Sliders,
  Type,
  Maximize2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { AspectRatioMode, OutputFormat, ResampleMethod, ResizeOptions, formatBytes } from '../utils/imageResizer';

interface ControlPanelProps {
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  originalName: string;
  originalFormat: string;
  options: ResizeOptions;
  setOptions: React.Dispatch<React.SetStateAction<ResizeOptions>>;
  customFilename: string;
  setCustomFilename: (name: string) => void;
  onReset: () => void;
}

export default function ControlPanel({
  originalWidth,
  originalHeight,
  originalSize,
  originalName,
  originalFormat,
  options,
  setOptions,
  customFilename,
  setCustomFilename,
  onReset,
}: ControlPanelProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const originalRatio = originalWidth / originalHeight;

  // Custom standard dimensions presets
  const presets = [
    { label: '300 × 300 (Square)', width: 300, height: 300, isPresetRatio: false },
    { label: '300 × 80 (Banner)', width: 300, height: 80, isPresetRatio: false },
    { label: '50% (Half Size)', width: Math.round(originalWidth * 0.5), height: Math.round(originalHeight * 0.5), isPresetRatio: true },
    { label: '25% (Quarter Size)', width: Math.round(originalWidth * 0.25), height: Math.round(originalHeight * 0.25), isPresetRatio: true },
    { label: '1080 × 1080 (Social Square)', width: 1080, height: 1080, isPresetRatio: false },
    { label: '1280 × 720 (HD Video)', width: 1280, height: 720, isPresetRatio: false },
    { label: '1920 × 1080 (Full HD)', width: 1920, height: 1080, isPresetRatio: false },
  ];

  // Keep a clean filename based on original, removing the original extension
  useEffect(() => {
    if (originalName) {
      const baseName = originalName.replace(/\.[^/.]+$/, '');
      setCustomFilename(`${baseName}_resized`);
    }
  }, [originalName, setCustomFilename]);

  // Handle changes to width/height
  const handleWidthChange = (val: number) => {
    if (isNaN(val) || val <= 0) return;
    if (isLocked) {
      const computedHeight = Math.round(val / originalRatio);
      setOptions((prev) => ({
        ...prev,
        width: val,
        height: computedHeight,
      }));
    } else {
      setOptions((prev) => ({
        ...prev,
        width: val,
      }));
    }
  };

  const handleHeightChange = (val: number) => {
    if (isNaN(val) || val <= 0) return;
    if (isLocked) {
      const computedWidth = Math.round(val * originalRatio);
      setOptions((prev) => ({
        ...prev,
        width: computedWidth,
        height: val,
      }));
    } else {
      setOptions((prev) => ({
        ...prev,
        height: val,
      }));
    }
  };

  const selectPreset = (w: number, h: number, isPresetRatio: boolean) => {
    if (isPresetRatio) {
      setIsLocked(true);
      setOptions((prev) => ({
        ...prev,
        width: w,
        height: h,
        // For percentage scales, the scale-width or contain modes represent the best output
        mode: prev.mode === 'stretch' ? 'contain' : prev.mode,
      }));
    } else {
      setIsLocked(false); // Unlock if preset has a different aspect ratio
      setOptions((prev) => ({
        ...prev,
        width: w,
        height: h,
      }));
    }
  };

  return (
    <div className="flex flex-col space-y-6 bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      {/* SECTION 1: Original Image Stats */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" /> Original Image
          </h3>
          <button
            id="reset-image-button"
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload Another
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-neutral-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans uppercase tracking-wider font-bold">Dimensions</p>
            <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
              {originalWidth} × {originalHeight} px
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-neutral-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans uppercase tracking-wider font-bold">Aspect Ratio</p>
            <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
              {originalRatio.toFixed(2)} ({originalRatio > 1.2 ? 'Landscape' : originalRatio < 0.8 ? 'Portrait' : 'Square'})
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-neutral-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans uppercase tracking-wider font-bold">File Size</p>
            <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
              {formatBytes(originalSize)}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-neutral-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden text-ellipsis whitespace-nowrap">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans uppercase tracking-wider font-bold">Format</p>
            <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
              {originalFormat.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Preset Sizes */}
      <div className="flex flex-col space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Preset Dimensions
        </h3>
        <div className="flex flex-col gap-2">
          {presets.map((preset, idx) => {
            const isActive = options.width === preset.width && options.height === preset.height;
            return (
              <button
                key={idx}
                id={`preset-${preset.width}x${preset.height}`}
                onClick={() => selectPreset(preset.width, preset.height, preset.isPresetRatio)}
                className={`w-full text-left px-4 py-3 rounded-lg border flex justify-between items-center transition-all cursor-pointer ${
                  isActive
                    ? 'border-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 hover:border-slate-300 bg-white dark:bg-neutral-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-semibold">{preset.label}</span>
                <span className={`text-xs font-mono ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}`}>
                  {preset.width} × {preset.height}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Custom Dimensions */}
      <div className="flex flex-col space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Custom Dimensions
        </h3>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-slate-50 dark:bg-neutral-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          {/* Width Input */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="resize-width-input" className="text-[10px] uppercase font-sans tracking-wider text-slate-500 font-bold">Width</label>
            <input
              id="resize-width-input"
              type="number"
              min="1"
              max="15000"
              value={options.width || ''}
              onChange={(e) => handleWidthChange(parseInt(e.target.value))}
              className="w-full bg-white dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Aspect Ratio Lock Toggle */}
          <div className="flex flex-col items-center justify-center pt-5">
            <button
              id="aspect-ratio-lock-toggle"
              type="button"
              onClick={() => {
                const nextState = !isLocked;
                setIsLocked(nextState);
                if (nextState) {
                  // Enforce aspect ratio lock instantly based on current width
                  const computedHeight = Math.round(options.width / originalRatio);
                  setOptions((prev) => ({
                    ...prev,
                    height: computedHeight,
                  }));
                }
              }}
              title={isLocked ? "Aspect Ratio Locked (Proportional Scaling)" : "Aspect Ratio Unlocked (Free Scaling)"}
              className={`p-2 rounded-md border transition-colors cursor-pointer ${
                isLocked
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400'
                  : 'bg-white border-dashed border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-neutral-900 dark:border-slate-800'
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>

          {/* Height Input */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="resize-height-input" className="text-[10px] uppercase font-sans tracking-wider text-slate-500 font-bold">Height</label>
            <input
              id="resize-height-input"
              type="number"
              min="1"
              max="15000"
              value={options.height || ''}
              onChange={(e) => handleHeightChange(parseInt(e.target.value))}
              className="w-full bg-white dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Resize Fitting Mode (Aspect Ratio Preservation) */}
      <div className="flex flex-col space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Aspect Ratio Fit Mode
        </h3>

        <div className="grid grid-cols-1 gap-2">
          {[
            {
              id: 'contain',
              title: 'Contain (Fit with Padding)',
              desc: 'Scales image to fit completely within target box. Preserves aspect ratio. Blank areas are filled with background.',
            },
            {
              id: 'cover',
              title: 'Cover (Crop to Fit)',
              desc: 'Scales image to completely fill target box, cropping any excess. Preserves aspect ratio.',
            },
            {
              id: 'stretch',
              title: 'Stretch (Ignore Ratio)',
              desc: 'Distorts image to match the exact target width and height.',
            },
            {
              id: 'scale-width',
              title: 'Proportional scale (By Width)',
              desc: 'Sets the target width, and scales height automatically to match original aspect ratio perfectly.',
            },
            {
              id: 'scale-height',
              title: 'Proportional scale (By Height)',
              desc: 'Sets the target height, and scales width automatically to match original aspect ratio perfectly.',
            },
          ].map((modeItem) => {
            const isSelected = options.mode === modeItem.id;
            return (
              <label
                key={modeItem.id}
                htmlFor={`fit-mode-${modeItem.id}`}
                className={`flex items-start p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-slate-50 dark:bg-white/5 border-indigo-600 dark:border-indigo-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-neutral-900 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id={`fit-mode-${modeItem.id}`}
                    name="aspect-ratio-handling-mode"
                    type="radio"
                    checked={isSelected}
                    onChange={() => {
                      setOptions((prev) => ({
                        ...prev,
                        mode: modeItem.id as AspectRatioMode,
                      }));
                      if (modeItem.id === 'scale-width') {
                        setIsLocked(true);
                        setOptions((prev) => ({
                          ...prev,
                          mode: 'scale-width',
                          height: Math.round(prev.width / originalRatio),
                        }));
                      } else if (modeItem.id === 'scale-height') {
                        setIsLocked(true);
                        setOptions((prev) => ({
                          ...prev,
                          mode: 'scale-height',
                          width: Math.round(prev.height * originalRatio),
                        }));
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:text-indigo-400 dark:focus:ring-indigo-400 accent-indigo-600 dark:accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {modeItem.title}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                    {modeItem.desc}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Background Color Selector for Contain Mode */}
        {options.mode === 'contain' && (
          <div className="mt-2 p-3 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Padding Background Fill Color:
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {[
                { name: 'Transparent', value: 'transparent' },
                { name: 'White', value: '#ffffff' },
                { name: 'Black', value: '#000000' },
                { name: 'Light Gray', value: '#f4f4f5' },
                { name: 'Dark Gray', value: '#27272a' },
              ].map((color) => (
                <button
                  key={color.value}
                  id={`bg-color-${color.name.toLowerCase().replace(' ', '-')}`}
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, backgroundColor: color.value }))}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg font-medium border transition-all cursor-pointer ${
                    options.backgroundColor === color.value
                      ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:border-neutral-700 dark:text-slate-300'
                  }`}
                >
                  {color.name}
                </button>
              ))}
              <div className="relative flex items-center">
                <input
                  id="custom-color-picker"
                  type="color"
                  value={options.backgroundColor.startsWith('#') ? options.backgroundColor : '#ffffff'}
                  onChange={(e) => setOptions((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-0 overflow-hidden"
                  title="Choose custom background color"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: Quality, Resampling Quality, Format & Filename */}
      <div className="flex flex-col space-y-4 border-t border-slate-200 dark:border-slate-800 pt-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Output Configuration
        </h3>

        {/* Output Format */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="output-format-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Format Selection</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'image/png', label: 'PNG', desc: 'Lossless' },
              { id: 'image/jpeg', label: 'JPEG', desc: 'Optimized Size' },
              { id: 'image/webp', label: 'WebP', desc: 'High Compression' },
            ].map((fmt) => {
              const isSelected = options.format === fmt.id;
              return (
                <button
                  key={fmt.id}
                  id={`format-btn-${fmt.id.split('/')[1]}`}
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, format: fmt.id as OutputFormat }))}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-500 dark:border-indigo-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 dark:bg-neutral-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm font-bold">{fmt.label}</span>
                  <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-indigo-100 dark:text-indigo-200' : 'text-slate-400'}`}>
                    {fmt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality Slider (for lossy formats) */}
        {(options.format === 'image/jpeg' || options.format === 'image/webp') && (
          <div className="flex flex-col space-y-1.5 bg-slate-50 dark:bg-neutral-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Quality Optimization</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold italic">
                {Math.round(options.quality * 100)}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden flex items-center relative">
              <input
                id="quality-slider-input"
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={options.quality}
                onChange={(e) => setOptions((prev) => ({ ...prev, quality: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Optimized</span>
              <span>Maximum Sharpness</span>
            </div>
          </div>
        )}

        {/* Quality Resample Method */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="resampling-method-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Interpolation Quality Filter
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'step-down', title: 'Bicubic Resampler', desc: 'No aliasing (Smooth)' },
              { id: 'standard', title: 'Linear Fast', desc: 'Default scaling' },
            ].map((method) => {
              const isSelected = options.resampleMethod === method.id;
              return (
                <button
                  key={method.id}
                  id={`resample-btn-${method.id}`}
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, resampleMethod: method.id as ResampleMethod }))}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-500 dark:border-indigo-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 dark:bg-neutral-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold">{method.title}</span>
                  <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {method.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Info Banner matching Professional Polish design */}
          <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-700 leading-normal">
            <svg className="w-4 h-4 shrink-0 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
            </svg>
            High-fidelity resampling avoids jagged borders and ensures maximum output sharpness.
          </div>
        </div>

        {/* Filename Customization */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="filename-custom-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-slate-400" /> Save File Name
          </label>
          <div className="relative">
            <input
              id="filename-custom-input"
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              className="w-full bg-white dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 pr-20 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">
              .{options.format.split('/')[1]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
