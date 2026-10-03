import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALLOWED, extensionOf, magicMatches, parseOperation, safeBaseName } from "./validate.ts";

describe("upload validation", () => {
  it("sanitises file names", () => {
    assert.equal(safeBaseName("../../etc/passwd"), "passwd");
    assert.equal(safeBaseName("C:\\Users\\x\\My Report (final).docx"), "My_Report_final.docx");
    assert.equal(safeBaseName("$(rm -rf).doc"), "rm_-rf.doc");
    assert.equal(safeBaseName("..."), "document");
  });
  it("checks magic bytes against the extension", () => {
    assert.equal(magicMatches("docx", new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0])), true);
    assert.equal(magicMatches("docx", new TextEncoder().encode("%PDF-1.7")), false);
    assert.equal(magicMatches("pdf", new TextEncoder().encode("%PDF-1.7")), true);
    assert.equal(magicMatches("doc", new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])), true);
    assert.equal(magicMatches("rtf", new TextEncoder().encode("{\\rtf1 hello")), true);
    assert.equal(magicMatches("exe", new Uint8Array([0x4d, 0x5a])), false);
  });
  it("allowlists extensions per operation", () => {
    assert.equal(ALLOWED["office-to-pdf"].has(extensionOf("a.DOCX")), true);
    assert.equal(ALLOWED["office-to-pdf"].has(extensionOf("a.html")), false);
    assert.equal(ALLOWED["pdf-compress"].has(extensionOf("a.pdf")), true);
  });
  it("parses only known operations", () => {
    assert.deepEqual(parseOperation('{"kind":"office-to-pdf"}'), { kind: "office-to-pdf" });
    assert.deepEqual(parseOperation('{"kind":"pdf-compress","level":"ebook"}'), { kind: "pdf-compress", level: "ebook" });
    assert.equal(parseOperation('{"kind":"pdf-compress","level":"-dNOSAFER"}'), null);
    assert.equal(parseOperation('{"kind":"shell"}'), null);
    assert.equal(parseOperation("nope"), null);
  });
});
