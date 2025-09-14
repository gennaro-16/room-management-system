'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuth } from '@/contexts/AuthContext';

const sidebarItems = [
  { label: 'Dashboard', id: 'dashboard' },
  { label: 'Rooms', id: 'rooms' },
  { label: 'Bookings', id: 'bookings' },
  { label: 'Calendar', id: 'calendar' },
  { label: 'Room Map', id: 'map' },
  { label: 'Reports', id: 'reports' },
  { label: 'Settings', id: 'settings' },
];

interface HeaderProps {
  activeSection: string;
  onSidebarToggle: () => void;
  onNewBooking: () => void;
}

export function Header({ activeSection, onSidebarToggle, onNewBooking }: HeaderProps) {
  const currentSection = sidebarItems.find((item) => item.id === activeSection);
  const { isAdmin } = useAuth();

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
            {currentSection?.label || 'Dashboard'}
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
        {isAdmin() && (
          <Button size="sm" onClick={onNewBooking}>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        )}
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