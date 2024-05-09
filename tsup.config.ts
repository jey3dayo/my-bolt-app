import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "./dist",
  format: ["esm"],
  splitting: false,
  sourcemap: true,
  clean: true,
});
