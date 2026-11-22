// Runs a university procedure AFTER the student confirmed the pre-filled form in the chat.
import type { APIRoute } from 'astro';
import { isMember } from '@unibuddy/data';
import type { ActionResult } from '../../lib/action-types';
import { serverEnv } from '../../lib/env';
import { getSession } from '../../lib/session';
import { callUniTool, connectorUrl, listUniTools } from '../../lib/uni-connectors';

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  const url = isMember(session) ? connectorUrl(session.universityId, serverEnv()) : null;
  if (!url) return Response.json({ ok: false, text: 'Sign in with a connected university first.' } satisfies ActionResult, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const toolName = String(body.tool ?? '');
  const values: Record<string, string> = Object.fromEntries(
    Object.entries((body.values ?? {}) as Record<string, unknown>).map(([k, v]) => [k, String(v).slice(0, 200)]),
  );

  try {
    // Only tools the university really offers; the university's server validates the values again
    const tool = (await listUniTools(url)).find((t) => t.name === toolName);
    if (!tool) return Response.json({ ok: false, text: 'This procedure is not available.' } satisfies ActionResult, { status: 400 });

    return Response.json((await callUniTool(url, tool.name, values)) satisfies ActionResult);
  } catch (error) {
    console.error('University procedure failed:', error);
    return Response.json({ ok: false, text: 'The university did not answer. Please try again later.' } satisfies ActionResult, { status: 502 });
  }
};
