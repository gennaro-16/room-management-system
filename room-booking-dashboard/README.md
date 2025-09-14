# Al Baraka Room Management Dashboard

A modern, responsive room booking and management system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🏢 **Room Management**: Create, update, and manage rooms with real-time status updates
- 📅 **Booking System**: Schedule and manage room reservations
- 📊 **Dashboard Analytics**: Real-time statistics and room status overview
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔄 **Real-time Updates**: Live data synchronization with the backend API

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Context API
- **API Client**: Custom fetch-based client with error handling
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running NestJS backend API

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd room-booking-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## Project Structure

```
room-booking-dashboard/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── StatsCards.tsx
│   │   └── DashboardSection.tsx
│   ├── rooms/             # Room management components
│   │   ├── RoomCard.tsx
│   │   ├── RoomFilters.tsx
│   │   ├── AddRoomDialog.tsx
│   │   └── RoomsSection.tsx
│   ├── ui/                # shadcn/ui components
│   ├── ErrorBoundary.tsx  # Error handling
│   ├── LoadingSpinner.tsx # Loading states
│   └── ErrorAlert.tsx     # Error display
├── contexts/              # React Context providers
│   └── AppContext.tsx     # Global app state
├── hooks/                 # Custom React hooks
│   └── useApi.ts          # API integration hooks
├── lib/                   # Utility functions
│   ├── api.ts             # API client and types
│   └── utils.ts           # Helper functions
└── public/                # Static assets
```

## API Integration

The dashboard connects to a NestJS backend API. The API client is configured in `lib/api.ts` and provides:

- **Type-safe API calls** with TypeScript interfaces
- **Error handling** with custom error classes
- **Loading states** for better UX
- **Automatic retries** and error recovery

### Available API Endpoints

- **Rooms**: CRUD operations for room management
- **Bookings**: Create, update, and manage reservations
- **Dashboard**: Analytics and statistics
- **Room Status**: Real-time status updates

## Component Architecture

The application follows a modular component architecture:

### 1. **Layout Components**
- `Sidebar`: Navigation sidebar with responsive behavior
- `Header`: Top navigation with search and actions

### 2. **Feature Components**
- `DashboardSection`: Main dashboard with stats and overview
- `RoomsSection`: Complete room management interface
- `RoomCard`: Individual room display with actions

### 3. **Shared Components**
- `ErrorBoundary`: Catches and displays application errors
- `LoadingSpinner`: Consistent loading indicators
- `ErrorAlert`: User-friendly error messages

### 4. **Custom Hooks**
- `useApi`: Generic API call hook with loading/error states
- `useRooms`, `useBookings`: Feature-specific data hooks
- `useApp`: Global state management

## State Management

The application uses React Context API for state management:

- **Global State**: App-wide settings, filters, and UI state
- **Local State**: Component-specific state with useState
- **Server State**: API data with custom hooks

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Built-in theme support

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (if configured)

## Deployment

### Environment Variables

Set the following environment variables for production:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Build and Deploy

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your platform**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS Amplify
   - Docker container

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
