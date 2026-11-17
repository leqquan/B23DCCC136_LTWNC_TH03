import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { can } from '@/lib/permissions';

export const metadata: Metadata = {
  title: 'Sách đã mượn',
  robots: { index: false },
};

export default async function LoansPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=%2Floans');
  }
  if (
    !can(session.user.role, 'loan:view-own') &&
    !can(session.user.role, 'loan:view-all')
  ) {
    redirect('/forbidden');
  }

  return (
    <section>
      <h1>Sách đã mượn</h1>
      <p>Đang phát triển ở Phần 3.</p>
    </section>
  );
}
