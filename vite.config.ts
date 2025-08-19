import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  ssr: {
    optimizeDeps: {
      include: ["@prisma/client-generated"],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
  build: {
    rollupOptions: {
      external: ["@prisma/client-generated"], // 👈 Also here
    },
  },
});
