# Smart City Dashboard

A comprehensive, feature-rich Smart City Dashboard built with Next.js 16, TypeScript, and Tailwind CSS. This dashboard provides real-time monitoring and management capabilities for various city infrastructure systems.

![Smart City Dashboard](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## Features

### Core Modules

1. **Traffic Management**
   - Real-time traffic flow monitoring
   - Vehicle count and average speed tracking
   - Congestion level indicators
   - Incident reporting and management
   - Traffic sensor status monitoring

2. **Environmental Monitoring**
   - Air Quality Index (AQI) tracking
   - PM2.5, PM10, CO2, NO2, O3, SO2 levels
   - Weather data integration
   - Environmental sensor management

3. **Public Safety & Security**
   - Incident reporting and tracking
   - CCTV camera monitoring
   - Emergency services directory
   - Real-time alerts and notifications

4. **Water Management**
   - Reservoir level monitoring
   - Daily consumption tracking
   - Leak detection and reporting
   - Zone-wise usage analysis

5. **Energy Monitoring**
   - Power grid status
   - Renewable energy percentage
   - Street light management
   - Consumption analytics

6. **Waste Management**
   - Smart bin monitoring
   - Collection route optimization
   - Truck tracking
   - Fill level alerts

7. **Parking Management**
   - Real-time parking availability
   - Multiple parking lot monitoring
   - Rate information

8. **News & Announcements**
   - Government news feed
   - Policy updates
   - Public announcements
   - Government schemes directory

### User Features

- **Onboarding Flow**: Interactive 6-slide carousel introducing the dashboard
- **Authentication**: Secure JWT-based local authentication
- **Role-based Access**: Admin, Officer, and Citizen roles
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live data simulation with 3-second intervals

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (New York style) |
| State Management | Zustand with persistence |
| Database | SQLite with Prisma ORM |
| Authentication | JWT with bcryptjs |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |

## Color Palette

The dashboard uses a Blue-Green (Ocean-Teal) color palette:

- **Primary (Teal)**: `#14b8a6` - `#022d22`
- **Secondary (Ocean)**: `#1eb3ca` - `#06333d`
- **Status Colors**:
  - Good: `#10b981` (Green)
  - Warning: `#f59e0b` (Amber)
  - Danger: `#ef4444` (Red)
  - Info: `#3b82f6` (Blue)

## Project Structure

```
smart-city-dashboard/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/route.ts  # Authentication API
│   │   │   └── seed/route.ts  # Database seeding
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── modules/
│   │   │   ├── OverviewModule.tsx
│   │   │   ├── TrafficModule.tsx
│   │   │   ├── EnvironmentalModule.tsx
│   │   │   ├── SafetyModule.tsx
│   │   │   ├── WaterModule.tsx
│   │   │   ├── EnergyModule.tsx
│   │   │   ├── WasteModule.tsx
│   │   │   ├── ParkingModule.tsx
│   │   │   └── NewsModule.tsx
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── db.ts              # Database client
│   │   └── utils.ts           # Utility functions
│   └── store/
│       └── index.ts           # Zustand stores
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

## Quick Start

### Prerequisites

- Node.js 18+ or Bun runtime
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Extract the project ZIP file**
   ```bash
   unzip smart-city-dashboard.zip
   cd smart-city-dashboard
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./db/custom.db"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   ```

4. **Initialize the database**
   ```bash
   bun run db:push
   # or
   npm run db:push
   ```

5. **Seed demo data** (optional but recommended)
   Visit `http://localhost:3000/api/seed` in your browser or use:
   ```bash
   curl http://localhost:3000/api/seed
   ```

6. **Start the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

7. **Open in browser**
   Navigate to `http://localhost:3000`

### Demo Credentials

After seeding the database, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartcity.gov | admin123 |
| Officer | officer@smartcity.gov | officer123 |
| Citizen | citizen@smartcity.gov | citizen123 |

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Create and run migrations |
| `bun run db:reset` | Reset database |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth` | Login or Register |
| POST | `/api/auth/logout` | Logout user |

### Data Seeding

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seed` | Seed demo data |

### Request/Response Examples

**Login:**
```json
POST /api/auth
{
  "action": "login",
  "email": "admin@smartcity.gov",
  "password": "admin123"
}

Response:
{
  "user": {
    "id": "clx...",
    "email": "admin@smartcity.gov",
    "name": "Admin User",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Register:**
```json
POST /api/auth
{
  "action": "register",
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "citizen"
}
```

## Database Schema

The application uses the following main models:

- **User**: User accounts and authentication
- **Session**: Active user sessions
- **TrafficSensor/TrafficReading**: Traffic monitoring data
- **EnvironmentalSensor/AQIReading/WeatherReading**: Environmental data
- **Incident/CCTVCamera/EmergencyService**: Public safety data
- **WaterReservoir/WaterUsage/WaterLeak**: Water management data
- **EnergyGrid/EnergyReading/StreetLight**: Energy monitoring data
- **WasteBin/WasteTruck**: Waste management data
- **ParkingLot**: Parking availability
- **News/GovernmentScheme**: News and announcements

See `prisma/schema.prisma` for complete schema definition.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ for Smart Cities
