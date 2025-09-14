'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, Shield, UserCircle } from 'lucide-react';
import { apiUtils } from '@/lib/api';

export function UserProfile() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (user.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Shield className="h-4 w-4" />;
      case 'ADMIN':
        return <Settings className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.username
              }
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {getRoleIcon(user.role)}
              <Badge 
                variant="secondary" 
                className={`text-xs ${apiUtils.getRoleColor(user.role || 'USER')}`}
              >
                {(user.role || 'USER').replace('_', ' ')}
              </Badge>
            </div>
            {user.department && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.department}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserProfileCard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card className="card-albaraka">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[var(--albaraka-primary)]">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription className="text-[var(--albaraka-muted)]">
          Your account details and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {user.firstName && user.lastName 
                ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                : user.username ? user.username[0].toUpperCase() : 'U'
              }
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.username
              }
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={apiUtils.getRoleColor(user.role || 'USER')}
              >
                {(user.role || 'USER').replace('_', ' ')}
              </Badge>
              {user.department && (
                <Badge variant="outline">{user.department}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Username</p>
            <p className="text-muted-foreground">{user.username}</p>
          </div>
          <div>
            <p className="font-medium">Member Since</p>
            <p className="text-muted-foreground">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
