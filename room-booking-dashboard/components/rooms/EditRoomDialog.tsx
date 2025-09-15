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
import { UpdateRoomDto, Room, Department, departmentsApi } from '@/lib/api';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

interface EditRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onSubmit: (id: number, data: UpdateRoomDto) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function EditRoomDialog({ open, onOpenChange, room, onSubmit, loading, error }: EditRoomDialogProps) {
  const [formData, setFormData] = useState<UpdateRoomDto>({
    name: '',
    capacity: 1,
    description: '',
    amenities: [],
    floor: 1,
    building: 'Main',
    departmentId: undefined,
    x: undefined,
    y: undefined,
    width: undefined,
    height: undefined,
    isUnderMaintenance: false,
    maintenanceNotes: '',
  });
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        capacity: room.capacity,
        description: room.description || '',
        amenities: room.amenities || [],
        floor: room.floor,
        building: room.building || 'Main',
        departmentId: room.departmentId || undefined,
        x: undefined,
        y: undefined,
        width: undefined,
        height: undefined,
        isUnderMaintenance: room.isUnderMaintenance,
        maintenanceNotes: room.maintenanceNotes || '',
      });
      setAmenitiesInput((room.amenities || []).join(', '));
    }
  }, [room]);

  useEffect(() => {
    departmentsApi.getPublic().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    
    if (!formData.departmentId) {
      return; // Don't submit if department is not selected
    }
    
    try {
      const payload: UpdateRoomDto = {
        ...formData,
        amenities: amenitiesInput
          ? amenitiesInput.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        departmentId: Number(formData.departmentId),
        building: 'Main', // Set default building value
        x: 100, // Set default coordinate values
        y: 200,
        width: 50,
        height: 30,
        isUnderMaintenance: room.isUnderMaintenance, // Keep existing maintenance status
        maintenanceNotes: room.maintenanceNotes || '', // Keep existing maintenance notes
      } as any;
      await onSubmit(room.id, payload);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleInputChange = (field: keyof UpdateRoomDto, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la salle</DialogTitle>
          <DialogDescription>Mettre à jour les informations de la salle</DialogDescription>
        </DialogHeader>
        
        {error && <ErrorAlert error={error} />}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Nom de la salle</Label>
            <Input
              id="room-name"
              placeholder="ex: Salle de conférence A"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacité</Label>
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
            <div className="space-y-2">
              <Label htmlFor="floor">Étage</Label>
              <Input
                id="floor"
                type="number"
                min="0"
                placeholder="1"
                value={formData.floor || 0}
                onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description de la salle et équipements"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amenities">Équipements (séparés par des virgules)</Label>
              <Input
                id="amenities"
                placeholder="projector, whiteboard, video-conference"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentId">Département *</Label>
            <Select value={formData.departmentId != null ? String(formData.departmentId) : ''} onValueChange={(v) => handleInputChange('departmentId', parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un département" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}{d.floor ? ` (Étage ${d.floor})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {loading ? <LoadingSpinner size="sm" /> : 'Mettre à jour la salle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
