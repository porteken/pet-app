"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FC } from "react";
import { GenerateTrendGraph, GenerateReferenceGraph } from "../generateGraph";
import { PageProps } from "./types";
import { Select, SelectItem } from "@nextui-org/react";
import { GraphOptions, YearOptions } from "../selectOptions";
import { useRouter, useSearchParams } from "next/navigation";
import { FetchReferenceGraphData, FetchTrendGraphData } from "../fetchClient";
import { HeaderBar } from "../headerBar";

const DEFAULT_GRAPH_TYPE = "avg";
const DEFAULT_REFERENCE_YEAR = "2000";

const Main: FC<PageProps> = ({
  id,
  location,
  LocationOptions,
  CurrentPets,
  ReferencePets,
  CurrentDates,
  TrendlinePets,
  YearPets,
  Years,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const graphTypeFromParams = searchParams.get("type") || DEFAULT_GRAPH_TYPE;

  const [selectedGraphType, setSelectedGraphType] = useState(
    new Set([graphTypeFromParams]),
  );
  const [selectedReferenceYear, setSelectedReferenceYear] = useState(
    new Set([DEFAULT_REFERENCE_YEAR]),
  );
  const [trendGraph, setTrendGraph] = useState<JSX.Element | null>(null);
  const [referenceGraph, setReferenceGraph] = useState<JSX.Element | null>(
    null,
  );

  const generatePetTrendGraph = useCallback(
    async (option: string = graphTypeFromParams) => {
      const graphData =
        option !== DEFAULT_GRAPH_TYPE
          ? await FetchTrendGraphData(option, id)
          : {
              years: Years,
              year_pets: YearPets,
              trendline_pets: TrendlinePets,
            };

      const { years, year_pets, trendline_pets } = graphData;
      const graph = GenerateTrendGraph(
        years,
        option,
        year_pets,
        trendline_pets,
        500,
      );
      setTrendGraph(graph);
    },
    [graphTypeFromParams, id, Years, YearPets, TrendlinePets],
  );

  const generatePetReferenceGraph = useCallback(
    async (year: string = DEFAULT_REFERENCE_YEAR) => {
      const referenceData =
        year !== DEFAULT_REFERENCE_YEAR
          ? await FetchReferenceGraphData(year, id)
          : { pets: ReferencePets };

      const graph = await GenerateReferenceGraph(
        year,
        CurrentDates,
        CurrentPets,
        referenceData.pets,
      );
      setReferenceGraph(graph);
    },
    [id, CurrentDates, CurrentPets, ReferencePets],
  );

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      value ? params.set(name, value) : params.delete(name);
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const handleGraphTypeChange = useCallback(
    (option: string) => {
      setSelectedGraphType(new Set([option]));
      createQueryString("type", option !== DEFAULT_GRAPH_TYPE ? option : "");
      generatePetTrendGraph(option);
    },
    [createQueryString, generatePetTrendGraph],
  );

  const handleReferenceYearChange = useCallback(
    (year: string) => {
      setSelectedReferenceYear(new Set([year]));
      generatePetReferenceGraph(year);
    },
    [generatePetReferenceGraph],
  );

  useEffect(() => {
    generatePetTrendGraph();
    generatePetReferenceGraph();
  }, [generatePetTrendGraph, generatePetReferenceGraph]);

  return (
    <>
      <HeaderBar LocationOptions={LocationOptions} id={id} />
      <div className="flex flex-col items-start min-h-screen">
        <div className="w-full">
          <Select
            label="Type"
            items={GraphOptions}
            selectedKeys={selectedGraphType}
            className="w-1/12"
            onChange={(e) => handleGraphTypeChange(e.target.value)}
          >
            {(option) => (
              <SelectItem key={option.key}>{option.label}</SelectItem>
            )}
          </Select>
        </div>
        <div className="md:justify-center">
          <p className="text-lg text-center">
            {location.city}, {location.state}
          </p>
          <div className="w-full max-w-4xl">{trendGraph}</div>
        </div>
        <div className="w-full">
          <Select
            label="Reference Year"
            items={YearOptions()}
            selectedKeys={selectedReferenceYear}
            className="w-1/12"
            onChange={(e) => handleReferenceYearChange(e.target.value)}
          >
            {(option) => (
              <SelectItem key={option.key}>{option.label}</SelectItem>
            )}
          </Select>
          <div className="w-full max-w-4xl">{referenceGraph}</div>
        </div>
      </div>
    </>
  );
};

export default Main;
