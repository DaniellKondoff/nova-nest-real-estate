import { site } from "@/config/site";

/** Viber chat with the agency; `draft` pre-fills the message (e.g. the listing URL) */
export function viberHref(draft?: string): string {
  const base = `viber://chat?number=${encodeURIComponent(site.contact.phone)}`;
  return draft ? `${base}&draft=${encodeURIComponent(draft)}` : base;
}
