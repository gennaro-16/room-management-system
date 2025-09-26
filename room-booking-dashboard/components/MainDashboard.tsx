'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from './dashboard/Sidebar';
import { Header } from './dashboard/Header';
import { DashboardSection } from './dashboard/DashboardSection';
import { RoomsSection } from './rooms/RoomsSection';
import { BookingsSection } from './bookings/BookingsSection';
import BookingGrid from '@/app/bookings/bookings-grid';
import { CalendarSection } from './calendar/CalendarSection';
import { UserManagement } from './admin/UserManagement';
import { DashboardProfile } from './dashboard/DashboardProfile';
import DepartmentsManagement from './admin/DepartmentsManagement';
import { ConflictsSection } from './conflicts/ConflictsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import DocumentationPage from '@/app/documentation/page';

import VisitorsPage from './visitors/visitors';
import StatisticsPage from './visitors/statistics';
export function MainDashboard() {
  const [activeSection, setActiveSection] = useState('rooms');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();


  const renderContent = () => {
    // Check user role and show appropriate content
    const isAdmin = user?.role === 'ADMIN';

    switch (activeSection) {
      case 'dashboard':
        if (!isAdmin) {
          return <CalendarSection />;
        }
        return <DashboardSection />;
      case 'Visiteurs':
        return <VisitorsPage />; 
      case 'statistiques':
        return <StatisticsPage/>  
      case 'rooms':
        return <RoomsSection />;
      case 'bookings':
        return <BookingsSection onOpenFull={() => setActiveSection('bookings-full')} />;
      case 'calendar':
        return <CalendarSection />;
      case 'bookings-full':
        return <BookingGrid />;
      case 'conflicts':
        if (!isAdmin) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Accès refusé</CardTitle>
                <CardDescription>Vous n'avez pas la permission d'accéder à cette section</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Seuls les administrateurs peuvent accéder à la gestion des conflits.</p>
              </CardContent>
            </Card>
          );
        }
        return <ConflictsSection />;
      case 'users':
        if (!isAdmin) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Accès refusé</CardTitle>
                <CardDescription>Vous n'avez pas la permission d'accéder à cette section</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Seuls les administrateurs peuvent accéder à la gestion des utilisateurs.</p>
              </CardContent>
            </Card>
          );
        }
        return <UserManagement />;
      case 'departments':
        if (!isAdmin) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Accès refusé</CardTitle>
                <CardDescription>Vous n'avez pas la permission d'accéder à cette section</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Seuls les administrateurs peuvent gérer les départements.</p>
              </CardContent>
            </Card>
          );
        }
        return <DepartmentsManagement />;
      case 'reports':
        if (!isAdmin) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Accès refusé</CardTitle>
                <CardDescription>Vous n'avez pas la permission d'accéder à cette section</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Seuls les administrateurs peuvent accéder aux rapports.</p>
              </CardContent>
            </Card>
          );
        }
        return (
          <Card>
            <CardHeader>
              <CardTitle>Rapports</CardTitle>
              <CardDescription>Analyses et rapports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Section des rapports à venir...</p>
            </CardContent>
          </Card>
        );
      case 'profile':
        return <DashboardProfile />;
      case 'documentation':
        return <DocumentationPage />;
      case 'settings':
        return (
          <Card>
            <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>Configuration système</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Section des paramètres à venir...</p>
            </CardContent>
          </Card>
        );
      default:
        return isAdmin ? <DashboardSection /> : <CalendarSection />;
    }
  };

  // Choose default landing section based on role
  useEffect(() => {
    if (!user?.role) return;
    const isAdmin = user.role === 'ADMIN';
    if (isAdmin) setActiveSection('dashboard');
    else setActiveSection('calendar');
  }, [user?.role]);

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
        />

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 space-y-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
