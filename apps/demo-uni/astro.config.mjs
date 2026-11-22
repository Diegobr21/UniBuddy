// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// A fictional university portal. It runs on a server so that the web page, browser agents (WebMCP)
// and MBA Buddy's chat (MCP) all share the same list of procedures.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { port: 4322 },
});
