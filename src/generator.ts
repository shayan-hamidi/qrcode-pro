import QRCode from 'qrcode';
import { QRCodeOptions, QRCodeResult } from './types';
import {
  generateQRCodeMatrix,
  createCanvas,
  getGradient,
  drawDot,
  drawCornerSquare,
  drawCornerDot,
  loadImage,
} from './utils';

export async function generateQRCode(options: QRCodeOptions): Promise<QRCodeResult> {
  const {
    text,
    width = 300,
    margin = 4,
    errorCorrectionLevel = 'M',
    color = { dark: '#000000', light: '#FFFFFF' },
    gradient,
    logo,
    dotType = 'square',
    cornerSquareType = 'square',
    cornerDotType = 'square',
    backgroundImage,
    backgroundAlpha = 0.3,
    frame,
    pattern,
    roundedCorners = false,
    cornerRadius = 10,
  } = options;

  // Generate QR code matrix
  const matrix = await generateQRCodeMatrix(text, errorCorrectionLevel);
  const matrixSize = matrix.length;
  
  // Calculate cell size
  const cellSize = Math.floor((width - margin * 2) / matrixSize);
  const qrWidth = cellSize * matrixSize;
  const totalWidth = width;
  const totalHeight = width;
  
  // Create canvas
  const canvas = createCanvas(totalWidth, totalHeight);
  const ctx = canvas.getContext('2d')!;
  
  // Draw background
  if (backgroundImage) {
    try {
      const bgImg = await loadImage(backgroundImage);
      ctx.globalAlpha = backgroundAlpha;
      ctx.drawImage(bgImg, 0, 0, totalWidth, totalHeight);
      ctx.globalAlpha = 1;
    } catch (e) {
      console.warn('Failed to load background image:', e);
      ctx.fillStyle = color.light || '#FFFFFF';
      ctx.fillRect(0, 0, totalWidth, totalHeight);
    }
  } else {
    ctx.fillStyle = color.light || '#FFFFFF';
    ctx.fillRect(0, 0, totalWidth, totalHeight);
  }
  
  // Draw pattern overlay if enabled
  if (pattern?.enabled) {
    ctx.save();
    ctx.globalAlpha = pattern.opacity || 0.1;
    ctx.fillStyle = pattern.color || '#000000';
    
    switch (pattern.type) {
      case 'dots':
        for (let i = 0; i < totalWidth; i += 20) {
          for (let j = 0; j < totalHeight; j += 20) {
            ctx.beginPath();
            ctx.arc(i, j, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case 'lines':
        for (let i = 0; i < totalWidth; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, totalHeight);
          ctx.stroke();
        }
        break;
      case 'grid':
        for (let i = 0; i < totalWidth; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, totalHeight);
          ctx.stroke();
        }
        for (let j = 0; j < totalHeight; j += 30) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(totalWidth, j);
          ctx.stroke();
        }
        break;
      case 'waves':
        ctx.strokeStyle = pattern.color || '#000000';
        ctx.lineWidth = 2;
        for (let i = 0; i < totalHeight; i += 20) {
          ctx.beginPath();
          for (let x = 0; x < totalWidth; x++) {
            const y = i + Math.sin(x / 20) * 5;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        break;
    }
    
    ctx.restore();
  }
  
  // Calculate offset to center QR code
  const offsetX = (totalWidth - qrWidth) / 2;
  const offsetY = (totalHeight - qrWidth) / 2;
  
  // Set up color/gradient
  if (gradient) {
    ctx.fillStyle = getGradient(ctx, qrWidth, qrWidth, gradient);
  } else {
    ctx.fillStyle = color.dark || '#000000';
  }
  
  // Draw QR code
  const cornerSize = 7; // Size of corner squares in modules
  
      for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (matrix[row] && matrix[row][col]) {
        const x = offsetX + col * cellSize;
        const y = offsetY + row * cellSize;
        
        // Check if this is part of a corner square
        const isCornerSquare = 
          (row < cornerSize && col < cornerSize) ||
          (row < cornerSize && col >= matrixSize - cornerSize) ||
          (row >= matrixSize - cornerSize && col < cornerSize);
        
        // Check if this is the inner dot of a corner square
        const isCornerDot = 
          (row >= 2 && row < cornerSize - 2 && col >= 2 && col < cornerSize - 2) ||
          (row >= 2 && row < cornerSize - 2 && col >= matrixSize - cornerSize + 2 && col < matrixSize - 2) ||
          (row >= matrixSize - cornerSize + 2 && row < matrixSize - 2 && col >= 2 && col < cornerSize - 2);
        
        if (isCornerDot) {
          drawCornerDot(ctx, x + cellSize / 2, y + cellSize / 2, cellSize, cornerDotType);
        } else if (isCornerSquare) {
          drawCornerSquare(ctx, x + cellSize / 2, y + cellSize / 2, cellSize, cornerSquareType);
        } else {
          drawDot(ctx, x + cellSize / 2, y + cellSize / 2, cellSize, dotType);
        }
      }
    }
  }
  
  // Draw logo if provided
  if (logo?.src) {
    try {
      const logoImg = await loadImage(logo.src);
      const logoWidth = qrWidth * (logo.width || 0.2);
      const logoHeight = logo.height ? qrWidth * logo.height : logoWidth;
      const logoX = offsetX + (qrWidth - logoWidth) / 2;
      const logoY = offsetY + (qrWidth - logoHeight) / 2;
      
      // Draw white background for logo
      const logoMargin = (logo.margin || 0.1) * qrWidth;
      ctx.fillStyle = color.light || '#FFFFFF';
      ctx.fillRect(
        logoX - logoMargin,
        logoY - logoMargin,
        logoWidth + logoMargin * 2,
        logoHeight + logoMargin * 2
      );
      
      ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
    } catch (e) {
      console.warn('Failed to load logo:', e);
    }
  }
  
  // Draw frame if enabled
  if (frame?.enabled) {
    ctx.strokeStyle = frame.color || '#000000';
    ctx.lineWidth = frame.width || 2;
    
    if (frame.style === 'dashed') {
      ctx.setLineDash([10, 5]);
    } else if (frame.style === 'dotted') {
      ctx.setLineDash([2, 2]);
    }
    
    const frameMargin = 10;
    ctx.strokeRect(
      frameMargin,
      frameMargin,
      totalWidth - frameMargin * 2,
      totalHeight - frameMargin * 2
    );
    ctx.setLineDash([]);
  }
  
  // Apply rounded corners if enabled
  if (roundedCorners) {
    const tempCanvas = createCanvas(totalWidth, totalHeight);
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, totalWidth, totalHeight);
    
    tempCtx.beginPath();
    tempCtx.roundRect(0, 0, totalWidth, totalHeight, cornerRadius);
    tempCtx.clip();
    
    tempCtx.drawImage(canvas, 0, 0);
    
    const finalCanvas = createCanvas(totalWidth, totalHeight);
    const finalCtx = finalCanvas.getContext('2d')!;
    finalCtx.fillStyle = '#FFFFFF';
    finalCtx.fillRect(0, 0, totalWidth, totalHeight);
    finalCtx.beginPath();
    finalCtx.roundRect(0, 0, totalWidth, totalHeight, cornerRadius);
    finalCtx.clip();
    finalCtx.drawImage(tempCanvas, 0, 0);
    
    // Get data URL and SVG
    const dataURL = finalCanvas.toDataURL('image/png');
    const svg = await QRCode.toString(text, {
      type: 'svg',
      width: width,
      margin: margin,
      errorCorrectionLevel: errorCorrectionLevel,
      color: {
        dark: color.dark,
        light: color.light,
      },
    });
    
    return {
      dataURL,
      svg,
      canvas: finalCanvas,
    };
  }
  
  // Get data URL and SVG
  const dataURL = canvas.toDataURL('image/png');
  const svg = await QRCode.toString(text, {
    type: 'svg',
    width: width,
    margin: margin,
    errorCorrectionLevel: errorCorrectionLevel,
    color: {
      dark: color.dark,
      light: color.light,
    },
  });
  
  return {
    dataURL,
    svg,
    canvas,
  };
}

// Animation helper function
export function applyAnimation(
  canvas: HTMLCanvasElement,
  type: 'pulse' | 'rotate' | 'wave' | 'glow',
  speed: number = 1000
): () => void {
  const ctx = canvas.getContext('2d')!;
  let animationId: number;
  let startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = (elapsed % speed) / speed;
    
    switch (type) {
      case 'pulse':
        canvas.style.transform = `scale(${1 + Math.sin(progress * Math.PI * 2) * 0.1})`;
        canvas.style.transition = 'transform 0.1s';
        break;
      case 'rotate':
        canvas.style.transform = `rotate(${progress * 360}deg)`;
        break;
      case 'wave':
        canvas.style.transform = `translateY(${Math.sin(progress * Math.PI * 2) * 5}px)`;
        break;
      case 'glow':
        const glowIntensity = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
        canvas.style.filter = `drop-shadow(0 0 ${10 + glowIntensity * 20}px rgba(0, 0, 0, ${0.3 + glowIntensity * 0.3}))`;
        break;
    }
    
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
  
  return () => {
    cancelAnimationFrame(animationId);
    canvas.style.transform = '';
    canvas.style.filter = '';
  };
}

