import { describe, expect, it } from 'vitest';
import { can } from './permissions';

describe('ma trận phân quyền can()', () => {
  it('khách chưa đăng nhập chỉ có quyền xem sách', () => {
    expect(can(undefined, 'book:view')).toBe(true);
    expect(can(undefined, 'loan:create')).toBe(false);
    expect(can(undefined, 'loan:view-own')).toBe(false);
    expect(can(undefined, 'loan:view-all')).toBe(false);
    expect(can(undefined, 'loan:review')).toBe(false);
  });

  it('sinh viên gửi và xem được yêu cầu của mình nhưng không duyệt hoặc xem tất cả', () => {
    expect(can('student', 'book:view')).toBe(true);
    expect(can('student', 'loan:create')).toBe(true);
    expect(can('student', 'loan:view-own')).toBe(true);
    expect(can('student', 'loan:view-all')).toBe(false);
    expect(can('student', 'loan:review')).toBe(false);
  });

  it('admin duyệt và xem toàn bộ yêu cầu nhưng không gửi yêu cầu mượn', () => {
    expect(can('admin', 'book:view')).toBe(true);
    expect(can('admin', 'loan:view-all')).toBe(true);
    expect(can('admin', 'loan:review')).toBe(true);
    expect(can('admin', 'loan:create')).toBe(false);
    expect(can('admin', 'loan:view-own')).toBe(false);
  });
});

