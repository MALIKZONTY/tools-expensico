import Script from "next/script";
import { analyticsConfig } from "@/config/site";

/** Loads the configured cookieless analytics, if any. */
export function AnalyticsScript() {
  const { cloudflareToken } = analyticsConfig;
  return (
    <>
      {cloudflareToken && (
        <Script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: cloudflareToken })} strategy="afterInteractive" />
      )}
      <ProviderScript />
    </>
  );
}

function ProviderScript() {
  const { provider, siteId, scriptUrl } = analyticsConfig;
  if (!provider || !siteId) return null;

  if (provider === "plausible") {
    return <Script defer data-domain={siteId} src={scriptUrl ?? "https://plausible.io/js/script.tagged-events.js"} strategy="afterInteractive" />;
  }
  if (provider === "umami") {
    if (!scriptUrl) return null;
    return <Script defer data-website-id={siteId} data-do-not-track="true" src={scriptUrl} strategy="afterInteractive" />;
  }
  return null;
}
