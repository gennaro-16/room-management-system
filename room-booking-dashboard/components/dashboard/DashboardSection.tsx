'use client';

import React from 'react';
import { StatsCards } from './StatsCards';
import { RoomStatusOverview } from './RoomStatusOverview';
import { TodaysBookings } from './TodaysBookings';
import { UserDashboard } from './UserDashboard';
import { useDashboardOverview, useRooms, useBookingsSummary } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardSection() {
  const { isAdmin } = useAuth();
  const { data: overview, loading: overviewLoading, error: overviewError, refetch: refetchOverview } = useDashboardOverview();
  const { data: rooms, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = useRooms();
  const { data: bookingsSummary, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useBookingsSummary();

  // Show user-friendly dashboard for regular users
  if (!isAdmin()) {
    return <UserDashboard />;
  }

  const statsData = overview ? {
    totalRooms: overview.totalRooms,
    totalBookings: overview.totalBookings,
    activeBookings: overview.activeBookings,
    availableRooms: overview.availableRooms,
    maintenanceRooms: overview.maintenanceRooms,
  } : undefined;

  const loading = overviewLoading || roomsLoading || bookingsLoading;
  const error = overviewError || roomsError || bookingsError;

  const handleRetry = () => {
    refetchOverview();
    refetchRooms();
    refetchBookings();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards 
        data={statsData}
        loading={overviewLoading}
        error={overviewError}
        onRetry={refetchOverview}
      />

      {/* Room Status Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RoomStatusOverview 
          rooms={rooms || []}
          loading={roomsLoading}
          error={roomsError}
          onRetry={refetchRooms}
        />

        <TodaysBookings 
          bookings={bookingsSummary?.todayBookings}
          loading={bookingsLoading}
          error={bookingsError}
          onRetry={refetchBookings}
        />
      </div>

    </div>
  );
}
