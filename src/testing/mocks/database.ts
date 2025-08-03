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

export const seedDatabase = () => {
  const location = database.location.create({
    city: "Test City",
    lat: 40.7128,
    lng: -74.006,
    location_id: 1,
    state: "Test State",
  });

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

export type Location = ReturnType<typeof database.location.create>;
export type PetData = ReturnType<typeof database.petData.create>;
export type TrendData = ReturnType<typeof database.trendData.create>;
