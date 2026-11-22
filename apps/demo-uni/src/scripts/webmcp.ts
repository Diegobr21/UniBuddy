// WebMCP: the page tells AI agents in the browser which actions it offers, so they don't need to read the
// screen or simulate clicks. Same pattern as the workshop's WebMCP challenge.
// Try it in Chrome with chrome://flags/#enable-webmcp-testing enabled.
import { bookOfficeHours, getDeadlines, professors, requestCertificate } from './portal';

type Show = (title: string, detail: unknown) => void;

export async function registerTools(show: Show): Promise<string[]> {
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
          type: { type: 'string', enum: ['enrolment', 'transcript'], description: 'Enrolment certificate or academic transcript' },
          language: { type: 'string', enum: ['en', 'es'], description: 'Language of the certificate' },
        },
        required: ['type'],
      },
      // It creates a real request: the browser may ask the student to confirm
      annotations: { consequentialHint: true },
      execute: ({ type, language = 'en' }: { type: 'enrolment' | 'transcript'; language?: 'en' | 'es' }) => {
        const result = requestCertificate({ type, language });
        show('Certificate requested by your assistant', result);
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
      execute: ({ professor, date }: { professor: string; date: string }) => {
        const result = bookOfficeHours({ professor, date });
        show('Office hours booked by your assistant', result);
        return result;
      },
    },
    {
      name: 'get_deadlines',
      description: 'Lists the upcoming academic deadlines (course selection, exchange applications, thesis).',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: () => getDeadlines(),
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
