import { Link } from "react-router-dom";
import { AGENT, CELL_HREF, MAIL_HREF, SMS_HREF } from "../../config/agent";

/** What renders in the concierge's place when no API key is configured. */
export default function ConciergeOffline({ starters }: { starters: string[] }) {
  return (
    <div className="glass-deep rounded-[2rem] p-7 md:p-9">
      <div className="flex items-center gap-4">
        <img
          src={AGENT.headshot.thumb}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover ring-2 ring-gold/50"
        />
        <div>
          <p className="font-display text-xl text-mist-100">Ask Raegan directly.</p>
          <p className="text-sm text-mist-300">She answers her own phone. Really.</p>
        </div>
      </div>
      <ul className="mt-6 space-y-2">
        {starters.map((s) => (
          <li key={s}>
            <Link
              to={`/contact?q=${encodeURIComponent(s)}`}
              className="glass block rounded-2xl px-4 py-3 text-sm text-mist-200 transition hover:text-gold"
            >
              {s}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
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
  );
}
