'use client';

import React, { useEffect, useState } from 'react';
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
import { CreateRoomDto, departmentsApi, Department } from '@/lib/api';
import { Switch } from '@/components/ui/switch';
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
    departmentsApi.getPublic().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.departmentId) {
      return; // Don't submit if department is not selected
    }
    
    try {
      const payload: CreateRoomDto = {
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
        isUnderMaintenance: false, // Set default maintenance status
        maintenanceNotes: '', // Set default maintenance notes
      } as any;
      await onSubmit(payload);
      setFormData({
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
      setAmenitiesInput('');
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Ajouter une nouvelle salle</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Créer une nouvelle salle dans le système de gestion
          </DialogDescription>
        </DialogHeader>
        
        {error && <ErrorAlert error={error} />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Informations de base</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-name" className="text-sm font-medium">Nom de la salle</Label>
                <Input
                  id="room-name"
                  placeholder="ex: Salle de conférence A"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="input-albaraka"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-sm font-medium">Capacité</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="12"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                    required
                    className="input-albaraka"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor" className="text-sm font-medium">Étage</Label>
                  <Input
                    id="floor"
                    type="number"
                    min="0"
                    placeholder="1"
                    value={formData.floor}
                    onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || 0)}
                    required
                    className="input-albaraka"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description de la salle et équipements"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="input-albaraka"
                />
              </div>
            </div>
          </div>

          {/* Location and Department */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Localisation et département</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departmentId" className="text-sm font-medium">Département *</Label>
                <Select value={formData.departmentId != null ? String(formData.departmentId) : ''} onValueChange={(v) => handleInputChange('departmentId', parseInt(v))}>
                  <SelectTrigger className="input-albaraka">
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}{d.floor ? ` (Étage ${d.floor})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Équipements</h3>
            <div className="space-y-2">
              <Label htmlFor="amenities" className="text-sm font-medium">Équipements disponibles</Label>
              <Input
                id="amenities"
                placeholder="projector, whiteboard, video-conference"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                className="input-albaraka"
              />
              <p className="text-xs text-muted-foreground">Séparés par des virgules</p>
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
              {loading ? <LoadingSpinner size="sm" /> : 'Créer la salle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
