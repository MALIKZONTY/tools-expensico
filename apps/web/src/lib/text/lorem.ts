const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nulla gravida orci a odio nullam varius turpis et commodo pharetra eros bibendum elit nec luctus magna felis sollicitudin mauris integer in mauris eu nibh euismod gravida duis ac tellus et risus vulputate vehicula donec lobortis risus a elit etiam tempor ut ullamcorper ligula eu tempor congue eros est euismod turpis id tincidunt sapien risus a quam maecenas fermentum consequat mi donec fermentum pellentesque malesuada nulla a mi duis sapien sem aliquet nec commodo eget consequat quis neque aliquam faucibus".split(" ");
const CLASSIC = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export type LoremUnit = "paragraphs" | "sentences" | "words";

function pick(rand: () => number) {
  return WORDS[Math.floor(rand() * WORDS.length)];
}

function sentence(rand: () => number): string {
  const n = 6 + Math.floor(rand() * 10);
  const ws = Array.from({ length: n }, () => pick(rand));
  if (n > 9 && rand() > 0.5) ws[Math.floor(n / 2)] += ",";
  const s = ws.join(" ");
  return s[0].toUpperCase() + s.slice(1) + ".";
}

export function lorem(unit: LoremUnit, count: number, classic = true, html = false, rand: () => number = Math.random): string {
  if (unit === "words") {
    const base = classic ? CLASSIC.replace(/[,.]/g, "").toLowerCase().split(" ") : [];
    const ws = [...base];
    while (ws.length < count) ws.push(pick(rand));
    const out = ws.slice(0, count).join(" ");
    return out[0].toUpperCase() + out.slice(1);
  }
  if (unit === "sentences") {
    const ss = Array.from({ length: count }, (_, i) => (i === 0 && classic ? CLASSIC : sentence(rand)));
    return ss.join(" ");
  }
  const paras = Array.from({ length: count }, (_, i) => {
    const n = 4 + Math.floor(rand() * 4);
    const ss = Array.from({ length: n }, (_, j) => (i === 0 && j === 0 && classic ? CLASSIC : sentence(rand)));
    return ss.join(" ");
  });
  return html ? paras.map((p) => `<p>${p}</p>`).join("\n") : paras.join("\n\n");
}
