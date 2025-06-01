import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'))

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages用のベースパス設定
  base: process.env.NODE_ENV === 'production' ? '/image-features-viewer/' : '/',

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
  // ビルド設定
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // WASMファイルのサイズ制限を緩和
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // WASMファイルの出力設定
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.wasm')) {
            return 'assets/[name].[hash][extname]'
          }
          return 'assets/[name].[hash][extname]'
        },
      },
    },
  },
  // 開発サーバー設定（WASMのMIMEタイプ）
  server: {
    fs: {
      allow: ['..'],
    },
  },
})
