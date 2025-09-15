import { LogoOptions } from "../types";
import { LOGO_CONSTRAINTS, ERROR_MESSAGES } from "./constants";
import { ValidationUtils } from "./validation";

/**
 * Logo processing and optimization utilities
 */
export class LogoProcessor {
  /**
   * Validate and optimize logo options
   */
  static validateAndOptimize(logoOptions: LogoOptions): LogoOptions {
    // Validate basic logo options
    const validation = ValidationUtils.validateInput({}, { logo: logoOptions });
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Optimize dimensions
    const optimizedOptions: LogoOptions = {
      ...logoOptions,
      width: this.optimizeSize(
        logoOptions.width,
        LOGO_CONSTRAINTS.DEFAULT_WIDTH_PERCENT
      ),
      height: this.optimizeSize(
        logoOptions.height,
        LOGO_CONSTRAINTS.DEFAULT_HEIGHT_PERCENT
      ),
      border: logoOptions.border ?? true,
      borderColor: logoOptions.borderColor || "#FFFFFF",
      borderWidth:
        logoOptions.borderWidth || LOGO_CONSTRAINTS.DEFAULT_BORDER_WIDTH,
    };

    return optimizedOptions;
  }

  /**
   * Optimize logo size to ensure QR code readability
   */
  private static optimizeSize(
    size: number | undefined,
    defaultSize: number
  ): number {
    if (size === undefined) {
      return defaultSize;
    }

    // Ensure size is within safe bounds
    const minSize = LOGO_CONSTRAINTS.MIN_WIDTH_PERCENT;
    const maxSize = LOGO_CONSTRAINTS.MAX_WIDTH_PERCENT;

    if (size < minSize) {
      console.warn(
        `Logo size ${size}% is too small, using minimum ${minSize}%`
      );
      return minSize;
    }

    if (size > maxSize) {
      console.warn(
        `Logo size ${size}% is too large, using maximum ${maxSize}%`
      );
      return maxSize;
    }

    return size;
  }

  /**
   * Calculate the impact area of the logo on QR code modules
   */
  static calculateLogoImpact(
    matrix: boolean[][],
    logoOptions: LogoOptions,
    scale: number,
    margin: number
  ): {
    affectedModules: Array<{ x: number; y: number }>;
    impactPercentage: number;
    readabilityScore: number;
  } {
    const modules = matrix.length;
    const qrSize = modules * scale;

    // Calculate logo dimensions in modules
    const logoWidthPercent =
      logoOptions.width || LOGO_CONSTRAINTS.DEFAULT_WIDTH_PERCENT;
    const logoHeightPercent =
      logoOptions.height || LOGO_CONSTRAINTS.DEFAULT_HEIGHT_PERCENT;

    const logoWidthModules = Math.ceil((modules * logoWidthPercent) / 100);
    const logoHeightModules = Math.ceil((modules * logoHeightPercent) / 100);

    // Calculate center position in module coordinates
    const centerX = Math.floor(modules / 2);
    const centerY = Math.floor(modules / 2);

    const startX = Math.max(0, centerX - Math.floor(logoWidthModules / 2));
    const startY = Math.max(0, centerY - Math.floor(logoHeightModules / 2));
    const endX = Math.min(modules - 1, startX + logoWidthModules - 1);
    const endY = Math.min(modules - 1, startY + logoHeightModules - 1);

    // Find affected modules
    const affectedModules: Array<{ x: number; y: number }> = [];
    let totalModules = 0;
    let affectedDataModules = 0;

    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        totalModules++;

        if (x >= startX && x <= endX && y >= startY && y <= endY) {
          affectedModules.push({ x, y });

          // Check if this is a data module (not a function pattern)
          if (this.isDataModule(x, y, modules)) {
            affectedDataModules++;
          }
        }
      }
    }

    const impactPercentage = (affectedModules.length / totalModules) * 100;
    const readabilityScore = this.calculateReadabilityScore(
      affectedDataModules,
      affectedModules.length,
      logoOptions
    );

    return {
      affectedModules,
      impactPercentage,
      readabilityScore,
    };
  }

  /**
   * Check if a module position contains data (not function patterns)
   */
  private static isDataModule(x: number, y: number, modules: number): boolean {
    // Finder patterns (position detection patterns)
    if (this.isInFinderPattern(x, y, modules)) {
      return false;
    }

    // Timing patterns
    if (x === 6 || y === 6) {
      return false;
    }

    // Dark module (for versions 2 and above)
    if (x === 8 && y === 4 * Math.floor((modules - 17) / 4) + 9) {
      return false;
    }

    // Format information areas
    if (this.isFormatInfoArea(x, y, modules)) {
      return false;
    }

    // Version information areas (version 7+)
    const version = Math.floor((modules - 17) / 4) + 1;
    if (version >= 7 && this.isVersionInfoArea(x, y, modules)) {
      return false;
    }

    // Alignment patterns (version 2+)
    if (version >= 2 && this.isInAlignmentPattern(x, y, modules)) {
      return false;
    }

    return true;
  }

  /**
   * Check if position is within a finder pattern
   */
  private static isInFinderPattern(
    x: number,
    y: number,
    modules: number
  ): boolean {
    // Top-left (including separator)
    if (x <= 8 && y <= 8) return true;

    // Top-right (including separator)
    if (x >= modules - 9 && y <= 8) return true;

    // Bottom-left (including separator)
    if (x <= 8 && y >= modules - 9) return true;

    return false;
  }

  /**
   * Check if position is in format information area
   */
  private static isFormatInfoArea(
    x: number,
    y: number,
    modules: number
  ): boolean {
    // Around top-left finder pattern
    if ((x <= 8 && y === 8) || (x === 8 && y <= 8)) return true;

    // Around top-right and bottom-left finder patterns
    if (x >= modules - 8 && y === 8) return true;
    if (x === 8 && y >= modules - 7) return true;

    return false;
  }

  /**
   * Check if position is in version information area
   */
  private static isVersionInfoArea(
    x: number,
    y: number,
    modules: number
  ): boolean {
    // Bottom-left version info (3x6 area)
    if (x <= 5 && y >= modules - 11 && y <= modules - 9) return true;

    // Top-right version info (6x3 area)
    if (x >= modules - 11 && x <= modules - 9 && y <= 5) return true;

    return false;
  }

  /**
   * Check if position is within an alignment pattern
   */
  private static isInAlignmentPattern(
    x: number,
    y: number,
    modules: number
  ): boolean {
    const version = Math.floor((modules - 17) / 4) + 1;

    if (version < 2) return false;

    // Simplified alignment pattern detection
    // In a full implementation, this would use the official alignment pattern position table
    const alignmentPositions = this.getAlignmentPatternPositions(version);

    for (const pos of alignmentPositions) {
      if (Math.abs(x - pos.x) <= 2 && Math.abs(y - pos.y) <= 2) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get alignment pattern positions for a given version
   */
  private static getAlignmentPatternPositions(
    version: number
  ): Array<{ x: number; y: number }> {
    // Simplified alignment pattern positions
    // In a real implementation, use the full QR specification table
    const positions: Array<{ x: number; y: number }> = [];

    if (version === 2) {
      positions.push({ x: 16, y: 16 });
    } else if (version >= 3) {
      const modules = 17 + 4 * version;
      const step = Math.floor((modules - 13) / 2);
      positions.push({ x: step, y: step });
    }

    return positions;
  }

  /**
   * Calculate readability score based on logo impact
   */
  private static calculateReadabilityScore(
    affectedDataModules: number,
    totalAffectedModules: number,
    logoOptions: LogoOptions
  ): number {
    let score = 100;

    // Penalize based on affected data modules
    const dataModulePenalty = (affectedDataModules / totalAffectedModules) * 30;
    score -= dataModulePenalty;

    // Penalize large logos
    const logoSize =
      (logoOptions.width || LOGO_CONSTRAINTS.DEFAULT_WIDTH_PERCENT) / 100;
    const sizePenalty = Math.max(0, (logoSize - 0.2) * 50);
    score -= sizePenalty;

    // Bonus for border (improves contrast)
    if (logoOptions.border) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get logo recommendations based on QR code content
   */
  static getLogoRecommendations(
    matrix: boolean[][],
    currentOptions?: LogoOptions
  ): {
    recommendedSize: { width: number; height: number };
    safeZones: Array<{ x: number; y: number; width: number; height: number }>;
    warnings: string[];
    suggestions: string[];
  } {
    const modules = matrix.length;
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Analyze current logo if provided
    if (currentOptions) {
      const impact = this.calculateLogoImpact(matrix, currentOptions, 1, 0);

      if (impact.readabilityScore < 70) {
        warnings.push("Current logo size may affect QR code readability");
      }

      if (impact.impactPercentage > 25) {
        warnings.push("Logo covers more than 25% of the QR code");
        suggestions.push(
          "Consider reducing logo size to improve scanning reliability"
        );
      }

      if (!currentOptions.border) {
        suggestions.push(
          "Adding a border around the logo can improve contrast and readability"
        );
      }
    }

    // Calculate recommended size based on QR code complexity
    const dataModules = this.countDataModules(matrix);
    const complexity = dataModules / (modules * modules);

    let recommendedWidth = LOGO_CONSTRAINTS.DEFAULT_WIDTH_PERCENT;
    let recommendedHeight = LOGO_CONSTRAINTS.DEFAULT_HEIGHT_PERCENT;

    if (complexity > 0.7) {
      // High complexity - reduce logo size
      recommendedWidth = Math.max(
        LOGO_CONSTRAINTS.MIN_WIDTH_PERCENT,
        LOGO_CONSTRAINTS.DEFAULT_WIDTH_PERCENT - 5
      );
      recommendedHeight = Math.max(
        LOGO_CONSTRAINTS.MIN_HEIGHT_PERCENT,
        LOGO_CONSTRAINTS.DEFAULT_HEIGHT_PERCENT - 5
      );
      suggestions.push(
        "QR code has high data density - consider using a smaller logo"
      );
    }

    // Find safe zones (center areas with fewer function patterns)
    const safeZones = this.findSafeZones(matrix);

    return {
      recommendedSize: {
        width: recommendedWidth,
        height: recommendedHeight,
      },
      safeZones,
      warnings,
      suggestions,
    };
  }

  /**
   * Count data modules in the matrix
   */
  private static countDataModules(matrix: boolean[][]): number {
    const modules = matrix.length;
    let dataModules = 0;

    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if (this.isDataModule(x, y, modules)) {
          dataModules++;
        }
      }
    }

    return dataModules;
  }

  /**
   * Find safe zones for logo placement
   */
  private static findSafeZones(
    matrix: boolean[][]
  ): Array<{ x: number; y: number; width: number; height: number }> {
    const modules = matrix.length;
    const safeZones: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
    }> = [];

    // Center zone (most common logo placement)
    const centerSize = Math.floor(modules * 0.25);
    const centerStart = Math.floor((modules - centerSize) / 2);

    safeZones.push({
      x: centerStart,
      y: centerStart,
      width: centerSize,
      height: centerSize,
    });

    return safeZones;
  }
}
