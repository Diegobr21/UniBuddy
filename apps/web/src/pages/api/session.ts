import type { APIRoute } from 'astro';
import { getUniversity } from '@unibuddy/data';
import { isRole, safeNext, setSession } from '../../lib/session';

// PROTOTYPE sign-in: sets the role and university chosen in the demo.
// The real version redirects to the university SSO (SAML / OIDC) and trusts only what it returns.
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const role = form.get('role');
  const uni = form.get('uni');

  const universityId = typeof uni === 'string' && getUniversity(uni) ? uni : null;
  const chosenRole = isRole(role) ? role : 'visitor';

  // Members always belong to a university; without one they stay visitors
  setSession(cookies, {
    role: chosenRole !== 'visitor' && !universityId ? 'visitor' : chosenRole,
    universityId,
  });

  return redirect(safeNext(form.get('next')), 303);
};
