/**
 * MSW Database - In-memory data store for testing
 * Following Bulletproof React pattern for mocked API data
 */

import { drop, factory, primaryKey } from "@mswjs/data";

// Counter for generating unique IDs
let locationCounter = 1;
let petDataCounter = 1;
let trendDataCounter = 1;

// Mock data factories following your app's data structure
export const database = factory({
  location: {
    city: () => "Test City",
    lat: () => 40.7128,
    lng: () => -74.006,
    location_id: primaryKey(() => locationCounter++),
    state: () => "Test State",
  },
  petData: {
    date: () => new Date("2023-01-01"),
    id: primaryKey(() => petDataCounter++),
    location_id: () => 1,
    measure_type: () => "avg",
    pet_count: () => Math.floor(Math.random() * 100) + 1,
  },
  trendData: {
    id: primaryKey(() => trendDataCounter++),
    location_id: () => 1,
    measure_type: () => "avg",
    pet_count: () => Math.floor(Math.random() * 100) + 1,
    year: () => 2023,
  },
});

// Utility functions for test data management
export const resetDatabase = () => {
  // Reset counters to avoid duplicate IDs
  locationCounter = 1;
  petDataCounter = 1;
  trendDataCounter = 1;

  drop(database);
};

export const seedDatabase = () => {
  // Seed with default test data
  const location = database.location.create({
    city: "Test City",
    lat: 40.7128,
    lng: -74.006,
    location_id: 1,
    state: "Test State",
  });

  // Create some reference data
  database.petData.create({
    date: new Date("2023-01-01"),
    location_id: 1,
    measure_type: "avg",
    pet_count: 15,
  });

  database.petData.create({
    date: new Date("2023-02-01"),
    location_id: 1,
    measure_type: "avg",
    pet_count: 25,
  });

  // Create some trend data
  database.trendData.create({
    location_id: 1,
    measure_type: "avg",
    pet_count: 5,
    year: 2021,
  });

  database.trendData.create({
    location_id: 1,
    measure_type: "avg",
    pet_count: 10,
    year: 2022,
  });

  database.trendData.create({
    location_id: 1,
    measure_type: "avg",
    pet_count: 15,
    year: 2023,
  });

  return { location };
};

// Export types for use in tests
export type Location = ReturnType<typeof database.location.create>;
export type PetData = ReturnType<typeof database.petData.create>;
export type TrendData = ReturnType<typeof database.trendData.create>;
