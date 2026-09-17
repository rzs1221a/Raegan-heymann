import Reveal from "./Reveal";

const STEPS = [
  {
    n: "01",
    k: "Listen",
    t: "Your goals, on the record",
    b: "A real conversation about how you live, your timing, and your numbers. Before any showing, before any comp.",
  },
  {
    n: "02",
    k: "Position",
    t: "Prepare & price with strategy",
    b: "Sellers get staging notes and a price that pulls offers. Buyers get a short list, not a firehose.",
  },
  {
    n: "03",
    k: "Negotiate",
    t: "Fiercely, on your behalf",
    b: "Offer, inspection, appraisal, every deadline in between. Raegan reads contracts the way a lender does.",
  },
  {
    n: "04",
    k: "Close",
    t: "Keys, and a neighbor",
    b: "Movers, contractors, schools, the best shrimp on Centre Street. She stays in your corner after closing.",
  },
];

export default function ProcessSteps() {
  return (
    <Reveal stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s) => (
        <Reveal.Item key={s.n}>
          <article className="glass card-hover h-full rounded-3xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
              {s.n} · {s.k}
            </p>
            <h3 className="mt-3 font-display text-xl leading-snug text-mist-100">{s.t}</h3>
            <p className="mt-3 text-sm leading-relaxed text-mist-300">{s.b}</p>
          </article>
        </Reveal.Item>
      ))}
    </Reveal>
  );
}
