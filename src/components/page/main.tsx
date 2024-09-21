"use client";

import { useState, useEffect, useCallback } from "react";
import { FC } from "react";
import { GenerateTrendGraph, GenerateReferenceGraph } from "../generateGraph";
import { PageProps } from "./types";
import { Select, SelectItem } from "@nextui-org/react";
import { GraphOptions, YearOptions } from "../selectOptions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FetchReferenceGraphData, FetchTrendGraphData } from "../fetchClient";
import { HeaderBar } from "../headerBar";

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
}: PageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const defaultGraphType = "avg";
  const defaultReferenceYear = "2000";
  const graphTypeFromParams = searchParams.get("type") || defaultGraphType;

  const [selectedGraphType, setSelectedGraphType] = useState(
    new Set([graphTypeFromParams]),
  );
  const [selectedReferenceYear, setSelectedReferenceYear] = useState(
    new Set([defaultReferenceYear]),
  );
  const [trendGraph, setTrendGraph] = useState<JSX.Element | null>(null);
  const [referenceGraph, setReferenceGraph] = useState<JSX.Element | null>(
    null,
  );

  const generatePetTrendGraph = useCallback(
    (option: string = graphTypeFromParams) => {
      if (option !== defaultGraphType) {
        FetchTrendGraphData(option, id).then((data) => {
          const { years, year_pets, trendline_pets } = data;
          const graph = GenerateTrendGraph(
            years,
            option,
            year_pets,
            trendline_pets,
            500,
          );
          setTrendGraph(graph);
        });
      } else {
        const graph = GenerateTrendGraph(
          Years,
          option,
          YearPets,
          TrendlinePets,
          500,
        );
        setTrendGraph(graph);
      }
    },
    [graphTypeFromParams],
  );

  const generatePetReferenceGraph = useCallback(
    (year: string = defaultReferenceYear) => {
      if (year != defaultReferenceYear) {
        FetchReferenceGraphData(year, id).then((props) => {
          GenerateReferenceGraph(
            year,
            CurrentDates,
            CurrentPets,
            props.pets,
          ).then(setReferenceGraph);
        });
      } else {
        GenerateReferenceGraph(
          year,
          CurrentDates,
          CurrentPets,
          ReferencePets,
        ).then(setReferenceGraph);
      }
    },
    [CurrentDates, CurrentPets],
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
      if (option) {
        setSelectedGraphType(new Set([option]));
        option !== defaultGraphType
          ? createQueryString("type", option)
          : createQueryString("type", "");
        generatePetTrendGraph(option);
      }
    },
    [generatePetTrendGraph, createQueryString, defaultGraphType],
  );

  const handleReferenceYearChange = useCallback(
    (year: string) => {
      if (year) {
        setSelectedReferenceYear(new Set([year]));
        generatePetReferenceGraph(year);
      }
    },
    [generatePetReferenceGraph],
  );

  useEffect(() => {
    generatePetTrendGraph();
    generatePetReferenceGraph();
  }, [generatePetTrendGraph, generatePetReferenceGraph]);

  return (
    <>
      <HeaderBar
        LocationOptions={LocationOptions}
        name={location.city}
        id={id}
      />
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
