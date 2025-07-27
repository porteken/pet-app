import { beforeEach, describe, expect, it, vi } from "vitest";

import { reloadPage } from "../reload";

describe("Reload Utility", () => {
  beforeEach(() => {
    // Mock globalThis.location.reload
    Object.defineProperty(globalThis, "location", {
      value: {
        reload: vi.fn(),
      },
      writable: true,
    });
  });

  it("should call globalThis.location.reload", () => {
    reloadPage();

    expect(globalThis.location.reload).toHaveBeenCalledOnce();
  });

  it("should call reload without arguments", () => {
    reloadPage();

    expect(globalThis.location.reload).toHaveBeenCalledWith();
  });
});
