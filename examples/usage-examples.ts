import {
  QRCode,
  toSVG,
  toPNG,
  toJPEG,
  toASCII,
  generateWithOptimizedLogo,
  OutputFormat,
  ErrorCorrectionLevel,
} from "../src/index";

/**
 * Basic usage examples for qrcode-pro
 */

async function basicUsageExamples() {
  console.log("=== Basic Usage Examples ===\n");

  // 1. Simple SVG generation
  console.log("1. Simple SVG generation:");
  const svgQR = await toSVG("Hello, QR Code!");
  console.log("SVG Length:", svgQR.length, "characters");

  // 2. PNG with custom options
  console.log("\n2. PNG with custom options:");
  const pngQR = await toPNG("https://github.com/yourrepo/qrcode-pro", {
    errorCorrectionLevel: ErrorCorrectionLevel.H,
    scale: 8,
    margin: { size: 2 },
    color: { dark: "#2563eb", light: "#f8fafc" },
  });
  console.log("PNG Buffer size:", pngQR.length, "bytes");

  // 3. ASCII output for terminal
  console.log("\n3. ASCII output:");
  const asciiQR = await toASCII("Terminal QR!", {
    text: { darkChar: "██", lightChar: "  " },
    margin: { size: 1 },
  });
  console.log(asciiQR.substring(0, 100) + "...");
}

async function advancedLogoExamples() {
  console.log("\n=== Advanced Logo Examples ===\n");

  const qr = new QRCode();

  // 1. QR code with logo
  console.log("1. QR code with logo:");
  try {
    const logoQR = await qr.generate(
      "https://mycompany.com",
      OutputFormat.PNG,
      {
        scale: 10,
        errorCorrectionLevel: ErrorCorrectionLevel.H,
        logo: {
          src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // 1x1 black pixel
          width: 15,
          height: 15,
          border: true,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      }
    );
    console.log("Logo QR generated, size:", logoQR.size);
  } catch (error) {
    console.log("Logo QR (mocked):", error);
  }

  // 2. Get logo recommendations
  console.log("\n2. Logo recommendations:");
  try {
    const recommendations = qr.getLogoRecommendations(
      "Sample data for analysis",
      {
        logo: {
          src: "logo.png",
          width: 25,
          height: 25,
        },
      }
    );
    console.log("Recommended size:", recommendations.recommendedSize);
    console.log("Warnings:", recommendations.warnings);
    console.log("Suggestions:", recommendations.suggestions);
  } catch (error) {
    console.log("Recommendations (mocked):", error);
  }

  // 3. Auto-optimized logo
  console.log("\n3. Auto-optimized logo:");
  try {
    const optimizedQR = await generateWithOptimizedLogo(
      "Auto-optimized QR with logo",
      OutputFormat.SVG,
      {
        logo: {
          src: "company-logo.png",
          width: 30, // Will be auto-adjusted if too large
          height: 30,
        },
      }
    );
    console.log(
      "Original logo size:",
      optimizedQR.logoOptimization?.originalLogo
    );
    console.log(
      "Optimized logo size:",
      optimizedQR.logoOptimization?.optimizedLogo
    );
  } catch (error) {
    console.log("Auto-optimized (mocked):", error);
  }
}

async function batchProcessingExamples() {
  console.log("\n=== Batch Processing Examples ===\n");

  const qr = new QRCode();

  // 1. Batch generate multiple QR codes
  console.log("1. Batch generation:");
  const urls = [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://example.com/page3",
  ];

  try {
    const batchResults = await qr.generateBatch(
      urls,
      OutputFormat.SVG,
      {
        errorCorrectionLevel: ErrorCorrectionLevel.M,
        color: { dark: "#1f2937", light: "#f9fafb" },
      },
      (completed, total, current) => {
        console.log(`Progress: ${completed}/${total} - Processing: ${current}`);
      }
    );
    console.log(`Generated ${batchResults.length} QR codes`);
  } catch (error) {
    console.log("Batch processing error:", error);
  }
}

async function formatComparisonExamples() {
  console.log("\n=== Format Comparison Examples ===\n");

  const testData = "Format comparison test data";

  // Generate same QR code in different formats
  const formats = [
    { format: OutputFormat.SVG, name: "SVG" },
    { format: OutputFormat.ASCII, name: "ASCII" },
    { format: OutputFormat.UTF8, name: "UTF8" },
    { format: OutputFormat.TERMINAL, name: "Terminal" },
  ];

  for (const { format, name } of formats) {
    try {
      const qr = new QRCode();
      const result = await qr.generate(testData, format, {
        scale: 4,
        margin: { size: 2 },
      });

      const size =
        typeof result.data === "string"
          ? result.data.length
          : result.data.length;
      console.log(
        `${name}: ${size} ${
          typeof result.data === "string" ? "characters" : "bytes"
        }`
      );

      if (format === OutputFormat.ASCII && typeof result.data === "string") {
        // Show a preview of ASCII output
        const lines = result.data.split("\n");
        console.log("Preview:", lines.slice(0, 3).join("\n"));
      }
    } catch (error) {
      console.log(`${name}: Error -`, error);
    }
  }
}

async function validationExamples() {
  console.log("\n=== Validation Examples ===\n");

  const qr = new QRCode();

  // 1. Validate input data
  console.log("1. Input validation:");
  const validations = [
    { data: "Valid data", options: {} },
    { data: "", options: {} }, // Invalid - empty
    {
      data: "A".repeat(5000),
      options: { errorCorrectionLevel: ErrorCorrectionLevel.L },
    }, // Too long
    { data: "Valid", options: { version: 50 } }, // Invalid version
    { data: "Valid", options: { maskPattern: 10 } }, // Invalid mask pattern
  ];

  validations.forEach(({ data, options }, index) => {
    try {
      const validation = qr.validate(data, options);
      console.log(
        `Test ${index + 1}:`,
        validation.valid ? "✓ Valid" : "✗ Invalid",
        validation.error || ""
      );
      if (validation.valid && validation.suggestedVersion) {
        console.log(`  Suggested version: ${validation.suggestedVersion}`);
      }
    } catch (error) {
      console.log(`Test ${index + 1}: Error -`, error);
    }
  });

  // 2. Capacity information
  console.log("\n2. Capacity information:");
  for (const level of [
    ErrorCorrectionLevel.L,
    ErrorCorrectionLevel.M,
    ErrorCorrectionLevel.H,
  ]) {
    const capacity = qr.getCapacityInfo(10, level);
    console.log(`Version 10, Level ${level}:`, capacity);
  }
}

async function customizationExamples() {
  console.log("\n=== Customization Examples ===\n");

  // 1. Custom colors and styling
  console.log("1. Custom colors and styling:");
  const customSVG = await toSVG("Styled QR Code", {
    color: { dark: "#7c3aed", light: "#faf5ff" },
    margin: { size: 3, color: "#f3f4f6" },
    scale: 6,
    svg: {
      xmlDeclaration: true,
      cssClass: "custom-qr-code",
    },
  });
  console.log(
    "Custom SVG includes class:",
    customSVG.includes("custom-qr-code")
  );

  // 2. Different error correction levels
  console.log("\n2. Error correction levels comparison:");
  const testData = "Error correction test";

  for (const level of Object.values(ErrorCorrectionLevel)) {
    try {
      const result = await toSVG(testData, {
        errorCorrectionLevel: level,
        scale: 4,
      });
      console.log(`Level ${level}: ${result.length} characters`);
    } catch (error) {
      console.log(`Level ${level}: Error`, error);
    }
  }

  // 3. Terminal output with custom characters
  console.log("\n3. Custom terminal characters:");
  const terminalQR = await toASCII("Terminal", {
    text: {
      darkChar: "▓▓",
      lightChar: "░░",
    },
    margin: { size: 1 },
  });
  console.log("Custom terminal output preview:");
  console.log(terminalQR.split("\n").slice(0, 5).join("\n"));
}

// Main execution function
async function runAllExamples() {
  try {
    await basicUsageExamples();
    await advancedLogoExamples();
    await batchProcessingExamples();
    await formatComparisonExamples();
    await validationExamples();
    await customizationExamples();

    console.log("\n=== All Examples Completed ===");
  } catch (error) {
    console.error("Example execution error:", error);
  }
}

// Export for testing
export {
  basicUsageExamples,
  advancedLogoExamples,
  batchProcessingExamples,
  formatComparisonExamples,
  validationExamples,
  customizationExamples,
  runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}
