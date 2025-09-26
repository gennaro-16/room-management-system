'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/components/auth/UserProfile';
import { apiUtils } from '@/lib/api';

const sidebarItems = [
  { label: 'Tableau de bord', id: 'dashboard' },
  {label:"statistiques",id:"statistiques"},
  {label:"Visiteurs",id:"Visiteurs"},
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
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const currentSection = sidebarItems.find((item) => item.id === activeSection);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 header-albaraka">
      <Button 
        variant="ghost" 
        size="sm" 
        className="lg:hidden hover:bg-muted/50" 
        onClick={onSidebarToggle}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold capitalize text-foreground">
              {currentSection?.label || 'Tableau de bord'}
            </h2>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
              <span className="font-medium">alBaraka Bank</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-3 pr-2 border-r">
          <div
            role="button"
            className="rounded-full overflow-hidden cursor-pointer"
            onClick={() => router.push('/profile')}
          >
            <UserProfile />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
              </span>
              <Badge 
                variant="secondary" 
                className={`text-[10px] ${apiUtils.getRoleColor(user.role)}`}
              >
                {user.role.replace('_', ' ')}
              </Badge>
            </div>
            {user.department ? (
              <span className="text-xs text-muted-foreground">
                {typeof user.department === 'string' ? user.department : user.department?.name}
              </span>
            ) : null}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Se déconnecter
        </Button>
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