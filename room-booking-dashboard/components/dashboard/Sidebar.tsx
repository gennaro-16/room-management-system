'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Building2,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  Users,
  CheckCircle,
  X,
  UserCircle,
} from 'lucide-react';

const getSidebarItems = (isAdmin: boolean, isSuperAdmin: boolean) => [
  { icon: Home, label: 'Tableau de bord', id: 'dashboard' },
  { icon: Building2, label: 'Salles', id: 'rooms' },
  { icon: BookOpen, label: 'Réservations', id: 'bookings' },
  { icon: Calendar, label: 'Calendrier', id: 'calendar' },
  ...(isAdmin ? [
    { icon: CheckCircle, label: 'Approbations', id: 'approvals' },
    { icon: Building2, label: 'Départements', id: 'departments' },
  ] : []),
  ...(isSuperAdmin ? [
    { icon: Users, label: 'Gestion des utilisateurs', id: 'users' }
  ] : []),
  ...(isAdmin ? [
    { icon: BarChart3, label: 'Rapports', id: 'reports' },
  ] : []),
  { icon: UserCircle, label: 'Profil', id: 'profile' },
  { icon: Settings, label: 'Paramètres', id: 'settings' },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  sidebarOpen: boolean;
  onSidebarToggle: (open: boolean) => void;
}

export function Sidebar({ activeSection, onSectionChange, sidebarOpen, onSidebarToggle }: SidebarProps) {
  const { isAdmin, user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const sidebarItems = getSidebarItems(isAdmin(), isSuperAdmin);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => onSidebarToggle(false)} 
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 sidebar-albaraka",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3 sidebar-logo-container">
              <img 
                src="/baraka-logo-fr-1-133x62.png" 
                alt="alBaraka Bank" 
                className="h-8 w-auto"
              />
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-sidebar-foreground">AL BARAKA</h1>
                <p className="text-xs text-sidebar-foreground/70">RÉSERVATION DE SALLES</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden hover:bg-sidebar-accent/50" 
              onClick={() => onSidebarToggle(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12 text-sm font-medium transition-all duration-200",
                  activeSection === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm",
                )}
                onClick={() => {
                  onSectionChange(item.id);
                  onSidebarToggle(false);
                }}
              >
                <item.icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60 text-center">
              <p>Version 1.0.0</p>
              <p className="mt-1">© 2024 alBaraka Bank</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
