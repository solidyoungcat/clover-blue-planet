import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      // 直接指向 shared 源码，跳过 node_modules 预打包缓存
      "@clover/shared": path.resolve(__dirname, "../shared/src"),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:4099",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    // 禁止 Vite 预打包 @clover/shared，始终从源码加载
    exclude: ["@clover/shared"],
  },
});
