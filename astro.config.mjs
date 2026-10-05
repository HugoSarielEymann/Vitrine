// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Le domaine définitif, branché sur le Worker Cloudflare : il alimente les
  // URL canoniques, le sitemap et le flux RSS (même valeur que SITE.url).
  site: 'https://hugoeymann.com',

  integrations: [react(), mdx(), sitemap()],

  // Sortie 100 % statique : Cloudflare sert des fichiers depuis son edge,
  // aucun serveur à maintenir, aucun cold start.
  output: 'static',

  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: true,
    },
  },

  // Précharge le HTML des liens qui entrent dans le viewport : la navigation
  // devient instantanée sans faire d'une page statique une SPA.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // three.js est lourd : on l'isole dans son propre chunk pour qu'il ne
      // pénalise jamais le premier rendu des pages qui ne l'utilisent pas.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'three';
            if (id.includes('@react-three')) return 'r3f';
          },
        },
      },
    },
  },
});
