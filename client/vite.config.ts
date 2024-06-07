import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from "path"

const root = resolve(__dirname, "src")
const outDir = resolve(__dirname, "dist")

export default defineConfig({
  root,
  plugins: [react()],
  base: "/PhishCollector/",
  build: {
    outDir,
    rollupOptions: {
      input: {
        home: resolve(root, "home", "index.html"),
        collected: resolve(root, "collected", "index.html"),
        analyze: resolve(root, "analyze", "index.html"),
        settings: resolve(root, "settings", "index.html"),
      }
    }
  },
  preview: {
    host: true
  }
})
