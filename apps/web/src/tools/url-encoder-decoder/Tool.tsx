"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Segmented } from "@/components/ui/segmented";
import { Workbench } from "@/components/tool/Workbench";
import { decodeURIComponentSafe, parseUrl } from "@/lib/dev/encoding";

type Mode = "encode-component" | "encode-uri" | "decode";

export default function UrlEncoderDecoder() {
  const [mode, setMode] = useState<Mode>("encode-component");
  const [input, setInput] = useState("https://expensico.com/search?q=pdf to jpg&lang=hi");
  const r = useMemo(() => {
    try {
      if (mode === "encode-component") return { out: encodeURIComponent(input), error: null };
      if (mode === "encode-uri") return { out: encodeURI(input), error: null };
      return { out: decodeURIComponent(input.replace(/\+/g, " ")), error: null };
    } catch {
      return { out: "", error: "The input contains a malformed % escape sequence (for example a lone % or an incomplete %E2%82)." };
    }
  }, [input, mode]);
  const parts = useMemo(() => {
    const candidate = mode === "decode" ? r.out : input;
    try {
      return /^[a-z][a-z0-9+.-]*:\/\//i.test(candidate.trim()) ? parseUrl(candidate) : null;
    } catch {
      return null;
    }
  }, [input, mode, r.out]);

  return (
    <div className="flex flex-col gap-4">
      <Workbench
        inputLabel="Input"
        outputLabel="Result"
        input={input}
        onInput={setInput}
        output={r.out}
        invalid={Boolean(r.error)}
        fileName="url.txt"
        toolbar={
          <Segmented
            label="Operation"
            value={mode}
            onChange={setMode}
            options={[
              { value: "encode-component", label: "Encode component" },
              { value: "encode-uri", label: "Encode full URL" },
              { value: "decode", label: "Decode" },
            ]}
          />
        }
        status={r.error ? <Alert tone="danger" role="alert">{r.error}</Alert> : null}
      />
      {parts && (
        <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="url-parts">
          <h2 id="url-parts" className="text-lg font-semibold">URL breakdown</h2>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
            {(
              [
                ["Protocol", parts.protocol],
                ["Host", parts.host],
                ["Port", parts.port || "(default)"],
                ["Path", parts.pathname],
                ["Fragment", parts.hash || "—"],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="break-all font-mono">{v}</dd>
              </div>
            ))}
          </dl>
          {parts.params.length > 0 && (
            <div className="table-scroll mt-4 rounded-lg border border-border">
              <table className="w-full text-sm">
                <caption className="sr-only">Query parameters</caption>
                <thead className="bg-surface-2 text-left text-muted">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Parameter</th>
                    <th scope="col" className="px-3 py-2 font-medium">Decoded value</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.params.map(([k, v], i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 font-mono">{k}</td>
                      <td className="break-all px-3 py-2 font-mono">{decodeURIComponentSafe(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
