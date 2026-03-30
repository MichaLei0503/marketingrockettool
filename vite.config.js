import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local for dev API
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}

// Vite plugin to handle /api routes in dev using the serverless function
function apiPlugin() {
  loadEnv();

  return {
    name: "api-handler",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();

        // Dynamic import of the handler
        try {
          const mod = await import("./api/analyse.js");
          const handler = mod.default;

          // Parse JSON body
          let body = "";
          for await (const chunk of req) body += chunk;

          const fakeReq = {
            method: req.method,
            body: body ? JSON.parse(body) : {},
            headers: req.headers,
          };

          const fakeRes = {
            statusCode: 200,
            _headers: { "content-type": "application/json" },
            status(code) { this.statusCode = code; return this; },
            json(data) {
              res.writeHead(this.statusCode, this._headers);
              res.end(JSON.stringify(data));
            },
            setHeader(k, v) { this._headers[k] = v; },
          };

          await handler(fakeReq, fakeRes);
        } catch (err) {
          res.writeHead(500, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: err?.message || "Internal server error" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
});
