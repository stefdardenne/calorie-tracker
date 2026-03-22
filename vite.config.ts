import { defineConfig } from "vite";
import { defineConfig as defineVitestConfig } from "vitest/config";

export default defineConfig(
  defineVitestConfig({
    test: {
      environment: "jsdom",
    },
  }),
);
