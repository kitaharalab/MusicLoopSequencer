/* eslint-disable import/no-extraneous-dependencies */
import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@components",
        replacement: path.resolve(__dirname, "components"),
      },
      { find: "@src", replacement: path.resolve(__dirname, "src") },
    ],
  },
  plugins: [react()],
});
