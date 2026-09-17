import { useState } from "react";
import type { FormEvent } from "react";

export interface LeadField {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

/**
 * Prototype lead form. Intentionally does NOT submit anywhere — it confirms
 * locally and explains that routing is not connected. Swap the submit handler
 * for Netlify Forms or a CRM endpoint in production.
 */
export default function LeadForm({
  fields,
  cta,
  title,
  intro,
  phone,
}: {
  fields: LeadField[];
  cta: string;
  title?: string;
  intro?: string;
  /** When set, a "Call" button sits next to the submit button. */
  phone?: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="glass-deep rounded-3xl p-8 text-center">
        <p className="text-lg font-medium text-mist-100">
          Demo form. Nothing was sent.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mist-300">
          In production this routes to the brokerage CRM with proper consent
          language. For now it demonstrates the layout and flow.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="btn-ghost mt-6 px-5 py-2.5 text-sm"
        >
          Back to form
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-deep rounded-3xl p-6 md:p-8">
      {title && <h3 className="text-xl font-medium text-mist-100">{title}</h3>}
      {intro && (
        <p className="mt-2 text-sm leading-relaxed text-mist-300">{intro}</p>
      )}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const id = `lead-${field.name}`;
          const isWide = field.type === "textarea";
          return (
            <div key={field.name} className={isWide ? "sm:col-span-2" : ""}>
              <label
                htmlFor={id}
                className="mb-1.5 block text-xs font-medium tracking-wide text-mist-300"
              >
                {field.label}
                {field.required && <span className="text-plum-400"> *</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={id}
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  rows={4}
                  className="input-glass resize-none"
                />
              ) : field.type === "select" ? (
                <select id={id} name={field.name} required={field.required} className="input-glass" defaultValue="">
                  <option value="" disabled>
                    Select…
                  </option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  name={field.name}
                  type={field.type ?? "text"}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="input-glass"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" className="btn-plum px-6 py-3.5 text-sm">
          {cta}
        </button>
        {phone && (
          <a
            href={`tel:${phone.replace(/[^0-9]/g, "")}`}
            className="btn-ghost px-6 py-3.5 text-center text-sm"
          >
            Call {phone}
          </a>
        )}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-mist-400">
        Demo form. Submissions are not sent or stored. Consent and
        communication disclosures appear here in production.
      </p>
    </form>
  );
}
