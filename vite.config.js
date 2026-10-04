import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Build configuration for the Warrigal Park FC registration system.
//
// The `base` path is read from the VITE_BASE environment variable so that the
// same configuration file can be reused for local development ("/") and for a
// GitHub Pages project site ("/<repository-name>/") without code changes.
// The CI pipeline sets VITE_BASE automatically; see .github/workflows/deploy.yml.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE || '/'

  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: false,
      coverage: {
        reporter: ['text', 'html'],
        include: ['src/data/**/*.js'],
      },
    },
  }
})
