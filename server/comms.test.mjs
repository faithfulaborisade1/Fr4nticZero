import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createCrewServer } from "./comms.mjs";

async function start(dir) {
  const server = createCrewServer({ credentialsPath: join(dir, "credentials.local"), dataPath: join(dir, "messages.local"), staticDir: dir });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  return { server, base: `http://127.0.0.1:${server.address().port}`, codes: JSON.parse(readFileSync(join(dir, "credentials.local"), "utf8")).codes };
}
async function request(base, path, code, value = {}) {
  const response = await fetch(`${base}/api/crew/${path}`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${code}` }, body: JSON.stringify(value) });
  return { status: response.status, data: await response.json() };
}
async function close(server) { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }

test("separate clients exchange messages and target notices; records survive restart", async () => {
  const dir = mkdtempSync(join(tmpdir(), "decision-window-comms-")); writeFileSync(join(dir, "index.html"), "test");
  let instance;
  try {
    instance = await start(dir);
    const { base, codes } = instance;
    assert.equal((await request(base, "session", "bad-code")).status, 401);
    assert.equal((await request(base, "session", codes.alex)).data.crewId, "alex");
    const sent = await request(base, "messages", codes.alex, { text: "Hello crew" });
    assert.equal(sent.status, 201);
    assert.equal((await request(base, "feed", codes.sam)).data.messages[0].from, "alex");
    const notice = await request(base, "alerts", codes.alex, { about: "noor", to: "sam", text: "Please check in" });
    assert.equal(notice.status, 201);
    assert.equal((await request(base, "feed", codes.sam)).data.alerts.length, 1);
    assert.equal((await request(base, "feed", codes.noor)).data.alerts.length, 0);
    assert.equal((await request(base, `alerts/${notice.data.alert.id}/read`, codes.noor)).status, 404);
    assert.equal((await request(base, `alerts/${notice.data.alert.id}/read`, codes.sam)).status, 200);
    assert.deepEqual((await request(base, "feed", codes.sam)).data.alerts[0].readBy, ["sam"]);
    assert.equal((await request(base, "alerts", codes.alex, { about: "unknown", to: "sam", text: "x" })).status, 400);
    assert.equal((await request(base, "messages", codes.sam, { text: "  " })).status, 400);
    await close(instance.server); instance = await start(dir);
    const recovered = await request(instance.base, "feed", instance.codes.sam);
    assert.equal(recovered.data.messages[0].text, "Hello crew");
    assert.deepEqual(recovered.data.alerts[0].readBy, ["sam"]);
  } finally { if (instance?.server.listening) await close(instance.server); rmSync(dir, { recursive: true, force: true }); }
});

test("rejects cross-origin API calls and does not serve secrets", async () => {
  const dir = mkdtempSync(join(tmpdir(), "decision-window-comms-")); writeFileSync(join(dir, "index.html"), "test"); writeFileSync(join(dir, "sw.js"), "// service worker");
  const instance = await start(dir);
  try {
    const cross = await fetch(`${instance.base}/api/crew/feed`, { method: "POST", headers: { authorization: `Bearer ${instance.codes.alex}`, origin: "https://other.example" } });
    assert.equal(cross.status, 403);
    const secret = await fetch(`${instance.base}/credentials.local`);
    // Production stores secrets outside dist; never expose them even if misconfigured.
    assert.notEqual(secret.status, 200);
    const worker = await fetch(`${instance.base}/sw.js`);
    assert.equal(worker.headers.get("cache-control"), "no-cache");
  } finally { await close(instance.server); rmSync(dir, { recursive: true, force: true }); }
});
