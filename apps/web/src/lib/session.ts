import type { AstroCookies } from 'astro';
import { getUniversity, roles, type Role, type Session } from '@unibuddy/data';

// PROTOTYPE ONLY: the role lives in a cookie so the demo can switch between roles.
// In production this is replaced by the university SSO and a signed server session.
const ROLE_COOKIE = 'ub_role';
const UNI_COOKIE = 'ub_uni';

const isRole = (value: unknown): value is Role => roles.some((r) => r.id === value);

export function getSession(cookies: AstroCookies): Session {
  const role = cookies.get(ROLE_COOKIE)?.value;
  const uni = cookies.get(UNI_COOKIE)?.value;
  return {
    role: isRole(role) ? role : 'visitor',
    universityId: getUniversity(uni) ? uni! : null,
  };
}

export function setSession(cookies: AstroCookies, session: Session) {
  const options = { path: '/', httpOnly: true, sameSite: 'lax' as const, maxAge: 60 * 60 * 24 * 30 };
  cookies.set(ROLE_COOKIE, session.role, options);
  if (session.universityId) cookies.set(UNI_COOKIE, session.universityId, options);
  else cookies.delete(UNI_COOKIE, { path: '/' });
}

/** Only allow redirects inside this site ("/chat", never "https://…" or "//evil.com"). */
export function safeNext(value: FormDataEntryValue | null, fallback = '/chat'): string {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

export { isRole };
