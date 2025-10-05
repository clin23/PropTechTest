import { describe, it, expect } from 'vitest';
import { mapExpenseCategory } from '../lib/expenses/categories';

describe('mapExpenseCategory', () => {
  it('groups HVAC expenses under maintenance', () => {
    expect(mapExpenseCategory('HVAC maintenance')).toBe('Maintenance');
    expect(mapExpenseCategory('Annual HVAC Service')).toBe('Maintenance');
  });

  it('detects utilities related expenses', () => {
    expect(mapExpenseCategory('Water utility')).toBe('Utilities');
    expect(mapExpenseCategory('Electric power bill')).toBe('Utilities');
  });

  it('falls back to other when no keywords match', () => {
    expect(mapExpenseCategory('Software subscription')).toBe('Other');
  });
});
