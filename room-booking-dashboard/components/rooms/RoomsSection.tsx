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
      const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'MAINTENANCE' && room.isUnderMaintenance) ||
        (statusFilter === 'BUSY' && room.isAvailable === false) ||
        (statusFilter === 'FREE' && !room.isUnderMaintenance && room.isAvailable !== false);
      // Note: Floor filtering would need to be added to the API or derived from room data
      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchTerm, statusFilter]);


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
            <h2 className="text-2xl font-bold text-balance">Room Management</h2>
            <p className="text-muted-foreground">Manage room availability, status, and settings</p>
          </div>
        </div>
        <LoadingSpinner text="Loading rooms..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-balance">Room Management</h2>
            <p className="text-muted-foreground">Manage room availability, status, and settings</p>
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
            {isAdmin() ? 'Room Management' : 'Available Rooms'}
          </h2>
          <p className="text-muted-foreground">
            {isAdmin() 
              ? 'Manage room availability, status, and settings' 
              : 'Browse and book available rooms'
            }
          </p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setIsAddRoomOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        )}
      </div>

      {/* Filters */}
      <RoomFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

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
            <h3 className="text-lg font-medium mb-2">No rooms found</h3>
            <p className="text-muted-foreground text-center mb-4">
              No rooms match your current filters. Try adjusting your search criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Room Dialog */}
      <AddRoomDialog
        open={isAddRoomOpen}
        onOpenChange={setIsAddRoomOpen}
        onSubmit={handleCreateRoom}
        loading={createLoading}
        error={createError}
      />

      {/* Edit Room Dialog */}
      <EditRoomDialog
        open={isEditRoomOpen}
        onOpenChange={setIsEditRoomOpen}
        room={selectedRoom}
        onSubmit={handleEditRoom}
        loading={updateRoomLoading}
        error={updateRoomError}
      />

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
