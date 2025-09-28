'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks/useApi';

export default function DepartmentsManagement() {
  const { data, loading, error, refetch } = useDepartments();
  const { createDepartment, loading: creating } = useCreateDepartment();
  const { updateDepartment, loading: updating } = useUpdateDepartment();
  const { deleteDepartment, loading: deleting } = useDeleteDepartment();

  const [form, setForm] = useState({ name: '', description: '', floor: '' as string | number });
  const [editId, setEditId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ name: '', description: '', floor: '' });
    setEditId(null);
    setFormError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        floor: form.floor ? Number(form.floor) : null,
      };
      if (!payload.name) {
        setFormError('Name is required');
        return;
      }
      if (editId) {
        await updateDepartment(editId, payload);
      } else {
        await createDepartment(payload);
      }
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error submitting department:', error);
      setFormError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const onEdit = (dept: any) => {
    setEditId(dept.id);
    setForm({ name: dept.name, description: dept.description || '', floor: dept.floor ?? '' });
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this department?')) return;
    await deleteDepartment(id);
    refetch();
  };

  return (
    <Card className="card-albaraka">
      <CardHeader>
        <CardTitle className="text-[var(--albaraka-primary)]">Départements</CardTitle>
        <CardDescription className="text-[var(--albaraka-muted)]">Gérer les départements (Super Admin)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floor">Étage</Label>
            <Input id="floor" type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          </div>

          <div className="md:col-span-3 flex gap-2">
            <Button type="submit" disabled={creating || updating} className="btn-albaraka-primary">
              {editId ? 'Mettre à jour' : 'Créer'} le département
            </Button>
            {editId && (
              <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
            )}
          </div>
          {formError && (
            <div className="md:col-span-3">
              <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>
            </div>
          )}
        </form>

        {error && (
          <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Étage</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data || []).map((dept: any) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell>{dept.floor ?? '-'}</TableCell>
                <TableCell>{dept.description ?? '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(dept)}>Modifier</Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(dept.id)} disabled={deleting}>Supprimer</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


