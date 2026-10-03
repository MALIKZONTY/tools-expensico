import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomNonce, signToken, verifyToken } from "./index.ts";

const SECRET = "x".repeat(40);

describe("processor job tokens", () => {
  it("round-trips a valid token", async () => {
    const t = await signToken({ exp: 2000, n: randomNonce(), op: "office-to-pdf" }, SECRET);
    const r = await verifyToken(t, SECRET, "office-to-pdf", 1000);
    assert.equal(r.ok, true);
  });

  it("rejects expired tokens", async () => {
    const t = await signToken({ exp: 999, n: "a", op: "office-to-pdf" }, SECRET);
    assert.deepEqual(await verifyToken(t, SECRET, "office-to-pdf", 1000), { ok: false, reason: "expired" });
  });

  it("rejects a token for a different operation", async () => {
    const t = await signToken({ exp: 2000, n: "a", op: "pdf-compress" }, SECRET);
    assert.deepEqual(await verifyToken(t, SECRET, "office-to-pdf", 1000), { ok: false, reason: "operation" });
  });

  it("rejects tampered payloads and wrong secrets", async () => {
    const t = await signToken({ exp: 2000, n: "a", op: "office-to-pdf" }, SECRET);
    const [body, sig] = t.split(".");
    const forged = btoa(JSON.stringify({ exp: 9999999999, n: "a", op: "office-to-pdf" })).replace(/=+$/, "");
    assert.equal((await verifyToken(`${forged}.${sig}`, SECRET, "office-to-pdf", 1000)).ok, false);
    assert.equal((await verifyToken(`${body}.${sig}`, "y".repeat(40), "office-to-pdf", 1000)).ok, false);
    assert.deepEqual(await verifyToken("garbage", SECRET, "office-to-pdf", 1000), { ok: false, reason: "malformed" });
  });

  it("refuses weak secrets", async () => {
    await assert.rejects(signToken({ exp: 1, n: "a", op: "office-to-pdf" }, "short"));
  });
});
