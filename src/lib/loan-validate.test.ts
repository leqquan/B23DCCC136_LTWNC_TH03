import { describe, expect, it } from 'vitest';
import { generateBooks } from '@/data/books';
import {
  toLoanData,
  toLoanInput,
  today,
  validateLoan,
  type LoanInput,
} from './loan-validate';

const books = generateBooks(24);

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const validInput = (): LoanInput => ({
  bookId: '3',
  pickupDate: offsetDate(1),
  term: '14',
  quantity: '2',
  reason: 'Mượn sách phục vụ bài tập lớn',
});

describe('kiểm tra dữ liệu mượn sách loan-validate', () => {
  it('validateLoan trả về object rỗng khi dữ liệu hợp lệ', () => {
    expect(validateLoan(validInput(), books)).toEqual({});
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('validateLoan báo đủ lỗi khi gửi form trống', () => {
    const errors = validateLoan(
      { bookId: '', pickupDate: '', term: '', quantity: '', reason: '' },
      books
    );
    expect(errors).toEqual({
      bookId: 'Hãy chọn sách',
      pickupDate: 'Hãy chọn ngày',
      term: 'Hãy chọn thời hạn',
      quantity: 'Số quyển phải từ 1 trở lên',
      reason: 'Lý do tối thiểu 10 ký tự',
    });
  });

  it('validateLoan báo lỗi khi ngày lấy sách ở quá khứ', () => {
    const errors = validateLoan(
      { ...validInput(), pickupDate: offsetDate(-1) },
      books
    );
    expect(errors.pickupDate).toBe('Ngày lấy sách không được ở quá khứ');
  });

  it('validateLoan báo lỗi khi lý do dưới 10 ký tự hoặc toàn khoảng trắng', () => {
    const shortReason = validateLoan(
      { ...validInput(), reason: 'ngắn' },
      books
    );
    expect(shortReason.reason).toBe('Lý do tối thiểu 10 ký tự');

    const whitespaceOnly = validateLoan(
      { ...validInput(), reason: '               ' },
      books
    );
    expect(whitespaceOnly.reason).toBe('Lý do tối thiểu 10 ký tự');
  });

  it('validateLoan báo lỗi khi số quyển vượt số bản của sách đã chọn', () => {
    const errors = validateLoan(
      { ...validInput(), bookId: '1', quantity: '2' },
      books
    );
    expect(errors.quantity).toBe('Vượt số bản của sách (1 bản)');
  });

  it('validateLoan báo lỗi khi số quyển không phải số nguyên dương', () => {
    expect(
      validateLoan({ ...validInput(), quantity: '0' }, books).quantity
    ).toBe('Số quyển phải từ 1 trở lên');
    expect(
      validateLoan({ ...validInput(), quantity: '-2' }, books).quantity
    ).toBe('Số quyển phải từ 1 trở lên');
    expect(
      validateLoan({ ...validInput(), quantity: '1.5' }, books).quantity
    ).toBe('Số quyển phải từ 1 trở lên');
  });

  it('validateLoan báo lỗi khi thời hạn không thuộc 7, 14, 30', () => {
    const errors = validateLoan({ ...validInput(), term: '10' }, books);
    expect(errors.term).toBe('Hãy chọn thời hạn');
  });

  it('toLoanData ép kiểu số từ chuỗi và trim lý do', () => {
    const data = toLoanData({
      bookId: '3',
      pickupDate: '2026-12-10',
      term: '14',
      quantity: '2',
      reason: '   Mượn sách học môn Web   ',
    });
    expect(data).toEqual({
      bookId: 3,
      pickupDate: '2026-12-10',
      term: 14,
      quantity: 2,
      reason: 'Mượn sách học môn Web',
    });
  });

  it('toLoanInput chuyển FormData hoặc object thiếu trường thành LoanInput', () => {
    const fd = new FormData();
    fd.set('bookId', '6');
    fd.set('term', '7');
    expect(toLoanInput(fd)).toEqual({
      bookId: '6',
      pickupDate: '',
      term: '7',
      quantity: '',
      reason: '',
    });
  });
});

