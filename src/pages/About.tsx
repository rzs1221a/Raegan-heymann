import { Link } from "react-router-dom";
import PortraitBloom from "../components/PortraitBloom";
import SectionHeader from "../components/SectionHeader";
import SplitWords from "../components/SplitWords";
import CountUp from "../components/CountUp";
import Reveal from "../components/Reveal";
import ContactForm from "../components/ContactForm";
import { AGENT, CELL_HREF, MAIL_HREF, SMS_HREF } from "../config/agent";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { useJsonLd } from "../lib/useJsonLd";

const THREADS = [
  {
    k: "Native",
    t: "Thirteen miles, known by heart",
    b: "Which streets flood in a king tide, which blocks stay quiet in July, where the light lands in the afternoon. You can't research this. You have to have grown up in it.",
  },
  {
    k: "Finance",
    t: "A lender's eye on every contract",
    b: "Years in finance and mortgage servicing before real estate. Every recommendation starts with the numbers, and every contract is read the way an underwriter reads it.",
  },
  {
    k: "Owner",
    t: "Co-owner, not just an agent",
    b: "As co-owner of Heymann Williams Realty, Raegan has a stake in how the island grows, including the residential development projects she has been part of.",
  },
  {
    k: "Present",
    t: "She answers her own phone",
    b: "No call center, no assistant screening. Text or call the cell on this page and the person who picks up is the one who will sell your house.",
  },
];

export default function About() {
  useDocumentTitle(
    `About ${AGENT.name} · Amelia Island Native Realtor`,
    `${AGENT.name} is a Realtor and co-owner of ${AGENT.office.name}, born and raised on Amelia Island.`
  );
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: AGENT.name,
      jobTitle: "Realtor, Co-owner",
      worksFor: { "@type": "Organization", name: AGENT.office.name },
      alumniOf: { "@type": "CollegeOrUniversity", name: "University of North Florida" },
      telephone: AGENT.cellE164,
      email: AGENT.email,
      image: `${AGENT.siteUrl}${AGENT.headshot.detail}`,
      sameAs: Object.values(AGENT.socials),
    },
  });

  return (
    <>
      <section className="relative z-10 px-5 pb-16 pt-32 md:px-8 md:pt-40">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ocean-950/60 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <PortraitBloom className="aspect-[3/4] max-h-[72vh] w-full" />
            <div className="glass-deep rounded-[2.25rem] p-7 md:p-12">
              <p className="eyebrow eyebrow-line mb-5">{AGENT.tagline}</p>
              <SplitWords
                as="h1"
                text="Raegan grew up on this island. Then she learned the numbers."
                immediate
                className="font-display text-4xl leading-[1.05] text-mist-100 md:text-6xl"
              />
              <div className="mt-8 space-y-4 text-base leading-relaxed text-mist-200">
                {AGENT.bio.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={SMS_HREF} className="btn-plum px-6 py-3 text-sm">
                  Text {AGENT.cell}
                </a>
                <a href={CELL_HREF} className="btn-ghost px-6 py-3 text-sm">
                  Call
                </a>
                <a href={MAIL_HREF} className="btn-ghost px-6 py-3 text-sm">
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 md:px-8">
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

      <section className="relative z-10 seam-y">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <SectionHeader eyebrow="Four threads" title="What you actually get." />
          <Reveal stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {THREADS.map((x) => (
              <Reveal.Item key={x.k}>
                <article className="glass card-hover h-full rounded-3xl p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">{x.k}</p>
                  <h3 className="mt-3 font-display text-xl leading-snug text-mist-100">{x.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist-300">{x.b}</p>
                </article>
              </Reveal.Item>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="Brokerage"
              title="Berkshire Hathaway HomeServices Heymann Williams Realty."
              sub="A locally owned brokerage with the reach of the BHHS network. Raegan is one of its co-owners, which means the buck stops with the person you're talking to."
            />
            <div className="mt-8 space-y-2 text-sm text-mist-300">
              <p>{AGENT.office.address}</p>
              <p>Office {AGENT.office.phone}</p>
              <p>
                <a href={AGENT.office.url} target="_blank" rel="noreferrer" className="hover:text-gold">
                  heymannwilliams.com ↗
                </a>
              </p>
            </div>
            <Link to="/neighborhoods" className="btn-ghost mt-8 inline-flex px-6 py-3 text-sm">
              Explore the neighborhoods →
            </Link>
          </div>
          <ContactForm title="Say hello" intro="A neighborhood, a timeline, a question. She'll answer it herself." />
        </div>
      </section>
    </>
  );
}
