import { describe, it, expect, vi } from 'vitest';
import { exportCSV, toCSV } from './export';

// toCSV test

describe('toCSV', () => {
  it('formats rows with quotes and escapes', () => {
    const rows = [
      ['a', 'b'],
      ['1', '2,3'],
      ['"4"', '5']
    ];
    const csv = toCSV(rows);
    expect(csv).toBe('"a","b"\n"1","2,3"\n"""4""","5"');
  });
});

// exportCSV test ensures it triggers download

describe('exportCSV', () => {
  it('creates a link to download', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    const click = vi.fn();
    const a = { click } as any;
    vi.spyOn(document, 'createElement').mockReturnValue(a);
    vi.spyOn(URL, 'revokeObjectURL');
    exportCSV('file.csv', [['a']]);
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });
});
