/** Lazy Prettier loader — only formatter pages download it. */
export async function prettierFormat(code: string, parser: "babel" | "typescript" | "html" | "css" | "scss" | "less", options: Record<string, unknown> = {}): Promise<string> {
  const [prettier, estree] = await Promise.all([import("prettier/standalone"), import("prettier/plugins/estree")]);
  const plugins: unknown[] = [estree];
  if (parser === "babel") plugins.push(await import("prettier/plugins/babel"));
  if (parser === "typescript") plugins.push(await import("prettier/plugins/typescript"));
  if (parser === "html") plugins.push(await import("prettier/plugins/html"), await import("prettier/plugins/babel"), await import("prettier/plugins/postcss"));
  if (parser === "css" || parser === "scss" || parser === "less") plugins.push(await import("prettier/plugins/postcss"));
  return prettier.format(code, { parser, plugins: plugins as never[], ...options });
}
