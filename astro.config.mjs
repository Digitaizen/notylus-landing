// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.notylus.net',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    build: {
      target: 'es2020'
    }
  },
  adapter: cloudflare(),
  integrations: [sitemap()]
});
