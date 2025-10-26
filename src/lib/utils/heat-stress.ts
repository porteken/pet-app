export interface HeatStressDescription {
  colorClass: string;
  prefix: string;
  value: string;
}

export interface HeatStressInfo {
  color: string;
  level: HeatStressLevel;
  value: string;
}

export type HeatStressLevel =
  | "Extreme"
  | "Moderate"
  | "None to Slight"
  | "Strong";

export function getForecastHeatStressDescription(
  petValue: number,
  year: number
): HeatStressDescription {
  const info = getHeatStressInfo(petValue);
  return {
    colorClass: info.color,
    prefix: `By end of ${year}, it could be`,
    value: info.value,
  };
}

export function getHeatStressColor(petValue: number): string {
  if (petValue < 29) {
    return "text-green-600";
  }
  if (petValue >= 29.1 && petValue <= 35) {
    return "text-yellow-600";
  }
  if (petValue >= 35.1 && petValue <= 41) {
    return "text-orange-600";
  }
  return "text-red-600";
}

export function getHeatStressDescription(
  petValue: number,
  measureType: string,
  year: number = 2025
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

export function getHeatStressLevel(petValue: number): HeatStressLevel {
  if (petValue < 29) {
    return "None to Slight";
  }
  if (petValue >= 29.1 && petValue <= 35) {
    return "Moderate";
  }
  if (petValue >= 35.1 && petValue <= 41) {
    return "Strong";
  }
  return "Extreme";
}
