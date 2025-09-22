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
    <Card className="card-albaraka group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg font-semibold text-foreground">{room.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCheck className="h-4 w-4" />
              <span>{room.capacity} personnes</span>
            </div>
            {room.description && (
              <div className="text-sm text-muted-foreground line-clamp-2">{room.description}</div>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Étage {room.floor}
              </span>
              {room.department && (
                <Badge variant="outline" className="text-xs badge-albaraka">
                  {typeof room.department === 'string' ? room.department : (room.department as any)?.name}
                </Badge>
              )}
            </div>
          </div>
          <Badge className={
            room.isUnderMaintenance ? 'status-maintenance' :
            room.isAvailable === false ? 'status-busy' :
            'status-free'
          }>
            {room.isUnderMaintenance ? 'MAINTENANCE' : room.isAvailable === false ? 'OCCUPÉ' : 'LIBRE'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentBooking && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Actuel : {currentBooking.purpose || 'Réunion'}</span>
            </div>
          </div>
        )}

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Équipements</Label>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((a, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs badge-albaraka">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quick Status Actions */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions rapides</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={room.isUnderMaintenance ? "destructive" : "outline"}
              size="sm"
              onClick={() => onToggleMaintenance?.(room.id)}
              disabled={isMaintenanceLoading}
              className="text-xs h-8"
            >
              <Wrench className="h-3 w-3 mr-2" />
              {room.isUnderMaintenance ? "En maintenance" : "Mettre en maintenance"}
            </Button>
            {room.isUnderMaintenance && room.maintenanceNotes && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                {room.maintenanceNotes}
              </div>
            )}
          </div>
        </div>

        {/* Room Actions */}
        <div className="flex gap-2 pt-3 border-t border-border">
          {isAdmin() && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8 text-xs"
              onClick={() => onEdit(room)}
            >
              <Edit className="h-3 w-3 mr-2" />
              Modifier
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={() => onBook(room)}
          >
            <BookOpen className="h-3 w-3 mr-2" />
            Réserver
          </Button>
          {isAdmin() && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
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
