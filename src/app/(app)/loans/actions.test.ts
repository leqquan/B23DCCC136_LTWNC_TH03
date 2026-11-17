import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateBooks, generateLoans } from '@/data/books';
import { db } from '@/lib/db';
import type { LoanFormState } from '@/lib/loan-validate';

const { mockAuth, mockRevalidatePath } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock('@/auth', () => ({
  auth: mockAuth,
}));

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}));

import { createLoanAction } from './actions';

const emptyState: LoanFormState = { errors: {}, values: {} };

describe('Server Action createLoanAction', () => {
  beforeEach(() => {
    db.books = generateBooks(24);
    db.loans = generateLoans(37);
    db.nextLoanId = 38;
    mockAuth.mockReset();
    mockRevalidatePath.mockReset();
  });

  it('student gửi yêu cầu hợp lệ thì thành công và gọi revalidatePath', async () => {
    mockAuth.mockResolvedValue({
      user: {
        name: 'Nguyễn Văn An',
        email: 'sv01@ptit.edu.vn',
        role: 'student',
      },
    });

    const fd = new FormData();
    fd.set('bookId', '11');
    fd.set('pickupDate', '2099-12-03');
    fd.set('term', '14');
    fd.set('quantity', '1');
    fd.set('reason', 'Mượn học môn cơ sở dữ liệu');

    const result = await createLoanAction(emptyState, fd);
    expect(result).toEqual({
      errors: {},
      values: {},
      message: 'Đã gửi yêu cầu, chờ duyệt',
      ok: true,
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/loans');
  });

  it('admin gửi yêu cầu mượn thì ném lỗi Không có quyền', async () => {
    mockAuth.mockResolvedValue({
      user: {
        name: 'Quản trị Lab',
        email: 'admin@ptit.edu.vn',
        role: 'admin',
      },
    });

    const fd = new FormData();
    fd.set('bookId', '11');
    fd.set('pickupDate', '2099-12-03');
    fd.set('term', '14');
    fd.set('quantity', '1');
    fd.set('reason', 'Thử gửi dưới quyền admin');

    await expect(createLoanAction(emptyState, fd)).rejects.toThrow(
      'Không có quyền'
    );
  });
});

