/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import flowbiteReact from 'flowbite-react/plugin/vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

// The Flowbite plugin keeps a file watcher open, which stops Vitest from exiting.
const isTest = !!(
  globalThis as { process?: { env?: Record<string, string | undefined> } }
).process?.env?.VITEST;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(isTest ? [] : [flowbiteReact()]),
    svgr(),
    tsconfigPaths(),
    // Installable app + offline study plans. Only the app's own files are cached;
    // API calls always go to the network so progress data is never stale.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        name: 'Engineering Map',
        short_name: 'Eng Map',
        description:
          'Interactive engineering study plans: prerequisites, progress, GPA and course discussions.',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f1729',
        theme_color: '#0f1729',
        icons: [
          {
            src: '/AboAyed.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webp,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
