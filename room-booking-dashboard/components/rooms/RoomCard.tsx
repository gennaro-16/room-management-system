'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, UserCheck, Clock, Wrench, Edit, BookOpen, Trash2, Building2, Layers } from 'lucide-react';
import { Room, apiUtils } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onBook: (room: Room) => void;
  onDelete: (roomId: number) => void;
  onToggleMaintenance?: (roomId: number) => void;
  isMaintenanceLoading?: boolean;
}

export function RoomCard({ room, onEdit, onBook, onDelete, onToggleMaintenance, isMaintenanceLoading }: RoomCardProps) {
  const { isAdmin } = useAuth();
  const currentBooking = room.bookings?.find(booking => 
    apiUtils.isBookingActive(booking.startTime, booking.endTime)
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{room.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCheck className="h-3 w-3" />
              {room.capacity} people
            </div>
            {room.description && (
              <div className="text-sm text-muted-foreground">{room.description}</div>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{room.building || 'Main'}</span>
              <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3" />Etage {room.floor}</span>
              {room.department && (
                <Badge variant="outline" className="text-[10px]">
                  {typeof room.department === 'string' ? room.department : (room.department as any)?.name}
                </Badge>
              )}
            </div>
          </div>
          <Badge className={
            room.isUnderMaintenance ? 'bg-amber-50 text-amber-800 border-amber-200' :
            room.isAvailable === false ? 'bg-red-50 text-red-800 border-red-200' :
            'bg-green-50 text-green-800 border-green-200'
          }>
            {room.isUnderMaintenance ? 'MAINTENANCE' : room.isAvailable === false ? 'OCCUPÉ' : 'LIBRE'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentBooking && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3 text-primary" />
              <span className="font-medium">Actuel : {currentBooking.purpose || 'Réunion'}</span>
            </div>
          </div>
        )}

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">ÉQUIPEMENTS</Label>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((a, idx) => (
                <Badge key={idx} variant="secondary" className="text-[10px]">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quick Status Actions */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">ACTIONS RAPIDES</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={room.isUnderMaintenance ? "destructive" : "outline"}
              size="sm"
              onClick={() => onToggleMaintenance?.(room.id)}
              disabled={isMaintenanceLoading}
              className="text-xs"
            >
              <Wrench className="h-3 w-3 mr-1" />
              {room.isUnderMaintenance ? "En maintenance" : "Mettre en maintenance"}
            </Button>
            {room.isUnderMaintenance && room.maintenanceNotes && (
              <div className="text-xs text-muted-foreground">
                {room.maintenanceNotes}
              </div>
            )}
          </div>
        </div>

        {/* Room Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {isAdmin() && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-transparent"
              onClick={() => onEdit(room)}
            >
              <Edit className="h-3 w-3 mr-1" />
Modifier
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-transparent"
            onClick={() => onBook(room)}
          >
            <BookOpen className="h-3 w-3 mr-1" />
Réserver
          </Button>
          {isAdmin() && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive bg-transparent"
              onClick={() => onDelete(room.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
