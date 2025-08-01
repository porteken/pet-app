import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OptimizedMarker } from "../optimized-marker";

// Mock the prefetch function
vi.mock("@/lib/api/query-client", () => ({
  prefetchTrendGraphData: vi.fn(),
}));

// Mock marker component
const MockMarkerComponent = vi.fn(({ eventHandlers, icon, position }) => (
  <div
    data-icon={JSON.stringify(icon)}
    data-position={JSON.stringify(position)}
    data-testid="marker"
    onClick={eventHandlers?.click}
    onKeyDown={eventHandlers?.click}
    onMouseEnter={eventHandlers?.mouseover}
    role="button"
    tabIndex={0}
  />
));

describe("OptimizedMarker", () => {
  const mockProperties = {
    icon: { iconUrl: "test-icon.png" },
    locationId: 123,
    MarkerComponent: MockMarkerComponent,
    onClick: vi.fn(),
    position: [40.7128, -74.006] as [number, number],
    selectedGraphMeasure: "temperature",
  };

  let mockPrefetchTrendGraphData: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { prefetchTrendGraphData } = await import("@/lib/api/query-client");
    mockPrefetchTrendGraphData = vi.mocked(prefetchTrendGraphData);
  });

  it("renders marker component with correct props", () => {
    render(<OptimizedMarker {...mockProperties} />);

    const marker = screen.getByTestId("marker");
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveAttribute(
      "data-position",
      JSON.stringify(mockProperties.position)
    );
    expect(marker).toHaveAttribute(
      "data-icon",
      JSON.stringify(mockProperties.icon)
    );
  });

  it("calls onClick with locationId when marker is clicked", async () => {
    const user = userEvent.setup();
    render(<OptimizedMarker {...mockProperties} />);

    const marker = screen.getByTestId("marker");
    await user.click(marker);

    expect(mockProperties.onClick).toHaveBeenCalledWith(
      mockProperties.locationId
    );
  });

  it("prefetches data on mouse enter", async () => {
    const user = userEvent.setup();
    render(<OptimizedMarker {...mockProperties} />);

    const marker = screen.getByTestId("marker");
    await user.hover(marker);

    expect(mockPrefetchTrendGraphData).toHaveBeenCalledWith(
      mockProperties.locationId,
      mockProperties.selectedGraphMeasure
    );
  });

  it("handles multiple hover events correctly", async () => {
    const user = userEvent.setup();
    render(<OptimizedMarker {...mockProperties} />);

    const marker = screen.getByTestId("marker");

    // Hover multiple times - each should trigger prefetch
    await user.hover(marker);
    await user.unhover(marker);
    await user.hover(marker);
    await user.unhover(marker);
    await user.hover(marker);

    // Since useCallback dependencies don't change, the same function is used
    // but each hover event should still trigger the prefetch
    expect(mockPrefetchTrendGraphData).toHaveBeenCalledTimes(3);
    expect(mockPrefetchTrendGraphData).toHaveBeenCalledWith(
      mockProperties.locationId,
      mockProperties.selectedGraphMeasure
    );
  });

  it("creates new component instance when selectedGraphMeasure changes", () => {
    const { rerender } = render(<OptimizedMarker {...mockProperties} />);

    // Component renders initially
    expect(MockMarkerComponent).toHaveBeenCalledTimes(1);

    // Rerender with different selectedGraphMeasure - should trigger re-render due to dependency change
    rerender(
      <OptimizedMarker {...mockProperties} selectedGraphMeasure="humidity" />
    );

    // Component should re-render because selectedGraphMeasure is a useCallback dependency
    expect(MockMarkerComponent).toHaveBeenCalledTimes(2);
  });

  it("creates new component instance when locationId changes", () => {
    const { rerender } = render(<OptimizedMarker {...mockProperties} />);

    // Component renders initially
    expect(MockMarkerComponent).toHaveBeenCalledTimes(1);

    // Rerender with different locationId - should trigger re-render due to dependency change
    rerender(<OptimizedMarker {...mockProperties} locationId={456} />);

    // Component should re-render because locationId is a useCallback dependency
    expect(MockMarkerComponent).toHaveBeenCalledTimes(2);
  });

  it("memoizes component correctly", () => {
    const { rerender } = render(<OptimizedMarker {...mockProperties} />);

    expect(MockMarkerComponent).toHaveBeenCalledTimes(1);

    // Rerender with same props - should be memoized
    rerender(<OptimizedMarker {...mockProperties} />);

    expect(MockMarkerComponent).toHaveBeenCalledTimes(1);
  });

  it("re-renders when props change", () => {
    const { rerender } = render(<OptimizedMarker {...mockProperties} />);

    expect(MockMarkerComponent).toHaveBeenCalledTimes(1);

    // Rerender with different props - should re-render
    rerender(<OptimizedMarker {...mockProperties} locationId={456} />);

    expect(MockMarkerComponent).toHaveBeenCalledTimes(2);
  });

  it("passes all event handlers to marker component", () => {
    render(<OptimizedMarker {...mockProperties} />);

    // Check that the mock was called with the expected arguments
    expect(MockMarkerComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventHandlers: expect.objectContaining({
          click: expect.any(Function),
          mouseover: expect.any(Function),
        }),
        icon: mockProperties.icon,
        position: mockProperties.position,
      }),
      undefined // React ref/context is undefined in this case
    );
  });

  it("handles onClick prop changes", async () => {
    const user = userEvent.setup();
    const newOnClick = vi.fn();

    const { rerender } = render(<OptimizedMarker {...mockProperties} />);

    const marker = screen.getByTestId("marker");
    await user.click(marker);

    expect(mockProperties.onClick).toHaveBeenCalledWith(
      mockProperties.locationId
    );
    expect(newOnClick).not.toHaveBeenCalled();

    // Change onClick prop
    rerender(<OptimizedMarker {...mockProperties} onClick={newOnClick} />);

    await user.click(marker);

    expect(newOnClick).toHaveBeenCalledWith(mockProperties.locationId);
  });

  it("has correct display name", () => {
    expect(OptimizedMarker.displayName).toBe("OptimizedMarker");
  });
});
