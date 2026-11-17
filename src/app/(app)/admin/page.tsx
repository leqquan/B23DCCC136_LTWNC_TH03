import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { formatDate, TERM_LABEL } from '@/lib/format';
import { can } from '@/lib/permissions';
import { reviewLoan } from './actions';

export const metadata: Metadata = {
  title: 'Quản trị duyệt mượn',
  robots: { index: false },
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=%2Fadmin');
  }
  if (!can(session.user.role, 'loan:review')) {
    redirect('/forbidden');
  }

  const pendingLoans = db.loans.filter((loan) => loan.status === 'pending');
  const approvedCount = db.loans.filter((loan) => loan.status === 'approved').length;
  const rejectedCount = db.loans.filter((loan) => loan.status === 'rejected').length;
  const bookMap = new Map(db.books.map((book) => [book.id, book.title]));

  return (
    <section>
      <h1>Duyệt yêu cầu mượn</h1>
      <p>
        Chờ duyệt: {pendingLoans.length} | Đã duyệt: {approvedCount} | Từ chối:{' '}
        {rejectedCount}
      </p>

      {pendingLoans.length === 0 ? (
        <p>Không có yêu cầu nào đang chờ duyệt</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tên sách</th>
              <th>Ngày lấy</th>
              <th>Thời hạn</th>
              <th>Người mượn</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pendingLoans.map((loan) => (
              <tr key={loan.id}>
                <td>{bookMap.get(loan.bookId) ?? `Sách #${loan.bookId}`}</td>
                <td>{formatDate(loan.pickupDate)}</td>
                <td>{TERM_LABEL[loan.term]}</td>
                <td>{loan.userEmail}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <form
                      className="inline-form"
                      action={reviewLoan.bind(null, loan.id, 'approved')}
                    >
                      <button type="submit">Duyệt</button>
                    </form>
                    <form
                      className="inline-form"
                      action={reviewLoan.bind(null, loan.id, 'rejected')}
                    >
                      <button type="submit">Từ chối</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
