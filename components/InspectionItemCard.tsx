import React from "react";
import PhotoUpload from "./PhotoUpload";

export interface ItemState {
  result?: "pass" | "fail" | "na";
  notes?: string;
  photos: File[];
}

interface Props {
  name: string;
  value: ItemState;
  onChange: (state: ItemState) => void;
}

export default function InspectionItemCard({ name, value, onChange }: Props) {
  const { result = undefined, notes = "", photos = [] } = value;
  return (
    <div className="border rounded p-2 space-y-2">
      <h3 className="font-medium">{name}</h3>
      <div className="flex gap-2">
        {["pass", "fail", "na"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange({ ...value, result: r as any })}
            className={`px-2 py-1 rounded border ${
              result === r ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {r.toUpperCase()}
          </button>
        ))}
      </div>
      <textarea
        placeholder="Notes"
        className="w-full border rounded p-1"
        value={notes}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
      />
      <PhotoUpload onUpload={(files) => onChange({ ...value, photos: files })} />
      {photos.length > 0 && (
        <div className="text-xs text-gray-500">
          {photos.length} file{photos.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}
