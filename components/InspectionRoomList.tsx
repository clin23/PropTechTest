import React from "react";

interface Props {
  rooms: string[];
  current: string;
  onSelect: (room: string) => void;
}

export default function InspectionRoomList({ rooms, current, onSelect }: Props) {
  return (
    <ul className="space-y-2">
      {rooms.map((room) => (
        <li key={room}>
          <button
            type="button"
            onClick={() => onSelect(room)}
            className={`w-full text-left p-2 rounded border ${
              room === current ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {room}
          </button>
        </li>
      ))}
    </ul>
  );
}
