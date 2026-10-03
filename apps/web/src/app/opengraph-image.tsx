import { ImageResponse } from "next/og";
import { MARK_PATHS } from "@/components/layout/Logo";
import { site } from "@/config/site";

export const alt = `${site.name} — ${site.slogan}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori renders <svg> best as an image, so the mark is inlined as a data URI.
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="${MARK_PATHS.top}" fill="#10b981"/><path d="${MARK_PATHS.middle}" fill="#10b981"/><path d="${MARK_PATHS.bottom}" fill="#059669"/><path d="${MARK_PATHS.spine}" fill="#047857"/><path d="${MARK_PATHS.fold}" fill="#a7f3d0"/></svg>`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #f8fafc 0%, #d1fae5 100%)", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori, not the DOM */}
          <img src={`data:image/svg+xml,${encodeURIComponent(mark)}`} width={88} height={88} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: "#0f172a", letterSpacing: -2 }}>{site.name}</div>
            <div style={{ fontSize: 26, color: "#475569" }}>{site.slogan}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, maxWidth: 1000, letterSpacing: -1.5 }}>One place for PDFs, files, money, notes and code</div>
          <div style={{ fontSize: 30, color: "#475569" }}>PDF · Convert · Finance calculators · Developer tools · Notes</div>
        </div>
        <div style={{ fontSize: 26, color: "#065f46" }}>Most tools run in your browser — your files stay on your device.</div>
      </div>
    ),
    size,
  );
}
