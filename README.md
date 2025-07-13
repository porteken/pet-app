# Historical PET USA

A comprehensive web application that visualizes Physiological Equivalent Temperature (PET) data for the top 500 largest cities in the United States from 2000 to 2023.

## 🌟 Features

- **Interactive Map**: Explore PET data across 500+ US cities with an interactive Leaflet map
- **Trend Analysis**: View average and maximum PET trends over time with regression analysis
- **Year Comparison**: Compare PET data between 2023 and any selected year
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Data**: Dynamic data fetching with Supabase backend
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## 🚀 Live Demo

Visit the live application: [https://pet-app-vd6wy.ondigitalocean.app/](https://pet-app-vd6wy.ondigitalocean.app/)

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

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account and project

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/porteken/pet-app.git
   cd pet-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Create a Supabase project
   - Set up the required tables (see Database Schema section)
   - Import your PET data

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Tables

#### `locations`

```sql
CREATE TABLE locations (
  location_id SERIAL PRIMARY KEY,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL
);
```

#### `pet_year`

```sql
CREATE TABLE pet_year (
  id SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES locations(location_id),
  date DATE NOT NULL,
  year VARCHAR(4) NOT NULL,
  pet DECIMAL(8, 2) NOT NULL
);
```

#### `pet_year_avg`

```sql
CREATE TABLE pet_year_avg (
  id SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES locations(location_id),
  year INTEGER NOT NULL,
  pet DECIMAL(8, 2) NOT NULL
);
```

#### `pet_year_max`

```sql
CREATE TABLE pet_year_max (
  id SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES locations(location_id),
  year INTEGER NOT NULL,
  pet DECIMAL(8, 2) NOT NULL
);
```

## 🧪 Testing

### Testing

Currently no testing framework is configured. You can add your preferred testing solution (Jest, Vitest, Playwright, etc.) as needed.

## 📝 Available Scripts

| Script               | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start development server     |
| `npm run build`      | Build for production         |
| `npm run start`      | Start production server      |
| `npm run lint`       | Run ESLint                   |
| `npm run lint:fix`   | Fix ESLint errors            |
| `npm run type-check` | Run TypeScript type checking |
| `npm run format`     | Format code with Prettier    |
| `npm run test`       | No tests configured          |
| `npm run analyze`    | Analyze bundle size          |

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── [id]/              # Dynamic city pages
│   ├── about/             # About page
│   ├── map/               # Map page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── about/             # About page components
│   ├── home/              # Home page components
│   ├── page/              # City page components
│   ├── fetchClient.ts     # Client-side data fetching
│   ├── fetchServer.ts     # Server-side data fetching
│   ├── generateGraph.tsx  # Graph generation
│   ├── headerBar.tsx      # Navigation header
│   ├── selectOptions.ts   # Select options
│   └── types.ts           # TypeScript types
└── utils/                 # Utility functions
    ├── constants.ts       # Application constants
    ├── errors.ts          # Error handling
    ├── validation.ts      # Data validation
    └── supabase/          # Supabase configuration
```

## 🚀 Deployment

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure environment variables
3. Set build command: `npm run build`
4. Set run command: `npm start`
5. Deploy

### Environment Variables

| Variable                        | Description            | Required |
| ------------------------------- | ---------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL   | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes      |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Ensure accessibility compliance
- Follow the existing code style
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NextUI](https://nextui.org/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [OpenStreetMap](https://www.openstreetmap.org/) for map data
- [Plotly](https://plotly.com/) for interactive charts

## 📞 Support

If you have any questions or need support, please:

1. Check the [Issues](https://github.com/porteken/pet-app/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer

---

**Note**: This application is for educational and research purposes. The PET data should be used in accordance with scientific research standards.
