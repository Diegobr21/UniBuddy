import type { APIRoute } from 'astro';
import { canPublishReleases, releases } from '@unibuddy/data';
import { getSession } from '../../lib/session';

// PROTOTYPE: publishing swaps versions in memory. The real release builder runs on a schedule (or this button),
// indexes the approved stories, runs the test questions and only then switches the live version.
const bump = (date: string, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = getSession(cookies);
  if (!canPublishReleases(session)) return redirect('/releases', 303);

  const form = await request.formData();
  const live = releases.find((r) => r.status === 'live')!;
  const next = releases.find((r) => r.status === 'next')!;

  if (form.get('action') === 'publish' && next.storyIds.length > 0) {
    live.status = 'previous';
    next.status = 'live';
    next.storyIds = [...live.storyIds, ...next.storyIds];
    next.date = new Date().toISOString().slice(0, 10);
    const date = bump(next.date, 7);
    releases.unshift({ version: `v${date.replaceAll('-', '.')}`, status: 'next', date, storyIds: [] });
  }

  if (form.get('action') === 'rollback') {
    const target = releases.find((r) => r.version === form.get('version') && r.status === 'previous');
    if (target) {
      live.status = 'previous';
      target.status = 'live';
    }
  }

  return redirect('/releases', 303);
};
