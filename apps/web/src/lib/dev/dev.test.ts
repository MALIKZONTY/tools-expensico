import { describe, expect, it } from "vitest";
import { decodeBase64, encodeBase64, parseUrl } from "./encoding";
import { decodeJwt, timeStatus, verifyHmac } from "./jwt";
import { inspectUuid, uuidV4, uuidV7 } from "./uuid";
import { md5Hex } from "./md5";
import { nextRuns, parseCron } from "./cron";
import { contrastRatio, parseColor, rgbToCmyk, rgbToHsl, rgbToOklch, toHex } from "./color";

describe("base64", () => {
  it("round-trips UTF-8", () => {
    expect(encodeBase64("hello")).toBe("aGVsbG8=");
    expect(encodeBase64("₹ नमस्ते")).toBe("4oK5IOCkqOCkruCkuOCljeCkpOClhw==");
    expect(decodeBase64("4oK5IOCkqOCkruCkuOCljeCkpOClhw==").text).toBe("₹ नमस्ते");
  });
  it("supports base64url without padding and data URLs", () => {
    expect(encodeBase64("??>", true)).toBe("Pz8-");
    expect(decodeBase64("Pz8-").text).toBe("??>");
    expect(decodeBase64("data:text/plain;base64,aGk=").text).toBe("hi");
  });
  it("rejects invalid input and flags binary", () => {
    expect(() => decodeBase64("not*base64")).toThrow();
    expect(decodeBase64("//79").isText).toBe(false);
  });
});

describe("url", () => {
  it("parses parts and query params", () => {
    const p = parseUrl("https://user@example.com:8080/a%20b?q=x%26y&n=1#top");
    expect(p.host).toBe("example.com");
    expect(p.port).toBe("8080");
    expect(p.pathname).toBe("/a b");
    expect(p.params).toEqual([["q", "x&y"], ["n", "1"]]);
  });
});

describe("jwt", () => {
  // Classic jwt.io example token signed with "your-256-bit-secret".
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  it("decodes header and payload", () => {
    const d = decodeJwt(`Bearer ${token}`);
    expect(d.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(d.payload.sub).toBe("1234567890");
    expect(timeStatus(d.payload).kind).toBe("no-expiry");
  });
  it("verifies HS256", async () => {
    const d = decodeJwt(token);
    expect(await verifyHmac(d, "your-256-bit-secret")).toBe(true);
    expect(await verifyHmac(d, "wrong")).toBe(false);
  });
  it("reports expiry", () => {
    expect(timeStatus({ exp: 100 }, 200_000).kind).toBe("expired");
    expect(timeStatus({ exp: 300 }, 200_000).kind).toBe("valid");
    expect(timeStatus({ nbf: 300 }, 200_000).kind).toBe("not-yet-valid");
  });
  it("explains malformed tokens", () => {
    expect(() => decodeJwt("abc.def")).toThrow(/three parts/);
    expect(() => decodeJwt("a.b.c.d.e")).toThrow(/encrypted/);
  });
});

describe("uuid", () => {
  it("generates valid v4 and v7", () => {
    expect(inspectUuid(uuidV4())).toMatchObject({ valid: true, version: 4, variant: "RFC 9562" });
    const v7 = uuidV7(1_700_000_000_000);
    expect(inspectUuid(v7)).toMatchObject({ valid: true, version: 7 });
    expect(inspectUuid(v7).timestamp?.getTime()).toBe(1_700_000_000_000);
    expect(inspectUuid("not-a-uuid").valid).toBe(false);
  });
  it("v7 sorts by time", () => {
    expect(uuidV7(1000) < uuidV7(2000)).toBe(true);
  });
});

describe("md5", () => {
  it("matches RFC 1321 test vectors", () => {
    expect(md5Hex("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
    expect(md5Hex("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
    expect(md5Hex("message digest")).toBe("f96b697d7cb7938d525a2f31aaf161d0");
    expect(md5Hex("12345678901234567890123456789012345678901234567890123456789012345678901234567890")).toBe("57edf4a22be3c955ac49da2e2107b67a");
  });
});

describe("cron", () => {
  it("parses fields, names, steps and macros", () => {
    const c = parseCron("*/15 9-17 * * mon-fri");
    expect([...c.minute.values]).toEqual([0, 15, 30, 45]);
    expect(c.hour.values.size).toBe(9);
    expect([...c.dow.values]).toEqual([1, 2, 3, 4, 5]);
    expect(() => parseCron("* * *")).toThrow(/5 fields/);
    expect(() => parseCron("61 * * * *")).toThrow(/minute/);
    expect(parseCron("@daily").hour.values.has(0)).toBe(true);
  });
  it("computes next runs", () => {
    const from = new Date(2026, 0, 1, 10, 7); // Thu 1 Jan 2026 10:07 local
    expect(nextRuns("*/15 * * * *", 2, from).map((d) => d.getMinutes())).toEqual([15, 30]);
    const weekday = nextRuns("0 9 * * 1", 1, from)[0];
    expect(weekday.getDay()).toBe(1);
    expect(weekday.getHours()).toBe(9);
    expect(nextRuns("0 0 29 2 *", 1, from)[0].getFullYear()).toBe(2028);
  });
  it("uses OR semantics when both day fields are set", () => {
    const from = new Date(2026, 0, 1, 0, 0);
    const runs = nextRuns("0 0 13 * 5", 3, from);
    expect(runs.every((d) => d.getDate() === 13 || d.getDay() === 5)).toBe(true);
  });
});

describe("color", () => {
  it("parses and converts", () => {
    const c = parseColor("#0d7a63")!;
    expect(c).toEqual({ r: 13, g: 122, b: 99, a: 1 });
    expect(toHex(parseColor("rgb(255, 0, 128)")!)).toBe("#ff0080");
    expect(toHex(parseColor("hsl(0, 100%, 50%)")!)).toBe("#ff0000");
    expect(toHex(parseColor("#abc")!)).toBe("#aabbcc");
    expect(parseColor("nope")).toBeNull();
    expect(rgbToHsl({ r: 255, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToCmyk({ r: 0, g: 0, b: 0, a: 1 }).k).toBe(100);
    expect(rgbToOklch({ r: 255, g: 255, b: 255, a: 1 }).l).toBeCloseTo(100, 0);
  });
  it("computes WCAG contrast", () => {
    expect(contrastRatio(parseColor("#000")!, parseColor("#fff")!)).toBeCloseTo(21, 5);
    expect(contrastRatio(parseColor("#777")!, parseColor("#fff")!)).toBeCloseTo(4.48, 2);
  });
});

describe("cron sunday", () => {
  it("treats 7 as Sunday", () => {
    expect([...parseCron("0 0 * * 7").dow.values]).toEqual([0]);
    expect([...parseCron("0 0 * * 5-7").dow.values].sort()).toEqual([0, 5, 6]);
  });
});
