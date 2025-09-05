"use client";

import { useState, useEffect, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationSettings,
  updateNotificationSettings,
  NotificationSettings,
} from "../lib/api";
import { z } from "zod";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

const formSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  inApp: z.boolean(),
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
  critical: z.boolean(),
  normal: z.boolean(),
});

export default function NotificationPrefsForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data } = useQuery<NotificationSettings>({
    queryKey: ["notificationSettings"],
    queryFn: getNotificationSettings,
  });

  const mutation = useMutation({
    mutationFn: (payload: NotificationSettings) =>
      updateNotificationSettings(payload),
    onSuccess: () => {
      toast({ title: "Settings saved" });
      queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
      setError(null);
    },
    onError: (err: any) => {
      const message =
        err instanceof Error ? err.message : "Failed to save settings";
      setError(message);
      toast({ title: "Failed to save settings", description: message });
    },
  });

  const [values, setValues] = useState<NotificationSettings>({
    email: false,
    sms: false,
    inApp: false,
    quietHoursStart: "",
    quietHoursEnd: "",
    critical: false,
    normal: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setValues({
        email: !!data.email,
        sms: !!data.sms,
        inApp: !!data.inApp,
        quietHoursStart: data.quietHoursStart || "",
        quietHoursEnd: data.quietHoursEnd || "",
        critical: !!data.critical,
        normal: !!data.normal,
      });
    }
  }, [data]);

  const handleChange = <K extends keyof typeof values>(key: K, value: typeof values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const parsed = formSchema.parse(values) as NotificationSettings;
      mutation.mutate(parsed);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.errors.map((e) => e.message).join(", ");
        setError(msg);
        toast({ title: "Validation error", description: msg });
      }
    }
  };

  const previewMessages: string[] = [];
  if (values.email) {
    if (values.critical) previewMessages.push("Email - Critical: This is a critical email notification.");
    if (values.normal) previewMessages.push("Email - Normal: This is a normal email notification.");
  }
  if (values.sms) {
    if (values.critical) previewMessages.push("SMS - Critical: This is a critical SMS notification.");
    if (values.normal) previewMessages.push("SMS - Normal: This is a normal SMS notification.");
  }
  if (values.inApp) {
    if (values.critical) previewMessages.push("In-app - Critical: This is a critical in-app notification.");
    if (values.normal) previewMessages.push("In-app - Normal: This is a normal in-app notification.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <label className="font-medium">Email</label>
        <Switch
          checked={values.email}
          onCheckedChange={(v) => handleChange("email", v)}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="font-medium">SMS</label>
        <Switch
          checked={values.sms}
          onCheckedChange={(v) => handleChange("sms", v)}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="font-medium">In-app</label>
        <Switch
          checked={values.inApp}
          onCheckedChange={(v) => handleChange("inApp", v)}
        />
      </div>

      <div className="space-y-2">
        <label className="font-medium">Quiet Hours</label>
        <div className="flex gap-2">
          <Input
            type="time"
            value={values.quietHoursStart}
            onChange={(e) => handleChange("quietHoursStart", e.target.value)}
          />
          <Input
            type="time"
            value={values.quietHoursEnd}
            onChange={(e) => handleChange("quietHoursEnd", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-medium">Severity</label>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={values.critical}
              onCheckedChange={(v) => handleChange("critical", v)}
            />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={values.normal}
              onCheckedChange={(v) => handleChange("normal", v)}
            />
            <span>Normal</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-medium">Preview</label>
        <div className="p-2 border rounded min-h-[4rem]">
          {previewMessages.length ? (
            <ul className="list-disc ml-4 space-y-1">
              {previewMessages.map((msg, i) => (
                <li key={i} className="text-sm">
                  {msg}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              Toggle channels and severities to see preview messages.
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={mutation.isPending}>
        Save
      </Button>
    </form>
  );
}
