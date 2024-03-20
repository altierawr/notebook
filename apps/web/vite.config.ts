import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import relay from "vite-plugin-relay"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), relay],
})
