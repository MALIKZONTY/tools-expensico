"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Checkbox, Range } from "@/components/ui/field";
import { entropyBits, generatePassword, poolSize, strengthLabel, type PasswordOptions } from "@/lib/text/password";

export default function PasswordGenerator() {
  const [o, setO] = useState<PasswordOptions>({ length: 20, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const regen = useCallback(() => {
    try {
      setPasswords(Array.from({ length: 5 }, () => generatePassword(o)));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setPasswords([]);
    }
  }, [o]);
  // Random values must be generated in the browser after hydration (not during the server render), so this effect is intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(regen, [regen]);

  const bits = entropyBits(o.length, poolSize(o));
  const strength = strengthLabel(bits);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="pw-len" className="text-sm font-semibold">Length: <span className="tabular-nums">{o.length}</span></label>
          <Badge tone={strength.tone}>{strength.label} · ~{Math.round(bits)} bits</Badge>
        </div>
        <Range id="pw-len" min={6} max={64} step={1} value={o.length} onChange={(e) => setO({ ...o, length: Number(e.target.value) })} />
      </div>
      <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <legend className="sr-only">Character types</legend>
        <Checkbox label="Lowercase (a–z)" checked={o.lower} onChange={(e) => setO({ ...o, lower: e.target.checked })} />
        <Checkbox label="Uppercase (A–Z)" checked={o.upper} onChange={(e) => setO({ ...o, upper: e.target.checked })} />
        <Checkbox label="Numbers (0–9)" checked={o.digits} onChange={(e) => setO({ ...o, digits: e.target.checked })} />
        <Checkbox label="Symbols (!@#…)" checked={o.symbols} onChange={(e) => setO({ ...o, symbols: e.target.checked })} />
        <Checkbox className="sm:col-span-2" label="Avoid look-alike characters" description="Leaves out I, l, 1, O, 0, o and quotes — handy if you'll type the password by hand." checked={o.excludeAmbiguous} onChange={(e) => setO({ ...o, excludeAmbiguous: e.target.checked })} />
      </fieldset>
      {error ? (
        <p className="text-sm text-danger" role="alert">{error}</p>
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Generated passwords">
          {passwords.map((p, i) => (
            <li key={`${p}-${i}`} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 py-1.5 pl-3 pr-1.5">
              <code className="min-w-0 flex-1 break-all font-mono text-[15px]">{p}</code>
              <CopyButton value={p} size="icon-sm" variant="ghost" label="Copy password" />
            </li>
          ))}
        </ul>
      )}
      <Button variant="secondary" onClick={regen} className="self-start"><RefreshCw aria-hidden /> Generate new</Button>
      <p className="text-xs text-muted">Generated on your device with <code>crypto.getRandomValues</code>. Passwords are never sent or stored.</p>
    </div>
  );
}
