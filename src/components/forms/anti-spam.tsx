"use client";

import * as React from "react";

/**
 * Lightweight bot protection for the public inquiry forms (checked in POST /api/inquiries):
 * a hidden honeypot field that people never fill, plus the time the form was rendered.
 */
export function useAntiSpam() {
  const honeypotRef = React.useRef<HTMLInputElement>(null);
  const startedAtRef = React.useRef(0);

  React.useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  /** Extra fields to merge into the request body */
  const antiSpamFields = React.useCallback(
    () => ({ website: honeypotRef.current?.value ?? "", started_at: startedAtRef.current }),
    []
  );

  const honeypot = (
    // Off-screen rather than display:none – some bots skip hidden inputs
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Уебсайт
        <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );

  return { honeypot, antiSpamFields };
}
