'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, MapPin, Calendar, User, FileText, Trash2, Edit, MoveRight } from 'lucide-react';
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
  onMove?: (booking: Booking) => void;
}

export function BookingDetailsDialog({
  booking,
  room,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onMove
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

  const handleMove = () => {
    onMove?.(booking);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Détails de la réservation</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">Informations de la réservation</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className={CalendarUtils.getStatusColor(CalendarUtils.getDisplayStatus(booking))}>
              {CalendarUtils.getDisplayStatus(booking)}
            </Badge>
          </div>

          {/* Booking Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-start gap-2">
                <User className="h-4 w-4 mt-1 flex-shrink-0" />
                <span className="break-words">
                  {booking.organizer && typeof booking.organizer === "object"
                    ? booking.organizer.firstName && booking.organizer.lastName
                      ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                      : booking.organizer.username
                    : "Unknown User"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Room Information */}
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium break-words">{room?.name || "Unknown Room"}</div>
                  <div className="text-sm text-muted-foreground">Capacity: {room?.capacity || "N/A"} people</div>
                </div>
              </div>

              <Separator />

              {/* Date and Time */}
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium break-words text-sm sm:text-base">
                    {format(startTime, "EEEE, MMMM d, yyyy")}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {CalendarUtils.formatTimeRange(booking.startTime, booking.endTime)}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Duration */}
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">Durée</div>
                  <div className="text-sm text-muted-foreground">{CalendarUtils.formatDuration(duration)}</div>
                </div>
              </div>

              {/* Purpose */}
              {booking.purpose && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">Objectif</div>
                      <div className="text-sm text-muted-foreground break-words">{booking.purpose}</div>
                    </div>
                  </div>
                </>
              )}

              {/* Participants */}
              {(booking.internalAttendees && booking.internalAttendees.length > 0) ||
              (booking.externalAttendees && booking.externalAttendees.length > 0) ? (
                <>
                  <Separator />
                  <div className="space-y-3 sm:space-y-4">
                    {booking.internalAttendees && booking.internalAttendees.length > 0 && (
                      <div>
                        <div className="font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>Participants internes ({booking.internalAttendees.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {booking.internalAttendees.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs break-all">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {booking.externalAttendees && booking.externalAttendees.length > 0 && (
                      <div>
                        <div className="font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>Participants externes ({booking.externalAttendees.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {booking.externalAttendees.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs break-all">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}

              {/* Room Details */}
              {room?.description && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">Room Description</div>
                      <div className="text-sm text-muted-foreground break-words">{room.description}</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Booking Metadata */}
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1 px-1">
            <div className="break-words">Created: {format(parseISO(booking.createdAt), "MMM d, yyyy HH:mm")}</div>
            <div className="break-words">Last updated: {format(parseISO(booking.updatedAt), "MMM d, yyyy HH:mm")}</div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 order-last sm:order-first bg-transparent">
              Fermer
            </Button>
            {onEdit && (
              <Button variant="outline" onClick={handleEdit} className="flex-1 bg-transparent">
                <Edit className="h-4 w-4 mr-2" />
                <span className="truncate">Modifier</span>
              </Button>
            )}
            {onMove && (
              <Button variant="secondary" onClick={handleMove} className="flex-1">
                <MoveRight className="h-4 w-4 mr-2" />
                <span className="truncate">Déplacer</span>
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="truncate">Supprimer</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
