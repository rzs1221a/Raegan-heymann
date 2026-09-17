import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { getNeighborhoodBySlug, neighborhoodPath, neighborhoodPhoto } from "../data/neighborhoods.config";
import { buildNeighborhoodTour } from "../lib/neighborhoodTour";
import type { TourBeat } from "../lib/listingTour";
import { useScrollFlight } from "../lib/useScrollFlight";
import { useExperienceConfig } from "../lib/experienceContext";
import { motionEnabled, useGsap } from "../lib/motion/gsap";
import AerialPhoto from "./AerialPhoto";
import SplitWords from "./SplitWords";

/** Five stops, north to south then across the bridge. */
const STOPS: { slug: string; line: string }[] = [
  { slug: "historic-downtown", line: "Where the island started: porches, the harbor, Centre Street." },
  { slug: "amelia-park", line: "Front porches and a walk to the coffee shop, mid-island." },
  { slug: "seaside", line: "Beach streets a block off the sand." },
  { slug: "amelia-island-plantation", line: "Oak canopy, fairways, marsh light at the south end." },
  { slug: "wildlight", line: "Across the bridge: the new town, twenty minutes from the beach." },
];

function flightPad() {
  if (typeof window === "undefined") return undefined;
  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  return desktop
    ? {
        top: Math.round(window.innerHeight * 0.14),
        right: Math.round(window.innerWidth * 0.42),
        bottom: Math.round(window.innerHeight * 0.14),
        left: Math.round(window.innerWidth * 0.06),
      }
    : { top: 80, right: 16, bottom: Math.round(window.innerHeight * 0.5), left: 16 };
}

/**
 * The Island — a scroll flyover. On desktop, five glass cards on the right
 * rail; as each crosses the focus band, the persistent background map flies
 * to that neighborhood's signature pass. On phones (no persistent map) the
 * same cards become a GSAP-pinned horizontal reel.
 */
export default function IslandFlyover() {
  const experience = useExperienceConfig();
  const stops = useMemo(
    () =>
      STOPS.map((s) => ({ ...s, n: getNeighborhoodBySlug(s.slug)! })).filter((s) => s.n),
    []
  );
  const beats = useMemo(() => {
    const out: Record<string, TourBeat> = {};
    for (const s of stops) out[s.slug] = buildNeighborhoodTour(s.n)[1];
    return out;
  }, [stops]);
  const pad = useMemo(() => flightPad(), []);
  const flight = useScrollFlight(beats, pad);

  const reelHost = useRef<HTMLDivElement>(null);
  const reelEnabled = !experience.persistentMap && motionEnabled();
  useGsap(
    reelHost,
    (g) => {
      if (!reelEnabled) return;
      const host = reelHost.current;
      const track = host?.querySelector<HTMLElement>(".reel-track");
      if (!host || !track) return;
      const dist = () => track.scrollWidth - host.clientWidth;
      g.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: host,
          start: "top top+=88",
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    },
    [reelEnabled]
  );

  const header = (
    <div className="max-w-xl">
      <p className="eyebrow eyebrow-line mb-5">The island</p>
      <SplitWords
        as="h2"
        text="Thirteen miles. A different life on every one."
        className="text-3xl font-medium leading-[1.1] tracking-tight text-mist-100 md:text-[2.75rem]"
      />
      <p className="mt-5 text-lg font-light leading-relaxed text-mist-300">
        Scroll, and the island flies with you. Raegan has sold homes on every stop.
      </p>
    </div>
  );

  const card = (s: (typeof stops)[number], i: number, extra = "") => (
    <article key={s.slug} className={`glass-deep overflow-hidden rounded-[2rem] ${extra}`}>
      <AerialPhoto
        src={neighborhoodPhoto(s.slug)}
        alt={`Aerial view of ${s.n.name}`}
        fallbackVariant={s.n.thumb}
        className="h-36"
      />
      <div className="p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
          0{i + 1} · {s.n.region.replace(/-/g, " ")}
        </p>
        <h3 className="mt-2 font-display text-2xl text-mist-100">{s.n.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-mist-300">{s.line}</p>
        <p className="mt-3 text-xs text-mist-400">
          <span className="text-mist-300">Price read:</span> {s.n.priceNote.split(";")[0]}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={neighborhoodPath(s.n)} className="btn-ghost px-4 py-2 text-xs">
            Guide →
          </Link>
          <button
            type="button"
            className="pill px-4 py-2 text-xs text-mist-200"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("rh:ask", { detail: `What is ${s.n.name} like to live in?` })
              )
            }
          >
            Ask the concierge
          </button>
        </div>
      </div>
    </article>
  );

  if (!experience.persistentMap) {
    // Phone: pinned horizontal reel (or a plain horizontal scroller when
    // motion is off).
    return (
      <section className="relative z-10 px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">{header}</div>
        <div
          ref={reelHost}
          className={`mt-10 ${reelEnabled ? "overflow-hidden" : "no-scrollbar overflow-x-auto"}`}
        >
          <div className="reel-track pr-5">{stops.map((s, i) => card(s, i, "reel-card"))}</div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl">
          <Link to="/neighborhoods" className="btn-plum inline-flex px-6 py-3 text-sm">
            All 22 neighborhood guides
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 px-5 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.7fr)]">
          <div className="lg:sticky lg:top-32 lg:h-fit lg:self-start lg:pt-8">
            {header}
            <Link to="/neighborhoods" className="btn-plum mt-8 inline-flex px-6 py-3 text-sm">
              All 22 neighborhood guides
            </Link>
          </div>
          <div className="space-y-[38vh] py-[18vh]">
            {stops.map((s, i) => (
              <div key={s.slug} ref={flight(s.slug)} className="min-h-[24vh]">
                {card(s, i)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
