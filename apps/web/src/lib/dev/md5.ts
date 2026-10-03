/**
 * MD5 (RFC 1321). Web Crypto doesn't provide MD5, but it's still widely used for
 * non-security checksums, so it's implemented here. Not for passwords or signatures.
 */

const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);

export class Md5 {
  private a = 0x67452301;
  private b = 0xefcdab89;
  private c = 0x98badcfe;
  private d = 0x10325476;
  private buffer = new Uint8Array(64);
  private bufLen = 0;
  private total = 0;
  private w = new Uint32Array(16);

  update(data: Uint8Array): this {
    this.total += data.length;
    let i = 0;
    if (this.bufLen) {
      const take = Math.min(64 - this.bufLen, data.length);
      this.buffer.set(data.subarray(0, take), this.bufLen);
      this.bufLen += take;
      i = take;
      if (this.bufLen === 64) {
        this.block(this.buffer, 0);
        this.bufLen = 0;
      }
    }
    for (; i + 64 <= data.length; i += 64) this.block(data, i);
    if (i < data.length) {
      this.buffer.set(data.subarray(i), 0);
      this.bufLen = data.length - i;
    }
    return this;
  }

  private block(d: Uint8Array, o: number) {
    const w = this.w;
    for (let i = 0; i < 16; i++) w[i] = d[o + i * 4] | (d[o + i * 4 + 1] << 8) | (d[o + i * 4 + 2] << 16) | (d[o + i * 4 + 3] << 24);
    let a = this.a, b = this.b, c = this.c, dd = this.d;
    for (let i = 0; i < 64; i++) {
      let f: number, g: number;
      if (i < 16) { f = (b & c) | (~b & dd); g = i; }
      else if (i < 32) { f = (dd & b) | (~dd & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ dd; g = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~dd); g = (7 * i) % 16; }
      const tmp = dd;
      dd = c;
      c = b;
      const x = (a + f + K[i] + w[g]) >>> 0;
      b = (b + ((x << S[i]) | (x >>> (32 - S[i])))) >>> 0;
      a = tmp;
    }
    this.a = (this.a + a) >>> 0;
    this.b = (this.b + b) >>> 0;
    this.c = (this.c + c) >>> 0;
    this.d = (this.d + dd) >>> 0;
  }

  digestHex(): string {
    const bits = this.total * 8;
    const padLen = this.bufLen < 56 ? 56 - this.bufLen : 120 - this.bufLen;
    const pad = new Uint8Array(padLen + 8);
    pad[0] = 0x80;
    const lo = bits >>> 0;
    const hi = Math.floor(bits / 2 ** 32) >>> 0;
    for (let i = 0; i < 4; i++) {
      pad[padLen + i] = (lo >>> (8 * i)) & 0xff;
      pad[padLen + 4 + i] = (hi >>> (8 * i)) & 0xff;
    }
    const saved = this.total;
    this.update(pad);
    this.total = saved;
    return [this.a, this.b, this.c, this.d].map((v) => [0, 8, 16, 24].map((s) => ((v >>> s) & 0xff).toString(16).padStart(2, "0")).join("")).join("");
  }
}

export function md5Hex(data: Uint8Array | string): string {
  return new Md5().update(typeof data === "string" ? new TextEncoder().encode(data) : data).digestHex();
}
