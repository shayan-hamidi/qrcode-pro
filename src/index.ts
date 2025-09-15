import { QRGenerator } from "./core/qr-generator";
import { ImageRenderer } from "./core/image-renderer";
import { ValidationUtils } from "./utils/validation";
import { LogoProcessor } from "./utils/logo-processor";
import {
  QRData,
  QRCodeOptions,
  QRCodeResult,
  OutputFormat,
  ErrorCorrectionLevel,
  ValidationResult,
  BatchOptions,
  ProgressCallback,
  ColorOptions,
  MarginOptions,
  MaskPattern,
} from "./types";
import {
  DEFAULT_OPTIONS,
  DEFAULT_COLORS,
  DEFAULT_MARGIN,
} from "./utils/constants";

/**
 * Internal options interface with proper handling of undefined values
 */
export interface QRCodeOptionsInternal {
  errorCorrectionLevel: ErrorCorrectionLevel;
  version: number | undefined;
  maskPattern: MaskPattern | undefined;
  color: Required<ColorOptions>;
  margin: Required<MarginOptions>;
  scale: number;
  logo: QRCodeOptions["logo"];
  svg: QRCodeOptions["svg"];
  image: QRCodeOptions["image"];
  text: QRCodeOptions["text"];
}

/**
 * Main QRCode class - the primary interface for the qrcode-pro package
 */
export class QRCode {
  private generator: QRGenerator;

  constructor() {
    this.generator = new QRGenerator();
  }

  /**
   * Generate QR code with specified format
   */
  async generate(
    data: QRData,
    format: OutputFormat = OutputFormat.SVG,
    options: QRCodeOptions = {}
  ): Promise<QRCodeResult> {
    // Validate input
    const validation = ValidationUtils.validateInput(data, options);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Merge with default options
    const finalOptions = this.mergeOptions(options);

    // Generate QR matrix
    const matrix = this.generator.generate(
      data,
      finalOptions.errorCorrectionLevel,
      validation.suggestedVersion || finalOptions.version,
      finalOptions.maskPattern
    );

    // Render to specified format
    const renderedData = await this.renderMatrix(matrix, format, finalOptions);

    return {
      data: renderedData,
      format,
      version: this.generator.getVersion(),
      errorCorrectionLevel: this.generator.getErrorCorrectionLevel(),
      maskPattern: this.generator.getMaskPattern(),
      modules: this.generator.getModules(),
      size: {
        width: this.calculateOutputSize(finalOptions, format),
        height: this.calculateOutputSize(finalOptions, format),
      },
    };
  }

  /**
   * Generate QR code as SVG string
   */
  async toSVG(data: QRData, options: QRCodeOptions = {}): Promise<string> {
    const result = await this.generate(data, OutputFormat.SVG, options);
    return result.data as string;
  }

  /**
   * Generate QR code as PNG buffer
   */
  async toPNG(data: QRData, options: QRCodeOptions = {}): Promise<Buffer> {
    const result = await this.generate(data, OutputFormat.PNG, options);
    return result.data as Buffer;
  }

  /**
   * Generate QR code as JPEG buffer
   */
  async toJPEG(data: QRData, options: QRCodeOptions = {}): Promise<Buffer> {
    const result = await this.generate(data, OutputFormat.JPEG, options);
    return result.data as Buffer;
  }

  /**
   * Generate QR code as ASCII string
   */
  async toASCII(data: QRData, options: QRCodeOptions = {}): Promise<string> {
    const result = await this.generate(data, OutputFormat.ASCII, options);
    return result.data as string;
  }

  /**
   * Generate QR code for terminal output with colors
   */
  async toTerminal(data: QRData, options: QRCodeOptions = {}): Promise<string> {
    const result = await this.generate(data, OutputFormat.TERMINAL, options);
    return result.data as string;
  }

  /**
   * Generate QR code as UTF8 string (using block characters)
   */
  async toUTF8(data: QRData, options: QRCodeOptions = {}): Promise<string> {
    const result = await this.generate(data, OutputFormat.UTF8, options);
    return result.data as string;
  }

  /**
   * Validate input data and options without generating
   */
  validate(data: QRData, options: QRCodeOptions = {}): ValidationResult {
    return ValidationUtils.validateInput(data, options);
  }

  /**
   * Get capacity information for a specific version and error correction level
   */
  getCapacityInfo(
    version: number,
    errorLevel: ErrorCorrectionLevel = ErrorCorrectionLevel.M
  ) {
    return ValidationUtils.getCapacityInfo(version, errorLevel);
  }

  /**
   * Batch generate multiple QR codes
   */
  async generateBatch(
    dataArray: QRData[],
    format: OutputFormat,
    options: BatchOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<QRCodeResult[]> {
    // Validate batch input
    const validation = ValidationUtils.validateBatchOptions(dataArray, options);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const results: QRCodeResult[] = [];
    const total = dataArray.length;

    for (let i = 0; i < dataArray.length; i++) {
      const data = dataArray[i];
      const currentData = typeof data === "string" ? data : data.toString();

      // Report progress
      if (progressCallback) {
        progressCallback(i, total, currentData);
      }

      try {
        const result = await this.generate(data, format, options);
        results.push(result);
      } catch (error) {
        throw new Error(
          `Failed to generate QR code for item ${i + 1}: ${error}`
        );
      }
    }

    // Final progress update
    if (progressCallback) {
      progressCallback(total, total, "Complete");
    }

    return results;
  }

  /**
   * Merge user options with defaults
   */
  private mergeOptions(options: QRCodeOptions): QRCodeOptionsInternal {
    return {
      errorCorrectionLevel:
        options.errorCorrectionLevel || DEFAULT_OPTIONS.errorCorrectionLevel,
      version: options.version || undefined,
      maskPattern: options.maskPattern || undefined,
      color: {
        dark: options.color?.dark || DEFAULT_OPTIONS.color.dark,
        light: options.color?.light || DEFAULT_OPTIONS.color.light,
      },
      margin: {
        size: options.margin?.size ?? DEFAULT_OPTIONS.margin.size,
        color: options.margin?.color || DEFAULT_OPTIONS.margin.color,
      },
      scale: options.scale || DEFAULT_OPTIONS.scale,
      logo: options.logo || undefined,
      svg: options.svg || undefined,
      image: options.image || undefined,
      text: options.text || undefined,
    };
  }

  /**
   * Render QR matrix to specified format
   */
  private async renderMatrix(
    matrix: boolean[][],
    format: OutputFormat,
    options: QRCodeOptionsInternal
  ): Promise<string | Buffer> {
    switch (format) {
      case OutputFormat.SVG:
        return this.renderSVG(matrix, options);
      case OutputFormat.ASCII:
        return this.renderASCII(matrix, options);
      case OutputFormat.UTF8:
        return this.renderUTF8(matrix, options);
      case OutputFormat.TERMINAL:
        return this.renderTerminal(matrix, options);
      case OutputFormat.PNG:
        return await ImageRenderer.renderPNG(matrix, options);
      case OutputFormat.JPEG:
        return await ImageRenderer.renderJPEG(matrix, options);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Render matrix as SVG
   */
  private renderSVG(
    matrix: boolean[][],
    options: QRCodeOptionsInternal
  ): string {
    const modules = matrix.length;
    const scale = options.scale;
    const margin = options.margin.size;
    const size = (modules + margin * 2) * scale;

    const svgWidth = options.svg?.width || size;
    const svgHeight = options.svg?.height || size;

    let svg = "";

    if (options.svg?.xmlDeclaration !== false) {
      svg += '<?xml version="1.0" encoding="UTF-8"?>\n';
    }

    svg += `<svg width="${svgWidth}" height="${svgHeight}" `;
    svg += `viewBox="0 0 ${size} ${size}" `;
    svg += `xmlns="http://www.w3.org/2000/svg"`;

    if (options.svg?.cssClass) {
      svg += ` class="${options.svg.cssClass}"`;
    }

    svg += ">\n";

    // Background
    svg += `  <rect width="100%" height="100%" fill="${options.color.light}"/>\n`;

    // QR modules
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if (matrix[y][x]) {
          const rectX = (margin + x) * scale;
          const rectY = (margin + y) * scale;
          svg += `  <rect x="${rectX}" y="${rectY}" width="${scale}" height="${scale}" fill="${options.color.dark}"/>\n`;
        }
      }
    }

    svg += "</svg>";

    return svg;
  }

  /**
   * Render matrix as ASCII
   */
  private renderASCII(
    matrix: boolean[][],
    options: QRCodeOptionsInternal
  ): string {
    const darkChar = options.text?.darkChar || "██";
    const lightChar = options.text?.lightChar || "  ";
    const margin = options.margin.size;

    let result = "";

    // Top margin
    const lineWidth = matrix.length + margin * 2;
    for (let i = 0; i < margin; i++) {
      result += lightChar.repeat(lineWidth) + "\n";
    }

    // QR code with side margins
    for (let y = 0; y < matrix.length; y++) {
      result += lightChar.repeat(margin);
      for (let x = 0; x < matrix[y].length; x++) {
        result += matrix[y][x] ? darkChar : lightChar;
      }
      result += lightChar.repeat(margin) + "\n";
    }

    // Bottom margin
    for (let i = 0; i < margin; i++) {
      result += lightChar.repeat(lineWidth) + "\n";
    }

    return result;
  }

  /**
   * Render matrix as UTF8 block characters
   */
  private renderUTF8(
    matrix: boolean[][],
    options: QRCodeOptionsInternal
  ): string {
    const margin = options.margin.size;
    const modules = matrix.length + margin * 2;

    // Create extended matrix with margins
    const extendedMatrix: boolean[][] = [];

    for (let y = 0; y < modules; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < modules; x++) {
        const isMargin =
          y < margin ||
          y >= modules - margin ||
          x < margin ||
          x >= modules - margin;

        if (isMargin) {
          row.push(false); // Light/background
        } else {
          row.push(matrix[y - margin][x - margin]);
        }
      }
      extendedMatrix.push(row);
    }

    let result = "";

    // Use Unicode block characters for better resolution
    for (let y = 0; y < extendedMatrix.length; y += 2) {
      for (let x = 0; x < extendedMatrix[0].length; x++) {
        const top = extendedMatrix[y][x];
        const bottom =
          y + 1 < extendedMatrix.length ? extendedMatrix[y + 1][x] : false;

        if (top && bottom) {
          result += "█"; // Full block
        } else if (top) {
          result += "▀"; // Upper half block
        } else if (bottom) {
          result += "▄"; // Lower half block
        } else {
          result += " "; // Empty
        }
      }
      result += "\n";
    }

    return result;
  }

  /**
   * Render matrix for terminal with colors
   */
  private renderTerminal(
    matrix: boolean[][],
    options: QRCodeOptionsInternal
  ): string {
    const RESET = "\x1b[0m";
    const BLACK_BG = "\x1b[40m";
    const WHITE_BG = "\x1b[47m";

    return this.renderUTF8(matrix, options)
      .split("\n")
      .map((line) => {
        return line
          .split("")
          .map((char) => {
            if (char === "█" || char === "▀" || char === "▄") {
              return BLACK_BG + char + RESET;
            } else {
              return WHITE_BG + char + RESET;
            }
          })
          .join("");
      })
      .join("\n");
  }

  /**
   * Get logo recommendations for optimal placement
   */
  getLogoRecommendations(data: QRData, options: QRCodeOptions = {}) {
    // Generate matrix to analyze
    const validation = ValidationUtils.validateInput(data, options);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const finalOptions = this.mergeOptions(options);
    const matrix = this.generator.generate(
      data,
      finalOptions.errorCorrectionLevel,
      validation.suggestedVersion || finalOptions.version,
      finalOptions.maskPattern
    );

    return LogoProcessor.getLogoRecommendations(matrix, finalOptions.logo);
  }

  /**
   * Generate QR code with automatic logo optimization
   */
  async generateWithOptimizedLogo(
    data: QRData,
    format: OutputFormat,
    options: QRCodeOptions = {}
  ): Promise<QRCodeResult & { logoOptimization?: any }> {
    if (!options.logo) {
      return this.generate(data, format, options);
    }

    // Get logo recommendations
    const recommendations = this.getLogoRecommendations(data, options);

    // Auto-optimize logo if needed
    const optimizedLogo = LogoProcessor.validateAndOptimize(options.logo);

    // Apply optimizations if warnings exist
    if (recommendations.warnings.length > 0) {
      optimizedLogo.width = recommendations.recommendedSize.width;
      optimizedLogo.height = recommendations.recommendedSize.height;

      if (!optimizedLogo.border) {
        optimizedLogo.border = true;
        optimizedLogo.borderColor = optimizedLogo.borderColor || "#FFFFFF";
      }
    }

    const optimizedOptions = {
      ...options,
      logo: optimizedLogo,
    };

    const result = await this.generate(data, format, optimizedOptions);

    return {
      ...result,
      logoOptimization: {
        originalLogo: options.logo,
        optimizedLogo,
        recommendations,
      },
    };
  }
  private calculateOutputSize(
    options: QRCodeOptionsInternal,
    format: OutputFormat
  ): number {
    const modules = this.generator.getModules();
    const margin = options.margin.size;
    const scale = options.scale;

    const totalModules = modules + margin * 2;

    switch (format) {
      case OutputFormat.SVG:
        return options.svg?.width || totalModules * scale;
      case OutputFormat.PNG:
      case OutputFormat.JPEG:
        return options.image?.width || totalModules * scale;
      default:
        return totalModules * scale;
    }
  }
}

// Export convenience functions
export const qrcode = new QRCode();

export const generateQR = qrcode.generate.bind(qrcode);
export const toSVG = qrcode.toSVG.bind(qrcode);
export const toPNG = qrcode.toPNG.bind(qrcode);
export const toJPEG = qrcode.toJPEG.bind(qrcode);
export const toASCII = qrcode.toASCII.bind(qrcode);
export const toTerminal = qrcode.toTerminal.bind(qrcode);
export const toUTF8 = qrcode.toUTF8.bind(qrcode);
export const validate = qrcode.validate.bind(qrcode);

// Export types and enums
export * from "./types";
export { QRCode as default };
