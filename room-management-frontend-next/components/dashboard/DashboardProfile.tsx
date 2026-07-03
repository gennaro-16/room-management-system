'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, Shield, Calendar, Building2 } from 'lucide-react';

export function DashboardProfile() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-green-50 text-green-800 border-green-200';
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-balance">Profile</h2>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="card-brand">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--brand-primary)]">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-[var(--brand-muted)]">
                Your account details and personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-[var(--brand-muted)]">Full Name</label>
                  <p className="text-lg font-semibold text-[var(--brand-primary)]">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.username
                    }
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[var(--brand-muted)]">Email Address</label>
                  <p className="text-lg text-[var(--brand-primary)]">{user.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[var(--brand-muted)]">Username</label>
                  <p className="text-lg text-[var(--brand-primary)]">{user.username}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[var(--brand-muted)]">Department</label>
                  <p className="text-lg text-[var(--brand-primary)]">
                    {(typeof user.department === 'string' ? user.department : user.department?.name) || 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[var(--brand-muted)]">Account Status</label>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={user.isActive ? "default" : "secondary"}
                      className={user.isActive ? "bg-green-50 text-green-800 border-green-200" : "bg-gray-50 text-gray-800 border-gray-200"}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[var(--brand-muted)]">Member Since</label>
                  <p className="text-lg text-[var(--brand-primary)]">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role & Permissions */}
        <div className="space-y-6">
          <Card className="card-brand">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--brand-primary)]">
                {getRoleIcon(user.role)}
                Role & Permissions
              </CardTitle>
              <CardDescription className="text-[var(--brand-muted)]">
                Your current role and system permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--brand-muted)]">Current Role</label>
                <div className="mt-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-sm ${getRoleColor(user.role)}`}
                  >
                    {user.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-[var(--brand-muted)]">Permissions</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-green-600" />
                    <span>View Rooms</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span>Create Bookings</span>
                  </div>
                  {user.role === 'ADMIN' ? (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span>Manage Rooms</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-blue-600" />
                        <span>Approve Bookings</span>
                      </div>
                    </>
                  ) : null}
                  {/* Super admin privileges removed in simplified roles */}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-brand">
            <CardHeader>
              <CardTitle className="text-[var(--brand-primary)]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
