import {
  ErrorCorrectionLevel,
  QRCodeOptions,
  ColorOptions,
  MarginOptions,
} from "../types";

/**
 * Default QR Code options
 */
export const DEFAULT_OPTIONS = {
  errorCorrectionLevel: ErrorCorrectionLevel.M,
  version: undefined,
  maskPattern: undefined,
  color: {
    dark: "#000000",
    light: "#FFFFFF",
  },
  margin: {
    size: 4,
    color: "#FFFFFF",
  },
  scale: 4,
  logo: undefined,
  svg: undefined,
  image: undefined,
  text: undefined,
} as const;

/**
 * Default color options
 */
export const DEFAULT_COLORS: Required<ColorOptions> = {
  dark: "#000000",
  light: "#FFFFFF",
};

/**
 * Default margin options
 */
export const DEFAULT_MARGIN: Required<MarginOptions> = {
  size: 4,
  color: "#FFFFFF",
};

/**
 * QR Code version specifications
 * Each version has different module counts and data capacities
 */
export const VERSION_SPECS = {
  1: { modules: 21, capacity: { L: 152, M: 128, Q: 104, H: 72 } },
  2: { modules: 25, capacity: { L: 272, M: 224, Q: 176, H: 128 } },
  3: { modules: 29, capacity: { L: 440, M: 352, Q: 272, H: 208 } },
  4: { modules: 33, capacity: { L: 640, M: 512, Q: 384, H: 288 } },
  5: { modules: 37, capacity: { L: 864, M: 688, Q: 496, H: 368 } },
  // Add more versions as needed...
  40: { modules: 177, capacity: { L: 23648, M: 18672, Q: 13328, H: 10208 } },
} as const;

/**
 * Character capacity limits for different QR code versions and error correction levels
 */
export const CAPACITY_TABLE = {
  numeric: {
    1: { L: 41, M: 34, Q: 27, H: 17 },
    2: { L: 77, M: 63, Q: 48, H: 34 },
    // ... more versions
    40: { L: 7089, M: 5596, Q: 3993, H: 3057 },
  },
  alphanumeric: {
    1: { L: 25, M: 20, Q: 16, H: 10 },
    2: { L: 47, M: 38, Q: 29, H: 20 },
    // ... more versions
    40: { L: 4296, M: 3391, Q: 2420, H: 1852 },
  },
  byte: {
    1: { L: 17, M: 14, Q: 11, H: 7 },
    2: { L: 32, M: 26, Q: 20, H: 14 },
    // ... more versions
    40: { L: 2953, M: 2331, Q: 1663, H: 1273 },
  },
} as const;

/**
 * ASCII characters for text output
 */
export const ASCII_CHARS = {
  DARK: "██",
  LIGHT: "  ",
  BORDER_HORIZONTAL: "━",
  BORDER_VERTICAL: "┃",
  BORDER_TOP_LEFT: "┏",
  BORDER_TOP_RIGHT: "┓",
  BORDER_BOTTOM_LEFT: "┗",
  BORDER_BOTTOM_RIGHT: "┛",
} as const;

/**
 * Terminal color codes for colored output
 */
export const TERMINAL_COLORS = {
  BLACK: "\x1b[40m",
  WHITE: "\x1b[47m",
  RESET: "\x1b[0m",
} as const;

/**
 * SVG template constants
 */
export const SVG_CONSTANTS = {
  DEFAULT_SIZE: 200,
  XML_DECLARATION: '<?xml version="1.0" encoding="UTF-8"?>',
  NAMESPACE: "http://www.w3.org/2000/svg",
} as const;

/**
 * Image format constants
 */
export const IMAGE_CONSTANTS = {
  DEFAULT_SIZE: 200,
  DEFAULT_QUALITY: 90,
  MAX_SIZE: 4000,
  MIN_SIZE: 50,
} as const;

/**
 * Logo constraints
 */
export const LOGO_CONSTRAINTS = {
  MAX_WIDTH_PERCENT: 30,
  MAX_HEIGHT_PERCENT: 30,
  MIN_WIDTH_PERCENT: 5,
  MIN_HEIGHT_PERCENT: 5,
  DEFAULT_WIDTH_PERCENT: 20,
  DEFAULT_HEIGHT_PERCENT: 20,
  DEFAULT_BORDER_WIDTH: 2,
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  MIN_VERSION: 1,
  MAX_VERSION: 40,
  MIN_MASK_PATTERN: 0,
  MAX_MASK_PATTERN: 7,
  MAX_DATA_LENGTH: 4296, // Maximum for alphanumeric at version 40, level L
  MIN_SCALE: 1,
  MAX_SCALE: 50,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_DATA: "Invalid input data",
  DATA_TOO_LONG: "Input data is too long for the specified configuration",
  INVALID_VERSION: "QR code version must be between 1 and 40",
  INVALID_ERROR_CORRECTION: "Invalid error correction level",
  INVALID_MASK_PATTERN: "Mask pattern must be between 0 and 7",
  INVALID_SCALE: "Scale must be between 1 and 50",
  INVALID_COLOR: "Invalid color format",
  INVALID_FORMAT: "Unsupported output format",
  LOGO_TOO_LARGE: "Logo size exceeds maximum allowed percentage",
  GENERATION_FAILED: "QR code generation failed",
} as const;
