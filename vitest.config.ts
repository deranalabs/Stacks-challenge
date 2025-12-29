/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import {
  vitestSetupFilePath,
  getClarinetVitestsArgv,
} from "@stacks/clarinet-sdk/vitest";

export default defineConfig({
  test: {
    // 1. Setup Environment Clarinet
    environment: "clarinet",
    include: ["tests/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/ui/**"],
    
    // 2. Setup Helper dari SDK (PENTING: Jangan dihapus)
    setupFiles: [vitestSetupFilePath],
    environmentOptions: {
      clarinet: {
        ...getClarinetVitestsArgv(),
      },
    },

    // 3. FIX ERROR THREADING DISINI
    // Matikan paralelisme file (Jalan satu per satu)
    fileParallelism: false,
    // Gunakan pool 'forks' dengan singleFork agar database simnet tidak bentrok
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});