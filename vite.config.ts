import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "claude-proxy",
        configureServer(server) {
          server.middlewares.use(
            "/api/recommend",
            async (req: IncomingMessage, res: ServerResponse) => {
              if (req.method !== "POST") {
                res.statusCode = 405;
                res.end("Method Not Allowed");
                return;
              }

              let body = "";
              await new Promise<void>((resolve, reject) => {
                req.on("data", (chunk: Buffer) => (body += chunk.toString()));
                req.on("end", resolve);
                req.on("error", reject);
              });

              try {
                const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-api-key": env["CLAUDE_API_KEY"] ?? "",
                    "anthropic-version": "2023-06-01",
                  },
                  body,
                });
                const data = await apiRes.json();
                res.setHeader("Content-Type", "application/json");
                res.statusCode = apiRes.status;
                res.end(JSON.stringify(data));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: { message: String(err) } }));
              }
            },
          );
        },
      },
    ],
  };
});
