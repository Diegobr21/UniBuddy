// Demo University's MCP server, at /mcp. MBA Buddy's chat (or any MCP client) connects here to
// list the university's procedures and run them for a student.
//
// PROTOTYPE: no authentication. In a real university this endpoint would only accept requests that carry
// the student's own token (OAuth), so the assistant can do exactly what that student could do, nothing more.
import type { APIRoute } from 'astro';
import { McpServer, WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { certificateLanguages, certificateTypes, professors } from '../lib/catalog';
import { bookOfficeHours, getDeadlines, requestCertificate } from '../lib/procedures';

const text = (value: string) => [{ type: 'text' as const, text: value }];

function createServer() {
  const server = new McpServer({ name: 'demo-university', version: '1.0.0' });

  server.registerTool(
    'request_certificate',
    {
      title: 'Request a certificate',
      description: 'Requests an official certificate for the student. It is emailed within 1 working day.',
      inputSchema: z.object({
        type: z.enum(Object.keys(certificateTypes) as ['enrolment', 'transcript']).describe('enrolment = enrolment certificate, transcript = academic transcript'),
        language: z.enum(Object.keys(certificateLanguages) as ['en', 'es']).describe('Language of the certificate'),
      }),
      // It creates a real request: clients should ask the student to confirm first
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ type, language }) => {
      try {
        const saved = requestCertificate(type, language, 'mba-buddy');
        return { content: text(`${saved.title} requested (${saved.detail}). Reference ${saved.reference}. ${saved.status}.`), structuredContent: { ...saved } };
      } catch (error) {
        return { isError: true, content: text((error as Error).message) };
      }
    },
  );

  server.registerTool(
    'book_office_hours',
    {
      title: 'Book office hours',
      description: `Books a 15-minute office hours slot with a professor. Professors: ${professors.join('; ')}.`,
      inputSchema: z.object({
        professor: z.enum(professors as [string, ...string[]]).describe('Professor to meet'),
        date: z.string().describe('Date as YYYY-MM-DD, today or later'),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ professor, date }) => {
      try {
        const saved = bookOfficeHours(professor, date, 'mba-buddy');
        return { content: text(`Office hours booked with ${professor} on ${date}. Reference ${saved.reference}. ${saved.status}.`), structuredContent: { ...saved } };
      } catch (error) {
        return { isError: true, content: text((error as Error).message) };
      }
    },
  );

  server.registerTool(
    'get_deadlines',
    {
      title: 'Upcoming deadlines',
      description: 'Lists the upcoming academic deadlines: course selection, exchange applications, thesis.',
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      const list = getDeadlines();
      return {
        content: text(list.map((d) => `${d.item}: ${d.date}`).join('\n')),
        structuredContent: { deadlines: list },
      };
    },
  );

  return server;
}

// Stateless: a fresh server and transport per request, as in the MWC workshop
export const ALL: APIRoute = async ({ request }) => {
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await createServer().connect(transport);
  return transport.handleRequest(request);
};
