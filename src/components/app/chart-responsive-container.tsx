"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";

interface ChartResponsiveContainerProperties {
  children: React.ReactElement;
  className?: string;
  minHeight?: number;
  minWidth?: number;
}

const hasPositiveSize = (width: number, height: number): boolean =>
  width > 0 && height > 0;

export const ChartResponsiveContainer = ({
  children,
  className,
  minHeight = 0,
  minWidth = 0,
}: ChartResponsiveContainerProperties): React.ReactElement => {
  const containerReference = React.useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = React.useState(false);
  const containerClassName = ["size-full", "min-h-0", "min-w-0", className]
    .filter(Boolean)
    .join(" ");

  React.useEffect(() => {
    const container = containerReference.current;
    if (!container) {
      return () => {};
    }

    if (
      process.env.NODE_ENV === "test" ||
      typeof globalThis.ResizeObserver !== "function"
    ) {
      setIsReady(true);
      return () => {};
    }

    const updateReadiness = (width: number, height: number) => {
      setIsReady(hasPositiveSize(width, height));
    };

    const measureContainer = () => {
      const { height, width } = container.getBoundingClientRect();
      updateReadiness(width, height);
    };

    measureContainer();

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        measureContainer();
        return;
      }

      updateReadiness(entry.contentRect.width, entry.contentRect.height);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={containerClassName} ref={containerReference}>
      {isReady ? (
        <ResponsiveContainer
          height="100%"
          minHeight={minHeight}
          minWidth={minWidth}
          width="100%"
        >
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
};
