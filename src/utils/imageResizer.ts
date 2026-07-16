/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AspectRatioMode = 'contain' | 'cover' | 'stretch' | 'scale-width' | 'scale-height';
export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';
export type ResampleMethod = 'step-down' | 'standard';

export interface ResizeOptions {
  width: number;
  height: number;
  mode: AspectRatioMode;
  format: OutputFormat;
  quality: number; // 0.1 to 1.0
  resampleMethod: ResampleMethod;
  backgroundColor: string; // hex or 'transparent'
}

/**
 * Formats a size in bytes to a human-readable string (e.g. 1.24 MB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Calculates resized dimensions and draws the image onto a canvas with high-quality step-down interpolation
 */
export function performResize(
  img: HTMLImageElement,
  options: ResizeOptions
): { canvas: HTMLCanvasElement; renderedWidth: number; renderedHeight: number } {
  const { width: targetWidth, height: targetHeight, mode, resampleMethod, backgroundColor } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Could not get 2D canvas context');
  }

  const origWidth = img.naturalWidth;
  const origHeight = img.naturalHeight;
  const originalRatio = origWidth / origHeight;

  let renderWidth = targetWidth;
  let renderHeight = targetHeight;
  let offsetX = 0;
  let offsetY = 0;
  let canvasWidth = targetWidth;
  let canvasHeight = targetHeight;

  // Compute dimensions based on aspect ratio mode
  if (mode === 'contain') {
    const targetRatio = targetWidth / targetHeight;
    if (originalRatio > targetRatio) {
      renderWidth = targetWidth;
      renderHeight = targetWidth / originalRatio;
      offsetY = (targetHeight - renderHeight) / 2;
    } else {
      renderHeight = targetHeight;
      renderWidth = targetHeight * originalRatio;
      offsetX = (targetWidth - renderWidth) / 2;
    }
  } else if (mode === 'cover') {
    const targetRatio = targetWidth / targetHeight;
    if (originalRatio > targetRatio) {
      renderHeight = targetHeight;
      renderWidth = targetHeight * originalRatio;
      offsetX = (targetWidth - renderWidth) / 2;
    } else {
      renderWidth = targetWidth;
      renderHeight = targetWidth / originalRatio;
      offsetY = (targetHeight - renderHeight) / 2;
    }
  } else if (mode === 'stretch') {
    renderWidth = targetWidth;
    renderHeight = targetHeight;
  } else if (mode === 'scale-width') {
    renderWidth = targetWidth;
    renderHeight = targetWidth / originalRatio;
    canvasWidth = renderWidth;
    canvasHeight = renderHeight;
  } else if (mode === 'scale-height') {
    renderHeight = targetHeight;
    renderWidth = targetHeight * originalRatio;
    canvasWidth = renderWidth;
    canvasHeight = renderHeight;
  }

  // Set the canvas width & height (rounded to avoid subpixel canvas rendering issues)
  canvas.width = Math.round(canvasWidth);
  canvas.height = Math.round(canvasHeight);

  // Fill canvas background if contain/cover modes have background color and are not transparent
  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (options.format === 'image/jpeg') {
    // JPEGs don't support transparency, default to white instead of black
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const roundedRenderWidth = Math.round(renderWidth);
  const roundedRenderHeight = Math.round(renderHeight);
  const roundedOffsetX = Math.round(offsetX);
  const roundedOffsetY = Math.round(offsetY);

  if (resampleMethod === 'standard' || (origWidth <= roundedRenderWidth && origHeight <= roundedRenderHeight)) {
    // For standard scaling or upscaling, use the browser's built-in high quality interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      0,
      0,
      origWidth,
      origHeight,
      roundedOffsetX,
      roundedOffsetY,
      roundedRenderWidth,
      roundedRenderHeight
    );
  } else {
    // High-quality step-down scaling to prevent aliasing
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = origWidth;
    tempCanvas.height = origHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      // Fallback
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        img,
        roundedOffsetX,
        roundedOffsetY,
        roundedRenderWidth,
        roundedRenderHeight
      );
      return { canvas, renderedWidth: roundedRenderWidth, renderedHeight: roundedRenderHeight };
    }

    tempCtx.drawImage(img, 0, 0);

    let currentWidth = origWidth;
    let currentHeight = origHeight;

    // Iteratively scale down by 50% until we are just above the target size
    while (currentWidth > 2 * roundedRenderWidth && currentHeight > 2 * roundedRenderHeight) {
      const nextWidth = Math.round(currentWidth / 2);
      const nextHeight = Math.round(currentHeight / 2);

      const nextCanvas = document.createElement('canvas');
      nextCanvas.width = nextWidth;
      nextCanvas.height = nextHeight;
      const nextCtx = nextCanvas.getContext('2d');
      if (!nextCtx) break;

      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(
        tempCanvas,
        0,
        0,
        currentWidth,
        currentHeight,
        0,
        0,
        nextWidth,
        nextHeight
      );

      tempCanvas = nextCanvas;
      currentWidth = nextWidth;
      currentHeight = nextHeight;
    }

    // Draw the final step-down onto the target canvas
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      tempCanvas,
      0,
      0,
      currentWidth,
      currentHeight,
      roundedOffsetX,
      roundedOffsetY,
      roundedRenderWidth,
      roundedRenderHeight
    );
  }

  return {
    canvas,
    renderedWidth: roundedRenderWidth,
    renderedHeight: roundedRenderHeight,
  };
}

/**
 * Calculates the output file size for a given canvas and compression settings
 */
export async function calculateOutputSize(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality: number
): Promise<number> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob ? blob.size : 0);
      },
      format,
      quality
    );
  });
}

/**
 * Downloads a canvas as an image file
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  format: OutputFormat,
  quality: number
) {
  const extension = format.split('/')[1];
  const finalFilename = filename.endsWith(`.${extension}`)
    ? filename
    : `${filename.replace(/\.[^/.]+$/, '')}_resized.${extension}`;

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    format,
    quality
  );
}
