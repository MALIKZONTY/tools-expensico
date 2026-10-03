/**
 * Conservative CSS minifier: strips comments and redundant whitespace without touching
 * strings, url() contents or spaces that change meaning (calc() operators, descendant
 * combinators before pseudo-classes).
 */
export function minifyCss(css: string): string {
  let out = "";
  let i = 0;
  const n = css.length;
  let pendingSpace = false;

  const lastChar = () => out[out.length - 1] ?? "";
  const flushSpace = (next: string) => {
    if (!pendingSpace) return;
    pendingSpace = false;
    const prev = lastChar();
    // Drop spaces next to punctuation where whitespace is never significant.
    if (prev === "" || "{};,>(".includes(prev) || "{};,>)".includes(next) || prev === ":" ) return;
    out += " ";
  };

  while (i < n) {
    const c = css[i];
    // Comments
    if (c === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      pendingSpace = true;
      continue;
    }
    // Strings
    if (c === '"' || c === "'") {
      flushSpace(c);
      let j = i + 1;
      while (j < n && css[j] !== c) {
        if (css[j] === "\\") j++;
        j++;
      }
      out += css.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    // url(...) without quotes: copy verbatim
    if (css.slice(i, i + 4).toLowerCase() === "url(" && css[i + 4] !== '"' && css[i + 4] !== "'") {
      flushSpace("u");
      const end = css.indexOf(")", i);
      const stop = end === -1 ? n : end + 1;
      out += css.slice(i, stop);
      i = stop;
      continue;
    }
    if (/\s/.test(c)) {
      pendingSpace = true;
      i++;
      continue;
    }
    if (c === "}" && lastChar() === ";") out = out.slice(0, -1);
    flushSpace(c);
    out += c;
    i++;
  }
  return out.trim();
}
