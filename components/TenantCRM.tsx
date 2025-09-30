"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTenantNote,
  fetchTenants,
  listTenantNotes,
} from "../lib/api";
import type {
  Tenant as TenantDto,
  TenantNote as TenantNoteDto,
} from "../lib/tenant-crm/schemas";
import { useToast } from "./ui/use-toast";

interface Props {
  propertyId?: string;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useTenantDirectory(propertyId?: string) {
  return useQuery({
    queryKey: ["tenants", { propertyId }],
    queryFn: () => fetchTenants(propertyId ? { propertyId } : undefined),
  });
}

export default function TenantCRM({ propertyId }: Props) {
  const { data, isLoading } = useTenantDirectory(propertyId);
  const tenants = data?.items ?? [];
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(
    tenants[0]?.id ?? null,
  );

  useEffect(() => {
    if (!selectedTenantId && tenants.length > 0) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [selectedTenantId, tenants]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notesData, isLoading: isLoadingNotes } = useQuery({
    enabled: Boolean(selectedTenantId),
    queryKey: ["tenant-notes", { tenantId: selectedTenantId }],
    queryFn: () =>
      listTenantNotes({ tenantId: selectedTenantId ?? undefined }).then(
        (response) => response.items,
      ),
  });

  const [noteBody, setNoteBody] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedTenantId) throw new Error("Select a tenant before adding notes");
      const payload = {
        tenantId: selectedTenantId,
        propertyId,
        createdByUserId: "demo-user",
        body: noteBody.trim(),
      };
      return createTenantNote(payload);
    },
    onSuccess: () => {
      setNoteBody("");
      queryClient.invalidateQueries({
        queryKey: ["tenant-notes", { tenantId: selectedTenantId }],
      });
      toast({ title: "Note saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save note", description: error.message, variant: "destructive" });
    },
  });

  const selectedTenant: TenantDto | undefined = useMemo(() => {
    if (!tenants.length) return undefined;
    if (selectedTenantId) {
      return tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0];
    }
    return tenants[0];
  }, [tenants, selectedTenantId]);

  const notes: TenantNoteDto[] = notesData ?? [];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <section className="md:col-span-1">
        <h2 className="text-sm font-medium text-muted-foreground">Tenants</h2>
        <div className="mt-2 space-y-1 rounded-md border bg-background">
          {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading tenants…</div>}
          {!isLoading && tenants.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No tenants found.</div>
          )}
          {!isLoading &&
            tenants.map((tenant) => (
              <button
                key={tenant.id}
                type="button"
                onClick={() => setSelectedTenantId(tenant.id)}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm hover:bg-muted focus:outline-none focus-visible:ring",
                  selectedTenantId === tenant.id && "bg-muted",
                )}
              >
                <div className="font-medium text-foreground">{tenant.fullName}</div>
                <div className="text-xs text-muted-foreground">
                  {[tenant.email, tenant.phone].filter(Boolean).join(" · ") || "No contact details"}
                </div>
                {tenant.tags?.length ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tenant.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted-foreground/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
        </div>
      </section>

      <section className="md:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Notes</h2>
            <p className="text-sm text-muted-foreground">
              {selectedTenant ? selectedTenant.fullName : "Select a tenant to view their notes."}
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <div className="rounded-md border bg-background p-4">
            <label className="block text-sm font-medium text-foreground" htmlFor="tenant-note">
              Add a note
            </label>
            <textarea
              id="tenant-note"
              className="mt-2 h-24 w-full rounded-md border bg-transparent p-2 text-sm"
              placeholder="Capture call summaries, visit outcomes, or reminders…"
              value={noteBody}
              onChange={(event) => setNoteBody(event.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => mutation.mutate()}
                disabled={!noteBody.trim() || !selectedTenantId || mutation.isPending}
                className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {mutation.isPending ? "Saving…" : "Save note"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {isLoadingNotes && (
              <div className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
                Loading timeline…
              </div>
            )}
            {!isLoadingNotes && notes.length === 0 && (
              <div className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
                No notes yet for this tenant.
              </div>
            )}
            {!isLoadingNotes &&
              notes.map((note) => (
                <article key={note.id} className="rounded-md border bg-background p-4">
                  <header className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                    {note.tags?.length ? (
                      <span>{note.tags.join(', ')}</span>
                    ) : null}
                  </header>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{note.body}</p>
                </article>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
