# Room Management System - Comprehensive Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Database Schema](#database-schema)
4. [Backend API Documentation](#backend-api-documentation)
5. [Frontend Architecture](#frontend-architecture)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Functional Features](#functional-features)
8. [Security Implementation](#security-implementation)
9. [Deployment Guide](#deployment-guide)
10. [Development Setup](#development-setup)

---

## System Overview

The **Room Management System** is a comprehensive full-stack application designed for Al Baraka Bank to manage meeting room bookings, user access, and resource allocation within the organization. The system provides real-time booking capabilities, conflict resolution, and administrative oversight with a modern, responsive user interface.

### Key Business Features
- **Auto-Approval System**: All bookings are automatically approved upon creation
- **Real-time Conflict Detection**: Prevents double-booking of rooms
- **Multi-role User Management**: Different access levels (Admin, Employee, Guest)
- **Department-based Organization**: Rooms and users organized by departments
- **Responsive Web Interface**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Notifications**: Users receive instant notifications for booking updates
- **Advanced Filtering**: Multiple views show different booking states based on context

---

## Architecture & Technology Stack

### Backend Architecture (NestJS)

```
┌─────────────────────────────────────────────────────────────┐
│                    NestJS Backend                           │
├─────────────────────────────────────────────────────────────┤
│  Controllers Layer                                          │
│  ├── AuthController          ├── BookingsController        │
│  ├── UsersController         ├── RoomsController           │
│  ├── DepartmentsController   ├── DashboardController       │
│  ├── ApprovalsController     ├── ConflictsController       │
│  └── NotificationsController └── CronController           │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ├── AuthService             ├── BookingsService           │
│  ├── UsersService            ├── RoomsService              │
│  ├── DepartmentsService      ├── DashboardService          │
│  ├── ApprovalsService        ├── ConflictsService          │
│  └── NotificationsService    └── CronService              │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer (Prisma ORM)                            │
│  ├── Database Models         ├── Migrations                │
│  ├── Relationships           └── Seed Data                 │
├─────────────────────────────────────────────────────────────┤
│  Authentication & Authorization                             │
│  ├── JWT Tokens              ├── Role-based Guards         │
│  ├── Password Hashing        └── Route Protection          │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture (Next.js)

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                        │
├─────────────────────────────────────────────────────────────┤
│  Pages Layer                                                │
│  ├── /login                 ├── /dashboard                 │
│  ├── /register              ├── /bookings                  │
│  ├── /profile               └── /departments               │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                           │
│  ├── Auth Components        ├── Booking Components         │
│  ├── Dashboard Components   ├── Room Management            │
│  ├── Calendar Components    └── Admin Components           │
├─────────────────────────────────────────────────────────────┤
│  State Management                                           │
│  ├── AuthContext            ├── AppContext                 │
│  ├── Custom Hooks           └── API Client                 │
├─────────────────────────────────────────────────────────────┤
│  UI Framework                                               │
│  ├── Tailwind CSS           ├── Radix UI Components        │
│  ├── Custom Components      └── Responsive Design          │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Class-validator with DTOs
- **Password Hashing**: bcrypt
- **API Documentation**: Swagger/OpenAPI (planned)

#### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **State Management**: React Context + Custom Hooks
- **API Client**: Custom API client with error handling
- **Icons**: Lucide React

#### Database
- **Primary Database**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: Prisma Migrate
- **Seeding**: Custom seed scripts

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
```

### Database Models

#### 1. Department Model
```typescript
model Department {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  floor       Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  rooms       Room[]
  users       User[]
}
```

#### 2. User Model
```typescript
model User {
  id        Int       @id @default(autoincrement())
  employeeId String   @unique // Bank employee ID
  username  String    @unique
  email     String    @unique
  password  String    // hashed password
  role      UserRole  @default(EMPLOYEE)
  
  // Personal information
  firstName String
  lastName  String
  title     String?   // Job title
  phone     String?
  
  // Department association
  departmentId Int
  department   Department @relation(fields: [departmentId], references: [id])
  
  // Status
  isActive     Boolean   @default(true)
  isApproved   Boolean   @default(false)
  
  // Approval tracking
  approvedById Int?
  approvedBy   User?     @relation("UserApprover", fields: [approvedById], references: [id])
  approvedAt   DateTime?
  rejectedById Int?
  rejectedBy   User?     @relation("UserRejecter", fields: [rejectedById], references: [id])
  rejectedAt   DateTime?
  rejectionReason String?
  
  // Relations
  organizedBookings Booking[] @relation("BookingOrganizer")
  approvedBookings  Booking[] @relation("BookingApprover")
  rejectedBookings  Booking[] @relation("BookingRejecter")
  notifications Notification[]
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

#### 3. Room Model
```typescript
model Room {
  id          Int         @id @default(autoincrement())
  name        String      @unique
  capacity    Int
  description String?
  amenities   String[]    // e.g., ["projector", "whiteboard", "video-conference"]
  
  // Location tracking
  floor       Int
  building    String      @default("Main")
  x           Int?
  y           Int?
  width       Int?
  height      Int?
  
  // Department association
  departmentId Int
  department   Department @relation(fields: [departmentId], references: [id])
  
  // Status management
  isUnderMaintenance Boolean @default(false)
  maintenanceNotes   String?
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  bookings    Booking[]
}
```

#### 4. Booking Model
```typescript
model Booking {
  id         Int            @id @default(autoincrement())
  title      String         // Meeting title
  roomId     Int
  room       Room           @relation(fields: [roomId], references: [id], onDelete: Cascade)

  organizerId Int           // The person who created the booking
  organizer  User           @relation("BookingOrganizer", fields: [organizerId], references: [id], onDelete: Cascade)

  // Participants
  expectedAttendees Int     // To compare with room capacity
  internalAttendees String[] // Names of internal participants
  externalAttendees String[] // Names of external participants
  
  // Meeting details
  purpose    String
  agenda     String?
  startTime  DateTime
  endTime    DateTime
  status     BookingStatus  @default(PENDING)
  isRecurring Boolean       @default(false)
  recurrenceRule String?    // e.g., "RRULE:FREQ=WEEKLY;INTERVAL=1"
  
  // Resources needed
  requiredAmenities String[]
  
  // Approval tracking
  approvedById Int?
  approvedBy   User?     @relation("BookingApprover", fields: [approvedById], references: [id])
  approvedAt   DateTime?
  rejectedById Int?
  rejectedBy   User?     @relation("BookingRejecter", fields: [rejectedById], references: [id])
  rejectedAt   DateTime?
  rejectionReason String?
  
  // For recurring bookings
  parentBookingId Int?
  parentBooking   Booking?   @relation("RecurringBookings", fields: [parentBookingId], references: [id])
  childBookings   Booking[]  @relation("RecurringBookings")
  
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt
  notifications Notification[]
  
  @@index([startTime, endTime])
  @@index([status])
}
```

#### 5. Notification Model
```typescript
model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  type      NotificationType
  relatedBookingId Int?
  relatedBooking Booking? @relation(fields: [relatedBookingId], references: [id])
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### Enums

#### UserRole
```typescript
enum UserRole {
  ADMIN     // Full system access
  EMPLOYEE  // Standard user access
  GUEST     // Limited access
}
```

#### BookingStatus
```typescript
enum BookingStatus {
  PENDING   // Awaiting approval
  APPROVED  // Approved and active
  REJECTED  // Rejected by admin
  CANCELLED // Cancelled by user
  COMPLETED // Meeting completed
  ONGOING   // Currently in progress
}
```

#### NotificationType
```typescript
enum NotificationType {
  BOOKING_APPROVED
  BOOKING_REJECTED
  BOOKING_REMINDER
  ROOM_MAINTENANCE
  NEW_BOOKING_REQUEST
}
```

---

## Backend API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

#### POST /auth/login
Login user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@bank.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "employeeId": "EMP001",
    "username": "john.doe",
    "email": "john.doe@bank.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE",
    "department": {
      "id": 1,
      "name": "IT Department"
    }
  }
}
```

#### POST /auth/register
Register new user account.

**Request Body:**
```json
{
  "employeeId": "EMP002",
  "username": "jane.smith",
  "email": "jane.smith@bank.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "title": "Senior Developer",
  "phone": "+1234567890",
  "departmentId": 1
}
```

#### GET /auth/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### User Management Endpoints

#### GET /users
Get all users (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "employeeId": "EMP001",
    "username": "john.doe",
    "email": "john.doe@bank.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE",
    "isActive": true,
    "isApproved": true,
    "department": {
      "id": 1,
      "name": "IT Department"
    }
  }
]
```

#### GET /users/pending
Get pending user approvals (Admin only).

#### PATCH /users/:id/approve
Approve a pending user (Admin only).

**Request Body:**
```json
{
  "isApproved": true
}
```

### Room Management Endpoints

#### GET /rooms
Get all rooms with filtering options.

**Query Parameters:**
- `departmentId`: Filter by department
- `floor`: Filter by floor
- `status`: Filter by maintenance status

**Response:**
```json
[
  {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 12,
    "description": "Large conference room with projector",
    "amenities": ["projector", "whiteboard", "video-conference"],
    "floor": 2,
    "building": "Main",
    "isUnderMaintenance": false,
    "department": {
      "id": 1,
      "name": "IT Department"
    }
  }
]
```

#### POST /rooms
Create new room (Admin only).

**Request Body:**
```json
{
  "name": "Conference Room B",
  "capacity": 8,
  "description": "Medium conference room",
  "amenities": ["projector", "whiteboard"],
  "floor": 2,
  "building": "Main",
  "departmentId": 1
}
```

#### GET /rooms/available
Get available rooms for a specific time period.

**Query Parameters:**
- `startTime`: ISO string
- `endTime`: ISO string
- `capacity`: Minimum capacity required

### Booking Management Endpoints

#### GET /bookings
Get all bookings with filtering.

**Query Parameters:**
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `roomId`: Filter by room
- `status`: Filter by booking status
- `organizerId`: Filter by organizer

**Response:**
```json
[
  {
    "id": 1,
    "title": "Team Meeting",
    "room": {
      "id": 1,
      "name": "Conference Room A",
      "capacity": 12
    },
    "organizer": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "username": "john.doe"
    },
    "purpose": "Weekly team sync",
    "startTime": "2025-09-24T10:00:00.000Z",
    "endTime": "2025-09-24T11:00:00.000Z",
    "status": "APPROVED",
    "expectedAttendees": 8,
    "internalAttendees": ["John Doe", "Jane Smith"],
    "externalAttendees": ["client@company.com"]
  }
]
```

#### POST /bookings
Create new booking (Auto-approved).

**Request Body:**
```json
{
  "title": "Client Meeting",
  "roomId": 1,
  "purpose": "Project discussion",
  "agenda": "Review project progress and next steps",
  "startTime": "2025-09-24T14:00:00.000Z",
  "endTime": "2025-09-24T15:30:00.000Z",
  "expectedAttendees": 5,
  "internalAttendees": ["John Doe", "Jane Smith"],
  "externalAttendees": ["client@company.com"],
  "requiredAmenities": ["projector", "video-conference"]
}
```

#### PATCH /bookings/:id/cancel
Cancel a booking.

#### PATCH /bookings/:id/complete
Mark booking as completed.

### Dashboard Endpoints

#### GET /dashboard/overview
Get dashboard overview statistics.

**Response:**
```json
{
  "totalRooms": 15,
  "totalBookings": 45,
  "activeBookings": 12,
  "availableRooms": 8,
  "maintenanceRooms": 2,
  "todayBookings": 8,
  "upcomingBookings": 15
}
```

#### GET /dashboard/rooms-summary
Get room status summary.

#### GET /dashboard/bookings-summary
Get booking statistics.

### Department Management Endpoints

#### GET /departments
Get all departments.

#### POST /departments
Create new department (Admin only).

#### GET /departments/:id/stats
Get department statistics.

### Conflict Resolution Endpoints

#### GET /conflicts/bookings
Get booking conflicts.

#### GET /conflicts/check/:bookingId
Check for conflicts with a specific booking.

#### POST /conflicts/resolve/:bookingId
Resolve a booking conflict.

### Notification Endpoints

#### GET /notifications
Get user notifications.

#### PATCH /notifications/:id/read
Mark notification as read.

---

## Frontend Architecture

### Project Structure

```
room-booking-dashboard/
├── app/                          # Next.js 14 App Router
│   ├── bookings/                 # Booking pages
│   │   ├── page.tsx             # Bookings list page
│   │   └── bookings-grid.tsx    # Grid view component
│   ├── dashboard/                # Dashboard pages
│   │   ├── page.tsx             # Main dashboard
│   │   └── departments/         # Department management
│   ├── login/                   # Authentication pages
│   ├── profile/                 # User profile pages
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── admin/                   # Admin-specific components
│   │   ├── UserManagement.tsx
│   │   ├── BookingApprovals.tsx
│   │   └── DepartmentsManagement.tsx
│   ├── auth/                    # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── bookings/                # Booking components
│   │   ├── BookingsSection.tsx
│   │   ├── NewBookingDialog.tsx
│   │   └── EditBookingDialog.tsx
│   ├── calendar/                # Calendar components
│   │   ├── CalendarSection.tsx
│   │   ├── CalendarGrid.tsx
│   │   └── DayTimeline.tsx
│   ├── dashboard/               # Dashboard components
│   │   ├── DashboardSection.tsx
│   │   ├── StatsCards.tsx
│   │   └── Sidebar.tsx
│   ├── rooms/                   # Room management
│   │   ├── RoomsSection.tsx
│   │   ├── RoomCard.tsx
│   │   └── AddRoomDialog.tsx
│   └── ui/                      # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
├── contexts/                    # React contexts
│   ├── AuthContext.tsx          # Authentication state
│   └── AppContext.tsx           # Global app state
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts               # Authentication hook
│   ├── useApi.ts                # API data fetching
│   └── useMobile.ts             # Mobile detection
├── lib/                         # Utility libraries
│   ├── api.ts                   # API client
│   ├── utils.ts                 # Utility functions
│   └── colors.ts                # Color definitions
└── styles/                      # Global styles
    ├── globals.css
    └── albaraka.css
```

### Key Components

#### 1. MainDashboard
Central navigation component with role-based access control.

**Features:**
- Responsive sidebar navigation
- Role-based menu items
- User profile integration
- Mobile-friendly design

#### 2. BookingGrid
Real-time room availability display with multiple view modes.

**Features:**
- Grid and list view modes
- Department and date filtering
- Real-time availability updates
- Auto-approval system integration
- Shows only approved and ongoing bookings

#### 3. CalendarSection
Interactive calendar view for booking management.

**Features:**
- Month, week, and day views
- Booking creation and editing
- Conflict detection and resolution
- Room and user filtering
- Shows only approved and ongoing bookings

#### 4. BookingsSection
Complete booking management interface.

**Features:**
- Shows all booking states (pending, approved, rejected, etc.)
- Advanced search and filtering
- Booking creation and editing
- Status management
- Full booking details

#### 5. UserManagement
Admin interface for user approval and management.

**Features:**
- Pending user approval
- Role assignment
- User activation/deactivation
- Department management

### State Management

#### AuthContext
Manages user authentication state and provides authentication methods.

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isUser: () => boolean;
}
```

#### Custom Hooks

**useAuth**
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

**useBookings**
```typescript
const { data: bookings, loading, error, refetch } = useBookings({
  startDate: '2025-09-24',
  endDate: '2025-09-25'
});
```

**useRooms**
```typescript
const { data: rooms, loading, error } = useRooms();
```

### API Client

Centralized API client with error handling and authentication.

```typescript
// API client configuration
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};
```

---

## User Roles & Permissions

### 1. ADMIN Role

**Full System Access:**
- ✅ View and manage all users
- ✅ Approve/reject user registrations
- ✅ Create, edit, and delete departments
- ✅ Create, edit, and delete rooms
- ✅ View all bookings across the system
- ✅ Manage booking conflicts
- ✅ Access dashboard analytics
- ✅ System configuration and maintenance

**Default Admin User:**
- Email: `admin@bank.com`
- Password: `password123`

### 2. EMPLOYEE Role

**Standard User Access:**
- ✅ View approved and ongoing bookings
- ✅ Create new bookings (auto-approved)
- ✅ Edit and cancel own bookings
- ✅ View own booking history
- ✅ Access calendar views
- ✅ View room availability
- ❌ Cannot access admin functions
- ❌ Cannot approve other users

### 3. GUEST Role

**Limited Access:**
- ✅ View approved and ongoing bookings
- ✅ View room availability
- ✅ Limited booking capabilities
- ❌ Cannot edit or cancel bookings
- ❌ Cannot access user management

### Permission Matrix

| Feature | ADMIN | EMPLOYEE | GUEST |
|---------|-------|----------|-------|
| User Management | ✅ Full | ❌ None | ❌ None |
| Room Management | ✅ Full | ❌ None | ❌ None |
| Booking Creation | ✅ Full | ✅ Own Only | ✅ Limited |
| Booking Management | ✅ All | ✅ Own Only | ❌ View Only |
| Dashboard Access | ✅ Full | ✅ Limited | ✅ Limited |
| Calendar Views | ✅ All | ✅ All | ✅ All |
| Conflict Resolution | ✅ Full | ❌ None | ❌ None |

---

## Functional Features

### 1. Auto-Approval Booking System

**How it Works:**
1. User creates a booking through the interface
2. System validates the booking (time, room availability, capacity)
3. If valid, booking is automatically approved and created
4. User receives immediate confirmation
5. Booking appears in all relevant views

**Benefits:**
- Instant booking confirmation
- Reduced administrative overhead
- Improved user experience
- Self-service capability

### 2. Real-time Conflict Detection

**Conflict Prevention:**
- Automatic validation during booking creation
- Real-time availability checking
- Capacity verification
- Time overlap detection

**Conflict Resolution:**
- Alternative room suggestions
- Time slot adjustments
- Admin intervention for complex conflicts

### 3. Multi-View Booking Display

**Calendar Views (Approved & Ongoing Only):**
- Clean, focused view for active bookings
- Real-time availability display
- Interactive booking creation

**Complete Bookings View (All States):**
- Full booking management interface
- All booking states visible
- Complete filtering options
- Administrative oversight

**Booking Grid (Approved & Ongoing Only):**
- Room availability grid
- Department and date filtering
- Quick booking overview

### 4. Department-based Organization

**Features:**
- Rooms organized by departments
- Users assigned to departments
- Department-specific statistics
- Department-based access control

### 5. Advanced Filtering System

**Calendar Components:**
- Date range filtering
- Room-specific filtering
- User-specific filtering
- Status filtering (approved/ongoing only)

**Complete Bookings View:**
- Full status filtering
- Search by user, purpose, room
- Date range filtering
- Advanced search capabilities

### 6. Real-time Notifications

**Notification Types:**
- Booking confirmations
- Booking reminders
- Room maintenance alerts
- System updates

**Delivery Methods:**
- In-app notifications
- Email notifications (planned)
- SMS notifications (planned)

### 7. Responsive Design

**Device Support:**
- Desktop computers
- Tablets
- Mobile phones
- Touch interfaces

**Responsive Features:**
- Adaptive layouts
- Touch-friendly controls
- Mobile-optimized navigation
- Responsive data tables

---

## Security Implementation

### 1. Authentication

**JWT Token-based Authentication:**
```typescript
// Token generation
const token = jwt.sign(
  { userId: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Password Security:**
- bcrypt hashing with salt rounds
- Minimum password requirements
- Secure password storage

### 2. Authorization

**Role-based Access Control:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('users')
async findAllUsers() {
  // Admin-only endpoint
}
```

**Route Protection:**
- JWT token validation
- Role-based route guards
- Resource ownership validation

### 3. Data Validation

**Input Validation:**
```typescript
export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsPositive()
  roomId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
```

**SQL Injection Prevention:**
- Prisma ORM parameterized queries
- Input sanitization
- Type-safe database operations

### 4. CORS Configuration

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
});
```

### 5. Environment Security

**Environment Variables:**
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3001"
```

**Production Security:**
- Environment variable validation
- Secure database connections
- HTTPS enforcement
- Security headers

---

## Deployment Guide

### 1. Backend Deployment (NestJS)

**Prerequisites:**
- Node.js 18+
- PostgreSQL database
- PM2 or similar process manager

**Steps:**

1. **Install Dependencies:**
```bash
cd room-management-internship
npm install
```

2. **Environment Configuration:**
```bash
cp .env.example .env
# Configure environment variables
```

3. **Database Setup:**
```bash
npx prisma migrate deploy
npx prisma db seed
```

4. **Build Application:**
```bash
npm run build
```

5. **Start Production Server:**
```bash
npm run start:prod
```

### 2. Frontend Deployment (Next.js)

**Prerequisites:**
- Node.js 18+
- Static hosting service (Vercel, Netlify, etc.)

**Steps:**

1. **Install Dependencies:**
```bash
cd room-booking-dashboard
npm install
```

2. **Build Application:**
```bash
npm run build
```

3. **Deploy:**
```bash
# For Vercel
vercel --prod

# For static export
npm run export
```

### 3. Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: room_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./room-management-internship
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@database:5432/room_management
    depends_on:
      - database

  frontend:
    build: ./room-booking-dashboard
    ports:
      - "3001:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000

volumes:
  postgres_data:
```

---

## Development Setup

### 1. Prerequisites

**Required Software:**
- Node.js 18+ and npm
- PostgreSQL 15+
- Git
- Code editor (VS Code recommended)

**Recommended Extensions:**
- Prisma extension
- TypeScript extension
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

### 2. Backend Setup

**Clone and Setup:**
```bash
git clone <repository-url>
cd room-management-system/room-management-internship
npm install
```

**Database Configuration:**
```bash
# Create .env file
cp .env.example .env

# Configure database URL
DATABASE_URL="postgresql://username:password@localhost:5432/room_management"

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

**Start Development Server:**
```bash
npm run start:dev
```

**Database Management:**
```bash
# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### 3. Frontend Setup

**Setup and Install:**
```bash
cd ../room-booking-dashboard
npm install
```

**Environment Configuration:**
```bash
# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Start Development Server:**
```bash
npm run dev
```

### 4. Development Workflow

**Database Changes:**
1. Modify `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Update seed data if needed
4. Test changes

**API Development:**
1. Create/modify DTOs in `src/dto/`
2. Update services in `src/*/services/`
3. Update controllers in `src/*/controllers/`
4. Test endpoints

**Frontend Development:**
1. Create/modify components in `components/`
2. Update pages in `app/`
3. Test UI changes
4. Update API integration

### 5. Testing

**Backend Testing:**
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

**Frontend Testing:**
```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### 6. Code Quality

**Backend Linting:**
```bash
npm run lint
npm run lint:fix
```

**Frontend Linting:**
```bash
npm run lint
npm run lint:fix
```

**Type Checking:**
```bash
# Backend
npm run build

# Frontend
npm run type-check
```

---

## Conclusion

This comprehensive documentation covers all aspects of the Room Management System, from high-level architecture to detailed implementation specifics. The system provides a robust, scalable solution for managing meeting room bookings with modern web technologies and best practices.

### Key Strengths:
- **Modern Architecture**: NestJS backend with Next.js frontend
- **Auto-Approval System**: Streamlined booking process
- **Real-time Features**: Live updates and conflict detection
- **Responsive Design**: Works on all devices
- **Role-based Security**: Proper access control
- **Scalable Database**: PostgreSQL with Prisma ORM

### Future Enhancements:
- Email and SMS notifications
- Mobile app development
- Advanced analytics and reporting
- Integration with external calendar systems
- Automated room maintenance scheduling
- Resource booking (projectors, laptops, etc.)

The system is production-ready and can be deployed to various hosting platforms with the provided deployment guides and Docker configurations.
