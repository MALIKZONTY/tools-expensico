import { describe, expect, it } from "vitest";
import { minifyCss } from "./css-minify";

describe("minifyCss", () => {
  it("removes comments and whitespace", () => {
    expect(minifyCss("/* c */\na {\n  color: red;\n  margin: 0 auto;\n}\n")).toBe("a{color:red;margin:0 auto}");
  });
  it("keeps spaces that matter", () => {
    expect(minifyCss("a { width: calc(100% - 2px + 1em); }")).toBe("a{width:calc(100% - 2px + 1em)}");
    expect(minifyCss("nav :hover { x: y }")).toBe("nav :hover{x:y}");
    expect(minifyCss("a > b , c ~ d { }")).toBe("a>b,c ~ d{}");
  });
  it("preserves strings and url()", () => {
    expect(minifyCss('a::before { content: "  /* not a comment */  "; }')).toBe('a::before{content:"  /* not a comment */  "}');
    expect(minifyCss("a { background: url( data:image/png;base64,AA== ) }")).toBe("a{background:url( data:image/png;base64,AA== )}");
  });
  it("handles at-rules", () => {
    expect(minifyCss("@media (max-width: 600px) {\n  a { color: red; }\n}")).toBe("@media (max-width:600px){a{color:red}}");
  });
});
