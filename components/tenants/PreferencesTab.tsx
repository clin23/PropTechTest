'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';

import { type TenantPreferences, usePreferences, useSavePreferences } from '../../lib/api/tenants';
import { useToast } from '../ui/use-toast';

const preferencesSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
  quietHoursStart: z.union([z.string().min(1), z.literal('')]),
  quietHoursEnd: z.union([z.string().min(1), z.literal('')]),
  bestContactTime: z.union([z.string().min(1), z.literal('')]),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

interface PreferencesTabProps {
  tenantId: string;
}

export function PreferencesTab({ tenantId }: PreferencesTabProps) {
  const { toast } = useToast();
  const preferencesQuery = usePreferences(tenantId);
  const savePreferences = useSavePreferences();

  const [values, setValues] = useState<PreferencesFormValues>({
    email: true,
    sms: true,
    push: false,
    quietHoursStart: '',
    quietHoursEnd: '',
    bestContactTime: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (preferencesQuery.data) {
      setValues(mapToForm(preferencesQuery.data));
      setErrors({});
    }
  }, [preferencesQuery.data]);

  const handleChange = (field: keyof PreferencesFormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = preferencesSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === 'string') {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const payload: TenantPreferences = {
      email: parsed.data.email,
      sms: parsed.data.sms,
      push: parsed.data.push,
      quietHoursStart: parsed.data.quietHoursStart || null,
      quietHoursEnd: parsed.data.quietHoursEnd || null,
      bestContactTime: parsed.data.bestContactTime || null,
    };

    await savePreferences.mutateAsync(
      { tenantId, data: payload },
      {
        onSuccess: () => toast({ title: 'Preferences saved' }),
        onError: () => toast({ title: 'Failed to save preferences', variant: 'destructive' }),
      }
    );
  };

  if (preferencesQuery.isLoading) {
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-lg border border-border/50 bg-muted/30" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
      <fieldset className="rounded-lg border border-border/60 bg-background/40 p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Communication channels</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={values.email}
              onChange={(event) => handleChange('email', event.target.checked)}
              className="h-4 w-4 rounded border border-border/70"
            />
            Email
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={values.sms}
              onChange={(event) => handleChange('sms', event.target.checked)}
              className="h-4 w-4 rounded border border-border/70"
            />
            SMS
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={values.push}
              onChange={(event) => handleChange('push', event.target.checked)}
              className="h-4 w-4 rounded border border-border/70"
            />
            Push
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border/60 bg-background/40 p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Quiet hours</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="quiet-start">
              Start
            </label>
            <input
              id="quiet-start"
              type="time"
              value={values.quietHoursStart ?? ''}
              onChange={(event) => handleChange('quietHoursStart', event.target.value)}
              className="mt-1 w-full rounded-md border border-border/60 bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.quietHoursStart ? (
              <p className="mt-1 text-xs text-destructive">{errors.quietHoursStart}</p>
            ) : null}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="quiet-end">
              End
            </label>
            <input
              id="quiet-end"
              type="time"
              value={values.quietHoursEnd ?? ''}
              onChange={(event) => handleChange('quietHoursEnd', event.target.value)}
              className="mt-1 w-full rounded-md border border-border/60 bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.quietHoursEnd ? (
              <p className="mt-1 text-xs text-destructive">{errors.quietHoursEnd}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border/60 bg-background/40 p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Best contact time</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="best-time">
              Preferred time
            </label>
            <input
              id="best-time"
              type="time"
              value={values.bestContactTime ?? ''}
              onChange={(event) => handleChange('bestContactTime', event.target.value)}
              className="mt-1 w-full rounded-md border border-border/60 bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.bestContactTime ? (
              <p className="mt-1 text-xs text-destructive">{errors.bestContactTime}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={savePreferences.isPending}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-70"
        >
          {savePreferences.isPending ? 'Saving…' : 'Save preferences'}
        </button>
      </div>
    </form>
  );
}

function mapToForm(preferences: TenantPreferences): PreferencesFormValues {
  return {
    email: preferences.email,
    sms: preferences.sms,
    push: preferences.push,
    quietHoursStart: preferences.quietHoursStart ?? '',
    quietHoursEnd: preferences.quietHoursEnd ?? '',
    bestContactTime: preferences.bestContactTime ?? '',
  };
}

