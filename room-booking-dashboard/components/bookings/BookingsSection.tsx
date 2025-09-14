'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Calendar, Clock, User, MapPin, Edit, Trash2 } from 'lucide-react';
import { useBookings, useCreateBooking, useUpdateBooking, useCancelBooking } from '@/hooks/useApi';
import { Booking, BookingStatus, CreateBookingDto, UpdateBookingDto } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { NewBookingDialog } from './NewBookingDialog';
import { EditBookingDialog } from './EditBookingDialog';

export function BookingsSection() {
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  const { data: bookings, loading, error, refetch } = useBookings();
  const { createBooking, loading: createLoading, error: createError } = useCreateBooking();
  const { updateBooking, loading: updateLoading, error: updateError } = useUpdateBooking();
  const { cancelBooking, loading: deleteLoading, error: deleteError } = useCancelBooking();

  // Filter bookings based on search and filters
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    return bookings.filter(booking => {
      const userName = booking.user && typeof booking.user === 'object' 
        ? (booking.user.firstName && booking.user.lastName 
            ? `${booking.user.firstName} ${booking.user.lastName}`
            : booking.user.username)
        : booking.user || '';
        
      const matchesSearch = 
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const handleCreateBooking = async (data: CreateBookingDto) => {
    await createBooking(data);
    refetch();
  };

  const handleUpdateBooking = async (id: number, data: UpdateBookingDto) => {
    await updateBooking(id, data);
    refetch();
  };

  const handleDeleteBooking = async (bookingId: number) => {
    await cancelBooking(bookingId);
    refetch();
  };

  const handleEditClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditBookingOpen(true);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-balance">Booking Management</h2>
            <p className="text-muted-foreground">View and manage all room reservations</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-balance">Booking Management</h2>
            <p className="text-muted-foreground">View and manage all room reservations</p>
          </div>
        </div>
        <ErrorAlert error={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-balance">Booking Management</h2>
          <p className="text-muted-foreground">View and manage all room reservations</p>
        </div>
        <Button onClick={() => setIsNewBookingOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => {
            const startTime = formatDateTime(booking.startTime);
            const endTime = formatDateTime(booking.endTime);
            
            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{booking.purpose}</h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{booking.room?.name || 'Room not found'}</span>
                          <span className="text-muted-foreground">({booking.room?.capacity || 0} people)</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {booking.user && typeof booking.user === 'object' 
                              ? (booking.user.firstName && booking.user.lastName 
                                  ? `${booking.user.firstName} ${booking.user.lastName}`
                                  : booking.user.username)
                              : booking.user || 'Unknown User'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{startTime.date}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{startTime.time} - {endTime.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClick(booking)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteBooking(booking.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'No bookings match your current filters. Try adjusting your search criteria.'
                : 'No bookings have been created yet. Create your first booking to get started.'
              }
            </p>
            <div className="flex gap-2">
              {searchTerm || statusFilter !== 'all' ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              ) : null}
              <Button onClick={() => setIsNewBookingOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Booking Dialog */}
      <NewBookingDialog
        open={isNewBookingOpen}
        onOpenChange={setIsNewBookingOpen}
        onSubmit={handleCreateBooking}
        loading={createLoading}
        error={createError}
      />

      {/* Edit Booking Dialog */}
      <EditBookingDialog
        open={isEditBookingOpen}
        onOpenChange={setIsEditBookingOpen}
        booking={selectedBooking}
        onSubmit={handleUpdateBooking}
        loading={updateLoading}
        error={updateError}
      />
    </div>
  );
}
