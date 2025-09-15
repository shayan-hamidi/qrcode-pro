import {
  ErrorCorrectionLevel,
  QRVersion,
  MaskPattern,
  QRData,
  Encoding,
} from "../types";
import { CAPACITY_TABLE, VERSION_SPECS, VALIDATION } from "../utils/constants";

/**
 * QR Code matrix representation
 */
export type QRMatrix = boolean[][];

/**
 * Data modes for QR codes
 */
export enum DataMode {
  NUMERIC = 1,
  ALPHANUMERIC = 2,
  BYTE = 4,
  KANJI = 8,
}

/**
 * Core QR Code generator class
 */
export class QRGenerator {
  private matrix: QRMatrix = [];
  private version: number = 1;
  private errorCorrectionLevel: ErrorCorrectionLevel = ErrorCorrectionLevel.M;
  private maskPattern: MaskPattern = 0;
  private modules: number = 21;

  /**
   * Generate QR code matrix from input data
   */
  public generate(
    data: QRData,
    errorCorrectionLevel: ErrorCorrectionLevel = ErrorCorrectionLevel.M,
    version?: QRVersion,
    maskPattern?: MaskPattern
  ): QRMatrix {
    this.errorCorrectionLevel = errorCorrectionLevel;

    // Convert data to string if needed
    const inputData = this.normalizeData(data);

    // Determine optimal version if not specified
    this.version =
      version || this.determineVersion(inputData, errorCorrectionLevel);
    this.modules = this.getModuleCount(this.version);

    // Validate input
    this.validateInput(inputData);

    // Initialize matrix
    this.initializeMatrix();

    // Add finder patterns (position detection patterns)
    this.addFinderPatterns();

    // Add separators
    this.addSeparators();

    // Add alignment patterns
    this.addAlignmentPatterns();

    // Add timing patterns
    this.addTimingPatterns();

    // Add dark module
    this.addDarkModule();

    // Reserve format information area
    this.reserveFormatInfo();

    // Reserve version information area (for version 7 and above)
    if (this.version >= 7) {
      this.reserveVersionInfo();
    }

    // Encode data
    const encodedData = this.encodeData(inputData);

    // Add error correction
    const finalData = this.addErrorCorrection(encodedData);

    // Place data modules
    this.placeDataModules(finalData);

    // Apply mask pattern
    this.maskPattern =
      maskPattern !== undefined ? maskPattern : this.selectBestMaskPattern();
    this.applyMask(this.maskPattern);

    // Add format information
    this.addFormatInfo();

    // Add version information (for version 7 and above)
    if (this.version >= 7) {
      this.addVersionInfo();
    }

    return this.matrix;
  }

  /**
   * Get the module count for a given version
   */
  private getModuleCount(version: number): number {
    return 17 + 4 * version;
  }

  /**
   * Normalize input data to string
   */
  private normalizeData(data: QRData): string {
    if (typeof data === "string") {
      return data;
    }
    if (typeof data === "number") {
      return data.toString();
    }
    if (Buffer.isBuffer(data)) {
      return data.toString("utf8");
    }
    throw new Error("Unsupported data type");
  }

  /**
   * Determine optimal QR version for given data
   */
  private determineVersion(
    data: string,
    errorLevel: ErrorCorrectionLevel
  ): number {
    const dataMode = this.detectDataMode(data);
    const dataLength = data.length;

    for (let version = 1; version <= 40; version++) {
      const capacity = this.getCapacity(version, errorLevel, dataMode);
      if (dataLength <= capacity) {
        return version;
      }
    }

    throw new Error("Data too long for QR code");
  }

  /**
   * Detect the data mode for encoding
   */
  private detectDataMode(data: string): DataMode {
    // Check if numeric (0-9 only)
    if (/^\d+$/.test(data)) {
      return DataMode.NUMERIC;
    }

    // Check if alphanumeric (0-9, A-Z, space, $, %, *, +, -, ., /, :)
    if (/^[0-9A-Z $%*+\-./:]+$/.test(data)) {
      return DataMode.ALPHANUMERIC;
    }

    // Default to byte mode
    return DataMode.BYTE;
  }

  /**
   * Get data capacity for version, error level, and mode
   */
  private getCapacity(
    version: number,
    errorLevel: ErrorCorrectionLevel,
    mode: DataMode
  ): number {
    const capacityKey =
      mode === DataMode.NUMERIC
        ? "numeric"
        : mode === DataMode.ALPHANUMERIC
        ? "alphanumeric"
        : "byte";

    // Simplified capacity check - in real implementation, use full capacity table
    const baseCapacity = version * 10; // Simplified calculation
    const errorMultiplier =
      errorLevel === ErrorCorrectionLevel.L
        ? 1
        : errorLevel === ErrorCorrectionLevel.M
        ? 0.8
        : errorLevel === ErrorCorrectionLevel.Q
        ? 0.6
        : 0.4;

    return Math.floor(baseCapacity * errorMultiplier);
  }

  /**
   * Validate input data
   */
  private validateInput(data: string): void {
    if (!data || data.length === 0) {
      throw new Error("Input data cannot be empty");
    }

    if (
      this.version < VALIDATION.MIN_VERSION ||
      this.version > VALIDATION.MAX_VERSION
    ) {
      throw new Error(
        `Version must be between ${VALIDATION.MIN_VERSION} and ${VALIDATION.MAX_VERSION}`
      );
    }
  }

  /**
   * Initialize empty matrix
   */
  private initializeMatrix(): void {
    this.matrix = Array(this.modules)
      .fill(null)
      .map(() => Array(this.modules).fill(false));
  }

  /**
   * Add finder patterns (large squares in corners)
   */
  private addFinderPatterns(): void {
    const positions = [
      { x: 0, y: 0 }, // Top-left
      { x: this.modules - 7, y: 0 }, // Top-right
      { x: 0, y: this.modules - 7 }, // Bottom-left
    ];

    positions.forEach((pos) => {
      this.addFinderPattern(pos.x, pos.y);
    });
  }

  /**
   * Add a single finder pattern at specified position
   */
  private addFinderPattern(startX: number, startY: number): void {
    const pattern = [
      [true, true, true, true, true, true, true],
      [true, false, false, false, false, false, true],
      [true, false, true, true, true, false, true],
      [true, false, true, true, true, false, true],
      [true, false, true, true, true, false, true],
      [true, false, false, false, false, false, true],
      [true, true, true, true, true, true, true],
    ];

    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (this.isInBounds(startX + x, startY + y)) {
          this.matrix[startY + y][startX + x] = pattern[y][x];
        }
      }
    }
  }

  /**
   * Add separators around finder patterns
   */
  private addSeparators(): void {
    // Top-left separator
    this.addSeparator(0, 0, 8, 8);
    // Top-right separator
    this.addSeparator(this.modules - 8, 0, 8, 8);
    // Bottom-left separator
    this.addSeparator(0, this.modules - 8, 8, 8);
  }

  /**
   * Add separator (white border around finder pattern)
   */
  private addSeparator(
    startX: number,
    startY: number,
    width: number,
    height: number
  ): void {
    for (let y = startY; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        if (this.isInBounds(x, y) && this.isEmpty(x, y)) {
          // Only set if it's not part of finder pattern
          if (!this.isFinderPattern(x, y)) {
            this.matrix[y][x] = false;
          }
        }
      }
    }
  }

  /**
   * Add alignment patterns for versions 2 and above
   */
  private addAlignmentPatterns(): void {
    if (this.version < 2) return;

    const positions = this.getAlignmentPatternPositions();

    positions.forEach((pos) => {
      this.addAlignmentPattern(pos.x, pos.y);
    });
  }

  /**
   * Get alignment pattern positions for current version
   */
  private getAlignmentPatternPositions(): Array<{ x: number; y: number }> {
    // Simplified alignment pattern positions
    // In a full implementation, this would use the official QR specification table
    const positions: Array<{ x: number; y: number }> = [];

    if (this.version === 2) {
      positions.push({ x: 16, y: 16 });
    } else if (this.version >= 3) {
      // Add more alignment patterns for higher versions
      const step = Math.floor((this.modules - 13) / 2);
      positions.push({ x: step, y: step });
    }

    return positions;
  }

  /**
   * Add single alignment pattern
   */
  private addAlignmentPattern(centerX: number, centerY: number): void {
    const pattern = [
      [true, true, true, true, true],
      [true, false, false, false, true],
      [true, false, true, false, true],
      [true, false, false, false, true],
      [true, true, true, true, true],
    ];

    for (let y = -2; y <= 2; y++) {
      for (let x = -2; x <= 2; x++) {
        const posX = centerX + x;
        const posY = centerY + y;

        if (this.isInBounds(posX, posY) && this.isEmpty(posX, posY)) {
          this.matrix[posY][posX] = pattern[y + 2][x + 2];
        }
      }
    }
  }

  /**
   * Add timing patterns (alternating line between finder patterns)
   */
  private addTimingPatterns(): void {
    // Horizontal timing pattern
    for (let x = 8; x < this.modules - 8; x++) {
      if (this.isEmpty(x, 6)) {
        this.matrix[6][x] = x % 2 === 0;
      }
    }

    // Vertical timing pattern
    for (let y = 8; y < this.modules - 8; y++) {
      if (this.isEmpty(6, y)) {
        this.matrix[y][6] = y % 2 === 0;
      }
    }
  }

  /**
   * Add dark module (always dark module at specific position)
   */
  private addDarkModule(): void {
    const x = 8;
    const y = 4 * this.version + 9;
    if (this.isInBounds(x, y)) {
      this.matrix[y][x] = true;
    }
  }

  /**
   * Reserve format information areas
   */
  private reserveFormatInfo(): void {
    // This is a placeholder - format info will be added later
    // Reserve areas around finder patterns for format information
  }

  /**
   * Reserve version information areas (version 7+)
   */
  private reserveVersionInfo(): void {
    // This is a placeholder - version info will be added later
    // Reserve 6x3 areas for version information
  }

  /**
   * Encode input data
   */
  private encodeData(data: string): number[] {
    const mode = this.detectDataMode(data);
    const encodedData: number[] = [];

    // Add mode indicator (4 bits)
    encodedData.push(...this.toBits(mode, 4));

    // Add character count indicator
    const charCountBits = this.getCharCountBits(mode);
    encodedData.push(...this.toBits(data.length, charCountBits));

    // Encode actual data
    switch (mode) {
      case DataMode.NUMERIC:
        encodedData.push(...this.encodeNumeric(data));
        break;
      case DataMode.ALPHANUMERIC:
        encodedData.push(...this.encodeAlphanumeric(data));
        break;
      case DataMode.BYTE:
        encodedData.push(...this.encodeByte(data));
        break;
    }

    return encodedData;
  }

  /**
   * Convert number to binary bits
   */
  private toBits(num: number, bitCount: number): number[] {
    const bits: number[] = [];
    for (let i = bitCount - 1; i >= 0; i--) {
      bits.push((num >> i) & 1);
    }
    return bits;
  }

  /**
   * Get character count indicator bit length
   */
  private getCharCountBits(mode: DataMode): number {
    // Simplified - in real implementation, depends on version ranges
    switch (mode) {
      case DataMode.NUMERIC:
        return 10;
      case DataMode.ALPHANUMERIC:
        return 9;
      case DataMode.BYTE:
        return 8;
      default:
        return 8;
    }
  }

  /**
   * Encode numeric data
   */
  private encodeNumeric(data: string): number[] {
    const bits: number[] = [];

    for (let i = 0; i < data.length; i += 3) {
      const group = data.substr(i, 3);
      const value = parseInt(group, 10);

      if (group.length === 3) {
        bits.push(...this.toBits(value, 10));
      } else if (group.length === 2) {
        bits.push(...this.toBits(value, 7));
      } else {
        bits.push(...this.toBits(value, 4));
      }
    }

    return bits;
  }

  /**
   * Encode alphanumeric data
   */
  private encodeAlphanumeric(data: string): number[] {
    const alphanumericChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
    const bits: number[] = [];

    for (let i = 0; i < data.length; i += 2) {
      const char1 = alphanumericChars.indexOf(data[i]);

      if (i + 1 < data.length) {
        const char2 = alphanumericChars.indexOf(data[i + 1]);
        const value = char1 * 45 + char2;
        bits.push(...this.toBits(value, 11));
      } else {
        bits.push(...this.toBits(char1, 6));
      }
    }

    return bits;
  }

  /**
   * Encode byte data
   */
  private encodeByte(data: string): number[] {
    const bits: number[] = [];

    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      bits.push(...this.toBits(charCode, 8));
    }

    return bits;
  }

  /**
   * Add error correction codes
   */
  private addErrorCorrection(data: number[]): number[] {
    // Simplified error correction - in a full implementation,
    // this would use Reed-Solomon error correction
    return [...data];
  }

  /**
   * Place data modules in the matrix
   */
  private placeDataModules(data: number[]): void {
    let dataIndex = 0;
    let direction = -1; // -1 for up, 1 for down

    // Start from bottom-right, move in zigzag pattern
    for (let col = this.modules - 1; col > 0; col -= 2) {
      if (col === 6) col--; // Skip timing column

      for (let count = 0; count < this.modules; count++) {
        for (let c = 0; c < 2; c++) {
          const x = col - c;
          const y = direction === -1 ? this.modules - 1 - count : count;

          if (this.isInBounds(x, y) && this.isEmpty(x, y)) {
            if (dataIndex < data.length) {
              this.matrix[y][x] = data[dataIndex] === 1;
              dataIndex++;
            } else {
              this.matrix[y][x] = false; // Padding
            }
          }
        }
      }

      direction *= -1; // Change direction
    }
  }

  /**
   * Select the best mask pattern
   */
  private selectBestMaskPattern(): MaskPattern {
    let bestPattern: MaskPattern = 0;
    let lowestPenalty = Infinity;

    for (let pattern = 0; pattern <= 7; pattern++) {
      const testMatrix = this.matrix.map((row) => [...row]);
      this.applyMaskToMatrix(testMatrix, pattern as MaskPattern);
      const penalty = this.calculateMaskPenalty(testMatrix);

      if (penalty < lowestPenalty) {
        lowestPenalty = penalty;
        bestPattern = pattern as MaskPattern;
      }
    }

    return bestPattern;
  }

  /**
   * Apply mask pattern to matrix
   */
  private applyMask(pattern: MaskPattern): void {
    this.applyMaskToMatrix(this.matrix, pattern);
  }

  /**
   * Apply mask pattern to a given matrix
   */
  private applyMaskToMatrix(matrix: QRMatrix, pattern: MaskPattern): void {
    for (let y = 0; y < this.modules; y++) {
      for (let x = 0; x < this.modules; x++) {
        if (this.isDataModule(x, y) && this.shouldApplyMask(x, y, pattern)) {
          matrix[y][x] = !matrix[y][x];
        }
      }
    }
  }

  /**
   * Check if mask should be applied at position
   */
  private shouldApplyMask(x: number, y: number, pattern: MaskPattern): boolean {
    switch (pattern) {
      case 0:
        return (x + y) % 2 === 0;
      case 1:
        return y % 2 === 0;
      case 2:
        return x % 3 === 0;
      case 3:
        return (x + y) % 3 === 0;
      case 4:
        return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
      case 5:
        return ((x * y) % 2) + ((x * y) % 3) === 0;
      case 6:
        return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
      case 7:
        return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
      default:
        return false;
    }
  }

  /**
   * Calculate mask penalty score
   */
  private calculateMaskPenalty(matrix: QRMatrix): number {
    // Simplified penalty calculation
    let penalty = 0;

    // Rule 1: Adjacent modules in row/column with same color
    penalty += this.calculateAdjacentPenalty(matrix);

    // Rule 2: Block of modules with same color
    penalty += this.calculateBlockPenalty(matrix);

    return penalty;
  }

  /**
   * Calculate penalty for adjacent same-color modules
   */
  private calculateAdjacentPenalty(matrix: QRMatrix): number {
    let penalty = 0;

    // Check rows
    for (let y = 0; y < this.modules; y++) {
      let count = 1;
      for (let x = 1; x < this.modules; x++) {
        if (matrix[y][x] === matrix[y][x - 1]) {
          count++;
        } else {
          if (count >= 5) {
            penalty += count - 2;
          }
          count = 1;
        }
      }
      if (count >= 5) {
        penalty += count - 2;
      }
    }

    // Check columns
    for (let x = 0; x < this.modules; x++) {
      let count = 1;
      for (let y = 1; y < this.modules; y++) {
        if (matrix[y][x] === matrix[y - 1][x]) {
          count++;
        } else {
          if (count >= 5) {
            penalty += count - 2;
          }
          count = 1;
        }
      }
      if (count >= 5) {
        penalty += count - 2;
      }
    }

    return penalty;
  }

  /**
   * Calculate penalty for 2x2 blocks of same color
   */
  private calculateBlockPenalty(matrix: QRMatrix): number {
    let penalty = 0;

    for (let y = 0; y < this.modules - 1; y++) {
      for (let x = 0; x < this.modules - 1; x++) {
        const color = matrix[y][x];
        if (
          matrix[y][x + 1] === color &&
          matrix[y + 1][x] === color &&
          matrix[y + 1][x + 1] === color
        ) {
          penalty += 3;
        }
      }
    }

    return penalty;
  }

  /**
   * Add format information
   */
  private addFormatInfo(): void {
    const formatInfo = this.generateFormatInfo();

    // Place format information around finder patterns
    // This is a simplified implementation
  }

  /**
   * Generate format information bits
   */
  private generateFormatInfo(): number[] {
    // Simplified format info generation
    const errorCorrectionBits =
      this.errorCorrectionLevel === ErrorCorrectionLevel.L
        ? [0, 1]
        : this.errorCorrectionLevel === ErrorCorrectionLevel.M
        ? [0, 0]
        : this.errorCorrectionLevel === ErrorCorrectionLevel.Q
        ? [1, 1]
        : [1, 0];

    const maskBits = this.toBits(this.maskPattern, 3);

    return [...errorCorrectionBits, ...maskBits];
  }

  /**
   * Add version information (for version 7+)
   */
  private addVersionInfo(): void {
    if (this.version < 7) return;

    const versionInfo = this.generateVersionInfo();
    // Place version information in reserved areas
  }

  /**
   * Generate version information bits
   */
  private generateVersionInfo(): number[] {
    return this.toBits(this.version, 18);
  }

  /**
   * Helper methods
   */
  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.modules && y >= 0 && y < this.modules;
  }

  private isEmpty(x: number, y: number): boolean {
    // In a full implementation, track which modules are already set
    return true;
  }

  private isFinderPattern(x: number, y: number): boolean {
    // Check if position is within finder pattern areas
    return (
      (x < 9 && y < 9) || // Top-left
      (x >= this.modules - 8 && y < 9) || // Top-right
      (x < 9 && y >= this.modules - 8)
    ); // Bottom-left
  }

  private isDataModule(x: number, y: number): boolean {
    // Check if module can contain data (not function pattern)
    return !this.isFinderPattern(x, y) && x !== 6 && y !== 6; // Not timing pattern
  }

  /**
   * Get current QR code properties
   */
  public getVersion(): number {
    return this.version;
  }

  public getErrorCorrectionLevel(): ErrorCorrectionLevel {
    return this.errorCorrectionLevel;
  }

  public getMaskPattern(): MaskPattern {
    return this.maskPattern;
  }

  public getModules(): number {
    return this.modules;
  }
}
