import Script from "next/script";
import { env } from "@/lib/env";
import { CONSENT_STORAGE_KEY } from "@/lib/consent/constants";

/**
 * GA4 with Google Consent Mode v2 (server component, public site only).
 * 1. Consent defaults to "denied" for everything before gtag.js loads (cookieless pings only).
 * 2. A previously saved choice is restored synchronously, before `config`.
 * 3. The banner (CookieConsentBanner) sends `consent update` when the visitor decides.
 * Renders nothing when NEXT_PUBLIC_GA_ID is unset.
 */
export default function GoogleAnalytics() {
  const gaId = env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  const init = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true);
try {
  var c = JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}) || 'null');
  if (c && c.analytics === true) gtag('consent', 'update', { analytics_storage: 'granted' });
} catch (e) {}
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaId)});
`;

  return (
    <>
      <Script id="ga-consent-init" strategy="afterInteractive">
        {init}
      </Script>
      <Script
        id="ga-gtag"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
        strategy="afterInteractive"
      />
    </>
  );
}
