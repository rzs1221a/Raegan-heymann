import { CONSENT_TEXT } from "../lib/netlifyForms";

/** Required TCPA consent checkbox; the exact text is stored with every lead. */
export default function ConsentField({ id = "consent" }: { id?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[11px] leading-relaxed text-mist-400">
      <input
        id={id}
        name="consent"
        type="checkbox"
        required
        value="true"
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#d4af37]"
      />
      <span>{CONSENT_TEXT}</span>
      <input type="hidden" name="consent_text" value={CONSENT_TEXT} />
    </label>
  );
}
