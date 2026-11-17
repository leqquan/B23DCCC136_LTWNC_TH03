import { beforeEach, describe, expect, it } from 'vitest';
import { generateBooks, generateLoans } from '@/data/books';
import { db } from './db';
import { cancelLoan, listLoans, submitLoan } from './loans';

describe('nghiệp vụ mượn sách loans.ts', () => {
  beforeEach(() => {
    db.books = generateBooks(24);
    db.loans = generateLoans(37);
    db.nextLoanId = 38;
  });

  it('listLoans phân trang 10/10/7 cho sv01, hiện 37 cho admin và kẹp trang vượt giới hạn', () => {
    const p1 = listLoans({ email: 'sv01@ptit.edu.vn', role: 'student' }, '', 1);
    const p2 = listLoans({ email: 'sv01@ptit.edu.vn', role: 'student' }, '', 2);
    const p3 = listLoans({ email: 'sv01@ptit.edu.vn', role: 'student' }, '', 3);
    expect(p1.total).toBe(27);
    expect(p1.totalPages).toBe(3);
    expect(p1.items).toHaveLength(10);
    expect(p2.items).toHaveLength(10);
    expect(p3.items).toHaveLength(7);

    const adminAll = listLoans(
      { email: 'admin@ptit.edu.vn', role: 'admin' },
      '',
      1
    );
    expect(adminAll.total).toBe(37);
    expect(adminAll.totalPages).toBe(4);

    const clampedHigh = listLoans(
      { email: 'sv01@ptit.edu.vn', role: 'student' },
      '',
      99
    );
    expect(clampedHigh.page).toBe(3);

    const clampedLow = listLoans(
      { email: 'sv01@ptit.edu.vn', role: 'student' },
      '',
      -5
    );
    expect(clampedLow.page).toBe(1);
  });

  it('submitLoan báo hết bản với sách id 6 vào ngày 2026-12-02', () => {
    const result = submitLoan('sv01@ptit.edu.vn', {
      bookId: 6,
      pickupDate: '2026-12-02',
      term: 14,
      quantity: 1,
      reason: 'Mượn học an toàn thông tin',
    });
    expect(result).toEqual({
      ok: false,
      message: 'Sách đã hết bản vào ngày này',
    });
  });

  it('tạo yêu cầu thành công và cancelLoan trả đúng 3 mã forbidden, ok, not-found', () => {
    const created = submitLoan('sv01@ptit.edu.vn', {
      bookId: 11,
      pickupDate: '2026-12-03',
      term: 14,
      quantity: 1,
      reason: 'Mượn học thiết kế cơ sở dữ liệu',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    expect(cancelLoan('sv02@ptit.edu.vn', created.loan.id)).toBe('forbidden');
    expect(cancelLoan('sv01@ptit.edu.vn', created.loan.id)).toBe('ok');
    expect(cancelLoan('sv01@ptit.edu.vn', created.loan.id)).toBe('not-found');
  });
});

