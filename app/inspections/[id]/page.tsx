"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import InspectionRoomList from "../../../components/InspectionRoomList";
import InspectionItemCard, { ItemState } from "../../../components/InspectionItemCard";
import {
  patchInspection,
  postInspectionItems,
  getInspectionReport,
  shareInspectionReport,
} from "../../../lib/api";

const rooms: Record<string, string[]> = {
  Kitchen: ["Floor", "Walls"],
  Bathroom: ["Sink", "Toilet"],
};

export default function InspectionDetail({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<"capture" | "report">("capture");
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
    const blob = await getInspectionReport(params.id);
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  const shareReport = () => {
    shareInspectionReport(params.id);
  };

  const reportEntries = Object.entries(form).map(([key, val]) => {
    const [room, name] = key.split(":");
    return { room, name, ...val };
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Inspection {params.id}</h1>
        {tab === "capture" && (
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded bg-green-600 text-white"
          >
            Save
          </button>
        )}
      </div>
      <div className="flex gap-4 border-b pb-2">
        <button
          className={`px-2 ${tab === "capture" ? "border-b-2 border-blue-600" : ""}`}
          onClick={() => setTab("capture")}
        >
          Capture
        </button>
        <button
          className={`px-2 ${tab === "report" ? "border-b-2 border-blue-600" : ""}`}
          onClick={() => setTab("report")}
        >
          Report
        </button>
      </div>
      {tab === "capture" ? (
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
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {reportEntries.map((entry, idx) => (
              <div
                key={idx}
                className="p-2 border rounded flex flex-col gap-1"
              >
                <div className="font-medium">
                  {entry.room} - {entry.name}
                </div>
                <div className="text-sm">Result: {entry.result}</div>
                {entry.notes && (
                  <div className="text-sm">Notes: {entry.notes}</div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateReport}
              className="px-3 py-1 rounded bg-blue-600 text-white"
            >
              Generate PDF
            </button>
            <button
              onClick={shareReport}
              className="px-3 py-1 rounded bg-green-600 text-white"
            >
              Share with Tenant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
