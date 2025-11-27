# QRCode Pro 🎨

A powerful and feature-rich QR code generator with **weird and incredible features**! Create stunning, customizable QR codes with gradients, logos, animations, custom shapes, and much more.

## Features ✨

### Basic Features

- ✅ Standard QR code generation
- ✅ Customizable colors (dark/light)
- ✅ Adjustable size and margins
- ✅ Error correction levels (L, M, Q, H)

### Weird & Incredible Features 🚀

- 🎨 **Gradient Support** - Linear and radial gradients
- 🖼️ **Logo Embedding** - Add your logo in the center
- 🎭 **Custom Dot Shapes** - Square, rounded, circle, diamond, star
- 🔲 **Custom Corner Styles** - Extra-rounded corners, dots, circles
- 🖼️ **Background Images** - Add background images with transparency
- 🎨 **Pattern Overlays** - Dots, lines, grid, waves
- 🖼️ **Frames** - Solid, dashed, or dotted borders
- ✨ **Animations** - Pulse, rotate, wave, glow effects
- 🔄 **Rounded Corners** - Modern rounded corner styling

## Installation

```bash
npm install qrcode-pro
```

> **Note:** This package requires a browser environment (uses `document.createElement` for canvas). For Node.js environments, consider using `node-canvas` or similar alternatives.

## Usage

### Basic Usage

```typescript
import { generateQRCode } from "qrcode-pro";

const qrCode = await generateQRCode({
  text: "https://example.com",
  width: 300,
});

// Use the generated QR code
const img = document.createElement("img");
img.src = qrCode.dataURL;
document.body.appendChild(img);
```

### With Gradient

```typescript
const qrCode = await generateQRCode({
  text: "https://example.com",
  width: 300,
  gradient: {
    type: "linear",
    rotation: 45,
    stops: [
      { offset: 0, color: "#FF6B6B" },
      { offset: 1, color: "#4ECDC4" },
    ],
  },
});
```

### With Logo

```typescript
const qrCode = await generateQRCode({
  text: "https://example.com",
  width: 300,
  logo: {
    src: "https://example.com/logo.png",
    width: 0.2, // 20% of QR code size
    margin: 0.1,
  },
});
```

### Custom Dot Shapes

```typescript
const qrCode = await generateQRCode({
  text: "https://example.com",
  width: 300,
  dotType: "circle", // or 'rounded', 'diamond', 'star'
  cornerSquareType: "extra-rounded",
  cornerDotType: "circle",
});
```

### With Background Image

```typescript
const qrCode = await generateQRCode({
  text: "https://example.com",
  width: 300,
  backgroundImage: "https://example.com/bg.jpg",
  backgroundAlpha: 0.3,
});
```

### With Pattern Overlay

```typescript
const qrCode = await generateQRCode({
  text: "https://example.com",
  width: 300,
  pattern: {
    enabled: true,
    type: "waves", // or 'dots', 'lines', 'grid'
    color: "#000000",
    opacity: 0.1,
  },
});
```

### With Frame

```typescript
const qrCode = await generateQRCode({
  text: "https://example.com",
  width: 300,
  frame: {
    enabled: true,
    width: 3,
    color: "#FF6B6B",
    style: "dashed", // or 'solid', 'dotted'
  },
});
```

### With Animation

```typescript
import { generateQRCode, applyAnimation } from "qrcode-pro";

const qrCode = await generateQRCode({
  text: "https://example.com",
  width: 300,
  animation: {
    enabled: true,
    type: "pulse", // or 'rotate', 'wave', 'glow'
    speed: 1000,
  },
});

if (qrCode.canvas) {
  const stopAnimation = applyAnimation(qrCode.canvas, "pulse", 1000);
  // Call stopAnimation() to stop the animation
}
```

### Rounded Corners

```typescript
const qrCode = await generateQRCode({
  text: "https://example.com",
  width: 300,
  roundedCorners: true,
  cornerRadius: 20,
});
```

## React Example

```tsx
import React, { useEffect, useState } from "react";
import { generateQRCode, QRCodeResult } from "qrcode-pro";

function QRCodeComponent() {
  const [qrCode, setQrCode] = useState<QRCodeResult | null>(null);

  useEffect(() => {
    generateQRCode({
      text: "https://example.com",
      width: 300,
      gradient: {
        type: "linear",
        rotation: 45,
        stops: [
          { offset: 0, color: "#FF6B6B" },
          { offset: 1, color: "#4ECDC4" },
        ],
      },
      logo: {
        src: "/logo.png",
        width: 0.2,
      },
      dotType: "circle",
    }).then(setQrCode);
  }, []);

  if (!qrCode) return <div>Loading...</div>;

  return <img src={qrCode.dataURL} alt="QR Code" />;
}
```

## API Reference

### `generateQRCode(options: QRCodeOptions): Promise<QRCodeResult>`

Generates a QR code with the specified options.

#### Options

| Option                 | Type                                                       | Default                                 | Description                       |
| ---------------------- | ---------------------------------------------------------- | --------------------------------------- | --------------------------------- |
| `text`                 | `string`                                                   | **required**                            | The text/URL to encode            |
| `width`                | `number`                                                   | `300`                                   | Width of the QR code in pixels    |
| `margin`               | `number`                                                   | `4`                                     | Margin around the QR code         |
| `errorCorrectionLevel` | `'L' \| 'M' \| 'Q' \| 'H'`                                 | `'M'`                                   | Error correction level            |
| `color`                | `{ dark?: string, light?: string }`                        | `{ dark: '#000000', light: '#FFFFFF' }` | Colors for dark and light modules |
| `gradient`             | `GradientConfig`                                           | -                                       | Gradient configuration            |
| `logo`                 | `LogoConfig`                                               | -                                       | Logo configuration                |
| `dotType`              | `'square' \| 'rounded' \| 'circle' \| 'diamond' \| 'star'` | `'square'`                              | Shape of QR code dots             |
| `cornerSquareType`     | `'square' \| 'extra-rounded' \| 'dot'`                     | `'square'`                              | Style of corner squares           |
| `cornerDotType`        | `'square' \| 'dot' \| 'circle'`                            | `'square'`                              | Style of corner dots              |
| `backgroundImage`      | `string`                                                   | -                                       | Background image URL or data URL  |
| `backgroundAlpha`      | `number`                                                   | `0.3`                                   | Background image opacity (0-1)    |
| `frame`                | `FrameConfig`                                              | -                                       | Frame configuration               |
| `pattern`              | `PatternConfig`                                            | -                                       | Pattern overlay configuration     |
| `roundedCorners`       | `boolean`                                                  | `false`                                 | Enable rounded corners            |
| `cornerRadius`         | `number`                                                   | `10`                                    | Corner radius in pixels           |

#### Return Value

```typescript
{
  dataURL: string; // Data URL of the QR code image
  svg: string; // SVG string representation
  canvas: HTMLCanvasElement | null; // Canvas element
}
```

### `applyAnimation(canvas: HTMLCanvasElement, type: AnimationType, speed?: number): () => void`

Applies an animation to a canvas element. Returns a function to stop the animation.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
