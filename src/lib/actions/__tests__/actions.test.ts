import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  setForecastPreferences,
  setGraphMeasure,
  setGraphSeason,
  setRankingsHeatStress,
  setRankingsSeason,
  setRankingsState,
  setRankingsYear,
} from "../actions";

import type { GraphSeason } from "@/lib/constants";

vi.mock("next/headers", () => ({
  cookies: mockFn().mockResolvedValue({
    set: mockFn(),
  }),
}));

describe("setGraphMeasure", () => {
  let mockSet: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { cookies } = await import("next/headers");
    const cookiesResult = await cookies();
    mockSet = vi.mocked(cookiesResult.set);
  });

  it("sets the graph measure cookie with correct parameters", async () => {
    const measure = "max";

    await setGraphMeasure(measure);

    expect(mockSet).toHaveBeenCalledWith(
      "graph-measure",
      measure,
      expect.objectContaining({
        expires: expect.any(Date),
        httpOnly: true,
        path: "/",
        secure: false,
      }),
    );
  });

  it("ignores an invalid graph measure without setting a cookie", async () => {
    await setGraphMeasure("temperature");

    expect(mockSet).not.toHaveBeenCalled();
  });

  it("sets cookie with expiration date approximately 1 year from now", async () => {
    const measure = "avg";
    const beforeCall = Date.now();

    await setGraphMeasure(measure);

    expect(mockSet).toHaveBeenCalledWith(
      "graph-measure",
      measure,
      expect.objectContaining({
        expires: expect.any(Date),
        httpOnly: true,
        path: "/",
      }),
    );

    const call = mockSet.mock.calls[0];
    if (!call) {
      throw new Error("No call to mockSet found");
    }
    const cookieOptions = call[2];
    const expirationDate = cookieOptions.expires;
    const afterCall = Date.now();

    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const expectedExpiration = beforeCall + oneYearMs;
    const actualExpiration = expirationDate.getTime();

    expect(actualExpiration).toBeGreaterThanOrEqual(expectedExpiration - 1000);
    expect(actualExpiration).toBeLessThanOrEqual(afterCall + oneYearMs + 1000);
  });
});

describe("setGraphSeason", () => {
  let mockSet: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { cookies } = await import("next/headers");
    const cookiesResult = await cookies();
    mockSet = vi.mocked(cookiesResult.set);
  });

  it("sets the graph season cookie with correct parameters", async () => {
    await setGraphSeason("Winter");

    expect(mockSet).toHaveBeenCalledWith(
      "graph-season",
      "Winter",
      expect.objectContaining({
        expires: expect.any(Date),
        httpOnly: true,
        path: "/",
        secure: false,
      }),
    );
  });

  it("ignores an invalid graph season without setting a cookie", async () => {
    await setGraphSeason("Not A Season");

    expect(mockSet).not.toHaveBeenCalled();
  });
});

describe("setForecastPreferences", () => {
  let mockSet: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { cookies } = await import("next/headers");
    const cookiesResult = await cookies();
    mockSet = vi.mocked(cookiesResult.set);
  });

  it("sets both forecast cookies with correct values", async () => {
    await setForecastPreferences(true, 20);

    expect(mockSet).toHaveBeenNthCalledWith(
      1,
      "forecast-enabled",
      "true",
      expect.objectContaining({
        expires: expect.any(Date),
        httpOnly: true,
        path: "/",
      }),
    );
    expect(mockSet).toHaveBeenNthCalledWith(
      2,
      "forecast-years-ahead",
      "20",
      expect.objectContaining({
        expires: expect.any(Date),
        httpOnly: true,
        path: "/",
      }),
    );
  });

  it("uses a 1-year expiration window", async () => {
    const beforeCall = Date.now();

    await setForecastPreferences(false, 15);

    const call0 = mockSet.mock.calls[0];
    const call1 = mockSet.mock.calls[1];
    if (!call0 || !call1) {
      throw new Error("Expected two calls to mockSet");
    }
    const enabledCookieOptions = call0[2];
    const yearsCookieOptions = call1[2];
    const afterCall = Date.now();
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;

    expect(enabledCookieOptions.expires.getTime()).toBeGreaterThanOrEqual(
      beforeCall + oneYearMs - 1000,
    );
    expect(enabledCookieOptions.expires.getTime()).toBeLessThanOrEqual(
      afterCall + oneYearMs + 1000,
    );
    expect(yearsCookieOptions.expires.getTime()).toBeGreaterThanOrEqual(
      beforeCall + oneYearMs - 1000,
    );
    expect(yearsCookieOptions.expires.getTime()).toBeLessThanOrEqual(
      afterCall + oneYearMs + 1000,
    );
  });

  it.each([
    { description: "below the minimum", forecastYearsAhead: 1 },
    { description: "above the maximum", forecastYearsAhead: 1000 },
    { description: "a non-integer", forecastYearsAhead: 10.5 },
  ])(
    "ignores forecast years ahead $description without setting a cookie",
    async ({ forecastYearsAhead }) => {
      await setForecastPreferences(true, forecastYearsAhead);

      expect(mockSet).not.toHaveBeenCalled();
    },
  );
});

vi.mock("next/cache", () => ({
  revalidatePath: mockFn(),
}));

const rankingsCases = [
  {
    action: "setRankingsYear",
    cookieName: "rankings-year",
    cookieValue: "2020",
    invalidReason: "a year outside the configured range",
    setInvalid: () => setRankingsYear(1999),
    setValid: () => setRankingsYear(2020),
  },
  {
    action: "setRankingsState",
    cookieName: "rankings-state",
    cookieValue: "TX",
    invalidReason: "a state value with disallowed characters",
    setInvalid: () => setRankingsState("TX; DROP TABLE locations;"),
    setValid: () => setRankingsState("TX"),
  },
  {
    action: "setRankingsSeason",
    cookieName: "rankings-season",
    cookieValue: "Winter",
    invalidReason: "an invalid season",
    setInvalid: () => setRankingsSeason("Not A Season" as GraphSeason),
    setValid: () => setRankingsSeason("Winter"),
  },
  {
    action: "setRankingsHeatStress",
    cookieName: "rankings-heat-stress",
    cookieValue: "Moderate Heat Stress",
    invalidReason: "an unrecognized heat stress level",
    setInvalid: () => setRankingsHeatStress("Moderate"),
    setValid: () => setRankingsHeatStress("Moderate Heat Stress"),
  },
] as const;

describe("rankings preference actions", () => {
  let mockSet: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { cookies } = await import("next/headers");
    const cookiesResult = await cookies();
    mockSet = vi.mocked(cookiesResult.set);
  });

  it.each(rankingsCases)(
    "$action sets the $cookieName cookie with correct parameters",
    async ({ cookieName, cookieValue, setValid }) => {
      await setValid();

      expect(mockSet).toHaveBeenCalledWith(
        cookieName,
        cookieValue,
        expect.objectContaining({
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: false,
        }),
      );
    },
  );

  it.each(rankingsCases)(
    "$action calls revalidatePath with /rankings",
    async ({ setValid }) => {
      const { revalidatePath } = await import("next/cache");

      await setValid();

      expect(revalidatePath).toHaveBeenCalledWith("/rankings");
    },
  );

  it.each(rankingsCases)(
    "$action ignores $invalidReason without setting a cookie",
    async ({ setInvalid }) => {
      const { revalidatePath } = await import("next/cache");

      await setInvalid();

      expect(mockSet).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );

  it("setRankingsHeatStress allows clearing the filter with an empty string", async () => {
    await setRankingsHeatStress("");

    expect(mockSet).toHaveBeenCalledWith(
      "rankings-heat-stress",
      "",
      expect.any(Object),
    );
  });
});

describe("cookie security", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it.each([
    { description: "outside of e2e test runs", e2e: "false", secure: true },
    { description: "during e2e test runs", e2e: "true", secure: false },
  ])(
    "sets secure=$secure on cookies in production $description",
    async ({ e2e, secure }) => {
      vi.resetModules();
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_E2E_TEST", e2e);

      vi.doMock("next/headers", () => ({
        cookies: mockFn().mockResolvedValue({ set: mockFn() }),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: mockFn() }));

      const actionsModule = await import("../actions");
      const { cookies } = await import("next/headers");
      const cookiesResult = await cookies();
      const mockSet = vi.mocked(cookiesResult.set);

      await actionsModule.setGraphMeasure("avg");

      expect(mockSet).toHaveBeenCalledWith(
        "graph-measure",
        "avg",
        expect.objectContaining({ secure }),
      );
    },
  );
});
