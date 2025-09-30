"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getNotificationPreferences,
  getTenant,
  listCommLog,
  listTenantNotes,
} from "../../lib/api";

interface TenantProfileProps {
  tenantId: string;
}

export default function TenantProfile({ tenantId }: TenantProfileProps) {
  const { data: tenantResponse, isLoading } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: () => getTenant(tenantId),
  });

  const { data: notesResponse } = useQuery({
    enabled: Boolean(tenantId),
    queryKey: ["tenant-notes", { tenantId }],
    queryFn: () => listTenantNotes({ tenantId }),
  });

  const { data: commsResponse } = useQuery({
    enabled: Boolean(tenantId),
    queryKey: ["tenant-comm", { tenantId }],
    queryFn: () => listCommLog({ tenantId }),
  });

  const { data: prefsResponse } = useQuery({
    enabled: Boolean(tenantId),
    queryKey: ["tenant-notification", { tenantId }],
    queryFn: () => getNotificationPreferences(tenantId),
  });

  if (isLoading) {
    return <div className="rounded-md border bg-background p-4 text-sm text-muted-foreground">Loading tenant…</div>;
  }

  if (!tenantResponse) {
    return <div className="rounded-md border bg-background p-4 text-sm text-muted-foreground">Tenant not found.</div>;
  }

  const { tenant, tenancies, latestArrears, lastContact } = tenantResponse;
  const notes = notesResponse?.items ?? [];
  const communications = commsResponse?.items ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-md border bg-background p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{tenant.fullName}</h1>
            <p className="text-sm text-muted-foreground">
              {tenant.email || tenant.phone ? [tenant.email, tenant.phone].filter(Boolean).join(" · ") : "No contact details"}
            </p>
            {tenant.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {tenant.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          {latestArrears ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <div className="font-semibold text-destructive">Arrears</div>
              <div className="text-destructive">
                {`Balance ${(latestArrears.balanceCents / 100).toLocaleString('en-AU', {
                  style: 'currency',
                  currency: 'AUD',
                })} · ${latestArrears.days} days`}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border bg-background p-4">
          <h2 className="text-sm font-semibold text-foreground">Tenancies</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {tenancies.length === 0 && (
              <li className="text-muted-foreground">No tenancy history recorded.</li>
            )}
            {tenancies.map((tenancy) => (
              <li key={tenancy.id} className="rounded border border-muted p-3">
                <div className="font-medium text-foreground">Property {tenancy.propertyId}</div>
                <div className="text-muted-foreground">
                  {tenancy.startDate} → {tenancy.endDate ?? 'Current'}
                </div>
                <div className="text-muted-foreground">
                  {`Rent ${(tenancy.rentCents / 100).toLocaleString('en-AU', {
                    style: 'currency',
                    currency: 'AUD',
                  })} · ${tenancy.frequency}`}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border bg-background p-4">
          <h2 className="text-sm font-semibold text-foreground">Notification preferences</h2>
          {prefsResponse ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt>Email</dt>
                <dd>{prefsResponse.channels.email ? 'Enabled' : 'Disabled'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>SMS</dt>
                <dd>{prefsResponse.channels.sms ? 'Enabled' : 'Disabled'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Push</dt>
                <dd>{prefsResponse.channels.push ? 'Enabled' : 'Disabled'}</dd>
              </div>
              {prefsResponse.quietHours ? (
                <div className="flex items-center justify-between text-muted-foreground">
                  <dt>Quiet hours</dt>
                  <dd>
                    {prefsResponse.quietHours.start} – {prefsResponse.quietHours.end}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Defaults apply.</p>
          )}
          {lastContact ? (
            <div className="mt-4 rounded-md border border-muted p-3 text-xs text-muted-foreground">
              Last contact {new Date(lastContact.when).toLocaleString()} ({lastContact.type})
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-md border bg-background p-4">
        <h2 className="text-sm font-semibold text-foreground">Recent notes</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {notes.length === 0 && <li className="text-muted-foreground">No notes recorded.</li>}
          {notes.map((note) => (
            <li key={note.id} className="rounded border border-muted p-3">
              <div className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</div>
              <div className="mt-1 whitespace-pre-wrap text-foreground">{note.body}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-md border bg-background p-4">
        <h2 className="text-sm font-semibold text-foreground">Communication log</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {communications.length === 0 && (
            <li className="text-muted-foreground">No interactions logged.</li>
          )}
          {communications.map((entry) => (
            <li key={entry.id} className="rounded border border-muted p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(entry.when).toLocaleString()}</span>
                <span>{entry.type}</span>
              </div>
              {entry.subject ? <div className="mt-1 font-medium text-foreground">{entry.subject}</div> : null}
              {entry.body ? (
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{entry.body}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
