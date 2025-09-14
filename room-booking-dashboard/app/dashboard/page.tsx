'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainDashboard } from '@/components/MainDashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <MainDashboard />
    </ProtectedRoute>
  );
}
