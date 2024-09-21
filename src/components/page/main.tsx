"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FC } from "react";
import { GenerateTrendGraph, GenerateReferenceGraph } from "../generateGraph";
import { PageProps } from "./types";
import {
  Select,
  SelectItem,
  SelectSection,
  Selection,
} from "@nextui-org/react";
import { GraphOptions, YearOptions } from "../selectOptions";
import { IoMdExit } from "react-icons/io";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FetchReferenceGraphData } from "../fetchData";

const Main: FC<PageProps> = ({
  id,
  location,
  LocationOptions,
  CurrentPets,
  CurrentDates,
}: PageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultGraphType = "avg";
  const defaultReferenceYear = "2000";
  const graphTypeFromParams = searchParams.get("type") || defaultGraphType;

  const [SelectedLocation, setSelectedLocation] = useState<Selection>(
    new Set([id]),
  );
  const [SelectedGraphType, setSelectedGraphType] = useState(
    new Set([graphTypeFromParams]),
  );
  const [SelectedReferenceYear, setSelectedReferenceYear] = useState(
    new Set([defaultReferenceYear]),
  );
  const [TrendGraph, setTrendGraph] = useState<JSX.Element | null>(null);
  const [ReferenceGraph, setReferenceGraph] = useState<JSX.Element | null>(
    null,
  );

  const selectedLocationId = useMemo(
    () => Number(Array.from(SelectedLocation)[0]),
    [SelectedLocation],
  );

  const updateRoute = useCallback(() => {
    if (Number(id) !== selectedLocationId) {
      router.push(`/${selectedLocationId}`);
    }
  }, [id, selectedLocationId, router]);

  const generatePetTrendGraph = useCallback(
    (option: string = graphTypeFromParams) => {
      GenerateTrendGraph(selectedLocationId, option).then(setTrendGraph);
    },
    [selectedLocationId, graphTypeFromParams],
  );

  const generateReferenceGraph = useCallback(
    (option: string = defaultReferenceYear) => {
      FetchReferenceGraphData(option, selectedLocationId).then((props) => {
        GenerateReferenceGraph(
          option,
          CurrentDates,
          CurrentPets,
          props.pets,
        ).then(setReferenceGraph);
      });
    },
    [selectedLocationId, CurrentDates, CurrentPets],
  );
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      value!=="" ? params.set(name, value) : params.delete(name)
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );
  const handleGraphTypeChange = useCallback(
    (option: string) => {
      if (option) {
        setSelectedGraphType(new Set([option]));
        option!==defaultGraphType ? createQueryString("type",option) : createQueryString("type","")
        generatePetTrendGraph(option);
      }
    },
    [generatePetTrendGraph],
  );

  const handleReferenceYearChange = useCallback(
    (option: string) => {
      if (option) {
        setSelectedReferenceYear(new Set([option]));
        generateReferenceGraph(option);
      }
    },
    [generateReferenceGraph],
  );

  useEffect(() => {
    updateRoute();
    generatePetTrendGraph();
    generateReferenceGraph();
  }, [SelectedLocation]);

  return (
    <>
      <Link href={Array.from(SelectedGraphType)[0] !== defaultGraphType ? `/?type=${Array.from(SelectedGraphType)[0]}` : '/'}>
        <IoMdExit size="30" />
      </Link>
      <Select
        label="Change location"
        className="w-1/12"
        onSelectionChange={setSelectedLocation}
      >
        {LocationOptions.map((section) => (
          <SelectSection
            key={section.title}
            showDivider
            items={section.items}
            title={section.title}
          >
            {(option) => (
              <SelectItem key={option.key}>{option.title}</SelectItem>
            )}
          </SelectSection>
        ))}
      </Select>
      <div className="flex flex-col items-start min-h-screen">
        <div className="w-full">
          <Select
            label="Type"
            items={GraphOptions}
            selectedKeys={SelectedGraphType}
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
          <div className="w-full max-w-4xl">{TrendGraph}</div>
        </div>
        <div className="w-full">
          <Select
            label="Reference Year"
            items={YearOptions()}
            selectedKeys={SelectedReferenceYear}
            className="w-1/12"
            onChange={(e) => handleReferenceYearChange(e.target.value)}
          >
            {(option) => (
              <SelectItem key={option.key}>{option.label}</SelectItem>
            )}
          </Select>
          <div className="w-full max-w-4xl">{ReferenceGraph}</div>
        </div>
      </div>
    </>
  );
};

export default Main;
