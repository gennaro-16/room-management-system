'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, type User as ApiUser } from '@/lib/api';
import { UserProfileCard } from '@/components/auth/UserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, Shield, Calendar, Building2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const [freshUser, setFreshUser] = useState<ApiUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch a fresh profile to ensure department, status, and dates are current
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authApi.getProfile();
        setFreshUser(profile);
      } catch (_) {
        // ignore; fallback to context user
      }
    };
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading profile..." />
      </div>
    );
  }

  const displayUser = freshUser || user;

  if (!displayUser) {
    return null;
  }

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Shield className="h-5 w-5" />;
      case 'ADMIN':
        return <User className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'ADMIN':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-green-50 text-green-800 border-green-200';
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--albaraka-accent)] to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--albaraka-primary)]">Profil</h1>
              <p className="text-[var(--albaraka-muted)] mt-2">Gérez votre compte et vos préférences</p>
            </div>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="btn-albaraka-secondary"
            >
Retour au tableau de bord
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="card-albaraka">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--albaraka-primary)]">
                  <User className="h-5 w-5" />
Informations personnelles
                </CardTitle>
                <CardDescription className="text-[var(--albaraka-muted)]">
Vos détails de compte et informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-[var(--albaraka-muted)]">Nom complet</label>
                    <p className="text-lg font-semibold text-[var(--albaraka-primary)]">
                      {displayUser.firstName && displayUser.lastName 
                        ? `${displayUser.firstName} ${displayUser.lastName}`
                        : displayUser.username
                      }
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[var(--albaraka-muted)]">Adresse e-mail</label>
                    <p className="text-lg text-[var(--albaraka-primary)]">{displayUser.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[var(--albaraka-muted)]">Nom d'utilisateur</label>
                    <p className="text-lg text-[var(--albaraka-primary)]">{displayUser.username}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[var(--albaraka-muted)]">Département</label>
                    <p className="text-lg text-[var(--albaraka-primary)]">
                      {(typeof (displayUser as any).department === 'object' ? (displayUser as any).department?.name : (displayUser as any).department) || 'Non spécifié'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[var(--albaraka-muted)]">Statut du compte</label>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={displayUser.isActive ? "default" : "secondary"}
                        className={displayUser.isActive ? "bg-green-50 text-green-800 border-green-200" : "bg-gray-50 text-gray-800 border-gray-200"}
                      >
                        {displayUser.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[var(--albaraka-muted)]">Membre depuis</label>
                    <p className="text-lg text-[var(--albaraka-primary)]">
                      {displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role & Permissions */}
          <div className="space-y-6">
            <Card className="card-albaraka">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--albaraka-primary)]">
                  {getRoleIcon(displayUser.role)}
Rôle et permissions
                </CardTitle>
                <CardDescription className="text-[var(--albaraka-muted)]">
Votre rôle actuel et permissions système
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--albaraka-muted)]">Rôle actuel</label>
                  <div className="mt-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-sm ${getRoleColor(displayUser.role)}`}
                    >
                      {(displayUser.role || 'USER').replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-[var(--albaraka-muted)]">Permissions</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-green-600" />
                      <span>Voir les salles</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span>Créer des réservations</span>
                    </div>
                    {displayUser.role === 'ADMIN' || displayUser.role === 'SUPER_ADMIN' ? (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span>Gérer les salles</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-blue-600" />
                          <span>Approuver les réservations</span>
                        </div>
                      </>
                    ) : null}
                    {displayUser.role === 'SUPER_ADMIN' ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-red-600" />
                        <span>Gérer les utilisateurs</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-albaraka">
              <CardHeader>
                <CardTitle className="text-[var(--albaraka-primary)]">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full btn-albaraka-primary"
                >
Aller au tableau de bord
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
