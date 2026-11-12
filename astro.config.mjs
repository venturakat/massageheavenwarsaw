// @ts-check
import { defineConfig } from 'astro/config';

/** Component preview at /dev/components — dev server only, never in the build. */
const devPages = {
  name: 'dev-pages',
  hooks: {
    /** @param {{ command: string; injectRoute: (route: { pattern: string; entrypoint: string }) => void }} options */
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') {
        injectRoute({ pattern: '/dev/components', entrypoint: './src/dev/components.astro' });
      }
    },
  },
};

export default defineConfig({
  site: 'https://massageheavenwarsaw.com',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [devPages],
});
