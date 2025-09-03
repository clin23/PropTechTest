"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import InspectionRoomList from "../../../components/InspectionRoomList";
import InspectionItemCard, { ItemState } from "../../../components/InspectionItemCard";
import { patchInspection, postInspectionItems } from "../../../lib/api";

const rooms: Record<string, string[]> = {
  Kitchen: ["Floor", "Walls"],
  Bathroom: ["Sink", "Toilet"],
};

export default function InspectionDetail({ params }: { params: { id: string } }) {
  const [currentRoom, setCurrentRoom] = useState(Object.keys(rooms)[0]);
  const [form, setForm] = useState<Record<string, ItemState>>({});

  const patch = useMutation({
    mutationFn: (payload: any) => patchInspection(params.id, payload),
  });
  const postItems = useMutation({
    mutationFn: (payload: any) => postInspectionItems(params.id, payload),
  });

  const items = rooms[currentRoom];

  const updateItem = (item: string) => (state: ItemState) => {
    setForm((f) => ({ ...f, [`${currentRoom}:${item}`]: state }));
  };

  const handleSave = () => {
    const payload = Object.entries(form).map(([key, val]) => {
      const [room, name] = key.split(":");
      return {
        room,
        name,
        result: val.result,
        notes: val.notes,
        photos: val.photos.map((f) => f.name),
      };
    });
    patch.mutate({ status: "Completed" });
    postItems.mutate(payload);
  };

  const generateReport = async () => {
    const res = await fetch(`/inspections/${params.id}/report`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Inspection {params.id}</h1>
        <button
          onClick={handleSave}
          className="px-3 py-1 rounded bg-green-600 text-white"
        >
          Save
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InspectionRoomList
          rooms={Object.keys(rooms)}
          current={currentRoom}
          onSelect={setCurrentRoom}
        />
        <div className="grid gap-2">
          {items.map((item) => (
            <InspectionItemCard
              key={item}
              name={item}
              value={
                form[`${currentRoom}:${item}`] || { photos: [] as File[] }
              }
              onChange={updateItem(item)}
            />
          ))}
        </div>
      </div>
      <button
        onClick={generateReport}
        className="px-3 py-1 rounded bg-blue-600 text-white"
      >
        Generate Report
      </button>
    </div>
  );
}
