// Connections to universities that publish an MCP server (today: Demo University).
// MBA Buddy's server is the MCP client: the browser never talks to the university directly.
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import type { ServerEnv } from './env';

export interface UniTool {
  name: string;
  title: string;
  description: string;
  inputSchema: { properties?: Record<string, { type?: string; enum?: string[]; description?: string }>; required?: string[] };
  readOnly: boolean;
}

/** The MCP address of each connected university. A real catalogue would keep this in the database. */
export function connectorUrl(universityId: string | null, env: ServerEnv): string | null {
  if (universityId === 'demo') return env.DEMO_UNI_MCP_URL || 'http://localhost:4322/mcp';
  return null;
}

async function withClient<T>(url: string, work: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ name: 'mba-buddy', version: '0.1.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(url)));
  try {
    return await work(client);
  } finally {
    await client.close();
  }
}

export async function listUniTools(url: string): Promise<UniTool[]> {
  return withClient(url, async (client) => {
    const { tools } = await client.listTools();
    return tools.map((t) => ({
      name: t.name,
      title: t.title ?? t.name,
      description: t.description ?? '',
      inputSchema: t.inputSchema as UniTool['inputSchema'],
      readOnly: t.annotations?.readOnlyHint === true,
    }));
  });
}

export async function callUniTool(url: string, name: string, args: Record<string, string>) {
  return withClient(url, async (client) => {
    const result = await client.callTool({ name, arguments: args });
    const content = (result.content ?? []) as { type: string; text?: string }[];
    const text = content.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
    return { ok: !result.isError, text };
  });
}
