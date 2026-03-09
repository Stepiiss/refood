import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const projectRoot = dirname(fileURLToPath(import.meta.url))


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '')
  const rawBasePath = env.VITE_BASE_PATH?.trim()
  const normalizedBasePath = rawBasePath
    ? `${rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`}${rawBasePath.endsWith('/') ? '' : '/'}`
    : '/'

  return {
    base: normalizedBasePath,
    plugins: [react(), tailwindcss()],
  }
})
