import { QRCodeOptionsInternal } from "../index";
import { OutputFormat, LogoOptions } from "../types";
import { IMAGE_CONSTANTS, LOGO_CONSTRAINTS } from "../utils/constants";

/**
 * Canvas-like interface for image rendering
 * In a real implementation, this would use node-canvas or similar
 */
interface CanvasLike {
  width: number;
  height: number;
  getContext(contextId: "2d"): CanvasRenderingContext2DLike;
  toBuffer(
    type: "image/png" | "image/jpeg",
    options?: { quality?: number }
  ): Buffer;
}

interface CanvasRenderingContext2DLike {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, width: number, height: number): void;
  drawImage(
    image: any,
    x: number,
    y: number,
    width: number,
    height: number
  ): void;
  createImageData(width: number, height: number): ImageDataLike;
  putImageData(imageData: ImageDataLike, x: number, y: number): void;
  getImageData(
    x: number,
    y: number,
    width: number,
    height: number
  ): ImageDataLike;
}

interface ImageDataLike {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/**
 * Image renderer for PNG and JPEG formats
 */
export class ImageRenderer {
  /**
   * Render QR matrix as PNG buffer
   */
  static async renderPNG(
    matrix: boolean[][],
    options: QRCodeOptionsInternal
  ): Promise<Buffer> {
    const canvas = this.createCanvas(matrix, options);
    await this.drawQRCode(canvas, matrix, options);

    if (options.logo) {
      await this.addLogo(canvas, matrix, options.logo, options);
    }

    return canvas.toBuffer("image/png");
  }

  /**
   * Render QR matrix as JPEG buffer
   */
  static async renderJPEG(
    matrix: boolean[][],
    options: QRCodeOptionsInternal
  ): Promise<Buffer> {
    const canvas = this.createCanvas(matrix, options);
    await this.drawQRCode(canvas, matrix, options);

    if (options.logo) {
      await this.addLogo(canvas, matrix, options.logo, options);
    }

    const quality = options.image?.quality || IMAGE_CONSTANTS.DEFAULT_QUALITY;
    return canvas.toBuffer("image/jpeg", { quality: quality / 100 });
  }

  /**
   * Create canvas with proper dimensions
   */
  private static createCanvas(
    matrix: boolean[][],
    options: QRCodeOptionsInternal
  ): CanvasLike {
    const modules = matrix.length;
    const scale = options.scale;
    const margin = options.margin.size;

    const canvasSize = (modules + margin * 2) * scale;
    const width = options.image?.width || canvasSize;
    const height = options.image?.height || canvasSize;

    // In a real implementation, this would be:
    // const { createCanvas } = require('canvas');
    // return createCanvas(width, height);

    // Mock implementation for demonstration
    return this.createMockCanvas(width, height);
  }

  /**
   * Mock canvas implementation
   * In production, replace with actual canvas library
   */
  private static createMockCanvas(width: number, height: number): CanvasLike {
    return {
      width,
      height,
      getContext: (contextId: "2d") => this.createMockContext(width, height),
      toBuffer: (
        type: "image/png" | "image/jpeg",
        options?: { quality?: number }
      ) => {
        // Mock implementation - would return actual image buffer in production
        const mockBuffer = Buffer.alloc(1000);
        mockBuffer.write(`Mock ${type} image ${width}x${height}`, 0);
        return mockBuffer;
      },
    };
  }

  /**
   * Mock 2D context implementation
   */
  private static createMockContext(
    width: number,
    height: number
  ): CanvasRenderingContext2DLike {
    const imageData = new Uint8ClampedArray(width * height * 4);

    return {
      fillStyle: "#000000",
      fillRect: (x: number, y: number, w: number, h: number) => {
        // Mock implementation - would actually draw rectangle
        console.log(
          `Drawing rect at (${x}, ${y}) size ${w}x${h} with color ${this.fillStyle}`
        );
      },
      drawImage: (
        image: any,
        x: number,
        y: number,
        width: number,
        height: number
      ) => {
        console.log(`Drawing image at (${x}, ${y}) size ${width}x${height}`);
      },
      createImageData: (w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
      }),
      putImageData: (imageData: ImageDataLike, x: number, y: number) => {
        console.log(`Putting image data at (${x}, ${y})`);
      },
      getImageData: (x: number, y: number, w: number, h: number) => ({
        data: imageData.slice(0, w * h * 4),
        width: w,
        height: h,
      }),
    };
  }

  /**
   * Draw QR code on canvas
   */
  private static async drawQRCode(
    canvas: CanvasLike,
    matrix: boolean[][],
    options: QRCodeOptionsInternal
  ): Promise<void> {
    const ctx = canvas.getContext("2d");
    const modules = matrix.length;
    const scale = options.scale;
    const margin = options.margin.size;

    // Fill background
    ctx.fillStyle = options.color.light;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR modules
    ctx.fillStyle = options.color.dark;

    const scaleX = canvas.width / ((modules + margin * 2) * scale);
    const scaleY = canvas.height / ((modules + margin * 2) * scale);

    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if (matrix[y][x]) {
          const pixelX = (margin + x) * scale * scaleX;
          const pixelY = (margin + y) * scale * scaleY;
          const pixelWidth = scale * scaleX;
          const pixelHeight = scale * scaleY;

          ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
        }
      }
    }
  }

  /**
   * Add logo overlay to the QR code
   */
  private static async addLogo(
    canvas: CanvasLike,
    matrix: boolean[][],
    logoOptions: LogoOptions,
    options: QRCodeOptionsInternal
  ): Promise<void> {
    try {
      const logoImage = await this.loadLogoImage(logoOptions.src);
      const logoPosition = this.calculateLogoPosition(
        canvas,
        matrix,
        logoOptions,
        options
      );

      const ctx = canvas.getContext("2d");

      // Add border if requested
      if (logoOptions.border) {
        this.drawLogoBorder(ctx, logoPosition, logoOptions);
      }

      // Draw logo
      ctx.drawImage(
        logoImage,
        logoPosition.x,
        logoPosition.y,
        logoPosition.width,
        logoPosition.height
      );
    } catch (error) {
      console.warn("Failed to add logo:", error);
      // Continue without logo rather than failing completely
    }
  }

  /**
   * Load logo image from various sources
   */
  private static async loadLogoImage(src: string | Buffer): Promise<any> {
    // In a real implementation, this would handle:
    // - Loading from file paths
    // - Loading from URLs
    // - Processing base64 data
    // - Processing Buffer data

    if (Buffer.isBuffer(src)) {
      return this.createImageFromBuffer(src);
    }

    if (typeof src === "string") {
      if (src.startsWith("data:")) {
        return this.createImageFromBase64(src);
      }

      if (src.startsWith("http://") || src.startsWith("https://")) {
        return this.createImageFromUrl(src);
      }

      return this.createImageFromFile(src);
    }

    throw new Error("Unsupported logo source format");
  }

  /**
   * Create image from buffer
   */
  private static async createImageFromBuffer(buffer: Buffer): Promise<any> {
    // Mock implementation
    // In production: const { loadImage } = require('canvas'); return loadImage(buffer);
    return { width: 100, height: 100, buffer };
  }

  /**
   * Create image from base64 data
   */
  private static async createImageFromBase64(base64: string): Promise<any> {
    const buffer = Buffer.from(base64.split(",")[1], "base64");
    return this.createImageFromBuffer(buffer);
  }

  /**
   * Create image from URL
   */
  private static async createImageFromUrl(url: string): Promise<any> {
    // Mock implementation
    // In production: fetch the URL and create image
    return { width: 100, height: 100, url };
  }

  /**
   * Create image from file path
   */
  private static async createImageFromFile(filePath: string): Promise<any> {
    // Mock implementation
    // In production: const fs = require('fs'); const buffer = fs.readFileSync(filePath);
    return { width: 100, height: 100, filePath };
  }

  /**
   * Calculate optimal logo position and size
   */
  private static calculateLogoPosition(
    canvas: CanvasLike,
    matrix: boolean[][],
    logoOptions: LogoOptions,
    options: QRCodeOptionsInternal
  ): { x: number; y: number; width: number; height: number } {
    const modules = matrix.length;
    const scale = options.scale;
    const margin = options.margin.size;

    const qrSize = modules * scale;
    const totalSize = (modules + margin * 2) * scale;

    // Calculate logo size as percentage of QR code (not including margin)
    const logoWidthPercent =
      logoOptions.width || LOGO_CONSTRAINTS.DEFAULT_WIDTH_PERCENT;
    const logoHeightPercent =
      logoOptions.height || LOGO_CONSTRAINTS.DEFAULT_HEIGHT_PERCENT;

    const logoWidth = (qrSize * logoWidthPercent) / 100;
    const logoHeight = (qrSize * logoHeightPercent) / 100;

    // Scale to canvas dimensions
    const scaleX = canvas.width / totalSize;
    const scaleY = canvas.height / totalSize;

    const scaledLogoWidth = logoWidth * scaleX;
    const scaledLogoHeight = logoHeight * scaleY;

    // Center the logo
    const x = (canvas.width - scaledLogoWidth) / 2;
    const y = (canvas.height - scaledLogoHeight) / 2;

    return {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(scaledLogoWidth),
      height: Math.round(scaledLogoHeight),
    };
  }

  /**
   * Draw border around logo
   */
  private static drawLogoBorder(
    ctx: CanvasRenderingContext2DLike,
    position: { x: number; y: number; width: number; height: number },
    logoOptions: LogoOptions
  ): void {
    const borderWidth =
      logoOptions.borderWidth || LOGO_CONSTRAINTS.DEFAULT_BORDER_WIDTH;
    const borderColor = logoOptions.borderColor || "#FFFFFF";

    // Fill border area with border color
    ctx.fillStyle = borderColor;
    ctx.fillRect(
      position.x - borderWidth,
      position.y - borderWidth,
      position.width + borderWidth * 2,
      position.height + borderWidth * 2
    );
  }
}

/**
 * Production implementation guide:
 *
 * To implement actual image rendering, install canvas:
 * npm install canvas @types/canvas
 *
 * Then replace the mock implementations with:
 *
 * import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
 *
 * createCanvas() -> createCanvas(width, height)
 * loadImage() -> loadImage(src) for files/URLs/buffers
 *
 * For logo loading:
 * - File: loadImage(filePath)
 * - URL: loadImage(url)
 * - Buffer: loadImage(buffer)
 * - Base64: loadImage(Buffer.from(base64, 'base64'))
 */
