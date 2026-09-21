import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Change this one line when the custom domain is live.
export default defineConfig({
  site: 'https://avnish1505.github.io',
  integrations: [sitemap()],
  build: { format: 'directory' },
});