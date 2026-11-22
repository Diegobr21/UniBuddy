// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

// The Netlify adapter is only needed to build for deployment. In `astro dev` it tries to start
// a local Deno server for Edge Functions, which fails on many machines, so dev runs without it.
const isDev = process.argv.includes('dev');

// Server rendering: every page knows who is looking (role + university) before it renders,
// the same way the real platform will filter content on the server.
export default defineConfig({
  output: 'server',
  adapter: isDev ? undefined : netlify(),
  integrations: [react()],
  server: { port: 4321 },
});
