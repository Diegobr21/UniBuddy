import { getQuestion, getTopic, getUniversity, stories, type Session, type Story } from '@unibuddy/data';

/** Stories a moderator is responsible for: their university's (an admin sees all). */
export function moderationScope(session: Session): Story[] {
  return stories.filter((s) => session.role === 'admin' || s.universityId === session.universityId);
}

export const isFlagged = (s: Story) => s.aiCheck.offensive || s.aiCheck.personalData !== false || !s.aiCheck.relevant;

export function questionText(story: Story) {
  if (story.questionId.startsWith('other:')) return story.questionId.slice(6);
  return getQuestion(story.questionId)?.text ?? 'Question';
}

export function storyMeta(story: Story) {
  const topic = getTopic(story.topicId)?.label ?? story.topicId;
  const author = story.authorType === 'student' ? 'Student' : 'Alumnus';
  return `${topic} · ${author} · ${getUniversity(story.universityId)?.shortName}`;
}

const languages: Record<string, string> = { en: 'English', es: 'Spanish' };
export const languageName = (code: string) => languages[code] ?? null;
