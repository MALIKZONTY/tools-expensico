"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { downloadBlob, downloadText } from "@/lib/files/download";
import { contrastRatio, parseColor } from "@/lib/dev/color";
import { emailPayload, isValidVpa, phonePayload, smsPayload, upiPayload, wifiPayload } from "@/lib/qr-payload";

type Kind = "url" | "text" | "wifi" | "upi" | "email" | "phone" | "sms";

export default function QrCodeGenerator() {
  const [kind, setKind] = useState<Kind>("url");
  const [url, setUrl] = useState("https://expensico.com");
  const [text, setText] = useState("");
  const [wifi, setWifi] = useState({ ssid: "", password: "", security: "WPA" as "WPA" | "WEP" | "nopass", hidden: false });
  const [upi, setUpi] = useState({ vpa: "", name: "", amount: "", note: "" });
  const [email, setEmail] = useState({ to: "", subject: "", body: "" });
  const [phone, setPhone] = useState("");
  const [sms, setSms] = useState({ phone: "", message: "" });
  const [ecc, setEcc] = useState<"L" | "M" | "Q" | "H">("M");
  const [dark, setDark] = useState("#111815");
  const [light, setLight] = useState("#ffffff");
  const [size, setSize] = useState(512);
  const [rendered, setRendered] = useState<{ svg: string; error: string | null }>({ svg: "", error: null });
  const setSvg = (svg: string) => setRendered((r) => ({ ...r, svg }));
  const setError = (error: string | null) => setRendered((r) => ({ ...r, error }));

  const payload = useMemo(() => {
    switch (kind) {
      case "url": return url.trim();
      case "text": return text;
      case "wifi": return wifi.ssid ? wifiPayload(wifi) : "";
      case "upi": return isValidVpa(upi.vpa) ? upiPayload(upi) : "";
      case "email": return email.to.trim() ? emailPayload(email) : "";
      case "phone": return phone.replace(/[^\d+]/g, "").length >= 3 ? phonePayload(phone) : "";
      case "sms": return sms.phone.replace(/[^\d+]/g, "").length >= 3 ? smsPayload(sms.phone, sms.message) : "";
    }
  }, [kind, url, text, wifi, upi, email, phone, sms]);

  // Nothing to show until the form describes a valid code.
  const svg = payload ? rendered.svg : "";
  const error = payload ? rendered.error : null;

  const contrast = (() => {
    const d = parseColor(dark);
    const l = parseColor(light);
    return d && l ? contrastRatio(d, l) : 0;
  })();
  const inverted = (() => {
    const d = parseColor(dark);
    const l = parseColor(light);
    return d && l ? d.r + d.g + d.b > l.r + l.g + l.b : false;
  })();

  useEffect(() => {
    if (!payload) return;
    let alive = true;
    import("qrcode")
      .then((QR) => QR.toString(payload, { type: "svg", errorCorrectionLevel: ecc, margin: 2, color: { dark, light } }))
      .then((s) => {
        if (!alive) return;
        setSvg(s);
        setError(null);
      })
      .catch((e: Error) => {
        if (!alive) return;
        setSvg("");
        setError(/too big|amount of data/i.test(e.message) ? "This is too much data for a QR code. Shorten the text or lower the error correction level." : e.message);
      });
    return () => {
      alive = false;
    };
  }, [payload, ecc, dark, light]);

  async function downloadPng() {
    const QR = await import("qrcode");
    const canvas = document.createElement("canvas");
    await QR.toCanvas(canvas, payload, { errorCorrectionLevel: ecc, margin: 2, width: size, color: { dark, light } });
    canvas.toBlob((blob) => blob && downloadBlob(blob, "qr-code.png"), "image/png");
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-label="QR content">
        <Select aria-label="QR code type" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
          <option value="url">Website link</option>
          <option value="text">Plain text</option>
          <option value="wifi">Wi-Fi network</option>
          <option value="upi">UPI payment</option>
          <option value="email">Email</option>
          <option value="phone">Phone call</option>
          <option value="sms">SMS message</option>
        </Select>
        {kind === "url" && <Field label="URL">{(p) => <Input {...p} type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />}</Field>}
        {kind === "text" && <Field label="Text" hint={`${text.length} characters`}>{(p) => <Textarea {...p} value={text} onChange={(e) => setText(e.target.value)} />}</Field>}
        {kind === "wifi" && (
          <>
            <Field label="Network name (SSID)">{(p) => <Input {...p} value={wifi.ssid} onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })} autoComplete="off" />}</Field>
            <Field label="Security">{(p) => (
              <Select {...p} value={wifi.security} onChange={(e) => setWifi({ ...wifi, security: e.target.value as typeof wifi.security })}>
                <option value="WPA">WPA/WPA2/WPA3</option><option value="WEP">WEP</option><option value="nopass">None (open network)</option>
              </Select>
            )}</Field>
            {wifi.security !== "nopass" && <Field label="Password">{(p) => <Input {...p} value={wifi.password} onChange={(e) => setWifi({ ...wifi, password: e.target.value })} autoComplete="off" />}</Field>}
            <Checkbox label="Hidden network" checked={wifi.hidden} onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })} />
            <p className="text-sm text-muted">Phones that scan this code can join without typing the password. The password is encoded in the image — only share it with people you&apos;d give the password to.</p>
          </>
        )}
        {kind === "upi" && (
          <>
            <Field label="UPI ID (VPA)" error={upi.vpa && !isValidVpa(upi.vpa) ? "Enter a UPI ID like name@bank" : undefined}>{(p) => <Input {...p} value={upi.vpa} onChange={(e) => setUpi({ ...upi, vpa: e.target.value })} placeholder="yourname@okhdfcbank" autoComplete="off" />}</Field>
            <Field label="Payee name">{(p) => <Input {...p} value={upi.name} onChange={(e) => setUpi({ ...upi, name: e.target.value })} />}</Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Amount (optional)">{(p) => <Input {...p} inputMode="decimal" value={upi.amount} onChange={(e) => setUpi({ ...upi, amount: e.target.value.replace(/[^\d.]/g, "") })} placeholder="₹" />}</Field>
              <Field label="Note (optional)">{(p) => <Input {...p} value={upi.note} maxLength={50} onChange={(e) => setUpi({ ...upi, note: e.target.value })} />}</Field>
            </div>
            <Alert tone="info">Always check the payee name your UPI app shows before paying. This QR code only pre-fills the payment details.</Alert>
          </>
        )}
        {kind === "email" && (
          <>
            <Field label="To">{(p) => <Input {...p} type="email" value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })} />}</Field>
            <Field label="Subject">{(p) => <Input {...p} value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} />}</Field>
            <Field label="Message">{(p) => <Textarea {...p} value={email.body} onChange={(e) => setEmail({ ...email, body: e.target.value })} />}</Field>
          </>
        )}
        {kind === "phone" && <Field label="Phone number">{(p) => <Input {...p} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />}</Field>}
        {kind === "sms" && (
          <>
            <Field label="Phone number">{(p) => <Input {...p} type="tel" value={sms.phone} onChange={(e) => setSms({ ...sms, phone: e.target.value })} />}</Field>
            <Field label="Message">{(p) => <Textarea {...p} value={sms.message} onChange={(e) => setSms({ ...sms, message: e.target.value })} />}</Field>
          </>
        )}
        <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2">
          <Field label="Error correction" hint="Higher levels survive damage or a logo overlay but make the code denser.">{(p) => (
            <Select {...p} value={ecc} onChange={(e) => setEcc(e.target.value as typeof ecc)}>
              <option value="L">Low (7%)</option><option value="M">Medium (15%)</option><option value="Q">Quartile (25%)</option><option value="H">High (30%)</option>
            </Select>
          )}</Field>
          <Field label="PNG size">{(p) => (
            <Select {...p} value={size} onChange={(e) => setSize(Number(e.target.value))}>
              {[256, 512, 1024, 2048].map((s) => <option key={s} value={s}>{s} × {s} px</option>)}
            </Select>
          )}</Field>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="h-10 w-12 cursor-pointer rounded border border-border-strong p-1" /> Foreground
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="color" value={light} onChange={(e) => setLight(e.target.value)} className="h-10 w-12 cursor-pointer rounded border border-border-strong p-1" /> Background
          </label>
        </div>
        {(contrast < 4 || inverted) && <Alert tone="warning">{inverted ? "Light-on-dark QR codes don't scan in many apps. Use a darker foreground than background." : "Low contrast between colours can make the code hard to scan."}</Alert>}
      </section>

      <aside className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6 lg:sticky lg:top-24 lg:self-start" aria-live="polite">
        {svg ? (
          <div className="w-full max-w-[18rem] [&>svg]:h-auto [&>svg]:w-full" role="img" aria-label="Generated QR code" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="flex aspect-square w-full max-w-[18rem] items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center text-sm text-muted">
            {error ?? "Fill in the details to create your QR code."}
          </div>
        )}
        <div className="flex w-full flex-col gap-2">
          <Button onClick={downloadPng} disabled={!svg}><Download aria-hidden /> Download PNG</Button>
          <Button variant="secondary" onClick={() => downloadText(svg, "qr-code.svg", "image/svg+xml")} disabled={!svg}><Download aria-hidden /> Download SVG</Button>
        </div>
        <p className="text-center text-xs text-muted">Static QR code: no tracking, no redirects and no expiry. Test it with your phone before printing.</p>
      </aside>
    </div>
  );
}
