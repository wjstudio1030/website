import { cpSync, copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = dirname(fileURLToPath(import.meta.url));

function copyLegacyRuntimeAssets() {
  return {
    name: 'copy-legacy-runtime-assets',

    closeBundle() {
      const distDir = resolve(projectRoot, 'dist');

      mkdirSync(distDir, { recursive: true });

      copyFileSync(
        resolve(projectRoot, 'app.js'),
        resolve(distDir, 'app.js')
      );

      cpSync(
        resolve(projectRoot, 'game_audio'),
        resolve(distDir, 'game_audio'),
        { recursive: true }
      );

      cpSync(
        resolve(projectRoot, 'draw_svg'),
        resolve(distDir, 'draw_svg'),
        { recursive: true }
      );
    }
  };
}

export default defineConfig({
  plugins: [
    copyLegacyRuntimeAssets()
  ],

  build: {
    rollupOptions: {
      input: 'Game.vite.html'
    }
  }
});