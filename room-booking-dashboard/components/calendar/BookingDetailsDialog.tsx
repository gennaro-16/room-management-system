'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, MapPin, Calendar, User, FileText, Trash2, Edit } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Booking, Room } from '@/lib/api';
import { CalendarUtils } from './CalendarUtils';

interface BookingDetailsDialogProps {
  booking: Booking | null;
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
}

export function BookingDetailsDialog({
  booking,
  room,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: BookingDetailsDialogProps) {
  if (!booking) return null;

  const startTime = parseISO(booking.startTime);
  const endTime = parseISO(booking.endTime);
  const duration = CalendarUtils.getBookingDuration(booking.startTime, booking.endTime);

  const handleEdit = () => {
    onEdit?.(booking);
    onClose();
  };

  const handleDelete = () => {
    onDelete?.(booking);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Details
          </DialogTitle>
          <DialogDescription>
            View and manage booking information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className={CalendarUtils.getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>

          {/* Booking Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                {booking.user && typeof booking.user === 'object' 
                  ? (booking.organizer.firstName && booking.organizer.lastName 
                      ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                      : booking.organizer.username)
                  : booking.user || 'Unknown User'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Room Information */}
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{room?.name || 'Unknown Room'}</div>
                  <div className="text-sm text-muted-foreground">
                    Capacity: {room?.capacity || 'N/A'} people
                  </div>
                </div>
              </div>

              <Separator />

              {/* Date and Time */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{format(startTime, 'EEEE, MMMM d, yyyy')}</div>
                  <div className="text-sm text-muted-foreground">
                    {CalendarUtils.formatTimeRange(booking.startTime, booking.endTime)}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Duration */}
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Duration</div>
                  <div className="text-sm text-muted-foreground">
                    {CalendarUtils.formatDuration(duration)}
                  </div>
                </div>
              </div>

              {/* Purpose */}
              {booking.purpose && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Purpose</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.purpose}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Room Details */}
              {room?.description && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Room Description</div>
                      <div className="text-sm text-muted-foreground">
                        {room.description}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Booking Metadata */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Created: {format(parseISO(booking.createdAt), 'MMM d, yyyy HH:mm')}</div>
            <div>Last updated: {format(parseISO(booking.updatedAt), 'MMM d, yyyy HH:mm')}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {onEdit && (
              <Button variant="outline" onClick={handleEdit} className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
