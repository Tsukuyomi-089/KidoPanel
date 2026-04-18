import { defineConfig } from "vitest/config";

/** Configuration Vitest isolée aux tests Node du moteur (sans émission dans `dist/`). */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    passWithNoTests: false,
  },
});
