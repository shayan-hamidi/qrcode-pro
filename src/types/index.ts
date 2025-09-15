/**
 * QR Code error correction levels
 * L: Low (~7% error correction)
 * M: Medium (~15% error correction)
 * Q: Quartile (~25% error correction)
 * H: High (~30% error correction)
 */
export enum ErrorCorrectionLevel {
  L = "L",
  M = "M",
  Q = "Q",
  H = "H",
}

/**
 * QR Code output formats
 */
export enum OutputFormat {
  SVG = "svg",
  PNG = "png",
  JPEG = "jpeg",
  ASCII = "ascii",
  TERMINAL = "terminal",
  UTF8 = "utf8",
  CANVAS = "canvas",
}

/**
 * QR Code mask patterns (0-7)
 */
export type MaskPattern = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * QR Code version (size), ranges from 1 to 40
 * Version 1: 21x21 modules
 * Version 40: 177x177 modules
 */
export type QRVersion = number; // 1-40

/**
 * Color configuration for QR code
 */
export interface ColorOptions {
  /** Foreground color (dark modules) */
  dark?: string;
  /** Background color (light modules) */
  light?: string;
}

/**
 * Margin configuration
 */
export interface MarginOptions {
  /** Margin size in modules */
  size?: number;
  /** Margin color */
  color?: string;
}

/**
 * Logo/Image overlay options
 */
export interface LogoOptions {
  /** Logo image data (base64, URL, or buffer) */
  src: string | Buffer;
  /** Logo width as percentage of QR code (0-30) */
  width?: number;
  /** Logo height as percentage of QR code (0-30) */
  height?: number;
  /** Whether to add a border around the logo */
  border?: boolean;
  /** Logo border color */
  borderColor?: string;
  /** Logo border width */
  borderWidth?: number;
}

/**
 * SVG specific options
 */
export interface SVGOptions {
  /** SVG width */
  width?: number;
  /** SVG height */
  height?: number;
  /** Include XML declaration */
  xmlDeclaration?: boolean;
  /** Custom CSS classes */
  cssClass?: string;
}

/**
 * PNG/JPEG specific options
 */
export interface ImageOptions {
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** JPEG quality (0-100) */
  quality?: number;
}

/**
 * ASCII/Terminal output options
 */
export interface TextOptions {
  /** Character for dark modules */
  darkChar?: string;
  /** Character for light modules */
  lightChar?: string;
  /** Include border characters */
  border?: boolean;
}

/**
 * Main QR Code generation options
 */
export interface QRCodeOptions {
  /** Error correction level */
  errorCorrectionLevel?: ErrorCorrectionLevel;

  /** QR Code version (auto-detected if not specified) */
  version?: QRVersion;

  /** Mask pattern (auto-selected if not specified) */
  maskPattern?: MaskPattern;

  /** Color configuration */
  color?: ColorOptions;

  /** Margin configuration */
  margin?: MarginOptions;

  /** Module size in pixels (for raster formats) */
  scale?: number;

  /** Logo overlay options */
  logo?: LogoOptions;

  /** Format-specific options */
  svg?: SVGOptions;
  image?: ImageOptions;
  text?: TextOptions;
}

/**
 * QR Code generation result
 */
export interface QRCodeResult {
  /** Generated QR code data */
  data: string | Buffer;

  /** Output format used */
  format: OutputFormat;

  /** QR Code version used */
  version: number;

  /** Error correction level used */
  errorCorrectionLevel: ErrorCorrectionLevel;

  /** Mask pattern used */
  maskPattern: MaskPattern;

  /** Module count (width/height in modules) */
  modules: number;

  /** Size information */
  size: {
    width: number;
    height: number;
  };
}

/**
 * QR Code validation result
 */
export interface ValidationResult {
  /** Whether the input is valid */
  valid: boolean;

  /** Error message if invalid */
  error?: string;

  /** Suggested version if auto-detection is needed */
  suggestedVersion?: number;

  /** Maximum data capacity for the configuration */
  maxCapacity?: number;

  /** Input data length */
  dataLength?: number;
}

/**
 * Batch generation options
 */
export interface BatchOptions extends QRCodeOptions {
  /** Output directory for batch generation */
  outputDir?: string;

  /** File name template (supports placeholders like {index}, {data}) */
  fileNameTemplate?: string;
}

/**
 * Progress callback for batch operations
 */
export type ProgressCallback = (
  completed: number,
  total: number,
  current: string
) => void;

/**
 * QR Code data types
 */
export type QRData = string | number | Buffer;

/**
 * Supported encodings
 */
export enum Encoding {
  UTF8 = "utf8",
  ASCII = "ascii",
  LATIN1 = "latin1",
  BINARY = "binary",
}
