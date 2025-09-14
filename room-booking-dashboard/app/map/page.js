"use client";  // 👈 ensures this only runs in the browser

import dynamic from "next/dynamic";

// Dynamically import RoomMapCanvas so it only runs on client
const RoomMapCanvas = dynamic(() => import("./RoomMapCanvas"), {
  ssr: false,
});

export default function Page() {
  return <RoomMapCanvas />;
}
