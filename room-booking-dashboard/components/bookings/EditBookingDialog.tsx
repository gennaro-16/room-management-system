'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpdateBookingDto, Booking, BookingStatus, User, roomsApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useUsers, useRooms } from '@/hooks/useApi';
import { emitBookingsChanged } from '@/lib/events';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EditBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onSubmit: (id: number, data: UpdateBookingDto) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function EditBookingDialog({ open, onOpenChange, booking, onSubmit, loading, error }: EditBookingDialogProps) {
  const { hasRole } = useAuth();
  const { data: users } = useUsers();
  const { data: rooms } = useRooms();
  
  const [formData, setFormData] = useState<UpdateBookingDto>({
    title: '',
    purpose: '',
    agenda: '',
    startTime: '',
    endTime: '',
    expectedAttendees: 1,
    internalAttendees: [],
    externalAttendees: [],
    requiredAmenities: [],
    isRecurring: false,
    recurrenceRule: '',
    status: 'PENDING',
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [externalInput, setExternalInput] = useState('');
  const [internalInput, setInternalInput] = useState('');
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [confirmCapacityOpen, setConfirmCapacityOpen] = useState(false);
  const [suggestedRooms, setSuggestedRooms] = useState<any[]>([]);
  // No longer using IDs for internal attendees; handled as names (string[])

  const isAdminRole = hasRole(['ADMIN']);

  useEffect(() => {
    if (booking) {
      const startDate = new Date(booking.startTime);
      const endDate = new Date(booking.endTime);
      
      setFormData({
        title: booking.title || '',
        purpose: booking.purpose,
        agenda: booking.agenda || '',
        startTime: booking.startTime,
        endTime: booking.endTime,
        expectedAttendees: booking.expectedAttendees,
        internalAttendees: (booking.internalAttendees as any) as string[] || [],
        externalAttendees: booking.externalAttendees || [],
        requiredAmenities: booking.requiredAmenities || [],
        isRecurring: booking.isRecurring || false,
        recurrenceRule: booking.recurrenceRule || '',
        status: booking.status,
      });
      
      setSelectedDate(startDate.toISOString().split('T')[0]);
      setStartTime(startDate.toTimeString().slice(0, 5));
      setEndTime(endDate.toTimeString().slice(0, 5));
      setSelectedRoomId(booking.roomId);
      setExternalInput(booking.externalAttendees?.join(', ') || '');
      setInternalInput((booking.internalAttendees as any as string[] | undefined)?.join(', ') || '');
      setAmenitiesInput(booking.requiredAmenities?.join(', ') || '');
    }
  }, [booking]);

  const performSubmit = async () => {
    if (!booking) return;
    try {
      const startDateTime = new Date(`${selectedDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${selectedDate}T${endTime}`).toISOString();
      const roomId = selectedRoomId ?? booking.roomId;

      // Check room availability before updating booking
      try {
        const availability = await roomsApi.getAvailability(roomId, startDateTime, endDateTime);
        if (!availability.isAvailable) {
          setFormErrors({
            roomId: `Cette salle est déjà réservée à cette heure. ${availability.reason}`
          });
          return;
        }
      } catch (error) {
        console.error('Error checking room availability:', error);
        setFormErrors({
          roomId: 'Erreur lors de la vérification de la disponibilité de la salle'
        });
        return;
      }

      await onSubmit(booking.id, {
        ...formData,
        roomId: selectedRoomId ?? booking.roomId,
        startTime: startDateTime,
        endTime: endDateTime,
        externalAttendees: externalInput
          ? externalInput.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        requiredAmenities: amenitiesInput
          ? amenitiesInput.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        internalAttendees: internalInput
          ? internalInput.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      });
      
      // Notify listeners and close
      emitBookingsChanged();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setFormErrors({});

    // Capacity underutilization check
    const room = (rooms || []).find(r => r.id === (selectedRoomId ?? booking.roomId));
    if (room && (formData.expectedAttendees || 0) > 0) {
      const ratio = (formData.expectedAttendees || 0) / room.capacity;
      if (ratio < 0.5) {
        const suggestions = (rooms || [])
          .filter(r => r.status === 'FREE')
          .filter(r => r.capacity >= (formData.expectedAttendees || 0))
          .filter(r => r.capacity <= Math.max((formData.expectedAttendees || 0) + 5, Math.ceil((formData.expectedAttendees || 0) * 1.5)))
          .sort((a, b) => a.capacity - b.capacity)
          .slice(0, 5);
        setSuggestedRooms(suggestions);
        setConfirmCapacityOpen(true);
        return;
      }
    }

    await performSubmit();
  };

  const handleInputChange = (field: keyof UpdateBookingDto, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Legacy handler no longer used with string-based internal attendees.
  // Kept as a no-op to avoid reference errors if invoked from older props.
  const handleInternalAttendeeChange = (_userId: number, _checked: boolean) => {
    // no-op
  };

  if (!booking) return null;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>Update booking information</DialogDescription>
        </DialogHeader>
        
        {error && <ErrorAlert error={error} />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking-date">Date</Label>
              <Input 
                id="booking-date" 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
            {isAdminRole && (
              <div className="space-y-2">
                <Label htmlFor="booking-status">Statut</Label>
                <Select value={formData.status} onValueChange={(value: BookingStatus) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">Approuvée</SelectItem>
                    <SelectItem value="COMPLETED">Terminée</SelectItem>
                    <SelectItem value="CANCELLED">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking-room">Salle</Label>
              <Select value={(selectedRoomId ?? booking?.roomId ?? 0).toString()} onValueChange={(v) => setSelectedRoomId(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une salle" />
                </SelectTrigger>
                <SelectContent>
                  {(rooms || []).filter(r => !r.isUnderMaintenance).map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>{r.name} (Capacité: {r.capacity})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.roomId && (
                <p className="text-sm text-destructive">{formErrors.roomId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la réunion</Label>
              <Input 
                id="title" 
                placeholder="Titre de la réunion"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedAttendees">Participants attendus</Label>
              <Input 
                id="expectedAttendees" 
                type="number" 
                min="1"
                value={formData.expectedAttendees || 1}
                onChange={(e) => handleInputChange('expectedAttendees', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Heure de début</Label>
              <Input 
                id="start-time" 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">Heure de fin</Label>
              <Input 
                id="end-time" 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>


          <div className="space-y-2">
            <Label htmlFor="booking-purpose">Objectif de la réunion</Label>
            <Input 
              id="booking-purpose" 
              placeholder="Ex. : réunion d'équipe, présentation client" 
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-description">Description (optionnel)</Label>
            <Textarea 
              id="booking-description" 
              placeholder="Détails supplémentaires (agenda)" 
              rows={3} 
              value={formData.agenda || ''}
              onChange={(e) => handleInputChange('agenda', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="internalAttendees">Participants internes</Label>
              <Input 
                id="internalAttendees"
                placeholder="Nom1, Nom2"
                value={internalInput}
                onChange={(e) => setInternalInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Séparés par des virgules</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="externalAttendees">Participants externes</Label>
              <Input 
                id="externalAttendees"
                placeholder="Nom1, Nom2"
                value={externalInput}
                onChange={(e) => setExternalInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Séparés par des virgules</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredAmenities">Équipements requis</Label>
            <Input 
              id="requiredAmenities"
              placeholder="projecteur, tableau blanc"
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Séparés par des virgules</p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Mettre à jour la réservation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Capacity fit confirmation */}
    <AlertDialog open={confirmCapacityOpen} onOpenChange={setConfirmCapacityOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Capacité de la salle trop élevée</AlertDialogTitle>
          <AlertDialogDescription>
            Le nombre de participants est bien inférieur à la capacité de la salle choisie. Voulez-vous continuer ou choisir une salle plus adaptée ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        {suggestedRooms.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Salles suggérées (capacité plus proche) :</div>
            <div className="flex flex-wrap gap-2">
              {suggestedRooms.map((room) => (
                <Button
                  key={room.id}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedRoomId(room.id);
                  }}
                >
                  {room.name} — {room.capacity}
                </Button>
              ))}
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Choisir une autre salle</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              setConfirmCapacityOpen(false);
              await performSubmit();
            }}
          >
            Continuer quand même
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
