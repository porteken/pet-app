import { describe, expect, it } from "vitest";

import { DEFAULT_PET_BASIS, normalizePetBasis } from "../constants";

describe("normalizePetBasis", () => {
  it.each(["max", "avg"] as const)(
    "passes through a valid basis %s",
    (basis) => {
      expect(normalizePetBasis(basis)).toBe(basis);
    },
  );

  it("falls back to the default basis for an unrecognized value", () => {
    expect(normalizePetBasis("median")).toBe(DEFAULT_PET_BASIS);
  });

  it("falls back to the default basis when undefined", () => {
    const [value] = [] as string[];
    expect(normalizePetBasis(value)).toBe(DEFAULT_PET_BASIS);
  });
});
