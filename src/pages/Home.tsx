import { Link } from "react-router-dom";
import SearchCommand from "../components/SearchCommand";
import SectionHeader from "../components/SectionHeader";
import SplitWords from "../components/SplitWords";
import CountUp from "../components/CountUp";
import Reveal from "../components/Reveal";
import MagneticButton from "../components/MagneticButton";
import LocalTimeChip from "../components/LocalTimeChip";
import SeaCanvas from "../components/SeaCanvas";
import PortraitBloom from "../components/PortraitBloom";
import IslandFlyover from "../components/IslandFlyover";
import FeaturedListing from "../components/FeaturedListing";
import ListingCard from "../components/ListingCard";
import Concierge from "../components/concierge/Concierge";
import ValuationStepper from "../components/ValuationStepper";
import ProcessSteps from "../components/ProcessSteps";
import Testimonials from "../components/Testimonials";
import ContactForm from "../components/ContactForm";
import { AGENT, CELL_HREF, MAIL_HREF, SMS_HREF } from "../config/agent";
import { listings } from "../data/listings";
import { useDocumentTitle } from "../lib/useDocumentTitle";

const featured = listings.find((l) => l.id === "sample-crane-marsh") ?? listings[0];
const grid = listings.filter((l) => l.id !== featured.id && l.status === "Active").slice(0, 3);

export default function Home() {
  useDocumentTitle(
    `${AGENT.name} · ${AGENT.tagline} · Realtor`,
    "Born and raised on Amelia Island. Realtor and co-owner, Berkshire Hathaway HomeServices Heymann Williams Realty."
  );

  return (
    <>
      {/* ---------- 1 · Hero: the approach ----------
          No background of its own. The persistent live map behind the page
          is mid-swoop from the Atlantic onto the island; only a one-sided
          legibility wash sits here so the map keeps reading on the right. */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ocean-950/70 via-ocean-950/15 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ocean-950 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-40 md:px-8 md:pb-24">
          <div className="max-w-3xl">
            <p className="eyebrow eyebrow-line fade-up mb-6">
              {AGENT.office.affiliation} · Heymann Williams Realty
            </p>
            <SplitWords
              as="h1"
              text={AGENT.name}
              immediate
              delay={0.2}
              stagger={0.12}
              className="font-display text-[3.4rem] font-medium leading-[0.98] tracking-tight text-mist-100 sm:text-7xl lg:text-[6.5rem]"
            />
            <SplitWords
              as="p"
              text={`${AGENT.tagline}. Realtor & co-owner.`}
              immediate
              delay={0.55}
              stagger={0.04}
              className="accent-serif mt-5 text-2xl md:text-3xl"
            />
            <p className="fade-up-late mt-6 max-w-xl text-lg font-light leading-relaxed text-mist-200 md:text-xl">
              Born here. Sells here. Knows which streets catch the morning light and which blocks
              quietly hold their value. The island, read from above and known from the ground.
            </p>
            <div className="fade-up-late mt-8 max-w-xl">
              <SearchCommand />
            </div>
            <div className="fade-up-late mt-7 flex flex-wrap items-center gap-3">
              <MagneticButton>
                <Link to="/listings" className="btn-plum px-7 py-3.5 text-sm">
                  See homes
                </Link>
              </MagneticButton>
              <Link to="/sell" className="btn-ghost px-7 py-3.5 text-sm">
                What's my home worth?
              </Link>
              <LocalTimeChip className="ml-auto hidden md:inline-flex" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 2 · Stat rail ---------- */}
      <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-5 md:px-8">
        <Reveal stagger className="glass-deep grid grid-cols-2 gap-6 rounded-[1.75rem] p-7 md:grid-cols-4 md:gap-8 md:p-9">
          {AGENT.stats.map((s) => (
            <Reveal.Item key={s.label}>
              <p className="font-display text-3xl font-medium text-mist-100 md:text-[2.5rem]">
                {s.text ? s.text : <CountUp value={s.value ?? 0} suffix={s.suffix} />}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-mist-400">{s.label}</p>
            </Reveal.Item>
          ))}
        </Reveal>
      </section>

      {/* ---------- 3 · The Atlantic + 4 · Meet Raegan ----------
          The sea band is the divider; the portrait and story float on it. */}
      <section className="relative z-10 mt-20 md:mt-28">
        <SeaCanvas className="min-h-[70svh]">
          <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
            <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <PortraitBloom className="aspect-[3/4] max-h-[70vh] w-full" />
              <div className="glass-deep rounded-[2rem] p-7 md:p-10">
                <p className="eyebrow eyebrow-line mb-5">Meet Raegan</p>
                <SplitWords
                  as="h2"
                  text="A native's read on the island, and a lender's read on the numbers."
                  className="font-display text-3xl leading-[1.1] text-mist-100 md:text-[2.5rem]"
                />
                <p className="mt-6 text-base leading-relaxed text-mist-200">{AGENT.bio.paragraphs[0]}</p>
                <p className="mt-4 text-base leading-relaxed text-mist-300">{AGENT.bio.paragraphs[1]}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/about" className="btn-plum px-6 py-3 text-sm">
                    Raegan's story →
                  </Link>
                  <a href={SMS_HREF} className="btn-ghost px-6 py-3 text-sm">
                    Text her
                  </a>
                </div>
              </div>
            </div>
          </div>
        </SeaCanvas>
      </section>

      {/* ---------- 5 · The Island: scroll flyover ---------- */}
      <IslandFlyover />

      {/* ---------- 6 · Featured homes ---------- */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="On the market"
            title="Homes, read from above."
            sub="Every home here can be flown: one tap and the camera reads the setting — water, canopy, the walk to town — before you ever see the kitchen."
          />
          <Link to="/listings" className="btn-ghost px-5 py-2.5 text-sm">
            All homes →
          </Link>
        </div>
        <div className="mt-12">
          <FeaturedListing listing={featured} />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((l) => (
            <ListingCard key={l.id} listing={l} tilt />
          ))}
        </div>
        <p className="mt-4 text-[11px] text-mist-400">
          Sample homes for layout. Live inventory opens in the brokerage's MLS search until the feed
          is connected.
        </p>
      </section>

      {/* ---------- 7 · Concierge ---------- */}
      <section id="concierge" className="relative z-10 seam-y scroll-mt-24">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-32">
              <SectionHeader
                eyebrow="Ask anything"
                title="Life on Amelia, answered in seconds."
                sub="Schools, flood zones, the drive to the airport, which side of the island holds its value. The concierge knows what Raegan knows, and hands you to her the moment you want a person."
              />
              <ul className="mt-8 space-y-2 text-sm text-mist-300">
                <li className="flex gap-3"><span className="text-gold">✦</span> No invented prices, fees, or ratings.</li>
                <li className="flex gap-3"><span className="text-gold">✦</span> Fair Housing, always.</li>
                <li className="flex gap-3"><span className="text-gold">✦</span> Raegan reads every conversation you send her.</li>
              </ul>
            </div>
            <Concierge />
          </div>
        </div>
      </section>

      {/* ---------- 8 · What's my home worth ---------- */}
      <section id="value" className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <SectionHeader
          eyebrow="Sellers"
          title="What's my home worth?"
          sub="Raegan brings the comparable sales. The other half of the answer is here now: how she would prepare, position, and launch your home. Written for your house, in about a minute."
        />
        <div className="mt-12">
          <ValuationStepper />
        </div>
      </section>

      {/* ---------- 9 · Process ---------- */}
      <section className="relative z-10 seam-y">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <SectionHeader eyebrow="How it goes" title="Contract to closing, protected." sub="What working with Raegan looks like, start to finish." />
          <div className="mt-12">
            <ProcessSteps />
          </div>
        </div>
      </section>

      {/* ---------- 10 · Testimonials (renders only with real ones) ---------- */}
      <Testimonials />

      {/* ---------- 11 · Contact ---------- */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="Start the conversation"
              title="Call the person who grew up here."
              sub="Buying, selling, or just curious. Honest local knowledge, no pressure, and a real phone number."
            />
            <div className="mt-8 space-y-3 text-sm text-mist-300">
              <p className="flex items-center gap-3">
                <span className="text-gold">☎</span>
                <a href={CELL_HREF} className="hover:text-gold">{AGENT.cell}</a>
                <span className="text-mist-400">· cell, text welcome</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-gold">✉</span>
                <a href={MAIL_HREF} className="hover:text-gold">{AGENT.email}</a>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-gold">⌖</span>
                {AGENT.office.address}
              </p>
              <p className="flex gap-4 pt-2 text-xs">
                <a href={AGENT.socials.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">Instagram</a>
                <a href={AGENT.socials.facebook} target="_blank" rel="noreferrer" className="hover:text-gold">Facebook</a>
                <a href={AGENT.socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-gold">LinkedIn</a>
              </p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
