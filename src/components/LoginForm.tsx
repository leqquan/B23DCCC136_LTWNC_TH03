'use client';

import { useActionState } from 'react';
import type { LoginState } from '@/app/login/actions';

interface LoginFormProps {
  action: (prevState: LoginState, formData: FormData) => Promise<LoginState>;
  callbackUrl: string;
}

const initialState: LoginState = {};

export default function LoginForm({ action, callbackUrl }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} key={state.email ?? 'login-form'}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={state.email ?? ''}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
      </div>

      {state.error ? <p role="alert">{state.error}</p> : null}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
}
