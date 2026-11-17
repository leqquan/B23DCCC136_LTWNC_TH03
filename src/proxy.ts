import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { can } from '@/lib/permissions';

export default auth((req) => {
  const session = req.auth;
  const { pathname, search } = req.nextUrl;

  if (!session?.user) {
    const loginUrl = new URL('/login', req.nextUrl);
    loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/admin') && !can(session.user.role, 'loan:review')) {
    return NextResponse.redirect(new URL('/forbidden', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/loans/:path*', '/admin/:path*'],
};
