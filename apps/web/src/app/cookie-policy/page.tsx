import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { adsConfig, analyticsConfig, site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cookie Policy",
  description: "Which cookies and browser storage Expensico uses, why, which are set by third parties, and how to clear or block them in Chrome, Safari, Firefox and Edge.",
  path: "/cookie-policy",
});

export default function CookiePolicy() {
  const turnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const analyticsName = analyticsConfig.provider === "plausible" ? "Plausible" : analyticsConfig.provider === "umami" ? "Umami" : null;
  const analyticsNames = [analyticsConfig.cloudflare && "Cloudflare Web Analytics", analyticsName].filter(Boolean).join(" and ");
  return (
    <LegalPage
      title="Cookie Policy"
      path="/cookie-policy"
      intro={
        <p>
          This page explains how {site.name} uses cookies and similar browser storage, what each item is for, and how you can control it. The short version:{" "}
          {adsConfig.enabled ? "we set no cookies ourselves; our advertising partner, Google, may." : "we don't set any cookies, and the only data we store in your browser is there so your tools remember your work."}
        </p>
      }
      sections={[
        {
          id: "what",
          title: "What cookies and browser storage are",
          body: (
            <>
              <p>
                A <strong>cookie</strong> is a small text file a website asks your browser to store. Cookies are sent back to the website with each request, which is how sites remember sign-ins,
                preferences and — in the case of advertising cookies — which sites you have visited.
              </p>
              <p>
                <strong>Local storage</strong> and <strong>IndexedDB</strong> are newer browser features that also let a website save data on your device. Unlike cookies, this data is not
                automatically sent to the website&apos;s servers. Expensico uses these so tools like Notes can save your work without an account and without us ever receiving it.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies on Expensico",
          body: adsConfig.enabled ? (
            <p>
              Expensico itself doesn&apos;t set cookies. Google AdSense, which shows ads on some pages, may set cookies to serve and measure ads, to limit how often you see the same ad, to prevent fraud and
              to remember your ad consent choices. See the third-party section below and our <Link href="/privacy-policy#advertising">privacy policy</Link> for opt-out links.
            </p>
          ) : (
            <p>
              Expensico currently sets no cookies — not for analytics, not for advertising, and not for sign-in (there are no accounts).
              {turnstile ? " On the contact page, Cloudflare Turnstile may use cookies or similar technologies to tell people and bots apart." : ""}
            </p>
          ),
        },
        {
          id: "storage",
          title: "Local storage and IndexedDB we use",
          body: (
            <>
              <p>Some features save information in your browser so they keep working when you return. The data stays on your device and is never sent to our servers:</p>
              <table>
                <thead>
                  <tr><th>Name</th><th>Type</th><th>Purpose</th><th>Kept until</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>ex-theme</code></td><td>Local storage</td><td>Remembers light or dark mode</td><td>You clear site data</td></tr>
                  <tr><td><code>ex:…</code> keys</td><td>Local storage</td><td>Remembers your last calculator and text-tool inputs</td><td>You clear site data</td></tr>
                  <tr><td><code>expensico</code> database</td><td>IndexedDB</td><td>Notes, notepad, Markdown draft, to-dos and checklists</td><td>You delete them or clear site data</td></tr>
                </tbody>
              </table>
              <p>These items are strictly functional. They are not used for analytics or advertising, and they don&apos;t identify you.</p>
            </>
          ),
        },
        {
          id: "categories",
          title: "Categories at a glance",
          body: (
            <table>
              <thead>
                <tr><th>Category</th><th>Used on Expensico?</th></tr>
              </thead>
              <tbody>
                <tr><td>Strictly necessary / functional</td><td>Yes — browser storage listed above, no cookies</td></tr>
                <tr><td>Analytics</td><td>{analyticsNames ? `${analyticsNames}, which ${analyticsName && analyticsConfig.cloudflare ? "are" : "is"} cookieless and store${analyticsName && analyticsConfig.cloudflare ? "" : "s"} nothing in your browser` : "No"}</td></tr>
                <tr><td>Advertising</td><td>{adsConfig.enabled ? "Yes — Google AdSense (third-party cookies)" : "No"}</td></tr>
                <tr><td>Social media tracking</td><td>No — we don&apos;t embed social media widgets or pixels</td></tr>
              </tbody>
            </table>
          ),
        },
        {
          id: "third-party",
          title: "Third-party cookies",
          body: adsConfig.enabled ? (
            <>
              <p>
                Google, as a third-party vendor, uses cookies to serve ads on Expensico. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visits to this and
                other websites. You can opt out of personalised advertising at <a href="https://adssettings.google.com" rel="noopener noreferrer">Google Ads Settings</a> or at{" "}
                <a href="https://www.aboutads.info/choices" rel="noopener noreferrer">aboutads.info</a>.
              </p>
              <p>Where the law requires it, you are asked for consent before personalised advertising cookies are used, and you can change your choice at any time.</p>
            </>
          ) : (
            <p>No third-party cookies are set on Expensico. If we introduce advertising, this section will list the providers and their cookies before any are used.</p>
          ),
        },
        {
          id: "control",
          title: "How to clear or block cookies and storage",
          body: (
            <>
              <p>You can delete or block cookies and site data for {site.domain} in your browser settings:</p>
              <ul>
                <li><strong>Chrome:</strong> Settings → Privacy and security → Third-party cookies / Site settings → View permissions and data stored across sites.</li>
                <li><strong>Safari (Mac):</strong> Settings → Privacy → Manage Website Data. <strong>iPhone/iPad:</strong> Settings → Safari → Advanced → Website Data.</li>
                <li><strong>Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data → Manage Data.</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies and site data.</li>
              </ul>
              <p>
                Clearing site data permanently deletes your saved notes and tool data, so export anything you want to keep first. Blocking storage entirely will stop features like Notes from saving, but
                all other tools continue to work.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: <p>If we change how cookies or browser storage are used — for example when advertising is introduced — we update this policy first and ask for consent where the law requires it. The effective date above shows when it last changed.</p>,
        },
        {
          id: "contact",
          title: "Contact",
          body: (
            <p>
              Questions about cookies? Write to <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> or use the <Link href="/contact?topic=privacy">contact page</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
