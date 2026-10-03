import { describe, expect, it } from "vitest";
import { StructuredError, jsonErrorLocation, jsonToXml, jsonToYaml, xmlName, xmlToJson, yamlToData } from "./structured";

describe("jsonToXml", () => {
  it("maps objects, arrays and escapes text", () => {
    const xml = jsonToXml({ order: { id: 7, items: [{ sku: "A&B" }, { sku: "<C>" }], note: null } });
    expect(xml).toContain("<root>");
    expect(xml).toContain("<id>7</id>");
    expect(xml).toContain("<sku>A&amp;B</sku>");
    expect(xml).toContain("<sku>&lt;C&gt;</sku>");
    expect(xml).toContain("<note/>");
    expect(xml.match(/<items>/g)).toHaveLength(2);
  });
  it("wraps top-level arrays in item elements", () => {
    expect(jsonToXml([1, 2], "list")).toContain("<list>\n  <item>1</item>\n  <item>2</item>\n</list>");
  });
  it("produces valid element names", () => {
    expect(xmlName("1st value")).toBe("_1st_value");
    expect(xmlName("xmlThing")).toBe("_xmlThing");
    expect(xmlName("नाम")).toBe("नाम");
  });
  it("round-trips through the XML parser", () => {
    const back = xmlToJson(jsonToXml({ a: "x", b: ["1", "2"] }, "r")) as { r: { a: string; b: string[] } };
    expect(back.r).toEqual({ a: "x", b: ["1", "2"] });
  });
});

describe("xmlToJson", () => {
  it("keeps attributes with @ prefix", () => {
    expect(xmlToJson('<p id="3">Hi</p>')).toEqual({ p: { "@id": "3", "#text": "Hi" } });
  });
  it("reports the line of an XML error", () => {
    try {
      xmlToJson("<a>\n<b></a>");
      throw new Error("should fail");
    } catch (e) {
      expect(e).toBeInstanceOf(StructuredError);
      expect((e as StructuredError).line).toBe(2);
    }
  });
});

describe("YAML", () => {
  it("quotes strings YAML 1.1 would misread", () => {
    const y = jsonToYaml({ answer: "yes", zip: "08", n: 8 });
    expect(y).toMatch(/answer: "yes"/);
    expect(y).toMatch(/zip: "08"/);
    expect(y).toMatch(/"n": 8/); // bare n means false in YAML 1.1, so the key is quoted
  });
  it("parses multi-document YAML into an array", () => {
    expect(yamlToData("a: 1\n---\nb: 2\n")).toEqual([{ a: 1 }, { b: 2 }]);
  });
  it("reports line numbers for invalid YAML", () => {
    try {
      yamlToData("a: 1\n b: 2\n  - c");
      throw new Error("should fail");
    } catch (e) {
      expect(e).toBeInstanceOf(StructuredError);
      expect((e as StructuredError).line).toBeGreaterThan(1);
    }
  });
});

describe("jsonErrorLocation", () => {
  it("derives line/column from a character position", () => {
    expect(jsonErrorLocation('{\n  "a": 1,\n}', "Unexpected token } in JSON at position 12")).toEqual({ line: 3, column: 1 });
  });
  it("understands line/column messages", () => {
    expect(jsonErrorLocation("", "JSON.parse: expected ',' at line 4 column 9 of the JSON data")).toEqual({ line: 4, column: 9 });
  });
});
