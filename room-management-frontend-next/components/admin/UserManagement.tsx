'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, UserPlus, Edit, Trash2, Shield, User, Crown } from 'lucide-react';
import { useUsers, useUpdateUser, useDeleteUser, useDepartments } from '@/hooks/useApi';
import { User as UserType, UserRole, UpdateUserDto } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { apiUtils } from '@/lib/api';
import { useIsAdmin } from '@/contexts/AuthContext';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [viewUser, setViewUser] = useState<UserType | null>(null);
  const isAdmin = useIsAdmin();

  // Edit form state
  const [formValues, setFormValues] = useState<UpdateUserDto>({});


  // Departments for selection (load when component mounts)
  const { data: departments } = useDepartments(true);

  // Sync form values when opening edit dialog (must be before any early returns)
  React.useEffect(() => {
    if (editingUser) {
      setFormValues({
        username: editingUser.username,
        email: editingUser.email,
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        title: editingUser.title,
        phone: editingUser.phone,
        departmentId: typeof editingUser.department === 'object' ? editingUser.department?.id ?? undefined : editingUser.departmentId ?? undefined,
        role: editingUser.role,
        isActive: editingUser.isActive,
        isApproved: editingUser.isApproved,
      });
    }
  }, [editingUser]);

  // API hooks
  const { data: allUsers, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers(true);
  const { updateUser, loading: updateLoading, error: updateError } = useUpdateUser();
  const { deleteUser, loading: deleteLoading, error: deleteError } = useDeleteUser();

  // Debounce search to reduce re-renders
  const [debouncedSearch, setDebouncedSearch] = useState('');
  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Memoized filters
  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    const term = debouncedSearch.toLowerCase();
    return allUsers.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(term) ||
                           user.email.toLowerCase().includes(term) ||
                           user.firstName?.toLowerCase().includes(term) ||
                           user.lastName?.toLowerCase().includes(term);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allUsers, debouncedSearch, roleFilter]);


  const handleEditUser = async (userId: number, data: UpdateUserDto) => {
    try {
      await updateUser(userId, data);
      refetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        refetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };


  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'EMPLOYEE':
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-green-600" />;
    }
  };


  if (usersLoading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  if (usersError) {
    return <ErrorAlert error={usersError || 'Failed to load users'} onRetry={() => { refetchUsers(); }} />;
  }

  const updateField = <K extends keyof UpdateUserDto>(key: K, value: UpdateUserDto[K]) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-balance">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground">Gérez les comptes, rôles et approbations</p>
        </div>
      </div>

      <div className="w-full">

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher par nom, e-mail ou nom d'utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="EMPLOYEE">Employé</SelectItem>
                      <SelectItem value="GUEST">Invité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.firstName && user.lastName && (
                            <div className="text-sm text-muted-foreground">
                              {user.firstName} {user.lastName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role || 'USER')}
                          <Badge className={apiUtils.getRoleColor(user.role)}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{(typeof user.department === 'string' ? user.department : user.department?.name) || 'N/D'}</TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/D'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {isAdmin() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewUser(user)}
                            >
                              Afficher
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Aucun utilisateur trouvé.</p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>


      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>Mettre à jour les informations de l'utilisateur{isAdmin() ? ', y compris le rôle' : ''}.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input id="username" value={formValues.username || ''} onChange={(e) => updateField('username', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={formValues.email || ''} onChange={(e) => updateField('email', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" value={formValues.firstName || ''} onChange={(e) => updateField('firstName', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" value={formValues.lastName || ''} onChange={(e) => updateField('lastName', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input id="title" value={formValues.title || ''} onChange={(e) => updateField('title', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={formValues.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
            </div>
            <div>
              <Label>Département</Label>
              <Select value={formValues.departmentId?.toString() || ''} onValueChange={(v) => updateField('departmentId', Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isAdmin() && (
              <div>
                <Label>Rôle</Label>
                <Select value={formValues.role || ''} onValueChange={(v) => updateField('role', v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="EMPLOYEE">Employé</SelectItem>
                    <SelectItem value="GUEST">Invité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Annuler</Button>
            <Button
              onClick={() => {
                if (!editingUser) return;
                const data: UpdateUserDto = { ...formValues };
                // If not admin, do not send role changes
                if (!isAdmin()) {
                  delete (data as any).role;
                }
                handleEditUser(editingUser.id, data);
              }}
              disabled={updateLoading}
            >
              {updateLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Details (Super Admin) */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
            <DialogDescription>Informations complètes sur l'utilisateur sélectionné.</DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Identifiant Employé</div>
                <div className="font-medium">{(viewUser as any).employeeId || '—'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Nom d'utilisateur</div>
                <div className="font-medium">{viewUser.username}</div>
              </div>
              <div>
                <div className="text-muted-foreground">E-mail</div>
                <div className="font-medium">{viewUser.email}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Nom</div>
                <div className="font-medium">{viewUser.firstName} {viewUser.lastName}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Rôle</div>
                <div className="flex items-center gap-2 font-medium">
                  {getRoleIcon(viewUser.role)}
                  <Badge className={apiUtils.getRoleColor(viewUser.role)}>
                    {viewUser.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Département</div>
                <div className="font-medium">{(typeof viewUser.department === 'string' ? viewUser.department : viewUser.department?.name) || 'N/D'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Titre</div>
                <div className="font-medium">{viewUser.title || '—'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Téléphone</div>
                <div className="font-medium">{viewUser.phone || '—'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Créé le</div>
                <div className="font-medium">{viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleString() : 'N/D'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Mis à jour</div>
                <div className="font-medium">{viewUser.updatedAt ? new Date(viewUser.updatedAt).toLocaleString() : 'N/D'}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewUser(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}