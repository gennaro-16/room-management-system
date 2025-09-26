# Room Management System - API Documentation

## Base Information
- **Base URL**: `http://localhost:3000`
- **API Version**: v1
- **Authentication**: JWT Bearer Token
- **Content Type**: `application/json`

---

## Authentication Endpoints

### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "employeeId": "EMP123456",
    "username": "john.doe",
    "email": "user@example.com",
    "role": "EMPLOYEE",
    "firstName": "John",
    "lastName": "Doe",
    "department": {
      "id": 1,
      "name": "Engineering"
    }
  }
}
```

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "employeeId": "EMP123456",
  "username": "john.doe",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "title": "Software Engineer",
  "phone": "+1234567890",
  "departmentId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "employeeId": "EMP123456",
  "username": "john.doe",
  "email": "user@example.com",
  "role": "EMPLOYEE",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "isApproved": false,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### GET /auth/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "employeeId": "EMP123456",
  "username": "john.doe",
  "email": "user@example.com",
  "role": "EMPLOYEE",
  "firstName": "John",
  "lastName": "Doe",
  "title": "Software Engineer",
  "phone": "+1234567890",
  "department": {
    "id": 1,
    "name": "Engineering",
    "floor": 2
  },
  "isActive": true,
  "isApproved": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

## User Management Endpoints

### GET /users
Get all users (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of users per page
- `role` (optional): Filter by user role
- `departmentId` (optional): Filter by department

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "employeeId": "EMP123456",
      "username": "john.doe",
      "email": "user@example.com",
      "role": "EMPLOYEE",
      "firstName": "John",
      "lastName": "Doe",
      "department": {
        "id": 1,
        "name": "Engineering"
      },
      "isActive": true,
      "isApproved": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### GET /users/pending
Get pending user approvals (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "users": [
    {
      "id": 2,
      "employeeId": "EMP789012",
      "username": "jane.smith",
      "email": "jane@example.com",
      "role": "EMPLOYEE",
      "firstName": "Jane",
      "lastName": "Smith",
      "department": {
        "id": 2,
        "name": "Marketing"
      },
      "isActive": true,
      "isApproved": false,
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

### PATCH /users/:id/approve
Approve a pending user (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isApproved": true
}
```

**Response:**
```json
{
  "id": 2,
  "employeeId": "EMP789012",
  "username": "jane.smith",
  "email": "jane@example.com",
  "role": "EMPLOYEE",
  "firstName": "Jane",
  "lastName": "Smith",
  "isActive": true,
  "isApproved": true,
  "approvedById": 1,
  "approvedAt": "2024-01-15T12:00:00Z"
}
```

---

## Room Management Endpoints

### GET /rooms
Get all rooms.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by room status
- `departmentId` (optional): Filter by department
- `floor` (optional): Filter by floor

**Response:**
```json
{
  "rooms": [
    {
      "id": 1,
      "name": "Conference Room A",
      "capacity": 10,
      "description": "Main conference room with video conferencing",
      "amenities": ["projector", "whiteboard", "video-conference"],
      "floor": 2,
      "building": "Main",
      "department": {
        "id": 1,
        "name": "Engineering"
      },
      "isUnderMaintenance": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### GET /rooms/available
Get available rooms for a time period.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startTime` (required): Start time (ISO 8601)
- `endTime` (required): End time (ISO 8601)
- `capacity` (optional): Minimum capacity required

**Response:**
```json
{
  "rooms": [
    {
      "id": 1,
      "name": "Conference Room A",
      "capacity": 10,
      "amenities": ["projector", "whiteboard"],
      "department": {
        "id": 1,
        "name": "Engineering"
      }
    }
  ]
}
```

### POST /rooms
Create a new room (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Meeting Room B",
  "capacity": 8,
  "description": "Small meeting room",
  "amenities": ["whiteboard"],
  "floor": 3,
  "building": "Main",
  "departmentId": 1
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Meeting Room B",
  "capacity": 8,
  "description": "Small meeting room",
  "amenities": ["whiteboard"],
  "floor": 3,
  "building": "Main",
  "department": {
    "id": 1,
    "name": "Engineering"
  },
  "isUnderMaintenance": false,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

## Booking Management Endpoints

### GET /bookings
Get all bookings.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `roomId` (optional): Filter by room
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `status` (optional): Filter by status
- `organizerId` (optional): Filter by organizer

**Response:**
```json
{
  "bookings": [
    {
      "id": 1,
      "title": "Team Meeting",
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
      "purpose": "Weekly standup",
      "agenda": "Discuss project progress",
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T11:00:00Z",
      "status": "APPROVED",
      "expectedAttendees": 5,
      "internalAttendees": ["John Doe", "Jane Smith"],
      "externalAttendees": ["Client ABC"],
      "requiredAmenities": ["projector", "whiteboard"],
      "isRecurring": false,
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ]
}
```

### POST /bookings
Create a new booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
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
  "requiredAmenities": ["projector", "whiteboard"],
  "isRecurring": false
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Team Meeting",
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
  "purpose": "Weekly standup",
  "agenda": "Discuss project progress",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "status": "APPROVED",
  "expectedAttendees": 5,
  "internalAttendees": ["John Doe", "Jane Smith"],
  "externalAttendees": ["Client ABC"],
  "requiredAmenities": ["projector", "whiteboard"],
  "isRecurring": false,
  "approvedById": 1,
  "approvedAt": "2024-01-15T09:00:00Z",
  "createdAt": "2024-01-15T09:00:00Z"
}
```

### PATCH /bookings/:id
Update a booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Team Meeting",
  "purpose": "Updated purpose",
  "agenda": "Updated agenda",
  "expectedAttendees": 6
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Updated Team Meeting",
  "room": {
    "id": 1,
    "name": "Conference Room A"
  },
  "organizer": {
    "id": 1,
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe"
  },
  "purpose": "Updated purpose",
  "agenda": "Updated agenda",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "status": "APPROVED",
  "expectedAttendees": 6,
  "updatedAt": "2024-01-15T09:30:00Z"
}
```

### PATCH /bookings/:id/move
Move a booking to a different room/time.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "newRoomId": 2,
  "newStartTime": "2024-01-15T14:00:00Z",
  "newEndTime": "2024-01-15T15:00:00Z"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Team Meeting",
  "room": {
    "id": 2,
    "name": "Meeting Room B"
  },
  "startTime": "2024-01-15T14:00:00Z",
  "endTime": "2024-01-15T15:00:00Z",
  "status": "APPROVED",
  "updatedAt": "2024-01-15T09:30:00Z"
}
```

---

## Department Management Endpoints

### GET /departments
Get all departments.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "departments": [
    {
      "id": 1,
      "name": "Engineering",
      "description": "Software development team",
      "floor": 2,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /departments
Create a new department (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Marketing",
  "description": "Marketing and communications team",
  "floor": 3
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Marketing",
  "description": "Marketing and communications team",
  "floor": 3,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

## Dashboard Endpoints

### GET /dashboard/overview
Get dashboard overview statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalRooms": 10,
  "totalBookings": 25,
  "activeBookings": 5,
  "roomsByStatus": [
    {
      "status": "FREE",
      "count": 8
    },
    {
      "status": "BUSY",
      "count": 2
    }
  ],
  "bookingsByStatus": [
    {
      "status": "APPROVED",
      "count": 20
    },
    {
      "status": "ONGOING",
      "count": 3
    },
    {
      "status": "COMPLETED",
      "count": 2
    }
  ]
}
```

### GET /dashboard/rooms-summary
Get rooms summary.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "rooms": [
    {
      "id": 1,
      "name": "Conference Room A",
      "capacity": 10,
      "department": {
        "id": 1,
        "name": "Engineering"
      },
      "isUnderMaintenance": false,
      "currentBookings": 1,
      "utilizationRate": 0.1
    }
  ]
}
```

### GET /dashboard/bookings-summary
Get bookings summary.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "todayBookings": [
    {
      "id": 1,
      "title": "Team Meeting",
      "room": {
        "name": "Conference Room A"
      },
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T11:00:00Z",
      "status": "APPROVED"
    }
  ],
  "upcomingBookings": [
    {
      "id": 2,
      "title": "Client Presentation",
      "room": {
        "name": "Conference Room B"
      },
      "startTime": "2024-01-15T14:00:00Z",
      "endTime": "2024-01-15T15:00:00Z",
      "status": "APPROVED"
    }
  ]
}
```

---

## Conflict Management Endpoints

### GET /conflicts/bookings
Get conflicting bookings (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "conflictingBookings": [
    {
      "id": 1,
      "title": "Team Meeting",
      "room": {
        "id": 1,
        "name": "Conference Room A"
      },
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T11:00:00Z",
      "conflictReason": "Overlapping time slots"
    }
  ],
  "rejectedBookings": []
}
```

### GET /conflicts/check/:id
Check for conflicts with a specific booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "booking": {
    "id": 1,
    "title": "Team Meeting",
    "room": {
      "id": 1,
      "name": "Conference Room A"
    },
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z"
  },
  "conflictInfo": {
    "hasConflict": true,
    "conflictingBookings": [
      {
        "id": 2,
        "title": "Another Meeting",
        "startTime": "2024-01-15T10:30:00Z",
        "endTime": "2024-01-15T11:30:00Z"
      }
    ]
  },
  "alternatives": [
    {
      "roomId": 2,
      "roomName": "Meeting Room B",
      "availableSlots": [
        {
          "startTime": "2024-01-15T10:00:00Z",
          "endTime": "2024-01-15T11:00:00Z"
        }
      ]
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
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

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Room is already booked for this time period",
  "error": "Conflict"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Rate Limiting

Currently not implemented, but planned for future versions:
- 100 requests per minute per IP
- 1000 requests per hour per user
- Different limits for different endpoints

---

## Pagination

For endpoints that return lists, pagination is supported:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Filtering and Sorting

Many endpoints support filtering and sorting:

**Query Parameters:**
- `sort`: Sort field (e.g., `createdAt`, `-createdAt` for descending)
- `filter`: Filter criteria (e.g., `status:APPROVED`)

**Example:**
```
GET /bookings?sort=-createdAt&filter=status:APPROVED&page=1&limit=20
```

---

## Webhooks (Planned)

Future webhook support for real-time updates:
- Booking created
- Booking updated
- Booking cancelled
- User approved/rejected
- Room maintenance status changed

---

## Visitor Management Endpoints

### GET /visitors
Get all visitors with pagination and filtering (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of visitors per page (default: 8)
- `startDate` (optional): Filter visits from this date
- `endDate` (optional): Filter visits to this date
- `visitorName` (optional): Search by visitor name
- `room` (optional): Filter by room name
- `department` (optional): Filter by department name
- `status` (optional): Filter by visit status (active/completed)

**Response:**
```json
{
  "visitors": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@example.com",
      "phone": "+1234567890",
      "visits": [
        {
          "id": 1,
          "checkedIn": "2024-01-15T10:00:00Z",
          "checkedOut": "2024-01-15T12:00:00Z",
          "purpose": "Business Meeting",
          "booking": {
            "id": 1,
            "room": {
              "name": "Conference Room A",
              "department": {
                "name": "Engineering"
              }
            }
          }
        }
      ],
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T12:00:00Z"
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

### POST /visitors/visit
Create a new visitor with their first visit (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "visitorId": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
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
    "email": "jane.doe@example.com",
    "phone": "+1234567890",
    "createdAt": "2024-01-15T10:00:00Z"
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

### GET /visitors/:id
Get a specific visitor with all their visits (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "phone": "+1234567890",
  "visits": [
    {
      "id": 1,
      "checkedIn": "2024-01-15T10:00:00Z",
      "checkedOut": "2024-01-15T12:00:00Z",
      "purpose": "Business Meeting",
      "booking": {
        "id": 1,
        "room": {
          "name": "Conference Room A",
          "department": {
            "name": "Engineering"
          }
        }
      }
    }
  ],
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

### PATCH /visitors/:id
Update visitor information (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@newemail.com",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@newemail.com",
  "phone": "+1234567890",
  "updatedAt": "2024-01-15T14:00:00Z"
}
```

---

## Visit Management Endpoints

### GET /visits
Get all visits with filtering and pagination (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of visits per page (default: 8)
- `startDate` (optional): Filter visits from this date
- `endDate` (optional): Filter visits to this date
- `visitorName` (optional): Search by visitor name
- `room` (optional): Filter by room name
- `department` (optional): Filter by department name
- `status` (optional): Filter by visit status (active/completed)

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
        "email": "john.smith@example.com"
      },
      "booking": {
        "id": 1,
        "room": {
          "name": "Conference Room A",
          "department": {
            "name": "Engineering"
          }
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

### GET /visits/filters
Get available filter options for visits (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "rooms": [
    {
      "id": 1,
      "name": "Conference Room A"
    }
  ],
  "departments": [
    {
      "id": 1,
      "name": "Engineering"
    }
  ]
}
```

### POST /visits
Create a new visit record (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

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

**Response:**
```json
{
  "id": 2,
  "checkedIn": "2024-01-15T10:00:00Z",
  "checkedOut": "2024-01-15T12:00:00Z",
  "purpose": "Business Meeting",
  "visitorId": 1,
  "bookingId": 1,
  "visitor": {
    "id": 1,
    "firstName": "John",
    "lastName": "Smith"
  },
  "booking": {
    "id": 1,
    "room": {
      "name": "Conference Room A",
      "department": {
        "name": "Engineering"
      }
    }
  }
}
```

### GET /visits/:id
Get a specific visit record (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

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
    "email": "john.smith@example.com"
  },
  "booking": {
    "id": 1,
    "room": {
      "name": "Conference Room A",
      "department": {
        "name": "Engineering"
      }
    }
  }
}
```

### PATCH /visits/:id
Update a visit record (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "purpose": "Updated Meeting Purpose",
  "bookingId": 2
}
```

**Response:**
```json
{
  "id": 1,
  "checkedIn": "2024-01-15T10:00:00Z",
  "checkedOut": "2024-01-15T12:00:00Z",
  "purpose": "Updated Meeting Purpose",
  "bookingId": 2,
  "updatedAt": "2024-01-15T14:00:00Z"
}
```

### PATCH /visits/:id/checkout
Process visitor checkout (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "checkedIn": "2024-01-15T10:00:00Z",
  "checkedOut": "2024-01-15T14:00:00Z",
  "purpose": "Business Meeting",
  "visitorId": 1,
  "bookingId": 1,
  "updatedAt": "2024-01-15T14:00:00Z"
}
```

---

## Statistics Endpoints

### GET /statistics/visitors
Get comprehensive visitor statistics (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `timeRange` (optional): Time range for statistics ('day', 'month', 'year') (default: 'month')
- `startDate` (optional): Custom start date for statistics
- `endDate` (optional): Custom end date for statistics

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

*This API documentation is automatically generated and maintained. For the latest version, please refer to the project repository.*
