import { TERMS } from '@/data/books';
import type { Book, Term } from '@/types';

export interface LoanInput {
  bookId: string;
  pickupDate: string;
  term: string;
  quantity: string;
  reason: string;
}

export interface LoanData {
  bookId: number;
  pickupDate: string;
  term: 7 | 14 | 30;
  quantity: number;
  reason: string;
}

export type LoanErrors = Partial<Record<keyof LoanInput, string>>;

export interface LoanFormState {
  errors: LoanErrors; // lỗi từng ô
  values: Partial<LoanInput>; // giá trị đã nhập, để hiện lại khi có lỗi
  message?: string; // thông báo chung (thành công hoặc lỗi từ server)
  ok?: boolean; // true nếu message là thông báo thành công
}

export function today(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toLoanInput(
  raw: FormData | Record<string, unknown>
): LoanInput {
  const read = (key: keyof LoanInput): string => {
    const val = raw instanceof FormData ? raw.get(key) : raw[key];
    return typeof val === 'string' ? val : '';
  };

  return {
    bookId: read('bookId'),
    pickupDate: read('pickupDate'),
    term: read('term'),
    quantity: read('quantity'),
    reason: read('reason'),
  };
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [yStr, mStr, dStr] = value.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() + 1 === m &&
    date.getUTCDate() === d
  );
}

export function validateLoan(input: LoanInput, books: Book[]): LoanErrors {
  const errors: LoanErrors = {};

  const bookIdRaw = input.bookId.trim();
  const bookIdNum = /^\d+$/.test(bookIdRaw) ? Number(bookIdRaw) : NaN;
  const selectedBook = books.find((b) => b.id === bookIdNum);
  if (!selectedBook) {
    errors.bookId = 'Hãy chọn sách';
  }

  const pickupDate = input.pickupDate.trim();
  if (!pickupDate || !isValidIsoDate(pickupDate)) {
    errors.pickupDate = 'Hãy chọn ngày';
  } else if (pickupDate < today()) {
    errors.pickupDate = 'Ngày lấy sách không được ở quá khứ';
  }

  const termRaw = input.term.trim();
  const termNum = /^\d+$/.test(termRaw) ? Number(termRaw) : NaN;
  if (!TERMS.includes(termNum as Term)) {
    errors.term = 'Hãy chọn thời hạn';
  }

  const qtyRaw = input.quantity.trim();
  const qtyNum = /^\d+$/.test(qtyRaw) ? Number(qtyRaw) : NaN;
  if (!Number.isInteger(qtyNum) || qtyNum < 1) {
    errors.quantity = 'Số quyển phải từ 1 trở lên';
  } else if (selectedBook && qtyNum > selectedBook.copies) {
    errors.quantity = `Vượt số bản của sách (${selectedBook.copies} bản)`;
  }

  if (input.reason.trim().length < 10) {
    errors.reason = 'Lý do tối thiểu 10 ký tự';
  }

  return errors;
}

export function toLoanData(input: LoanInput): LoanData {
  return {
    bookId: Number(input.bookId.trim()),
    pickupDate: input.pickupDate.trim(),
    term: Number(input.term.trim()) as Term,
    quantity: Number(input.quantity.trim()),
    reason: input.reason.trim(),
  };
}
