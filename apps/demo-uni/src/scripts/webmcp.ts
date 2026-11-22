// WebMCP: the page tells AI agents in the browser which actions it offers, so they don't need to read the
// screen or simulate clicks. Same pattern as the MWC workshop's WebMCP challenge.
// Try it in Chrome with chrome://flags/#enable-webmcp-testing enabled.
import { certificateLanguages, certificateTypes, deadlines, professors } from '../lib/catalog';
import { submit } from './portal-api';

export async function registerTools(onChange: () => void): Promise<string[]> {
  // The API lives in document.modelContext (older builds: navigator.modelContext)
  const modelContext = (document as any).modelContext ?? (navigator as any).modelContext;
  if (!modelContext) return [];

  const tools = [
    {
      name: 'request_certificate',
      description: 'Requests an official certificate for the signed-in student. Returns a reference number. It is emailed within 1 working day.',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: Object.keys(certificateTypes), description: 'enrolment = enrolment certificate, transcript = academic transcript' },
          language: { type: 'string', enum: Object.keys(certificateLanguages), description: 'Language of the certificate' },
        },
        required: ['type'],
      },
      // It creates a real request: the browser may ask the student to confirm
      annotations: { consequentialHint: true },
      execute: async ({ type, language = 'en' }: { type: string; language?: string }) => {
        const result = await submit({ procedure: 'certificate', type, language, channel: 'webmcp' });
        onChange();
        return result;
      },
    },
    {
      name: 'book_office_hours',
      description: `Books a 15-minute office hours slot with a professor. Professors: ${professors.join('; ')}.`,
      inputSchema: {
        type: 'object',
        properties: {
          professor: { type: 'string', enum: professors },
          date: { type: 'string', description: 'Date as YYYY-MM-DD' },
        },
        required: ['professor', 'date'],
      },
      annotations: { consequentialHint: true },
      execute: async ({ professor, date }: { professor: string; date: string }) => {
        const result = await submit({ procedure: 'office-hours', professor, date, channel: 'webmcp' });
        onChange();
        return result;
      },
    },
    {
      name: 'get_deadlines',
      description: 'Lists the upcoming academic deadlines (course selection, exchange applications, thesis).',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: () => ({ deadlines }),
    },
  ];

  const registered: string[] = [];
  for (const tool of tools) {
    const { execute } = tool;
    await modelContext.registerTool({
      ...tool,
      // Errors go back as a value: an exception message would not reach the agent
      async execute(params: any) {
        try {
          return await execute(params);
        } catch (error) {
          return { error: (error as Error).message };
        }
      },
    });
    registered.push(tool.name);
  }
  return registered;
}
