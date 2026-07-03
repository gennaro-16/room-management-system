'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Building2 } from 'lucide-react';
import { RoomCard } from './RoomCard';
import { RoomFilters } from './RoomFilters';
import { AddRoomDialog } from './AddRoomDialog';
import { EditRoomDialog } from './EditRoomDialog';
import { NewBookingDialog } from '../bookings/NewBookingDialog';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom, useCreateBooking, useToggleRoomMaintenance } from '@/hooks/useApi';
import { Room, CreateRoomDto, UpdateRoomDto, CreateBookingDto } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Room status type for filtering
type RoomStatus = 'FREE' | 'BUSY' | 'MAINTENANCE' | 'all';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

export function RoomsSection() {
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<number | 'all'>('all');
  const [capacityFilter, setCapacityFilter] = useState<string | 'all'>('all');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const { isAdmin } = useAuth();

  const { data: rooms, loading, error, refetch } = useRooms();
  const { createRoom, loading: createLoading, error: createError } = useCreateRoom();
  const { updateRoom, loading: updateRoomLoading, error: updateRoomError } = useUpdateRoom();
  const { deleteRoom, loading: deleteLoading } = useDeleteRoom();
  const { createBooking, loading: createBookingLoading, error: createBookingError } = useCreateBooking();
  const { toggleMaintenance, loading: maintenanceLoading } = useToggleRoomMaintenance();

  // Filter rooms based on search and filters
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    
    return rooms.filter((room) => {
      // Search filter
      const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'MAINTENANCE' && room.status === 'MAINTENANCE') ||
        (statusFilter === 'BUSY' && room.status === 'BUSY') ||
        (statusFilter === 'FREE' && room.status === 'FREE');
      
      // Department filter
      const matchesDepartment = departmentFilter === 'all' || room.departmentId === departmentFilter;
      
      // Capacity filter
      const matchesCapacity = capacityFilter === 'all' || (() => {
        switch (capacityFilter) {
          case '1-5': return room.capacity >= 1 && room.capacity <= 5;
          case '6-10': return room.capacity >= 6 && room.capacity <= 10;
          case '11-20': return room.capacity >= 11 && room.capacity <= 20;
          case '21-50': return room.capacity >= 21 && room.capacity <= 50;
          case '50+': return room.capacity > 50;
          default: return true;
        }
      })();
      
      // Floor filter
      const matchesFloor = floorFilter === 'all' || room.floor === floorFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment && matchesCapacity && matchesFloor;
    });
  }, [rooms, searchTerm, statusFilter, departmentFilter, capacityFilter, floorFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setCapacityFilter('all');
    setFloorFilter('all');
  };

  const handleCreateRoom = async (data: CreateRoomDto) => {
    await createRoom(data);
    refetch();
  };

  const handleEditRoom = async (id: number, data: UpdateRoomDto) => {
    await updateRoom(id, data);
    refetch();
  };

  const handleCreateBooking = async (data: CreateBookingDto) => {
    await createBooking(data);
    refetch();
  };

  // Room status is now calculated from bookings, no manual update needed

  const handleDeleteRoom = async (roomId: number) => {
    await deleteRoom(roomId);
    refetch();
  };

  const handleEditClick = (room: Room) => {
    setSelectedRoom(room);
    setIsEditRoomOpen(true);
  };

  const handleBookClick = (room: Room) => {
    setSelectedRoom(room);
    setIsNewBookingOpen(true);
  };

  const handleToggleMaintenance = async (roomId: number) => {
    await toggleMaintenance(roomId);
    refetch();
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-balance">Gestion des salles</h2>
            <p className="text-muted-foreground">Gérer la disponibilité, le statut et les paramètres des salles</p>
          </div>
        </div>
        <LoadingSpinner text="Chargement des salles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-balance">Gestion des salles</h2>
            <p className="text-muted-foreground">Gérer la disponibilité, le statut et les paramètres des salles</p>
          </div>
        </div>
        <ErrorAlert error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room Management Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-balance">
            {isAdmin() ? 'Gestion des salles' : 'Salles disponibles'}
          </h2>
          <p className="text-muted-foreground">
            {isAdmin() 
              ? 'Gérer la disponibilité, le statut et les paramètres des salles' 
              : 'Parcourir et réserver les salles disponibles'
            }
          </p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setIsAddRoomOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une salle
          </Button>
        )}
      </div>

      {/* Filters */}
      <RoomFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        capacityFilter={capacityFilter}
        onCapacityFilterChange={setCapacityFilter}
        floorFilter={floorFilter}
        onFloorFilterChange={setFloorFilter}
        onClearFilters={clearFilters}
      />

      {/* Results Counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredRooms.length} salle{filteredRooms.length !== 1 ? 's' : ''} trouvée{filteredRooms.length !== 1 ? 's' : ''}
          {rooms && rooms.length !== filteredRooms.length && (
            <span className="ml-1">
              sur {rooms.length} au total
            </span>
          )}
        </p>
      </div>

      {/* Room Grid */}
      {filteredRooms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={handleEditClick}
              onBook={handleBookClick}
              onDelete={handleDeleteRoom}
              onToggleMaintenance={handleToggleMaintenance}
              isMaintenanceLoading={maintenanceLoading}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune salle trouvée</h3>
            <p className="text-muted-foreground text-center mb-4">
              Aucune salle ne correspond à vos filtres actuels. Essayez d'ajuster vos critères de recherche.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Effacer les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Room Dialog */}
      {isAdmin() && (
        <AddRoomDialog
          open={isAddRoomOpen}
          onOpenChange={setIsAddRoomOpen}
          onSubmit={handleCreateRoom}
          loading={createLoading}
          error={createError}
        />
      )}

      {/* Edit Room Dialog */}
      {isAdmin() && (
        <EditRoomDialog
          open={isEditRoomOpen}
          onOpenChange={setIsEditRoomOpen}
          room={selectedRoom}
          onSubmit={handleEditRoom}
          loading={updateRoomLoading}
          error={updateRoomError}
        />
      )}

      {/* New Booking Dialog */}
      <NewBookingDialog
        open={isNewBookingOpen}
        onOpenChange={setIsNewBookingOpen}
        onSubmit={handleCreateBooking}
        loading={createBookingLoading}
        error={createBookingError}
      />
    </div>
  );
}
