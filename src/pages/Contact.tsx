import { useSearchParams } from "react-router-dom";
import ContactForm from "../components/ContactForm";
import SplitWords from "../components/SplitWords";
import BrandMark from "../components/BrandMark";
import LocalTimeChip from "../components/LocalTimeChip";
import { AGENT, CELL_HREF, MAIL_HREF, SMS_HREF } from "../config/agent";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function Contact() {
  useDocumentTitle(`Contact ${AGENT.name}`, `Text, call, or email ${AGENT.name}, Amelia Island Realtor.`);
  const [params] = useSearchParams();
  return (
    <section className="relative z-10 px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ocean-950/60 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="eyebrow eyebrow-line mb-4">Contact</p>
          <SplitWords as="h1" text="Talk to the person who grew up here." immediate className="font-display text-4xl leading-[1.05] text-mist-100 md:text-6xl" />
          <p className="mt-5 text-lg text-mist-300">She answers her own phone. Text is welcome.</p>
          <LocalTimeChip className="mt-5" />
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ContactForm
              defaultInterest={params.get("interest") ?? undefined}
              defaultMessage={params.get("q") ?? undefined}
            />
          </div>
          <div className="space-y-5">
            <div className="glass-deep rounded-3xl p-6">
              <img src={AGENT.headshot.preview} alt={AGENT.name} width={320} height={320} className="h-40 w-40 rounded-3xl object-cover object-top" />
              <p className="mt-4 font-display text-2xl text-mist-100">{AGENT.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">{AGENT.tagline} · {AGENT.title}</p>
              <div className="mt-5 space-y-2 text-sm text-mist-300">
                <p><a href={CELL_HREF} className="hover:text-gold">{AGENT.cell}</a> <span className="text-mist-400">cell</span></p>
                <p><a href={MAIL_HREF} className="hover:text-gold">{AGENT.email}</a></p>
              </div>
              <div className="mt-5 flex gap-2">
                <a href={SMS_HREF} className="btn-plum flex-1 px-4 py-3 text-center text-xs">Text</a>
                <a href={CELL_HREF} className="btn-ghost flex-1 px-4 py-3 text-center text-xs">Call</a>
              </div>
              <div className="mt-5 flex gap-4 text-xs text-mist-400">
                <a href={AGENT.socials.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">Instagram</a>
                <a href={AGENT.socials.facebook} target="_blank" rel="noreferrer" className="hover:text-gold">Facebook</a>
                <a href={AGENT.socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-gold">LinkedIn</a>
              </div>
            </div>
            <div className="glass rounded-3xl p-6">
              <p className="eyebrow mb-3">Office</p>
              <BrandMark size="footer" />
              <div className="mt-4 space-y-1.5 text-sm text-mist-300">
                <p>{AGENT.office.name}</p>
                <p>{AGENT.office.address}</p>
                <p>{AGENT.office.phone}</p>
                <p>
                  <a href={AGENT.office.url} target="_blank" rel="noreferrer" className="text-mist-400 underline-offset-4 hover:text-mist-100 hover:underline">
                    heymannwilliams.com ↗
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
