"use client";

import {
  TASK_COMPLETION_PREFERENCE_OPTIONS,
  useTaskCompletionPreference,
} from "../../../../hooks/useTaskCompletionPreference";

export default function TaskCompletionSettingsPage() {
  const { preference, setPreference } = useTaskCompletionPreference();
  const currentPreference = preference ?? "keep";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Task completion</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose what should happen when you complete a task. Your selection is
          applied automatically every time, and you can change it here whenever
          you need to.
        </p>
      </div>
      <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <label
          htmlFor="task-completion-preference"
          className="block text-sm font-medium text-foreground"
        >
          When I complete a task
        </label>
        <select
          id="task-completion-preference"
          value={currentPreference}
          onChange={(event) =>
            setPreference(event.target.value as typeof currentPreference)
          }
          className="w-full rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          {TASK_COMPLETION_PREFERENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          {TASK_COMPLETION_PREFERENCE_OPTIONS.map((option) => (
            <li key={option.value}>{option.description}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
