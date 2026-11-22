import type { APIRoute } from 'astro';
import { getQuestion, isMember, stories, topics, type TopicId, type Visibility } from '@unibuddy/data';
import { getSession } from '../../lib/session';
import { triage } from '../../lib/triage';
import { serverEnv } from '../../lib/env';

const MIN_STORY_LENGTH = 10;

// PROTOTYPE storage: new stories are kept in server memory and disappear on restart.
// The real version saves them in the database with status "pending".
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = getSession(cookies);
  if (!isMember(session)) return redirect('/contribute', 303);

  const form = await request.formData();
  const topicId = String(form.get('topic') ?? '') as TopicId;
  const questionId = String(form.get('question') ?? '');
  const ownQuestion = String(form.get('ownQuestion') ?? '').trim().slice(0, 160);
  const text = String(form.get('text') ?? '').trim().slice(0, 2000);
  const visibility: Visibility = form.get('visibility') === 'public' ? 'public' : 'university';

  const validTopic = topics.some((t) => t.id === topicId);
  const question = questionId === 'other' ? ownQuestion : getQuestion(questionId)?.text;
  if (!validTopic || !question || question.length < 5 || text.length < MIN_STORY_LENGTH) {
    return redirect('/contribute?error=1', 303);
  }

  // Jev checks the story before it reaches the review queue (simple rules if Jev is not configured)
  const aiCheck = await triage(
    { text, question, topicId, chosenVisibility: visibility },
    serverEnv(),
  );

  stories.push({
    id: `n${Date.now()}`,
    universityId: session.universityId!,
    topicId,
    questionId: questionId === 'other' ? `other:${ownQuestion}` : questionId,
    text,
    language: 'auto',
    authorType: session.role === 'student' ? 'student' : 'alumnus',
    visibility,
    status: 'pending',
    aiCheck,
    submittedAt: new Date().toISOString().slice(0, 10),
  });

  return redirect('/contribute?sent=1', 303);
};
