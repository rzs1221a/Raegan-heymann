import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ConsentField from "./ConsentField";
import { postNetlifyForm } from "../lib/netlifyForms";
import { AGENT, CELL_HREF, SMS_HREF } from "../config/agent";
import { useConciergeTranscript } from "./concierge/useConcierge";

const INTERESTS = [
  "Buying a home",
  "Selling my home",
  "A home valuation",
  "Relocating to the island",
  "Investment / rental",
  "Just saying hello",
];

/**
 * The contact form: a real Netlify form (twin in public/forms.html) with the
 * concierge transcript riding along in a hidden field, so Raegan reads the
 * conversation before she calls back.
 */
export default function ContactForm({
  title = "Send Raegan a note",
  intro = "Tell her what you're thinking about. She reads every one and answers them herself.",
  cta = "Send to Raegan",
  defaultInterest,
  defaultMessage,
  compact = false,
}: {
  title?: string;
  intro?: string;
  cta?: string;
  defaultInterest?: string;
  defaultMessage?: string;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcript = useConciergeTranscript();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const fields: Record<string, string> = {};
    fd.forEach((v, k) => {
      fields[k] = String(v);
    });
    fields.concierge_context = transcript.slice(0, 4000);
    const ok = await postNetlifyForm("contact", fields);
    setBusy(false);
    if (ok) navigate("/thanks");
    else
      setError(
        `That didn't go through. Text Raegan at ${AGENT.cell} and she'll pick it up from there.`
      );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      onSubmit={onSubmit}
      className={`glass-deep rounded-3xl ${compact ? "p-6" : "p-6 md:p-8"}`}
    >
      <input type="hidden" name="form-name" value="contact" />
      <p className="hidden">
        <label>
          Don't fill this out: <input name="bot-field" />
        </label>
      </p>
      {title && <h3 className="font-display text-2xl text-mist-100">{title}</h3>}
      {intro && <p className="mt-2 text-sm leading-relaxed text-mist-300">{intro}</p>}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name" name="first" required />
        <Field label="Last name" name="last" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" />
        <div className="sm:col-span-2">
          <label htmlFor="c-interest" className="mb-1.5 block text-xs font-medium tracking-wide text-mist-300">
            I'm interested in
          </label>
          <select id="c-interest" name="interest" className="input-glass" defaultValue={defaultInterest ?? ""}>
            <option value="" disabled>
              Select…
            </option>
            {INTERESTS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-message" className="mb-1.5 block text-xs font-medium tracking-wide text-mist-300">
            What's on your mind?
          </label>
          <textarea
            id="c-message"
            name="message"
            rows={compact ? 3 : 4}
            defaultValue={defaultMessage}
            placeholder="A neighborhood, a timeline, a question…"
            className="input-glass resize-none"
          />
        </div>
      </div>
      <input type="hidden" name="concierge_context" value="" />
      <div className="mt-5">
        <ConsentField id="c-consent" />
      </div>
      {error && <p className="mt-4 text-sm text-gold">{error}</p>}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={busy} className="btn-plum px-6 py-3.5 text-sm disabled:opacity-60">
          {busy ? "Sending…" : cta}
        </button>
        <a href={SMS_HREF} className="btn-ghost px-6 py-3.5 text-center text-sm">
          Text instead
        </a>
        <a href={CELL_HREF} className="text-center text-xs text-mist-400 hover:text-gold sm:ml-auto">
          or call {AGENT.cell}
        </a>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  const id = `c-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium tracking-wide text-mist-300">
        {label}
        {required && <span className="text-plum-400"> *</span>}
      </label>
      <input id={id} name={name} type={type} required={required} className="input-glass" autoComplete={name === "email" ? "email" : name === "phone" ? "tel" : name === "first" ? "given-name" : name === "last" ? "family-name" : undefined} />
    </div>
  );
}
