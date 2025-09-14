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
          <CardTitle>Room Status Overview</CardTitle>
          <CardDescription>Current status of all rooms</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Loading rooms..." />
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
          <CardTitle>Room Status Overview</CardTitle>
          <CardDescription>Current status of all rooms</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No rooms found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Status Overview</CardTitle>
        <CardDescription>Current status of all rooms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <div className="font-medium">{room.name}</div>
              <div className="text-sm text-muted-foreground">
                Capacity: {room.capacity}
              </div>
              {room.description && (
                <div className="text-sm text-muted-foreground">{room.description}</div>
              )}
              {room.bookings && room.bookings.length > 0 && (
                <div className="text-sm text-primary">
                  Current: {room.bookings[0].purpose || 'Meeting'}
                </div>
              )}
            </div>
            <Badge className={
              room.isUnderMaintenance ? 'bg-amber-50 text-amber-800 border-amber-200' :
              room.isAvailable === false ? 'bg-red-50 text-red-800 border-red-200' :
              'bg-green-50 text-green-800 border-green-200'
            }>
              {room.isUnderMaintenance ? 'MAINTENANCE' : room.isAvailable === false ? 'BUSY' : 'FREE'}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
