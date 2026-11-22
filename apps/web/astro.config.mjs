// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

// Server rendering: every page knows who is looking (role + university) before it renders,
// the same way the real platform will filter content on the server.
export default defineConfig({
  output: 'server',
  adapter: netlify(),
  integrations: [react()],
  server: { port: 4321 },
});
