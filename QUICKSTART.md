# Quick Start Guide

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the package**:
   ```bash
   npm run build
   ```

## Testing in Example Project

1. **Navigate to example directory**:
   ```bash
   cd example
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to the URL shown (usually `http://localhost:5173`)

## Using in Your Own Project

### Installation

```bash
npm install qrcode-pro
```

### Basic Example

```typescript
import { generateQRCode } from 'qrcode-pro';

async function createQR() {
  const qrCode = await generateQRCode({
    text: 'https://example.com',
    width: 300,
  });
  
  console.log(qrCode.dataURL); // Use this as image src
}
```

### React Example

```tsx
import { useEffect, useState } from 'react';
import { generateQRCode, QRCodeResult } from 'qrcode-pro';

function MyQRCode() {
  const [qrCode, setQrCode] = useState<QRCodeResult | null>(null);

  useEffect(() => {
    generateQRCode({
      text: 'https://example.com',
      width: 300,
      gradient: {
        type: 'linear',
        rotation: 45,
        stops: [
          { offset: 0, color: '#FF6B6B' },
          { offset: 1, color: '#4ECDC4' },
        ],
      },
    }).then(setQrCode);
  }, []);

  if (!qrCode) return <div>Loading...</div>;

  return <img src={qrCode.dataURL} alt="QR Code" />;
}
```

## Publishing

See [PUBLISHING.md](./PUBLISHING.md) for detailed publishing instructions.

