# Al Baraka Room Management System

A comprehensive room management system built with NestJS, Prisma, and PostgreSQL for managing Al Baraka meeting rooms and their bookings.

## Features

### Room Management
- **Room States**: FREE, BUSY, MAINTENANCE, RESERVED
- **Room Information**: Name, capacity, floor, description
- **Room Operations**: Create, read, update, delete rooms
- **Status Management**: Update room status independently
- **Filtering**: Filter rooms by floor and status

### Booking Management
- **Booking Creation**: Create bookings with conflict checking
- **Time Validation**: Prevent past bookings and invalid time ranges
- **Conflict Detection**: Automatic detection of booking conflicts
- **Booking States**: ACTIVE, COMPLETED, CANCELLED
- **Advanced Filtering**: Filter by room, user, date range, status

### Dashboard
- **Overview Statistics**: Total rooms, active bookings, available rooms
- **Real-time Data**: Current room status and booking information
- **Today's Bookings**: View all bookings for the current day
- **Status Charts**: Visual representation of room and booking statuses

### Web Interface
- **Modern UI**: Responsive design with professional styling
- **Interactive Dashboard**: Real-time updates and statistics
- **Modal Forms**: Easy room and booking creation
- **Filtering System**: Advanced filtering and search capabilities

## Technology Stack

- **Backend**: NestJS (Node.js framework)
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Vanilla JavaScript with modern CSS
- **Validation**: Class-validator for request validation
- **Error Handling**: Global exception filters

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd room-management-internship
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/room_management"
   PORT=3000
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database with sample data
   npx prisma db seed
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

The application will be available at `http://localhost:3000`

## API Endpoints

### Floors
- `GET /floors` - Get all floors with their rooms
- `GET /floors/:id` - Get a specific floor
- `GET /floors/:id/rooms` - Get all rooms on a specific floor
- `POST /floors` - Create a new floor
- `PATCH /floors/:id` - Update a floor
- `DELETE /floors/:id` - Delete a floor

### Departments
- `GET /departments` - Get all departments with their bookings
- `GET /departments/:id` - Get a specific department
- `GET /departments/:id/bookings` - Get all bookings for a department
- `POST /departments` - Create a new department
- `PATCH /departments/:id` - Update a department
- `DELETE /departments/:id` - Delete a department

### Rooms
- `GET /rooms` - Get all rooms (with optional filtering)
- `GET /rooms/available` - Get available rooms for a time period
- `GET /rooms/:id` - Get a specific room
- `POST /rooms` - Create a new room
- `PATCH /rooms/:id` - Update a room
- `PATCH /rooms/:id/status` - Update room status
- `DELETE /rooms/:id` - Delete a room

### Bookings
- `GET /bookings` - Get all bookings (with optional filtering)
- `GET /bookings/:id` - Get a specific booking
- `POST /bookings` - Create a new booking
- `PATCH /bookings/:id` - Update a booking
- `PATCH /bookings/:id/complete` - Mark booking as completed
- `DELETE /bookings/:id` - Cancel a booking

### Dashboard
- `GET /dashboard/overview` - Get dashboard statistics
- `GET /dashboard/rooms-summary` - Get rooms summary
- `GET /dashboard/bookings-summary` - Get bookings summary

## Usage Examples

### Creating a Room
```bash
curl -X POST http://localhost:3000/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Conference Room A",
    "capacity": 10,
    "floor": 2,
    "description": "Main conference room with projector"
  }'
```

### Creating a Booking
```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": 1,
    "user": "John Doe",
    "department": "IT",
    "purpose": "Team Meeting",
    "startTime": "2025-01-15T10:00:00Z",
    "endTime": "2025-01-15T11:00:00Z"
  }'
```

### Getting Available Rooms
```bash
curl "http://localhost:3000/rooms/available?startTime=2025-01-15T10:00:00Z&endTime=2025-01-15T11:00:00Z"
```

## Database Schema

### Floor Model
```prisma
model Floor {
  id          Int      @id @default(autoincrement())
  number      Int      @unique
  name        String?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  rooms       Room[]
}
```

### Department Model
```prisma
model Department {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  bookings    Booking[]
}
```

### Room Model
```prisma
model Room {
  id          Int         @id @default(autoincrement())
  name        String      @unique
  capacity    Int
  floorId     Int
  floor       Floor       @relation(fields: [floorId], references: [id], onDelete: Cascade)
  description String?
  status      RoomStatus  @default(FREE)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  bookings    Booking[]
}
```

### Booking Model
```prisma
model Booking {
  id           Int        @id @default(autoincrement())
  roomId       Int
  room         Room       @relation(fields: [roomId], references: [id], onDelete: Cascade)
  departmentId Int?
  department   Department? @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  user         String
  purpose      String?
  startTime    DateTime
  endTime      DateTime
  status       String     @default("ACTIVE")
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

## Room States

- **FREE**: Room is available for booking
- **BUSY**: Room is currently occupied
- **MAINTENANCE**: Room is under maintenance and cannot be booked
- **RESERVED**: Room is reserved for a specific purpose

## Booking States

- **ACTIVE**: Booking is currently active
- **COMPLETED**: Booking has been completed
- **CANCELLED**: Booking has been cancelled

## Features in Detail

### Conflict Detection
The system automatically detects booking conflicts by checking:
- Time overlap with existing active bookings
- Room availability status
- Valid time ranges (end time after start time)
- Future bookings only (no past bookings allowed)

### Room Status Management
- Rooms automatically change status based on bookings
- Manual status updates for maintenance or reservations
- Status-based filtering and availability checking

### Validation
- Input validation using class-validator
- Database constraints and relationships
- Business logic validation (conflict checking, time validation)

## Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Deploy migrations
npx prisma migrate deploy
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.