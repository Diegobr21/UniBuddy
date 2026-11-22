// Turns a chat message into a university procedure: "request my transcript in Spanish" →
// request_certificate {type: transcript, language: es}. With an OpenAI key the model picks the tool and
// its arguments; without one, simple keyword rules do. Procedures that change something are only PREPARED:
// the student sees a pre-filled form and must confirm. Read-only ones (deadlines) run straight away.
import type { ActionField, ActionProposal } from './action-types';
import type { ServerEnv } from './env';
import { callUniTool, type UniTool } from './uni-connectors';

export type ActionPlan = { kind: 'proposal'; proposal: ActionProposal } | { kind: 'info'; text: string };

interface Choice {
  tool: string;
  args: Record<string, string>;
}

export async function planAction(
  question: string,
  tools: UniTool[],
  university: string,
  url: string,
  env: ServerEnv,
): Promise<ActionPlan | null> {
  const choice = (env.OPENAI_API_KEY && (await chooseWithModel(question, tools, env).catch(() => undefined))) ?? chooseWithRules(question, tools);
  if (!choice) return null;

  const tool = tools.find((t) => t.name === choice.tool);
  if (!tool) return null;

  if (tool.readOnly) {
    const result = await callUniTool(url, tool.name, choice.args);
    return { kind: 'info', text: `${tool.title} at ${university}:\n${result.text}` };
  }

  const fields = fieldsFromSchema(tool);
  const values = Object.fromEntries(fields.map((f) => [f.name, choice.args[f.name] ?? defaultValue(f)]));
  return {
    kind: 'proposal',
    proposal: { tool: tool.name, title: tool.title, description: tool.description, fields, values, university },
  };
}

// ── Form fields from the tool's input schema ────────────────────────────────────────────

const labels: Record<string, string> = {
  type: 'Certificate',
  language: 'Language',
  professor: 'Professor',
  date: 'Date',
};
const optionLabels: Record<string, string> = {
  enrolment: 'Enrolment certificate',
  transcript: 'Academic transcript',
  en: 'English',
  es: 'Spanish',
};

export function fieldsFromSchema(tool: UniTool): ActionField[] {
  const props = tool.inputSchema.properties ?? {};
  const required = new Set(tool.inputSchema.required ?? []);
  return Object.entries(props).map(([name, prop]) => ({
    name,
    label: labels[name] ?? name,
    kind: prop.enum ? 'select' : name === 'date' || /YYYY-MM-DD/.test(prop.description ?? '') ? 'date' : 'text',
    options: prop.enum?.map((value) => ({ value, label: optionLabels[value] ?? value })),
    required: required.has(name),
  }));
}

function defaultValue(field: ActionField): string {
  if (field.kind === 'select') return field.options?.[0]?.value ?? '';
  if (field.kind === 'date') return nextWeekday(1);
  return '';
}

function nextWeekday(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// ── Without a model: keyword rules (good enough for the demo, in English and Spanish) ──

const normalise = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function chooseWithRules(question: string, tools: UniTool[]): Choice | null {
  const q = normalise(question);
  const has = (name: string) => tools.some((t) => t.name === name);

  if (has('get_deadlines') && /deadline|plazo|fecha limite|cuando (cierra|acaba|termina)|due date/.test(q)) {
    return { tool: 'get_deadlines', args: {} };
  }

  if (has('request_certificate') && /certificat|certificad|transcript|expediente|notas oficiales|grades/.test(q)) {
    return {
      tool: 'request_certificate',
      args: {
        type: /transcript|expediente|notas|grades/.test(q) ? 'transcript' : 'enrolment',
        language: /spanish|espanol|castellano|en espanol/.test(q) ? 'es' : 'en',
      },
    };
  }

  if (has('book_office_hours') && /office hour|tutoria|meet|reunion|cita con|book .*prof|profesor|professor/.test(q)) {
    const tool = tools.find((t) => t.name === 'book_office_hours')!;
    const professors = tool.inputSchema.properties?.professor?.enum ?? [];
    // Match a professor by surname ("Klein") if the student named one
    const professor = professors.find((p) =>
      normalise(p)
        .replace(/[().,]/g, '')
        .split(' ')
        .some((w) => w.length > 3 && w !== 'prof' && q.includes(w)),
    );
    const date = /tomorrow|manana/.test(q) ? nextWeekday(1) : /next week|proxima semana|semana que viene/.test(q) ? nextWeekday(7) : undefined;
    return { tool: 'book_office_hours', args: { ...(professor && { professor }), ...(date && { date }) } };
  }

  return null;
}

// ── With a model: gpt-6-luna picks the tool and fills the arguments it can infer ─────────

async function chooseWithModel(question: string, tools: UniTool[], env: ServerEnv): Promise<Choice | null> {
  const today = new Date().toISOString().slice(0, 10);
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || 'gpt-6-luna',
      store: false,
      instructions: [
        `Today is ${today}. You help a university student with official procedures.`,
        'If the message asks to DO one of the procedures offered by the tools, call that tool with the arguments you can infer.',
        'If it is a general question about student life, do not call any tool and answer with the single word NONE.',
      ].join('\n'),
      input: question,
      tools: tools.map((t) => ({
        type: 'function',
        name: t.name,
        description: t.description,
        parameters: { type: 'object', properties: t.inputSchema.properties ?? {}, required: [] },
        strict: false,
      })),
    }),
  });
  if (!response.ok) throw new Error(`OpenAI answered ${response.status}`);

  const data = await response.json();
  const call = (data.output ?? []).find((item: { type: string }) => item.type === 'function_call');
  if (!call) return null;
  const args = JSON.parse(call.arguments || '{}') as Record<string, unknown>;
  return { tool: call.name, args: Object.fromEntries(Object.entries(args).map(([k, v]) => [k, String(v)])) };
}
