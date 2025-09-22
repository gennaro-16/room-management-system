'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Calendar, Clock, User, MapPin, Edit, Trash2, ChevronDown, ChevronUp, Users, Building2, Layers, Phone, Mail, FileText, Wifi, Coffee, Monitor, Presentation, Video, Settings, Wrench, AlertTriangle, Repeat, UserCheck, ExternalLink, Timer } from 'lucide-react';
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
  const [expandedBookings, setExpandedBookings] = useState<Set<number>>(new Set());

  const { data: bookings, loading, error, refetch } = useBookings();
  console.log('Bookings data:', bookings);
  const { createBooking, loading: createLoading, error: createError } = useCreateBooking();
  const { updateBooking, loading: updateLoading, error: updateError } = useUpdateBooking();
  const { cancelBooking, loading: deleteLoading, error: deleteError } = useCancelBooking();

  // Filter bookings based on search and filters
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    return bookings.filter(booking => {
      const userName = booking.organizer && typeof booking.organizer === 'object' 
        ? (booking.organizer.firstName && booking.organizer.lastName 
            ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
            : booking.organizer.username)
        : '';
        
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

  const toggleExpanded = (bookingId: number) => {
    setExpandedBookings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
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
            const isExpanded = expandedBookings.has(booking.id);
            
            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Main Booking Info - Always Visible */}
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
                              {booking.organizer && typeof booking.organizer === 'object' 
                                ? (booking.organizer.firstName && booking.organizer.lastName 
                                    ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                                    : booking.organizer.username)
                                : 'Unknown User'}
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
                          onClick={() => toggleExpanded(booking.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ChevronDown className="h-3 w-3 mr-1" />
                          )}
                          {isExpanded ? 'Less' : 'Details'}
                        </Button>
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

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        {/* Room Details */}
                        <div className="space-y-2">
                          <div className="font-medium text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Room Information
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            {booking.room?.floor && (
                              <div className="flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                <span>Floor {booking.room.floor}</span>
                              </div>
                            )}
                            {booking.room?.department && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                <span>{typeof booking.room.department === 'string' 
                                  ? booking.room.department 
                                  : booking.room.department?.name}
                                </span>
                              </div>
                            )}
                            {booking.room?.description && (
                              <div className="col-span-2 text-xs">
                                {booking.room.description}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Meeting Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            {booking.title && (
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="font-medium text-sm">Meeting Title</div>
                                  <div className="text-sm text-muted-foreground">{booking.title}</div>
                                </div>
                              </div>
                            )}

                            {booking.agenda && (
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="font-medium text-sm">Agenda</div>
                                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{booking.agenda}</div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">Duration</div>
                                <div className="text-sm text-muted-foreground">
                                  {(() => {
                                    const start = new Date(booking.startTime);
                                    const end = new Date(booking.endTime);
                                    const durationMs = end.getTime() - start.getTime();
                                    const hours = Math.floor(durationMs / (1000 * 60 * 60));
                                    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                                    return `${hours}h ${minutes}m`;
                                  })()}
                                </div>
                              </div>
                            </div>

                            {booking.isRecurring && (
                              <div className="flex items-center gap-2">
                                <Repeat className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium text-sm">Recurrence</div>
                                  <div className="text-sm text-muted-foreground">
                                    {booking.recurrenceRule ? (
                                      <Badge variant="outline" className="text-xs">
                                        {booking.recurrenceRule.includes('WEEKLY') ? 'Weekly' : 
                                         booking.recurrenceRule.includes('DAILY') ? 'Daily' :
                                         booking.recurrenceRule.includes('MONTHLY') ? 'Monthly' : 'Custom'}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs">Recurring</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            {/* Organizer Info */}
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-sm">Organizer</div>
                                <div className="text-sm">
                                  {booking.organizer && typeof booking.organizer === 'object' 
                                    ? (booking.organizer.firstName && booking.organizer.lastName 
                                        ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                                        : booking.organizer.username)
                                    : 'Unknown User'}
                                  {booking.organizer && typeof booking.organizer === 'object' && booking.organizer.title && (
                                    <div className="text-xs text-muted-foreground">{booking.organizer.title}</div>
                                  )}
                                </div>
                                {booking.organizer && typeof booking.organizer === 'object' && booking.organizer.department && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {typeof booking.organizer.department === 'string' 
                                      ? booking.organizer.department 
                                      : booking.organizer.department?.name}
                                  </Badge>
                                )}
                                {booking.organizer && typeof booking.organizer === 'object' && booking.organizer.email && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Mail className="h-3 w-3" />
                                    {booking.organizer.email}
                                  </div>
                                )}
                                {booking.organizer && typeof booking.organizer === 'object' && booking.organizer.phone && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {booking.organizer.phone}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Attendees Info */}
                            <div className="flex items-start gap-2">
                              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="font-medium text-sm">Expected Attendees</div>
                                <div className="text-sm text-muted-foreground">
                                  {booking.expectedAttendees} people
                                </div>
                                {booking.internalAttendees && booking.internalAttendees.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {booking.internalAttendees.length} internal attendees
                                  </div>
                                )}
                                {booking.externalAttendees && booking.externalAttendees.length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    {booking.externalAttendees.length} external attendees
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Room Amenities */}
                        {booking.room?.amenities && booking.room.amenities.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-medium text-sm">Room Amenities</div>
                            <div className="flex flex-wrap gap-1">
                              {booking.room.amenities.map((amenity, index) => {
                                const getAmenityIcon = (amenity: string) => {
                                  const lowerAmenity = amenity.toLowerCase();
                                  if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return <Wifi className="h-3 w-3" />;
                                  if (lowerAmenity.includes('coffee') || lowerAmenity.includes('café')) return <Coffee className="h-3 w-3" />;
                                  if (lowerAmenity.includes('monitor') || lowerAmenity.includes('screen')) return <Monitor className="h-3 w-3" />;
                                  if (lowerAmenity.includes('presentation') || lowerAmenity.includes('projector')) return <Presentation className="h-3 w-3" />;
                                  if (lowerAmenity.includes('video') || lowerAmenity.includes('conference')) return <Video className="h-3 w-3" />;
                                  if (lowerAmenity.includes('tool') || lowerAmenity.includes('equipment')) return <Wrench className="h-3 w-3" />;
                                  return <Settings className="h-3 w-3" />;
                                };

                                return (
                                  <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                                    {getAmenityIcon(amenity)}
                                    {amenity}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Required Amenities */}
                        {booking.requiredAmenities && booking.requiredAmenities.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-medium text-sm flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Required Amenities & Tools
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {booking.requiredAmenities.map((amenity, index) => {
                                const getAmenityIcon = (amenity: string) => {
                                  const lowerAmenity = amenity.toLowerCase();
                                  if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return <Wifi className="h-3 w-3" />;
                                  if (lowerAmenity.includes('coffee') || lowerAmenity.includes('café')) return <Coffee className="h-3 w-3" />;
                                  if (lowerAmenity.includes('monitor') || lowerAmenity.includes('screen')) return <Monitor className="h-3 w-3" />;
                                  if (lowerAmenity.includes('presentation') || lowerAmenity.includes('projector')) return <Presentation className="h-3 w-3" />;
                                  if (lowerAmenity.includes('video') || lowerAmenity.includes('conference')) return <Video className="h-3 w-3" />;
                                  if (lowerAmenity.includes('tool') || lowerAmenity.includes('equipment')) return <Wrench className="h-3 w-3" />;
                                  return <Settings className="h-3 w-3" />;
                                };

                                return (
                                  <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                                    {getAmenityIcon(amenity)}
                                    {amenity}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Capacity Analysis */}
                        <div className="space-y-2">
                          <div className="font-medium text-sm flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Capacity Analysis
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span>Room Capacity:</span>
                              <span className="font-medium">{booking.room?.capacity} seats</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span>Expected Attendees:</span>
                              <span className="font-medium">{booking.expectedAttendees} people</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span>Capacity Usage:</span>
                              <span className={`font-medium ${booking.expectedAttendees > (booking.room?.capacity || 0) ? 'text-red-600' : 'text-green-600'}`}>
                                {Math.round((booking.expectedAttendees / (booking.room?.capacity || 1)) * 100)}%
                              </span>
                            </div>
                          </div>
                          {booking.expectedAttendees > (booking.room?.capacity || 0) && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Warning: Expected attendees exceed room capacity!</span>
                            </div>
                          )}
                        </div>

                        {/* Internal Attendees Details */}
                        {booking.internalAttendees && booking.internalAttendees.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-medium text-sm flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              Internal Attendees ({booking.internalAttendees.length})
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {booking.internalAttendees.map((attendee, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {attendee.firstName && attendee.lastName
                                        ? `${attendee.firstName} ${attendee.lastName}`
                                        : attendee.username
                                      }
                                    </div>
                                    {attendee.title && (
                                      <div className="text-xs text-muted-foreground">{attendee.title}</div>
                                    )}
                                  </div>
                                  {attendee.department && (
                                    <Badge variant="outline" className="text-xs">
                                      {typeof attendee.department === 'string' 
                                        ? attendee.department 
                                        : attendee.department?.name}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* External Attendees */}
                        {booking.externalAttendees && booking.externalAttendees.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-medium text-sm flex items-center gap-2">
                              <ExternalLink className="h-4 w-4" />
                              External Attendees ({booking.externalAttendees.length})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {booking.externalAttendees.map((attendee, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {attendee}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Room Status & Maintenance */}
                        {booking.room?.isUnderMaintenance && (
                          <div className="space-y-2">
                            <div className="font-medium text-sm flex items-center gap-2 text-orange-600">
                              <AlertTriangle className="h-4 w-4" />
                              Room Maintenance Alert
                            </div>
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded text-sm">
                              <div className="font-medium text-orange-800">Room is currently under maintenance</div>
                              {booking.room.maintenanceNotes && (
                                <div className="text-orange-700 mt-1">{booking.room.maintenanceNotes}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer with Request Info */}
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span>Created on {new Date(booking.createdAt).toLocaleDateString()}</span>
                              {booking.isRecurring && (
                                <Badge variant="outline" className="text-xs">
                                  Recurring
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Status: {booking.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
