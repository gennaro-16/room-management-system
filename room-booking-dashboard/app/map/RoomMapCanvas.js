"use client";

import { Stage, Layer, Rect, Text, Group } from "react-konva";
import { useState } from "react";

export default function RoomMapCanvas() {
  const [hoveredId, setHoveredId] = useState(null);

  const rooms = [
    { id: 1, name: "Room A", x: 50, y: 60, width: 120, height: 80, status: "FREE" },
    { id: 2, name: "Room B", x: 200, y: 60, width: 150, height: 100, status: "BUSY" },
    { id: 3, name: "Room C", x: 400, y: 200, width: 180, height: 120, status: "MAINTENANCE" },
    { id: 4, name: "Room D", x: 100, y: 250, width: 100, height: 100, status: "RESERVED" },
  ];

  const statusColors = {
    FREE: ["#4ade80", "#22c55e"], // green gradient
    BUSY: ["#f87171", "#dc2626"], // red gradient
    MAINTENANCE: ["#fbbf24", "#d97706"], // orange gradient
    RESERVED: ["#60a5fa", "#2563eb"], // blue gradient
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <Stage width={900} height={650} className="bg-white shadow-2xl rounded-xl border">
        <Layer>
          {rooms.map((room) => (
            <Group
              key={room.id}
              onMouseEnter={() => setHoveredId(room.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: room.width, y: room.height }}
                fillLinearGradientColorStops={[
                  0, statusColors[room.status][0],
                  1, statusColors[room.status][1],
                ]}
                shadowColor="black"
                shadowBlur={hoveredId === room.id ? 20 : 10}
                shadowOpacity={hoveredId === room.id ? 0.4 : 0.25}
                cornerRadius={10}
                stroke={hoveredId === room.id ? "black" : "#333"}
                strokeWidth={hoveredId === room.id ? 3 : 1.5}
              />
              <Text
                x={room.x + 10}
                y={room.y + 10}
                text={room.name}
                fontSize={16}
                fontStyle="bold"
                fill="white"
                shadowColor="black"
                shadowBlur={5}
              />
              <Text
                x={room.x + 10}
                y={room.y + 30}
                text={room.status}
                fontSize={12}
                fontStyle="italic"
                fill="rgba(255,255,255,0.9)"
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
