'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize2, Info } from 'lucide-react';
import { roomsApi, Room } from '@/lib/api';
import { roomStatusColors } from '@/lib/colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

// Dynamically import the Konva canvas to avoid SSR issues
const RoomMapCanvas = dynamic(() => import('./RoomMapCanvas').then(mod => ({ default: mod.RoomMapCanvas })), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

interface RoomMapSectionProps {
  className?: string;
}

export function RoomMapSection({ className }: RoomMapSectionProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch rooms data
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const roomsData = await roomsApi.getAll();
      setRooms(roomsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Get status badge variant based on room properties
  const getStatusVariant = (room: Room) => {
    if (room.isUnderMaintenance) {
      return 'secondary';
    }
    if (room.isAvailable === false) {
      return 'destructive';
    }
    return 'default';
  };

  // Calculate map dimensions
  const mapWidth = isFullscreen ? (typeof window !== 'undefined' ? window.innerWidth - 100 : 800) : 800;
  const mapHeight = isFullscreen ? (typeof window !== 'undefined' ? window.innerHeight - 200 : 500) : 500;

  // Filter rooms that have coordinates
  const roomsWithCoordinates = rooms.filter(room => 
    room.x !== null && room.y !== null && 
    room.width !== null && room.height !== null
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Room Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Room Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorAlert error={error} />
          <Button onClick={fetchRooms} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Room Map
            <Badge variant="outline" className="ml-2">
              {roomsWithCoordinates.length} rooms
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRooms}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {roomsWithCoordinates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No rooms with coordinates found.</p>
            <p className="text-sm">Add coordinates to rooms to display them on the map.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Legend */}
            <div className="flex flex-wrap gap-2 justify-center">
              {(['FREE', 'BUSY', 'MAINTENANCE', 'RESERVED'] as const).map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: roomStatusColors[status] }}
                  />
                  <span className="text-sm font-medium">{status}</span>
                </div>
              ))}
            </div>

            {/* Map Container */}
            <div className="flex justify-center">
              <div className="border rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-background to-muted/20">
                <RoomMapCanvas
                  rooms={rooms}
                  hoveredRoom={hoveredRoom}
                  selectedRoom={selectedRoom}
                  onRoomHover={setHoveredRoom}
                  onRoomSelect={setSelectedRoom}
                  mapWidth={mapWidth}
                  mapHeight={mapHeight}
                />
              </div>
            </div>

            {/* Room Details */}
            {selectedRoom && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedRoom.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge 
                      variant={getStatusVariant(selectedRoom)} 
                      className="ml-2"
                    >
                      {selectedRoom.isUnderMaintenance ? 'MAINTENANCE' : 
                       selectedRoom.isAvailable === false ? 'BUSY' : 'FREE'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Capacity:</span>
                    <span className="ml-2">{selectedRoom.capacity} seats</span>
                  </div>
                  <div>
                    <span className="font-medium">Position:</span>
                    <span className="ml-2">({selectedRoom.x}, {selectedRoom.y})</span>
                  </div>
                  <div>
                    <span className="font-medium">Size:</span>
                    <span className="ml-2">{selectedRoom.width} × {selectedRoom.height}</span>
                  </div>
                </div>
                {selectedRoom.description && (
                  <div className="mt-2">
                    <span className="font-medium">Description:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRoom.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hover Info */}
            {hoveredRoom && !selectedRoom && (
              <div className="mt-2 text-center">
                <p className="text-sm text-muted-foreground">
                  Hovering over <strong>{hoveredRoom.name}</strong> - Click to see details
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
