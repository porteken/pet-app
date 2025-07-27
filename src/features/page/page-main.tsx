"use client";
import React, {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { setGraphMeasure } from "@/app/actions";
import {
  GenerateReferenceGraph,
  GenerateTrendGraph,
} from "@/features/generate-graph";
import { HeaderBar } from "@/features/header-bar";
import {
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "@/lib/api/fetch-client";

import { PageProperties } from "./types";
const DEFAULT_REFERENCE_YEAR = "2000";

const Main: FC<PageProperties> = ({
  CurrentDates,
  CurrentPets,
  id,
  initialGraphMeasure,
  location,
  LocationOptions,
  ReferencePets,
  TrendlinePets,
  YearPets,
  Years,
}) => {
  const [selectedGraphMeasure, setSelectedGraphMeasure] = useState("avg"); // Start with default value to avoid hydration mismatch

  // Set the actual value after hydration to avoid mismatch
  useEffect(() => {
    setSelectedGraphMeasure(initialGraphMeasure);
  }, [initialGraphMeasure]);
  const [selectedReferenceYear, setSelectedReferenceYear] = useState(
    DEFAULT_REFERENCE_YEAR
  );

  const [trendGraph, setTrendGraph] = useState<null | ReactElement>();
  const [referenceGraph, setReferenceGraph] = useState<null | ReactElement>();

  const generatePetTrendGraph = useCallback(
    async (option: string) => {
      const graphData =
        option === selectedGraphMeasure
          ? { trendline_pets: TrendlinePets, year_pets: YearPets, years: Years }
          : await FetchTrendGraphData(option, id);

      const { trendline_pets, year_pets, years } = graphData;
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
          ? { dates: CurrentDates, pets: ReferencePets }
          : await FetchReferenceGraphData(year, id);

      const { dates, pets } = referenceData;
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

  const handleGraphMeasureChange = useCallback(
    async (option: string) => {
      setSelectedGraphMeasure(option);
      await setGraphMeasure(option);
      generatePetTrendGraph(option);
    },
    [id, generatePetTrendGraph]
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
      <HeaderBar id={id} LocationOptions={LocationOptions} />
      <main className="mx-auto max-w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
            {location.city}, {location.state}
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Trend Analysis
              </h2>
              <div className="mb-4">
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="graph-measure"
                >
                  Graph Measure
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  id="graph-measure"
                  onChange={event =>
                    handleGraphMeasureChange(event.target.value)
                  }
                  value={selectedGraphMeasure}
                >
                  <option key="measure-avg" value="avg">
                    Average
                  </option>
                  <option key="measure-max" value="max">
                    Maximum
                  </option>
                </select>
              </div>
              <div className="h-[700px]">{trendGraph}</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Reference Data
              </h2>
              <div className="mb-4">
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="reference-year"
                >
                  Reference Year
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  id="reference-year"
                  onChange={event =>
                    handleReferenceYearChange(event.target.value)
                  }
                  value={selectedReferenceYear}
                >
                  <option key="year-2000" value="2000">
                    2000
                  </option>
                  <option key="year-2001" value="2001">
                    2001
                  </option>
                  <option key="year-2002" value="2002">
                    2002
                  </option>
                  <option key="year-2003" value="2003">
                    2003
                  </option>
                  <option key="year-2004" value="2004">
                    2004
                  </option>
                  <option key="year-2005" value="2005">
                    2005
                  </option>
                  <option key="year-2006" value="2006">
                    2006
                  </option>
                  <option key="year-2007" value="2007">
                    2007
                  </option>
                  <option key="year-2008" value="2008">
                    2008
                  </option>
                  <option key="year-2009" value="2009">
                    2009
                  </option>
                  <option key="year-2010" value="2010">
                    2010
                  </option>
                  <option key="year-2011" value="2011">
                    2011
                  </option>
                  <option key="year-2012" value="2012">
                    2012
                  </option>
                  <option key="year-2013" value="2013">
                    2013
                  </option>
                  <option key="year-2014" value="2014">
                    2014
                  </option>
                  <option key="year-2015" value="2015">
                    2015
                  </option>
                  <option key="year-2016" value="2016">
                    2016
                  </option>
                  <option key="year-2017" value="2017">
                    2017
                  </option>
                  <option key="year-2018" value="2018">
                    2018
                  </option>
                  <option key="year-2019" value="2019">
                    2019
                  </option>
                  <option key="year-2020" value="2020">
                    2020
                  </option>
                  <option key="year-2021" value="2021">
                    2021
                  </option>
                  <option key="year-2022" value="2022">
                    2022
                  </option>
                </select>
              </div>
              <div className="h-[700px]">{referenceGraph}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Export as both Main (default) and PageMain (named export for tests)
export { Main as PageMain };
export default Main;
