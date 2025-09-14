# Calendar Components

This directory contains the calendar functionality for the room booking dashboard.

## Components

### CalendarSection
The main calendar component that provides:
- Month, week, and day view modes
- Room filtering
- Booking creation and management
- Navigation controls

### CalendarGrid
A flexible grid component that renders the calendar in different view modes:
- **Month View**: Traditional monthly calendar with booking indicators
- **Week View**: Weekly grid showing detailed booking information
- **Day View**: Single day view with full booking details

### CalendarUtils
Utility functions for calendar operations:
- Date range calculations
- Booking filtering and grouping
- Status color management
- Time formatting

### BookingDetailsDialog
A modal dialog for viewing and managing individual bookings:
- Booking information display
- Edit and delete actions
- Room details integration

## Features

### View Modes
- **Month**: Overview of the entire month with booking indicators
- **Week**: Detailed weekly view with full booking cards
- **Day**: Single day focus with comprehensive booking information

### Filtering
- Filter bookings by specific rooms
- View all rooms or individual room bookings

### Booking Management
- Create new bookings directly from the calendar
- View booking details by clicking on bookings
- Edit and delete existing bookings
- Real-time status updates

### Navigation
- Previous/Next navigation for all view modes
- "Today" button to quickly return to current date
- Keyboard navigation support

## Usage

```tsx
import { CalendarSection } from '@/components/calendar';

function MyPage() {
  return <CalendarSection />;
}
```

## API Integration

The calendar components integrate with the following API endpoints:
- `GET /bookings` - Fetch bookings with date range filters
- `POST /bookings` - Create new bookings
- `PATCH /bookings/:id` - Update existing bookings
- `DELETE /bookings/:id` - Cancel bookings
- `GET /rooms` - Fetch available rooms

## Dependencies

- `react-day-picker` - Calendar component library
- `date-fns` - Date manipulation utilities
- `lucide-react` - Icons
- `@radix-ui/*` - UI primitives

## Styling

The calendar uses Tailwind CSS classes and follows the design system established in the dashboard. All components are responsive and work on mobile and desktop devices.
