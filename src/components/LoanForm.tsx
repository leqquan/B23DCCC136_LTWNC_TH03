'use client';

import { useActionState } from 'react';
import { TERMS } from '@/data/books';
import { TERM_LABEL } from '@/lib/format';
import type { LoanFormState } from '@/lib/loan-validate';
import type { Book } from '@/types';

interface LoanFormProps {
  books: Book[];
  defaultBookId?: number;
  action: (prev: LoanFormState, formData: FormData) => Promise<LoanFormState>;
}

const initialState: LoanFormState = {
  errors: {},
  values: {},
};

export default function LoanForm({
  books,
  defaultBookId,
  action,
}: LoanFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  const selectedBookId =
    state.values.bookId ??
    (state.ok ? '' : defaultBookId !== undefined ? String(defaultBookId) : '');

  const formKey = `${state.ok ?? ''}-${state.message ?? ''}-${JSON.stringify(
    state.values
  )}-${JSON.stringify(state.errors)}`;

  return (
    <form action={formAction} key={formKey} noValidate>
      <h2>Đăng ký mượn sách</h2>

      <div>
        <label htmlFor="bookId">Sách</label>
        <select id="bookId" name="bookId" defaultValue={selectedBookId}>
          <option value="">-- Chọn sách --</option>
          {books.map((book) => (
            <option key={book.id} value={String(book.id)}>
              {book.title} ({book.copies} bản)
            </option>
          ))}
        </select>
        {state.errors.bookId ? (
          <p role="alert">{state.errors.bookId}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="pickupDate">Ngày lấy sách</label>
        <input
          id="pickupDate"
          name="pickupDate"
          type="date"
          defaultValue={state.values.pickupDate ?? ''}
        />
        {state.errors.pickupDate ? (
          <p role="alert">{state.errors.pickupDate}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="term">Thời hạn mượn</label>
        <select id="term" name="term" defaultValue={state.values.term ?? ''}>
          <option value="">-- Chọn thời hạn --</option>
          {TERMS.map((term) => (
            <option key={term} value={String(term)}>
              {TERM_LABEL[term]}
            </option>
          ))}
        </select>
        {state.errors.term ? <p role="alert">{state.errors.term}</p> : null}
      </div>

      <div>
        <label htmlFor="quantity">Số quyển</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          defaultValue={state.values.quantity ?? '1'}
        />
        {state.errors.quantity ? (
          <p role="alert">{state.errors.quantity}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="reason">Lý do mượn</label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          defaultValue={state.values.reason ?? ''}
        />
        {state.errors.reason ? (
          <p role="alert">{state.errors.reason}</p>
        ) : null}
      </div>

      {state.message ? <p role="status">{state.message}</p> : null}

      <button type="submit" disabled={isPending}>
        Gửi yêu cầu
      </button>
    </form>
  );
}
