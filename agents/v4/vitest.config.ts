/**
 * V4 Vitest Configuration
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'agents/**/*.test.ts',
      'agents/**/*.spec.ts',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.git',
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'agents/**/*.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/index.ts',
        '**/__tests__/**',
      ],
    },
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: ['default'],
    globals: true,
  },
  resolve: {
    alias: {
      '@agents': path.resolve(__dirname, './agents'),
    },
  },
});
