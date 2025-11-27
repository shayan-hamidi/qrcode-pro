export type QRCodeErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface GradientStop {
  offset: number; // 0-1
  color: string;
}

export interface QRCodeOptions {
  // Basic options
  text: string;
  width?: number;
  margin?: number;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  color?: {
    dark?: string;
    light?: string;
  };

  // Weird and incredible features
  gradient?: {
    type: "linear" | "radial";
    rotation?: number; // degrees for linear
    stops: GradientStop[];
  };

  logo?: {
    src: string; // image URL or data URL
    width?: number; // percentage of QR code size (0-1)
    height?: number;
    margin?: number;
  };

  dotType?: "square" | "rounded" | "circle" | "diamond" | "star";
  cornerSquareType?: "square" | "extra-rounded" | "dot";
  cornerDotType?: "square" | "dot" | "circle";

  backgroundImage?: string; // image URL or data URL
  backgroundAlpha?: number; // 0-1

  frame?: {
    enabled: boolean;
    width?: number;
    color?: string;
    style?: "solid" | "dashed" | "dotted";
  };

  pattern?: {
    enabled: boolean;
    type: "dots" | "lines" | "grid" | "waves";
    color?: string;
    opacity?: number;
  };

  animation?: {
    enabled: boolean;
    type: "pulse" | "rotate" | "wave" | "glow";
    speed?: number; // milliseconds
  };

  // Advanced styling
  roundedCorners?: boolean;
  cornerRadius?: number;

  // Hidden message feature
  hiddenMessage?: string;
}

export interface QRCodeResult {
  dataURL: string;
  svg: string;
  canvas: HTMLCanvasElement | null;
}
