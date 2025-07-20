"use client";
import { Select, SelectItem } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, FC } from "react";

import {
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "../../lib/fetchClient";
import { GraphOptions, YearOptions } from "../../lib/selectOptions";
import { GenerateTrendGraph, GenerateReferenceGraph } from "../generate-graph";
import { HeaderBar } from "../header-bar";

import { PageProps } from "./types";

const DEFAULT_GRAPH_MEASURE = "avg";
const DEFAULT_REFERENCE_YEAR = "2000";
const VALID_GRAPH_MEASURES = ["avg", "max"];

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

  // Validate the trend option from query params
  const typeParam = searchParams.get("type") ?? "";
  const graphMeasureFromParams = VALID_GRAPH_MEASURES.includes(typeParam)
    ? typeParam
    : DEFAULT_GRAPH_MEASURE;

  const [selectedGraphMeasure, setSelectedGraphMeasure] = useState(
    new Set<string>([graphMeasureFromParams])
  );
  const [selectedReferenceYear, setSelectedReferenceYear] = useState(
    new Set([DEFAULT_REFERENCE_YEAR])
  );
  const [trendGraph, setTrendGraph] = useState<React.ReactElement | null>(null);
  const [referenceGraph, setReferenceGraph] =
    useState<React.ReactElement | null>(null);

  const generatePetTrendGraph = useCallback(
    async (option: string = graphMeasureFromParams) => {
      const graphData =
        option !== DEFAULT_GRAPH_MEASURE
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
        trendline_pets
      );
      setTrendGraph(graph);
    },
    [graphMeasureFromParams, id, Years, YearPets, TrendlinePets]
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
        referenceData.pets,
        CurrentPets
      );
      setReferenceGraph(graph);
    },
    [id, CurrentDates, CurrentPets, ReferencePets]
  );

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleGraphMeasureChange = useCallback(
    (option: string) => {
      setSelectedGraphMeasure(new Set([option]));
      createQueryString("type", option !== DEFAULT_GRAPH_MEASURE ? option : "");
      generatePetTrendGraph(option);
    },
    [createQueryString, generatePetTrendGraph]
  );

  const handleReferenceYearChange = useCallback(
    (year: string) => {
      setSelectedReferenceYear(new Set([year]));
      generatePetReferenceGraph(year);
    },
    [generatePetReferenceGraph]
  );

  useEffect(() => {
    generatePetTrendGraph();
    generatePetReferenceGraph();
  }, [generatePetTrendGraph, generatePetReferenceGraph]);

  return (
    <>
      <HeaderBar LocationOptions={LocationOptions} id={id} />
      <div className="flex min-h-screen flex-col">
        <p className="mb-4 mt-2 text-center text-lg">
          {location.city}, {location.state}
        </p>
        <div className="flex w-full flex-col gap-4 px-4 lg:flex-row">
          <div className="flex w-full flex-1 flex-col">
            <div className="h-[500px] w-full">{trendGraph}</div>
            <div className="mt-2 flex justify-center">
              <Select
                label="Measure"
                items={GraphOptions}
                selectedKeys={selectedGraphMeasure}
                className="w-48"
                onChange={e => handleGraphMeasureChange(e.target.value)}
              >
                {option => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                )}
              </Select>
            </div>
          </div>
          <div className="flex w-full flex-1 flex-col">
            <div className="h-[500px] w-full">{referenceGraph}</div>
            <div className="mt-2 flex justify-center">
              <Select
                label="Reference Year"
                items={YearOptions()}
                selectedKeys={selectedReferenceYear}
                className="w-48"
                onChange={e => handleReferenceYearChange(e.target.value)}
              >
                {option => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                )}
              </Select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;
