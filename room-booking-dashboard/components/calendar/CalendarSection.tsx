'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, Users, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfDay, endOfDay, isSameDay, parseISO, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { bookingsApi, roomsApi, type Booking, type Room, type CreateBookingDto, type UpdateBookingDto, type User, type MoveBookingDto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers, useCreateBooking, useUpdateBooking } from '@/hooks/useApi';
import { CalendarGrid } from './CalendarGrid';
import { CalendarUtils } from './CalendarUtils';
import { BookingDetailsDialog } from './BookingDetailsDialog';
import { NewBookingDialog } from '@/components/bookings/NewBookingDialog';
import { EditBookingDialog } from '@/components/bookings/EditBookingDialog';
import DayTimeline from './DayTimeline';
import { onBookingsChanged } from '@/lib/events';

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
  const { hasRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [groupBy, setGroupBy] = useState<'room' | 'user'>('room');
  const { data: users } = useUsers(groupBy === 'user');
  const [loading, setLoading] = useState(true);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const bookingCacheRef = useRef<Map<string, Booking[]>>(new Map());
  const debounceRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { createBooking, loading: createLoading, error: createError } = useCreateBooking();
  const { updateBooking, loading: updateLoading, error: updateError } = useUpdateBooking();

  const isAdminRole = hasRole(['ADMIN', 'SUPER_ADMIN']);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Global auto-refresh when other parts of the app modify bookings
  useEffect(() => {
    const off = onBookingsChanged(() => {
      loadBookings();
    });
    return off;
  }, [selectedDate, selectedRoom, selectedUser, viewMode, groupBy]);

  // Load bookings when date, room, user filter, or groupBy changes (debounced)
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      loadBookings();
    }, 200);
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [selectedDate, selectedRoom, selectedUser, viewMode, groupBy]);

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
      
      if (groupBy === 'room' && selectedRoom !== 'all') {
        filters.roomId = parseInt(selectedRoom);
      } else if (groupBy === 'user' && selectedUser !== 'all') {
        filters.organizerId = parseInt(selectedUser);
      }
      const cacheKey = JSON.stringify({ start: filters.startDate, end: filters.endDate, roomId: filters.roomId || null, organizerId: filters.organizerId || null });
      const cached = bookingCacheRef.current.get(cacheKey);
      if (cached) {
        setBookings(cached);
        return;
      }
      const bookingsData = await bookingsApi.getAll(filters);
      bookingCacheRef.current.set(cacheKey, bookingsData);
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

  const handleCreateBooking = async (data: CreateBookingDto) => {
    try {
      await createBooking(data);
      toast({
        title: "Success",
        description: "Booking created successfully",
      });
      setIsNewBookingOpen(false);
      loadBookings();
    } catch (error) {
      // Error is handled by the createBooking hook
      console.error('Error creating booking:', error);
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
    setSelectedBooking(booking);
    setIsEditBookingOpen(true);
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

  const handleMoveBooking = async (booking: Booking) => {
    try {
      // Move to same time window, different room (selectedRoom must be specific)
      if (groupBy !== 'room' || selectedRoom === 'all') {
        toast({ title: 'Sélectionnez une salle', description: 'Choisissez une salle spécifique pour déplacer la réservation', variant: 'destructive' });
        return;
      }
      const targetRoomId = parseInt(selectedRoom);
      if (Number.isNaN(targetRoomId)) {
        toast({ title: 'Salle invalide', description: 'Salle sélectionnée invalide', variant: 'destructive' });
        return;
      }
      const payload: MoveBookingDto = {
        newRoomId: targetRoomId,
        startTime: booking.startTime,
        endTime: booking.endTime,
      };
      const moved = await bookingsApi.move(booking.id, payload);
      toast({ title: 'Réservation déplacée', description: `Nouvelle demande créée pour la salle ${moved.room?.name || targetRoomId}` });
      await loadBookings();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error?.message || "Impossible de déplacer la réservation", variant: 'destructive' });
    }
  };

  // Approve from timeline helper (admin only UI passes here)
  const handleApproveBookingFromTimeline = async (booking: Booking) => {
    try {
      await bookingsApi.approve(booking.id);
      toast({ title: 'Succès', description: 'Réservation approuvée' });
      loadBookings();
    } catch (error) {
      toast({ title: 'Erreur', description: "Impossible d'approuver cette réservation", variant: 'destructive' });
    }
  };

  const handleNewBooking = (date: Date) => {
    // Prevent creating bookings in the past (before today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (date < startOfToday) {
      toast({ title: 'Action non autorisée', description: "Vous ne pouvez pas réserver dans le passé" });
      return;
    }
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
          <CardTitle>Calendrier</CardTitle>
          <CardDescription>Chargement des données du calendrier...</CardDescription>
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
          <h2 className="text-2xl font-bold">Calendrier</h2>
          <p className="text-muted-foreground">Voir et gérer les réservations de salles</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsNewBookingOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle réservation
          </Button>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {/* Group By Toggle for Admins */}
          {isAdminRole && (
            <div className="flex items-center gap-2">
              <Label htmlFor="group-by">Grouper par :</Label>
              <Select value={groupBy} onValueChange={(value) => setGroupBy(value as 'room' | 'user')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room">Salle</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Room Filter */}
          {groupBy === 'room' && (
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par salle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les salles</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* User Filter for Admins */}
          {isAdminRole && groupBy === 'user' && (
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par utilisateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'day')}>
          <TabsList>
            <TabsTrigger value="month">Mois</TabsTrigger>
            <TabsTrigger value="week">Semaine</TabsTrigger>
            <TabsTrigger value="day">Jour</TabsTrigger>
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
                  {viewMode === 'week' && `Semaine du ${format(getViewStartDate(), 'dd MMM')}`}
                  {viewMode === 'day' && format(selectedDate, 'EEEE dd MMMM yyyy')}
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
                    Aujourd'hui
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
                groupBy={groupBy}
                users={users || []}
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
                {format(selectedDate, 'dd MMM yyyy')}
              </CardTitle>
              <CardDescription>
                {getBookingsForSelectedDate().length} réservation(s) planifiée(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getBookingsForSelectedDate().length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Aucune réservation prévue pour cette date
                  </p>
                ) : (
                  getBookingsForSelectedDate().map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {booking.organizer?.firstName && booking.organizer?.lastName 
                            ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                            : booking.organizer?.username || 'Unknown User'}
                        </div>
                        <Badge className={getStatusColor(CalendarUtils.getDisplayStatus(booking))}>
                          {CalendarUtils.getDisplayStatus(booking)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.room?.name || 'Salle'}
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

      {/* Day timeline as a separate, large section */}
      <div>
        <DayTimeline 
          date={selectedDate} 
          bookings={getBookingsForSelectedDate()} 
          rooms={rooms} 
          isAdmin={isAdminRole}
          onBookingClick={(b) => handleBookingClick(b)}
          onApprove={(b) => handleApproveBookingFromTimeline(b)}
        />
      </div>

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <BookingDetailsDialog
          booking={selectedBooking}
          room={rooms.find(r => r.id === selectedBooking.roomId) || null}
          isOpen={isBookingDetailsOpen}
          onClose={() => setIsBookingDetailsOpen(false)}
          onEdit={handleEditBooking}
          onDelete={handleDeleteBooking}
          onMove={handleMoveBooking}
        />
      )}

      {/* Edit Booking Dialog */}
      <EditBookingDialog
        open={isEditBookingOpen}
        onOpenChange={setIsEditBookingOpen}
        booking={selectedBooking}
        onSubmit={async (id: number, data: UpdateBookingDto) => {
          // If user edits an approved booking, set back to PENDING (re-approval flow)
          if (selectedBooking?.status === 'APPROVED') {
            data = { ...data, status: 'PENDING' };
          }
          await updateBooking(id, data);
          setIsEditBookingOpen(false);
          setIsBookingDetailsOpen(false);
          loadBookings();
        }}
        loading={updateLoading}
        error={updateError}
      />

      {/* New Booking Dialog */}
      <NewBookingDialog
        open={isNewBookingOpen}
        onOpenChange={setIsNewBookingOpen}
        onSubmit={handleCreateBooking}
        loading={createLoading}
        error={createError}
      />
    </div>
  );
}
