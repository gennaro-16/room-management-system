'use client';

import React from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { Room } from '@/lib/api';
import { roomStatusColors } from '@/lib/colors';

interface RoomMapCanvasProps {
  rooms: Room[];
  hoveredRoom: Room | null;
  selectedRoom: Room | null;
  onRoomHover: (room: Room | null) => void;
  onRoomSelect: (room: Room | null) => void;
  mapWidth: number;
  mapHeight: number;
}

export function RoomMapCanvas({
  rooms,
  hoveredRoom,
  selectedRoom,
  onRoomHover,
  onRoomSelect,
  mapWidth,
  mapHeight,
}: RoomMapCanvasProps) {
  // Get status color with alBaraka theme based on room properties
  const getStatusColor = (room: Room) => {
    if (room.isUnderMaintenance) {
      return roomStatusColors.MAINTENANCE;
    }
    if (room.isAvailable === false) {
      return roomStatusColors.BUSY;
    }
    return roomStatusColors.FREE;
  };

  // Filter rooms that have coordinates
  const roomsWithCoordinates = rooms.filter(room => 
    room.x !== null && room.y !== null && 
    room.width !== null && room.height !== null
  );

  return (
    <Stage width={mapWidth} height={mapHeight}>
      <Layer>
        {roomsWithCoordinates.map((room) => (
          <Group
            key={room.id}
            onMouseEnter={() => onRoomHover(room)}
            onMouseLeave={() => onRoomHover(null)}
            onClick={() => onRoomSelect(room)}
          >
            <Rect
              x={room.x!}
              y={room.y!}
              width={room.width!}
              height={room.height!}
              fill={getStatusColor(room)}
              stroke={hoveredRoom?.id === room.id ? '#000' : '#333'}
              strokeWidth={hoveredRoom?.id === room.id ? 3 : 1.5}
              cornerRadius={8}
              shadowColor="black"
              shadowBlur={hoveredRoom?.id === room.id ? 15 : 5}
              shadowOpacity={hoveredRoom?.id === room.id ? 0.3 : 0.15}
            />
            <Text
              x={room.x! + 8}
              y={room.y! + 8}
              text={room.name}
              fontSize={14}
              fontStyle="bold"
              fill="white"
              shadowColor="black"
              shadowBlur={3}
            />
            <Text
              x={room.x! + 8}
              y={room.y! + 26}
              text={`${room.capacity} seats`}
              fontSize={10}
              fill="rgba(255,255,255,0.9)"
              shadowColor="black"
              shadowBlur={2}
            />
            {(room.isUnderMaintenance || room.isAvailable === false) && (
              <Text
                x={room.x! + 8}
                y={room.y! + 40}
                text={room.isUnderMaintenance ? 'MAINTENANCE' : 'BUSY'}
                fontSize={9}
                fontStyle="italic"
                fill="rgba(255,255,255,0.8)"
                shadowColor="black"
                shadowBlur={2}
              />
            )}
          </Group>
        ))}
      </Layer>
    </Stage>
  );
}
