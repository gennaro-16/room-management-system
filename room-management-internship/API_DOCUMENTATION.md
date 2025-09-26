# Room Management API Documentation

## Overview

This is a comprehensive NestJS-based API for managing room bookings and availability. The system provides endpoints for managing rooms, bookings, room statuses, dashboard analytics, visitor management, and comprehensive statistics.

**Base URL:** `http://localhost:3000` (default)

## Table of Contents

1. [Authentication](#authentication)
2. [Data Models](#data-models)
3. [Rooms API](#rooms-api)
4. [Bookings API](#bookings-api)
5. [Room Status API](#room-status-api)
6. [Dashboard API](#dashboard-api)
7. [Error Handling](#error-handling)
8. [Validation Rules](#validation-rules)

## Authentication

Currently, the API does not implement authentication. All endpoints are publicly accessible.

## Data Models

### Room Model
```typescript
{
  id: number;
  name: string;
  capacity: number;
  description?: string;
  x?: number;           // X coordinate for map positioning
  y?: number;           // Y coordinate for map positioning
  width?: number;       // Width for map positioning
  height?: number;      // Height for map positioning
  status: RoomStatus;
  createdAt: Date;
  updatedAt: Date;
  bookings: Booking[];
}
```

### Booking Model
```typescript
{
  id: number;
  roomId: number;
  room: Room;
  user: string;
  purpose?: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### Enums

#### RoomStatus
- `FREE` - Room is available for booking
- `BUSY` - Room is currently in use
- `MAINTENANCE` - Room is under maintenance
- `RESERVED` - Room has upcoming bookings

#### BookingStatus
- `ACTIVE` - Booking is active or upcoming
- `CANCELLED` - Booking has been cancelled
- `COMPLETED` - Booking has been completed

---

## Rooms API

### Create Room
**POST** `/rooms`

Creates a new room.

**Request Body:**
```json
{
  "name": "Conference Room A",
  "capacity": 10,
  "description": "Large conference room with projector",
  "x": 100,
  "y": 200,
  "width": 50,
  "height": 30
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Conference Room A",
  "capacity": 10,
  "description": "Large conference room with projector",
  "x": 100,
  "y": 200,
  "width": 50,
  "height": 30,
  "status": "FREE",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Get All Rooms
**GET** `/rooms`

Retrieves all rooms with their current active bookings.

**Query Parameters:**
- `status` (optional): Filter by room status (`FREE`, `BUSY`, `MAINTENANCE`, `RESERVED`)

**Example:** `GET /rooms?status=FREE`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10,
    "description": "Large conference room with projector",
    "x": 100,
    "y": 200,
    "width": 50,
    "height": 30,
    "status": "FREE",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "bookings": []
  }
]
```

### Get Available Rooms
**GET** `/rooms/available`

Finds rooms available for a specific time period.

**Query Parameters:**
- `startTime` (required): Start time in ISO format
- `endTime` (required): End time in ISO format

**Example:** `GET /rooms/available?startTime=2024-01-15T14:00:00.000Z&endTime=2024-01-15T16:00:00.000Z`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10,
    "description": "Large conference room with projector",
    "x": 100,
    "y": 200,
    "width": 50,
    "height": 30,
    "status": "FREE",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

### Get Room by ID
**GET** `/rooms/:id`

Retrieves a specific room by ID with its active bookings.

**Response:**
```json
{
  "id": 1,
  "name": "Conference Room A",
  "capacity": 10,
  "description": "Large conference room with projector",
  "x": 100,
  "y": 200,
  "width": 50,
  "height": 30,
  "status": "FREE",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "bookings": []
}
```

### Update Room
**PATCH** `/rooms/:id`

Updates room information.

**Request Body:**
```json
{
  "name": "Updated Conference Room A",
  "capacity": 15,
  "description": "Updated description",
  "status": "MAINTENANCE"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Conference Room A",
  "capacity": 15,
  "description": "Updated description",
  "x": 100,
  "y": 200,
  "width": 50,
  "height": 30,
  "status": "MAINTENANCE",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### Update Room Status
**PATCH** `/rooms/:id/status`

Updates only the room status.

**Request Body:**
```json
{
  "status": "MAINTENANCE"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Conference Room A",
  "capacity": 10,
  "description": "Large conference room with projector",
  "x": 100,
  "y": 200,
  "width": 50,
  "height": 30,
  "status": "MAINTENANCE",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### Delete Room
**DELETE** `/rooms/:id`

Deletes a room. Cannot delete rooms with active bookings.

**Response:**
```json
{
  "id": 1,
  "name": "Conference Room A",
  "capacity": 10,
  "description": "Large conference room with projector",
  "x": 100,
  "y": 200,
  "width": 50,
  "height": 30,
  "status": "FREE",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

---

## Bookings API

### Create Booking
**POST** `/bookings`

Creates a new room booking.

**Request Body:**
```json
{
  "roomId": 1,
  "user": "john.doe@company.com",
  "purpose": "Team meeting",
  "startTime": "2024-01-15T14:00:00.000Z",
  "endTime": "2024-01-15T16:00:00.000Z"
}
```

**Response:**
```json
{
  "id": 1,
  "roomId": 1,
  "user": "john.doe@company.com",
  "purpose": "Team meeting",
  "startTime": "2024-01-15T14:00:00.000Z",
  "endTime": "2024-01-15T16:00:00.000Z",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "room": {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10,
    "description": "Large conference room with projector",
    "status": "RESERVED"
  }
}
```

### Get All Bookings
**GET** `/bookings`

Retrieves all bookings with various filtering options.

**Query Parameters:**
- `roomId` (optional): Filter by room ID
- `user` (optional): Filter by user email
- `startDate` (optional): Filter by start date (requires endDate)
- `endDate` (optional): Filter by end date (requires startDate)
- `status` (optional): Filter by status (`active`, `upcoming`)

**Examples:**
- `GET /bookings?roomId=1`
- `GET /bookings?user=john.doe@company.com`
- `GET /bookings?startDate=2024-01-15&endDate=2024-01-16`
- `GET /bookings?status=active`
- `GET /bookings?status=upcoming`

**Response:**
```json
[
  {
    "id": 1,
    "roomId": 1,
    "user": "john.doe@company.com",
    "purpose": "Team meeting",
    "startTime": "2024-01-15T14:00:00.000Z",
    "endTime": "2024-01-15T16:00:00.000Z",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "room": {
      "id": 1,
      "name": "Conference Room A",
      "capacity": 10,
      "description": "Large conference room with projector",
      "status": "BUSY"
    }
  }
]
```

### Get Booking by ID
**GET** `/bookings/:id`

Retrieves a specific booking by ID.

**Response:**
```json
{
  "id": 1,
  "roomId": 1,
  "user": "john.doe@company.com",
  "purpose": "Team meeting",
  "startTime": "2024-01-15T14:00:00.000Z",
  "endTime": "2024-01-15T16:00:00.000Z",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "room": {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10,
    "description": "Large conference room with projector",
    "status": "BUSY"
  }
}
```

### Update Booking
**PATCH** `/bookings/:id`

Updates booking information.

**Request Body:**
```json
{
  "purpose": "Updated team meeting",
  "startTime": "2024-01-15T15:00:00.000Z",
  "endTime": "2024-01-15T17:00:00.000Z"
}
```

**Response:**
```json
{
  "id": 1,
  "roomId": 1,
  "user": "john.doe@company.com",
  "purpose": "Updated team meeting",
  "startTime": "2024-01-15T15:00:00.000Z",
  "endTime": "2024-01-15T17:00:00.000Z",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z",
  "room": {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10,
    "description": "Large conference room with projector",
    "status": "BUSY"
  }
}
```

### Complete Booking
**PATCH** `/bookings/:id/complete`

Marks a booking as completed.

**Response:**
```json
{
  "id": 1,
  "roomId": 1,
  "user": "john.doe@company.com",
  "purpose": "Team meeting",
  "startTime": "2024-01-15T14:00:00.000Z",
  "endTime": "2024-01-15T16:00:00.000Z",
  "status": "COMPLETED",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T16:00:00.000Z",
  "room": {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10,
    "description": "Large conference room with projector",
    "status": "FREE"
  }
}
```

### Cancel Booking
**DELETE** `/bookings/:id`

Cancels a booking (sets status to CANCELLED).

**Response:**
```json
{
  "id": 1,
  "roomId": 1,
  "user": "john.doe@company.com",
  "purpose": "Team meeting",
  "startTime": "2024-01-15T14:00:00.000Z",
  "endTime": "2024-01-15T16:00:00.000Z",
  "status": "CANCELLED",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z",
  "room": {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10,
    "description": "Large conference room with projector",
    "status": "FREE"
  }
}
```

---

## Room Status API

### Update Room Statuses
**POST** `/room-status/update`

Manually triggers an update of all room statuses based on current bookings.

**Response:**
```json
{
  "message": "Room statuses updated successfully",
  "updatedRooms": 5
}
```

### Get Room Status with Bookings
**GET** `/room-status/room/:id`

Gets detailed status information for a specific room including its bookings.

**Response:**
```json
{
  "room": {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10,
    "description": "Large conference room with projector",
    "status": "BUSY",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "currentBookings": [
    {
      "id": 1,
      "user": "john.doe@company.com",
      "purpose": "Team meeting",
      "startTime": "2024-01-15T14:00:00.000Z",
      "endTime": "2024-01-15T16:00:00.000Z",
      "status": "ACTIVE"
    }
  ],
  "upcomingBookings": []
}
```

---

## Dashboard API

### Get Overview
**GET** `/dashboard/overview`

Gets general statistics about rooms and bookings.

**Response:**
```json
{
  "totalRooms": 10,
  "totalBookings": 25,
  "activeBookings": 3,
  "roomsByStatus": [
    {
      "status": "FREE",
      "count": 5
    },
    {
      "status": "BUSY",
      "count": 3
    },
    {
      "status": "RESERVED",
      "count": 2
    },
    {
      "status": "MAINTENANCE",
      "count": 0
    }
  ],
  "bookingsByStatus": [
    {
      "status": "ACTIVE",
      "count": 3
    },
    {
      "status": "COMPLETED",
      "count": 20
    },
    {
      "status": "CANCELLED",
      "count": 2
    }
  ]
}
```

### Get Rooms Summary
**GET** `/dashboard/rooms-summary`

Gets a summary of all rooms with their current status and booking information.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10,
    "status": "BUSY",
    "currentBookings": 1,
    "isAvailable": false
  },
  {
    "id": 2,
    "name": "Conference Room B",
    "capacity": 8,
    "status": "FREE",
    "currentBookings": 0,
    "isAvailable": true
  }
]
```

### Get Bookings Summary
**GET** `/dashboard/bookings-summary`

Gets a summary of today's bookings and upcoming bookings.

**Response:**
```json
{
  "todayBookings": [
    {
      "id": 1,
      "user": "john.doe@company.com",
      "room": "Conference Room A",
      "startTime": "2024-01-15T14:00:00.000Z",
      "endTime": "2024-01-15T16:00:00.000Z",
      "status": "ACTIVE",
      "purpose": "Team meeting"
    }
  ],
  "upcomingBookings": [
    {
      "id": 2,
      "user": "jane.smith@company.com",
      "room": "Conference Room B",
      "startTime": "2024-01-15T17:00:00.000Z",
      "endTime": "2024-01-15T18:00:00.000Z",
      "status": "ACTIVE",
      "purpose": "Client presentation"
    }
  ]
}
```

---

## Visitor Management API

### Data Models

#### Visitor Model
```typescript
{
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  visits: Visit[];
}
```

#### Visit Model
```typescript
{
  id: number;
  checkedIn: Date;
  checkedOut?: Date;
  purpose?: string;
  bookingId?: number;
  visitorId: number;
  visitor: Visitor;
  booking?: Booking;
  createdAt: Date;
  updatedAt: Date;
}
```

### Endpoints

#### GET /visitors
Get all visitors with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 8)
- `startDate` (optional): Filter visits from date
- `endDate` (optional): Filter visits to date
- `visitorName` (optional): Search by visitor name
- `room` (optional): Filter by room name
- `department` (optional): Filter by department
- `status` (optional): Filter by visit status

**Response:**
```json
{
  "visitors": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com",
      "phone": "+1234567890",
      "visits": [
        {
          "id": 1,
          "checkedIn": "2024-01-15T10:00:00Z",
          "checkedOut": "2024-01-15T12:00:00Z",
          "purpose": "Business Meeting",
          "booking": {
            "room": {
              "name": "Conference Room A",
              "department": { "name": "Engineering" }
            }
          }
        }
      ]
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 8,
    "totalPages": 1
  }
}
```

#### POST /visitors/visit
Create a new visitor with their first visit.

**Request Body:**
```json
{
  "visitorId": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "purpose": "Consultation",
  "bookingId": 1
}
```

**Response:**
```json
{
  "visitor": {
    "id": 2,
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+1234567890"
  },
  "visit": {
    "id": 2,
    "checkedIn": "2024-01-15T10:00:00Z",
    "checkedOut": null,
    "purpose": "Consultation",
    "bookingId": 1,
    "visitorId": 2
  }
}
```

#### GET /visitors/:id
Get a specific visitor with all their visits.

**Response:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "phone": "+1234567890",
  "visits": [
    {
      "id": 1,
      "checkedIn": "2024-01-15T10:00:00Z",
      "checkedOut": "2024-01-15T12:00:00Z",
      "purpose": "Business Meeting",
      "booking": {
        "room": {
          "name": "Conference Room A",
          "department": { "name": "Engineering" }
        }
      }
    }
  ]
}
```

#### PATCH /visitors/:id
Update visitor information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.newemail@example.com",
  "phone": "+1234567890"
}
```

---

## Visit Management API

### Endpoints

#### GET /visits
Get all visits with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 8)
- `startDate` (optional): Filter visits from date
- `endDate` (optional): Filter visits to date
- `visitorName` (optional): Search by visitor name
- `room` (optional): Filter by room name
- `department` (optional): Filter by department
- `status` (optional): Filter by visit status

**Response:**
```json
{
  "visits": [
    {
      "id": 1,
      "checkedIn": "2024-01-15T10:00:00Z",
      "checkedOut": "2024-01-15T12:00:00Z",
      "purpose": "Business Meeting",
      "visitor": {
        "id": 1,
        "firstName": "John",
        "lastName": "Smith",
        "email": "john@example.com"
      },
      "booking": {
        "room": {
          "name": "Conference Room A",
          "department": { "name": "Engineering" }
        }
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 8,
    "totalPages": 1
  }
}
```

#### GET /visits/filters
Get available filter options for visits.

**Response:**
```json
{
  "rooms": [
    { "id": 1, "name": "Conference Room A" },
    { "id": 2, "name": "Meeting Room B" }
  ],
  "departments": [
    { "id": 1, "name": "Engineering" },
    { "id": 2, "name": "Marketing" }
  ]
}
```

#### POST /visits
Create a new visit record.

**Request Body:**
```json
{
  "visitorId": 1,
  "bookingId": 1,
  "checkedIn": "2024-01-15T10:00:00Z",
  "checkedOut": "2024-01-15T12:00:00Z",
  "purpose": "Business Meeting"
}
```

#### GET /visits/:id
Get a specific visit record.

**Response:**
```json
{
  "id": 1,
  "checkedIn": "2024-01-15T10:00:00Z",
  "checkedOut": "2024-01-15T12:00:00Z",
  "purpose": "Business Meeting",
  "visitor": {
    "id": 1,
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com"
  },
  "booking": {
    "room": {
      "name": "Conference Room A",
      "department": { "name": "Engineering" }
    }
  }
}
```

#### PATCH /visits/:id
Update a visit record.

**Request Body:**
```json
{
  "purpose": "Updated Meeting Purpose",
  "bookingId": 2
}
```

#### PATCH /visits/:id/checkout
Process visitor checkout.

**Response:**
```json
{
  "id": 1,
  "checkedIn": "2024-01-15T10:00:00Z",
  "checkedOut": "2024-01-15T14:00:00Z",
  "purpose": "Business Meeting",
  "visitorId": 1,
  "bookingId": 1
}
```

---

## Statistics API

### Endpoints

#### GET /statistics/visitors
Get comprehensive visitor statistics.

**Query Parameters:**
- `timeRange` (optional): Time range ('day', 'month', 'year') (default: 'month')
- `startDate` (optional): Custom start date
- `endDate` (optional): Custom end date

**Response:**
```json
{
  "dailyStats": [
    {
      "date": "2024-01-15",
      "visitors": 5,
      "avgDuration": 45.5
    }
  ],
  "monthlyStats": [
    {
      "month": "2024-01",
      "visitors": 150,
      "avgDuration": 42.3
    }
  ],
  "yearlyStats": [
    {
      "year": "2024",
      "visitors": 1800,
      "avgDuration": 40.8
    }
  ],
  "peakHours": [
    {
      "hour": 9,
      "visitors": 12
    },
    {
      "hour": 14,
      "visitors": 18
    }
  ],
  "departmentStats": [
    {
      "department": "Engineering",
      "visitors": 45,
      "percentage": 30.0
    },
    {
      "department": "Marketing",
      "visitors": 30,
      "percentage": 20.0
    }
  ],
  "roomStats": [
    {
      "room": "Conference Room A",
      "visitors": 25,
      "percentage": 16.7
    },
    {
      "room": "Meeting Room B",
      "visitors": 20,
      "percentage": 13.3
    }
  ],
  "purposeStats": [
    {
      "purpose": "Business Meeting",
      "visitors": 60,
      "percentage": 40.0
    },
    {
      "purpose": "Consultation",
      "visitors": 30,
      "percentage": 20.0
    }
  ],
  "summary": {
    "totalVisitors": 150,
    "avgVisitDuration": 45.5,
    "avgDailyVisitors": 12.3,
    "peakHour": 14,
    "mostVisitedDepartment": "Engineering",
    "mostVisitedRoom": "Conference Room A"
  }
}
```

---

## Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Error Codes

- `400 Bad Request` - Invalid request data or validation errors
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., room already booked)
- `500 Internal Server Error` - Server error

### Common Error Messages

- `"Room with this name already exists"` - When creating/updating a room with duplicate name
- `"Room with ID {id} not found"` - When room doesn't exist
- `"Booking with ID {id} not found"` - When booking doesn't exist
- `"Room is already booked for this time period"` - When booking conflicts with existing booking
- `"Cannot delete room with active bookings"` - When trying to delete room with active bookings
- `"Room is under maintenance and cannot be booked"` - When trying to book maintenance room
- `"Cannot book rooms in the past"` - When trying to create booking in the past
- `"End time must be after start time"` - When booking time range is invalid

---

## Validation Rules

### Room Validation
- `name`: Required, string, must be unique
- `capacity`: Required, integer, minimum 1, maximum 100
- `description`: Optional, string
- `x`, `y`, `width`, `height`: Optional, integers (for map positioning)

### Booking Validation
- `roomId`: Required, integer, must reference existing room
- `user`: Required, string, non-empty
- `purpose`: Optional, string
- `startTime`: Required, valid ISO date string
- `endTime`: Required, valid ISO date string, must be after startTime
- Cannot book rooms in the past
- Cannot book rooms under maintenance
- Cannot create overlapping bookings for the same room

### Status Validation
- Room status must be one of: `FREE`, `BUSY`, `MAINTENANCE`, `RESERVED`
- Booking status must be one of: `ACTIVE`, `CANCELLED`, `COMPLETED`

---

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up Database:**
   - Configure your PostgreSQL database URL in environment variables
   - Run migrations: `npx prisma migrate dev`
   - Seed the database: `npx prisma db seed`

3. **Start the Server:**
   ```bash
   npm run start:dev
   ```

4. **Access the API:**
   - API endpoints: `http://localhost:3000`
   - Static files: `http://localhost:3000` (serves files from `public/` directory)

## Notes

- The API automatically updates room statuses based on booking times
- Rooms with active bookings are marked as `BUSY`
- Rooms with future bookings are marked as `RESERVED`
- Rooms with no bookings are marked as `FREE`
- The system prevents double-booking of rooms
- All timestamps are in UTC format
- CORS is enabled for cross-origin requests
- Global validation pipes ensure data integrity
