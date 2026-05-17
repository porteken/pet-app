"use client";

import { ChartResponsiveContainer } from "@/components/app/chart-responsive-container";
import {
  DEFAULT_GRAPH_SEASON,
  GRAPH_COLORS,
  GRAPH_CONFIG,
  type GraphSeason,
} from "@/lib/constants";
import * as React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendForecastData {
  forecastValues: number[];
  forecastYears: number[];
  lowerBound10: number[];
  upperBound90: number[];
}

interface GenerateTrendGraphOptions {
  forecastData?: TrendForecastData;
  increasePerYear: number;
  isMobileViewport?: boolean;
  option: string;
  season?: GraphSeason;
  showLegend?: boolean;
  trendlinePets: number[];
  useCompactDesktopHeight?: boolean;
  yearPets: number[];
  years: number[];
}

interface GenerateReferenceGraphOptions {
  currentPets: number[];
  currentYear?: number;
  dates: Date[];
  isMobileViewport?: boolean;
  referencePets: number[];
  referenceYear: string;
  season?: GraphSeason;
  showLegend?: boolean;
}

interface ChartShellProperties {
  children?: React.ReactNode;
  emptyState: string;
  subtitle?: string;
  title: string;
  useCompactDesktopHeight?: boolean;
}

interface ChartTooltipPayload {
  color?: string;
  dataKey?: string;
  name?: string;
  payload: Record<string, unknown>;
  value?: number;
}

interface ChartTooltipProperties {
  active?: boolean;
  label?: number | string;
  payload?: ChartTooltipPayload[];
}

interface ReferenceChartPoint {
  currentPet?: number;
  label: string;
  referencePet?: number;
  tooltipLabel: string;
}

interface TrendChartPoint {
  confidenceFloor?: number;
  confidenceHigh?: number;
  confidenceLow?: number;
  confidenceSpan?: number;
  forecast?: number;
  pet?: number;
  tooltipLabel: string;
  trendline?: number;
  year: number;
}

interface ChartMarginOptions {
  isMobileViewport: boolean;
  showLegend: boolean;
}

interface GraphLegendProperties {
  showLegend: boolean;
}

interface TrendForecastSeriesProperties {
  forecastData?: TrendForecastData;
  shouldAnimate: boolean;
}

interface TrendChartBodyProperties {
  chartData: TrendChartPoint[];
  forecastData?: TrendForecastData;
  graphType: string;
  isMobileViewport: boolean;
  season: GraphSeason;
  shouldAnimate: boolean;
  showLegend: boolean;
}

interface ReferenceChartBodyProperties {
  chartData: ReferenceChartPoint[];
  currentYear: number;
  isMobileViewport: boolean;
  referenceYear: string;
  season: GraphSeason;
  shouldAnimate: boolean;
  showLegend: boolean;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const PET_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 1,
});

const CHART_DOMAIN = ["dataMin", "dataMax"];
const TOOLTIP_CURSOR_STYLE = { stroke: GRAPH_COLORS.grid };
const LEGEND_WRAPPER_STYLE = { paddingTop: "0.75rem" };
const TOOLTIP_CONTAINER_STYLE = {
  background: GRAPH_COLORS.tooltipBackground,
  borderColor: GRAPH_COLORS.tooltipBorder,
};
const TICK_FONT_SIZE_MOBILE = 12;
const TICK_FONT_SIZE_DESKTOP = 13;
const DOT_RADIUS_MOBILE = 2.5;
const DOT_RADIUS_DESKTOP = 3;
const TICK_COUNT_MOBILE = 6;
const TICK_COUNT_DESKTOP = 8;
const Y_AXIS_WIDTH_MOBILE = 42;
const Y_AXIS_WIDTH_DESKTOP = 56;
const MARGIN_TOP = 8;
const MARGIN_BOTTOM_WITH_LEGEND = 4;
const MARGIN_LEFT_MOBILE = -18;
const MARGIN_LEFT_DESKTOP = -10;
const MARGIN_RIGHT_MOBILE = 4;
const MARGIN_RIGHT_DESKTOP = 12;
const MIN_TICK_GAP_REFERENCE_MOBILE = 28;
const MIN_TICK_GAP_REFERENCE_DESKTOP = 16;
const Y_AXIS_STEP = 2;
const Y_AXIS_LOWER_PADDING = 2;
const Y_AXIS_UPPER_PADDING = 1;

const getActiveDotStyle = (color: string) => ({
  fill: color,
  r: 4,
  stroke: color,
  strokeWidth: 1.5,
});

const TREND_ACTIVE_DOT = getActiveDotStyle(GRAPH_COLORS.primary);
const REF_CURRENT_ACTIVE_DOT = getActiveDotStyle(GRAPH_COLORS.primary);
const REF_REFERENCE_ACTIVE_DOT = getActiveDotStyle(GRAPH_COLORS.secondary);

const formatYAxisTick = (value: number) => `${value.toFixed(0)}°`;
const formatLegendLabel = (value: string) => (
  <span className="text-foreground/80 text-xs font-medium">{value}</span>
);

const getGraphFillHeightClass = (useCompactDesktopHeight: boolean): string =>
  useCompactDesktopHeight
    ? "h-full min-h-[clamp(220px,42vh,520px)] sm:min-h-[clamp(300px,45vh,500px)]"
    : "h-full min-h-[clamp(220px,42vh,520px)] sm:min-h-[clamp(450px,70vh,850px)]";

const formatPetValue = (value?: number): string => {
  if (value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${PET_FORMATTER.format(value)}°C`;
};

const shouldAnimateCharts = (): boolean => {
  if (typeof globalThis.matchMedia !== "function") {
    return true;
  }

  return !globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const useInitialChartAnimation = (): boolean => {
  const animationsAllowed = React.useMemo(() => shouldAnimateCharts(), []);
  const hasRenderedRef = React.useRef(false);

  React.useEffect(() => {
    hasRenderedRef.current = true;
  }, []);

  return animationsAllowed && !hasRenderedRef.current;
};

const buildReferenceChartData = (
  dates: Date[],
  currentPets: number[],
  referencePets: number[],
): ReferenceChartPoint[] =>
  dates.map((date, index) => ({
    currentPet: currentPets[index],
    label: DATE_FORMATTER.format(date),
    referencePet: referencePets[index],
    tooltipLabel: DATE_FORMATTER.format(date),
  }));

const buildTrendChartData = (
  years: number[],
  yearPets: number[],
  trendlinePets: number[],
  forecastData?: TrendForecastData,
): TrendChartPoint[] => {
  const pointMap = new Map<number, TrendChartPoint>(
    years.map((year, index) => [
      year,
      {
        pet: yearPets[index],
        tooltipLabel: String(year),
        trendline: trendlinePets[index],
        year,
      },
    ]),
  );

  if (!forecastData || forecastData.forecastYears.length === 0) {
    return [...pointMap.values()].toSorted((a, b) => a.year - b.year);
  }

  const lastHistoricalYear = years.at(-1);
  const lastHistoricalPet = yearPets.at(-1);

  if (lastHistoricalYear === undefined || lastHistoricalPet === undefined) {
    return [...pointMap.values()].toSorted((a, b) => a.year - b.year);
  }

  const forecastPoints: TrendChartPoint[] = [
    {
      confidenceFloor: lastHistoricalPet,
      confidenceHigh: lastHistoricalPet,
      confidenceLow: lastHistoricalPet,
      confidenceSpan: 0,
      forecast: lastHistoricalPet,
      tooltipLabel: String(lastHistoricalYear),
      year: lastHistoricalYear,
    },
    ...forecastData.forecastYears.map((year, index) => {
      const confidenceLow = forecastData.lowerBound10[index];
      const confidenceHigh = forecastData.upperBound90[index];

      return {
        confidenceFloor: confidenceLow,
        confidenceHigh,
        confidenceLow,
        confidenceSpan:
          confidenceLow !== undefined && confidenceHigh !== undefined
            ? confidenceHigh - confidenceLow
            : undefined,
        forecast: forecastData.forecastValues[index],
        tooltipLabel: String(year),
        year,
      } satisfies TrendChartPoint;
    }),
  ];

  for (const forecastPoint of forecastPoints) {
    pointMap.set(forecastPoint.year, {
      ...pointMap.get(forecastPoint.year),
      ...forecastPoint,
    });
  }

  return [...pointMap.values()].toSorted((a, b) => a.year - b.year);
};

const getChartMargin = ({
  isMobileViewport,
  showLegend,
}: ChartMarginOptions) => ({
  bottom: showLegend ? MARGIN_BOTTOM_WITH_LEGEND : 0,
  left: isMobileViewport ? MARGIN_LEFT_MOBILE : MARGIN_LEFT_DESKTOP,
  right: isMobileViewport ? MARGIN_RIGHT_MOBILE : MARGIN_RIGHT_DESKTOP,
  top: MARGIN_TOP,
});

const hasTrendGraphData = (
  years: number[],
  yearPets: number[],
  trendlinePets: number[],
): boolean =>
  years.length > 0 && yearPets.length > 0 && trendlinePets.length > 0;

const hasReferenceGraphData = (
  dates: Date[],
  currentPets: number[],
  referencePets: number[],
): boolean =>
  dates.length > 0 && referencePets.length > 0 && currentPets.length > 0;

const roundDownToStep = (value: number, step: number): number =>
  Math.floor(value / step) * step;

const roundUpToStep = (value: number, step: number): number =>
  Math.ceil(value / step) * step;

const getYAxisDomain = (values: (number | undefined)[]): [number, number] => {
  const numericValues = values.filter(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value),
  );

  if (numericValues.length === 0) {
    return [0, Y_AXIS_STEP];
  }

  const dataMin = Math.min(...numericValues);
  const dataMax = Math.max(...numericValues);
  const lowerBound = roundDownToStep(
    dataMin - Y_AXIS_LOWER_PADDING,
    Y_AXIS_STEP,
  );
  const upperBound = roundUpToStep(dataMax + Y_AXIS_UPPER_PADDING, Y_AXIS_STEP);

  if (lowerBound === upperBound) {
    return [lowerBound, upperBound + Y_AXIS_STEP];
  }

  return [lowerBound, upperBound];
};

const getTrendGraphType = (option: string): string =>
  option === GRAPH_CONFIG.TREND_OPTIONS.AVG ? "Average" : "Maximum";

const formatIncreasePerYearText = (increasePerYear: number): string =>
  increasePerYear >= 0
    ? `+${increasePerYear.toFixed(2)}`
    : increasePerYear.toFixed(2);

const ChartShell = ({
  children,
  emptyState,
  subtitle,
  title,
  useCompactDesktopHeight = false,
}: ChartShellProperties): React.ReactElement => (
  <div
    className={`${getGraphFillHeightClass(useCompactDesktopHeight)} w-full min-w-0`}
  >
    <div className="graph-surface-panel flex h-full min-w-0 flex-col rounded-2xl p-3 sm:p-4">
      <div className="border-border/60 mb-3 space-y-1 border-b pb-3">
        <h3 className="text-foreground text-base font-semibold sm:text-lg">
          {title}
        </h3>
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
      </div>

      <div className="min-h-0 min-w-0 flex-1">
        {children ?? (
          <div className="border-border/80 bg-background/20 text-muted-foreground flex h-full items-center justify-center rounded-xl border border-dashed px-4 text-center text-sm">
            {emptyState}
          </div>
        )}
      </div>
    </div>
  </div>
);

const getTooltipColorStyle = (color?: string) => ({
  backgroundColor: color ?? GRAPH_COLORS.primary,
});

const ChartTooltip = ({
  active,
  label,
  payload,
}: ChartTooltipProperties): React.ReactElement | null => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = (payload[0]?.payload ?? {}) as Partial<
    ReferenceChartPoint & TrendChartPoint
  >;
  const visiblePayload = payload.filter(
    (entry) =>
      typeof entry.value === "number" &&
      entry.dataKey !== "confidenceFloor" &&
      entry.dataKey !== "confidenceSpan",
  );

  return (
    <div
      className="rounded-xl border px-3 py-2 text-xs shadow-lg"
      style={TOOLTIP_CONTAINER_STYLE}
    >
      <p className="text-foreground mb-2 font-semibold">
        {point.tooltipLabel ?? String(label ?? "")}
      </p>
      <div className="space-y-1.5">
        {visiblePayload.map((entry) => (
          <div
            className="flex items-center justify-between gap-3"
            key={`${entry.dataKey}-${entry.name}`}
          >
            <span className="text-muted-foreground flex items-center gap-2">
              <span
                className="inline-flex size-2 rounded-full"
                style={getTooltipColorStyle(entry.color)}
              />
              {entry.name}
            </span>
            <span className="text-foreground font-semibold">
              {formatPetValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
      {typeof point.confidenceLow === "number" &&
        typeof point.confidenceHigh === "number" && (
          <p className="border-border/70 text-muted-foreground mt-2 border-t pt-2 text-[11px]">
            80% confidence interval: {formatPetValue(point.confidenceLow)} to{" "}
            {formatPetValue(point.confidenceHigh)}
          </p>
        )}
    </div>
  );
};

const GraphLegend = ({
  showLegend,
}: GraphLegendProperties): React.ReactElement | null => {
  if (!showLegend) {
    return null;
  }

  return (
    <Legend
      formatter={formatLegendLabel}
      iconSize={10}
      wrapperStyle={LEGEND_WRAPPER_STYLE}
    />
  );
};

const TrendForecastSeries = ({
  forecastData,
  shouldAnimate,
}: TrendForecastSeriesProperties): React.ReactElement | null => {
  if (!forecastData || forecastData.forecastYears.length === 0) {
    return null;
  }

  return (
    <>
      <Area
        activeDot={false}
        dataKey="confidenceFloor"
        fill="transparent"
        isAnimationActive={shouldAnimate}
        legendType="none"
        stackId="confidence"
        stroke="none"
      />
      <Area
        activeDot={false}
        dataKey="confidenceSpan"
        fill={GRAPH_COLORS.confidenceFill}
        isAnimationActive={shouldAnimate}
        name="80% Confidence Interval"
        stackId="confidence"
        stroke="none"
      />
      <Line
        connectNulls
        dataKey="forecast"
        dot={false}
        isAnimationActive={shouldAnimate}
        name="Forecast"
        stroke={GRAPH_COLORS.secondary}
        strokeDasharray="6 5"
        strokeWidth={2}
        type="monotone"
      />
    </>
  );
};

const TrendChartBody = ({
  chartData,
  forecastData,
  graphType,
  isMobileViewport,
  season,
  shouldAnimate,
  showLegend,
}: TrendChartBodyProperties): React.ReactElement => {
  const yAxisDomain = React.useMemo(
    () =>
      getYAxisDomain(
        chartData.flatMap((point) => [
          point.pet,
          point.trendline,
          point.forecast,
        ]),
      ),
    [chartData],
  );

  const tickStyle = React.useMemo(
    () => ({
      fill: GRAPH_COLORS.text,
      fontSize: isMobileViewport
        ? TICK_FONT_SIZE_MOBILE
        : TICK_FONT_SIZE_DESKTOP,
    }),
    [isMobileViewport],
  );

  const dotStyle = React.useMemo(
    () => ({
      fill: GRAPH_COLORS.primary,
      r: isMobileViewport ? DOT_RADIUS_MOBILE : DOT_RADIUS_DESKTOP,
    }),
    [isMobileViewport],
  );

  const tooltipContent = React.useMemo(() => <ChartTooltip />, []);
  const chartMargin = React.useMemo(
    () => getChartMargin({ isMobileViewport, showLegend }),
    [isMobileViewport, showLegend],
  );

  return (
    <div
      aria-label={`${graphType} ${season} PET trend chart`}
      className="size-full"
      data-testid="trend-chart"
    >
      <ChartResponsiveContainer minHeight={0} minWidth={0}>
        <ComposedChart data={chartData} margin={chartMargin}>
          <CartesianGrid
            stroke={GRAPH_COLORS.grid}
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            allowDecimals={false}
            axisLine={false}
            dataKey="year"
            domain={CHART_DOMAIN}
            minTickGap={24}
            tick={tickStyle}
            tickCount={
              isMobileViewport ? TICK_COUNT_MOBILE : TICK_COUNT_DESKTOP
            }
            tickLine={false}
            type="number"
          />
          <YAxis
            allowDataOverflow
            axisLine={false}
            domain={yAxisDomain}
            tick={tickStyle}
            tickFormatter={formatYAxisTick}
            tickLine={false}
            width={
              isMobileViewport ? Y_AXIS_WIDTH_MOBILE : Y_AXIS_WIDTH_DESKTOP
            }
          />
          <Tooltip content={tooltipContent} cursor={TOOLTIP_CURSOR_STYLE} />
          <GraphLegend showLegend={showLegend} />
          <TrendForecastSeries
            forecastData={forecastData}
            shouldAnimate={shouldAnimate}
          />
          <Line
            activeDot={TREND_ACTIVE_DOT}
            dataKey="pet"
            dot={dotStyle}
            isAnimationActive={shouldAnimate}
            name="PET"
            stroke={GRAPH_COLORS.primary}
            strokeWidth={2.5}
            type="monotone"
          />
          <Line
            connectNulls
            dataKey="trendline"
            dot={false}
            isAnimationActive={shouldAnimate}
            name="Trendline of PET"
            stroke={GRAPH_COLORS.reference}
            strokeDasharray="8 5"
            strokeWidth={2}
            type="monotone"
          />
        </ComposedChart>
      </ChartResponsiveContainer>
    </div>
  );
};

const ReferenceChartBody = ({
  chartData,
  currentYear,
  isMobileViewport,
  referenceYear,
  season,
  shouldAnimate,
  showLegend,
}: ReferenceChartBodyProperties): React.ReactElement => {
  const yAxisDomain = React.useMemo(
    () =>
      getYAxisDomain(
        chartData.flatMap((point) => [point.currentPet, point.referencePet]),
      ),
    [chartData],
  );

  const tickStyle = React.useMemo(
    () => ({
      fill: GRAPH_COLORS.text,
      fontSize: isMobileViewport
        ? TICK_FONT_SIZE_MOBILE
        : TICK_FONT_SIZE_DESKTOP,
    }),
    [isMobileViewport],
  );

  const tooltipContent = React.useMemo(() => <ChartTooltip />, []);
  const chartMargin = React.useMemo(
    () => getChartMargin({ isMobileViewport, showLegend }),
    [isMobileViewport, showLegend],
  );

  return (
    <div
      aria-label={`${season} PET reference comparison chart`}
      className="size-full"
      data-testid="reference-chart"
    >
      <ChartResponsiveContainer minHeight={0} minWidth={0}>
        <ComposedChart data={chartData} margin={chartMargin}>
          <CartesianGrid
            stroke={GRAPH_COLORS.grid}
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            axisLine={false}
            dataKey="label"
            interval="preserveStartEnd"
            minTickGap={
              isMobileViewport
                ? MIN_TICK_GAP_REFERENCE_MOBILE
                : MIN_TICK_GAP_REFERENCE_DESKTOP
            }
            tick={tickStyle}
            tickLine={false}
          />
          <YAxis
            allowDataOverflow
            axisLine={false}
            domain={yAxisDomain}
            tick={tickStyle}
            tickFormatter={formatYAxisTick}
            tickLine={false}
            width={
              isMobileViewport ? Y_AXIS_WIDTH_MOBILE : Y_AXIS_WIDTH_DESKTOP
            }
          />
          <Tooltip content={tooltipContent} cursor={TOOLTIP_CURSOR_STYLE} />
          <GraphLegend showLegend={showLegend} />
          <Line
            activeDot={REF_CURRENT_ACTIVE_DOT}
            dataKey="currentPet"
            dot={false}
            isAnimationActive={shouldAnimate}
            name={`Current year (${currentYear})`}
            stroke={GRAPH_COLORS.primary}
            strokeWidth={3}
            type="linear"
          />
          <Line
            activeDot={REF_REFERENCE_ACTIVE_DOT}
            dataKey="referencePet"
            dot={false}
            isAnimationActive={shouldAnimate}
            name={`Reference year (${referenceYear})`}
            stroke={GRAPH_COLORS.secondary}
            strokeDasharray="12 7"
            strokeWidth={2.5}
            type="linear"
          />
        </ComposedChart>
      </ChartResponsiveContainer>
    </div>
  );
};

export const GenerateTrendGraph = ({
  forecastData,
  increasePerYear,
  isMobileViewport = false,
  option,
  season = DEFAULT_GRAPH_SEASON,
  showLegend = true,
  trendlinePets,
  useCompactDesktopHeight = false,
  yearPets,
  years,
}: GenerateTrendGraphOptions): React.ReactElement => {
  const shouldAnimate = useInitialChartAnimation();

  if (!hasTrendGraphData(years, yearPets, trendlinePets)) {
    return (
      <ChartShell
        emptyState="No data available for the selected parameters."
        subtitle="Try a different measure or season."
        title="Trend analysis"
        useCompactDesktopHeight={useCompactDesktopHeight}
      />
    );
  }

  const chartData = buildTrendChartData(
    years,
    yearPets,
    trendlinePets,
    forecastData,
  );

  const graphType = getTrendGraphType(option);
  const startYear = years.at(0) ?? GRAPH_CONFIG.YEAR_RANGE.START;
  const endYear = years.at(-1) ?? GRAPH_CONFIG.YEAR_RANGE.END;
  const increaseText = formatIncreasePerYearText(increasePerYear);

  return (
    <ChartShell
      emptyState="No data available for the selected parameters."
      subtitle={`${startYear}–${endYear} · Increase per year: ${increaseText}°C`}
      title={`${graphType} ${season} PET`}
      useCompactDesktopHeight={useCompactDesktopHeight}
    >
      <TrendChartBody
        chartData={chartData}
        forecastData={forecastData}
        graphType={graphType}
        isMobileViewport={isMobileViewport}
        season={season}
        shouldAnimate={shouldAnimate}
        showLegend={showLegend}
      />
    </ChartShell>
  );
};

export const GenerateReferenceGraph = ({
  currentPets,
  currentYear = GRAPH_CONFIG.YEAR_RANGE.END,
  dates,
  isMobileViewport = false,
  referencePets,
  referenceYear,
  season = DEFAULT_GRAPH_SEASON,
  showLegend = true,
}: GenerateReferenceGraphOptions): React.ReactElement => {
  const shouldAnimate = useInitialChartAnimation();

  if (!hasReferenceGraphData(dates, currentPets, referencePets)) {
    return (
      <ChartShell
        emptyState="No data available for the selected parameters."
        subtitle="Try a different reference year."
        title="Reference comparison"
      />
    );
  }

  const chartData = buildReferenceChartData(dates, currentPets, referencePets);

  return (
    <ChartShell
      emptyState="No data available for the selected parameters."
      title={`${season} PET in ${currentYear} vs ${referenceYear}`}
    >
      <ReferenceChartBody
        chartData={chartData}
        currentYear={currentYear}
        isMobileViewport={isMobileViewport}
        referenceYear={referenceYear}
        season={season}
        shouldAnimate={shouldAnimate}
        showLegend={showLegend}
      />
    </ChartShell>
  );
};
