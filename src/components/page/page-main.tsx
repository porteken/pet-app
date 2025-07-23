"use client";
import { useCallback, useEffect, useState, FC, ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { HeaderBar } from "../header-bar";
import { GenerateTrendGraph, GenerateReferenceGraph } from "../generate-graph";
import {
  FetchTrendGraphData,
  FetchReferenceGraphData,
} from "../../lib/fetch-client";
import { PageProps } from "./types";

const DEFAULT_GRAPH_MEASURE = "avg";
const DEFAULT_REFERENCE_YEAR = "2000";
const VALID_GRAPH_MEASURES = new Set(["avg", "max"]);

const Main: FC<PageProps> = ({
  id,
  location,
  LocationOptions,
  CurrentPets,
  ReferencePets,
  CurrentDates,
  YearPets,
  TrendlinePets,
  Years,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const typeParam = searchParams.get("type") ?? "";
  const graphMeasureFromParams = VALID_GRAPH_MEASURES.has(typeParam)
    ? typeParam
    : DEFAULT_GRAPH_MEASURE;

  const [selectedGraphMeasure, setSelectedGraphMeasure] = useState(
    graphMeasureFromParams
  );
  const [selectedReferenceYear, setSelectedReferenceYear] = useState(
    DEFAULT_REFERENCE_YEAR
  );

  const [trendGraph, setTrendGraph] = useState<ReactElement | null>();
  const [referenceGraph, setReferenceGraph] = useState<ReactElement | null>();

  const generatePetTrendGraph = useCallback(
    async (option: string) => {
      const graphData =
        option === selectedGraphMeasure
          ? { years: Years, year_pets: YearPets, trendline_pets: TrendlinePets }
          : await FetchTrendGraphData(option, id);

      const { years, year_pets, trendline_pets } = graphData;
      const graph = GenerateTrendGraph(
        years,
        option,
        year_pets,
        trendline_pets
      );
      setTrendGraph(graph);
    },
    [Years, YearPets, TrendlinePets, selectedGraphMeasure, id]
  );

  const generatePetReferenceGraph = useCallback(
    async (year: string) => {
      const referenceData =
        year === DEFAULT_REFERENCE_YEAR
          ? { pets: ReferencePets, dates: CurrentDates }
          : await FetchReferenceGraphData(year, id);

      const { pets, dates } = referenceData;
      const graph = await GenerateReferenceGraph(
        year,
        dates,
        pets,
        CurrentPets
      );
      setReferenceGraph(graph);
    },
    [ReferencePets, CurrentDates, CurrentPets, id]
  );

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      }

      return newParams.toString();
    },
    [searchParams]
  );

  const handleGraphMeasureChange = useCallback(
    (option: string) => {
      setSelectedGraphMeasure(option);
      const queryString = createQueryString({ type: option });
      router.push(`/${id}?${queryString}`);
      generatePetTrendGraph(option);
    },
    [id, router, createQueryString, generatePetTrendGraph]
  );

  const handleReferenceYearChange = useCallback(
    (year: string) => {
      setSelectedReferenceYear(year);
      generatePetReferenceGraph(year);
    },
    [generatePetReferenceGraph]
  );

  useEffect(() => {
    generatePetTrendGraph(selectedGraphMeasure);
  }, [generatePetTrendGraph, selectedGraphMeasure]);

  useEffect(() => {
    generatePetReferenceGraph(selectedReferenceYear);
  }, [generatePetReferenceGraph, selectedReferenceYear]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar LocationOptions={LocationOptions} id={id} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {location.city}, {location.state}
          </h1>
          <p className="text-gray-600">
            Historical PET data analysis and trends
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Trend Analysis
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="graph-measure"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Graph Measure
                </label>
                <select
                  id="graph-measure"
                  value={selectedGraphMeasure}
                  onChange={e => handleGraphMeasureChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="avg">Average</option>
                  <option value="max">Maximum</option>
                </select>
              </div>
              <div className="h-96">{trendGraph}</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Reference Data
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="reference-year"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Reference Year
                </label>
                <select
                  id="reference-year"
                  value={selectedReferenceYear}
                  onChange={e => handleReferenceYearChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="2000">2000</option>
                  <option value="2001">2001</option>
                  <option value="2002">2002</option>
                  <option value="2003">2003</option>
                  <option value="2004">2004</option>
                  <option value="2005">2005</option>
                  <option value="2006">2006</option>
                  <option value="2007">2007</option>
                  <option value="2008">2008</option>
                  <option value="2009">2009</option>
                  <option value="2010">2010</option>
                  <option value="2011">2011</option>
                  <option value="2012">2012</option>
                  <option value="2013">2013</option>
                  <option value="2014">2014</option>
                  <option value="2015">2015</option>
                  <option value="2016">2016</option>
                  <option value="2017">2017</option>
                  <option value="2018">2018</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div className="h-96">{referenceGraph}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Main;
