import { http, HttpResponse } from "msw";

import { database } from "./database";

const BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";

export const apiHandlers = [
  // Mock location data endpoint
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

  // Mock pet data endpoint (for reference graphs)
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

    // Transform data to match your expected format
    const transformedData = petData.map(item => ({
      date: item.date,
      pet_count: item.pet_count,
    }));

    return HttpResponse.json(transformedData);
  }),

  // Mock trend data endpoint
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

    // Transform data to match your expected format
    const transformedData = trendData.map(item => ({
      pet_count: item.pet_count,
      year: item.year,
    }));

    return HttpResponse.json(transformedData);
  }),

  // Mock authentication endpoints
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

  // Mock error scenarios
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

// Export all handlers
export const handlers = [...apiHandlers, ...authHandlers];
