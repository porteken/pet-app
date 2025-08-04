// noinspection DuplicatedCode

import { http, HttpResponse } from "msw";

import { database } from "@/testing";

const BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";

export const apiHandlers = [
  http.get(`${BASE_URL}/rest/v1/locations`, ({ request }) => {
    const url = new URL(request.url);
    const locationId = url.searchParams.get("location_id");

    if (locationId) {
      const location = database.location.findFirst({
        where: { location_id: { equals: Number(locationId) } },
      });
      return HttpResponse.json([location]);
    }

    const locations = database.location.getAll();
    return HttpResponse.json(locations);
  }),

  http.get(`${BASE_URL}/rest/v1/pet_data`, ({ request }) => {
    const url = new URL(request.url);
    const locationId = url.searchParams.get("location_id");
    const measureType = url.searchParams.get("measure_type");

    const query: any = {};
    if (locationId) {
      query.location_id = { equals: Number(locationId) };
    }
    if (measureType) {
      query.measure_type = { equals: measureType };
    }

    const petData = database.petData.findMany({
      where: query,
    });

    const transformedData = petData.map(item => ({
      date: item.date,
      pet_count: item.pet_count,
    }));

    return HttpResponse.json(transformedData);
  }),

  http.get(`${BASE_URL}/rest/v1/trend_data`, ({ request }) => {
    const url = new URL(request.url);
    const locationId = url.searchParams.get("location_id");
    const measureType = url.searchParams.get("measure_type");

    const query: any = {};
    if (locationId) {
      query.location_id = { equals: Number(locationId) };
    }
    if (measureType) {
      query.measure_type = { equals: measureType };
    }

    const trendData = database.trendData.findMany({
      where: query,
    });

    const transformedData = trendData.map(item => ({
      pet_count: item.pet_count,
      year: item.year,
    }));

    return HttpResponse.json(transformedData);
  }),

  http.post(`${BASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      expires_in: 3600,
      refresh_token: "mock-refresh-token",
      user: {
        email: "test@example.com",
        id: "mock-user-id",
      },
    });
  }),

  http.get(`${BASE_URL}/rest/v1/error`, () => {
    return HttpResponse.json(
      { error: "Mock API Error", message: "This is a test error" },
      { status: 500 }
    );
  }),
];

export const authHandlers = [
  http.get(`${BASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      email: "test@example.com",
      id: "mock-user-id",
      user_metadata: {},
    });
  }),
];

export const handlers = [...apiHandlers, ...authHandlers];
