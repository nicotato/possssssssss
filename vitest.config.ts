import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['node_modules','dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text','html'],
      include: ['src/application/services/**/*.ts'],
  // Incremento gradual de umbrales tras nuevas pruebas DSL
  thresholds: { lines:45, functions:65, branches:55, statements:45 }
    },
    environment: 'node',
    setupFiles: ['tests/test-setup.ts']
  },
  resolve: {
    alias: {
      '@domain': new URL('./src/domain', import.meta.url).pathname,
      '@application': new URL('./src/application', import.meta.url).pathname,
      '@infrastructure': new URL('./src/infrastructure', import.meta.url).pathname,
      '@ui': new URL('./src/ui', import.meta.url).pathname,
      '@workers': new URL('./src/workers', import.meta.url).pathname,
      'chevrotain': 'chevrotain'
    }
  },
  define: {
    global: 'globalThis'
  }
});