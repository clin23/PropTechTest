"use client";
import { useState } from "react";

export default function TaskQuickNew({
  onCreate,
  className = "",
  placeholder = "+ New task",
}: {
  onCreate: (title: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [title, setTitle] = useState("");
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && title.trim()) {
      onCreate(title.trim());
      setTitle("");
    }
  };
  return (
    <input
      className={["w-full border rounded p-2 mb-2 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white", className]
        .filter(Boolean)
        .join(" ")}
      placeholder={placeholder}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onKeyDown={handleKey}
    />
  );
}
