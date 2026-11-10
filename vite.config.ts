import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { SECURITY_HEADERS, htaccess } from './deploy/headers.mjs';

/**
 * Hostinger support: writes dist/.htaccess (caching, MIME types, security
 * headers) and, when VITE_SITE_URL is set, makes share-preview URLs absolute.
 */
const hostingPlugin = (siteUrl: string | undefined): Plugin => ({
  name: 'ice-hosting',
  transformIndexHtml(html) {
    if (!siteUrl) return html;
    const base = siteUrl.replace(/\/+$/, '');
    return html
      .replace('content="/logos/og-image.png"', `content="${base}/logos/og-image.png"`)
      .replace(
        '</head>',
        `    <link rel="canonical" href="${base}/" />\n    <meta property="og:url" content="${base}/" />\n  </head>`,
      );
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: '.htaccess', source: htaccess() });
    this.emitFile({
      type: 'asset',
      fileName: 'robots.txt',
      source: 'User-agent: *\nAllow: /\n',
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  return {
    plugins: [react(), hostingPlugin(env.VITE_SITE_URL || undefined)],
    server: {
      watch: {
        ignored: ['**/.tmp-docs/**'],
      },
    },
    // Same headers as the live site, so `npm run preview` catches blocked resources.
    preview: {
      headers: SECURITY_HEADERS,
    },
    build: {
      // MapLibre alone is ~800 KB; it loads only on map pages.
      chunkSizeWarningLimit: 1100,
    },
    test: {
      environment: 'node',
      globals: true,
    },
  };
});
