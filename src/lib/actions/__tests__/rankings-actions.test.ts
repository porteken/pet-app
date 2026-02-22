import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  setRankingsHeatStress,
  setRankingsState,
  setRankingsYear,
} from "../rankings-actions";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
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
      })
    );
  });

  it("handles different year values correctly", async () => {
    const years = [2000, 2010, 2025];

    for (const year of years) {
      mockSet.mockClear();
      await setRankingsYear(year);

      expect(mockSet).toHaveBeenCalledWith(
        "rankings-year",
        String(year),
        expect.objectContaining({
          httpOnly: true,
          path: "/",
          sameSite: "strict",
        })
      );
    }
  });

  it("converts year number to string for cookie value", async () => {
    await setRankingsYear(2015);

    const cookieValue = mockSet.mock.calls[0][1];
    expect(typeof cookieValue).toBe("string");
    expect(cookieValue).toBe("2015");
  });

  it("sets httpOnly flag to true for security", async () => {
    await setRankingsYear(2020);

    const cookieOptions = mockSet.mock.calls[0][2];
    expect(cookieOptions.httpOnly).toBe(true);
  });

  it("sets path to root", async () => {
    await setRankingsYear(2020);

    const cookieOptions = mockSet.mock.calls[0][2];
    expect(cookieOptions.path).toBe("/");
  });

  it("sets sameSite to strict", async () => {
    await setRankingsYear(2020);

    const cookieOptions = mockSet.mock.calls[0][2];
    expect(cookieOptions.sameSite).toBe("strict");
  });

  it("uses correct cookie name", async () => {
    await setRankingsYear(2020);

    const cookieName = mockSet.mock.calls[0][0];
    expect(cookieName).toBe("rankings-year");
  });

  it("calls revalidatePath with /rankings", async () => {
    const { revalidatePath } = await import("next/cache");

    await setRankingsYear(2020);

    expect(revalidatePath).toHaveBeenCalledWith("/rankings");
  });

  it("awaits cookies() call", async () => {
    const { cookies } = await import("next/headers");
    const cookiesSpy = vi.mocked(cookies);

    cookiesSpy.mockClear();

    await setRankingsYear(2020);

    expect(cookiesSpy).toHaveBeenCalledWith();
    expect(cookiesSpy).toHaveBeenCalledTimes(1);
  });

  it("handles multiple sequential calls", async () => {
    await setRankingsYear(2000);
    await setRankingsYear(2010);
    await setRankingsYear(2025);

    expect(mockSet).toHaveBeenCalledTimes(3);

    expect(mockSet).toHaveBeenNthCalledWith(
      1,
      "rankings-year",
      "2000",
      expect.any(Object)
    );

    expect(mockSet).toHaveBeenNthCalledWith(
      2,
      "rankings-year",
      "2010",
      expect.any(Object)
    );

    expect(mockSet).toHaveBeenNthCalledWith(
      3,
      "rankings-year",
      "2025",
      expect.any(Object)
    );
  });

  it("handles edge case years", async () => {
    await setRankingsYear(2000);
    expect(mockSet).toHaveBeenCalledWith(
      "rankings-year",
      "2000",
      expect.any(Object)
    );

    mockSet.mockClear();

    await setRankingsYear(2025);
    expect(mockSet).toHaveBeenCalledWith(
      "rankings-year",
      "2025",
      expect.any(Object)
    );
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
      })
    );
  });

  it("uses correct cookie name", async () => {
    await setRankingsState("CA");

    const cookieName = mockSet.mock.calls[0][0];
    expect(cookieName).toBe("rankings-state");
  });

  it("calls revalidatePath with /rankings", async () => {
    const { revalidatePath } = await import("next/cache");

    await setRankingsState("NY");

    expect(revalidatePath).toHaveBeenCalledWith("/rankings");
  });

  it("handles empty string for clearing filter", async () => {
    await setRankingsState("");

    expect(mockSet).toHaveBeenCalledWith(
      "rankings-state",
      "",
      expect.any(Object)
    );
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
      })
    );
  });

  it("uses correct cookie name", async () => {
    await setRankingsHeatStress("Extreme");

    const cookieName = mockSet.mock.calls[0][0];
    expect(cookieName).toBe("rankings-heat-stress");
  });

  it("calls revalidatePath with /rankings", async () => {
    const { revalidatePath } = await import("next/cache");

    await setRankingsHeatStress("Strong");

    expect(revalidatePath).toHaveBeenCalledWith("/rankings");
  });

  it("handles empty string for clearing filter", async () => {
    await setRankingsHeatStress("");

    expect(mockSet).toHaveBeenCalledWith(
      "rankings-heat-stress",
      "",
      expect.any(Object)
    );
  });
});
