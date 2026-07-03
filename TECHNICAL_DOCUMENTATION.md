# Room Management System - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Frontend Architecture](#frontend-architecture)
7. [Features & Capabilities](#features--capabilities)
8. [Visitors & Visits Management](#visitors--visits-management)
9. [Statistics & Analytics](#statistics--analytics)
10. [Security](#security)
11. [Deployment](#deployment)
12. [Development Setup](#development-setup)

---

## System Overview

The Room Management System is a comprehensive solution for managing meeting room bookings, user access, and resource allocation within an organization. The system provides real-time booking capabilities, conflict resolution, and administrative oversight.

### Key Features
- **Auto-Approval Booking System**: All bookings are automatically approved upon creation
- **Real-time Conflict Detection**: Prevents double-booking of rooms
- **Multi-role User Management**: Different access levels for different user types
- **Department-based Organization**: Rooms and users organized by departments
- **Responsive Web Interface**: Works on desktop, tablet, and mobile devices
- **Real-time Notifications**: Users receive notifications for booking updates
- **Visitor Management System**: Comprehensive tracking of external visitors and their visits
- **Advanced Analytics**: Detailed statistics and reporting for visitor patterns and room utilization

---

## Architecture

### Technology Stack

#### Backend (NestJS)
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Class-validator with DTOs
- **Documentation**: Swagger/OpenAPI (planned)

#### Frontend (Next.js)
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **State Management**: React Context + Custom Hooks
- **API Client**: Custom API client with error handling

#### Database
- **Primary Database**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: Prisma Migrate
- **Seeding**: Custom seed scripts

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • React 18      │    │ • REST API      │    │ • Prisma ORM    │
│ • Tailwind CSS  │    │ • JWT Auth      │    │ • Migrations    │
│ • Radix UI      │    │ • Role Guards   │    │ • Relations     │
│ • TypeScript    │    │ • Validation    │    │ • Indexes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Department    │    │      User       │    │      Room       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄───┤ departmentId    │    │ id (PK)         │
│ name            │    │ id (PK)         │    │ name            │
│ description     │    │ employeeId      │    │ capacity        │
│ floor           │    │ username        │    │ description     │
│ createdAt       │    │ email           │    │ amenities[]     │
│ updatedAt       │    │ password        │    │ floor           │
└─────────────────┘    │ role            │    │ building        │
                       │ firstName       │    │ x, y, width,    │
                       │ lastName        │    │ height          │
                       │ title           │    │ departmentId    │
                       │ phone           │    │ isUnderMainte-  │
                       │ isActive        │    │ nance           │
                       │ isApproved      │    │ createdAt       │
                       │ approvedById    │    │ updatedAt       │
                       │ approvedAt      │    └─────────────────┘
                       │ rejectedById    │             │
                       │ rejectedAt      │             │
                       │ createdAt       │             │
                       │ updatedAt       │             │
                       └─────────────────┘             │
                                │                      │
                                │                      │
                       ┌─────────────────┐             │
                       │    Booking      │◄────────────┘
                       ├─────────────────┤
                       │ id (PK)         │
                       │ title           │
                       │ roomId          │
                       │ organizerId     │
                       │ expectedAtten-  │
                       │ dees            │
                       │ internalAtten-  │
                       │ dees[]          │
                       │ externalAtten-  │
                       │ dees[]          │
                       │ purpose         │
                       │ agenda          │
                       │ startTime       │
                       │ endTime         │
                       │ status          │
                       │ isRecurring     │
                       │ recurrenceRule  │
                       │ requiredAmeni-  │
                       │ ties[]          │
                       │ approvedById    │
                       │ approvedAt      │
                       │ rejectedById    │
                       │ rejectedAt      │
                       │ rejectionReason │
                       │ parentBookingId │
                       │ createdAt       │
                       │ updatedAt       │
                       └─────────────────┘
                                │
                                │
                       ┌─────────────────┐
                       │  Notification   │
                       ├─────────────────┤
                       │ id (PK)         │
                       │ userId          │
                       │ title           │
                       │ message         │
                       │ type            │
                       │ relatedBookingId│
                       │ isRead          │
                       │ createdAt       │
                       └─────────────────┘
                                │
                                │
                       ┌─────────────────┐
                       │    Visitor      │
                       ├─────────────────┤
                       │ id (PK)         │
                       │ firstName       │
                       │ lastName        │
                       │ email           │
                       │ phone           │
                       │ createdAt       │
                       │ updatedAt       │
                       └─────────────────┘
                                │
                                │
                       ┌─────────────────┐
                       │     Visit       │◄────────────┐
                       ├─────────────────┤             │
                       │ id (PK)         │             │
                       │ checkedIn       │             │
                       │ checkedOut      │             │
                       │ purpose         │             │
                       │ bookingId (FK)  │◄────────────┘
                       │ visitorId (FK)  │
                       │ createdAt       │
                       │ updatedAt       │
                       └─────────────────┘
```

### Relationship Types

#### Primary Relationships
- **Department** → **User**: One-to-Many (1:N)
- **Department** → **Room**: One-to-Many (1:N)
- **User** → **Booking**: One-to-Many (1:N)
- **Room** → **Booking**: One-to-Many (1:N)
- **User** → **Notification**: One-to-Many (1:N)
- **Booking** → **Notification**: One-to-Many (1:N)

#### Visitor System Relationships
- **Visitor** → **Visit**: One-to-Many (1:N)
- **Visit** → **Booking**: Many-to-One (N:1, Optional)
- **Visit** → **Room**: Through Booking (N:1, Indirect)
- **Visit** → **Department**: Through Booking → Room (N:1, Indirect)

### Core Tables

#### 1. Department
```sql
CREATE TABLE "Department" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "floor" INTEGER,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
```

**Relationships:**
- One-to-Many with `Room`
- One-to-Many with `User`

#### 2. User
```sql
CREATE TABLE "User" (
  "id" SERIAL PRIMARY KEY,
  "employeeId" TEXT UNIQUE NOT NULL,
  "username" TEXT UNIQUE NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "role" "UserRole" DEFAULT 'EMPLOYEE',
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "title" TEXT,
  "phone" TEXT,
  "departmentId" INTEGER NOT NULL REFERENCES "Department"("id"),
  "isActive" BOOLEAN DEFAULT true,
  "isApproved" BOOLEAN DEFAULT false,
  "approvedById" INTEGER REFERENCES "User"("id"),
  "approvedAt" TIMESTAMP(3),
  "rejectedById" INTEGER REFERENCES "User"("id"),
  "rejectedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
```

**User Roles:**
- `SUPER_ADMIN`: Full system access
- `ADMIN`: Administrative access
- `DIRECTOR`: Department director access
- `SUB_DIRECTOR`: Sub-department access
- `EMPLOYEE`: Standard user access
- `GUEST`: Limited access

#### 3. Room
```sql
CREATE TABLE "Room" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "capacity" INTEGER NOT NULL,
  "description" TEXT,
  "amenities" TEXT[],
  "floor" INTEGER NOT NULL,
  "building" TEXT DEFAULT 'Main',
  "x" INTEGER,
  "y" INTEGER,
  "width" INTEGER,
  "height" INTEGER,
  "departmentId" INTEGER NOT NULL REFERENCES "Department"("id"),
  "isUnderMaintenance" BOOLEAN DEFAULT false,
  "maintenanceNotes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
```

#### 4. Booking
```sql
CREATE TABLE "Booking" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "roomId" INTEGER NOT NULL REFERENCES "Room"("id") ON DELETE CASCADE,
  "organizerId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expectedAttendees" INTEGER NOT NULL,
  "internalAttendees" TEXT[],
  "externalAttendees" TEXT[],
  "purpose" TEXT NOT NULL,
  "agenda" TEXT,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "status" "BookingStatus" DEFAULT 'PENDING',
  "isRecurring" BOOLEAN DEFAULT false,
  "recurrenceRule" TEXT,
  "requiredAmenities" TEXT[],
  "approvedById" INTEGER REFERENCES "User"("id"),
  "approvedAt" TIMESTAMP(3),
  "rejectedById" INTEGER REFERENCES "User"("id"),
  "rejectedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "parentBookingId" INTEGER REFERENCES "Booking"("id"),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
```

**Booking Statuses:**
- `PENDING`: Awaiting approval (legacy, not used in auto-approval system)
- `APPROVED`: Approved and confirmed
- `ONGOING`: Currently in progress
- `COMPLETED`: Finished
- `CANCELLED`: Cancelled by user
- `REJECTED`: Rejected by admin (legacy)

#### 5. Notification
```sql
CREATE TABLE "Notification" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "relatedBookingId" INTEGER REFERENCES "Booking"("id"),
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. Visitor
```sql
CREATE TABLE "Visitor" (
  "id" SERIAL PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
```

**Relationships:**
- One-to-Many with `Visit`

#### 7. Visit
```sql
CREATE TABLE "Visit" (
  "id" SERIAL PRIMARY KEY,
  "checkedIn" TIMESTAMP(3) NOT NULL,
  "checkedOut" TIMESTAMP(3),
  "purpose" TEXT,
  "bookingId" INTEGER,
  "visitorId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE,
  FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE
);
```

**Relationships:**
- Many-to-One with `Visitor`
- Many-to-One with `Booking` (optional)

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX "Booking_startTime_endTime_idx" ON "Booking"("startTime", "endTime");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");
CREATE INDEX "Room_departmentId_idx" ON "Room"("departmentId");
CREATE INDEX "Visit_checkedIn_idx" ON "Visit"("checkedIn");
CREATE INDEX "Visit_visitorId_idx" ON "Visit"("visitorId");
CREATE INDEX "Visit_bookingId_idx" ON "Visit"("bookingId");
```

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All API endpoints (except auth) require JWT authentication via Bearer token.

### Endpoints

#### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/register` | User registration | No |
| GET | `/auth/profile` | Get user profile | Yes |

#### Users
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/users` | Get all users | Yes | ADMIN, SUPER_ADMIN |
| GET | `/users/pending` | Get pending users | Yes | ADMIN, SUPER_ADMIN |
| GET | `/users/:id` | Get user by ID | Yes | ADMIN, SUPER_ADMIN |
| PATCH | `/users/:id` | Update user | Yes | ADMIN, SUPER_ADMIN |
| PATCH | `/users/:id/approve` | Approve user | Yes | ADMIN, SUPER_ADMIN |
| PATCH | `/users/:id/reject` | Reject user | Yes | ADMIN, SUPER_ADMIN |
| DELETE | `/users/:id` | Delete user | Yes | SUPER_ADMIN |

#### Rooms
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/rooms` | Get all rooms | Yes | All |
| GET | `/rooms/:id` | Get room by ID | Yes | All |
| GET | `/rooms/available` | Get available rooms | Yes | All |
| POST | `/rooms` | Create room | Yes | ADMIN, SUPER_ADMIN |
| PATCH | `/rooms/:id` | Update room | Yes | ADMIN, SUPER_ADMIN |
| PATCH | `/rooms/:id/maintenance` | Toggle maintenance | Yes | ADMIN, SUPER_ADMIN |
| DELETE | `/rooms/:id` | Delete room | Yes | SUPER_ADMIN |

#### Bookings
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/bookings` | Get all bookings | Yes | All |
| GET | `/bookings/:id` | Get booking by ID | Yes | All |
| POST | `/bookings` | Create booking | Yes | All |
| PATCH | `/bookings/:id` | Update booking | Yes | All |
| PATCH | `/bookings/:id/move` | Move booking | Yes | All |
| PATCH | `/bookings/:id/complete` | Complete booking | Yes | All |
| PATCH | `/bookings/:id/cancel` | Cancel booking | Yes | All |
| DELETE | `/bookings/:id` | Delete booking | Yes | ADMIN, SUPER_ADMIN |

#### Departments
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/departments` | Get all departments | Yes | All |
| GET | `/departments/:id` | Get department by ID | Yes | All |
| POST | `/departments` | Create department | Yes | ADMIN, SUPER_ADMIN |
| PATCH | `/departments/:id` | Update department | Yes | ADMIN, SUPER_ADMIN |
| DELETE | `/departments/:id` | Delete department | Yes | SUPER_ADMIN |

#### Dashboard
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/dashboard/overview` | Get dashboard overview | Yes | All |
| GET | `/dashboard/rooms-summary` | Get rooms summary | Yes | All |
| GET | `/dashboard/bookings-summary` | Get bookings summary | Yes | All |

#### Conflicts
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/conflicts/bookings` | Get conflicting bookings | Yes | ADMIN, SUPER_ADMIN |
| GET | `/conflicts/check/:id` | Check booking conflicts | Yes | ADMIN, SUPER_ADMIN |
| POST | `/conflicts/resolve/:id` | Resolve conflict | Yes | ADMIN, SUPER_ADMIN |

#### Visitors
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/visitors` | Get all visitors with filtering | Yes | ADMIN |
| POST | `/visitors/visit` | Create visitor with visit | Yes | ADMIN |
| GET | `/visitors/:id` | Get specific visitor | Yes | ADMIN |
| PATCH | `/visitors/:id` | Update visitor information | Yes | ADMIN |

#### Visits
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/visits` | Get all visits with filtering | Yes | ADMIN |
| GET | `/visits/filters` | Get available filter options | Yes | ADMIN |
| POST | `/visits` | Create new visit record | Yes | ADMIN |
| GET | `/visits/:id` | Get specific visit | Yes | ADMIN |
| PATCH | `/visits/:id` | Update visit record | Yes | ADMIN |
| PATCH | `/visits/:id/checkout` | Process visitor checkout | Yes | ADMIN |

#### Statistics
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/statistics/visitors` | Get visitor statistics | Yes | ADMIN |

### Request/Response Examples

#### Create Booking
```json
POST /bookings
{
  "title": "Team Meeting",
  "roomId": 1,
  "purpose": "Weekly standup",
  "agenda": "Discuss project progress",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "expectedAttendees": 5,
  "internalAttendees": ["John Doe", "Jane Smith"],
  "externalAttendees": ["Client ABC"],
  "requiredAmenities": ["projector", "whiteboard"]
}
```

#### Response
```json
{
  "id": 123,
  "title": "Team Meeting",
  "status": "APPROVED",
  "room": {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10
  },
  "organizer": {
    "id": 1,
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe"
  },
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "createdAt": "2024-01-15T09:00:00Z"
}
```

---

## User Roles & Permissions

### Role Hierarchy
```
ADMIN > EMPLOYEE > GUEST
```

### Permission Matrix

| Feature | ADMIN | EMPLOYEE | GUEST |
|---------|-------|----------|-------|
| **User Management** |
| View all users | ✅ | ❌ | ❌ |
| Approve/reject users | ✅ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ |
| **Room Management** |
| View rooms | ✅ | ✅ | ✅ |
| Create/edit rooms | ✅ | ❌ | ❌ |
| Delete rooms | ✅ | ❌ | ❌ |
| Toggle maintenance | ✅ | ❌ | ❌ |
| **Booking Management** |
| Create bookings | ✅ | ✅ | ❌ |
| View own bookings | ✅ | ✅ | ❌ |
| View all bookings | ✅ | ❌ | ❌ |
| Edit own bookings | ✅ | ✅ | ❌ |
| Edit any booking | ✅ | ❌ | ❌ |
| Delete bookings | ✅ | ❌ | ❌ |
| **Department Management** |
| View departments | ✅ | ✅ | ✅ |
| Create/edit departments | ✅ | ❌ | ❌ |
| Delete departments | ✅ | ❌ | ❌ |
| **Dashboard & Reports** |
| View dashboard | ✅ | ✅ | ❌ |
| View reports | ✅ | ❌ | ❌ |
| **Conflict Resolution** |
| View conflicts | ✅ | ❌ | ❌ |
| Resolve conflicts | ✅ | ❌ | ❌ |
| **Visitor Management** |
| View visitors | ✅ | ❌ | ❌ |
| Create visitors | ✅ | ❌ | ❌ |
| Manage visits | ✅ | ❌ | ❌ |
| View statistics | ✅ | ❌ | ❌ |

---

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **State Management**: React Context + Custom Hooks
- **API Client**: Custom fetch-based client

### Project Structure
```
room-management-frontend-next/
├── app/                    # Next.js App Router
│   ├── bookings/          # Booking pages
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   └── profile/          # User profile pages
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── booking/          # Booking-related components
│   ├── calendar/         # Calendar components
│   ├── dashboard/        # Dashboard components
│   ├── rooms/            # Room management components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── styles/               # Global styles
```

### Key Components

#### 1. MainDashboard
- Central navigation component
- Role-based access control
- Responsive sidebar navigation

#### 2. BookingGrid
- Real-time room availability display
- Grid and list view modes
- Department and date filtering
- Auto-approval system integration

#### 3. CalendarSection
- Interactive calendar view
- Booking creation and editing
- Conflict detection and resolution

#### 4. UserManagement
- User approval/rejection system
- Role assignment
- Department management

### State Management
- **AuthContext**: User authentication state
- **AppContext**: Global application state
- **Custom Hooks**: API data fetching and caching

---

## Features & Capabilities

### 1. Auto-Approval Booking System
- **Instant Booking**: All bookings are automatically approved
- **Conflict Prevention**: Real-time conflict detection prevents double-booking
- **Self-Service**: Users can manage their own bookings without admin intervention

### 2. Real-time Room Management
- **Live Availability**: Real-time room status updates
- **Maintenance Mode**: Rooms can be marked for maintenance
- **Capacity Management**: Automatic capacity checking

### 3. Department Organization
- **Hierarchical Structure**: Rooms and users organized by departments
- **Department-specific Access**: Users see only relevant rooms
- **Department Management**: Admins can create and manage departments

### 4. Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Grid/List Views**: Multiple viewing options
- **Touch-Friendly**: Optimized for touch interactions

### 5. Notification System
- **Real-time Updates**: Instant notifications for booking changes
- **Email Integration**: Email notifications for important events
- **In-app Notifications**: Dashboard notification center

### 6. Conflict Resolution
- **Automatic Detection**: System detects booking conflicts
- **Alternative Suggestions**: Suggests alternative rooms/times
- **Manual Resolution**: Admin tools for conflict resolution

### 7. Reporting & Analytics
- **Usage Statistics**: Room utilization reports
- **Booking Analytics**: Booking patterns and trends
- **Department Reports**: Department-specific usage data
- **Visitor Analytics**: Comprehensive visitor statistics and trends
- **Visit Tracking**: Detailed visit duration and purpose analysis

---

## Visitors & Visits Management

### System Architecture

The visitor management system is built as a separate module within the NestJS backend, providing comprehensive tracking and management of external visitors.

#### Backend Components

**Visitors Module (`src/visitors/`):**
- `visitors.controller.ts`: REST API endpoints for visitor management
- `visitors.service.ts`: Business logic for visitor operations
- `dto/`: Data Transfer Objects for validation
- `visitors.module.ts`: Module configuration and dependencies

**Visits Module (`src/visits/`):**
- `visits.controller.ts`: REST API endpoints for visit management
- `visits.service.ts`: Business logic for visit operations
- `dto/`: Data Transfer Objects for visit validation
- `visits.module.ts`: Module configuration and dependencies

#### Database Schema

**Visitor Model:**
```sql
CREATE TABLE "Visitor" (
  "id" SERIAL PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
```

**Visit Model:**
```sql
CREATE TABLE "Visit" (
  "id" SERIAL PRIMARY KEY,
  "checkedIn" TIMESTAMP(3) NOT NULL,
  "checkedOut" TIMESTAMP(3),
  "purpose" TEXT,
  "bookingId" INTEGER,
  "visitorId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE,
  FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE
);
```

#### API Endpoints

**Visitor Management:**
- `GET /visitors`: Retrieve all visitors with pagination and filtering
- `POST /visitors/visit`: Create new visitor with first visit
- `GET /visitors/:id`: Get specific visitor with visit history
- `PATCH /visitors/:id`: Update visitor information

**Visit Management:**
- `GET /visits`: Retrieve all visits with filtering
- `GET /visits/filters`: Get available filter options
- `POST /visits`: Create new visit record
- `GET /visits/:id`: Get specific visit details
- `PATCH /visits/:id`: Update visit information
- `PATCH /visits/:id/checkout`: Process visitor checkout

#### Security Implementation

**Access Control:**
- All endpoints require JWT authentication
- Admin role required for all operations
- Role-based guards automatically applied
- Input validation using class-validator DTOs

**Data Validation:**
```typescript
export class CreateVisitorDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

#### Frontend Integration

**React Components:**
- `visitors.tsx`: Main visitor management page
- `visitors-table.tsx`: Data table with pagination
- `visitor-filters.tsx`: Filtering and search controls
- `add-visitor.tsx`: Modal for creating new visitors
- `visitor-details.tsx`: Modal for viewing visitor details
- `statistics.tsx`: Statistics dashboard component

**State Management:**
- React hooks for API data fetching
- Local state for form management
- Real-time updates for visit status changes

---

## Statistics & Analytics

### System Architecture

The statistics system provides comprehensive analytics and reporting capabilities for visitor management and room utilization.

#### Backend Components

**Statistics Module (`src/statistics/`):**
- `statistics.controller.ts`: REST API endpoints for statistics
- `statistics.service.ts`: Business logic for data aggregation
- `dto/`: Data Transfer Objects for statistics responses
- `entities/`: Entity definitions for statistics data
- `statistics.module.ts`: Module configuration

#### Data Aggregation

**Time-based Analytics:**
```typescript
// Daily statistics aggregation
const dailyStats = visits.reduce((acc, visit) => {
  const date = visit.checkedIn.toISOString().split('T')[0];
  const duration = visit.checkedOut ? 
    (visit.checkedOut.getTime() - visit.checkedIn.getTime()) / 60000 : 0;
  
  const entry = acc.find(e => e.date === date);
  if (entry) {
    entry.visitors += 1;
    entry.avgDuration = (entry.avgDuration + duration) / 2;
  } else {
    acc.push({ date, visitors: 1, avgDuration: duration });
  }
  return acc;
}, []);
```

**Department Analytics:**
```typescript
// Department visitor distribution
const departmentStats = visits.reduce((acc, visit) => {
  const dept = visit.booking?.room?.department?.name || 'Unknown';
  const existing = acc.find(d => d.department === dept);
  
  if (existing) {
    existing.visitors += 1;
  } else {
    acc.push({ department: dept, visitors: 1 });
  }
  return acc;
}, []);
```

#### API Endpoints

**Statistics Endpoint:**
- `GET /statistics/visitors`: Comprehensive visitor statistics
  - Query parameters: `timeRange`, `startDate`, `endDate`
  - Returns: Daily, monthly, yearly stats, peak hours, department/room/purpose analytics

#### Response Structure

```typescript
interface StatsDataDto {
  dailyStats: DailyStat[];
  monthlyStats: MonthlyStat[];
  yearlyStats: YearlyStat[];
  peakHours: PeakHourStat[];
  departmentStats: DepartmentStat[];
  roomStats: RoomStat[];
  purposeStats: PurposeStat[];
  summary: SummaryStat;
}
```

#### Frontend Visualization

**Chart Components:**
- **Line Charts**: Time-based trends using Recharts
- **Bar Charts**: Peak hours and purpose analysis
- **Pie Charts**: Department and room distribution
- **Responsive Design**: Adapts to all screen sizes

**Data Export:**
```typescript
const exportStatistics = () => {
  const rows: string[] = [];
  rows.push(`Résumé`);
  rows.push(`Total visiteurs,${statsData.summary.totalVisitors}`);
  rows.push(`Durée moyenne,${statsData.summary.avgVisitDuration.toFixed(2)} min`);
  
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n');
  const encodedUri = encodeURI(csvContent);
  // Trigger download
};
```

#### Performance Optimization

**Database Queries:**
- Optimized Prisma queries with proper includes
- Efficient date range filtering
- Pagination for large datasets
- Indexed queries on frequently accessed fields

**Caching Strategy:**
- Potential for Redis caching in future versions
- Client-side data caching with React hooks
- Real-time updates without full data refresh

#### Security & Access Control

**Authentication:**
- JWT token required for all statistics endpoints
- Admin role verification on all requests
- Secure data transmission over HTTPS

**Data Privacy:**
- Visitor data anonymization options
- Configurable data retention policies
- Audit logging for statistics access

---

## Security

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Session Management**: Automatic token refresh

### Authorization
- **Role-Based Access Control**: Granular permission system
- **Route Guards**: Protected routes based on user roles
- **API Security**: All endpoints protected with JWT

### Data Protection
- **Input Validation**: Comprehensive input validation
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: React's built-in XSS protection

### Security Headers
- **CORS Configuration**: Proper CORS setup
- **Content Security Policy**: CSP headers (planned)
- **Rate Limiting**: API rate limiting (planned)

---

## Deployment

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/room_management"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV="production"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Room Management System"
```

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: room_management
      POSTGRES_USER: username
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./room-management-backend-nest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://username:password@postgres:5432/room_management"
    depends_on:
      - postgres

  frontend:
    build: ./room-management-frontend-next
    ports:
      - "3001:3000"
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Production Checklist
- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

---

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Backend Setup
```bash
cd room-management-backend-nest
npm install
cp .env.example .env
# Configure .env with your database URL
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### Frontend Setup
```bash
cd room-management-frontend-next
npm install
cp .env.example .env.local
# Configure .env.local with your API URL
npm run dev
```

### Database Setup
```bash
# Create database
createdb room_management

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

### Development Scripts
```bash
# Backend
npm run start:dev    # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

---

## API Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Error Handling

### Backend Error Responses
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Frontend Error Handling
- Global error boundary
- API error interceptor
- User-friendly error messages
- Retry mechanisms

---

## Performance Considerations

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization with Prisma

### Frontend Optimization
- Code splitting with Next.js
- Image optimization
- Lazy loading
- Caching strategies

### Caching
- API response caching
- Database query caching
- Static asset caching

---

## Monitoring & Logging

### Logging
- Structured logging with Winston (planned)
- Request/response logging
- Error tracking
- Performance monitoring

### Metrics
- API response times
- Database query performance
- User activity tracking
- System resource usage

---

## Future Enhancements

### Planned Features
- [ ] Mobile app (React Native)
- [ ] Advanced reporting dashboard
- [ ] Integration with calendar systems (Outlook, Google)
- [ ] Email notifications
- [ ] Room equipment management
- [ ] Recurring booking templates
- [ ] Advanced conflict resolution
- [ ] API rate limiting
- [ ] Swagger documentation
- [ ] Unit and integration tests

### Technical Improvements
- [ ] Microservices architecture
- [ ] Redis caching
- [ ] Message queue system
- [ ] Real-time updates with WebSockets
- [ ] Advanced security features
- [ ] Performance monitoring
- [ ] Automated testing pipeline

---

## Support & Maintenance

### Documentation
- API documentation (Swagger)
- User guides
- Admin documentation
- Developer documentation

### Maintenance
- Regular security updates
- Database maintenance
- Performance optimization
- Bug fixes and improvements

### Support Channels
- Technical support email
- Issue tracking system
- Documentation portal
- Community forum (planned)

---

*This documentation is maintained and updated regularly. For the latest version, please refer to the project repository.*
