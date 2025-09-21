'use client';

import React, { useState } from 'react';
import { usePendingBookings, useApproveBooking, useRejectBooking } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, User, Calendar, MapPin, Users, Building2, Layers, Phone, Mail, FileText, Wifi, Coffee, Monitor, Presentation, Video, Settings, Wrench, AlertTriangle, Repeat, UserCheck, ExternalLink, Calendar as CalendarIcon, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import { apiUtils } from '@/lib/api';
import { emitBookingsChanged } from '@/lib/events';

export function BookingApprovals() {
  const { data: pendingBookings, loading, error, refetch } = usePendingBookings();
  const { approveBooking, loading: approving } = useApproveBooking();
  const { rejectBooking, loading: rejecting } = useRejectBooking();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedBookings, setExpandedBookings] = useState<Set<number>>(new Set());

  // Priority scoring for pending bookings (higher = more priority)
  const computePriorityScore = (booking: any) => {
    const capacity = booking?.room?.capacity || 1;
    const expected = booking?.expectedAttendees || 0;
    const utilization = Math.min(1, expected / capacity); // 0..1
    const startMs = new Date(booking.startTime).getTime();
    const endMs = new Date(booking.endTime).getTime();
    const durationMinutes = Math.max(0, Math.round((endMs - startMs) / 60000));
    const normalizedDuration = Math.min(1, durationMinutes / 240); // cap at 4h
    // Weight utilization higher than duration
    return utilization * 0.7 + normalizedDuration * 0.3;
  };

  // Sort pending bookings so overlapping reservations for the same room are ordered by priority
  const sortedBookings = React.useMemo(() => {
    if (!pendingBookings) return [] as any[];
    const list = [...pendingBookings].sort((a: any, b: any) => {
      // Group by room
      if ((a.roomId || 0) !== (b.roomId || 0)) return (a.roomId || 0) - (b.roomId || 0);
      // Then by start time
      const aStart = new Date(a.startTime).getTime();
      const bStart = new Date(b.startTime).getTime();
      if (aStart !== bStart) return aStart - bStart;
      // If same start, higher priority first
      return computePriorityScore(b) - computePriorityScore(a);
    });
    // For consecutive overlapping in same room, bubble higher priority earlier
    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1];
      const cur = list[i];
      if ((prev.roomId || 0) === (cur.roomId || 0)) {
        const prevStart = new Date(prev.startTime).getTime();
        const prevEnd = new Date(prev.endTime).getTime();
        const curStart = new Date(cur.startTime).getTime();
        const curEnd = new Date(cur.endTime).getTime();
        const isOverlap = prevStart < curEnd && prevEnd > curStart;
        if (isOverlap && computePriorityScore(cur) > computePriorityScore(prev)) {
          list[i - 1] = cur;
          list[i] = prev;
          i = Math.max(0, i - 2);
        }
      }
    }
    return list;
  }, [pendingBookings]);

  // Build conflicts map: for each pending booking, list other pending bookings that overlap in the same room
  const conflictsMap = React.useMemo(() => {
    const map = new Map<number, any[]>();
    const list = pendingBookings || [];
    const byRoom: Record<number, any[]> = {};
    list.forEach((b: any) => {
      const roomId = b.roomId || 0;
      byRoom[roomId] = byRoom[roomId] || [];
      byRoom[roomId].push(b);
    });
    Object.values(byRoom).forEach((arr) => {
      const sorted = arr.slice().sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const a = sorted[i];
          const b = sorted[j];
          const aStart = new Date(a.startTime).getTime();
          const aEnd = new Date(a.endTime).getTime();
          const bStart = new Date(b.startTime).getTime();
          const bEnd = new Date(b.endTime).getTime();
          const overlap = aStart < bEnd && aEnd > bStart;
          if (!overlap) break; // since sorted by start, further j won't overlap with a
          map.set(a.id, [...(map.get(a.id) || []), b]);
          map.set(b.id, [...(map.get(b.id) || []), a]);
        }
      }
    });
    return map;
  }, [pendingBookings]);

  const handleApprove = async (bookingId: number) => {
    try {
      const conflicts = conflictsMap.get(bookingId) || [];
      if (conflicts.length > 0) {
        const proceed = window.confirm(
          `Attention: ${conflicts.length} autre(s) demande(s) en conflit pour cette salle et cette période. Vous ne pouvez en approuver qu'une seule sans modifier les autres horaires. Continuer ?`
        );
        if (!proceed) return;
      }
      await approveBooking(bookingId);
      emitBookingsChanged();
      refetch();
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) return;
    
    try {
      await rejectBooking(selectedBooking.id, rejectionReason);
      emitBookingsChanged();
      setRejectDialogOpen(false);
      setSelectedBooking(null);
      setRejectionReason('');
      refetch();
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  const openRejectDialog = (booking: any) => {
    setSelectedBooking(booking);
    setRejectDialogOpen(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!pendingBookings || pendingBookings.length === 0) {
  return (
    <Card className="card-albaraka">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[var(--albaraka-primary)]">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Approbations de réservations
        </CardTitle>
        <CardDescription className="text-[var(--albaraka-muted)]">
          Gérer les demandes de réservation en attente
        </CardDescription>
      </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tout est à jour !</h3>
            <p className="text-muted-foreground">
              Il n'y a aucune demande de réservation en attente pour le moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-albaraka">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[var(--albaraka-primary)]">
          <Clock className="h-5 w-5 text-yellow-600" />
          Approbations de réservations
          <Badge variant="secondary" className="ml-2 bg-[var(--albaraka-secondary)] text-white">
            {pendingBookings.length} en attente
          </Badge>
        </CardTitle>
        <CardDescription className="text-[var(--albaraka-muted)]">
          Examiner et approuver ou rejeter les demandes de réservation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedBookings.map((booking: any) => {
            const isExpanded = expandedBookings.has(booking.id);
            
            return (
              <Card key={booking.id} >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Main Booking Info - Always Visible */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold text-lg">{booking.room?.name}</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {booking.room?.capacity} places
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Priorité {Math.round(computePriorityScore(booking) * 100)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {booking.organizer?.firstName && booking.organizer?.lastName
                                ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                                : booking.organizer?.username}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(booking.startTime).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(booking.startTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(booking.endTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {booking.expectedAttendees} personnes
                            </div>
                          </div>
                        </div>

                        {booking.title && (
                          <div className="text-sm text-muted-foreground mb-2">
                            <strong>Titre:</strong> {booking.title}
                          </div>
                        )}
                        {/* Conflict warning inline */}
                        {(conflictsMap.get(booking.id)?.length || 0) > 0 && (
                          <div className="mt-2 p-2 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 text-xs">
                            {conflictsMap.get(booking.id)!.length} demande(s) en conflit pour cette salle et cette période. Veuillez n'en approuver qu'une ou modifier les horaires.
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleExpanded(booking.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ChevronDown className="h-3 w-3 mr-1" />
                          )}
                          {isExpanded ? 'Moins de détails' : 'Détails'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(booking.id)}
                          disabled={approving}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectDialog(booking)}
                          disabled={rejecting}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        {/* Room Details */}
                        {(booking.room?.floor || booking.room?.department || booking.room?.description) && (
                          <div className="space-y-2">
                            <div className="font-medium text-sm flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Informations sur la salle
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              {booking.room?.floor && (
                                <div className="flex items-center gap-1">
                                  <Layers className="h-3 w-3" />
                                  <span>Étage {booking.room.floor}</span>
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
                        )}

                        {/* Additional Details - Only show what's not already visible */}
                        <div className="space-y-4">
                          {/* Organizer Details */}
                          {(booking.organizer?.title || booking.organizer?.department || booking.organizer?.email || booking.organizer?.phone) && (
                            <div className="space-y-2">
                              <div className="font-medium text-sm flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Détails de l'organisateur
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                {booking.organizer?.title && (
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Titre:</span>
                                    <span>{booking.organizer.title}</span>
                                  </div>
                                )}
                                {booking.organizer?.department && (
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    <span>{typeof booking.organizer.department === 'string' 
                                      ? booking.organizer.department 
                                      : booking.organizer.department?.name}
                                    </span>
                                  </div>
                                )}
                                {booking.organizer?.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{booking.organizer.email}</span>
                                  </div>
                                )}
                                {booking.organizer?.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{booking.organizer.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Meeting Details */}
                          {(booking.agenda || booking.isRecurring) && (
                            <div className="space-y-2">
                              <div className="font-medium text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Détails de la réunion
                              </div>
                              <div className="space-y-2 text-sm">
                                {booking.agenda && (
                                  <div>
                                    <div className="font-medium text-muted-foreground mb-1">Ordre du jour:</div>
                                    <div className="text-muted-foreground whitespace-pre-wrap p-2 bg-gray-50 rounded">
                                      {booking.agenda}
                                    </div>
                                  </div>
                                )}
                                {booking.isRecurring && (
                                  <div className="flex items-center gap-2">
                                    <Repeat className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Récurrence:</span>
                                    <Badge variant="outline" className="text-xs">
                                      {booking.recurrenceRule?.includes('WEEKLY') ? 'Hebdomadaire' :
                                        booking.recurrenceRule?.includes('DAILY') ? 'Quotidienne' :
                                        booking.recurrenceRule?.includes('MONTHLY') ? 'Mensuelle' : 'Personnalisée'}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Attendees Details */}
                          {(booking.internalAttendees && booking.internalAttendees.length > 0) || (booking.externalAttendees && booking.externalAttendees.length > 0) ? (
                            <div className="space-y-2">
                              <div className="font-medium text-sm flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Participants détaillés
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {booking.internalAttendees && booking.internalAttendees.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm text-muted-foreground">Participants internes ({booking.internalAttendees.length})</div>
                                    <div className="flex flex-wrap gap-1">
                                      {booking.internalAttendees.map((name: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">{name}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {booking.externalAttendees && booking.externalAttendees.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm text-muted-foreground">Participants externes ({booking.externalAttendees.length})</div>
                                    <div className="flex flex-wrap gap-1">
                                      {booking.externalAttendees.map((name: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">{name}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Room Amenities */}
                        {booking.room?.amenities && booking.room.amenities.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-medium text-sm">Équipements de la salle</div>
                            <div className="flex flex-wrap gap-1">
                              {booking.room.amenities.map((amenity: string, index: number) => {
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
                              Équipements et outils requis
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {booking.requiredAmenities.map((amenity: string, index: number) => {
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
                            Analyse de capacité
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span>Capacité de la salle :</span>
                              <span className="font-medium">{booking.room?.capacity} places</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span>Participants attendus :</span>
                              <span className="font-medium">{booking.expectedAttendees} personnes</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span>Taux d'occupation :</span>
                              <span className={`font-medium ${booking.expectedAttendees > (booking.room?.capacity || 0) ? 'text-red-600' : 'text-green-600'}`}>
                                {Math.round((booking.expectedAttendees / (booking.room?.capacity || 1)) * 100)}%
                              </span>
                            </div>
                          </div>
                          {booking.expectedAttendees > (booking.room?.capacity || 0) && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Avertissement : les participants attendus dépassent la capacité de la salle !</span>
                            </div>
                          )}
                        </div>



                        {/* Room Status & Maintenance */}
                        {booking.room?.isUnderMaintenance && (
                          <div className="space-y-2">
                            <div className="font-medium text-sm flex items-center gap-2 text-orange-600">
                              <AlertTriangle className="h-4 w-4" />
                              Alerte de maintenance de la salle
                            </div>
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded text-sm">
                              <div className="font-medium text-orange-800">La salle est actuellement en maintenance</div>
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
                              <span>Demandée le {new Date(booking.createdAt).toLocaleDateString()}</span>
                              {booking.isRecurring && (
                                <Badge variant="outline" className="text-xs">
                                  Récurrente
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>En attente d'approbation</span>
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

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter la demande de réservation</DialogTitle>
              <DialogDescription>
                Veuillez indiquer la raison du rejet de cette demande de réservation.
              </DialogDescription>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{selectedBooking.room?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.organizer?.firstName && selectedBooking.organizer?.lastName
                      ? `${selectedBooking.organizer.firstName} ${selectedBooking.organizer.lastName}`
                      : selectedBooking.organizer?.username
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedBooking.startTime).toLocaleDateString()} à{' '}
                    {new Date(selectedBooking.startTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Raison du refus</label>
                  <Textarea
                    placeholder="Veuillez expliquer la raison du refus..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setSelectedBooking(null);
                  setRejectionReason('');
                }}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || rejecting}
              >
                {rejecting ? 'Rejet en cours...' : 'Rejeter la réservation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
