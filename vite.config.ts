import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    define: {
      // SiliconFlow API key (previously Gemini)
      "process.env.SILICONFLOW_API_KEY": JSON.stringify(
        "sk-caranifnmuxtvwlwfpmausnwwgpyshvouurxlxgupxykqidk"
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
