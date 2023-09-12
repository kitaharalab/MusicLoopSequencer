/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@components/",
        replacement: path.resolve(__dirname, "components/"),
      },
    ],
  },
  plugins: [react()],
});
