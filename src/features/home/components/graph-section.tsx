import { Button, Loader, Select } from "@mantine/core";
import React, { memo, useMemo } from "react";

interface GraphSectionProperties {
  graphLoading: boolean;
  onSelectChange: (value: string) => void;
  petGraph?: React.ReactElement;
  selectedGraphMeasure: string;
  selectedLocation?: {
    city: string;
    location_id: number;
    state: string;
  };
  selectOptions: Array<{ label: string; value: string }>;
}

// Memoized component to prevent unnecessary re-renders
export const GraphSection = memo<GraphSectionProperties>(
  ({
    graphLoading,
    onSelectChange,
    petGraph,
    selectedGraphMeasure,
    selectedLocation,
    selectOptions,
  }) => {
    // Memoize the loading state UI to prevent recreation on every render
    const loadingUI = useMemo(
      () => (
        <div className="flex size-full flex-col items-center justify-center">
          <Loader size="md" />
          <span className="mt-2 text-gray-500">Loading graph...</span>
        </div>
      ),
      []
    );

    // Memoize the button component to prevent recreation when location doesn't change
    const detailsButton = useMemo(() => {
      if (!selectedLocation) {
        return;
      }

      return (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              globalThis.location.href = `/${selectedLocation.location_id}`;
            }}
            variant="filled"
          >
            View Full Details
          </Button>
        </div>
      );
    }, [selectedLocation]);

    // Memoize the graph content area to prevent unnecessary re-renders
    const graphContent = useMemo(
      () => (
        <div className="flex min-h-[300px] w-full max-w-4xl items-center justify-center">
          {graphLoading ? loadingUI : petGraph}
        </div>
      ),
      [graphLoading, loadingUI, petGraph]
    );
    return (
      <div className="flex min-h-[340px] w-full max-w-[90vw] min-w-[320px] flex-col items-center space-y-4">
        <div className="w-full max-w-md">
          <Select
            className="w-full"
            data={selectOptions}
            label="Measure"
            onChange={value => onSelectChange(value!)}
            size="sm"
            value={selectedGraphMeasure}
          />
        </div>
        {graphContent}
        {detailsButton}
      </div>
    );
  }
);

GraphSection.displayName = "GraphSection";
