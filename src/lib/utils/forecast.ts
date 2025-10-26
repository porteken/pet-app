export class TimeSeriesForecast {
  private readonly alpha: number;
  private readonly beta: number;
  private readonly data: number[];
  private readonly level: number[];
  private readonly residualPattern: number[];
  private readonly residuals: number[];
  private readonly standardError: number;
  private readonly trend: number[];
  private readonly yearlyVariance: number;

  constructor(data: number[], alpha: number = 0.3, beta: number = 0.1) {
    if (!Array.isArray(data)) {
      throw new TypeError("data must be an array");
    }
    if (data.length < 3) {
      throw new Error("data must have at least 3 points");
    }

    this.alpha = alpha;
    this.beta = beta;
    this.data = [...data];
    this.level = [];
    this.trend = [];
    this.residuals = [];
    this.residualPattern = [];

    this.initializeComponents();

    this.applyHoltsMethod();

    this.standardError = this.calculateStandardError();
    this.yearlyVariance = this.calculateYearlyVariance();
  }

  forecast(stepsAhead: number): number {
    if (stepsAhead < 0) {
      throw new Error("stepsAhead must be non-negative");
    }

    const lastLevel = this.level.at(-1)!;
    const lastTrend = this.trend.at(-1)!;

    const baseForecast = lastLevel + stepsAhead * lastTrend;

    const cyclicalComponent =
      this.yearlyVariance * Math.sin((stepsAhead * Math.PI) / 3);
    const randomComponent =
      this.yearlyVariance * 0.3 * this.seededRandom(stepsAhead);

    return baseForecast + cyclicalComponent + randomComponent;
  }

  forecastWithConfidence(
    stepsAhead: number,
    confidenceLevel: number = 0.8
  ): { lowerBound: number; prediction: number; upperBound: number } {
    const prediction = this.forecast(stepsAhead);

    const predictionError = this.standardError;

    const zValueMap: Record<number, number> = {
      0.2: 0.253,
      0.5: 0.674,
      0.8: 1.282,
      0.9: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };
    const zValue = zValueMap[confidenceLevel] ?? 1.282;

    const margin = zValue * predictionError;

    return {
      lowerBound: prediction - margin,
      prediction,
      upperBound: prediction + margin,
    };
  }

  getComponents(): { level: number; trend: number } {
    return {
      level: this.level.at(-1)!,
      trend: this.trend.at(-1)!,
    };
  }

  getStandardError(): number {
    return this.standardError;
  }

  private applyHoltsMethod(): void {
    const n = this.data.length;

    for (let t = 1; t < n; t++) {
      const previousLevel = this.level[t - 1];
      const previousTrend = this.trend[t - 1];

      this.level[t] =
        this.alpha * this.data[t] +
        (1 - this.alpha) * (previousLevel + previousTrend);

      this.trend[t] =
        this.beta * (this.level[t] - previousLevel) +
        (1 - this.beta) * previousTrend;

      const forecast = previousLevel + previousTrend;
      this.residuals[t] = this.data[t] - forecast;
    }
  }

  private calculateStandardError(): number {
    if (this.residuals.length <= 2) {
      return 0;
    }

    const sumSquared = this.residuals.reduce(
      (sum, residual) => sum + residual * residual,
      0
    );

    return Math.sqrt(sumSquared / (this.residuals.length - 2));
  }

  private calculateYearlyVariance(): number {
    if (this.data.length <= 1) {
      return 0;
    }

    const yearToYearChanges: number[] = [];
    for (let index = 1; index < this.data.length; index++) {
      yearToYearChanges.push(Math.abs(this.data[index] - this.data[index - 1]));
    }

    const avgChange =
      yearToYearChanges.reduce((sum, change) => sum + change, 0) /
      yearToYearChanges.length;

    return avgChange * 0.6;
  }

  private initializeComponents(): void {
    const n = this.data.length;

    this.level[0] = this.data[0];

    this.trend[0] = n >= 2 ? this.data[1] - this.data[0] : 0;
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43_758.5453;
    return (x - Math.floor(x)) * 2 - 1;
  }
}

/**
 * Calculates forecast values for future years using Holt-Winters method.
 * @param years - Array of years for the historical data
 * @param values - Array of values for the historical data
 * @param yearsAhead - Number of years to forecast ahead
 * @returns Object containing forecast years, values, and confidence bounds
 */
export function calculateForecast(
  years: number[],
  values: number[],
  yearsAhead: number
) {
  if (years.length < 2 || values.length < 2) {
    return {
      forecastValues: [],
      forecastYears: [],
      lowerBound10: [],
      upperBound90: [],
    };
  }

  const model = new TimeSeriesForecast(values);

  const forecastYears: number[] = [];
  const forecastValues: number[] = [];
  const lowerBound10: number[] = [];
  const upperBound90: number[] = [];

  const lastYear = years.at(-1)!;

  for (let step = 1; step <= yearsAhead; step++) {
    forecastYears.push(lastYear + step);

    const {
      lowerBound: lower25,
      prediction,
      upperBound: upper75,
    } = model.forecastWithConfidence(step, 0.5);

    forecastValues.push(prediction);
    lowerBound10.push(lower25);
    upperBound90.push(upper75);
  }

  return {
    forecastValues,
    forecastYears,
    lowerBound10,
    upperBound90,
  };
}
