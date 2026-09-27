# Smart City Dashboard - Architecture Documentation

## System Overview

The Smart City Dashboard is a full-stack web application built using modern web technologies. It follows a client-server architecture with the following key components:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    React Application                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │   Pages     │  │  Components │  │    State Management │  │   │
│  │  │  (App       │  │  (UI +      │  │      (Zustand)      │  │   │
│  │  │   Router)   │  │   Modules)  │  │                     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVER (Next.js)                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    API Routes                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │    Auth     │  │    Seed     │  │    Future APIs      │  │   │
│  │  │   /api/auth │  │  /api/seed  │  │                     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Business Logic                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │    Auth     │  │    Data     │  │    Validation       │  │   │
│  │  │   Service   │  │   Service   │  │                     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Prisma Client
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE (SQLite)                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      Tables                                   │   │
│  │  User, Session, TrafficSensor, TrafficReading,               │   │
│  │  EnvironmentalSensor, AQIReading, WeatherReading,            │   │
│  │  Incident, CCTVCamera, EmergencyService,                     │   │
│  │  WaterReservoir, WaterUsage, WaterLeak,                      │   │
│  │  EnergyGrid, EnergyReading, StreetLight,                     │   │
│  │  WasteBin, WasteTruck, ParkingLot, News,                     │   │
│  │  GovernmentScheme, ServiceRequest, CitizenReport             │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Architecture Layers

### 1. Presentation Layer (Frontend)

The presentation layer is built with React and Next.js App Router:

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main entry point
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── auth/              # Authentication components
│   │   ├── OnboardingScreen.tsx
│   │   └── AuthScreen.tsx
│   ├── dashboard/         # Dashboard shell
│   │   └── Dashboard.tsx
│   ├── modules/           # Feature modules
│   │   ├── OverviewModule.tsx
│   │   ├── TrafficModule.tsx
│   │   └── ... (other modules)
│   └── ui/                # Reusable UI components (shadcn/ui)
```

**Key Design Decisions:**
- **Component Composition**: Modular components for reusability
- **Client-side Rendering**: Using `'use client'` directive for interactive components
- **Animation**: Framer Motion for smooth transitions
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### 2. State Management Layer

State is managed using Zustand with localStorage persistence:

```typescript
// Store Structure
src/store/index.ts
├── useAuthStore           # Authentication state
│   ├── user               # Current user
│   ├── token              # JWT token
│   ├── isAuthenticated    # Auth status
│   └── hasSeenOnboarding  # Onboarding status
├── useDashboardStore      # Dashboard preferences
│   ├── activeModule       # Current module
│   ├── sidebarCollapsed   # Sidebar state
│   └── theme              # Light/dark mode
├── useTrafficStore        # Traffic data
├── useEnvironmentalStore  # Environmental data
├── useWaterStore          # Water management data
├── useNewsStore           # News data
└── useSafetyStore         # Safety data
```

**State Flow:**
```
User Action → Component → Store Action → State Update → UI Re-render
```

### 3. API Layer (Backend)

The API layer follows Next.js API Routes convention:

```
src/app/api/
├── auth/
│   └── route.ts           # POST: Login, Register
└── seed/
    └── route.ts           # GET: Seed demo data
```

**API Design:**
- RESTful principles
- JSON request/response
- Error handling with appropriate HTTP status codes
- JWT-based authentication

### 4. Data Access Layer

Prisma ORM provides type-safe database access:

```typescript
// Database client
src/lib/db.ts → PrismaClient instance

// Schema definition
prisma/schema.prisma → Database models and relations
```

**Database Models:**
```
User ─┬─ Session (1:N)
      ├─ Incident (1:N)
      ├─ ServiceRequest (1:N)
      └─ CitizenReport (1:N)

TrafficSensor ─── TrafficReading (1:N)
EnvironmentalSensor ─┬─ AQIReading (1:N)
                      └─ WeatherReading (1:N)
WaterReservoir ─── ReservoirReading (1:N)
WaterZone ─── WaterUsage (1:N)
EnergyGrid ─── EnergyReading (1:N)
```

## Component Architecture

### Page Flow

```
page.tsx
    │
    ├── Loading State → Loading Screen
    │
    ├── !hasSeenOnboarding → OnboardingScreen
    │                           │
    │                           └── 6-slide carousel
    │
    ├── !isAuthenticated → AuthScreen
    │                         │
    │                         ├── Login Tab
    │                         └── Register Tab
    │
    └── isAuthenticated → Dashboard
                              │
                              ├── Sidebar (Navigation)
                              ├── Header (Title, Notifications)
                              └── Module Content
                                   │
                                   ├── OverviewModule
                                   ├── TrafficModule
                                   ├── EnvironmentalModule
                                   ├── SafetyModule
                                   ├── WaterModule
                                   ├── EnergyModule
                                   ├── WasteModule
                                   ├── ParkingModule
                                   └── NewsModule
```

### Component Hierarchy

```
Dashboard
├── Sidebar
│   ├── Logo
│   ├── Navigation (navItems.map)
│   │   └── NavItem (with Tooltip)
│   └── UserSection
│       ├── Avatar
│       └── SettingsDropdown
├── Header
│   ├── Title
│   └── Notifications
└── ModuleContent
    └── [ActiveModule]
```

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │   Server    │     │  Database   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                    │                    │
       │  POST /api/auth    │                    │
       │  {email, password} │                    │
       │───────────────────>│                    │
       │                    │  getUserByEmail()  │
       │                    │───────────────────>│
       │                    │     User data      │
       │                    │<───────────────────│
       │                    │                    │
       │                    │  verify password   │
       │                    │  generate JWT      │
       │                    │                    │
       │  {user, token}     │                    │
       │<───────────────────│                    │
       │                    │                    │
       │  Store in Zustand  │                    │
       │  + localStorage    │                    │
       │                    │                    │
```

## Data Flow

### Live Data Simulation

The dashboard simulates real-time data updates:

```typescript
// In OverviewModule.tsx
useEffect(() => {
  const interval = setInterval(() => {
    setLiveStats(prev => ({
      ...prev,
      traffic: { ...prev.traffic, vehicles: updated_value },
      aqi: { ...prev.aqi, value: updated_value },
      water: { ...prev.water, daily: updated_value },
    }));
  }, 3000); // Update every 3 seconds

  return () => clearInterval(interval);
}, []);
```

### Module Data Structure

Each module follows a similar pattern:

```typescript
interface ModuleProps {
  data: ModuleData;        // From store or API
  isLoading: boolean;      // Loading state
  onRefresh: () => void;   // Refresh callback
}

// Module structure
export default function Module({ data, isLoading, onRefresh }: ModuleProps) {
  // 1. Local state for filters, selections
  // 2. Effects for data fetching
  // 3. Event handlers
  // 4. Render UI components
}
```

## Security Considerations

### Authentication Security

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Tokens**: Signed with secret key
3. **Token Storage**: localStorage (consider httpOnly cookies for production)
4. **Session Management**: Tokens stored in database

### API Security

1. **Input Validation**: Server-side validation
2. **Error Handling**: Generic error messages
3. **Rate Limiting**: Consider adding for production

### Production Recommendations

1. Use environment variables for secrets
2. Implement rate limiting
3. Add CSRF protection
4. Use httpsOnly cookies for tokens
5. Implement proper CORS policies

## Performance Optimizations

### Frontend

1. **Code Splitting**: Automatic with Next.js App Router
2. **Lazy Loading**: Components loaded on demand
3. **Memoization**: React.memo for expensive components
4. **Virtualization**: Consider for long lists

### Backend

1. **Database Indexing**: Add indexes for frequent queries
2. **Connection Pooling**: Prisma handles this
3. **Caching**: Consider adding Redis for production

## Scalability Considerations

### Horizontal Scaling

For production deployment:

1. **Database**: Migrate to PostgreSQL or MySQL
2. **Caching**: Add Redis for session/data caching
3. **Load Balancing**: Use PM2 or Kubernetes
4. **CDN**: Serve static assets via CDN

### Module Extensions

To add new modules:

1. Create module component in `src/components/modules/`
2. Add to navigation in `Dashboard.tsx`
3. Add store if needed in `src/store/index.ts`
4. Add database models if needed in `prisma/schema.prisma`
5. Create API routes if needed

## Error Handling

### Client-Side

```typescript
try {
  const response = await fetch('/api/endpoint');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  // Handle success
} catch (error) {
  // Show error to user
  setError(error instanceof Error ? error.message : 'An error occurred');
}
```

### Server-Side

```typescript
try {
  // Operation
  return NextResponse.json({ success: true, data });
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Testing Strategy

### Unit Tests (Recommended)

- Test utility functions
- Test store actions
- Test component rendering

### Integration Tests (Recommended)

- Test API endpoints
- Test authentication flow
- Test data operations

### E2E Tests (Recommended)

- Test complete user flows
- Test cross-browser compatibility
- Test responsive design

---

This architecture provides a solid foundation for a production-ready Smart City Dashboard. The modular design allows for easy extension and maintenance.
