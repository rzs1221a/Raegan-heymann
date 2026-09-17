import SectionHeader from "../components/SectionHeader";
import SplitWords from "../components/SplitWords";
import ValuationStepper from "../components/ValuationStepper";
import ProcessSteps from "../components/ProcessSteps";
import Reveal from "../components/Reveal";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { AGENT, SMS_HREF } from "../config/agent";

const FACTORS = [
  { t: "Marsh vs ocean", b: "Two kinds of water, two value curves. Marsh prices on light and privacy; ocean on proximity and view." },
  { t: "Walk to Centre Street", b: "Blocks near downtown price on scarcity. The supply is permanently fixed." },
  { t: "Gate & club", b: "Club, gate, and amenity adjacency carry premiums that comps from outside the gate miss." },
  { t: "Flood zone & insurance", b: "Elevation, age, and construction now shape buyer math as much as the list price." },
  { t: "Rental rules", b: "Short-term rental restrictions by neighborhood and HOA quietly expand or shrink your buyer pool." },
  { t: "The thin comp set", b: "On an island, three sales can set a market. Reading them right is the whole job." },
];

export default function Sell() {
  useDocumentTitle("What's my home worth? · Sell with Raegan Heymann", "Sell your Amelia Island home with a native who reads the numbers like a lender.");
  return (
    <>
      <section className="relative z-10 px-5 pb-12 pt-32 md:px-8 md:pt-40">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ocean-950/60 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl">
          <div className="glass-deep max-w-3xl rounded-[2.25rem] p-7 md:p-12">
            <p className="eyebrow eyebrow-line mb-4">Sellers</p>
            <SplitWords
              as="h1"
              text="Sell with someone who knows your exact block."
              immediate
              className="font-display text-4xl leading-[1.05] text-mist-100 md:text-6xl"
            />
            <p className="mt-6 text-lg leading-relaxed text-mist-300">
              A home here is never just square footage. The water, the light, the walk to town, the
              canopy. That's what buyers actually pay for, and most sellers don't see the full picture
              until Raegan shows them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#value" className="btn-plum px-7 py-3.5 text-sm">
                Start my listing story
              </a>
              <a href={SMS_HREF} className="btn-ghost px-7 py-3.5 text-sm">
                Text {AGENT.cell}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="value" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
        <SectionHeader
          eyebrow="What's my home worth?"
          title="Half the answer in a minute. The other half in person."
          sub="Three quick steps. Raegan gets your details and follows up with the comparable-sales analysis herself. No automated estimate, no dollar figure invented."
        />
        <div className="mt-12">
          <ValuationStepper />
        </div>
      </section>

      <section className="relative z-10 seam-y">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <SectionHeader eyebrow="Value by place" title="The same square footage prices differently every few blocks." />
          <Reveal stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FACTORS.map((f) => (
              <Reveal.Item key={f.t}>
                <div className="glass card-hover h-full rounded-3xl p-6">
                  <h3 className="font-display text-xl text-mist-100">{f.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist-300">{f.b}</p>
                </div>
              </Reveal.Item>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <SectionHeader eyebrow="How it goes" title="Contract to closing, protected." />
        <div className="mt-12">
          <ProcessSteps />
        </div>
      </section>
    </>
  );
}
