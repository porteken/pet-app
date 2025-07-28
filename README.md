# Historical PET USA

A comprehensive web application hosted [here](https://pet-app-ashen.vercel.app) that visualizes Physiological Equivalent Temperature (PET) data for the top 500 largest cities in the United States from 2000 to 2023.

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

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/porteken/pet-app.git
cd pet-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

4. Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

This project includes comprehensive testing with multiple strategies:

### Available Test Commands

```bash
# Run all tests
npm run test:all

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Coverage

- **Unit Tests**: Component and utility function testing with Vitest
- **Integration Tests**: API and database interaction testing with MSW
- **E2E Tests**: Full user journey testing with Playwright
- **Accessibility Tests**: WCAG compliance and screen reader compatibility
- **Cross-Browser Tests**: Multi-browser compatibility testing

## 📁 Project Structure

Following [Bulletproof React](https://github.com/alan2207/bulletproof-react) architecture principles:

```
src/
├── app/                    # Next.js App Router pages
├── assets/                 # Static assets (images, fonts)
├── components/             # Shared UI components
├── config/                 # Configuration files
├── features/               # Feature-based modules
├── hooks/                  # Custom React hooks
├── lib/                    # Reusable libraries
├── stores/                 # Global state management
├── testing/                # Test utilities and mocks
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## 🔧 Development

### Code Quality

The project enforces code quality through:

- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit validation
- **TypeScript**: Static type checking

### Performance

- **Turbopack**: Fast bundler for development and builds
- **Bundle Analysis**: `BUNDLE_ANALYZER_ENABLED=true npm run build`
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js automatic image optimization

## 📊 Data Sources

PET data is sourced from climate research institutions and processed to provide:

- Daily PET calculations for 500+ US cities
- Historical trends from 2000-2023
- Seasonal and annual aggregations
- Statistical analysis and projections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Climate data provided by research institutions
- OpenStreetMap for map tiles
- Supabase for backend infrastructure
