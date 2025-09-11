"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listTenantNotes, addTenantNote } from "../lib/api";
import { logEvent } from "../lib/log";
import { useToast } from "./ui/use-toast";

interface Props {
  propertyId: string;
}

export default function TenantCRM({ propertyId }: Props) {
  const { data: notes = [] } = useQuery({
    queryKey: ["tenant-notes", propertyId],
    queryFn: () => listTenantNotes(propertyId),
  });
  const [text, setText] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: (note: string) => addTenantNote(propertyId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-notes", propertyId] });
      setText("");
      toast({ title: "Note saved" });
      logEvent("note_add", { propertyId });
    },
  });

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className="border p-1 flex-1 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          placeholder="Add note"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50 dark:bg-blue-700"
          onClick={() => mutation.mutate(text)}
          disabled={!text.trim()}
        >
          Add
        </button>
        <button
          className="border px-2 py-1 rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          disabled
        >
          Send Template
        </button>
      </div>
      <ul className="space-y-1">
        {notes.map((n) => (
          <li
            key={n.id}
            className="border p-2 bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            {n.text}
          </li>
        ))}
        {notes.length === 0 && <li>No notes</li>}
      </ul>
    </div>
  );
}
