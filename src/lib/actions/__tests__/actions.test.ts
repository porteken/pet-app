import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  setForecastPreferences,
  setGraphMeasure,
  setGraphSeason,
  setRankingsHeatStress,
  setRankingsSeason,
  setRankingsState,
  setRankingsYear,
} from "../actions";

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
    const measure = "temperature";

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
  });

  it("sets cookie with expiration date approximately 1 year from now", async () => {
    const measure = "humidity";
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
      }),
    );
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
});

vi.mock("next/headers", () => ({
  cookies: mockFn().mockResolvedValue({
    set: mockFn(),
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockFn(),
}));

describe("setRankingsYear", () => {
  let mockSet: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { cookies } = await import("next/headers");
    const cookiesResult = await cookies();
    mockSet = vi.mocked(cookiesResult.set);
  });

  it("sets the rankings year cookie with correct parameters", async () => {
    await setRankingsYear(2020);

    expect(mockSet).toHaveBeenCalledWith(
      "rankings-year",
      "2020",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "strict",
      }),
    );
  });

  it("calls revalidatePath with /rankings", async () => {
    const { revalidatePath } = await import("next/cache");

    await setRankingsYear(2020);

    expect(revalidatePath).toHaveBeenCalledWith("/rankings");
  });
});

describe("setRankingsState", () => {
  let mockSet: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { cookies } = await import("next/headers");
    const cookiesResult = await cookies();
    mockSet = vi.mocked(cookiesResult.set);
  });

  it("sets the rankings state cookie with correct parameters", async () => {
    await setRankingsState("TX");

    expect(mockSet).toHaveBeenCalledWith(
      "rankings-state",
      "TX",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "strict",
      }),
    );
  });

  it("calls revalidatePath with /rankings", async () => {
    const { revalidatePath } = await import("next/cache");

    await setRankingsState("NY");

    expect(revalidatePath).toHaveBeenCalledWith("/rankings");
  });
});

describe("setRankingsSeason", () => {
  let mockSet: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { cookies } = await import("next/headers");
    const cookiesResult = await cookies();
    mockSet = vi.mocked(cookiesResult.set);
  });

  it("sets the rankings season cookie with correct parameters", async () => {
    await setRankingsSeason("Winter");

    expect(mockSet).toHaveBeenCalledWith(
      "rankings-season",
      "Winter",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "strict",
      }),
    );
  });

  it("calls revalidatePath with /rankings", async () => {
    const { revalidatePath } = await import("next/cache");

    await setRankingsSeason("Spring");

    expect(revalidatePath).toHaveBeenCalledWith("/rankings");
  });
});

describe("setRankingsHeatStress", () => {
  let mockSet: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { cookies } = await import("next/headers");
    const cookiesResult = await cookies();
    mockSet = vi.mocked(cookiesResult.set);
  });

  it("sets the rankings heat stress cookie with correct parameters", async () => {
    await setRankingsHeatStress("Moderate");

    expect(mockSet).toHaveBeenCalledWith(
      "rankings-heat-stress",
      "Moderate",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "strict",
      }),
    );
  });

  it("calls revalidatePath with /rankings", async () => {
    const { revalidatePath } = await import("next/cache");

    await setRankingsHeatStress("Strong");

    expect(revalidatePath).toHaveBeenCalledWith("/rankings");
  });
});
