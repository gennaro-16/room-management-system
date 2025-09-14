'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Search, Bell } from 'lucide-react';
import { UserProfile } from '@/components/auth/UserProfile';

const sidebarItems = [
  { label: 'Tableau de bord', id: 'dashboard' },
  { label: 'Salles', id: 'rooms' },
  { label: 'Réservations', id: 'bookings' },
  { label: 'Calendrier', id: 'calendar' },
  { label: 'Plan des salles', id: 'map' },
  { label: 'Rapports', id: 'reports' },
  { label: 'Paramètres', id: 'settings' },
];

interface HeaderProps {
  activeSection: string;
  onSidebarToggle: () => void;
}

export function Header({ activeSection, onSidebarToggle }: HeaderProps) {
  const currentSection = sidebarItems.find((item) => item.id === activeSection);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 header-albaraka">
      <Button 
        variant="ghost" 
        size="sm" 
        className="lg:hidden" 
        onClick={onSidebarToggle}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold capitalize text-balance">
            {currentSection?.label || 'Tableau de bord'}
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>•</span>
            <span>alBaraka Bank</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <UserProfile />
      </div>
    </header>
  );
}

{/*  <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={onNewBooking}>
          <Plus className="h-4 w-4 mr-2" />
        Login
        </Button>
      </div>*/}