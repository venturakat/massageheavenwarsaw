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

/**
 * Astro writes only the root 404 as /404.html; /en/404 and /ua/404 come out as
 * folders (en/404/index.html). Hosts look for <dir>/404.html, so move them there.
 * The server should answer unknown /en/… and /ua/… URLs with those files
 * (e.g. Netlify _redirects "/en/* /en/404.html 404", nginx error_page per location).
 */
const localeNotFoundPages = {
  name: 'locale-404-pages',
  hooks: {
    /** @param {{ dir: URL }} options */
    'astro:build:done': async ({ dir }) => {
      const { rename, rmdir } = await import('node:fs/promises');
      for (const locale of ['en', 'ua']) {
        const folder = new URL(`${locale}/404/`, dir);
        await rename(new URL('index.html', folder), new URL(`${locale}/404.html`, dir));
        await rmdir(folder);
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
  integrations: [devPages, localeNotFoundPages, ...(adminEnabled ? [preact({ include: ['**/src/admin/**/*.tsx'] })] : [])],
});
