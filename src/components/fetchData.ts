import {
  ReferenceGraphDataProps,
  TrendGraphDataProps,
  LocationProps,
} from "./types";
import { SimpleLinearRegression } from "ml-regression-simple-linear";

const API_SERVER =
  process.env.NEXT_PUBLIC_API_SERVER || "http://localhost:3000";

export async function FetchLocations(id?: number): Promise<LocationProps[]> {
  const query = id ? `?id=${id}` : "";
  const url = `${API_SERVER}/api/locations${query}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok)
      throw new Error(`Error fetching locations: ${response.statusText}`);
    const data = await response.json();
    return data as LocationProps[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function FetchTrendGraphData(
  option: string,
  locationId: number,
): Promise<TrendGraphDataProps> {
  const url = `${API_SERVER}/api/pet_year_${option}?id=${locationId}`;
  const type = option === "avg" ? "Average" : "Max";

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        `Error fetching trend graph data: ${response.statusText}`,
      );

    const data = await response.json();
    const years = data.map(({ year }: { year: number }) => year);
    const pets = data.map(({ pet }: { pet: number }) => Number(pet));

    const reg = new SimpleLinearRegression(years, pets);
    const trendline_pets = years.map(
      (year: number) => Math.round(reg.predict(year) * 100) / 100,
    );

    return { type, years, pets, trendline_pets };
  } catch (error) {
    console.error(error);
    return { type, years: [], pets: [], trendline_pets: [] };
  }
}

export async function FetchReferenceGraphData(
  year: string,
  locationId: number,
): Promise<ReferenceGraphDataProps> {
  const url = `${API_SERVER}/api/pet_year?id=${locationId}&year=${year}`;

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        `Error fetching reference graph data: ${response.statusText}`,
      );

    const data = await response.json();
    const dates = data.map(({ date }: { date: string }) => new Date(date));
    const pets = data.map(({ pet }: { pet: number }) => Number(pet));

    return { dates, pets };
  } catch (error) {
    console.error(error);
    return { dates: [], pets: [] };
  }
}
