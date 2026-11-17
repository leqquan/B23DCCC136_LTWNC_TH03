'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

export interface LoginState {
  error?: string;
  email?: string;
}

const sanitizeCallbackUrl = (raw: string): string => {
  if (raw.startsWith('/') && !raw.startsWith('//')) {
    return raw;
  }
  return '/loans';
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const rawCallbackUrl = String(formData.get('callbackUrl') ?? '/loans');
  const redirectTo = sanitizeCallbackUrl(rawCallbackUrl);

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: 'Email hoặc mật khẩu không đúng',
        email,
      };
    }
    throw error;
  }
}
