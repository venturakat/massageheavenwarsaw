// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

/**
 * Pages that are not part of the public site:
 *   /dev/components  component preview, dev server only
 *   /admin/          admin panel prototype (sample data, saved in the browser only).
 *                    Dev server only, unless ADMIN_PREVIEW=1 is set for a preview build.
 *                    The developer replaces src/admin/api.ts with the real back end (phase 2).
 */
const devPages = {
  name: 'dev-pages',
  hooks: {
    /** @param {{ command: string; injectRoute: (route: { pattern: string; entrypoint: string }) => void }} options */
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') {
        injectRoute({ pattern: '/dev/components', entrypoint: './src/dev/components.astro' });
      }
      if (adminEnabled && (command === 'dev' || process.env.ADMIN_PREVIEW === '1')) {
        injectRoute({ pattern: '/admin', entrypoint: './src/admin/AdminPage.astro' });
      }
    },
  },
};

/** The admin needs Preact; leave it out of the public build so no unused framework files ship. */
const adminEnabled = process.argv.includes('dev') || process.env.ADMIN_PREVIEW === '1';

export default defineConfig({
  site: 'https://massageheavenwarsaw.com',
  output: 'static',
  trailingSlash: 'ignore',
  // Preact only for the admin panel; the public site stays plain Astro with no framework JS.
  integrations: [devPages, ...(adminEnabled ? [preact({ include: ['**/src/admin/**/*.tsx'] })] : [])],
});
