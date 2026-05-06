import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OptimizedMarker } from "../components/optimized-marker";

import type { Icon } from "leaflet";

const mockQueryClient = {
  prefetchQuery: mockFn(),
};

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => mockQueryClient,
}));

vi.mock("@/lib/api/query-client", () => ({
  prefetchTrendGraphData: mockFn(),
}));

const MockMarkerComponent = mockFn(
  ({
    eventHandlers,
    icon,
    position,
  }: {
    eventHandlers?: { click?: () => void; mouseover?: () => void };
    icon: unknown;
    position: unknown;
  }) => (
    <button
      data-icon={JSON.stringify(icon)}
      data-position={JSON.stringify(position)}
      data-testid="marker"
      onClick={eventHandlers?.click}
      onMouseEnter={eventHandlers?.mouseover}
      type="button"
    />
  ),
);

const mockPosition: [number, number] = [40.7128, -74.006];

describe("optimizedMarker", () => {
  const mockProperties: React.ComponentProps<typeof OptimizedMarker> = {
    icon: { iconUrl: "test-icon.png" } as unknown as Icon,
    latitude: mockPosition[0],
    longitude: mockPosition[1],
    locationId: 123,
    MarkerComponent: MockMarkerComponent,
    onClick: mockFn(),
    selectedGraphMeasure: "temperature",
    selectedGraphSeason: "Annual",
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
      JSON.stringify(mockPosition),
    );
    expect(marker).toHaveAttribute(
      "data-icon",
      JSON.stringify(mockProperties.icon),
    );
  });

  it("calls onClick with locationId when marker is clicked", async () => {
    const user = userEvent.setup();
    render(<OptimizedMarker {...mockProperties} />);

    const marker = screen.getByTestId("marker");
    await user.click(marker);

    expect(mockProperties.onClick).toHaveBeenCalledWith(
      mockProperties.locationId,
    );
  });

  it("prefetches data on mouse enter", async () => {
    const user = userEvent.setup();
    render(<OptimizedMarker {...mockProperties} />);

    const marker = screen.getByTestId("marker");
    await user.hover(marker);

    expect(mockPrefetchTrendGraphData).toHaveBeenCalledWith(
      mockQueryClient,
      mockProperties.locationId,
      mockProperties.selectedGraphMeasure,
      mockProperties.selectedGraphSeason,
    );
  });

  it("handles multiple hover events correctly", async () => {
    const user = userEvent.setup();
    render(<OptimizedMarker {...mockProperties} />);

    const marker = screen.getByTestId("marker");

    await user.hover(marker);
    await user.unhover(marker);
    await user.hover(marker);
    await user.unhover(marker);
    await user.hover(marker);

    expect(mockPrefetchTrendGraphData).toHaveBeenCalledTimes(3);
    expect(mockPrefetchTrendGraphData).toHaveBeenCalledWith(
      mockQueryClient,
      mockProperties.locationId,
      mockProperties.selectedGraphMeasure,
      mockProperties.selectedGraphSeason,
    );
  });

  it("creates new component instance when selectedGraphMeasure changes", () => {
    const { rerender } = render(<OptimizedMarker {...mockProperties} />);

    expect(MockMarkerComponent).toHaveBeenCalledTimes(1);

    rerender(
      <OptimizedMarker {...mockProperties} selectedGraphMeasure="humidity" />,
    );

    expect(MockMarkerComponent).toHaveBeenCalledTimes(2);
  });

  it("creates new component instance when locationId changes", () => {
    const { rerender } = render(<OptimizedMarker {...mockProperties} />);

    expect(MockMarkerComponent).toHaveBeenCalledTimes(1);

    rerender(<OptimizedMarker {...mockProperties} locationId={456} />);

    expect(MockMarkerComponent).toHaveBeenCalledTimes(2);
  });

  it("memoizes component correctly", () => {
    const { rerender } = render(<OptimizedMarker {...mockProperties} />);

    expect(MockMarkerComponent).toHaveBeenCalledTimes(1);

    rerender(<OptimizedMarker {...mockProperties} />);

    expect(MockMarkerComponent).toHaveBeenCalledTimes(1);
  });

  it("re-renders when props change", () => {
    const { rerender } = render(<OptimizedMarker {...mockProperties} />);

    expect(MockMarkerComponent).toHaveBeenCalledTimes(1);

    rerender(<OptimizedMarker {...mockProperties} locationId={456} />);

    expect(MockMarkerComponent).toHaveBeenCalledTimes(2);
  });

  it("passes all event handlers to marker component", () => {
    render(<OptimizedMarker {...mockProperties} />);

    expect(MockMarkerComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventHandlers: expect.objectContaining({
          click: expect.any(Function),
          mouseover: expect.any(Function),
        }),
        icon: mockProperties.icon,
        position: mockPosition,
      }),
      undefined,
    );
  });

  it("handles onClick prop changes", async () => {
    const user = userEvent.setup();
    const newOnClick = mockFn();

    const { rerender } = render(<OptimizedMarker {...mockProperties} />);

    const marker = screen.getByTestId("marker");
    await user.click(marker);

    expect(mockProperties.onClick).toHaveBeenCalledWith(
      mockProperties.locationId,
    );
    expect(newOnClick).not.toHaveBeenCalled();

    rerender(<OptimizedMarker {...mockProperties} onClick={newOnClick} />);

    await user.click(marker);

    expect(newOnClick).toHaveBeenCalledWith(mockProperties.locationId);
  });

  it("has correct display name", () => {
    expect(OptimizedMarker.displayName).toBe("OptimizedMarker");
  });
});
