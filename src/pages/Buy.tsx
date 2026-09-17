import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import SplitWords from "../components/SplitWords";
import NeighborhoodCard from "../components/NeighborhoodCard";
import Concierge from "../components/concierge/Concierge";
import ProcessSteps from "../components/ProcessSteps";
import Reveal from "../components/Reveal";
import { getNeighborhoodBySlug } from "../data/neighborhoods.config";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { AGENT, SMS_HREF } from "../config/agent";

const FITS = [
  { k: "Walk to town", slugs: ["historic-downtown", "old-town-fernandina", "amelia-park"] },
  { k: "A block off the sand", slugs: ["seaside", "ocean-view-estates", "summer-beach"] },
  { k: "Golf, gate & canopy", slugs: ["long-point", "marsh-creek", "omni-resort-area"] },
  { k: "New & room to grow", slugs: ["wildlight", "tributary", "north-hampton"] },
];

export default function Buy() {
  useDocumentTitle("Buy on Amelia Island with Raegan Heymann", "Find the place first, then the house. Buyer representation on Amelia Island, Fernandina Beach, and Yulee.");
  return (
    <>
      <section className="relative z-10 px-5 pb-12 pt-32 md:px-8 md:pt-40">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ocean-950/60 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl">
          <div className="glass-deep max-w-3xl rounded-[2.25rem] p-7 md:p-12">
            <p className="eyebrow eyebrow-line mb-4">Buyers</p>
            <SplitWords as="h1" text="Find the place first. Then the house." immediate className="font-display text-4xl leading-[1.05] text-mist-100 md:text-6xl" />
            <p className="mt-6 text-lg leading-relaxed text-mist-300">
              Thirteen miles of island and a mainland full of new towns, and every one of them has a
              different logic. Raegan starts with how you want to live, then shows you the three streets
              that fit, not the thirty that don't.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/listings" className="btn-plum px-7 py-3.5 text-sm">See homes</Link>
              <a href={SMS_HREF} className="btn-ghost px-7 py-3.5 text-sm">Text {AGENT.cell}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <SectionHeader eyebrow="Start with a feeling" title="Four ways to live here." sub="Pick the one that sounds like you; each opens three neighborhoods that fit." />
        <div className="mt-12 space-y-12">
          {FITS.map((f) => (
            <div key={f.k}>
              <p className="eyebrow mb-4">{f.k}</p>
              <Reveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {f.slugs.map((s) => {
                  const n = getNeighborhoodBySlug(s);
                  return n ? (
                    <Reveal.Item key={s}>
                      <NeighborhoodCard neighborhood={n} />
                    </Reveal.Item>
                  ) : null;
                })}
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <section id="concierge" className="relative z-10 seam-y scroll-mt-24">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeader eyebrow="Ask anything" title="Schools, flood zones, the drive to the airport." sub="Ask the concierge now. Raegan picks up the moment you want a person." />
            <Concierge />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <SectionHeader eyebrow="How it goes" title="Offer to keys, protected." />
        <div className="mt-12">
          <ProcessSteps />
        </div>
      </section>
    </>
  );
}
