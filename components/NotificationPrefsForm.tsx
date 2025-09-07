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

const channelSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  inApp: z.boolean(),
});

const formSchema = z.object({
  arrears: channelSchema,
  maintenance: channelSchema,
  compliance: channelSchema,
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
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
    arrears: { email: false, sms: false, inApp: false },
    maintenance: { email: false, sms: false, inApp: false },
    compliance: { email: false, sms: false, inApp: false },
    quietHoursStart: "",
    quietHoursEnd: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setValues({
        arrears: {
          email: !!data.arrears?.email,
          sms: !!data.arrears?.sms,
          inApp: !!data.arrears?.inApp,
        },
        maintenance: {
          email: !!data.maintenance?.email,
          sms: !!data.maintenance?.sms,
          inApp: !!data.maintenance?.inApp,
        },
        compliance: {
          email: !!data.compliance?.email,
          sms: !!data.compliance?.sms,
          inApp: !!data.compliance?.inApp,
        },
        quietHoursStart: data.quietHoursStart || "",
        quietHoursEnd: data.quietHoursEnd || "",
      });
    }
  }, [data]);

  const handleToggle = (
    category: "arrears" | "maintenance" | "compliance",
    channel: "email" | "sms" | "inApp",
    value: boolean,
  ) => {
    setValues((v) => ({
      ...v,
      [category]: { ...v[category], [channel]: value },
    }));
  };

  const handleFieldChange = <K extends "quietHoursStart" | "quietHoursEnd">(
    key: K,
    value: string,
  ) => {
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

  const categoryLabels = {
    arrears: "Arrears",
    maintenance: "Maintenance",
    compliance: "Compliance",
  } as const;
  const channelLabels = { email: "Email", sms: "SMS", inApp: "In-app" } as const;

  const isQuiet = (() => {
    if (!values.quietHoursStart || !values.quietHoursEnd) return false;
    const [sh, sm] = values.quietHoursStart.split(":").map(Number);
    const [eh, em] = values.quietHoursEnd.split(":").map(Number);
    const now = new Date();
    const start = new Date();
    start.setHours(sh, sm, 0, 0);
    const end = new Date();
    end.setHours(eh, em, 0, 0);
    if (start < end) {
      return now >= start && now <= end;
    }
    return now >= start || now <= end;
  })();

  const previewMessages: string[] = [];
  if (!isQuiet) {
    (Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).forEach(
      (cat) => {
        (Object.keys(channelLabels) as Array<keyof typeof channelLabels>).forEach(
          (ch) => {
            if (values[cat][ch]) {
              previewMessages.push(
                `${channelLabels[ch]} - ${categoryLabels[cat]} notification.`,
              );
            }
          },
        );
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="space-y-2">
        <label className="font-medium">Notification Channels</label>
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="p-2"></th>
              {(Object.keys(channelLabels) as Array<
                keyof typeof channelLabels
              >).map((ch) => (
                <th key={ch} className="p-2">{channelLabels[ch]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(Object.keys(categoryLabels) as Array<
              keyof typeof categoryLabels
            >).map((cat) => (
              <tr key={cat} className="border-t">
                <td className="p-2">{categoryLabels[cat]}</td>
                {(Object.keys(channelLabels) as Array<
                  keyof typeof channelLabels
                >).map((ch) => (
                  <td key={ch} className="p-2 text-center">
                    <Switch
                      checked={values[cat][ch]}
                      onCheckedChange={(v) => handleToggle(cat, ch, v)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <label className="font-medium">Quiet Hours</label>
        <div className="flex gap-2">
          <Input
            type="time"
            value={values.quietHoursStart}
            onChange={(e) => handleFieldChange("quietHoursStart", e.target.value)}
          />
          <Input
            type="time"
            value={values.quietHoursEnd}
            onChange={(e) => handleFieldChange("quietHoursEnd", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-medium">Preview</label>
        <div className="p-2 border rounded min-h-[4rem]">
          {isQuiet ? (
            <p className="text-sm text-gray-500">
              Quiet hours active. Notifications are suppressed.
            </p>
          ) : previewMessages.length ? (
            <ul className="list-disc ml-4 space-y-1">
              {previewMessages.map((msg, i) => (
                <li key={i} className="text-sm">{msg}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              Toggle channels to see preview messages.
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
