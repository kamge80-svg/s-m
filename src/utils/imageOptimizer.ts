import { logger } from './logger';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Image optimization utilities
 * Compress and resize images before upload
 */
export class ImageOptimizer {
  /**
   * Optimize image file
   * @param file - Original image file
   * @param options - Optimization options
   * @returns Optimized image blob
   */
  static async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85,
      format = 'jpeg',
    } = options;

    try {
      // Load image
      const img = await this.loadImage(file);
      
      // Calculate new dimensions
      const { width, height } = this.calculateDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // Use better image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      const blob = await this.canvasToBlob(canvas, format, quality);
      
      const originalSize = file.size;
      const optimizedSize = blob.size;
      const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
      
      logger.info('Image optimized', {
        originalSize: `${(originalSize / 1024).toFixed(1)} KB`,
        optimizedSize: `${(optimizedSize / 1024).toFixed(1)} KB`,
        reduction: `${reduction}%`,
        dimensions: `${width}x${height}`,
      });

      return blob;
    } catch (error) {
      logger.error('Image optimization failed:', error);
      // Return original file as fallback
      return file;
    }
  }

  /**
   * Load image from file
   */
  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate new dimensions maintaining aspect ratio
   */
  private static calculateDimensions(
    width: number,
    height: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let newWidth = width;
    let newHeight = height;

    // Scale down if needed
    if (width > maxWidth) {
      newWidth = maxWidth;
      newHeight = (height * maxWidth) / width;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = (width * maxHeight) / height;
    }

    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };
  }

  /**
   * Convert canvas to blob
   */
  private static canvasToBlob(
    canvas: HTMLCanvasElement,
    format: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        `image/${format}`,
        quality
      );
    });
  }

  /**
   * Check if browser supports WebP
   */
  static supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Get optimal format for browser
   */
  static getOptimalFormat(): 'webp' | 'jpeg' {
    return this.supportsWebP() ? 'webp' : 'jpeg';
  }

  /**
   * Validate image file
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Image too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      };
    }

    // Check file extension
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !validExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${validExtensions.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Generate thumbnail from image
   */
  static async generateThumbnail(
    file: File,
    size: number = 300
  ): Promise<Blob> {
    return this.optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.8,
      format: this.getOptimalFormat(),
    });
  }
}

// Export singleton methods
export const {
  optimizeImage,
  supportsWebP,
  getOptimalFormat,
  validateImage,
  generateThumbnail,
} = ImageOptimizer;
