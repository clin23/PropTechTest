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
    },
  });

  const [values, setValues] = useState<NotificationSettings>({
    email: false,
    sms: false,
    inApp: false,
    quietHoursStart: "",
    quietHoursEnd: "",
  });

  useEffect(() => {
    if (data) {
      setValues({
        email: !!data.email,
        sms: !!data.sms,
        inApp: !!data.inApp,
        quietHoursStart: data.quietHoursStart || "",
        quietHoursEnd: data.quietHoursEnd || "",
      });
    }
  }, [data]);

  const handleChange = <K extends keyof typeof values>(key: K, value: typeof values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    try {
      const parsed = formSchema.parse(values) as NotificationSettings;
      mutation.mutate(parsed);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Validation error", description: err.errors.map((e) => e.message).join(", ") });
      }
    }
  };

  const preview = (channel: string) => {
    toast({ title: `${channel} preview`, description: `This is a sample ${channel.toLowerCase()} notification.` });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <label className="font-medium">Email</label>
        <div className="flex items-center gap-2">
          <Switch
            checked={values.email}
            onCheckedChange={(v) => handleChange("email", v)}
          />
          <Button type="button" onClick={() => preview("Email")}>
            Preview
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="font-medium">SMS</label>
        <div className="flex items-center gap-2">
          <Switch
            checked={values.sms}
            onCheckedChange={(v) => handleChange("sms", v)}
          />
          <Button type="button" onClick={() => preview("SMS")}>
            Preview
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="font-medium">In-app</label>
        <div className="flex items-center gap-2">
          <Switch
            checked={values.inApp}
            onCheckedChange={(v) => handleChange("inApp", v)}
          />
          <Button type="button" onClick={() => preview("In-app")}>
            Preview
          </Button>
        </div>
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

      <Button type="submit" disabled={mutation.isPending}>
        Save
      </Button>
    </form>
  );
}
