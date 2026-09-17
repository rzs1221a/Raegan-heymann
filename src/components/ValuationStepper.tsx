import { useState, type FormEvent } from "react";
import { AGENT, CELL_HREF, SMS_HREF } from "../config/agent";
import { CONSENT_TEXT, postNetlifyForm, sessionId } from "../lib/netlifyForms";

const AREAS = [
  "Historic Downtown Fernandina",
  "North Beach / Fort Clinch",
  "Amelia Park & mid-island",
  "Summer Beach / South End",
  "Amelia Island Plantation",
  "Crane Island",
  "Yulee / Wildlight",
  "Elsewhere in Nassau County",
];
const TYPES = ["Single family", "Condo", "Townhome", "Land"];
const CONDITIONS = ["Move-in ready", "Some updates", "Needs work"];
const TIMELINES = ["As soon as possible", "3–6 months", "Just curious"];

type Picks = { type?: string; condition?: string; timeline?: string };

function Opts({
  options,
  value,
  onPick,
  label,
}: {
  options: string[];
  value?: string;
  onPick: (v: string) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" className="opt" aria-pressed={value === o} onClick={() => onPick(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

/** Bold the ALL-CAPS section titles the Listing Story uses. */
function StoryText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) =>
        /^[A-Z][A-Z0-9 &']{3,}$/.test(line.trim()) ? (
          <p key={i} className="eyebrow mt-4 mb-1">
            {line.trim()}
          </p>
        ) : line.trim() ? (
          <p key={i} className="text-sm leading-relaxed text-mist-200">
            {line}
          </p>
        ) : null
      )}
    </>
  );
}

/**
 * What's my home worth — three steps, then Raegan gets the lead and (when
 * the concierge is configured) a Listing Story streams in beside the form.
 * The lead is sent whether or not the story drafts.
 */
export default function ValuationStepper() {
  const [step, setStep] = useState(1);
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [picks, setPicks] = useState<Picks>({});
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sqft, setSqft] = useState("");
  const [upgrades, setUpgrades] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "sent" | "failed">("idle");
  const [story, setStory] = useState("");
  const [storyState, setStoryState] = useState<"empty" | "drafting" | "done" | "offline">("empty");

  const valid = (n: number) =>
    n === 1 ? !!area : n === 2 ? !!picks.type : !!name.trim() && (!!email.trim() || !!phone.trim()) && consent;

  function next() {
    if (valid(step)) setStep((s) => Math.min(3, s + 1));
    else {
      setNudge(true);
      window.setTimeout(() => setNudge(false), 900);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid(3)) return next();
    if (state !== "idle") return;
    setState("busy");
    const v = {
      area,
      address: address.trim(),
      type: picks.type ?? "",
      beds,
      baths,
      sqft,
      condition: picks.condition ?? "",
      timeline: picks.timeline ?? "",
      upgrades: upgrades.trim(),
    };
    let text = "";
    setStoryState("drafting");
    try {
      const r = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, session: sessionId() }),
      });
      if (!r.ok || !r.body) throw new Error(String(r.status));
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        setStory(text);
      }
      if (!text.trim()) throw new Error("empty");
      setStoryState("done");
    } catch {
      setStoryState("offline");
    } finally {
      // The lead goes to Raegan whether or not the story drafted.
      const ok = await postNetlifyForm("valuation", {
        ...v,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        story: text.slice(0, 6000),
        consent: true,
        consent_text: CONSENT_TEXT,
      });
      setState(ok ? "sent" : "failed");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <form onSubmit={submit} className={`glass-deep rounded-[2rem] p-6 md:p-8 ${nudge ? "animate-[stepperIn_0.3s]" : ""}`} noValidate>
        <ol className="flex gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
          {["Where", "The home", "You"].map((l, i) => (
            <li
              key={l}
              className={`rounded-full px-3 py-1 ${
                i + 1 === step ? "bg-gold text-charcoal" : i + 1 < step ? "text-gold" : "text-mist-400"
              }`}
            >
              {i + 1} · {l}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <fieldset key={1} className="stepper-step mt-6 space-y-4">
            <div>
              <label htmlFor="v-area" className="mb-1.5 block text-xs font-medium text-mist-300">
                Where is it?
              </label>
              <select id="v-area" value={area} onChange={(e) => setArea(e.target.value)} className="input-glass">
                <option value="" disabled>
                  Pick an area…
                </option>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="v-address" className="mb-1.5 block text-xs font-medium text-mist-300">
                Street or neighborhood <span className="text-mist-400">(optional)</span>
              </label>
              <input
                id="v-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Sadler Road, or Ocean Village"
                className="input-glass"
              />
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset key={2} className="stepper-step mt-6 space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium text-mist-300">Home type</p>
              <Opts label="Home type" options={TYPES} value={picks.type} onPick={(v) => setPicks((p) => ({ ...p, type: v }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Beds", beds, setBeds, "3"],
                ["Baths", baths, setBaths, "2"],
                ["Sq ft", sqft, setSqft, "2000"],
              ].map(([l, v, set, ph]) => (
                <label key={l as string} className="text-xs font-medium text-mist-300">
                  {l as string}
                  <input
                    type="number"
                    min={0}
                    value={v as string}
                    onChange={(e) => (set as (s: string) => void)(e.target.value)}
                    placeholder={ph as string}
                    className="input-glass mt-1.5"
                  />
                </label>
              ))}
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-mist-300">Condition</p>
              <Opts label="Condition" options={CONDITIONS} value={picks.condition} onPick={(v) => setPicks((p) => ({ ...p, condition: v }))} />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-mist-300">Timeline</p>
              <Opts label="Timeline" options={TIMELINES} value={picks.timeline} onPick={(v) => setPicks((p) => ({ ...p, timeline: v }))} />
            </div>
            <div>
              <label htmlFor="v-upgrades" className="mb-1.5 block text-xs font-medium text-mist-300">
                Anything special about it? <span className="text-mist-400">(optional)</span>
              </label>
              <input
                id="v-upgrades"
                value={upgrades}
                onChange={(e) => setUpgrades(e.target.value)}
                placeholder="New roof, marsh view, renovated kitchen…"
                className="input-glass"
              />
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset key={3} className="stepper-step mt-6 space-y-4">
            <div>
              <label htmlFor="v-name" className="mb-1.5 block text-xs font-medium text-mist-300">
                Where should Raegan send the numbers?
              </label>
              <input id="v-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className="input-glass" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" autoComplete="email" aria-label="Email" className="input-glass" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone" autoComplete="tel" aria-label="Phone" className="input-glass" />
            </div>
            <label className="flex items-start gap-3 text-[11px] leading-relaxed text-mist-400">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#d4af37]" />
              {CONSENT_TEXT}
            </label>
          </fieldset>
        )}

        <div className="mt-6 flex items-center gap-3">
          {step > 1 && state === "idle" && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-ghost px-5 py-3 text-sm">
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" onClick={next} className="btn-plum px-6 py-3 text-sm">
              Next →
            </button>
          ) : state === "sent" ? (
            <span className="text-sm text-gold">Sent to Raegan ✓</span>
          ) : state === "failed" ? (
            <a href={SMS_HREF} className="btn-plum px-6 py-3 text-sm">
              Text Raegan {AGENT.cell}
            </a>
          ) : (
            <button type="submit" disabled={state === "busy"} className="btn-plum px-6 py-3 text-sm disabled:opacity-60">
              {state === "busy" ? "Sending…" : "Write my listing story →"}
            </button>
          )}
        </div>
        {step === 3 && (
          <p className="mt-4 text-[11px] leading-relaxed text-mist-400">
            Raegan follows up personally with the comparable-sales analysis. No automated estimate, no dollar figures invented here.
          </p>
        )}
      </form>

      <aside className="glass rounded-[2rem] p-6 md:p-8">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-xl text-mist-100">Listing Story</p>
          <span className="text-[10px] uppercase tracking-[0.18em] text-mist-400">
            {picks.type || area ? `${picks.type || "Home"} · ${area || "—"}` : "Awaiting details"}
          </span>
        </div>
        <div className="mt-4 min-h-[10rem]">
          {storyState === "empty" && (
            <p className="text-sm leading-relaxed text-mist-300">
              The angle Raegan would lead with, what to fix first, who the buyer is, and what the first two
              weeks on the market look like. Written for your home, in about a minute.
            </p>
          )}
          {storyState === "drafting" && !story && (
            <p className="text-sm text-mist-300">Drafting…</p>
          )}
          {story && <StoryText text={story} />}
          {storyState === "offline" && (
            <p className="text-sm leading-relaxed text-mist-300">
              Raegan will do this one in person — she has your details and will bring the comparable
              sales with her. Want it sooner?{" "}
              <a href={CELL_HREF} className="text-gold">
                {AGENT.cell}
              </a>
              .
            </p>
          )}
        </div>
        <p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-mist-400">— Raegan's Island Concierge</p>
      </aside>
    </div>
  );
}
