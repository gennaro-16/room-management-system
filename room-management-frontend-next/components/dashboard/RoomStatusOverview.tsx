'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Room, apiUtils } from '@/lib/api';

interface RoomStatusOverviewProps {
  rooms?: Room[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function RoomStatusOverview({ rooms, loading, error, onRetry }: RoomStatusOverviewProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aperçu du statut des salles</CardTitle>
          <CardDescription>Statut actuel de toutes les salles</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Chargement des salles..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorAlert error={error} onRetry={onRetry} />;
  }

  if (!rooms || rooms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aperçu du statut des salles</CardTitle>
          <CardDescription>Statut actuel de toutes les salles</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucune salle trouvée</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-brand">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Aperçu du statut des salles</CardTitle>
        <CardDescription className="text-sm">Statut actuel de toutes les salles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <div className="font-semibold text-base">{room.name}</div>
                <div className="text-sm text-muted-foreground">
                  Capacité : {room.capacity} personnes
                </div>
              </div>
              {room.description && (
                <div className="text-sm text-muted-foreground line-clamp-1">{room.description}</div>
              )}
              {room.bookings && room.bookings.length > 0 && (
                <div className="text-sm text-primary font-medium">
                  Actuel : {room.bookings[0].purpose || 'Réunion'}
                </div>
              )}
            </div>
            <Badge variant="outline" className={
              room.status === 'MAINTENANCE' || room.isUnderMaintenance ? 'status-maintenance' :
              room.status === 'BUSY' || (room.isAvailable === false && !room.isUnderMaintenance) ? 'status-busy' :
              'status-free'
            }>
              {room.status === 'MAINTENANCE' || room.isUnderMaintenance ? 'MAINTENANCE' : 
               room.status === 'BUSY' || (room.isAvailable === false && !room.isUnderMaintenance) ? 'OCCUPÉ' : 
               'LIBRE'}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
