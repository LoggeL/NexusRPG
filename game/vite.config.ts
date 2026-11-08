import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: { port: 5200, strictPort: true },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    // Phaser als eigener, gut cachebarer Chunk (~1,2 MB)
    chunkSizeWarningLimit: 1400,
    rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } },
  },
  // Vitest nur für Modul-/Inhaltstests; Playwright-Dateien unter e2e/ bleiben außen vor.
  test: { include: ['src/**/*.test.ts'] },
});
