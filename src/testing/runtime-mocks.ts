import type {
  CityRankingsViewTable,
  PetForecastTable,
  PetYearStatsTable,
} from "@/lib/db/types";

type Primitive = number | string;
type MockRow = Record<string, Primitive>;

interface RuntimeLocationRow extends MockRow {
  city: string;
  id: number;
  lat: number;
  lng: number;
  location_id: number;
  state: string;
}

interface RuntimePetChangeRow extends MockRow {
  change: number;
  location_id: number;
}

interface RuntimePetPercentilesRow extends MockRow {
  location_id: number;
  p10: number;
  p90: number;
  year: number;
}

interface RuntimePetRow extends MockRow {
  date: string;
  location_id: number;
  pet: number;
  year: number;
}

interface RuntimeMockTables {
  city_rankings_view: Array<CityRankingsViewTable & MockRow>;
  locations: RuntimeLocationRow[];
  pet: RuntimePetRow[];
  pet_change: RuntimePetChangeRow[];
  pet_forecast: Array<PetForecastTable & MockRow>;
  pet_forecast_max: Array<PetForecastTable & MockRow>;
  pet_percentiles: RuntimePetPercentilesRow[];
  pet_year_stats: Array<PetYearStatsTable & MockRow>;
}

const YEARS = Array.from({ length: 26 }, (_, index) => 2000 + index);
const FORECAST_YEARS = Array.from({ length: 75 }, (_, index) => 2026 + index);
const GRAPH_SEASONS = ["Annual", "Spring", "Summer", "Fall", "Winter"] as const;
const SEASONAL_AVG_OFFSETS = {
  Annual: 0,
  Fall: -0.8,
  Spring: -1.6,
  Summer: 4.5,
  Winter: -7.5,
} as const;
const SEASONAL_MAX_OFFSETS = {
  Annual: 4.5,
  Fall: 3.6,
  Spring: 2.3,
  Summer: 6.8,
  Winter: 1.4,
} as const;

const LOCATIONS = [
  {
    city: "Phoenix",
    lat: 33.4484,
    lng: -112.074,
    location_id: 1,
    state: "AZ",
    trendPerYear: 0.11,
    year2000Avg: 36.2,
  },
  {
    city: "Miami",
    lat: 25.7617,
    lng: -80.1918,
    location_id: 2,
    state: "FL",
    trendPerYear: 0.08,
    year2000Avg: 33.8,
  },
  {
    city: "Dallas",
    lat: 32.7767,
    lng: -96.797,
    location_id: 3,
    state: "TX",
    trendPerYear: 0.1,
    year2000Avg: 34.7,
  },
  {
    city: "Denver",
    lat: 39.7392,
    lng: -104.9903,
    location_id: 4,
    state: "CO",
    trendPerYear: 0.07,
    year2000Avg: 28.4,
  },
  {
    city: "Seattle",
    lat: 47.6062,
    lng: -122.3321,
    location_id: 5,
    state: "WA",
    trendPerYear: 0.05,
    year2000Avg: 24.8,
  },
  {
    city: "Minneapolis",
    lat: 44.9778,
    lng: -93.265,
    location_id: 6,
    state: "MN",
    trendPerYear: 0.06,
    year2000Avg: 26.1,
  },
] as const;

const round = (value: number) => Math.round(value * 100) / 100;

const getAveragePet = (locationId: number, year: number) => {
  const location = LOCATIONS.find((item) => item.location_id === locationId);
  if (location === undefined) {
    throw new Error(`Unknown location id: ${locationId}`);
  }
  const delta = year - 2000;
  return round(location.year2000Avg + delta * location.trendPerYear);
};

const buildPetYearRows = (): RuntimePetRow[] => {
  const rows: RuntimePetRow[] = [];

  for (const location of LOCATIONS) {
    for (const year of YEARS) {
      const seasonalBase = getAveragePet(location.location_id, year);

      for (let index = 0; index < 10; index++) {
        const month = 6 + Math.floor(index / 4);
        const day = 1 + (index % 4) * 7;
        const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const pet = round(seasonalBase + (index - 4.5) * 0.35);

        rows.push({
          date,
          location_id: location.location_id,
          pet,
          year,
        });
      }
    }
  }

  return rows;
};

const petYearRows = buildPetYearRows();

const MOCK_TABLES: RuntimeMockTables = {
  city_rankings_view: LOCATIONS.flatMap((location) =>
    YEARS.flatMap((year) =>
      GRAPH_SEASONS.map((season) => {
        const avg = round(
          getAveragePet(location.location_id, year) +
            SEASONAL_AVG_OFFSETS[season],
        );
        const forecastPet = round(
          getAveragePet(location.location_id, 2025) +
            SEASONAL_AVG_OFFSETS[season] +
            (2100 - 2025) * location.trendPerYear,
        );
        return {
          avg_pet: avg,
          change_from_2000: round((year - 2000) * location.trendPerYear),
          city: location.city,
          future_lower: round(forecastPet - 2.2),
          future_upper: round(forecastPet + 2.2),
          location_id: location.location_id,
          max_pet: round(
            getAveragePet(location.location_id, year) +
              SEASONAL_MAX_OFFSETS[season],
          ),
          p10: round(avg - 2.5),
          p90: round(avg + 2.5),
          season,
          state: location.state,
          year,
        };
      }),
    ),
  ),
  locations: LOCATIONS.map(({ city, lat, lng, location_id, state }) => ({
    city,
    id: location_id,
    lat,
    lng,
    location_id,
    state,
  })),
  pet_change: LOCATIONS.map((location) => ({
    change: round(location.trendPerYear * 10),
    location_id: location.location_id,
  })),
  pet_forecast: LOCATIONS.flatMap((location) => {
    const lastHistoricalYear = 2025;

    return GRAPH_SEASONS.flatMap((season) => {
      const lastHistoricalAvg = round(
        getAveragePet(location.location_id, lastHistoricalYear) +
          SEASONAL_AVG_OFFSETS[season],
      );

      return FORECAST_YEARS.map((year) => {
        const yearsAhead = year - lastHistoricalYear;
        const forecastPet = round(
          lastHistoricalAvg + yearsAhead * location.trendPerYear,
        );

        return {
          location_id: location.location_id,
          lower: round(forecastPet - 2.2),
          pet: forecastPet,
          season,
          upper: round(forecastPet + 2.2),
          year,
        };
      });
    });
  }),
  pet_forecast_max: LOCATIONS.flatMap((location) => {
    const lastHistoricalYear = 2025;

    return GRAPH_SEASONS.flatMap((season) => {
      const lastHistoricalMax = round(
        getAveragePet(location.location_id, lastHistoricalYear) +
          SEASONAL_MAX_OFFSETS[season],
      );

      return FORECAST_YEARS.map((year) => {
        const yearsAhead = year - lastHistoricalYear;
        const forecastPet = round(
          lastHistoricalMax + yearsAhead * location.trendPerYear,
        );

        return {
          location_id: location.location_id,
          lower: round(forecastPet - 2.2),
          pet: forecastPet,
          season,
          upper: round(forecastPet + 2.2),
          year,
        };
      });
    });
  }),
  pet_percentiles: LOCATIONS.flatMap((location) =>
    YEARS.map((year) => {
      const avg = getAveragePet(location.location_id, year);
      return {
        location_id: location.location_id,
        p10: round(avg - 2.5),
        p90: round(avg + 2.5),
        year,
      };
    }),
  ),
  pet: petYearRows,
  pet_year_stats: LOCATIONS.flatMap((location) =>
    YEARS.flatMap((year) =>
      GRAPH_SEASONS.map((season) => {
        const avg = getAveragePet(location.location_id, year);
        return {
          avg_pet: round(avg + SEASONAL_AVG_OFFSETS[season]),
          location_id: location.location_id,
          max_pet: round(avg + SEASONAL_MAX_OFFSETS[season]),
          p10: round(avg - 2.5),
          p90: round(avg + 2.5),
          season,
          year,
        };
      }),
    ),
  ),
};

const hasTable = (table: string): table is keyof RuntimeMockTables =>
  Object.hasOwn(MOCK_TABLES, table);

const getTableRows = (table: string): MockRow[] => {
  if (!hasTable(table)) {
    return [];
  }

  return MOCK_TABLES[table];
};

export function getRuntimeMockTableRows<TTable extends keyof RuntimeMockTables>(
  table: TTable,
): RuntimeMockTables[TTable];
export function getRuntimeMockTableRows(table: string): MockRow[];
export function getRuntimeMockTableRows(table: string) {
  return getTableRows(table).map((row) => structuredClone(row));
}
