import { describe, expect, it } from "vitest";
import { formatXml, minifyXml } from "./xml-format";

describe("xml formatting", () => {
  const src = '<?xml version="1.0"?><!-- note --><catalog><book id="1" title="a > b"><name>Gita</name><tags/><![CDATA[<raw>]]></book><empty></empty></catalog>';
  it("pretty-prints with inline text elements", () => {
    expect(formatXml(src)).toBe(
      [
        '<?xml version="1.0"?>',
        "<!-- note -->",
        "<catalog>",
        '  <book id="1" title="a > b">',
        "    <name>Gita</name>",
        "    <tags/>",
        "    <![CDATA[<raw>]]>",
        "  </book>",
        "  <empty></empty>",
        "</catalog>",
        "",
      ].join("\n"),
    );
  });
  it("minifies and drops comments", () => {
    expect(minifyXml(formatXml(src))).toBe('<?xml version="1.0"?><catalog><book id="1" title="a > b"><name>Gita</name><tags/><![CDATA[<raw>]]></book><empty></empty></catalog>');
  });
});
