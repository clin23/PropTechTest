import { describe, it, expect } from 'vitest';
import { bucketReminders } from './reminders';

describe('bucketReminders', () => {
  it('buckets reminders by date', () => {
    const now = new Date('2024-05-15');
    const reminders = [
      { id: 'o', dueDate: '2024-05-01' },
      { id: 'm', dueDate: '2024-05-20' },
      { id: 'l', dueDate: '2024-06-01' },
    ];
    const buckets = bucketReminders(reminders, now);
    expect(buckets.overdue.map(r=>r.id)).toEqual(['o']);
    expect(buckets.thisMonth.map(r=>r.id)).toEqual(['m']);
    expect(buckets.later.map(r=>r.id)).toEqual(['l']);
  });
});
