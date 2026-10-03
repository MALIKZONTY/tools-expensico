/** Builders for the text encoded in QR codes (pure, tested). */

/** Escape \ ; , : " for the Wi-Fi QR format. */
function wifiEscape(s: string): string {
  return s.replace(/([\\;,:"])/g, "\\$1");
}

export function wifiPayload(o: { ssid: string; password: string; security: "WPA" | "WEP" | "nopass"; hidden: boolean }): string {
  const parts = [`T:${o.security}`, `S:${wifiEscape(o.ssid)}`];
  if (o.security !== "nopass") parts.push(`P:${wifiEscape(o.password)}`);
  if (o.hidden) parts.push("H:true");
  return `WIFI:${parts.join(";")};;`;
}

export function upiPayload(o: { vpa: string; name: string; amount?: string; note?: string }): string {
  const params = new URLSearchParams();
  params.set("pa", o.vpa.trim());
  if (o.name.trim()) params.set("pn", o.name.trim());
  if (o.amount && Number(o.amount) > 0) params.set("am", Number(o.amount).toFixed(2));
  params.set("cu", "INR");
  if (o.note?.trim()) params.set("tn", o.note.trim());
  // UPI apps expect %20 rather than + for spaces.
  return `upi://pay?${params.toString().replace(/\+/g, "%20")}`;
}

export function isValidVpa(vpa: string): boolean {
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/.test(vpa.trim());
}

export function emailPayload(o: { to: string; subject?: string; body?: string }): string {
  const q = new URLSearchParams();
  if (o.subject) q.set("subject", o.subject);
  if (o.body) q.set("body", o.body);
  const qs = q.toString().replace(/\+/g, "%20");
  return `mailto:${o.to.trim()}${qs ? `?${qs}` : ""}`;
}

export function phonePayload(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function smsPayload(phone: string, message: string): string {
  return `SMSTO:${phone.replace(/[^\d+]/g, "")}:${message}`;
}
