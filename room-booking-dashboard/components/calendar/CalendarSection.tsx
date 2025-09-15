'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Clock, Users, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfDay, endOfDay, isSameDay, parseISO, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { bookingsApi, roomsApi, type Booking, type Room, type CreateBookingDto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CalendarGrid } from './CalendarGrid';
import { CalendarUtils } from './CalendarUtils';
import { BookingDetailsDialog } from './BookingDetailsDialog';

interface CalendarEvent {
  id: number;
  title: string;
  room: string;
  user: string;
  startTime: string;
  endTime: string;
  status: string;
  purpose?: string;
}

export function CalendarSection() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [loading, setLoading] = useState(true);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [newBooking, setNewBooking] = useState<Partial<CreateBookingDto>>({
    purpose: '',
    startTime: '',
    endTime: '',
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Load bookings when date or room filter changes
  useEffect(() => {
    loadBookings();
  }, [selectedDate, selectedRoom, viewMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsData, roomsData] = await Promise.all([
        bookingsApi.getAll(),
        roomsApi.getAll()
      ]);
      setBookings(bookingsData);
      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      const filters: any = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      
      if (selectedRoom !== 'all') {
        filters.roomId = parseInt(selectedRoom);
      }
      
      const bookingsData = await bookingsApi.getAll(filters);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const getViewStartDate = () => {
    switch (viewMode) {
      case 'week':
        const startOfWeek = subDays(selectedDate, selectedDate.getDay());
        return startOfDay(startOfWeek);
      case 'day':
        return startOfDay(selectedDate);
      default:
        return startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  };

  const getViewEndDate = () => {
    switch (viewMode) {
      case 'week':
        const endOfWeek = addDays(selectedDate, 6 - selectedDate.getDay());
        return endOfDay(endOfWeek);
      case 'day':
        return endOfDay(selectedDate);
      default:
        return endOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0));
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.startTime);
      return isSameDay(bookingDate, date);
    });
  };

  const getBookingsForSelectedDate = () => {
    return getBookingsForDate(selectedDate);
  };

  const handleCreateBooking = async () => {
    if (!newBooking.roomId || !newBooking.startTime || !newBooking.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await bookingsApi.create(newBooking as CreateBookingDto);
      toast({
        title: "Success",
        description: "Booking created successfully",
      });
      setIsNewBookingOpen(false);
      setNewBooking({
        purpose: '',
        startTime: '',
        endTime: '',
      });
      loadBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    return CalendarUtils.getStatusColor(status);
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsBookingDetailsOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    // TODO: Implement edit booking functionality
    console.log('Edit booking:', booking);
  };

  const handleDeleteBooking = async (booking: Booking) => {
    try {
      await bookingsApi.cancel(booking.id);
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const handleNewBooking = (date: Date) => {
    setNewBooking({
      ...newBooking,
      startTime: format(date, "yyyy-MM-dd'T'09:00"),
      endTime: format(date, "yyyy-MM-dd'T'10:00"),
    });
    setIsNewBookingOpen(true);
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const navigationDates = CalendarUtils.getNavigationDates(selectedDate, viewMode);
    const newDate = direction === 'prev' ? navigationDates.previous : navigationDates.next;
    setSelectedDate(newDate);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Loading calendar data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendar</h2>
          <p className="text-muted-foreground">View and manage room reservations</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
                <DialogDescription>
                  Book a room for a specific time period
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="room">Room</Label>
                  <Select
                    value={newBooking.roomId?.toString() || ''}
                    onValueChange={(value) => setNewBooking({ ...newBooking, roomId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.name} (Capacity: {room.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                
                <div>
                  <Label htmlFor="purpose">Purpose (Optional)</Label>
                  <Textarea
                    id="purpose"
                    value={newBooking.purpose || ''}
                    onChange={(e) => setNewBooking({ ...newBooking, purpose: e.target.value })}
                    placeholder="Meeting purpose"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={newBooking.startTime || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={newBooking.endTime || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewBookingOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBooking}>
                    Create Booking
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id.toString()}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'day')}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {viewMode === 'month' && format(selectedDate, 'MMMM yyyy')}
                  {viewMode === 'week' && `Week of ${format(getViewStartDate(), 'MMM d')}`}
                  {viewMode === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateCalendar('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateCalendar('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CalendarGrid
                selectedDate={selectedDate}
                bookings={bookings}
                rooms={rooms}
                viewMode={viewMode}
                onDateSelect={setSelectedDate}
                onBookingClick={handleBookingClick}
                onNewBooking={handleNewBooking}
                selectedRoom={selectedRoom}
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Bookings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {format(selectedDate, 'MMM d, yyyy')}
              </CardTitle>
              <CardDescription>
                {getBookingsForSelectedDate().length} booking(s) scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getBookingsForSelectedDate().length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No bookings scheduled for this date
                  </p>
                ) : (
                  getBookingsForSelectedDate().map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {booking.user && typeof booking.user === 'object' 
                            ? (booking.organizer.firstName && booking.organizer.lastName 
                                ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                                : booking.organizer.username)
                            : booking.user || 'Unknown User'}
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.room?.name || 'Room'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(booking.startTime), 'HH:mm')} - {format(parseISO(booking.endTime), 'HH:mm')}
                        </div>
                        {booking.purpose && (
                          <div className="text-xs mt-1">{booking.purpose}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Details Dialog */}
      <BookingDetailsDialog
        booking={selectedBooking}
        room={selectedBooking ? rooms.find(r => r.id === selectedBooking.roomId) || null : null}
        isOpen={isBookingDetailsOpen}
        onClose={() => setIsBookingDetailsOpen(false)}
        onEdit={handleEditBooking}
        onDelete={handleDeleteBooking}
      />
    </div>
  );
}
