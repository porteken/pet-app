import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCookies, mockFetchCityRankings, mockFetchLocations, mockRankingsMain } = vi.hoisted(
  () => ({
    mockCookies: vi.fn(),
    mockFetchCityRankings: vi.fn(),
    mockFetchLocations: vi.fn(),
    mockRankingsMain: vi.fn((_properties?: unknown) => (
      <div data-testid="rankings-main">Rankings</div>
    )),
  })
);

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

vi.mock("@/features/rankings", () => ({
  RankingsMain: mockRankingsMain,
}));

vi.mock("@/lib/api/fetch-server", () => ({
  FetchCityRankings: mockFetchCityRankings,
  FetchLocations: mockFetchLocations,
}));

import {
  RANKINGS_HEAT_STRESS_COOKIE_NAME,
  RANKINGS_STATE_COOKIE_NAME,
  RANKINGS_YEAR_COOKIE_NAME,
} from "@/lib/constants";

import RankingsPage, { metadata } from "../page";

const createCookieStore = (values: Partial<Record<string, string>>) => ({
  get: (name: string) => {
    const value = values[name];
    return value ? { value } : undefined;
  },
});

describe("rankings page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCityRankings.mockResolvedValue([
      {
        avg_pet: 35.5,
        city: "Phoenix",
        location_id: 1,
        rank: 1,
        state: "Arizona",
      },
    ]);
    mockFetchLocations.mockResolvedValue({
      LocationOptions: [
        {
          items: [{ key: 1, title: "Phoenix" }],
          title: "Arizona",
        },
      ],
    });
  });

  it("uses the search param year before the cookie year", async () => {
    mockCookies.mockResolvedValue(
      createCookieStore({
        [RANKINGS_HEAT_STRESS_COOKIE_NAME]: "severe",
        [RANKINGS_STATE_COOKIE_NAME]: "Arizona",
        [RANKINGS_YEAR_COOKIE_NAME]: "2027",
      })
    );

    render(
      await RankingsPage({
        searchParams: Promise.resolve({ measure: "avg", year: "2031" }),
      })
    );

    expect(metadata).toEqual({
      description: "City rankings by heat stress (PET) values",
      title: "City Rankings - Heat Stress Analysis",
    });
    expect(mockFetchCityRankings).toHaveBeenCalledWith(2031);
    expect(screen.getByTestId("rankings-main")).toBeInTheDocument();
    expect(mockRankingsMain).toHaveBeenCalledWith(
      {
        initialHeatStress: "severe",
        initialState: "Arizona",
        initialYear: 2031,
        LocationOptions: [
          {
            items: [{ key: 1, title: "Phoenix" }],
            title: "Arizona",
          },
        ],
        rankings: [
          {
            avg_pet: 35.5,
            city: "Phoenix",
            location_id: 1,
            rank: 1,
            state: "Arizona",
          },
        ],
      },
      undefined
    );
  });

  it("falls back to the cookie year when the search param is missing", async () => {
    mockCookies.mockResolvedValue(
      createCookieStore({
        [RANKINGS_YEAR_COOKIE_NAME]: "2028",
      })
    );

    render(
      await RankingsPage({
        searchParams: Promise.resolve({}),
      })
    );

    expect(mockFetchCityRankings).toHaveBeenCalledWith(2028);
    expect(mockRankingsMain).toHaveBeenCalledWith(
      expect.objectContaining({
        initialHeatStress: "",
        initialState: "",
        initialYear: 2028,
      }),
      undefined
    );
  });

  it("defaults to 2025 when neither search params nor cookies provide a year", async () => {
    mockCookies.mockResolvedValue(createCookieStore({}));

    render(
      await RankingsPage({
        searchParams: Promise.resolve({}),
      })
    );

    expect(mockFetchCityRankings).toHaveBeenCalledWith(2025);
    expect(mockRankingsMain).toHaveBeenCalledWith(
      expect.objectContaining({
        initialYear: 2025,
      }),
      undefined
    );
  });
});
