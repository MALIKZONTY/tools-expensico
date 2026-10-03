/**
 * XML pretty-printer / minifier that preserves comments, CDATA, processing instructions
 * and DOCTYPE. Elements containing only text stay on one line.
 */

type Token =
  | { t: "open"; raw: string; name: string }
  | { t: "close"; raw: string }
  | { t: "self"; raw: string }
  | { t: "text"; raw: string }
  | { t: "other"; raw: string };

export function tokenizeXml(xml: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < xml.length) {
    if (xml[i] !== "<") {
      const j = xml.indexOf("<", i);
      const end = j === -1 ? xml.length : j;
      out.push({ t: "text", raw: xml.slice(i, end) });
      i = end;
      continue;
    }
    const startsWith = (s: string) => xml.startsWith(s, i);
    let end: number;
    if (startsWith("<!--")) end = xml.indexOf("-->", i) + 3;
    else if (startsWith("<![CDATA[")) end = xml.indexOf("]]>", i) + 3;
    else if (startsWith("<?")) end = xml.indexOf("?>", i) + 2;
    else if (startsWith("<!")) {
      // DOCTYPE may contain an internal subset in [...]
      let depth = 0;
      end = i;
      for (let k = i; k < xml.length; k++) {
        if (xml[k] === "[") depth++;
        else if (xml[k] === "]") depth--;
        else if (xml[k] === ">" && depth === 0) {
          end = k + 1;
          break;
        }
      }
    } else {
      // Tag: find closing > outside quotes
      let q: string | null = null;
      end = -1;
      for (let k = i + 1; k < xml.length; k++) {
        const c = xml[k];
        if (q) {
          if (c === q) q = null;
        } else if (c === '"' || c === "'") q = c;
        else if (c === ">") {
          end = k + 1;
          break;
        }
      }
    }
    if (end <= i) throw new Error("Unclosed markup near the end of the document.");
    const raw = xml.slice(i, end);
    if (raw.startsWith("</")) out.push({ t: "close", raw });
    else if (raw.startsWith("<!") || raw.startsWith("<?")) out.push({ t: "other", raw });
    else if (raw.endsWith("/>")) out.push({ t: "self", raw });
    else out.push({ t: "open", raw, name: raw.slice(1).split(/[\s/>]/)[0] });
    i = end;
  }
  return out;
}

export function formatXml(xml: string, indent = "  "): string {
  const tokens = tokenizeXml(xml.trim());
  const lines: string[] = [];
  let depth = 0;
  for (let k = 0; k < tokens.length; k++) {
    const tok = tokens[k];
    const pad = indent.repeat(depth);
    if (tok.t === "text") {
      const text = tok.raw.trim();
      if (text) lines.push(pad + text);
      continue;
    }
    if (tok.t === "open") {
      // <a>text</a> stays on one line
      const next = tokens[k + 1];
      const after = tokens[k + 2];
      if (next?.t === "text" && after?.t === "close" && !next.raw.includes("\n")) {
        lines.push(pad + tok.raw + next.raw.trim() + after.raw);
        k += 2;
        continue;
      }
      if (next?.t === "close") {
        lines.push(pad + tok.raw + next.raw);
        k += 1;
        continue;
      }
      lines.push(pad + tok.raw);
      depth++;
      continue;
    }
    if (tok.t === "close") {
      depth = Math.max(0, depth - 1);
      lines.push(indent.repeat(depth) + tok.raw);
      continue;
    }
    lines.push(pad + tok.raw);
  }
  return lines.join("\n") + "\n";
}

export function minifyXml(xml: string): string {
  return tokenizeXml(xml.trim())
    .filter((t) => !(t.t === "text" && !t.raw.trim()))
    .filter((t) => !(t.t === "other" && t.raw.startsWith("<!--")))
    .map((t) => (t.t === "text" ? t.raw.trim() : t.raw))
    .join("");
}
