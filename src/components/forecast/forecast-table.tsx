"use client";

import React from "react";

import { getHeatStressColor } from "@/lib/utils/heat-stress";

interface ForecastTableProperties {
  forecastData: {
    forecastValues: number[];
    forecastYears: number[];
    lowerBound25: number[];
    upperBound75: number[];
  };
}

export const ForecastTable: React.FC<ForecastTableProperties> = ({
  forecastData,
}) => {
  const { forecastValues, forecastYears, lowerBound25, upperBound75 } =
    forecastData;

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                scope="col"
              >
                Year
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                scope="col"
              >
                Forecast
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                scope="col"
              >
                Forecast Range (25-75th Percentile)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {forecastYears.map((year, index) => {
              const forecast = forecastValues[index];
              const lower = lowerBound25[index];
              const upper = upperBound75[index];

              const forecastColor = getHeatStressColor(forecast);

              return (
                <tr className="hover:bg-gray-50" key={year}>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                    {year}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span className={`font-bold ${forecastColor}`}>
                      {forecast.toFixed(1)}°C
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {lower.toFixed(1)}°C - {upper.toFixed(1)}°C
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
