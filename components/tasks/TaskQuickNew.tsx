"use client";
import { useState } from "react";

export default function TaskQuickNew({ onCreate }: { onCreate: (title: string) => void }) {
  const [title, setTitle] = useState("");
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && title.trim()) {
      onCreate(title.trim());
      setTitle("");
    }
  };
  return (
    <input
      className="w-full border rounded p-2 mb-2"
      placeholder="+ New task"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onKeyDown={handleKey}
    />
  );
}
