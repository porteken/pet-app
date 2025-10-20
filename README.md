# Historical PET USA

A comprehensive web application hosted [here](https://pet-app-ashen.vercel.app) that visualizes Physiological Equivalent Temperature (PET) data for the top 500 largest cities in the United States from 2000 to 2025.

## 🌟 Features

- **Interactive Map**: Explore PET data across 500+ US cities with an interactive Leaflet map
- **Trend Analysis**: View average and maximum PET trends over time with regression analysis
- **Year Comparison**: Compare PET data between 2025 and any selected year
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Data**: Dynamic data fetching with Supabase backend

## 📚 What is PET?

The **Physiological Equivalent Temperature (PET)** is a method to measure the air temperature at which, in a typical indoor setting (without wind and solar radiation), the heat budget of the human body is balanced with the same core and skin temperature as under the complex outdoor conditions to be assessed.

In other words, PET measures thermal comfort based on:

- Temperature
- Humidity
- Wind speed
- Solar radiation
- Clothing

Based on [this study](https://bjsm.bmj.com/content/55/15/825), PET may provide better heat stress measurement than other metrics like WBGT and UTCI.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: NextUI, Tailwind CSS, Mantine
- **Maps**: React Leaflet, OpenStreetMap
- **Charts**: Plotly.js, React Plotly
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Error Monitoring**: Sentry
- **Testing**: Vitest (Unit), Playwright (E2E), MSW (API Mocking)
- **Code Quality**: ESLint, Prettier, Husky
- **Deployment**: Vercel
