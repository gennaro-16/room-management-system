import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, addDays, subDays, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { Booking, Room } from '@/lib/api';
import { roomStatusColors, bookingStatusColors } from '@/lib/colors';

export interface CalendarEvent {
  id: number;
  title: string;
  room: string;
  user: string;
  startTime: string;
  endTime: string;
  status: string;
  purpose?: string;
  roomId: number;
}

export interface CalendarView {
  mode: 'month' | 'week' | 'day';
  startDate: Date;
  endDate: Date;
}

export class CalendarUtils {
  /**
   * Convert booking to calendar event
   */
  static bookingToEvent(booking: Booking): CalendarEvent {
    const userName = booking.organizer 
      ? (booking.organizer.firstName && booking.organizer.lastName 
          ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
          : booking.organizer.username)
      : 'Unknown User';
    
    return {
      id: booking.id,
      title: `${userName} - ${booking.room?.name || 'Room'}`,
      room: booking.room?.name || 'Unknown Room',
      user: userName,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      purpose: booking.purpose,
      roomId: booking.roomId,
    };
  }

  /**
   * Get calendar view boundaries
   */
  static getViewBoundaries(date: Date, mode: 'month' | 'week' | 'day'): CalendarView {
    let startDate: Date;
    let endDate: Date;

    switch (mode) {
      case 'month':
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
        break;
      case 'week':
        startDate = startOfWeek(date, { weekStartsOn: 1 }); // Monday
        endDate = endOfWeek(date, { weekStartsOn: 1 });
        break;
      case 'day':
        startDate = startOfDay(date);
        endDate = endOfDay(date);
        break;
      default:
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
    }

    return {
      mode,
      startDate,
      endDate,
    };
  }

  /**
   * Filter bookings for a specific date
   */
  static getBookingsForDate(bookings: Booking[], date: Date): Booking[] {
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.startTime);
      return isSameDay(bookingDate, date);
    });
  }

  /**
   * Filter bookings for a date range
   */
  static getBookingsForDateRange(bookings: Booking[], startDate: Date, endDate: Date): Booking[] {
    return bookings.filter(booking => {
      const bookingStart = parseISO(booking.startTime);
      const bookingEnd = parseISO(booking.endTime);
      
      return isWithinInterval(bookingStart, { start: startDate, end: endDate }) ||
             isWithinInterval(bookingEnd, { start: startDate, end: endDate }) ||
             (bookingStart <= startDate && bookingEnd >= endDate);
    });
  }

  /**
   * Get bookings for a specific room
   */
  static getBookingsForRoom(bookings: Booking[], roomId: number): Booking[] {
    return bookings.filter(booking => booking.roomId === roomId);
  }

  /**
   * Get room availability for a time slot
   */
  static getRoomAvailability(rooms: Room[], bookings: Booking[], startTime: string, endTime: string): Room[] {
    const requestedStart = parseISO(startTime);
    const requestedEnd = parseISO(endTime);

    return rooms.filter(room => {
      const roomBookings = this.getBookingsForRoom(bookings, room.id);
      
      return !roomBookings.some(booking => {
        const bookingStart = parseISO(booking.startTime);
        const bookingEnd = parseISO(booking.endTime);
        
        // Check for overlap
        return (requestedStart < bookingEnd && requestedEnd > bookingStart);
      });
    });
  }

  /**
   * Get status color class using alBaraka colors
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-100 text-red-800 border-red-200'; // alBaraka red/orange
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-800 border-slate-200'; // alBaraka dark gray
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200'; // alBaraka medium gray
      case 'FREE':
        return 'bg-red-100 text-red-800 border-red-200'; // alBaraka red/orange
      case 'BUSY':
        return 'bg-slate-100 text-slate-800 border-slate-200'; // alBaraka dark gray
      case 'MAINTENANCE':
        return 'bg-amber-100 text-amber-800 border-amber-200'; // alBaraka brown
      case 'RESERVED':
        return 'bg-stone-100 text-stone-800 border-stone-200'; // alBaraka beige
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Format time range for display
   */
  static formatTimeRange(startTime: string, endTime: string): string {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  }

  /**
   * Get calendar navigation dates
   */
  static getNavigationDates(currentDate: Date, mode: 'month' | 'week' | 'day') {
    switch (mode) {
      case 'month':
        return {
          previous: subDays(startOfMonth(currentDate), 1),
          next: addDays(endOfMonth(currentDate), 1),
        };
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        return {
          previous: subDays(weekStart, 7),
          next: addDays(weekStart, 7),
        };
      case 'day':
        return {
          previous: subDays(currentDate, 1),
          next: addDays(currentDate, 1),
        };
      default:
        return {
          previous: subDays(currentDate, 1),
          next: addDays(currentDate, 1),
        };
    }
  }

  /**
   * Generate calendar grid for month view
   */
  static generateMonthGrid(date: Date): Date[][] {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const startOfCalendar = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endOfCalendar = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    let currentDate = startOfCalendar;

    while (currentDate <= endOfCalendar) {
      currentWeek.push(currentDate);
      
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      
      currentDate = addDays(currentDate, 1);
    }

    return weeks;
  }

  /**
   * Check if a date is today
   */
  static isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  /**
   * Check if a date is in the current month
   */
  static isCurrentMonth(date: Date, currentMonth: Date): boolean {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  }

  /**
   * Get booking duration in minutes
   */
  static getBookingDuration(startTime: string, endTime: string): number {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  /**
   * Format duration for display
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  }
}
