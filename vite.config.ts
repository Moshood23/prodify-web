import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // The live site must be built with the live API address, or it would call localhost.
  if (mode === 'production' && !loadEnv(mode, process.cwd()).VITE_API_BASE_URL) {
    console.warn('\n  VITE_API_BASE_URL is not set: this build will call http://localhost:5255/api.')
    console.warn('  Set it in the hosting settings, e.g. VITE_API_BASE_URL=https://api.prodify.ng/api\n')
  }

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            // React and the router change rarely, so they get their own file that browsers keep
            // between our updates instead of downloading it again with every release.
            groups: [{ name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ }],
          },
        },
      },
    },
  }
})
