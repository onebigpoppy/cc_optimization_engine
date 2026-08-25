import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Copies the data snapshots into `dist/data/*` so the app can fetch them at
 * runtime from the same origin (e.g. GitHub Pages) rather than only relying on
 * the bundled copy.
 */
function copyDataFiles(): Plugin {
  const files = ['cards.json', 'merchants.json']
  return {
    name: 'copy-data-files',
    generateBundle() {
      for (const name of files) {
        const source = readFileSync(
          fileURLToPath(new URL(`./src/core/domain/data/${name}`, import.meta.url)),
          'utf-8'
        )
        this.emitFile({ type: 'asset', fileName: `data/${name}`, source })
      }
    }
  }
}

export default defineConfig({
  // Base path for asset URLs — set BASE_PATH=/<repo>/ when deploying to a
  // GitHub Pages project site.
  base: process.env.BASE_PATH || '/',
  plugins: [vue(), copyDataFiles()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
