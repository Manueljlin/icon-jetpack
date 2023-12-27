import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vitejs.dev/config/
export default defineConfig({

  plugins: [
    svelte(),
    viteSingleFile(),
  ],

  build: {
    target: "ES6",
    assetsInlineLimit: 10e9,
    chunkSizeWarningLimit: 10e9,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        minifyInternalExports: true
      }
    }
  }
})
