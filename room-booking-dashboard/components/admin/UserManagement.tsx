'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, UserPlus, Edit, Trash2, Shield, User, Crown, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useUsers, usePendingUsers, useUpdateUser, useDeleteUser, useApproveUser, useDepartments } from '@/hooks/useApi';
import { User as UserType, UserRole, UpdateUserDto, ApproveUserDto } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { apiUtils } from '@/lib/api';
import { useIsSuperAdmin } from '@/contexts/AuthContext';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [approvalDialog, setApprovalDialog] = useState<{ user: UserType; action: 'approve' | 'reject' } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const isSuperAdmin = useIsSuperAdmin();

  // Edit form state
  const [formValues, setFormValues] = useState<UpdateUserDto>({});

  // Departments for selection
  const { data: departments } = useDepartments();

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
  const { data: allUsers, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers();
  const { data: pendingUsers, loading: pendingLoading, error: pendingError, refetch: refetchPending } = usePendingUsers();
  const { updateUser, loading: updateLoading, error: updateError } = useUpdateUser();
  const { deleteUser, loading: deleteLoading, error: deleteError } = useDeleteUser();
  const { approveUser, loading: approveLoading, error: approveError } = useApproveUser();

  // Filter users based on search and filters
  const filteredUsers = allUsers?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive) ||
      (statusFilter === 'pending' && !user.isApproved);
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const filteredPendingUsers = pendingUsers?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

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

  const handleApproveUser = async (userId: number, isApproved: boolean, rejectionReason?: string) => {
    try {
      await approveUser(userId, { isApproved, rejectionReason });
      refetchUsers();
      refetchPending();
      setApprovalDialog(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to approve/reject user:', error);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="h-4 w-4 text-red-600" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-green-600" />;
    }
  };

  const getStatusBadge = (user: UserType) => {
    if (!user.isApproved) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>;
    }
    if (user.isActive) {
      return <Badge variant="default" className="bg-green-50 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>;
    }
    return <Badge variant="destructive" className="bg-red-50 text-red-800 border-red-200">
      <XCircle className="h-3 w-3 mr-1" />
      Inactive
    </Badge>;
  };

  if (usersLoading || pendingLoading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  if (usersError || pendingError) {
    return <ErrorAlert error={usersError || pendingError || 'Failed to load users'} onRetry={() => { refetchUsers(); refetchPending(); }} />;
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

      <Tabs defaultValue="all-users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-users">
            Tous les utilisateurs ({allUsers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending-approvals">
            Approbations en attente ({pendingUsers?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="space-y-4">
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
                      <SelectItem value="SUPER_ADMIN">Super administrateur</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="USER">Utilisateur</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
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
                    <TableHead>Statut</TableHead>
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
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell>{(typeof user.department === 'string' ? user.department : user.department?.name) || 'N/D'}</TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/D'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
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
        </TabsContent>

        <TabsContent value="pending-approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher des utilisateurs en attente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Demandé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPendingUsers.map((user) => (
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
                      <TableCell>{(typeof user.department === 'string' ? user.department : user.department?.name) || 'N/D'}</TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/D'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setApprovalDialog({ user, action: 'approve' })}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setApprovalDialog({ user, action: 'reject' })}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredPendingUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Aucune approbation en attente.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={!!approvalDialog} onOpenChange={() => setApprovalDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalDialog?.action === 'approve' ? "Approuver l'utilisateur" : "Rejeter l'utilisateur"}
            </DialogTitle>
            <DialogDescription>
              {approvalDialog?.action === 'approve' 
                ? `Êtes-vous sûr de vouloir approuver ${approvalDialog?.user.username} ?`
                : `Êtes-vous sûr de vouloir rejeter ${approvalDialog?.user.username} ?`
              }
            </DialogDescription>
          </DialogHeader>
          {approvalDialog?.action === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Raison du refus (optionnel)</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Saisissez la raison du refus..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialog(null)}
              disabled={approveLoading}
            >
              Annuler
            </Button>
            <Button
              variant={approvalDialog?.action === 'approve' ? 'default' : 'destructive'}
              onClick={() => {
                if (approvalDialog) {
                  handleApproveUser(
                    approvalDialog.user.id,
                    approvalDialog.action === 'approve',
                    approvalDialog.action === 'reject' ? rejectionReason : undefined
                  );
                }
              }}
              disabled={approveLoading}
            >
              {approveLoading ? 'Traitement...' : approvalDialog?.action === 'approve' ? 'Approuver' : 'Rejeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>Mettre à jour les informations de l'utilisateur{isSuperAdmin() ? ', y compris le rôle' : ''}.</DialogDescription>
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
            {isSuperAdmin() && (
              <div>
                <Label>Rôle</Label>
                <Select value={formValues.role || ''} onValueChange={(v) => updateField('role', v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super administrateur</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="DIRECTOR">Directeur</SelectItem>
                    <SelectItem value="SUB_DIRECTOR">Sous-directeur</SelectItem>
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
                // If not super admin, do not send role changes
                if (!isSuperAdmin()) {
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
    </div>
  );
}