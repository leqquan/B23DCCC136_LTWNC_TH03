import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import LoginForm from '@/components/LoginForm';
import { loginAction } from './actions';

export const metadata: Metadata = {
  title: 'Đăng nhập',
};

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) {
    redirect('/');
  }

  const params = await searchParams;
  const callbackUrl =
    params.callbackUrl &&
    params.callbackUrl.startsWith('/') &&
    !params.callbackUrl.startsWith('//')
      ? params.callbackUrl
      : '/loans';

  return (
    <section>
      <h1>Đăng nhập</h1>
      <LoginForm action={loginAction} callbackUrl={callbackUrl} />
    </section>
  );
}
