import type { APIRoute } from 'astro';
import { answerQuestion } from '../../lib/answer';
import { getSession } from '../../lib/session';

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === 'string' ? body.question.trim().slice(0, 500) : '';
  if (!question) return Response.json({ error: 'Empty question' }, { status: 400 });

  // The session decides what the assistant may read. The browser never sends stories or roles.
  const session = getSession(cookies);
  const env = { OPENAI_API_KEY: import.meta.env.OPENAI_API_KEY, OPENAI_MODEL: import.meta.env.OPENAI_MODEL };

  return Response.json(await answerQuestion(question, session, env));
};
