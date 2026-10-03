import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Type a colour in HEX, rgb() or hsl(), or use the colour picker.", "Copy it in the format you need: HEX, RGB, HSL, HSV, CMYK or OKLCH.", "Check its contrast against a background for accessible text."],
  sections: [
    {
      heading: "Colour formats explained",
      body: (
        <ul>
          <li><strong>HEX / RGB</strong> describe red, green and blue light from 0–255 — the native format for screens.</li>
          <li><strong>HSL / HSV</strong> describe hue, saturation and lightness (or value), which is easier for adjusting colours by hand.</li>
          <li><strong>OKLCH</strong> is a perceptually uniform space supported in modern CSS: equal changes in lightness look equally different, making it ideal for building colour scales.</li>
          <li><strong>CMYK</strong> is for print. The values here are a simple mathematical conversion; real print output depends on the printer&apos;s colour profile, so ask your printer for exact values.</li>
        </ul>
      ),
    },
    {
      heading: "Contrast and accessibility",
      body: <p>WCAG requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (about 24px, or 19px bold) at level AA. Level AAA raises these to 7:1 and 4.5:1. Good contrast helps everyone, especially people with low vision and anyone reading a phone in sunlight.</p>,
    },
  ],
  example: { body: <p>Pure grey <code>#777777</code> on white has a contrast of 4.48:1 — just below the 4.5:1 needed for normal text. <code>#767676</code> is the lightest grey that passes.</p> },
  faqs: [
    { q: "Why does CMYK look different when printed?", a: "Screens emit light (RGB) and printers use inks (CMYK) with a smaller range of colours. Conversion depends on paper, ink and colour profiles, so treat these CMYK values as a starting point." },
  ],
};

export default content;
