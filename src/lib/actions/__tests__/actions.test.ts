import { beforeEach, describe, expect, it, vi } from "vitest";

import { setGraphMeasure } from "../actions";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
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
      })
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
      })
    );

    const callArguments = mockSet.mock.calls[0];
    const cookieOptions = callArguments[2];
    const expirationDate = cookieOptions.expires;
    const afterCall = Date.now();

    const oneYearMs = 365 * 24 * 60 * 1 * 1000;
    const expectedExpiration = beforeCall + oneYearMs;
    const actualExpiration = expirationDate.getTime();

    expect(actualExpiration).toBeGreaterThanOrEqual(expectedExpiration - 1000);
    expect(actualExpiration).toBeLessThanOrEqual(afterCall + oneYearMs + 1000);
  });

  it("handles different measure values correctly", async () => {
    const measures = ["temperature", "humidity", "pressure", "wind_speed"];

    for (const measure of measures) {
      mockSet.mockClear();
      await setGraphMeasure(measure);

      expect(mockSet).toHaveBeenCalledWith(
        "graph-measure",
        measure,
        expect.objectContaining({
          expires: expect.any(Date),
          httpOnly: true,
          path: "/",
        })
      );
    }
  });

  it("handles empty string measure", async () => {
    const measure = "";

    await setGraphMeasure(measure);

    expect(mockSet).toHaveBeenCalledWith(
      "graph-measure",
      "",
      expect.objectContaining({
        expires: expect.any(Date),
        httpOnly: true,
        path: "/",
      })
    );
  });

  it("handles special characters in measure", async () => {
    const measure = "temperature-celsius_2024";

    await setGraphMeasure(measure);

    expect(mockSet).toHaveBeenCalledWith(
      "graph-measure",
      measure,
      expect.objectContaining({
        expires: expect.any(Date),
        httpOnly: true,
        path: "/",
      })
    );
  });

  it("sets httpOnly flag to true for security", async () => {
    const measure = "temperature";

    await setGraphMeasure(measure);

    const callArguments = mockSet.mock.calls[0];
    const cookieOptions = callArguments[2];

    expect(cookieOptions.httpOnly).toBe(true);
  });

  it("sets path to root", async () => {
    const measure = "temperature";

    await setGraphMeasure(measure);

    const callArguments = mockSet.mock.calls[0];
    const cookieOptions = callArguments[2];

    expect(cookieOptions.path).toBe("/");
  });

  it("uses correct cookie name", async () => {
    const measure = "temperature";

    await setGraphMeasure(measure);

    const callArguments = mockSet.mock.calls[0];
    const cookieName = callArguments[0];

    expect(cookieName).toBe("graph-measure");
  });

  it("handles multiple sequential calls", async () => {
    await setGraphMeasure("temperature");
    await setGraphMeasure("humidity");
    await setGraphMeasure("pressure");

    expect(mockSet).toHaveBeenCalledTimes(3);

    expect(mockSet).toHaveBeenNthCalledWith(
      1,
      "graph-measure",
      "temperature",
      expect.any(Object)
    );

    expect(mockSet).toHaveBeenNthCalledWith(
      2,
      "graph-measure",
      "humidity",
      expect.any(Object)
    );

    expect(mockSet).toHaveBeenNthCalledWith(
      3,
      "graph-measure",
      "pressure",
      expect.any(Object)
    );
  });

  it("awaits cookies() call", async () => {
    const { cookies } = await import("next/headers");
    const cookiesSpy = vi.mocked(cookies);

    cookiesSpy.mockClear();

    await setGraphMeasure("temperature");

    expect(cookiesSpy).toHaveBeenCalledWith();
    expect(cookiesSpy).toHaveBeenCalledTimes(1);
  });
});
