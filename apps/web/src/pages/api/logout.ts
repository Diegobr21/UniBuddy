import type { APIRoute } from 'astro';
import { clearSession } from '../../lib/session';

// PROTOTYPE sign-out: forgets the role and university and goes back to the university list.
// The real version also ends the session with the university's SSO.
export const POST: APIRoute = ({ cookies, redirect }) => {
  clearSession(cookies);
  return redirect('/', 303);
};
