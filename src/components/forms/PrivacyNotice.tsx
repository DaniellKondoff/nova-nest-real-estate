import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/** GDPR Art. 13 notice shown under the submit button of every public form that collects personal data */
export function PrivacyNotice({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-xs leading-5 text-charcoal/75", className)}>
      Използваме данните ви само за да отговорим на запитването.{" "}
      <Link
        href={site.legal.privacyPolicyPath}
        className="inline-block py-1 font-medium text-primary underline decoration-accent underline-offset-2"
      >
        Политика за поверителност
      </Link>
    </p>
  );
}
