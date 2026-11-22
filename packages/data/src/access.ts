// THE most important rule of the platform, in one place:
// the server decides what each person may see BEFORE anything reaches the AI model.
import { liveRelease, stories } from './stories';
import type { Role, Session, Story } from './types';

export const roles: { id: Role; label: string }[] = [
  { id: 'visitor', label: 'Visitor' },
  { id: 'student', label: 'Student' },
  { id: 'moderator', label: 'Moderator' },
  { id: 'admin', label: 'Admin' },
];

export const isMember = (session: Session) => session.role !== 'visitor' && session.universityId !== null;

export const canModerate = (session: Session) => session.role === 'moderator' || session.role === 'admin';

export const canPublishReleases = (session: Session) => session.role === 'admin' || session.role === 'moderator';

/** Can this person see this story? Only approved stories, and university-only ones just for that university's members. */
export function canSeeStory(session: Session, story: Story): boolean {
  if (story.status !== 'approved') return false;
  if (story.visibility === 'public') return true;
  return isMember(session) && session.universityId === story.universityId;
}

/** The stories the assistant may use for this person: published in the live release AND allowed for them. */
export function visibleStories(session: Session): Story[] {
  const published = new Set(liveRelease().storyIds);
  return stories.filter((s) => published.has(s.id) && canSeeStory(session, s));
}

/** Published university-only stories this person cannot see (used to show "sign in to see more", never their content). */
export function hiddenStories(session: Session, universityId: string | null): Story[] {
  const published = new Set(liveRelease().storyIds);
  return stories.filter(
    (s) => published.has(s.id) && s.universityId === universityId && !canSeeStory(session, s),
  );
}
