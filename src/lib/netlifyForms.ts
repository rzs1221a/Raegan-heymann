/**
 * Netlify Forms, from a React SPA.
 *
 * Netlify's build-time parser needs a static <form> per form name to know
 * which fields to accept — those twins live in public/forms.html. Adding a
 * field to a React form without adding it to the twin drops it SILENTLY.
 * Every submit posts url-encoded to "/" with `form-name`.
 *
 * Dev servers (vite / netlify dev) do not accept form POSTs; test on a
 * Netlify Deploy Preview.
 */
import { AGENT } from "../config/agent";

export const CONSENT_TEXT = `I agree that ${AGENT.name} and ${AGENT.office.name} may contact me about my home search or home valuation by phone, text, or email, including automated messages. Consent is not a condition of purchase. Message and data rates may apply.`;

export function sessionId(): string {
  try {
    let s = sessionStorage.getItem("rh:session");
    if (!s) {
      s =
        (crypto.randomUUID && crypto.randomUUID()) ||
        [...crypto.getRandomValues(new Uint8Array(16))]
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      sessionStorage.setItem("rh:session", s);
    }
    return s;
  } catch {
    return "anon";
  }
}

export async function postNetlifyForm(
  name: string,
  fields: Record<string, string | undefined | boolean | null>
): Promise<boolean> {
  const body = new URLSearchParams();
  body.set("form-name", name);
  body.set("page", typeof location !== "undefined" ? location.href : "");
  body.set("session", sessionId());
  body.set("submitted_at", new Date().toISOString());
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue;
    body.set(k, typeof v === "boolean" ? String(v) : v);
  }
  try {
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}
