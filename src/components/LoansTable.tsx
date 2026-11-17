'use client';

import { useOptimistic } from 'react';
import { formatDate, STATUS_LABEL, TERM_LABEL } from '@/lib/format';
import type { LoanListItem } from '@/lib/loans';

interface LoansTableProps {
  items: LoanListItem[];
  canCancel: boolean;
  userEmail: string;
  cancelAction: (id: number) => Promise<void>;
}

export default function LoansTable({
  items,
  canCancel,
  userEmail,
  cancelAction,
}: LoansTableProps) {
  const [optimisticItems, removeOptimistic] = useOptimistic(
    items,
    (state, removedId: number) =>
      state.filter((item) => item.id !== removedId)
  );

  if (optimisticItems.length === 0) {
    return <p>Không có yêu cầu mượn nào</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Tên sách</th>
          <th>Ngày lấy</th>
          <th>Thời hạn</th>
          <th>Số quyển</th>
          <th>Trạng thái</th>
          {canCancel ? <th>Thao tác</th> : null}
        </tr>
      </thead>
      <tbody>
        {optimisticItems.map((loan) => {
          const showCancel =
            canCancel &&
            loan.status === 'pending' &&
            loan.userEmail === userEmail;

          return (
            <tr key={loan.id}>
              <td>{loan.bookTitle}</td>
              <td>{formatDate(loan.pickupDate)}</td>
              <td>{TERM_LABEL[loan.term]}</td>
              <td>{loan.quantity} quyển</td>
              <td>{STATUS_LABEL[loan.status]}</td>
              {canCancel ? (
                <td>
                  {showCancel ? (
                    <form
                      className="inline-form"
                      action={async () => {
                        removeOptimistic(loan.id);
                        await cancelAction(loan.id);
                      }}
                    >
                      <button type="submit">Hủy</button>
                    </form>
                  ) : null}
                </td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
