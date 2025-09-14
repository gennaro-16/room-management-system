'use client';

import React from 'react';
import { format, isSameDay, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Booking, Room } from '@/lib/api';
import { CalendarUtils } from './CalendarUtils';

interface CalendarGridProps {
  selectedDate: Date;
  bookings: Booking[];
  rooms: Room[];
  viewMode: 'month' | 'week' | 'day';
  onDateSelect: (date: Date) => void;
  onBookingClick?: (booking: Booking) => void;
  onNewBooking?: (date: Date) => void;
  selectedRoom?: string;
}

export function CalendarGrid({
  selectedDate,
  bookings,
  rooms,
  viewMode,
  onDateSelect,
  onBookingClick,
  onNewBooking,
  selectedRoom = 'all'
}: CalendarGridProps) {
  const filteredBookings = selectedRoom === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.roomId.toString() === selectedRoom);

  const renderMonthView = () => {
    const weeks = CalendarUtils.generateMonthGrid(selectedDate);
    
    return (
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="col-span-7 grid grid-cols-7">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="bg-muted p-2 text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((date, dayIndex) => {
              const dayBookings = CalendarUtils.getBookingsForDate(filteredBookings, date);
              const isToday = CalendarUtils.isToday(date);
              const isCurrentMonth = CalendarUtils.isCurrentMonth(date, selectedDate);
              const isSelected = isSameDay(date, selectedDate);
              
              return (
                <div
                  key={dayIndex}
                  className={`bg-background min-h-[120px] p-1 border-r border-b border-border last:border-r-0 ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  } ${isSelected ? 'bg-primary/10' : ''}`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 text-xs ${
                          isToday ? 'bg-primary text-primary-foreground' : ''
                        }`}
                        onClick={() => onDateSelect(date)}
                      >
                        {format(date, 'd')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onNewBooking?.(date)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      {dayBookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking.id}
                          className="text-xs p-1 rounded bg-red-100 text-red-800 cursor-pointer hover:bg-red-200 transition-colors border border-red-200"
                          onClick={() => onBookingClick?.(booking)}
                          title={`${booking.user && typeof booking.user === 'object' 
                            ? (booking.user.firstName && booking.user.lastName 
                                ? `${booking.user.firstName} ${booking.user.lastName}`
                                : booking.user.username)
                            : booking.user || 'Unknown User'} - ${booking.room?.name || 'Room'}`}
                        >
                          <div className="truncate font-medium">
                            {booking.user && typeof booking.user === 'object' 
                              ? (booking.user.firstName && booking.user.lastName 
                                  ? `${booking.user.firstName} ${booking.user.lastName}`
                                  : booking.user.username)
                              : booking.user || 'Unknown User'}
                          </div>
                          <div className="text-xs opacity-70">
                            {CalendarUtils.formatTimeRange(booking.startTime, booking.endTime)}
                          </div>
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayBookings.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="col-span-7 grid grid-cols-7">
          {weekDays.map((date, index) => (
            <div key={index} className="bg-muted p-2 text-center text-sm font-medium">
              <div>{format(date, 'EEE')}</div>
              <div className="text-xs">{format(date, 'd')}</div>
            </div>
          ))}
        </div>
        
        {/* Week days */}
        {weekDays.map((date, dayIndex) => {
          const dayBookings = CalendarUtils.getBookingsForDate(filteredBookings, date);
          const isToday = CalendarUtils.isToday(date);
          const isSelected = isSameDay(date, selectedDate);
          
          return (
            <div
              key={dayIndex}
              className={`bg-background min-h-[200px] p-2 border-r border-b border-border last:border-r-0 ${
                isSelected ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${
                      isToday ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    onClick={() => onDateSelect(date)}
                  >
                    {format(date, 'd')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onNewBooking?.(date)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex-1 space-y-2">
                  {dayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-2 rounded bg-red-100 text-red-800 cursor-pointer hover:bg-red-200 transition-colors border border-red-200"
                      onClick={() => onBookingClick?.(booking)}
                    >
                      <div className="text-sm font-medium truncate">
                        {booking.user && typeof booking.user === 'object' 
                          ? (booking.user.firstName && booking.user.lastName 
                              ? `${booking.user.firstName} ${booking.user.lastName}`
                              : booking.user.username)
                          : booking.user || 'Unknown User'}
                      </div>
                      <div className="text-xs opacity-70">
                        {CalendarUtils.formatTimeRange(booking.startTime, booking.endTime)}
                      </div>
                      <div className="text-xs opacity-70 truncate">
                        {booking.room?.name || 'Room'}
                      </div>
                      <Badge 
                        className={`text-xs ${CalendarUtils.getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayBookings = CalendarUtils.getBookingsForDate(filteredBookings, selectedDate);
    const isToday = CalendarUtils.isToday(selectedDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          {isToday && (
            <Badge className="mt-1">Today</Badge>
          )}
        </div>
        
        <div className="grid gap-3">
          {dayBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No bookings scheduled for this day</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => onNewBooking?.(selectedDate)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Booking
              </Button>
            </div>
          ) : (
            dayBookings.map((booking) => (
              <Card key={booking.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {booking.user && typeof booking.user === 'object' 
                          ? (booking.user.firstName && booking.user.lastName 
                              ? `${booking.user.firstName} ${booking.user.lastName}`
                              : booking.user.username)
                          : booking.user || 'Unknown User'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.room?.name || 'Room'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {CalendarUtils.formatTimeRange(booking.startTime, booking.endTime)}
                      </p>
                      {booking.purpose && (
                        <p className="text-sm mt-1">{booking.purpose}</p>
                      )}
                    </div>
                    <Badge className={CalendarUtils.getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
}
