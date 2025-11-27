import QRCode from 'qrcode';

export async function generateQRCodeMatrix(
  text: string,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'
): Promise<boolean[][]> {
  // Use qrcode library to generate the matrix
  const qrCode = await QRCode.create(text, {
    errorCorrectionLevel,
  });
  
  const modules = qrCode.modules;
  const size = modules.size;
  const matrix: boolean[][] = [];
  
  for (let row = 0; row < size; row++) {
    matrix[row] = [];
    for (let col = 0; col < size; col++) {
      matrix[row][col] = modules.get(row, col);
    }
  }
  
  return matrix;
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function getGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gradient: { type: 'linear' | 'radial'; rotation?: number; stops: Array<{ offset: number; color: string }> }
): CanvasGradient {
  let grad: CanvasGradient;
  
  if (gradient.type === 'linear') {
    const rotation = (gradient.rotation || 0) * (Math.PI / 180);
    const centerX = width / 2;
    const centerY = height / 2;
    const length = Math.sqrt(width * width + height * height);
    const x1 = centerX - (length / 2) * Math.cos(rotation);
    const y1 = centerY - (length / 2) * Math.sin(rotation);
    const x2 = centerX + (length / 2) * Math.cos(rotation);
    const y2 = centerY + (length / 2) * Math.sin(rotation);
    
    grad = ctx.createLinearGradient(x1, y1, x2, y2);
  } else {
    grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
  }
  
  gradient.stops.forEach(stop => {
    grad.addColorStop(stop.offset, stop.color);
  });
  
  return grad;
}

export function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: 'square' | 'rounded' | 'circle' | 'diamond' | 'star'
): void {
  ctx.save();
  ctx.translate(x, y);
  
  switch (type) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'rounded':
      ctx.beginPath();
      const radius = size * 0.2;
      ctx.roundRect(-size / 2, -size / 2, size, size, radius);
      ctx.fill();
      break;
      
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, 0);
      ctx.lineTo(0, size / 2);
      ctx.lineTo(-size / 2, 0);
      ctx.closePath();
      ctx.fill();
      break;
      
    case 'star':
      ctx.beginPath();
      const spikes = 5;
      const outerRadius = size / 2;
      const innerRadius = outerRadius * 0.4;
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
      
    case 'square':
    default:
      ctx.fillRect(-size / 2, -size / 2, size, size);
      break;
  }
  
  ctx.restore();
}

export function drawCornerSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: 'square' | 'extra-rounded' | 'dot'
): void {
  ctx.save();
  ctx.translate(x, y);
  
  switch (type) {
    case 'extra-rounded':
      ctx.beginPath();
      const radius = size * 0.4;
      ctx.roundRect(-size / 2, -size / 2, size, size, radius);
      ctx.fill();
      break;
      
    case 'dot':
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'square':
    default:
      ctx.fillRect(-size / 2, -size / 2, size, size);
      break;
  }
  
  ctx.restore();
}

export function drawCornerDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: 'square' | 'dot' | 'circle'
): void {
  ctx.save();
  ctx.translate(x, y);
  
  switch (type) {
    case 'circle':
    case 'dot':
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'square':
    default:
      ctx.fillRect(-size / 2, -size / 2, size, size);
      break;
  }
  
  ctx.restore();
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

