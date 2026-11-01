/** Crawlers, link previewers and headless/audit browsers – their page loads are not real views */
export const BOT_UA =
  /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|bingpreview|pagespeed|gtmetrix/i;

/** Empty user agents are treated as bots (real browsers always send one) */
export function isBotUserAgent(ua: string | null | undefined): boolean {
  return !ua || BOT_UA.test(ua);
}
