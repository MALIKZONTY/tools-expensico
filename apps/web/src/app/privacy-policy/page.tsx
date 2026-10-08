import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { adsConfig, analyticsConfig, processorConfig, site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Expensico handles your data: most tools run in your browser, files aren't uploaded unless a tool says so, and we don't use tracking cookies.",
  path: "/privacy-policy",
});

export default function PrivacyPolicy() {
  const contactFormEnabled = site.contactFormEnabled;
  const turnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const analyticsName = analyticsConfig.provider === "plausible" ? "Plausible Analytics" : analyticsConfig.provider === "umami" ? "Umami" : null;
  const anyAnalytics = Boolean(analyticsName) || analyticsConfig.cloudflare;

  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy-policy"
      intro={
        <>
          <p>
          This policy explains what information {site.name} ({site.domain}) handles when you use the website, and why. In short: most tools run entirely in your web browser, we don&apos;t ask you
          to create an account, and we don&apos;t use tracking cookies. {site.name} is operated by {site.operator.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
          </p>
          <h2 id="summary">Summary</h2>
          <table>
            <thead>
              <tr><th>Information</th><th>Do we receive it?</th></tr>
            </thead>
            <tbody>
              <tr><td>Files you open or convert with our tools</td><td>{processorConfig.enabled ? "No — processed on your device" : "No — every tool processes files on your device"}</td></tr>
              {processorConfig.enabled && (
                <tr><td>Files sent to tools marked &ldquo;Uploads for processing&rdquo;</td><td>Briefly, to convert them; deleted immediately</td></tr>
              )}
              <tr><td>Notes, to-dos, saved calculator inputs</td><td>No — stored only in your browser</td></tr>
              <tr><td>Name, email or account details</td><td>No accounts; only if you contact us</td></tr>
              <tr><td>Usage statistics</td><td>{anyAnalytics ? "Anonymous, cookieless statistics" : "No analytics in use"}</td></tr>
              <tr><td>Advertising cookies</td><td>{adsConfig.enabled ? "Set by Google AdSense, as described below" : "None — no ads are shown"}</td></tr>
            </tbody>
          </table>
        </>
      }
      sections={[
        {
          id: "files",
          title: "Files you use with our tools",
          body: (
            <>
              <p>
                <strong>Most tools process files only in your browser.</strong> When a tool page says &ldquo;Runs in your browser&rdquo;, your file is read and processed by code running on your own device. It is not
                uploaded to us or anyone else, and it is discarded when you close or reload the page.
              </p>
              {processorConfig.enabled ? (
                <p>
                  <strong>Some conversions use our processing server.</strong> A small number of tools (such as Word, Excel and PowerPoint to PDF, and the optional server mode of Compress PDF) are clearly
                  marked &ldquo;Uploads for processing&rdquo; and ask you to confirm. For these, your file is sent over an encrypted HTTPS connection to our processing service, converted in a temporary
                  folder, and deleted as soon as the result is returned. A background cleanup also removes any temporary files older than 15 minutes in case a conversion is interrupted. We do not keep
                  copies, look at the contents, or use uploaded files for any other purpose.
                </p>
              ) : (
                <p>At the moment, no Expensico tool uploads your files. If we add tools that need a server, they will be clearly labelled before you use them, and this policy will be updated.</p>
              )}
            </>
          ),
        },
        {
          id: "not-collected",
          title: "Information we don't collect",
          body: (
            <>
              <p>Because of how Expensico is built, there is a lot we never receive. We do not collect:</p>
              <ul>
                <li>the contents or names of files you process with browser-based tools;</li>
                <li>the text you type into calculators, text tools, developer tools, notes or to-do lists;</li>
                <li>passwords, payment details or government ID numbers — no part of the site asks for them;</li>
                <li>your contacts, location (other than what your IP address broadly implies to our hosting provider) or device identifiers;</li>
                <li>any information to build an advertising or marketing profile of you.</li>
              </ul>
              <p>We don&apos;t sell, rent or trade personal information, and we don&apos;t share it with data brokers.</p>
            </>
          ),
        },
        {
          id: "browser-storage",
          title: "Data stored in your browser",
          body: (
            <>
              <p>Some tools save your work so it is still there when you come back. This data is stored only in your browser on your device, using local storage and IndexedDB. It is never sent to us:</p>
              <ul>
                <li>Notes, the online notepad, the Markdown editor draft, to-do lists and checklists (IndexedDB).</li>
                <li>Your last inputs in calculators and some text tools, so you don&apos;t have to re-enter them (local storage, keys starting with <code>ex:</code>).</li>
                <li>Your light/dark theme preference (local storage, key <code>ex-theme</code>).</li>
              </ul>
              <p>You can delete this data at any time by clearing this site&apos;s data in your browser settings. Because we never receive it, we cannot recover it for you if it is deleted.</p>
            </>
          ),
        },
        {
          id: "analytics",
          title: "Analytics",
          body: anyAnalytics ? (
            <>
              {analyticsConfig.cloudflare && (
                <p>
                  We use <strong>Cloudflare Web Analytics</strong> to count page views. It does not use cookies or browser storage, does not fingerprint your device, and does not track you across
                  websites. It records the page address, the referring site, your browser and device type, your country (worked out from your IP address, which is not stored), and how quickly the page
                  loaded. We see this only as totals, never as a record of an individual visitor. See{" "}
                  <a href="https://www.cloudflare.com/web-analytics/" rel="noopener noreferrer">cloudflare.com/web-analytics</a> for details.
                </p>
              )}
              {analyticsName && (
                <>
                  <p>
                    We {analyticsConfig.cloudflare ? "also use" : "use"} {analyticsName}, a privacy-focused analytics service that does not use cookies and does not track you across websites. It tells us which pages are visited and how tools are used,
                    so we can fix problems and decide what to build next.
                  </p>
                  <p>
                    In addition to page views, our tools send a small number of anonymous events: when a tool is opened, when a conversion starts, completes or fails (with the tool name and a broad file
                    size range such as &ldquo;1–10 MB&rdquo;), and the words typed into our site search box (so we can learn which tools people look for). Apart from search terms, we never send text you enter — no file names, file contents, note text or form inputs — and nothing that identifies you.
                  </p>
                </>
              )}
            </>
          ) : (
            <p>We currently do not use any analytics service. If we add one, it will be a privacy-focused, cookieless service, and we will update this policy before enabling it.</p>
          ),
        },
        {
          id: "advertising",
          title: "Advertising",
          body: adsConfig.enabled ? (
            <>
              <p>
                We show ads provided by Google AdSense to keep Expensico free. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other
                websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the internet.
              </p>
              <p>
                You may opt out of personalised advertising by visiting <a href="https://adssettings.google.com" rel="noopener noreferrer">Google Ads Settings</a>. You can also opt out of some third-party
                vendors&apos; use of cookies for personalised advertising at <a href="https://www.aboutads.info/choices" rel="noopener noreferrer">aboutads.info</a>. Learn more about how Google uses data at{" "}
                <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a>.
              </p>
              <p>
                Where required by law (for example in the European Economic Area, the United Kingdom and Switzerland), we use a Google-certified consent management platform to ask for your consent before
                personalised ads are shown, and you can change your choice at any time. Ads are clearly labelled, are never placed inside tool controls or results, and never influence what a tool or
                calculator shows you.
              </p>
            </>
          ) : (
            <p>Expensico does not currently show advertising. If we introduce ads (for example Google AdSense), we will update this policy and our cookie policy first and, where required by law, ask for your consent.</p>
          ),
        },
        {
          id: "contact",
          title: "When you contact us",
          body: contactFormEnabled ? (
            <p>
              If you use the contact form, we receive your name, email address, the topic and your message, so we can reply. Messages are delivered to us by email through our email provider (Resend).
              {turnstile ? " To block spam, the form uses Cloudflare Turnstile, which may process technical information about your browser." : ""} We keep messages only as long as needed to handle your
              request and any follow-up, and we don&apos;t use them for marketing.
            </p>
          ) : (
            <p>If you email us, we use your email address and message only to reply to you and keep them only as long as needed to handle your request.</p>
          ),
        },
        {
          id: "hosting",
          title: "Hosting and server logs",
          body: (
            <p>
              The website is hosted by Vercel{processorConfig.enabled ? ", and our file-processing service runs on a separate cloud provider" : ""}. Like any web server, our hosting providers automatically
              process technical information such as your IP address, browser type and the pages requested, to deliver the site and protect it from abuse. These logs are kept for a limited period under the
              providers&apos; own policies. Fonts and website code are served from our own domain; we don&apos;t load fonts from third-party font services.
            </p>
          ),
        },
        {
          id: "retention",
          title: "How long we keep information",
          body: (
            <table>
              <thead>
                <tr><th>Information</th><th>How long</th></tr>
              </thead>
              <tbody>
                <tr><td>Files uploaded for server conversion</td><td>Deleted as soon as the result is returned; any leftovers removed within 15 minutes</td></tr>
                <tr><td>Data saved in your browser</td><td>Until you delete it or clear site data — we never receive it</td></tr>
                <tr><td>Messages you send us</td><td>As long as needed to handle your request and any follow-up</td></tr>
                <tr><td>Hosting and security logs</td><td>For the limited period set by our hosting providers</td></tr>
              </tbody>
            </table>
          ),
        },
        {
          id: "security",
          title: "Security",
          body: (
            <p>
              The website is served only over encrypted HTTPS connections and uses strict security headers, including a content security policy that limits which code can run on our pages. Previews of
              documents you open (such as HTML or Word files) are displayed in a sandbox that blocks scripts. Uploaded files, where a tool needs them, are processed in isolated temporary folders and are
              never executed. No system is perfectly secure, but we design every tool to need as little of your data as possible.
            </p>
          ),
        },
        {
          id: "transfers",
          title: "International data transfers",
          body: (
            <p>
              Our hosting and service providers may process technical data (such as server logs) in countries other than your own. Where they do, they apply safeguards required by applicable data
              protection law. Data processed only in your browser never leaves your device.
            </p>
          ),
        },
        {
          id: "signals",
          title: "Do Not Track and Global Privacy Control",
          body: (
            <p>
              Because Expensico doesn&apos;t track you across websites or sell personal data, we treat every visitor the way privacy signals such as Do Not Track and Global Privacy Control ask by default.
              {adsConfig.enabled ? " Google's handling of these signals for advertising is described in its own policies." : ""}
            </p>
          ),
        },
        {
          id: "third-parties",
          title: "Third-party links",
          body: <p>Some pages link to other websites, such as a map link in the image metadata viewer. Those links open only if you click them, and the other website&apos;s privacy policy then applies.</p>,
        },
        {
          id: "rights",
          title: "Your rights",
          body: (
            <>
              <p>
                Depending on where you live — including under India&apos;s Digital Personal Data Protection Act, 2023 and, for visitors in the EEA or UK, the GDPR — you may have the right to access, correct or
                delete personal data we hold about you, to withdraw consent, and to complain to a data protection authority.
              </p>
              <p>Because our tools don&apos;t send your files or saved data to us, the only personal data we usually hold is what you send in a contact message. To make a request, contact us using the details below.</p>
            </>
          ),
        },
        {
          id: "children",
          title: "Children",
          body: <p>Expensico&apos;s tools can be used without providing personal information. The contact form is not intended for children under 18; please ask a parent or guardian to contact us on your behalf.</p>,
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: <p>We will update this policy whenever we change how data is handled — for example before adding analytics, advertising or new server-side tools. The effective date at the top shows when it last changed.</p>,
        },
        {
          id: "contact-us",
          title: "Contact",
          body: (
            <p>
              Questions about privacy? Write to {site.contactEmail} or use the <Link href="/contact?topic=privacy">contact form</Link>. Operator: {site.operator.name}, {site.operator.country}.
            </p>
          ),
        },
      ]}
    />
  );
}
