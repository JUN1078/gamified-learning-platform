import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    // Build config for Railway / production
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      emptyOutDir: true,
    },

    // Preview server (used by Railway)
    preview: {
      host: '0.0.0.0',
      port: Number(process.env.PORT) || 4173,
      strictPort: true,
    },
  }
})
