'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { can } from '@/lib/permissions';

export default function Header() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      void update();
    }
  }, [pathname, update]);

  const user = session?.user;

  return (
    <header className="site-header">
      <nav className="site-nav">
        <div className="nav-links">
          <Link href="/">Trang chủ</Link>
          <Link href="/books">Sách</Link>
          {user ? <Link href="/loans">Sách đã mượn</Link> : null}
          {user && can(user.role, 'loan:review') ? (
            <Link href="/admin">Quản trị</Link>
          ) : null}
        </div>

        <div className="nav-auth">
          {status === 'loading' ? null : user ? (
            <>
              <span>
                Xin chào, {user.name} ({user.role})
              </span>
              <button
                type="button"
                onClick={() => signOut({ redirectTo: '/' })}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link href="/login">Đăng nhập</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
