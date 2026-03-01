# Historical PET USA

A comprehensive web application hosted [here](https://pet-app-ashen.vercel.app) that visualizes Physiological Equivalent Temperature (PET) data for the top 500 largest cities in the United States from 2000 to 2025.

## Features

- **US City Map**: View PET data across 500+ cities.
- **City Trend Charts**: Open a city modal from the map and view PET trends.
- **Measure Selection**: Switch between average and maximum PET.
- **Forecasting**: Show 5-75 year forecasts for average PET with confidence ranges.
- **City Detail Pages**: Open a city page with trend and reference charts.
- **Reference Comparison**: Compare 2025 PET with a selected year (2000-2024).
- **Rankings**: View cites ranked by PET.

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

- **Frontend**: Next.js, React, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **Map**: Leaflet, React Leaflet, OpenStreetMap
- **Charts**: Plotly.js
- **Data**: Supabase, TanStack Query
- **Monitoring**: Sentry
- **Testing**: Vitest, Playwright, Testing Library, MSW
- **Quality**: ESLint, Prettier, Husky
- **Deployment**: Vercel
