import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { ConverterMount } from "./ConverterMount";
import { JsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";
import { processorConfig } from "@/config/site";
import { CONVERSIONS, isConversionAvailable, type ConversionDef } from "@/lib/convert/catalog";
import { FORMATS, type FormatId } from "@/lib/convert/formats";

export const metadata = pageMetadata({
  title: "Free File Converter — PDF, Images, Excel, CSV, JSON, Word",
  description: "Convert files between PDF, JPG, PNG, WebP, Excel, CSV, JSON, XML, YAML, Word and more. We detect your file type and only offer conversions that work reliably.",
  path: "/convert",
});

const QUALITY = { exact: { t: "Exact", tone: "success" }, high: { t: "High fidelity", tone: "info" }, basic: { t: "Basic", tone: "warning" } } as const;

function label(id: FormatId) {
  return FORMATS[id].label.replace(/ \(.*\)$/, "");
}

export default function Page() {
  const landing = CONVERSIONS.filter((c) => c.landing && isConversionAvailable(c));
  const groups = new Map<FormatId, ConversionDef[]>();
  for (const c of landing) groups.set(c.from, [...(groups.get(c.from) ?? []), c]);

  return (
    <>
      <JsonLd data={webAppJsonLd({ name: "Expensico File Converter", description: "Convert files between common formats in your browser.", path: "/convert", category: "UtilitiesApplication" })} />
      <Container className="pb-16 pt-5 sm:pt-6">
        <Breadcrumbs items={[{ name: "Convert", href: "/convert" }]} />
        <header className="mt-6 max-w-3xl">
          <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-fg sm:text-4xl">File converter</h1>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
            Drop a file and we&apos;ll detect what it really is, then show only the formats we can convert it to reliably — with an honest note on how faithful each conversion is.
          </p>
        </header>

        <div className="mt-8">
          <ConverterMount />
        </div>

        <section aria-labelledby="matrix-h" className="mt-16">
          <h2 id="matrix-h" className="text-2xl font-semibold tracking-tight">Supported conversions</h2>
          <p className="mt-2 max-w-3xl text-muted">
            Conversions marked <strong className="text-fg">Exact</strong> preserve all data. <strong className="text-fg">High fidelity</strong> conversions are reliable with minor differences (such as image compression). <strong className="text-fg">Basic</strong> conversions are useful but simplified, for example extracting only the text from a PDF.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...groups.entries()].map(([from, defs]) => (
              <section key={from} className="rounded-xl border border-border bg-surface p-4">
                <h3 className="font-semibold text-fg">From {label(from)}</h3>
                <ul className="mt-3 flex flex-col gap-1">
                  {defs.map((d) => {
                    const q = QUALITY[d.quality];
                    return (
                      <li key={d.slug} className="flex items-center justify-between gap-2">
                        <Link href={`/convert/${d.slug}`} className="rounded py-1 text-[0.9375rem] text-fg hover:text-brand hover:underline">
                          {label(d.from)} → {label(d.to)}
                        </Link>
                        <Badge tone={q.tone}>{q.t}</Badge>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <section className="prose-ex mt-16">
          <h2 className="!mt-0">How the converter decides what&apos;s possible</h2>
          <p>
            File extensions can be wrong or missing, so Expensico reads the first bytes of your file to identify its real format — every PDF starts with <code>%PDF-</code>, every PNG with the same eight-byte signature, and Office documents are ZIP archives with a recognisable internal structure. If the name and contents disagree, we tell you.
          </p>
          <p>
            We then look up that format in our capability matrix. It lists every conversion we&apos;ve implemented and tested, along with its fidelity. We deliberately don&apos;t list conversions that can&apos;t be done well. For example, there is no “PDF to Excel” button, because turning arbitrary PDF tables into spreadsheet cells is unreliable.
          </p>
          <h2>Is my file uploaded?</h2>
          <p>
            {processorConfig.enabled
              ? "Almost all conversions run entirely in your browser using JavaScript, so your file never leaves your device. A small number of office-document conversions need a full office suite and run on our conversion server instead. Those are clearly marked with an upload icon, ask for confirmation, and delete your file immediately after converting it."
              : "No. Every conversion runs entirely in your browser using JavaScript, so your file never leaves your device. You can even disconnect from the internet after the page loads and the converter keeps working."}
          </p>
        </section>
      </Container>
    </>
  );
}
