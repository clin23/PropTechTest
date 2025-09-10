import { describe, it, expect } from 'vitest';
import { urlState } from './urlState';
import { AnalyticsState } from './schemas';

describe('urlState', () => {
  it('round trips state', () => {
    const state = AnalyticsState.parse({ from: '2024-01-01', to: '2024-02-01' });
    const params = urlState.serialize(state);
    const parsed = urlState.parse(params);
    expect(parsed).toEqual(state);
  });
});
