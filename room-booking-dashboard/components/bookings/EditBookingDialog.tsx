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
import { UpdateBookingDto, Booking, BookingStatus } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

interface EditBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onSubmit: (id: number, data: UpdateBookingDto) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function EditBookingDialog({ open, onOpenChange, booking, onSubmit, loading, error }: EditBookingDialogProps) {
  const [formData, setFormData] = useState<UpdateBookingDto>({
    purpose: '',
    startTime: '',
    endTime: '',
    status: 'PENDING',
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (booking) {
      const startDate = new Date(booking.startTime);
      const endDate = new Date(booking.endTime);
      
      setFormData({
        purpose: booking.purpose,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
      });
      
      setSelectedDate(startDate.toISOString().split('T')[0]);
      setStartTime(startDate.toTimeString().slice(0, 5));
      setEndTime(endDate.toTimeString().slice(0, 5));
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    
    try {
      const startDateTime = new Date(`${selectedDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${selectedDate}T${endTime}`).toISOString();

      await onSubmit(booking.id, {
        ...formData,
        startTime: startDateTime,
        endTime: endDateTime,
      });
      
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleInputChange = (field: keyof UpdateBookingDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!booking) return null;

  return (
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
            <div className="space-y-2">
              <Label htmlFor="booking-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: BookingStatus) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
              {loading ? <LoadingSpinner size="sm" /> : 'Update Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
