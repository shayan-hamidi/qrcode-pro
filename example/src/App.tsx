import { useEffect, useState, useRef } from "react";
import { generateQRCode, QRCodeResult } from "qrcode-pro";
import "./App.css";

function App() {
  const [qrCode, setQrCode] = useState<QRCodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const qrImageRef = useRef<HTMLImageElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const animationStopRef = useRef<(() => void) | null>(null);

  // Basic options
  const [text, setText] = useState("https://github.com");
  const [width, setWidth] = useState(400);
  const [margin, setMargin] = useState(4);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<"L" | "M" | "Q" | "H">("H");

  // Colors
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#FFFFFF");

  // Gradient
  const [gradientEnabled, setGradientEnabled] = useState(true);
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [gradientRotation, setGradientRotation] = useState(45);
  const [gradientStop1, setGradientStop1] = useState("#FF6B6B");
  const [gradientStop2, setGradientStop2] = useState("#4ECDC4");
  const [gradientStop3, setGradientStop3] = useState("#45B7D1");

  // Logo
  const [logoEnabled, setLogoEnabled] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoWidth, setLogoWidth] = useState(0.2);
  const [logoMargin, setLogoMargin] = useState(0.1);

  // Dot types
  const [dotType, setDotType] = useState<"square" | "rounded" | "circle" | "diamond" | "star">("circle");
  const [cornerSquareType, setCornerSquareType] = useState<"square" | "extra-rounded" | "dot">("extra-rounded");
  const [cornerDotType, setCornerDotType] = useState<"square" | "dot" | "circle">("circle");

  // Background
  const [backgroundEnabled, setBackgroundEnabled] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [backgroundAlpha, setBackgroundAlpha] = useState(0.3);

  // Pattern
  const [patternEnabled, setPatternEnabled] = useState(false);
  const [patternType, setPatternType] = useState<"dots" | "lines" | "grid" | "waves">("waves");
  const [patternColor, setPatternColor] = useState("#000000");
  const [patternOpacity, setPatternOpacity] = useState(0.1);

  // Frame
  const [frameEnabled, setFrameEnabled] = useState(true);
  const [frameWidth, setFrameWidth] = useState(3);
  const [frameColor, setFrameColor] = useState("#FF6B6B");
  const [frameStyle, setFrameStyle] = useState<"solid" | "dashed" | "dotted">("solid");

  // Rounded corners
  const [roundedCorners, setRoundedCorners] = useState(true);
  const [cornerRadius, setCornerRadius] = useState(15);

  // Animation
  const [animationEnabled, setAnimationEnabled] = useState(false);
  const [animationType, setAnimationType] = useState<"pulse" | "rotate" | "wave" | "glow">("pulse");
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  // Animation function for img element
  const applyImageAnimation = (
    img: HTMLImageElement,
    type: "pulse" | "rotate" | "wave" | "glow",
    speed: number
  ) => {
    // Stop previous animation
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % speed) / speed;

      switch (type) {
        case "pulse":
          const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1;
          img.style.transform = `scale(${scale})`;
          break;
        case "rotate":
          img.style.transform = `rotate(${progress * 360}deg)`;
          break;
        case "wave":
          img.style.transform = `translateY(${Math.sin(progress * Math.PI * 2) * 5}px)`;
          break;
        case "glow":
          const glowIntensity = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
          img.style.filter = `drop-shadow(0 0 ${10 + glowIntensity * 20}px rgba(78, 205, 196, ${0.3 + glowIntensity * 0.3}))`;
          break;
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      img.style.transform = "";
      img.style.filter = "";
    };
  };

  const generateQR = async () => {
    setLoading(true);

    // Stop previous animation
    if (animationStopRef.current) {
      animationStopRef.current();
      animationStopRef.current = null;
    }

    try {
      const result = await generateQRCode({
        text,
        width,
        margin,
        errorCorrectionLevel,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        gradient: gradientEnabled
          ? {
              type: gradientType,
              rotation: gradientRotation,
              stops: [
                { offset: 0, color: gradientStop1 },
                { offset: 0.5, color: gradientStop2 },
                { offset: 1, color: gradientStop3 },
              ],
            }
          : undefined,
        logo: logoEnabled && logoUrl
          ? {
              src: logoUrl,
              width: logoWidth,
              margin: logoMargin,
            }
          : undefined,
        dotType,
        cornerSquareType,
        cornerDotType,
        backgroundImage: backgroundEnabled && backgroundUrl ? backgroundUrl : undefined,
        backgroundAlpha: backgroundEnabled ? backgroundAlpha : undefined,
        pattern: patternEnabled
          ? {
              enabled: true,
              type: patternType,
              color: patternColor,
              opacity: patternOpacity,
            }
          : undefined,
        frame: frameEnabled
          ? {
              enabled: true,
              width: frameWidth,
              color: frameColor,
              style: frameStyle,
            }
          : undefined,
        roundedCorners,
        cornerRadius,
      });

      setQrCode(result);

      // Apply animation to img element after it loads
      if (animationEnabled && qrImageRef.current) {
        if (qrImageRef.current.complete) {
          animationStopRef.current = applyImageAnimation(
            qrImageRef.current,
            animationType,
            animationSpeed
          );
        } else {
          qrImageRef.current.onload = () => {
            animationStopRef.current = applyImageAnimation(
              qrImageRef.current!,
              animationType,
              animationSpeed
            );
          };
        }
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce function
  const useDebounce = (callback: () => void, delay: number, deps: any[]) => {
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback();
      }, delay);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
  };

  // Auto-generate on any change with debounce
  useDebounce(
    () => {
      generateQR();
    },
    300,
    [
      text,
      width,
      margin,
      errorCorrectionLevel,
      darkColor,
      lightColor,
      gradientEnabled,
      gradientType,
      gradientRotation,
      gradientStop1,
      gradientStop2,
      gradientStop3,
      logoEnabled,
      logoUrl,
      logoWidth,
      logoMargin,
      dotType,
      cornerSquareType,
      cornerDotType,
      backgroundEnabled,
      backgroundUrl,
      backgroundAlpha,
      patternEnabled,
      patternType,
      patternColor,
      patternOpacity,
      frameEnabled,
      frameWidth,
      frameColor,
      frameStyle,
      roundedCorners,
      cornerRadius,
      animationEnabled,
      animationType,
      animationSpeed,
    ]
  );

  // Re-apply animation when animation settings change
  useEffect(() => {
    if (animationEnabled && qrImageRef.current && qrCode) {
      if (animationStopRef.current) {
        animationStopRef.current();
      }
      if (qrImageRef.current.complete) {
        animationStopRef.current = applyImageAnimation(
          qrImageRef.current,
          animationType,
          animationSpeed
        );
      }
    } else if (!animationEnabled && animationStopRef.current) {
      animationStopRef.current();
      animationStopRef.current = null;
    }
  }, [animationEnabled, animationType, animationSpeed, qrCode]);

  return (
    <div className="app">
      <div className="app-header">
        <h1>🎨 QRCode Pro - Full Feature Demo</h1>
        <p>Create stunning QR codes with all the weird and incredible features!</p>
      </div>

      <div className="app-content">
        <div className="controls-container">
          <div className="controls-section">
            <h2>Basic Settings</h2>
            <div className="control-group">
              <label>
                Text/URL:
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text or URL"
                />
              </label>
            </div>
            <div className="control-row">
              <div className="control-group">
                <label>
                  Width: {width}px
                  <input
                    type="range"
                    min="200"
                    max="800"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="control-group">
                <label>
                  Margin: {margin}px
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                  />
                </label>
              </div>
            </div>
            <div className="control-group">
              <label>
                Error Correction Level:
                <select
                  value={errorCorrectionLevel}
                  onChange={(e) => setErrorCorrectionLevel(e.target.value as any)}
                >
                  <option value="L">L (Low ~7%)</option>
                  <option value="M">M (Medium ~15%)</option>
                  <option value="Q">Q (Quartile ~25%)</option>
                  <option value="H">H (High ~30%)</option>
                </select>
              </label>
            </div>
          </div>

          <div className="controls-section">
            <h2>Colors</h2>
            <div className="control-row">
              <div className="control-group">
                <label>
                  Dark Color:
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                  />
                  <input
                    type="text"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="color-text"
                  />
                </label>
              </div>
              <div className="control-group">
                <label>
                  Light Color:
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                  />
                  <input
                    type="text"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="color-text"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="controls-section">
            <h2>Gradient</h2>
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={gradientEnabled}
                  onChange={(e) => setGradientEnabled(e.target.checked)}
                />
                Enable Gradient
              </label>
            </div>
            {gradientEnabled && (
              <>
                <div className="control-group">
                  <label>
                    Gradient Type:
                    <select
                      value={gradientType}
                      onChange={(e) => setGradientType(e.target.value as any)}
                    >
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                    </select>
                  </label>
                </div>
                {gradientType === "linear" && (
                  <div className="control-group">
                    <label>
                      Rotation: {gradientRotation}°
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={gradientRotation}
                        onChange={(e) => setGradientRotation(Number(e.target.value))}
                      />
                    </label>
                  </div>
                )}
                <div className="control-row">
                  <div className="control-group">
                    <label>
                      Stop 1:
                      <input
                        type="color"
                        value={gradientStop1}
                        onChange={(e) => setGradientStop1(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="control-group">
                    <label>
                      Stop 2:
                      <input
                        type="color"
                        value={gradientStop2}
                        onChange={(e) => setGradientStop2(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="control-group">
                    <label>
                      Stop 3:
                      <input
                        type="color"
                        value={gradientStop3}
                        onChange={(e) => setGradientStop3(e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="controls-section">
            <h2>Logo</h2>
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={logoEnabled}
                  onChange={(e) => setLogoEnabled(e.target.checked)}
                />
                Enable Logo
              </label>
            </div>
            {logoEnabled && (
              <>
                <div className="control-group">
                  <label>
                    Logo URL:
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </label>
                </div>
                <div className="control-row">
                  <div className="control-group">
                    <label>
                      Width: {(logoWidth * 100).toFixed(0)}%
                      <input
                        type="range"
                        min="0.1"
                        max="0.5"
                        step="0.05"
                        value={logoWidth}
                        onChange={(e) => setLogoWidth(Number(e.target.value))}
                      />
                    </label>
                  </div>
                  <div className="control-group">
                    <label>
                      Margin: {(logoMargin * 100).toFixed(0)}%
                      <input
                        type="range"
                        min="0"
                        max="0.3"
                        step="0.05"
                        value={logoMargin}
                        onChange={(e) => setLogoMargin(Number(e.target.value))}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="controls-section">
            <h2>Dot Styles</h2>
            <div className="control-row">
              <div className="control-group">
                <label>
                  Dot Type:
                  <select value={dotType} onChange={(e) => setDotType(e.target.value as any)}>
                    <option value="square">Square</option>
                    <option value="rounded">Rounded</option>
                    <option value="circle">Circle</option>
                    <option value="diamond">Diamond</option>
                    <option value="star">Star</option>
                  </select>
                </label>
              </div>
              <div className="control-group">
                <label>
                  Corner Square:
                  <select
                    value={cornerSquareType}
                    onChange={(e) => setCornerSquareType(e.target.value as any)}
                  >
                    <option value="square">Square</option>
                    <option value="extra-rounded">Extra Rounded</option>
                    <option value="dot">Dot</option>
                  </select>
                </label>
              </div>
              <div className="control-group">
                <label>
                  Corner Dot:
                  <select
                    value={cornerDotType}
                    onChange={(e) => setCornerDotType(e.target.value as any)}
                  >
                    <option value="square">Square</option>
                    <option value="dot">Dot</option>
                    <option value="circle">Circle</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="controls-section">
            <h2>Background</h2>
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={backgroundEnabled}
                  onChange={(e) => setBackgroundEnabled(e.target.checked)}
                />
                Enable Background Image
              </label>
            </div>
            {backgroundEnabled && (
              <>
                <div className="control-group">
                  <label>
                    Background URL:
                    <input
                      type="text"
                      value={backgroundUrl}
                      onChange={(e) => setBackgroundUrl(e.target.value)}
                      placeholder="https://example.com/bg.jpg"
                    />
                  </label>
                </div>
                <div className="control-group">
                  <label>
                    Opacity: {(backgroundAlpha * 100).toFixed(0)}%
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={backgroundAlpha}
                      onChange={(e) => setBackgroundAlpha(Number(e.target.value))}
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="controls-section">
            <h2>Pattern Overlay</h2>
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={patternEnabled}
                  onChange={(e) => setPatternEnabled(e.target.checked)}
                />
                Enable Pattern
              </label>
            </div>
            {patternEnabled && (
              <>
                <div className="control-group">
                  <label>
                    Pattern Type:
                    <select
                      value={patternType}
                      onChange={(e) => setPatternType(e.target.value as any)}
                    >
                      <option value="dots">Dots</option>
                      <option value="lines">Lines</option>
                      <option value="grid">Grid</option>
                      <option value="waves">Waves</option>
                    </select>
                  </label>
                </div>
                <div className="control-row">
                  <div className="control-group">
                    <label>
                      Color:
                      <input
                        type="color"
                        value={patternColor}
                        onChange={(e) => setPatternColor(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="control-group">
                    <label>
                      Opacity: {(patternOpacity * 100).toFixed(0)}%
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={patternOpacity}
                        onChange={(e) => setPatternOpacity(Number(e.target.value))}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="controls-section">
            <h2>Frame</h2>
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={frameEnabled}
                  onChange={(e) => setFrameEnabled(e.target.checked)}
                />
                Enable Frame
              </label>
            </div>
            {frameEnabled && (
              <>
                <div className="control-row">
                  <div className="control-group">
                    <label>
                      Width: {frameWidth}px
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={frameWidth}
                        onChange={(e) => setFrameWidth(Number(e.target.value))}
                      />
                    </label>
                  </div>
                  <div className="control-group">
                    <label>
                      Style:
                      <select
                        value={frameStyle}
                        onChange={(e) => setFrameStyle(e.target.value as any)}
                      >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="control-group">
                  <label>
                    Color:
                    <input
                      type="color"
                      value={frameColor}
                      onChange={(e) => setFrameColor(e.target.value)}
                    />
                    <input
                      type="text"
                      value={frameColor}
                      onChange={(e) => setFrameColor(e.target.value)}
                      className="color-text"
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="controls-section">
            <h2>Rounded Corners</h2>
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={roundedCorners}
                  onChange={(e) => setRoundedCorners(e.target.checked)}
                />
                Enable Rounded Corners
              </label>
            </div>
            {roundedCorners && (
              <div className="control-group">
                <label>
                  Corner Radius: {cornerRadius}px
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={cornerRadius}
                    onChange={(e) => setCornerRadius(Number(e.target.value))}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="controls-section">
            <h2>Animation</h2>
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={animationEnabled}
                  onChange={(e) => setAnimationEnabled(e.target.checked)}
                />
                Enable Animation
              </label>
            </div>
            {animationEnabled && (
              <>
                <div className="control-group">
                  <label>
                    Animation Type:
                    <select
                      value={animationType}
                      onChange={(e) => setAnimationType(e.target.value as any)}
                    >
                      <option value="pulse">Pulse</option>
                      <option value="rotate">Rotate</option>
                      <option value="wave">Wave</option>
                      <option value="glow">Glow</option>
                    </select>
                  </label>
                </div>
                <div className="control-group">
                  <label>
                    Speed: {animationSpeed}ms
                    <input
                      type="range"
                      min="200"
                      max="3000"
                      step="100"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="qr-container">
          {loading && <div className="loading-overlay">Generating...</div>}
          {qrCode && (
            <>
              <img
                key={qrCode.dataURL}
                ref={qrImageRef}
                src={qrCode.dataURL}
                alt="QR Code"
                className={`qr-image ${loading ? "loading" : ""}`}
              />
              <div className="download-section">
                <a href={qrCode.dataURL} download="qrcode.png" className="download-btn">
                  Download PNG
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
