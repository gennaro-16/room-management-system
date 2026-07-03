'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, BookOpen, Settings, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

interface StatsCardsProps {
  data?: {
    totalRooms: number;
    totalBookings: number;
    activeBookings: number;
    availableRooms: number;
    maintenanceRooms: number;
  };
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function StatsCards({ data, loading, error, onRetry }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="card-brand">
            <CardContent className="p-6">
              <LoadingSpinner size="sm" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorAlert error={error} onRetry={onRetry} />;
  }

  if (!data) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="card-brand group hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Total des salles</CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground mb-1">{data.totalRooms}</div>
          <p className="text-sm text-muted-foreground">Sur tous les étages</p>
        </CardContent>
      </Card>

      <Card className="card-brand group hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Disponibles maintenant</CardTitle>
          <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 mb-1">{data.availableRooms}</div>
          <p className="text-sm text-muted-foreground">Prêtes à réserver</p>
        </CardContent>
      </Card>

      <Card className="card-brand group hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Réservations actives</CardTitle>
          <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
            <BookOpen className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600 mb-1">{data.activeBookings}</div>
          <p className="text-sm text-muted-foreground">Actuellement en cours d'utilisation</p>
        </CardContent>
      </Card>

      <Card className="card-brand group hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Maintenance</CardTitle>
          <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
            <Settings className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600 mb-1">{data.maintenanceRooms}</div>
          <p className="text-sm text-muted-foreground">En maintenance</p>
        </CardContent>
      </Card>
    </div>
  );
}
