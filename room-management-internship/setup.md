# Setup Instructions

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/room_management"
   PORT=3000
   NODE_ENV=development
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # Seed the database with sample data
   npm run db:seed
   ```

4. **Start the application**
   ```bash
   npm run start:dev
   ```

5. **Access the application**
   - Web Interface: http://localhost:3000
   - API Documentation: http://localhost:3000/api (if Swagger is configured)

## Database Setup

### PostgreSQL Setup
1. Install PostgreSQL on your system
2. Create a database named `room_management`
3. Update the `DATABASE_URL` in your `.env` file with your PostgreSQL credentials

### Alternative: Using Docker
```bash
# Run PostgreSQL in Docker
docker run --name postgres-room-mgmt -e POSTGRES_PASSWORD=password -e POSTGRES_DB=room_management -p 5432:5432 -d postgres:15

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/room_management"
```

## Sample Data

The seed script will create:
- 6 sample rooms across 2 floors
- 4 sample bookings with different statuses
- Proper room status updates based on bookings

## Troubleshooting

### Common Issues

1. **Database connection error**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL in .env file
   - Ensure database exists

2. **Port already in use**
   - Change PORT in .env file
   - Or kill the process using port 3000

3. **Prisma client not generated**
   - Run `npx prisma generate`
   - Restart the application

### Reset Database
```bash
# Reset and reseed database
npm run db:reset
npm run db:seed
```

## Development

### Available Scripts
- `npm run start:dev` - Start in development mode with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database
- `npm run db:deploy` - Deploy migrations to production

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy
```
