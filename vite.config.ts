import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml: (html) => {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>${packageJson.displayName}</title>`,
        )
      },
    },
  ],
  assetsInclude: ['**/*.wasm'],
  esbuild: {
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: ['rust-wasm'],
  },
})
