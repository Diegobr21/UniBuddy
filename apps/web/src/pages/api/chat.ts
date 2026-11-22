import type { APIRoute } from 'astro';
import { getUniversity, isMember } from '@unibuddy/data';
import { answerQuestion, type Answer } from '../../lib/answer';
import { serverEnv } from '../../lib/env';
import { getSession } from '../../lib/session';
import { planAction } from '../../lib/uni-actions';
import { connectorUrl, listUniTools } from '../../lib/uni-connectors';

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === 'string' ? body.question.trim().slice(0, 500) : '';
  if (!question) return Response.json({ error: 'Empty question' }, { status: 400 });

  // The session decides what the assistant may read and do. The browser never sends stories or roles.
  const session = getSession(cookies);
  const env = serverEnv();

  // 1. Members of a university connected via MCP: is this a procedure the university can do?
  const url = isMember(session) ? connectorUrl(session.universityId, env) : null;
  if (url) {
    const university = getUniversity(session.universityId)?.name ?? 'your university';
    try {
      const plan = await planAction(question, await listUniTools(url), university, url, env);
      if (plan?.kind === 'proposal') {
        return Response.json({
          answer: `I can do that with ${university}. Check the details and confirm:`,
          action: plan.proposal,
          sources: [],
          hiddenCount: 0,
          contact: null,
          usedModel: Boolean(env.OPENAI_API_KEY),
        } satisfies Answer);
      }
      if (plan?.kind === 'info') {
        return Response.json({ answer: plan.text, sources: [], hiddenCount: 0, contact: null, usedModel: false } satisfies Answer);
      }
    } catch (error) {
      // The university's server is down: carry on with the student stories
      console.error(`Could not reach ${university}'s MCP server:`, error);
    }
  }

  // 2. Everything else: answers from the student stories this person may see
  return Response.json(await answerQuestion(question, session, env));
};
