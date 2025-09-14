'use client';

import React, { useState } from 'react';
import { Sidebar } from './dashboard/Sidebar';
import { Header } from './dashboard/Header';
import { DashboardSection } from './dashboard/DashboardSection';
import { RoomsSection } from './rooms/RoomsSection';
import { BookingsSection } from './bookings/BookingsSection';
import { CalendarSection } from './calendar/CalendarSection';
import { RoomMapSection } from './dashboard/RoomMapSection';
import { BookingApprovals } from './admin/BookingApprovals';
import { UserManagement } from './admin/UserManagement';
import { DashboardProfile } from './dashboard/DashboardProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function MainDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const handleNewBooking = () => {
    // TODO: Implement new booking functionality
    console.log('New booking clicked');
  };

  const renderContent = () => {
    // Check user role and show appropriate content
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'rooms':
        return <RoomsSection />;
      case 'bookings':
        return <BookingsSection />;
      case 'calendar':
        return <CalendarSection />;
      case 'map':
        return <RoomMapSection />;
      case 'approvals':
        if (!isAdmin) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>You don't have permission to access this section</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Only administrators can access booking approvals.</p>
              </CardContent>
            </Card>
          );
        }
        return <BookingApprovals />;
      case 'users':
        if (!isSuperAdmin) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>You don't have permission to access this section</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Only super administrators can access user management.</p>
              </CardContent>
            </Card>
          );
        }
        return <UserManagement />;
      case 'reports':
        if (!isAdmin) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>You don't have permission to access this section</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Only administrators can access reports.</p>
              </CardContent>
            </Card>
          );
        }
        return (
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Analytics and reporting</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reports section coming soon...</p>
            </CardContent>
          </Card>
        );
      case 'profile':
        return <DashboardProfile />;
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>System configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings section coming soon...</p>
            </CardContent>
          </Card>
        );
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header
          activeSection={activeSection}
          onSidebarToggle={() => setSidebarOpen(true)}
          onNewBooking={handleNewBooking}
        />

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 space-y-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
