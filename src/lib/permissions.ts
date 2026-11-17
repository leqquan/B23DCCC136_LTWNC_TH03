import type { Role } from '@/types';

export type Action =
  | 'book:view'
  | 'loan:create'
  | 'loan:view-own'
  | 'loan:view-all'
  | 'loan:review';

const ROLE_PERMISSIONS: Record<Role | 'guest', readonly Action[]> = {
  guest: ['book:view'],
  student: ['book:view', 'loan:create', 'loan:view-own'],
  admin: ['book:view', 'loan:view-all', 'loan:review'],
};

export function can(role: Role | undefined, action: Action): boolean {
  const effectiveRole: Role | 'guest' = role ?? 'guest';
  return ROLE_PERMISSIONS[effectiveRole].includes(action);
}
