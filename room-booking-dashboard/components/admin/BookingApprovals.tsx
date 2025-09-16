'use client';

import { useState } from 'react';
import { usePendingBookings, useApproveBooking, useRejectBooking } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, User, Calendar, MapPin, Users, Building2, Layers, Phone, Mail, FileText, Wifi, Coffee, Monitor, Presentation, Video, Settings, Wrench, AlertTriangle, Repeat, UserCheck, ExternalLink, Calendar as CalendarIcon, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import { apiUtils } from '@/lib/api';

export function BookingApprovals() {
  const { data: pendingBookings, loading, error, refetch } = usePendingBookings();
  const { approveBooking, loading: approving } = useApproveBooking();
  const { rejectBooking, loading: rejecting } = useRejectBooking();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedBookings, setExpandedBookings] = useState<Set<number>>(new Set());

  const handleApprove = async (bookingId: number) => {
    try {
      await approveBooking(bookingId);
      refetch();
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) return;
    
    try {
      await rejectBooking(selectedBooking.id, rejectionReason);
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
          {pendingBookings.map((booking) => {
            const isExpanded = expandedBookings.has(booking.id);
            
            return (
              <Card key={booking.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Main Booking Info - Always Visible */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-lg">{booking.room?.name}</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {booking.room?.capacity} seats
                          </Badge>
                        </div>
                        
                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {booking.organizer?.firstName && booking.organizer?.lastName
                                ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                                : booking.organizer?.username
                              }
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(booking.startTime).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(booking.startTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(booking.endTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.expectedAttendees} people</span>
                          </div>
                        </div>

                        {booking.purpose && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Purpose:</strong> {booking.purpose}
                          </p>
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

                        {/* Booking Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Column - Booking Info */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {new Date(booking.startTime).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(booking.startTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })} - {new Date(booking.endTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>
                            </div>

                            {booking.title && (
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="font-medium text-sm">Titre de la réunion</div>
                                  <div className="text-sm text-muted-foreground">{booking.title}</div>
                                </div>
                              </div>
                            )}

                            {booking.agenda && (
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="font-medium text-sm">Ordre du jour</div>
                                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{booking.agenda}</div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">Durée</div>
                                <div className="text-sm text-muted-foreground">
                                  {(() => {
                                    const start = new Date(booking.startTime);
                                    const end = new Date(booking.endTime);
                                    const durationMs = end.getTime() - start.getTime();
                                    const hours = Math.floor(durationMs / (1000 * 60 * 60));
                                    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                                    return `${hours}h ${minutes}min`;
                                  })()}
                                </div>
                              </div>
                            </div>

                            {booking.isRecurring && (
                              <div className="flex items-center gap-2">
                                <Repeat className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium text-sm">Récurrence</div>
                                  <div className="text-sm text-muted-foreground">
                                    {booking.recurrenceRule ? (
                                      <Badge variant="outline" className="text-xs">
                                        {booking.recurrenceRule.includes('WEEKLY') ? 'Hebdomadaire' : 
                                         booking.recurrenceRule.includes('DAILY') ? 'Quotidienne' :
                                         booking.recurrenceRule.includes('MONTHLY') ? 'Mensuelle' : 'Personnalisée'}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs">Récurrente</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column - Attendees & Organizer */}
                          <div className="space-y-3">
                            {/* Organizer Info */}
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-sm">Organisateur</div>
                                <div className="text-sm">
                                  {booking.organizer?.firstName && booking.organizer?.lastName
                                    ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                                    : booking.organizer?.username
                                  }
                                  {booking.organizer?.title && (
                                    <div className="text-xs text-muted-foreground">{booking.organizer.title}</div>
                                  )}
                                </div>
                                {booking.organizer?.department && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {typeof booking.organizer.department === 'string' 
                                      ? booking.organizer.department 
                                      : booking.organizer.department?.name}
                                  </Badge>
                                )}
                                {booking.organizer?.email && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Mail className="h-3 w-3" />
                                    {booking.organizer.email}
                                  </div>
                                )}
                                {booking.organizer?.phone && (
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
                                <div className="font-medium text-sm">Participants attendus</div>
                                <div className="text-sm text-muted-foreground">
                                  {booking.expectedAttendees} personnes
                                </div>
                                {booking.internalAttendees && booking.internalAttendees.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {booking.internalAttendees.length} participants internes
                                  </div>
                                )}
                                {booking.externalAttendees && booking.externalAttendees.length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    {booking.externalAttendees.length} participants externes
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Room Amenities */}
                        {booking.room?.amenities && booking.room.amenities.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-medium text-sm">Équipements de la salle</div>
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
                              Équipements et outils requis
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
