'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DepartmentsManagement from '@/components/admin/DepartmentsManagement';
import { useAuth } from '@/contexts/AuthContext';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  return (
    <ProtectedRoute>
      {canManage ? (
        <DepartmentsManagement />
      ) : (
        <div className="p-6 text-sm text-muted-foreground">You do not have permission to manage departments.</div>
      )}
    </ProtectedRoute>
  );
}


