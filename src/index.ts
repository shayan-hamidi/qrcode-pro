export { generateQRCode, applyAnimation } from './generator';
export type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeErrorCorrectionLevel,
  GradientStop,
} from './types';

// Re-export for convenience
export { default as QRCode } from 'qrcode';

