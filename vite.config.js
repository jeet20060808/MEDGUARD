import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      parserOpts: {
        strictMode: false,
      },
    },
    jsxRuntime: 'automatic',
  })],
  esbuild: {
    target: 'es2020',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
})
