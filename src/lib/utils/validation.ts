export function validateDates(dates: Date[]): void {
  if (dates.some(date => Number.isNaN(date.getTime()))) {
    throw new Error("Invalid date data detected");
  }
}

export function validateLocationId(locationId: number): boolean {
  return Number.isInteger(locationId) && locationId > 0;
}

export function validatePets(pets: number[]): void {
  if (pets.some(pet => Number.isNaN(pet))) {
    throw new Error("Invalid pet count data detected");
  }
}

export function validateTrendOption(option: string): boolean {
  return option === "avg" || option === "max";
}

export function validateYear(year: string): boolean {
  return /^\d{4}$/.test(year);
}

export function validateYearPets(yearPets: number[]): void {
  if (yearPets.some(pet => Number.isNaN(pet) || pet < 0)) {
    throw new Error("Invalid pet count data detected");
  }
}

export function validateYears(years: number[]): void {
  if (
    years.some(year => !Number.isInteger(year) || year < 1900 || year > 2100)
  ) {
    throw new Error("Invalid year data detected");
  }
}
