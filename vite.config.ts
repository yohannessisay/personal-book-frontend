import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [vue(), tsconfigPaths()],
  css: {
    postcss: './postcss.config.cjs',
  },
  resolve: {
    alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
