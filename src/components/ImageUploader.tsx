/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatBytes } from '../utils/imageResizer';

interface ImageUploaderProps {
  onImageLoaded: (data: {
    img: HTMLImageElement;
    name: string;
    size: number;
    width: number;
    height: number;
    format: string;
  }) => void;
}

export default function ImageUploader({ onImageLoaded }: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file) return;

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPEG, WebP, etc.).');
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        onImageLoaded({
          img,
          name: file.name,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: file.type,
        });
      };
      img.onerror = () => {
        setError('Failed to load image. The file might be corrupted.');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setError('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        id="drop-zone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors duration-200 min-h-[300px] ${
          isDragActive
            ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20'
            : 'border-slate-300 hover:border-indigo-500 bg-white hover:bg-slate-50/50 dark:border-slate-800 dark:bg-neutral-900 dark:hover:border-indigo-500 dark:hover:bg-neutral-900/50'
        }`}
      >
        <input
          id="file-upload-input"
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400">
            <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium text-slate-800 dark:text-neutral-200">
              Drag and drop your image here, or{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline underline-offset-4 decoration-indigo-400 hover:decoration-indigo-600">
                browse files
              </span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Supports JPEG, PNG, WebP, SVG, and GIF up to 50MB
            </p>
          </div>
        </div>

        <AnimatePresence>
          {isDragActive && (
            <motion.div
              id="drag-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-indigo-600/10 dark:bg-indigo-100/10 rounded-2xl backdrop-blur-[2px]"
            >
              <div className="bg-white dark:bg-neutral-900 px-6 py-4 rounded-xl shadow-lg border border-indigo-200 dark:border-indigo-800 flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span className="font-medium text-slate-800 dark:text-white">
                  Drop to upload image
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            id="upload-error-banner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex items-center space-x-2 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
