"use client";

import { Stage, Layer, Rect, Text } from "react-konva";

export default function RoomMap() {
  // Fake test data
  const rooms = [
    {
      id: 1,
      name: "Room A",
      x: 50,
      y: 60,
      width: 120,
      height: 80,
      status: "FREE",
    },
    {
      id: 2,
      name: "Room B",
      x: 200,
      y: 60,
      width: 150,
      height: 100,
      status: "BUSY",
    },
    {
      id: 3,
      name: "Room C",
      x: 400,
      y: 200,
      width: 180,
      height: 120,
      status: "MAINTENANCE",
    },
    {
      id: 4,
      name: "Room D",
      x: 100,
      y: 250,
      width: 100,
      height: 100,
      status: "RESERVED",
    },
  ];

  const statusColors = {
    FREE: "green",
    BUSY: "red",
    MAINTENANCE: "orange",
    RESERVED: "blue",
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Stage width={800} height={600} className="bg-white shadow-lg rounded-lg">
        <Layer>
          {rooms.map((room) => (
            <Rect
              key={room.id}
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              fill={statusColors[room.status as keyof typeof statusColors] || statusColors.FREE}
              stroke="black"
              strokeWidth={2}
              cornerRadius={6}
            />
          ))}

          {rooms.map((room) => (
            <Text
              key={`text-${room.id}`}
              x={room.x + 10}
              y={room.y + 10}
              text={room.name}
              fill="white"
              fontStyle="bold"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
