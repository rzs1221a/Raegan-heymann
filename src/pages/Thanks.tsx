import { Link } from "react-router-dom";
import { AGENT, CELL_HREF, SMS_HREF } from "../config/agent";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function Thanks() {
  useDocumentTitle("Thank you");
  return (
    <section className="relative z-10 mx-auto max-w-2xl px-5 pb-24 pt-40 text-center">
      <div className="glass-deep rounded-[2rem] p-8 md:p-12">
        <img src={AGENT.headshot.thumb} alt="" width={72} height={72} className="mx-auto h-18 w-18 rounded-full object-cover ring-2 ring-gold/50" />
        <p className="eyebrow mt-6">Got it</p>
        <h1 className="mt-3 font-display text-3xl text-mist-100 md:text-4xl">Raegan will reach out herself.</h1>
        <p className="mt-4 text-sm leading-relaxed text-mist-300">
          Usually the same day. If it's urgent, her cell is right here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={SMS_HREF} className="btn-plum px-6 py-3 text-sm">Text {AGENT.cell}</a>
          <a href={CELL_HREF} className="btn-ghost px-6 py-3 text-sm">Call</a>
          <Link to="/" className="btn-ghost px-6 py-3 text-sm">Back to the island</Link>
        </div>
      </div>
    </section>
  );
}
