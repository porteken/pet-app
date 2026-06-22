# Historical PET USA

A comprehensive web application hosted [here](https://pet-app-ashen.vercel.app) that visualizes Physiological Equivalent Temperature (PET) data for the top 500 largest cities in the Contiguous United States from 2000 to 2025. The data pipeline for getting the data is [here](https://github.com/porteken/pet-data).

## Features

- **Contiguous US City Map**: View PET data across 500+ cities.
- **City Trend Charts**: Open a city modal from the map and view PET trends.
- **Seasonal Analysis**: Switch between annual, spring, summer, fall, and winter views.
- **Measure Selection**: Switch between average and maximum PET.
- **Forecasting**: Show 5–75 year forecasts for average and maximum PET with confidence ranges.
- **Thermal Stress Context**: See thermal stress descriptions and legend details alongside trend data.
- **City Detail Pages**: Open a city page with trend and reference charts.
- **Reference Comparison**: Compare the current year's PET with a selected historical year.
- **Rankings**: View cities ranked by PET with year, season, state, and thermal stress filters.
- **Theme Support**: Toggle between light and dark themes.

## What is PET?

The **Physiological Equivalent Temperature (PET)** is a method to measure the air temperature at which, in a typical indoor setting (without wind and solar radiation), the heat budget of the human body is balanced with the same core and skin temperature as under the complex outdoor conditions to be assessed.

In other words, PET measures thermal comfort based on:

- Temperature
- Humidity
- Wind speed
- Solar radiation
- Clothing

Based on [this study](https://bjsm.bmj.com/content/55/15/825), PET may provide better heat stress measurement than other metrics like WBGT and UTCI.

## Tech Stack

- **Frontend**: Next.js, React
- **UI**: shadcn/ui
- **Map**: Leaflet, MapLibre, react-map-gl
- **Charts**: Recharts
- **Data**: Postgres, Kysely
- **Monitoring**: Sentry
- **Testing**: Vitest, Playwright, Test Containers
- **Deployment**: Vercel
