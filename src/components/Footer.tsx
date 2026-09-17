import { useState } from "react";
import { Link } from "react-router-dom";
import BrandMark from "./BrandMark";
import { AGENT, CELL_HREF, MAIL_HREF, SMS_HREF } from "../config/agent";

export default function Footer() {
  const [disclosuresOpen, setDisclosuresOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer className="glass-deep relative z-10 seam-top">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-2xl text-mist-100">{AGENT.name}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
              {AGENT.tagline} · {AGENT.title}
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-mist-300">
              {AGENT.bio.short}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={SMS_HREF} className="btn-plum px-5 py-2.5 text-xs">
                Text {AGENT.cell}
              </a>
              <a href={CELL_HREF} className="btn-ghost px-5 py-2.5 text-xs">
                Call
              </a>
              <a href={MAIL_HREF} className="btn-ghost px-5 py-2.5 text-xs">
                Email
              </a>
            </div>
            <div className="mt-5 flex gap-4 text-xs text-mist-400">
              <a href={AGENT.socials.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">
                Instagram
              </a>
              <a href={AGENT.socials.facebook} target="_blank" rel="noreferrer" className="hover:text-gold">
                Facebook
              </a>
              <a href={AGENT.socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-gold">
                LinkedIn
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4">Explore</p>
            <ul className="space-y-2.5 text-sm text-mist-300">
              <li><Link className="hover:text-mist-100" to="/neighborhoods">Neighborhood guides</Link></li>
              <li><Link className="hover:text-mist-100" to="/listings">Homes for sale</Link></li>
              <li><Link className="hover:text-mist-100" to="/buy">Buying on the island</Link></li>
              <li><Link className="hover:text-mist-100" to="/sell">What's my home worth?</Link></li>
              <li><Link className="hover:text-mist-100" to="/about">About Raegan</Link></li>
              <li><Link className="hover:text-mist-100" to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Brokerage</p>
            <a href={AGENT.office.url} target="_blank" rel="noreferrer" aria-label={AGENT.office.name}>
              <BrandMark size="footer" />
            </a>
            <div className="mt-4 space-y-1 text-xs text-mist-400">
              <p>{AGENT.office.name}</p>
              <p>{AGENT.office.address}</p>
              <p>Office {AGENT.office.phone}</p>
            </div>
            <div className="mt-5 flex items-center gap-3 text-mist-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-label="Equal Housing Opportunity">
                <path d="M12 2 1 10h3v12h16V10h3L12 2zm0 2.6 6 4.4v11H6V9l6-4.4z" />
                <path d="M8.5 11h7v1.6h-7zM8.5 14h7v1.6h-7z" />
              </svg>
              <span className="text-[11px] leading-tight">
                Equal Housing
                <br />
                Opportunity
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={() => setDisclosuresOpen((v) => !v)}
            className="pill px-4 py-2 text-xs text-mist-300"
            aria-expanded={disclosuresOpen}
          >
            Disclosures &amp; credits {disclosuresOpen ? "−" : "+"}
          </button>
          {disclosuresOpen && (
            <div className="mt-4 max-w-3xl space-y-3 text-xs leading-relaxed text-mist-400">
              <p>{AGENT.disclosure}</p>
              <p>
                Homes shown on this site marked “Sample” are illustrative
                placeholders for layout, not live MLS inventory. Live listings
                open in the brokerage's MLS search. Price bands on neighborhood
                pages are broad resale reads, not appraisals.
              </p>
              <p>
                By submitting a form you agree that Raegan Heymann and
                Berkshire Hathaway HomeServices Heymann Williams Realty may
                contact you by phone, text, or email, including automated
                messages. Consent is not a condition of purchase. Message and
                data rates may apply.
              </p>
              <p>
                Map imagery © Esri, Maxar, Earthstar Geographics, and the GIS
                User Community. Building footprints © OpenStreetMap
                contributors via OpenFreeMap. Photorealistic 3D imagery, where
                shown, © Google.
              </p>
              <p>
                Neighborhood photography includes openly licensed images from
                Wikimedia Commons contributors and the Library of Congress
                Carol M. Highsmith Archive, used under their respective CC BY /
                CC BY-SA / CC0 / public-domain terms, credited beside each
                photo.
              </p>
            </div>
          )}
          <p className="mt-6 text-xs text-mist-400">
            © {year} {AGENT.name} · {AGENT.office.name} · Fernandina Beach, Amelia Island, Florida
          </p>
        </div>
      </div>
    </footer>
  );
}
