import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// On Vercel the production domain is picked up automatically, so canonical URLs and
// link previews follow your custom domain once it is attached. SITE_URL overrides it.
const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = process.env.SITE_URL ?? (vercelDomain ? `https://${vercelDomain}` : 'http://localhost:4321');

export default defineConfig({
  site,
  integrations: [sitemap()],
  build: { format: 'directory' },
});
