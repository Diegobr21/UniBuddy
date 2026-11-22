import type { APIRoute } from 'astro';
import { canModerate, releases } from '@unibuddy/data';
import { getSession } from '../../lib/session';
import { moderationScope } from '../../lib/moderation';

// PROTOTYPE: decisions change the in-memory data. The real version writes them to the database
// with who decided and when (audit log).
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = getSession(cookies);
  if (!canModerate(session)) return redirect('/moderate', 303);

  const form = await request.formData();
  const story = moderationScope(session).find((s) => s.id === form.get('id'));
  if (!story || story.status !== 'pending') return redirect('/moderate', 303);

  if (form.get('decision') === 'approve') {
    const edited = String(form.get('text') ?? '').trim().slice(0, 2000);
    if (edited.length >= 20) story.text = edited;
    story.visibility = form.get('visibility') === 'public' ? 'public' : 'university';
    story.status = 'approved';
    releases.find((r) => r.status === 'next')?.storyIds.push(story.id);
  } else {
    story.status = 'rejected';
  }

  return redirect('/moderate', 303);
};
