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
    <Card className="card-brand">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Réservations d'aujourd'hui</CardTitle>
        <CardDescription className="text-sm">Réservations actives et à venir</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <div className="font-semibold text-base">{booking.room || 'Salle inconnue'}</div>
                <div className="text-sm text-muted-foreground">
                  {booking.user || 'Utilisateur inconnu'}
                </div>
              </div>
              <div className="text-sm text-primary font-medium">{booking.purpose || 'Réunion'}</div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-sm font-semibold text-foreground">
                {apiUtils.formatTimeForDisplay(booking.startTime)} - {apiUtils.formatTimeForDisplay(booking.endTime)}
              </div>
              <Badge className={
                booking.status === 'APPROVED' ? 'status-approved' :
                booking.status === 'PENDING' ? 'status-pending' :
                booking.status === 'REJECTED' ? 'status-rejected' :
                'status-cancelled'
              }>
                {booking.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
