import http from "node:http";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

export const CREW_IDS = ["alex", "sam", "noor", "morgan", "taylor", "jamie"];
const MAX_BODY = 8192;
const MAX_RECORDS = 10000;
const sha = (value) => createHash("sha256").update(value).digest();
const equal = (a, b) => timingSafeEqual(sha(a), sha(b));
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/** Generates separate high-entropy access codes once. The file is git-ignored. */
export function ensureCredentials(path) {
  if (!existsSync(path)) {
    const codes = Object.fromEntries(CREW_IDS.map((id) => [id, randomBytes(24).toString("hex")]));
    writeFileSync(path, JSON.stringify({ version: 1, codes }, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  }
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  if (!object(parsed) || !object(parsed.codes) || !CREW_IDS.every((id) => typeof parsed.codes[id] === "string" && /^[a-f0-9]{48}$/.test(parsed.codes[id])) || new Set(Object.values(parsed.codes)).size !== CREW_IDS.length) throw new Error("Invalid crew credentials file; do not overwrite it automatically.");
  return parsed.codes;
}
function loadData(path) {
  if (!existsSync(path)) return { version: 1, messages: [], alerts: [] };
  const data = JSON.parse(readFileSync(path, "utf8"));
  if (!object(data) || data.version !== 1 || !Array.isArray(data.messages) || !Array.isArray(data.alerts)) throw new Error("Invalid crew messages file; refusing to overwrite it.");
  return data;
}
function saveData(path, data) {
  const temp = `${path}.tmp.local`;
  writeFileSync(temp, JSON.stringify(data, null, 2) + "\n", { mode: 0o600 });
  renameSync(temp, path);
}
function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(JSON.stringify(payload));
}
async function body(req) {
  let length = 0;
  const chunks = [];
  for await (const chunk of req) { length += chunk.length; if (length > MAX_BODY) throw new Error("too_large"); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch { throw new Error("invalid_json"); }
}
function safeText(value, max) { return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null; }
function visibleAlerts(data, id) { return data.alerts.filter((alert) => alert.to === "all" || alert.to === id || alert.from === id); }

export function createCrewServer({ credentialsPath, dataPath, staticDir }) {
  const codes = ensureCredentials(credentialsPath);
  let data = loadData(dataPath);
  const failures = new Map();
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://localhost");
      if (url.pathname.startsWith("/api/crew/")) {
        if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
        const origin = req.headers.origin;
        if (origin) { let parsed; try { parsed = new URL(origin); } catch { return json(res, 403, { error: "Invalid origin" }); } const devProxy = ["127.0.0.1:8787", "localhost:8787"].includes(req.headers.host || "") && ["http://127.0.0.1:5173", "http://localhost:5173"].includes(parsed.origin); if (parsed.host !== req.headers.host && !devProxy) return json(res, 403, { error: "Cross-origin requests are not permitted" }); }
        const peer = req.socket.remoteAddress || "unknown";
        const bucket = failures.get(peer);
        if (bucket && bucket.until > Date.now() && bucket.count >= 30) return json(res, 429, { error: "Too many attempts. Try again shortly." });
        const header = req.headers.authorization || "";
        const code = header.startsWith("Bearer ") ? header.slice(7) : "";
        const id = CREW_IDS.find((crewId) => equal(code, codes[crewId]));
        if (!id) { const now = Date.now(); const next = !bucket || bucket.until <= now ? { count: 1, until: now + 60000 } : { ...bucket, count: bucket.count + 1 }; failures.set(peer, next); return json(res, 401, { error: "Access code not recognised" }); }
        failures.delete(peer);
        if (url.pathname === "/api/crew/session") return json(res, 200, { crewId: id });
        if (url.pathname === "/api/crew/feed") return json(res, 200, { crewId: id, messages: data.messages, alerts: visibleAlerts(data, id) });
        if (url.pathname === "/api/crew/messages") {
          const input = await body(req); const text = object(input) ? safeText(input.text, 500) : null;
          if (!text) return json(res, 400, { error: "Enter a message of up to 500 characters" });
          if (data.messages.length >= MAX_RECORDS) return json(res, 507, { error: "Message storage is full" });
          const message = { id: randomUUID(), from: id, text, atISO: new Date().toISOString() };
          const next = { ...data, messages: [...data.messages, message] }; saveData(dataPath, next); data = next;
          return json(res, 201, { message });
        }
        if (url.pathname === "/api/crew/alerts") {
          const input = await body(req); const text = object(input) ? safeText(input.text, 400) : null;
          if (!text || !CREW_IDS.includes(input.about) || !(input.to === "all" || CREW_IDS.includes(input.to))) return json(res, 400, { error: "Choose valid crew members and enter a notice" });
          if (data.alerts.length >= MAX_RECORDS) return json(res, 507, { error: "Notice storage is full" });
          const alert = { id: randomUUID(), from: id, about: input.about, to: input.to, text, atISO: new Date().toISOString(), readBy: [] };
          const next = { ...data, alerts: [...data.alerts, alert] }; saveData(dataPath, next); data = next;
          return json(res, 201, { alert });
        }
        const match = url.pathname.match(/^\/api\/crew\/alerts\/([a-f0-9-]+)\/read$/);
        if (match) {
          const alert = data.alerts.find((a) => a.id === match[1]);
          if (!alert || !(alert.to === "all" || alert.to === id)) return json(res, 404, { error: "Notice not found" });
          if (!alert.readBy.includes(id)) { const next = { ...data, alerts: data.alerts.map((a) => a.id === alert.id ? { ...a, readBy: [...a.readBy, id] } : a) }; saveData(dataPath, next); data = next; }
          return json(res, 200, { ok: true });
        }
        return json(res, 404, { error: "Not found" });
      }
      if (req.method !== "GET" && req.method !== "HEAD") return json(res, 405, { error: "Method not allowed" });
      const relative = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname).replace(/^\/+/, "");
      const path = resolve(staticDir, relative);
      if (!(path === resolve(staticDir) || path.startsWith(resolve(staticDir) + sep)) || relative.split(/[\\/]/).some((part) => (part.startsWith(".") || part.endsWith(".local"))) || !existsSync(path)) return json(res, 404, { error: "Not found" });
      const content = readFileSync(path);
      const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json" }[extname(path)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": mime, "X-Content-Type-Options": "nosniff", "Cache-Control": relative === "index.html" || relative === "sw.js" ? "no-cache" : "public, max-age=3600" }); res.end(req.method === "HEAD" ? undefined : content);
    } catch (error) { if (!res.headersSent) json(res, error?.message === "too_large" ? 413 : error?.message === "invalid_json" ? 400 : 500, { error: error?.message === "too_large" ? "Request too large" : error?.message === "invalid_json" ? "Invalid JSON" : "Server error; data was not saved" }); else res.end(); }
  });
}

export function startCrewServer() {
  const root = process.cwd(); mkdirSync(root, { recursive: true });
  const credentialsPath = resolve(root, "crew-credentials.local");
  const dataPath = resolve(root, "crew-messages.local");
  const staticDir = resolve(root, "dist");
  if (!existsSync(resolve(staticDir, "index.html"))) throw new Error("Build the app first with npm run build.");
  const server = createCrewServer({ credentialsPath, dataPath, staticDir });
  const host = process.env.CREW_HOST || "127.0.0.1";
  const port = Number(process.env.CREW_PORT || 8787);
  server.listen(port, host, () => { console.log(`Crew service listening on ${host}:${port}. Access codes: ${credentialsPath}`); console.log("Prototype service: use only a trusted network and test data; no built-in HTTPS or medical-grade security."); });
  return server;
}
