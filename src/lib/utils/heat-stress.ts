export interface HeatStressDescription {
  colorClass: string;
  confidenceRange?: string;
  prefix: string;
  value: string;
}

export type HeatStressLevel =
  | "Extreme"
  | "Moderate"
  | "None to Slight"
  | "Strong";

interface HeatStressInfo {
  color: string;
  level: HeatStressLevel;
  value: string;
}

export function getForecastHeatStressDescription(
  petValue: number,
  year: number,
  lowerBound10?: number,
  upperBound90?: number,
): HeatStressDescription {
  const info = getHeatStressInfo(petValue);

  const hasValidBounds =
    lowerBound10 !== undefined &&
    upperBound90 !== undefined &&
    !Number.isNaN(lowerBound10) &&
    !Number.isNaN(upperBound90) &&
    Math.abs(upperBound90 - lowerBound10) > 0.1;

  const confidenceRange = hasValidBounds
    ? `(10-90%: ${lowerBound10.toFixed(1)}-${upperBound90.toFixed(1)}°C)`
    : undefined;

  return {
    colorClass: info.color,
    confidenceRange,
    prefix: `By end of ${year}, it could be`,
    value: info.value,
  };
}

export function getHeatStressDescription(
  petValue: number,
  measureType: string,
  year: number = 2025,
): HeatStressDescription {
  const info = getHeatStressInfo(petValue);
  const measure = measureType === "avg" ? "average" : "max";
  return {
    colorClass: info.color,
    prefix: `The ${year} yearly ${measure} heat stress is`,
    value: info.value,
  };
}

export function getHeatStressInfo(petValue: number): HeatStressInfo {
  let color: string;
  let level: HeatStressLevel;

  if (petValue < 29) {
    color = "text-green-600";
    level = "None to Slight";
  } else if (petValue <= 35) {
    color = "text-yellow-600";
    level = "Moderate";
  } else if (petValue <= 41) {
    color = "text-orange-600";
    level = "Strong";
  } else {
    color = "text-red-600";
    level = "Extreme";
  }

  return {
    color,
    level,
    value: petValue.toFixed(1),
  };
}
