export interface ReminderItem {
  id: string;
  dueDate: string;
}

export function bucketReminders<T extends ReminderItem>(
  reminders: T[],
  now: Date = new Date(),
) {
  const month = now.getMonth();
  const year = now.getFullYear();
  const overdue = reminders.filter((r) => new Date(r.dueDate) < now);
  const thisMonth = reminders.filter((r) => {
    const d = new Date(r.dueDate);
    return d >= now && d.getMonth() === month && d.getFullYear() === year;
  });
  const later = reminders.filter((r) => {
    const d = new Date(r.dueDate);
    return d > now && (d.getMonth() !== month || d.getFullYear() !== year);
  });
  return { overdue, thisMonth, later };
}
