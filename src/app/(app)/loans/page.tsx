import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import LoanForm from '@/components/LoanForm';
import LoansTable from '@/components/LoansTable';
import { db } from '@/lib/db';
import { STATUS_LABEL } from '@/lib/format';
import { listLoans, parseStatus } from '@/lib/loans';
import { can } from '@/lib/permissions';
import { cancelLoanAction, createLoanAction } from './actions';

export const metadata: Metadata = {
  title: 'Sách đã mượn',
  robots: { index: false },
};

interface LoansPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
    book?: string;
  }>;
}

export default async function LoansPage({ searchParams }: LoansPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=%2Floans');
  }

  const role = session.user.role;
  const email = session.user.email ?? '';

  if (!can(role, 'loan:view-own') && !can(role, 'loan:view-all')) {
    redirect('/forbidden');
  }

  const params = await searchParams;
  const status = parseStatus(params.status);
  const rawPage = Number(params.page ?? '1');
  const result = listLoans({ email, role }, status, rawPage);

  const requestedBookId = params.book ? Number(params.book) : NaN;
  const defaultBookId = db.books.some((b) => b.id === requestedBookId)
    ? requestedBookId
    : undefined;

  const canCreate = can(role, 'loan:create');
  const pageHref = (targetPage: number): string =>
    `/loans?status=${encodeURIComponent(status)}&page=${targetPage}`;

  return (
    <section>
      <h1>Sách đã mượn</h1>

      {canCreate ? (
        <LoanForm
          books={db.books}
          defaultBookId={defaultBookId}
          action={createLoanAction}
        />
      ) : null}

      <form method="GET" action="/loans">
        <div>
          <label htmlFor="status">Trạng thái</label>
          <select id="status" name="status" defaultValue={status} key={status}>
            <option value="">Tất cả</option>
            <option value="pending">{STATUS_LABEL.pending}</option>
            <option value="approved">{STATUS_LABEL.approved}</option>
            <option value="rejected">{STATUS_LABEL.rejected}</option>
          </select>
        </div>
        <button type="submit">Lọc</button>
      </form>

      <LoansTable
        items={result.items}
        canCancel={canCreate}
        userEmail={email}
        cancelAction={cancelLoanAction}
      />

      <nav className="pagination" aria-label="Phân trang">
        {result.page > 1 ? (
          <Link href={pageHref(result.page - 1)}>Trước</Link>
        ) : (
          <span>Trước</span>
        )}

        <span>
          Trang {result.page}/{result.totalPages}
        </span>

        {result.page < result.totalPages ? (
          <Link href={pageHref(result.page + 1)}>Sau</Link>
        ) : (
          <span>Sau</span>
        )}
      </nav>
    </section>
  );
}
