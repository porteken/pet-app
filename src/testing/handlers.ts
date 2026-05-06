import {
  getRuntimeMockTableRows,
  type Primitive,
} from "@/testing/runtime-mocks";
/* oxlint-disable @typescript-eslint/no-unsafe-type-assertion */
import { http, HttpResponse } from "msw";

type FilterOperator = "eq" | "gt" | "gte" | "lt" | "lte";
type MockRow = Record<string, Primitive | undefined>;

const RESERVED_QUERY_PARAMS = new Set(["limit", "offset", "order", "select"]);

const filterOperatorSet = new Set<FilterOperator>([
  "eq",
  "gt",
  "gte",
  "lt",
  "lte",
]);

const toNumber = (value: Primitive | string) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? undefined : numberValue;
};

const matchesFilter = (
  row: MockRow,
  column: string,
  operator: FilterOperator,
  filterValue: string,
) => {
  const rowValue = row[column];
  if (rowValue === undefined) {
    return false;
  }

  if (operator === "eq") {
    return String(rowValue) === filterValue;
  }

  const numericRowValue = toNumber(rowValue);
  const numericFilterValue = toNumber(filterValue);
  if (numericRowValue === undefined || numericFilterValue === undefined) {
    return false;
  }

  if (operator === "gt") {
    return numericRowValue > numericFilterValue;
  }

  if (operator === "gte") {
    return numericRowValue >= numericFilterValue;
  }

  if (operator === "lt") {
    return numericRowValue < numericFilterValue;
  }

  return numericRowValue <= numericFilterValue;
};

const applyFilters = (rows: MockRow[], requestUrl: URL) => {
  let filteredRows = rows;

  for (const [column, rawFilterValue] of requestUrl.searchParams.entries()) {
    if (RESERVED_QUERY_PARAMS.has(column)) {
      continue;
    }

    const [operator, ...rest] = rawFilterValue.split(".");
    if (
      !filterOperatorSet.has(operator as FilterOperator) ||
      rest.length === 0
    ) {
      continue;
    }

    const typedOperator = operator as FilterOperator;
    const filterValue = rest.join(".");

    filteredRows = filteredRows.filter((row) =>
      matchesFilter(row, column, typedOperator, filterValue),
    );
  }

  return filteredRows;
};

const applyOrdering = (rows: MockRow[], requestUrl: URL) => {
  const order = requestUrl.searchParams.get("order");
  if (!order) {
    return rows;
  }

  const [column, direction] = order.split(".");
  if (!column) {
    return rows;
  }

  const isAscending = direction !== "desc";

  return rows.toSorted((left, right) => {
    const leftValue = left[column];
    const rightValue = right[column];

    if (leftValue === rightValue) {
      return 0;
    }

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return isAscending ? leftValue - rightValue : rightValue - leftValue;
    }

    return isAscending
      ? String(leftValue).localeCompare(String(rightValue))
      : String(rightValue).localeCompare(String(leftValue));
  });
};

const applyLimit = (rows: MockRow[], requestUrl: URL) => {
  const limit = requestUrl.searchParams.get("limit");
  if (!limit) {
    return rows;
  }

  const parsedLimit = Number.parseInt(limit, 10);
  if (Number.isNaN(parsedLimit)) {
    return rows;
  }

  return rows.slice(0, Math.max(0, parsedLimit));
};

const applyColumnSelection = (rows: MockRow[], requestUrl: URL) => {
  const select = requestUrl.searchParams.get("select");
  if (!select || select === "*") {
    return rows;
  }

  const columns = select
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean);

  return rows.map((row) =>
    Object.fromEntries(columns.map((column) => [column, row[column]])),
  );
};

export const handlers = [
  http.get("*/rest/v1/:table", ({ params, request }) => {
    const tableName = params.table;
    if (typeof tableName !== "string") {
      return HttpResponse.json(
        { message: "Missing table name" },
        { status: 400 },
      );
    }

    const url = new URL(request.url);
    const sourceRows = getRuntimeMockTableRows(tableName);

    const filteredRows = applyFilters(sourceRows, url);
    const orderedRows = applyOrdering(filteredRows, url);
    const limitedRows = applyLimit(orderedRows, url);
    const selectedRows = applyColumnSelection(limitedRows, url);

    return HttpResponse.json(selectedRows, { status: 200 });
  }),
];
