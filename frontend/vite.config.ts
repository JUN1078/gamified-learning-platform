import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// ESM-safe __dirname replacement
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(() => {
  // Railway sets PORT environment variable
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4173

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    server: {
      host: '0.0.0.0',
      port: 3000,
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      emptyOutDir: true,
    },

    preview: {
      host: '0.0.0.0',
      port: port,
    },
  }
})
