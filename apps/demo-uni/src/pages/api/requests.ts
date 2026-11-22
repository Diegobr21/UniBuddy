// The portal's own API: the page's forms and the WebMCP tools in the browser use it.
import type { APIRoute } from 'astro';
import type { Channel } from '../../lib/catalog';
import { bookOfficeHours, listRequests, requestCertificate } from '../../lib/procedures';

export const GET: APIRoute = () => Response.json({ requests: listRequests() });

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const channel: Channel = body.channel === 'webmcp' ? 'webmcp' : 'portal';

  try {
    if (body.procedure === 'certificate') {
      return Response.json(requestCertificate(body.type, body.language ?? 'en', channel));
    }
    if (body.procedure === 'office-hours') {
      return Response.json(bookOfficeHours(String(body.professor), String(body.date), channel));
    }
    return Response.json({ error: 'Unknown procedure' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
};
