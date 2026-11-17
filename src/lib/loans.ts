import { db } from './db';
import type { LoanData } from './loan-validate';
import { can } from './permissions';
import type { Loan, LoanStatus, Role } from '../types';

export interface LoanViewer {
  email: string;
  role: Role;
}

export interface LoanListItem extends Loan {
  bookTitle: string;
}

export interface LoanListResult {
  items: LoanListItem[];
  total: number;
  page: number;
  totalPages: number;
}

const PAGE_SIZE = 10;

export function parseStatus(v?: string): LoanStatus | '' {
  if (v === 'pending' || v === 'approved' || v === 'rejected') {
    return v;
  }
  return '';
}

export function listLoans(
  viewer: LoanViewer,
  status: string,
  page: number
): LoanListResult {
  const canViewAll = can(viewer.role, 'loan:view-all');
  const canViewOwn = can(viewer.role, 'loan:view-own');

  let scoped: Loan[];
  if (canViewAll) {
    scoped = db.loans;
  } else if (canViewOwn) {
    scoped = db.loans.filter((loan) => loan.userEmail === viewer.email);
  } else {
    scoped = [];
  }

  const parsedStatus = parseStatus(status);
  const filtered = parsedStatus
    ? scoped.filter((loan) => loan.status === parsedStatus)
    : scoped;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Number.isFinite(page) ? Math.trunc(page) : 1;
  const clampedPage = Math.min(Math.max(1, safePage), totalPages);

  const bookMap = new Map(db.books.map((book) => [book.id, book.title]));
  const start = (clampedPage - 1) * PAGE_SIZE;
  const items: LoanListItem[] = filtered
    .slice(start, start + PAGE_SIZE)
    .map((loan) => ({
      ...loan,
      bookTitle: bookMap.get(loan.bookId) ?? `Sách #${loan.bookId}`,
    }));

  return {
    items,
    total,
    page: clampedPage,
    totalPages,
  };
}

export type SubmitLoanResult =
  | { ok: true; loan: Loan }
  | { ok: false; message: string };

export function submitLoan(email: string, data: LoanData): SubmitLoanResult {
  const book = db.books.find((item) => item.id === data.bookId);
  if (!book) {
    return { ok: false, message: 'Sách không tồn tại' };
  }

  const bookedCopies = db.loans
    .filter(
      (loan) =>
        loan.bookId === data.bookId &&
        loan.pickupDate === data.pickupDate &&
        loan.status !== 'rejected'
    )
    .reduce((sum, loan) => sum + loan.quantity, 0);

  if (bookedCopies + data.quantity > book.copies) {
    return { ok: false, message: 'Sách đã hết bản vào ngày này' };
  }

  const loan: Loan = {
    id: db.nextLoanId++,
    bookId: data.bookId,
    userEmail: email,
    pickupDate: data.pickupDate,
    term: data.term,
    quantity: data.quantity,
    reason: data.reason,
    status: 'pending',
  };

  db.loans.unshift(loan);
  return { ok: true, loan };
}

export type CancelLoanResult = 'not-found' | 'forbidden' | 'not-pending' | 'ok';

export function cancelLoan(email: string, id: number): CancelLoanResult {
  const index = db.loans.findIndex((item) => item.id === id);
  if (index === -1) {
    return 'not-found';
  }

  const loan = db.loans[index];
  if (loan.userEmail !== email) {
    return 'forbidden';
  }

  if (loan.status !== 'pending') {
    return 'not-pending';
  }

  db.loans.splice(index, 1);
  return 'ok';
}
