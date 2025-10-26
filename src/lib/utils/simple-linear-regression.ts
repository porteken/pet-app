export class SimpleLinearRegression {
  public readonly slope: number;
  private readonly intercept: number;
  private readonly standardError: number;
  private readonly xData: number[];
  private readonly xMean: number;
  private readonly xVariance: number;
  private readonly yData: number[];

  constructor(x: number[], y: number[]) {
    if (!Array.isArray(x) || !Array.isArray(y)) {
      throw new TypeError("x and y must be arrays");
    }
    if (x.length !== y.length) {
      throw new Error("x and y must have the same length");
    }
    if (x.length === 0) {
      throw new Error("x and y must not be empty");
    }

    this.xData = [...x];
    this.yData = [...y];

    const result = this.calculateRegression(x, y);
    this.slope = result.slope;
    this.intercept = result.intercept;
    this.standardError = this.calculateStandardError(x, y);
    const n = this.xData.length;
    this.xMean = this.xData.reduce((sum, value) => sum + value, 0) / n;
    this.xVariance =
      this.xData.reduce((sum, value) => sum + (value - this.xMean) ** 2, 0) / n;
  }

  predict(x: number): number {
    return this.slope * x + this.intercept;
  }

  predictWithConfidence(
    x: number,
    confidenceLevel: number = 0.8
  ): { lowerBound: number; prediction: number; upperBound: number } {
    const prediction = this.predict(x);
    const n = this.xData.length;

    const predictionError =
      this.standardError *
      Math.sqrt(1 + 1 / n + (x - this.xMean) ** 2 / (n * this.xVariance));

    const tValueMap: Record<number, number> = {
      0.8: 1.282,
      0.95: 1.96,
      0.99: 2.576,
    };
    const tValue = tValueMap[confidenceLevel] ?? 1.282;

    const margin = tValue * predictionError;

    return {
      lowerBound: prediction - margin,
      prediction,
      upperBound: prediction + margin,
    };
  }

  private calculateRegression(x: number[], y: number[]) {
    const n = x.length;
    let xSum = 0;
    let ySum = 0;
    let xSquared = 0;
    let xY = 0;

    for (let index = 0; index < n; index++) {
      xSum += x[index];
      ySum += y[index];
      xSquared += x[index] * x[index];
      xY += x[index] * y[index];
    }

    const numerator = n * xY - xSum * ySum;
    const denominator = n * xSquared - xSum * xSum;

    const slope = numerator / denominator;
    const intercept = (ySum - slope * xSum) / n;

    return { intercept, slope };
  }

  private calculateStandardError(x: number[], y: number[]): number {
    const n = x.length;
    if (n <= 2) {
      return 0;
    }

    let sumSquaredResiduals = 0;
    for (let index = 0; index < n; index++) {
      const predicted = this.slope * x[index] + this.intercept;
      const residual = y[index] - predicted;
      sumSquaredResiduals += residual * residual;
    }

    return Math.sqrt(sumSquaredResiduals / (n - 2));
  }
}
