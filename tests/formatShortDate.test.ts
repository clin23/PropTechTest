import { describe, expect, it } from 'vitest';
import { formatShortDate } from '../lib/format';

describe('formatShortDate', () => {
  it('formats ISO dates into DD/MM/YY', () => {
    expect(formatShortDate('2024-06-09')).toBe('09/06/24');
  });

  it('formats slash-delimited dates', () => {
    expect(formatShortDate('2024/1/5')).toBe('05/01/24');
  });

  it('formats ISO date-times without timezone drift', () => {
    expect(formatShortDate('2024-06-09T12:30:00Z')).toBe('09/06/24');
  });

  it('formats Date instances', () => {
    expect(formatShortDate(new Date('2024-06-09T00:00:00Z'))).toBe('09/06/24');
  });

  it('returns an em dash for invalid input', () => {
    expect(formatShortDate('not-a-date')).toBe('—');
    expect(formatShortDate(undefined)).toBe('—');
    expect(formatShortDate(null)).toBe('—');
  });
});
