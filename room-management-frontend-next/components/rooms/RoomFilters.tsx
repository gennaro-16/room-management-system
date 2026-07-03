'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Users, Building2, Layers } from 'lucide-react';
import { departmentsApi, Department } from '@/lib/api';

// Room status type for filtering
type RoomStatus = 'FREE' | 'BUSY' | 'MAINTENANCE' | 'all';

interface RoomFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: RoomStatus | 'all';
  onStatusFilterChange: (status: RoomStatus | 'all') => void;
  departmentFilter: number | 'all';
  onDepartmentFilterChange: (departmentId: number | 'all') => void;
  capacityFilter: string | 'all';
  onCapacityFilterChange: (capacity: string | 'all') => void;
  floorFilter: number | 'all';
  onFloorFilterChange: (floor: number | 'all') => void;
  onClearFilters: () => void;
}

export function RoomFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  capacityFilter,
  onCapacityFilterChange,
  floorFilter,
  onFloorFilterChange,
  onClearFilters,
}: RoomFiltersProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    departmentsApi.getPublic().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  const hasActiveFilters = 
    searchTerm !== '' || 
    statusFilter !== 'all' || 
    departmentFilter !== 'all' || 
    capacityFilter !== 'all' || 
    floorFilter !== 'all';

  const capacityOptions = [
    { value: 'all', label: 'Toutes les capacités' },
    { value: '1-5', label: '1-5 personnes' },
    { value: '6-10', label: '6-10 personnes' },
    { value: '11-20', label: '11-20 personnes' },
    { value: '21-50', label: '21-50 personnes' },
    { value: '50+', label: '50+ personnes' },
  ];

  const floorOptions = [
    { value: 'all', label: 'Tous les étages' },
    { value: '1', label: 'Étage 1' },
    { value: '2', label: 'Étage 2' },
    { value: '3', label: 'Étage 3' },
    { value: '4', label: 'Étage 4' },
    { value: '5', label: 'Étage 5' },
    { value: '6', label: 'Étage 6' },
    { value: '7', label: 'Étage 7' },
    { value: '8', label: 'Étage 8' },
    { value: '9', label: 'Étage 9' },
    { value: '10', label: 'Étage 10' },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        {/* Main search and basic filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des salles..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="FREE">Libre</SelectItem>
                <SelectItem value="BUSY">Occupé</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Plus de filtres
            </Button>
          </div>
        </div>

        {/* Advanced filters */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Department Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Département
                </label>
                <Select 
                  value={departmentFilter === 'all' ? 'all' : departmentFilter.toString()} 
                  onValueChange={(value) => onDepartmentFilterChange(value === 'all' ? 'all' : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les départements</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Capacité
                </label>
                <Select 
                  value={capacityFilter === 'all' ? 'all' : capacityFilter.toString()} 
                  onValueChange={(value) => onCapacityFilterChange(value === 'all' ? 'all' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une capacité" />
                  </SelectTrigger>
                  <SelectContent>
                    {capacityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Floor Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Étage
                </label>
                <Select 
                  value={floorFilter === 'all' ? 'all' : floorFilter.toString()} 
                  onValueChange={(value) => onFloorFilterChange(value === 'all' ? 'all' : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un étage" />
                  </SelectTrigger>
                  <SelectContent>
                    {floorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-transparent">Actions</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  disabled={!hasActiveFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Effacer les filtres
                </Button>
              </div>
            </div>

            {/* Active filters display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Filtres actifs:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Recherche: &ldquo;{searchTerm}&rdquo;
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Statut: {statusFilter}
                  </Badge>
                )}
                {departmentFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Département: {departments.find(d => d.id === departmentFilter)?.name}
                  </Badge>
                )}
                {capacityFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Capacité: {capacityOptions.find(c => c.value === capacityFilter)?.label}
                  </Badge>
                )}
                {floorFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Étage: {floorOptions.find(f => f.value === floorFilter.toString())?.label}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
