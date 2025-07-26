export class SimpleLinearRegression {
  private readonly intercept: number;
  private readonly slope: number;

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

    const result = this.calculateRegression(x, y);
    this.slope = result.slope;
    this.intercept = result.intercept;
  }

  predict(x: number): number {
    return this.slope * x + this.intercept;
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
}
