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
import { CreateBookingDto, Room } from '@/lib/api';
import { useRooms } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

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
    purpose: '',
    startTime: '',
    endTime: '',
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomId || !selectedDate || !startTime || !endTime) {
      return;
    }

    try {
      const startDateTime = new Date(`${selectedDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${selectedDate}T${endTime}`).toISOString();

      await onSubmit({
        ...formData,
        startTime: startDateTime,
        endTime: endDateTime,
      });
      
      // Reset form
      setFormData({
        roomId: 0,
        purpose: '',
        startTime: '',
        endTime: '',
      });
      setStartTime('');
      setEndTime('');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleInputChange = (field: keyof CreateBookingDto, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const availableRooms = (rooms || []).filter(room => !room.isUnderMaintenance && room.isAvailable !== false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>Schedule a room reservation with date and time range</DialogDescription>
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
            <div className="space-y-2">
              <Label htmlFor="booking-room">Room</Label>
              <Select value={formData.roomId.toString()} onValueChange={(value) => handleInputChange('roomId', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.name} (Capacity: {room.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input 
                id="start-time" 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
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
            <Label htmlFor="booking-purpose">Meeting Purpose</Label>
            <Input 
              id="booking-purpose" 
              placeholder="e.g., Team Meeting, Client Presentation" 
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-description">Description (Optional)</Label>
            <Textarea 
              id="booking-description" 
              placeholder="Additional details about the meeting" 
              rows={3} 
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
