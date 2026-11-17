import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { generateBooks } from '@/data/books';
import type { LoanFormState } from '@/lib/loan-validate';
import LoanForm from './LoanForm';

const books = generateBooks(24);

describe('biểu mẫu đăng ký mượn sách LoanForm', () => {
  it('hiển thị lỗi từ action ngay dưới đúng các ô nhập liệu', async () => {
    const user = userEvent.setup();
    const mockAction = vi.fn<
      (prev: LoanFormState, formData: FormData) => Promise<LoanFormState>
    >(async () => ({
      errors: {
        bookId: 'Hãy chọn sách',
        pickupDate: 'Hãy chọn ngày',
        term: 'Hãy chọn thời hạn',
        reason: 'Lý do tối thiểu 10 ký tự',
      },
      values: {},
    }));

    render(<LoanForm books={books} action={mockAction} />);

    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.map((el) => el.textContent)).toEqual([
      'Hãy chọn sách',
      'Hãy chọn ngày',
      'Hãy chọn thời hạn',
      'Lý do tối thiểu 10 ký tự',
    ]);
  });

  it('gọi action 1 lần với FormData chứa đúng bookId, term, quantity khi điền hợp lệ', async () => {
    const user = userEvent.setup();
    const mockAction = vi.fn<
      (prev: LoanFormState, formData: FormData) => Promise<LoanFormState>
    >(async () => ({
      errors: {},
      values: {},
      message: 'Đã gửi yêu cầu, chờ duyệt',
      ok: true,
    }));

    render(<LoanForm books={books} action={mockAction} />);

    await user.selectOptions(screen.getByLabelText('Sách'), '3');
    await user.type(screen.getByLabelText('Ngày lấy sách'), '2026-12-20');
    await user.selectOptions(screen.getByLabelText('Thời hạn mượn'), '14');
    const qtyInput = screen.getByLabelText('Số quyển');
    await user.clear(qtyInput);
    await user.type(qtyInput, '2');
    await user.type(
      screen.getByLabelText('Lý do mượn'),
      'Mượn phục vụ nghiên cứu học phần'
    );

    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    expect(mockAction).toHaveBeenCalledTimes(1);
    const submittedData = mockAction.mock.calls[0][1];
    expect(submittedData.get('bookId')).toBe('3');
    expect(submittedData.get('term')).toBe('14');
    expect(submittedData.get('quantity')).toBe('2');
  });

  it('hiển thị thông báo hết bản và giữ nguyên lý do đã nhập', async () => {
    const user = userEvent.setup();
    const mockAction = vi.fn<
      (prev: LoanFormState, formData: FormData) => Promise<LoanFormState>
    >(async (_prev, formData) => ({
      errors: {},
      values: {
        bookId: String(formData.get('bookId') ?? ''),
        pickupDate: String(formData.get('pickupDate') ?? ''),
        term: String(formData.get('term') ?? ''),
        quantity: String(formData.get('quantity') ?? ''),
        reason: String(formData.get('reason') ?? ''),
      },
      message: 'Sách đã hết bản vào ngày này',
      ok: false,
    }));

    render(<LoanForm books={books} action={mockAction} />);

    await user.selectOptions(screen.getByLabelText('Sách'), '6');
    await user.type(screen.getByLabelText('Ngày lấy sách'), '2026-12-02');
    await user.selectOptions(screen.getByLabelText('Thời hạn mượn'), '14');
    await user.type(
      screen.getByLabelText('Lý do mượn'),
      'Cần tài liệu ôn thi cuối kỳ'
    );

    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    expect(
      await screen.findByText('Sách đã hết bản vào ngày này')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Lý do mượn')).toHaveValue(
      'Cần tài liệu ôn thi cuối kỳ'
    );
  });

  it('chọn sẵn sách tương ứng khi có defaultBookId', () => {
    const mockAction = vi.fn<
      (prev: LoanFormState, formData: FormData) => Promise<LoanFormState>
    >(async () => ({ errors: {}, values: {} }));

    render(<LoanForm books={books} defaultBookId={6} action={mockAction} />);

    expect(screen.getByLabelText('Sách')).toHaveValue('6');
  });
});

