// Server-only settings. Read from apps/web/.env in development, and from the hosting provider's
// environment variables (e.g. the Netlify dashboard) in production. Never sent to the browser.
const read = (fromFile: string | undefined, name: string) => fromFile || process.env[name] || undefined;

export const serverEnv = () => ({
  OPENAI_API_KEY: read(import.meta.env.OPENAI_API_KEY, 'OPENAI_API_KEY'),
  OPENAI_MODEL: read(import.meta.env.OPENAI_MODEL, 'OPENAI_MODEL'),
  JEV_API_KEY: read(import.meta.env.JEV_API_KEY, 'JEV_API_KEY'),
  JEV_API_URL: read(import.meta.env.JEV_API_URL, 'JEV_API_URL'),
  JEV_MODEL: read(import.meta.env.JEV_MODEL, 'JEV_MODEL'),
  /** Demo University's MCP server. Default: the local dev server (npm run dev:uni) */
  DEMO_UNI_MCP_URL: read(import.meta.env.DEMO_UNI_MCP_URL, 'DEMO_UNI_MCP_URL'),
});

export type ServerEnv = ReturnType<typeof serverEnv>;
