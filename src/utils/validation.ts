import {
  QRData,
  QRCodeOptions,
  ErrorCorrectionLevel,
  ValidationResult,
  QRVersion,
  MaskPattern,
} from "../types";
import {
  VALIDATION,
  ERROR_MESSAGES,
  LOGO_CONSTRAINTS,
  DEFAULT_OPTIONS,
} from "./constants";

/**
 * Validation utilities for QR code generation
 */
export class ValidationUtils {
  /**
   * Validate input data and options
   */
  static validateInput(
    data: QRData,
    options: QRCodeOptions = {}
  ): ValidationResult {
    try {
      // Validate data
      const dataValidation = this.validateData(data);
      if (!dataValidation.valid) {
        return dataValidation;
      }

      // Validate options
      const optionsValidation = this.validateOptions(options);
      if (!optionsValidation.valid) {
        return optionsValidation;
      }

      // Validate data length against capacity
      const normalizedData = this.normalizeData(data);
      const capacityValidation = this.validateCapacity(normalizedData, options);
      if (!capacityValidation.valid) {
        return capacityValidation;
      }

      return {
        valid: true,
        suggestedVersion: capacityValidation.suggestedVersion,
        maxCapacity: capacityValidation.maxCapacity,
        dataLength: normalizedData.length,
      };
    } catch (error) {
      return {
        valid: false,
        error:
          error instanceof Error ? error.message : "Unknown validation error",
      };
    }
  }

  /**
   * Validate input data
   */
  private static validateData(data: QRData): ValidationResult {
    if (data === null || data === undefined) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_DATA,
      };
    }

    if (typeof data === "string" && data.length === 0) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_DATA,
      };
    }

    if (typeof data === "number" && !isFinite(data)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_DATA,
      };
    }

    if (Buffer.isBuffer(data) && data.length === 0) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_DATA,
      };
    }

    return { valid: true };
  }

  /**
   * Validate QR code options
   */
  private static validateOptions(options: QRCodeOptions): ValidationResult {
    // Validate version
    if (options.version !== undefined) {
      const versionValidation = this.validateVersion(options.version);
      if (!versionValidation.valid) {
        return versionValidation;
      }
    }

    // Validate error correction level
    if (options.errorCorrectionLevel !== undefined) {
      const ecValidation = this.validateErrorCorrectionLevel(
        options.errorCorrectionLevel
      );
      if (!ecValidation.valid) {
        return ecValidation;
      }
    }

    // Validate mask pattern
    if (options.maskPattern !== undefined) {
      const maskValidation = this.validateMaskPattern(options.maskPattern);
      if (!maskValidation.valid) {
        return maskValidation;
      }
    }

    // Validate scale
    if (options.scale !== undefined) {
      const scaleValidation = this.validateScale(options.scale);
      if (!scaleValidation.valid) {
        return scaleValidation;
      }
    }

    // Validate colors
    if (options.color) {
      const colorValidation = this.validateColors(options.color);
      if (!colorValidation.valid) {
        return colorValidation;
      }
    }

    // Validate logo options
    if (options.logo) {
      const logoValidation = this.validateLogoOptions(options.logo);
      if (!logoValidation.valid) {
        return logoValidation;
      }
    }

    return { valid: true };
  }

  /**
   * Validate QR code version
   */
  private static validateVersion(version: QRVersion): ValidationResult {
    if (
      !Number.isInteger(version) ||
      version < VALIDATION.MIN_VERSION ||
      version > VALIDATION.MAX_VERSION
    ) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_VERSION,
      };
    }

    return { valid: true };
  }

  /**
   * Validate error correction level
   */
  private static validateErrorCorrectionLevel(
    level: ErrorCorrectionLevel
  ): ValidationResult {
    const validLevels = Object.values(ErrorCorrectionLevel);
    if (!validLevels.includes(level)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_ERROR_CORRECTION,
      };
    }

    return { valid: true };
  }

  /**
   * Validate mask pattern
   */
  private static validateMaskPattern(pattern: MaskPattern): ValidationResult {
    if (
      !Number.isInteger(pattern) ||
      pattern < VALIDATION.MIN_MASK_PATTERN ||
      pattern > VALIDATION.MAX_MASK_PATTERN
    ) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_MASK_PATTERN,
      };
    }

    return { valid: true };
  }

  /**
   * Validate scale factor
   */
  private static validateScale(scale: number): ValidationResult {
    if (
      !Number.isFinite(scale) ||
      scale < VALIDATION.MIN_SCALE ||
      scale > VALIDATION.MAX_SCALE
    ) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_SCALE,
      };
    }

    return { valid: true };
  }

  /**
   * Validate color options
   */
  private static validateColors(colors: {
    dark?: string;
    light?: string;
  }): ValidationResult {
    if (colors.dark && !this.isValidColor(colors.dark)) {
      return {
        valid: false,
        error: `${ERROR_MESSAGES.INVALID_COLOR}: dark color`,
      };
    }

    if (colors.light && !this.isValidColor(colors.light)) {
      return {
        valid: false,
        error: `${ERROR_MESSAGES.INVALID_COLOR}: light color`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate logo options
   */
  private static validateLogoOptions(logo: {
    src: string | Buffer;
    width?: number;
    height?: number;
  }): ValidationResult {
    if (!logo.src) {
      return {
        valid: false,
        error: "Logo source is required",
      };
    }

    if (logo.width !== undefined) {
      if (
        logo.width < LOGO_CONSTRAINTS.MIN_WIDTH_PERCENT ||
        logo.width > LOGO_CONSTRAINTS.MAX_WIDTH_PERCENT
      ) {
        return {
          valid: false,
          error: ERROR_MESSAGES.LOGO_TOO_LARGE,
        };
      }
    }

    if (logo.height !== undefined) {
      if (
        logo.height < LOGO_CONSTRAINTS.MIN_HEIGHT_PERCENT ||
        logo.height > LOGO_CONSTRAINTS.MAX_HEIGHT_PERCENT
      ) {
        return {
          valid: false,
          error: ERROR_MESSAGES.LOGO_TOO_LARGE,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validate data capacity against QR code limits
   */
  private static validateCapacity(
    data: string,
    options: QRCodeOptions
  ): ValidationResult & { suggestedVersion?: number; maxCapacity?: number } {
    const errorLevel =
      options.errorCorrectionLevel || DEFAULT_OPTIONS.errorCorrectionLevel;
    const dataLength = data.length;

    // Determine data mode
    const mode = this.detectDataMode(data);

    // If version is specified, check if data fits
    if (options.version) {
      const capacity = this.getCapacityForVersion(
        options.version,
        errorLevel,
        mode
      );
      if (dataLength > capacity) {
        return {
          valid: false,
          error: ERROR_MESSAGES.DATA_TOO_LONG,
          maxCapacity: capacity,
          dataLength,
        };
      }
      return {
        valid: true,
        maxCapacity: capacity,
        dataLength,
      };
    }

    // Find minimum version that can accommodate the data
    for (let version = 1; version <= 40; version++) {
      const capacity = this.getCapacityForVersion(version, errorLevel, mode);
      if (dataLength <= capacity) {
        return {
          valid: true,
          suggestedVersion: version,
          maxCapacity: capacity,
          dataLength,
        };
      }
    }

    return {
      valid: false,
      error: ERROR_MESSAGES.DATA_TOO_LONG,
      dataLength,
    };
  }

  /**
   * Normalize data to string for validation
   */
  private static normalizeData(data: QRData): string {
    if (typeof data === "string") {
      return data;
    }
    if (typeof data === "number") {
      return data.toString();
    }
    if (Buffer.isBuffer(data)) {
      return data.toString("utf8");
    }
    throw new Error("Unsupported data type");
  }

  /**
   * Detect data encoding mode
   */
  private static detectDataMode(
    data: string
  ): "numeric" | "alphanumeric" | "byte" {
    // Check if numeric (0-9 only)
    if (/^\d+$/.test(data)) {
      return "numeric";
    }

    // Check if alphanumeric (0-9, A-Z, space, $, %, *, +, -, ., /, :)
    if (/^[0-9A-Z $%*+\-./:]+$/.test(data)) {
      return "alphanumeric";
    }

    // Default to byte mode
    return "byte";
  }

  /**
   * Get data capacity for specific version, error level, and mode
   */
  private static getCapacityForVersion(
    version: number,
    errorLevel: ErrorCorrectionLevel,
    mode: "numeric" | "alphanumeric" | "byte"
  ): number {
    // Simplified capacity calculation
    // In a real implementation, this would use the official QR specification tables
    const baseCapacity = version === 1 ? 25 : version * 15;

    const modeMultiplier =
      mode === "numeric" ? 2.4 : mode === "alphanumeric" ? 1.8 : 1;

    const errorMultiplier =
      errorLevel === ErrorCorrectionLevel.L
        ? 1
        : errorLevel === ErrorCorrectionLevel.M
        ? 0.8
        : errorLevel === ErrorCorrectionLevel.Q
        ? 0.6
        : 0.4;

    return Math.floor(baseCapacity * modeMultiplier * errorMultiplier);
  }

  /**
   * Check if color is valid (hex, rgb, rgba, named color)
   */
  private static isValidColor(color: string): boolean {
    // Check hex colors (#RGB, #RRGGBB, #RRGGBBAA)
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color)) {
      return true;
    }

    // Check rgb/rgba colors
    if (
      /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color)
    ) {
      return true;
    }

    // Check named colors (basic validation)
    const namedColors = [
      "black",
      "white",
      "red",
      "green",
      "blue",
      "yellow",
      "cyan",
      "magenta",
      "transparent",
      "gray",
      "grey",
      "silver",
      "maroon",
      "navy",
      "olive",
      "lime",
      "aqua",
      "teal",
      "fuchsia",
      "purple",
    ];

    return namedColors.includes(color.toLowerCase());
  }

  /**
   * Sanitize and validate file path
   */
  static validateFilePath(filePath: string): ValidationResult {
    if (!filePath || typeof filePath !== "string") {
      return {
        valid: false,
        error: "Invalid file path",
      };
    }

    // Check for dangerous path patterns
    const dangerousPatterns = ["../", "..\\", "/etc/", "C:\\"];
    for (const pattern of dangerousPatterns) {
      if (filePath.includes(pattern)) {
        return {
          valid: false,
          error: "Potentially dangerous file path",
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validate batch processing options
   */
  static validateBatchOptions(
    dataArray: QRData[],
    options: QRCodeOptions = {}
  ): ValidationResult {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return {
        valid: false,
        error: "Data array cannot be empty",
      };
    }

    // Validate each data item
    for (let i = 0; i < dataArray.length; i++) {
      const validation = this.validateInput(dataArray[i], options);
      if (!validation.valid) {
        return {
          valid: false,
          error: `Item ${i + 1}: ${validation.error}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Get detailed capacity information
   */
  static getCapacityInfo(
    version: number,
    errorLevel: ErrorCorrectionLevel
  ): {
    numeric: number;
    alphanumeric: number;
    byte: number;
    modules: number;
  } {
    return {
      numeric: this.getCapacityForVersion(version, errorLevel, "numeric"),
      alphanumeric: this.getCapacityForVersion(
        version,
        errorLevel,
        "alphanumeric"
      ),
      byte: this.getCapacityForVersion(version, errorLevel, "byte"),
      modules: 17 + 4 * version,
    };
  }
}
