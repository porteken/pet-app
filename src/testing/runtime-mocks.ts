export type Primitive = number | string;

type FilterOperation = {
  column: string;
  type: "eq" | "gt" | "gte" | "lt" | "lte";
  value: Primitive;
};
type MockListResult = { data: MockRow[]; error: undefined };
type MockRow = Record<string, Primitive>;
type MockSingleResult = { data: MockRow | undefined; error: undefined };
type MockSupabaseQuery = Promise<MockListResult> & {
  eq: (column: string, value: Primitive) => MockSupabaseQuery;
  gt: (column: string, value: Primitive) => MockSupabaseQuery;
  gte: (column: string, value: Primitive) => MockSupabaseQuery;
  limit: (count: number) => MockSupabaseQuery;
  lt: (column: string, value: Primitive) => MockSupabaseQuery;
  lte: (column: string, value: Primitive) => MockSupabaseQuery;
  maybeSingle: () => Promise<MockSingleResult>;
  order: (
    column: string,
    options?: { ascending?: boolean },
  ) => MockSupabaseQuery;
  select: (columns?: string) => MockSupabaseQuery;
  single: () => Promise<MockSingleResult>;
};
type OrderOperation = { ascending: boolean; column: string };

const YEARS = Array.from({ length: 26 }, (_, index) => 2000 + index);
const FORECAST_YEARS = Array.from({ length: 75 }, (_, index) => 2026 + index);

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
  const location = LOCATIONS.find((item) => item.location_id === locationId)!;
  const delta = year - 2000;
  return round(location.year2000Avg + delta * location.trendPerYear);
};

const getMaxPet = (locationId: number, year: number) =>
  round(getAveragePet(locationId, year) + 4.5);

const buildPetYearRows = () => {
  const rows: MockRow[] = [];

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

const MOCK_TABLES: Record<string, MockRow[]> = {
  locations: LOCATIONS.map(({ city, lat, lng, location_id, state }) => ({
    city,
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
    const lastHistoricalAvg = getAveragePet(
      location.location_id,
      lastHistoricalYear,
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
        upper: round(forecastPet + 2.2),
        year,
      };
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
  pet_year: petYearRows,
  pet_year_avg: LOCATIONS.flatMap((location) =>
    YEARS.map((year) => ({
      location_id: location.location_id,
      pet: getAveragePet(location.location_id, year),
      year,
    })),
  ),
  pet_year_max: LOCATIONS.flatMap((location) =>
    YEARS.map((year) => ({
      location_id: location.location_id,
      pet: getMaxPet(location.location_id, year),
      year,
    })),
  ),
};

const createNoopFunction = <TArguments extends unknown[], TReturn>(
  implementation: (...arguments_: TArguments) => TReturn,
) => implementation;

const compareEq = (left: Primitive | undefined, right: Primitive) =>
  left !== undefined && String(left) === String(right);

const compareNumeric = (
  left: Primitive | undefined,
  right: Primitive,
  comparator: (rowValue: number, filterValue: number) => boolean,
) => {
  if (left === undefined) {
    return false;
  }

  const rowValue = Number(left);
  const filterValue = Number(right);
  if (Number.isNaN(rowValue) || Number.isNaN(filterValue)) {
    return false;
  }

  return comparator(rowValue, filterValue);
};

const compareGreaterThan = (rowValue: number, filterValue: number) =>
  rowValue > filterValue;
const compareGreaterThanOrEqual = (rowValue: number, filterValue: number) =>
  rowValue >= filterValue;
const compareLessThan = (rowValue: number, filterValue: number) =>
  rowValue < filterValue;
const compareLessThanOrEqual = (rowValue: number, filterValue: number) =>
  rowValue <= filterValue;

const matchesFilterOperation = (row: MockRow, filter: FilterOperation) => {
  const cell = row[filter.column];

  switch (filter.type) {
    case "eq": {
      return compareEq(cell, filter.value);
    }
    case "gt": {
      return compareNumeric(cell, filter.value, compareGreaterThan);
    }
    case "gte": {
      return compareNumeric(cell, filter.value, compareGreaterThanOrEqual);
    }
    case "lt": {
      return compareNumeric(cell, filter.value, compareLessThan);
    }
    case "lte": {
      return compareNumeric(cell, filter.value, compareLessThanOrEqual);
    }
  }
};

const applyFilters = (rows: MockRow[], filters: FilterOperation[]) =>
  rows.filter((row) =>
    filters.every((filter) => matchesFilterOperation(row, filter)),
  );

const applyColumnSelection = (rows: MockRow[], columns?: string) => {
  if (!columns || columns.trim() === "*" || columns.trim() === "") {
    return rows.map((row) => ({ ...row }));
  }

  const selectedColumns = columns
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean);

  return rows.map((row) =>
    Object.fromEntries(selectedColumns.map((column) => [column, row[column]])),
  );
};

const applyOrdering = (rows: MockRow[], orderOperation?: OrderOperation) => {
  if (!orderOperation) {
    return [...rows];
  }

  const { ascending, column } = orderOperation;

  return rows.toSorted((left, right) => {
    const a = left[column];
    const b = right[column];

    if (a === b) {
      return 0;
    }

    if (typeof a === "number" && typeof b === "number") {
      return ascending ? a - b : b - a;
    }

    return ascending
      ? String(a).localeCompare(String(b))
      : String(b).localeCompare(String(a));
  });
};

const createMockSupabaseQuery = (table: string): MockSupabaseQuery => {
  let selectedColumns: string | undefined;
  const filters: FilterOperation[] = [];
  let orderOperation: OrderOperation | undefined;
  let limitValue: number | undefined;

  const computeRows = (): MockRow[] => {
    const sourceRows = MOCK_TABLES[table];

    if (!sourceRows) {
      return [];
    }

    let rows = applyFilters(sourceRows, filters);
    rows = applyOrdering(rows, orderOperation);

    if (typeof limitValue === "number") {
      rows = rows.slice(0, Math.max(0, limitValue));
    }

    return applyColumnSelection(rows, selectedColumns);
  };

  const asResult = (): MockListResult => ({
    data: computeRows(),
    error: undefined,
  });

  const query = new Promise<MockListResult>((resolve) => {
    queueMicrotask(() => {
      resolve(asResult());
    });
  }) as MockSupabaseQuery;

  query.select = createNoopFunction((columns?: string) => {
    selectedColumns = columns;
    return query;
  });
  query.eq = createNoopFunction((column: string, value: Primitive) => {
    filters.push({ column, type: "eq", value });
    return query;
  });
  query.gt = createNoopFunction((column: string, value: Primitive) => {
    filters.push({ column, type: "gt", value });
    return query;
  });
  query.gte = createNoopFunction((column: string, value: Primitive) => {
    filters.push({ column, type: "gte", value });
    return query;
  });
  query.lt = createNoopFunction((column: string, value: Primitive) => {
    filters.push({ column, type: "lt", value });
    return query;
  });
  query.lte = createNoopFunction((column: string, value: Primitive) => {
    filters.push({ column, type: "lte", value });
    return query;
  });
  query.order = createNoopFunction(
    (column: string, options?: { ascending?: boolean }) => {
      orderOperation = {
        ascending: options?.ascending ?? true,
        column,
      };
      return query;
    },
  );
  query.limit = createNoopFunction((count: number) => {
    limitValue = count;
    return query;
  });
  query.single = createNoopFunction(async () => {
    const rows = computeRows();
    return { data: rows[0], error: undefined };
  });
  query.maybeSingle = createNoopFunction(async () => {
    const rows = computeRows();
    return { data: rows[0], error: undefined };
  });

  return query;
};

export const getRuntimeMockTableRows = (table: string) =>
  (MOCK_TABLES[table] ?? []).map((row) => ({ ...row }));

export const createRuntimeMockSupabaseClient = () => ({
  from: createNoopFunction((table: string) => createMockSupabaseQuery(table)),
  rpc: createNoopFunction((_name: string) =>
    createMockSupabaseQuery("__rpc__"),
  ),
});
