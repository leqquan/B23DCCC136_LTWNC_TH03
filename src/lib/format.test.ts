import { describe, expect, it } from 'vitest';
import { formatDate } from './format';

describe('định dạng ngày tháng formatDate()', () => {
  it('chuyển ngày ISO YYYY-MM-DD sang dd/mm/yyyy', () => {
    expect(formatDate('2026-12-02')).toBe('02/12/2026');
  });
});

