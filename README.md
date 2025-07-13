# Historical PET USA

A comprehensive web application that visualizes Physiological Equivalent Temperature (PET) data for the top 500 largest cities in the United States from 2000 to 2023.

## 🌟 Features

- **Interactive Map**: Explore PET data across 500+ US cities with an interactive Leaflet map
- **Trend Analysis**: View average and maximum PET trends over time with regression analysis
- **Year Comparison**: Compare PET data between 2023 and any selected year
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

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: NextUI, Tailwind CSS
- **Maps**: React Leaflet, OpenStreetMap
- **Charts**: Plotly.js, React Plotly
- **Database**: Supabase (PostgreSQL)
- **Deployment**: DigitalOcean App Platform
- **Code Quality**: ESLint, Prettier, Husky
- **Testing**: Playwright (E2E Testing)

## 🧪 Testing

This project uses Playwright for end-to-end testing. The tests are configured to automatically start the Next.js development server before running.

### Test Coverage

The tests cover:

- Home page functionality and map display
- About page content and navigation
- Map page functionality
- Map interactions (markers, popups, navigation)
- Dynamic route pages for location-specific content
- Error handling for invalid routes
