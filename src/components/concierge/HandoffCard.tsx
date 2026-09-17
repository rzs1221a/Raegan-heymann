import { useState, type FormEvent } from "react";
import { AGENT, SMS_HREF } from "../../config/agent";
import { CONSENT_TEXT, postNetlifyForm } from "../../lib/netlifyForms";
import { transcriptText } from "./useConcierge";

/**
 * After the second reply, once per session: turn the conversation into a
 * lead. Posts the Netlify form `concierge-lead` (twin in public/forms.html)
 * with the whole transcript.
 */
export default function HandoffCard({ onDone }: { onDone: () => void }) {
  const [state, setState] = useState<"idle" | "busy" | "sent" | "failed">("idle");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "busy") return;
    const fd = new FormData(e.currentTarget);
    const contact = String(fd.get("contact") ?? "").trim();
    if (!/@|\d{7,}/.test(contact)) {
      setState("failed");
      return;
    }
    setState("busy");
    const ok = await postNetlifyForm("concierge-lead", {
      name: String(fd.get("name") ?? ""),
      contact,
      transcript: transcriptText(6000),
      consent: true,
      consent_text: CONSENT_TEXT,
    });
    setState(ok ? "sent" : "failed");
    if (ok) window.setTimeout(onDone, 4000);
  }

  if (state === "sent") {
    return (
      <div className="glass rounded-2xl p-4 text-sm text-mist-100">
        Sent. Raegan has the whole conversation and will reach out herself.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-4">
      <p className="text-sm font-medium text-mist-100">Want Raegan to pick this up from here?</p>
      <p className="mt-1 text-xs text-mist-400">
        She'll get this conversation and reply personally. No list, no drip campaign.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input name="name" placeholder="Your name" required className="input-glass text-sm" />
        <input
          name="contact"
          placeholder="Phone or email"
          required
          className="input-glass text-sm"
          inputMode="email"
        />
      </div>
      <label className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-mist-400">
        <input type="checkbox" required className="mt-0.5 accent-[#d4af37]" />
        {CONSENT_TEXT}
      </label>
      {state === "failed" && (
        <p className="mt-2 text-xs text-gold">
          That didn't send. <a href={SMS_HREF} className="underline">Text Raegan at {AGENT.cell}</a> instead.
        </p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <button type="submit" disabled={state === "busy"} className="btn-plum px-4 py-2 text-xs disabled:opacity-60">
          {state === "busy" ? "Sending…" : "Send to Raegan"}
        </button>
        <button type="button" onClick={onDone} className="text-xs text-mist-400 hover:text-mist-200">
          Not now
        </button>
      </div>
    </form>
  );
}
