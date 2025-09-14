'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { DashboardBookingItem, apiUtils } from '@/lib/api';

interface TodaysBookingsProps {
  bookings?: DashboardBookingItem[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function TodaysBookings({ bookings, loading, error, onRetry }: TodaysBookingsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Réservations d'aujourd'hui</CardTitle>
          <CardDescription>Réservations actives et à venir</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Chargement des réservations..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorAlert error={error} onRetry={onRetry} />;
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Réservations d'aujourd'hui</CardTitle>
          <CardDescription>Réservations actives et à venir</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucune réservation pour aujourd'hui</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Bookings</CardTitle>
        <CardDescription>Active and upcoming reservations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <div className="font-medium">{booking.room || 'Salle inconnue'}</div>
              <div className="text-sm text-muted-foreground">
                {booking.user || 'Utilisateur inconnu'}
              </div>
              <div className="text-sm text-primary">{booking.purpose || 'Réunion'}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {apiUtils.formatTimeForDisplay(booking.startTime)} - {apiUtils.formatTimeForDisplay(booking.endTime)}
              </div>
              <Badge variant="outline" className="text-xs">
                {booking.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
