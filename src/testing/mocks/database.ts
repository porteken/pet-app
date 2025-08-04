import { drop, factory, primaryKey } from "@mswjs/data";

let locationCounter = 1;
let petDataCounter = 1;
let trendDataCounter = 1;

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

export const resetDatabase = () => {
  locationCounter = 1;
  petDataCounter = 1;
  trendDataCounter = 1;

  drop(database);
};

export type Location = ReturnType<typeof database.location.create>;
