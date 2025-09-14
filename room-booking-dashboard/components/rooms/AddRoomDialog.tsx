'use client';

import React, { useState } from 'react';
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
import { CreateRoomDto } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRoomDto) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function AddRoomDialog({ open, onOpenChange, onSubmit, loading, error }: AddRoomDialogProps) {
  const [formData, setFormData] = useState<CreateRoomDto>({
    name: '',
    capacity: 1,
    description: '',
    x: undefined,
    y: undefined,
    width: undefined,
    height: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        capacity: 1,
        description: '',
        x: undefined,
        y: undefined,
        width: undefined,
        height: undefined,
      });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleInputChange = (field: keyof CreateRoomDto, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>Create a new room in the system</DialogDescription>
        </DialogHeader>
        
        {error && <ErrorAlert error={error} />}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="e.g., Conference Room A"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="100"
                placeholder="12"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Room description and amenities"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="x-coord">X Coordinate</Label>
              <Input
                id="x-coord"
                type="number"
                placeholder="100"
                value={formData.x || ''}
                onChange={(e) => handleInputChange('x', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="y-coord">Y Coordinate</Label>
              <Input
                id="y-coord"
                type="number"
                placeholder="200"
                value={formData.y || ''}
                onChange={(e) => handleInputChange('y', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                placeholder="50"
                value={formData.width || ''}
                onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                placeholder="30"
                value={formData.height || ''}
                onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
              />
            </div>
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
              {loading ? <LoadingSpinner size="sm" /> : 'Create Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
