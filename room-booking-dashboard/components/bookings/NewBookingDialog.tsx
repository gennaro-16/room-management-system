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
import { CreateBookingDto, Room, BookingStatus } from '@/lib/api';
import { useRooms } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { emitBookingsChanged } from '@/lib/events';

interface NewBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBookingDto) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function NewBookingDialog({ open, onOpenChange, onSubmit, loading, error }: NewBookingDialogProps) {
  const { data: rooms } = useRooms();
  const [formData, setFormData] = useState<CreateBookingDto>({
    roomId: 0,
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
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [externalInput, setExternalInput] = useState('');
  const [internalInput, setInternalInput] = useState('');
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: { [key: string]: string } = {};

    // Basic validations
    if (!formData.roomId) {
      errors.roomId = 'Veuillez sélectionner une salle';
    }
    if (!selectedDate) {
      errors.selectedDate = 'Veuillez sélectionner une date';
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (selectedDate < todayStr) {
        errors.selectedDate = 'La date ne peut pas être dans le passé';
      }
    }
    if (!startTime) {
      errors.startTime = "L'heure de début est requise";
    }
    if (!endTime) {
      errors.endTime = "L'heure de fin est requise";
    }
    if (selectedDate && startTime && endTime) {
      const start = new Date(`${selectedDate}T${startTime}`);
      const end = new Date(`${selectedDate}T${endTime}`);
      if (end <= start) {
        errors.endTime = "L'heure de fin doit être après l'heure de début";
      }
    }
    if (!formData.title.trim()) {
      errors.title = 'Le titre est requis';
    }
    if (!formData.purpose.trim()) {
      errors.purpose = "L'objectif est requis";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const startDateTime = new Date(`${selectedDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${selectedDate}T${endTime}`).toISOString();

      await onSubmit({
        ...formData,
        internalAttendees: internalInput
          ? internalInput.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        externalAttendees: externalInput
          ? externalInput.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        requiredAmenities: amenitiesInput
          ? amenitiesInput.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        startTime: startDateTime,
        endTime: endDateTime,
      });
      
      // Notify listeners to refresh calendars/lists
      emitBookingsChanged();

      // Reset form
      setFormData({
        roomId: 0,
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
      });
      setStartTime('');
      setEndTime('');
      setExternalInput('');
      setInternalInput('');
      setAmenitiesInput('');
      setFormErrors({});
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleInputChange = (field: keyof CreateBookingDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const availableRooms = (rooms || []).filter(room => !room.isUnderMaintenance && room.isAvailable !== false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Créer une nouvelle réservation</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Planifiez une réservation de salle avec une plage de date et d'heure
          </DialogDescription>
        </DialogHeader>
        
        {error && <ErrorAlert error={error} compact={true} onDismiss={() => {}} />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Room Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Informations de base</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking-date" className="text-sm font-medium">Date de réservation</Label>
                <Input 
                  id="booking-date" 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="input-albaraka"
                  min={new Date().toISOString().split('T')[0]}
                />
                {formErrors.selectedDate && (
                  <p className="text-xs text-red-600">{formErrors.selectedDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-room" className="text-sm font-medium">Salle</Label>
                <Select value={formData.roomId.toString()} onValueChange={(value) => handleInputChange('roomId', parseInt(value))}>
                  <SelectTrigger className="input-albaraka">
                    <SelectValue placeholder="Sélectionner une salle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.name} (Capacité : {room.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.roomId && (
                  <p className="text-xs text-red-600">{formErrors.roomId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Horaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-sm font-medium">Heure de début</Label>
                <Input 
                  id="start-time" 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="input-albaraka"
                />
                {formErrors.startTime && (
                  <p className="text-xs text-red-600">{formErrors.startTime}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-sm font-medium">Heure de fin</Label>
                <Input 
                  id="end-time" 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="input-albaraka"
                />
                {formErrors.endTime && (
                  <p className="text-xs text-red-600">{formErrors.endTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Détails de la réunion</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Titre de la réunion</Label>
                <Input 
                  id="title" 
                  placeholder="Titre de la réunion" 
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  className="input-albaraka"
                />
                {formErrors.title && (
                  <p className="text-xs text-red-600">{formErrors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedAttendees" className="text-sm font-medium">Participants attendus</Label>
                <Input 
                  id="expectedAttendees" 
                  type="number"
                  min="1"
                  value={formData.expectedAttendees}
                  onChange={(e) => handleInputChange('expectedAttendees', parseInt(e.target.value) || 1)}
                  required
                  className="input-albaraka"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="booking-purpose" className="text-sm font-medium">Objectif de la réunion</Label>
              <Input 
                id="booking-purpose" 
                placeholder="Ex. : réunion d'équipe, présentation client" 
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                className="input-albaraka"
              />
              {formErrors.purpose && (
                <p className="text-xs text-red-600">{formErrors.purpose}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="agenda" className="text-sm font-medium">Agenda (optionnel)</Label>
              <Textarea 
                id="agenda" 
                placeholder="Détails supplémentaires (agenda)" 
                rows={3} 
                value={formData.agenda}
                onChange={(e) => handleInputChange('agenda', e.target.value)}
                className="input-albaraka"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Informations supplémentaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="internalAttendees" className="text-sm font-medium">Participants internes</Label>
                <Input 
                  id="internalAttendees"
                  placeholder="Nom1, Nom2"
                  value={internalInput}
                  onChange={(e) => setInternalInput(e.target.value)}
                  className="input-albaraka"
                />
                <p className="text-xs text-muted-foreground">Séparés par des virgules</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="externalAttendees" className="text-sm font-medium">Participants externes</Label>
                <Input 
                  id="externalAttendees"
                  placeholder="Nom1, Nom2"
                  value={externalInput}
                  onChange={(e) => setExternalInput(e.target.value)}
                  className="input-albaraka"
                />
                <p className="text-xs text-muted-foreground">Séparés par des virgules</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredAmenities" className="text-sm font-medium">Équipements requis</Label>
                <Input 
                  id="requiredAmenities"
                  placeholder="projecteur, tableau blanc"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="input-albaraka"
                />
                <p className="text-xs text-muted-foreground">Séparés par des virgules</p>
              </div>
            </div>
          </div>

          {/* Recurring Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Options de récurrence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isRecurring" className="text-sm font-medium">Récurrent</Label>
                <Select value={formData.isRecurring ? 'yes' : 'no'} onValueChange={(v) => handleInputChange('isRecurring', v === 'yes') }>
                  <SelectTrigger className="input-albaraka">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Non</SelectItem>
                    <SelectItem value="yes">Oui</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurrenceRule" className="text-sm font-medium">Règle RRULE</Label>
                  <Input 
                    id="recurrenceRule"
                    placeholder="RRULE:FREQ=WEEKLY;INTERVAL=1"
                    value={formData.recurrenceRule || ''}
                    onChange={(e) => handleInputChange('recurrenceRule', e.target.value)}
                    className="input-albaraka"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="px-6"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="btn-albaraka-primary px-6">
              {loading ? <LoadingSpinner size="sm" /> : 'Créer la réservation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
