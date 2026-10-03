import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose what the code should do: open a link, join Wi-Fi, pay via UPI, send an email or SMS, or show text.", "Fill in the details.", "Adjust colours and error correction if you like.", "Download as PNG for documents and social media, or SVG for print."],
  sections: [
    {
      heading: "Static QR codes, no strings attached",
      body: <p>Many QR generators create “dynamic” codes that redirect through their servers, so they can track scans and switch the code off unless you pay. Expensico creates static codes: the information is stored directly in the pattern. They work forever, offline, and nobody sees who scans them.</p>,
    },
    {
      heading: "UPI QR codes",
      body: <p>A UPI QR code holds a standard <code>upi://pay</code> link with your UPI ID, name and optionally a fixed amount and note. Any UPI app (Google Pay, PhonePe, Paytm, BHIM and banking apps) can scan it. Payment happens entirely inside the payer&apos;s app — Expensico never sees or handles any money.</p>,
    },
    {
      heading: "Printing tips",
      body: (
        <ul>
          <li>Keep at least 2 cm × 2 cm for close-range scanning; scale up for posters read from a distance.</li>
          <li>Use dark colours on a light background with strong contrast.</li>
          <li>Don&apos;t remove the quiet zone (white border) around the code.</li>
          <li>Use SVG for printing so the code stays sharp at any size.</li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "Do these QR codes expire?", a: "No. The data is encoded in the image itself, so the code works as long as the destination (such as your website) does." },
    { q: "Is my Wi-Fi password sent anywhere?", a: "No. The code is generated in your browser. Remember that anyone who scans the code can read the password." },
    { q: "Can I add a logo?", a: "Not in this tool yet. If you add one yourself, use High error correction and keep the logo small and centred." },
  ],
};

export default content;
