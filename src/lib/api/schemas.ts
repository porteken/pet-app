import { z, ZodError } from "zod";

const finiteNumberSchema = z.coerce
  .number()
  .refine(Number.isFinite, "Expected a finite number");
const positiveIntegerSchema = z.coerce.number().int().positive();
const yearSchema = z.coerce.number().int().min(1900).max(2200);

const trendGraphRowSchema = z.object({
  location_id: positiveIntegerSchema,
  pet: finiteNumberSchema,
  year: yearSchema,
});

const referenceGraphRowSchema = z.object({
  date: z
    .string()
    .min(1)
    .refine(value => !Number.isNaN(Date.parse(value)), "Invalid date format"),
  location_id: positiveIntegerSchema,
  pet: finiteNumberSchema,
  year: z.coerce.string().optional(),
});

const forecastRowSchema = z.object({
  location_id: positiveIntegerSchema.optional(),
  lower: finiteNumberSchema,
  pet: finiteNumberSchema,
  upper: finiteNumberSchema,
  year: yearSchema,
});

const historicalYearRowSchema = z.object({
  year: yearSchema,
});

const locationRowSchema = z.object({
  city: z.string().min(1),
  lat: finiteNumberSchema,
  lng: finiteNumberSchema,
  location_id: positiveIntegerSchema,
  state: z.string().min(1),
});

const rankingPetRowSchema = z.object({
  location_id: positiveIntegerSchema,
  pet: finiteNumberSchema,
});

const rankingLocationRowSchema = z.object({
  city: z.string().min(1),
  location_id: positiveIntegerSchema,
  state: z.string().min(1),
});

const rankingPercentileRowSchema = z.object({
  location_id: positiveIntegerSchema,
  p10: finiteNumberSchema,
  p90: finiteNumberSchema,
  year: yearSchema,
});

const rankingForecastRowSchema = z.object({
  location_id: positiveIntegerSchema,
  lower: finiteNumberSchema,
  upper: finiteNumberSchema,
});

const rankingChangeRowSchema = z.object({
  change: finiteNumberSchema,
  location_id: positiveIntegerSchema,
});

const formatIssuePath = (issuePath: PropertyKey[]) =>
  issuePath.length === 0 ? "response" : issuePath.join(".");

export const formatSchemaValidationError = (
  resource: string,
  error: ZodError
) => {
  const issue = error.issues[0];

  if (!issue) {
    return `${resource} response validation failed`;
  }

  return `${resource} response validation failed at ${formatIssuePath(
    issue.path
  )}: ${issue.message}`;
};

export const parseTrendGraphRows = (rows: unknown) =>
  z.array(trendGraphRowSchema).parse(rows);

export const parseReferenceGraphRows = (rows: unknown) =>
  z.array(referenceGraphRowSchema).parse(rows);

export const parseForecastRows = (rows: unknown) =>
  z.array(forecastRowSchema).parse(rows);

export const parseHistoricalYearRows = (rows: unknown) =>
  z.array(historicalYearRowSchema).parse(rows);

export const parseLocationRows = (rows: unknown) =>
  z.array(locationRowSchema).parse(rows);

export const parseRankingPetRows = (rows: unknown) =>
  z.array(rankingPetRowSchema).parse(rows);

export const parseRankingLocationRows = (rows: unknown) =>
  z.array(rankingLocationRowSchema).parse(rows);

export const parseRankingPercentileRows = (rows: unknown) =>
  z.array(rankingPercentileRowSchema).parse(rows);

export const parseRankingForecastRows = (rows: unknown) =>
  z.array(rankingForecastRowSchema).parse(rows);

export const parseRankingChangeRows = (rows: unknown) =>
  z.array(rankingChangeRowSchema).parse(rows);

export const isSchemaValidationError = (error: unknown): error is ZodError =>
  error instanceof ZodError;
