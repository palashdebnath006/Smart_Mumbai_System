# Authorization Implementation Guide

This document provides a comprehensive guide to the role-based authorization system implemented in the Smart City Dashboard. It details all the changes made, files created/modified, and how to maintain the code.

## Table of Contents

1. [Overview](#overview)
2. [Files Created](#files-created)
3. [Files Modified](#files-modified)
4. [Admin Features by Module](#admin-features-by-module)
5. [How Authorization Works](#how-authorization-works)
6. [Local Development Updates](#local-development-updates)
7. [Testing Admin Features](#testing-admin-features)

---

## Overview

The Smart City Dashboard now implements role-based access control (RBAC) with two primary roles:
- **Admin**: Full access to all features including add, edit, and delete operations
- **Citizen**: Read-only access to view all data and dashboards

Admin-only features are hidden from regular users, providing a clean interface while maintaining security.

---

## Files Created

### 1. Authorization Hook
**File:** `src/hooks/useAdmin.ts`

```typescript
'use client';

import { useAuthStore } from '@/store';

export function useIsAdmin(): boolean {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin';
}

export function useUserRole(): string | null {
  const user = useAuthStore((state) => state.user);
  return user?.role ?? null;
}

export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.isAuthenticated);
}

export function useHasRole(role: string): boolean {
  const user = useAuthStore((state) => state.user);
  return user?.role === role;
}

export function useCanManage(): boolean {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin' || user?.role === 'officer';
}
```

**Usage:**
```typescript
import { useIsAdmin } from '@/hooks/useAdmin';

function MyComponent() {
  const isAdmin = useIsAdmin();
  
  return (
    <div>
      {isAdmin && <Button>Admin Only Action</Button>}
    </div>
  );
}
```

### 2. Admin Components
**Directory:** `src/components/admin/`

#### AdminButton.tsx
```typescript
import { useIsAdmin } from '@/hooks/useAdmin';

export function AdminButton({ children, showLock, ...props }) {
  const isAdmin = useIsAdmin();
  
  if (!isAdmin) {
    if (showLock) {
      return <Button disabled><Lock />{children}</Button>;
    }
    return null;
  }
  
  return <Button {...props}>{children}</Button>;
}

export function AdminOnly({ children, fallback }) {
  const isAdmin = useIsAdmin();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
}
```

#### AdminDialog.tsx
Reusable dialog component for admin forms with automatic role checking.

#### index.ts
Exports all admin components and hooks for easy importing.

### 3. Admin API Route
**File:** `src/app/api/admin/route.ts`

Handles all CRUD operations for:
- Traffic sensors and incidents
- Safety incidents, emergency services, and CCTV cameras
- Water reservoirs and leak reports
- News articles and government schemes
- Waste collection trucks
- Parking lots

---

## Files Modified

### 1. TrafficModule.tsx
**Location:** `src/components/modules/TrafficModule.tsx`

**Changes:**
- Added `useIsAdmin` hook import
- Added `Add Sensor` button in Sensors tab (admin only)
- Added `Resolve` button for each incident (admin only)
- Added dialog for adding new sensors
- Added dialog for updating incident status

**Admin Features:**
- Add new traffic sensors
- Change incident status (active → resolved)

### 2. SafetyModule.tsx
**Location:** `src/components/modules/SafetyModule.tsx`

**Changes:**
- Added CRUD operations for incidents
- Added CRUD operations for emergency services
- Added ability to add new CCTV cameras
- Added edit and delete buttons for each item

**Admin Features:**
- Add/Edit/Delete safety incidents
- Add/Edit/Delete emergency services
- Add/Delete CCTV cameras

### 3. WaterModule.tsx
**Location:** `src/components/modules/WaterModule.tsx`

**Changes:**
- Added update dialog for reservoir capacity
- Added CRUD operations for leak reports
- Added edit buttons on reservoir cards
- Added add/edit/delete buttons for leaks

**Admin Features:**
- Update reservoir capacity and status
- Add/Edit/Delete leak reports

### 4. NewsModule.tsx
**Location:** `src/components/modules/NewsModule.tsx`

**Changes:**
- Added `Add News` button in header
- Added `Add Scheme` button in schemes tab
- Added edit/delete buttons on each news card
- Added edit/delete buttons on each scheme card
- Added forms for creating/editing news and schemes

**Admin Features:**
- Add/Edit/Delete news articles
- Add/Edit/Delete government schemes
- Pin/unpin announcements

### 5. WasteModule.tsx
**Location:** `src/components/modules/WasteModule.tsx`

**Changes:**
- Added `Add Truck` button in Collection Fleet section
- Added edit button on each truck card
- Added dialog for adding/editing trucks

**Admin Features:**
- Add new collection trucks
- Edit truck details (driver, status, route)

### 6. ParkingModule.tsx
**Location:** `src/components/modules/ParkingModule.tsx`

**Changes:**
- Added `Add Location` button in header
- Added edit/delete buttons on each parking card
- Added dialog for adding/editing parking locations
- Added delete confirmation dialog

**Admin Features:**
- Add new parking locations
- Edit total spaces, available spaces, and rates
- Delete parking locations

---

## Admin Features by Module

### Traffic Module
| Feature | Action | Admin | Citizen |
|---------|--------|-------|---------|
| View traffic flow | Read | ✓ | ✓ |
| View sensors | Read | ✓ | ✓ |
| Add new sensor | Create | ✓ | ✗ |
| Update incident status | Update | ✓ | ✗ |

### Safety Module
| Feature | Action | Admin | Citizen |
|---------|--------|-------|---------|
| View incidents | Read | ✓ | ✓ |
| Add incident | Create | ✓ | ✗ |
| Edit incident | Update | ✓ | ✗ |
| Delete incident | Delete | ✓ | ✗ |
| Add emergency service | Create | ✓ | ✗ |
| Edit emergency service | Update | ✓ | ✗ |
| Delete emergency service | Delete | ✓ | ✗ |
| Add CCTV camera | Create | ✓ | ✗ |
| Delete CCTV camera | Delete | ✓ | ✗ |

### Water Module
| Feature | Action | Admin | Citizen |
|---------|--------|-------|---------|
| View reservoirs | Read | ✓ | ✓ |
| Update reservoir capacity | Update | ✓ | ✗ |
| Add leak report | Create | ✓ | ✗ |
| Edit leak report | Update | ✓ | ✗ |
| Delete leak report | Delete | ✓ | ✗ |

### News Module
| Feature | Action | Admin | Citizen |
|---------|--------|-------|---------|
| View news | Read | ✓ | ✓ |
| Add news article | Create | ✓ | ✗ |
| Edit news article | Update | ✓ | ✗ |
| Delete news article | Delete | ✓ | ✗ |
| Add government scheme | Create | ✓ | ✗ |
| Edit government scheme | Update | ✓ | ✗ |
| Delete government scheme | Delete | ✓ | ✗ |

### Waste Module
| Feature | Action | Admin | Citizen |
|---------|--------|-------|---------|
| View bins status | Read | ✓ | ✓ |
| View collection fleet | Read | ✓ | ✓ |
| Add collection truck | Create | ✓ | ✗ |
| Edit truck details | Update | ✓ | ✗ |

### Parking Module
| Feature | Action | Admin | Citizen |
|---------|--------|-------|---------|
| View parking locations | Read | ✓ | ✓ |
| Add parking location | Create | ✓ | ✗ |
| Edit spaces and rates | Update | ✓ | ✗ |
| Delete parking location | Delete | ✓ | ✗ |

---

## How Authorization Works

### 1. User Authentication
When a user logs in, their role is stored in the Zustand store:

```typescript
// In store/index.ts
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'officer' | 'citizen';
}

// Auth store persists to localStorage
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'smart-city-auth' }
  )
);
```

### 2. Role Checking in Components
Components use the `useIsAdmin` hook to conditionally render admin features:

```typescript
function TrafficModule() {
  const isAdmin = useIsAdmin();
  
  return (
    <div>
      <CardHeader>
        <CardTitle>Traffic Sensors</CardTitle>
        {isAdmin && (
          <Button onClick={openAddDialog}>
            <Plus /> Add Sensor
          </Button>
        )}
      </CardHeader>
    </div>
  );
}
```

### 3. API Authorization
The admin API route checks authorization before processing requests:

```typescript
async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return false;
  
  const user = await validateToken(token);
  return user?.role === 'admin';
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminAuth(request);
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    );
  }
  
  // Process admin operation...
}
```

---

## Local Development Updates

If you're building locally, here's what you need to update:

### Step 1: Create New Files

Create these new files:

1. **`src/hooks/useAdmin.ts`** - Authorization hooks
2. **`src/components/admin/AdminButton.tsx`** - Admin-only button component
3. **`src/components/admin/AdminDialog.tsx`** - Admin dialog component
4. **`src/components/admin/index.ts`** - Export file
5. **`src/app/api/admin/route.ts`** - Admin API route

### Step 2: Update Existing Module Files

Replace these module files with the updated versions:
- `src/components/modules/TrafficModule.tsx`
- `src/components/modules/SafetyModule.tsx`
- `src/components/modules/WaterModule.tsx`
- `src/components/modules/NewsModule.tsx`
- `src/components/modules/WasteModule.tsx`
- `src/components/modules/ParkingModule.tsx`

### Step 3: Verify Dependencies

Make sure your `package.json` has these dependencies (they should already be there):
```json
{
  "dependencies": {
    "framer-motion": "^12.23.2",
    "recharts": "^2.15.4",
    "lucide-react": "^0.525.0"
  }
}
```

### Step 4: Run Database Migrations (if needed)

If using Prisma with the database:
```bash
bun run db:push
bun run db:generate
```

### Step 5: Test the Application

```bash
bun run dev
```

---

## Testing Admin Features

### 1. Login as Admin
Use these credentials:
- Email: `admin@smartcity.gov`
- Password: `admin123`

### 2. Navigate to Modules
Click through each module to verify admin buttons appear:
- Traffic → Sensors tab → "Add Sensor" button
- Traffic → Incidents tab → "Resolve" button on incidents
- Safety → "Add" buttons for incidents, services, CCTV
- Water → Edit icons on reservoirs, "Add Report" for leaks
- News → "Add News" and "Add Scheme" buttons
- Waste → "Add Truck" button in Collection Fleet
- Parking → "Add Location" button, edit/delete icons

### 3. Test CRUD Operations
1. Click "Add" buttons to open dialogs
2. Fill in forms and submit
3. Verify data appears in the list
4. Test edit functionality
5. Test delete functionality

### 4. Test Citizen Access
1. Logout and login as citizen:
   - Email: `citizen@smartcity.gov`
   - Password: `citizen123`
2. Navigate to all modules
3. Verify no admin buttons are visible
4. Verify all data is still readable

---

## Summary of Code Patterns

### Pattern 1: Conditional Rendering
```typescript
const isAdmin = useIsAdmin();

return (
  <div>
    {isAdmin && <AdminButton onClick={handleAction}>Admin Action</AdminButton>}
  </div>
);
```

### Pattern 2: Admin-Only Section
```typescript
<AdminOnly>
  <div className="admin-controls">
    <Button>Edit</Button>
    <Button>Delete</Button>
  </div>
</AdminOnly>
```

### Pattern 3: Form Dialog with Admin Check
```typescript
const [dialogOpen, setDialogOpen] = useState(false);
const isAdmin = useIsAdmin();

// Only admin can open dialog
const handleOpenDialog = () => {
  if (!isAdmin) return;
  setDialogOpen(true);
};

return (
  <>
    <Button onClick={handleOpenDialog} disabled={!isAdmin}>
      Add Item
    </Button>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/* Form content */}
    </Dialog>
  </>
);
```

---

## Troubleshooting

### Issue: Admin buttons not showing
**Solution:** 
1. Verify you're logged in as admin
2. Check browser console for errors
3. Clear localStorage and login again

### Issue: API returns 403 Forbidden
**Solution:**
1. Verify token is being sent in Authorization header
2. Check token hasn't expired
3. Verify user role in database

### Issue: Changes not persisting
**Solution:**
1. Currently using local state (mock data)
2. For persistence, implement API calls to backend
3. Connect to real database using Prisma

---

This documentation covers all the changes made to implement the role-based authorization system. For questions or issues, refer to the code comments or the original module files.
