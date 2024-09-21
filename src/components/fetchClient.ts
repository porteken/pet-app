import { ReferenceGraphDataProps, TrendGraphDataProps } from "./types";
import { SimpleLinearRegression } from "ml-regression-simple-linear";
import { createClient } from "../utils/supabase/client";

const supabase = createClient(); // Reuse client initialization

// Fetch data for the trend graph
export async function FetchTrendGraphData(
  option: string,
  locationId: number,
): Promise<TrendGraphDataProps> {
  const type = option === "avg" ? "Average" : "Max";

  try {
    const { data, error } = await supabase
      .from(`pet_year_${option}`)
      .select()
      .eq("location_id", locationId);
    if (error || !data) {
      console.error("Error fetching trend graph data client:", error);
      return { years: [], year_pets: [], trendline_pets: [] };
    }

    const years = data.map(({ year }: { year: number }) => year);
    const year_pets = data.map(({ pet }: { pet: number }) => Number(pet));

    const reg = new SimpleLinearRegression(years, year_pets);
    const trendline_pets = years.map(
      (year: number) => Math.round(reg.predict(year) * 100) / 100,
    );
    return { years, year_pets, trendline_pets };
  } catch (err) {
    return { years: [], year_pets: [], trendline_pets: [] };
  }
}

// Fetch data for the reference graph
export async function FetchReferenceGraphData(
  year: string,
  locationId: number,
): Promise<ReferenceGraphDataProps> {
  try {
    const { data, error } = await supabase
      .from("pet_year")
      .select()
      .eq("location_id", locationId)
      .eq("year", year);

    if (error || !data) {
      console.error("Error fetching reference graph data server:", error);
      return { dates: [], pets: [] };
    }

    const dates = data.map(({ date }: { date: string }) => new Date(date));
    const pets = data.map(({ pet }: { pet: number }) => Number(pet));

    return { dates, pets };
  } catch (err) {
    console.error("Error in FetchReferenceGraphData server:", err);
    return { dates: [], pets: [] };
  }
}
