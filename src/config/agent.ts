import data from "./agent.json";

/**
 * Raegan's public details, typed. The raw record lives in agent.json so the
 * build-time prerender script (scripts/prerender.mjs) and the server-side
 * concierge brief can read the same facts without a TypeScript toolchain.
 *
 * Every stat carries a `note` — anything that says CONFIRM must be verified
 * with Raegan before launch (see README → "Before launch").
 */
export interface AgentStat {
  value?: number;
  suffix?: string;
  text?: string;
  label: string;
  note: string;
}

export interface Agent {
  name: string;
  firstName: string;
  title: string;
  tagline: string;
  license: string;
  cell: string;
  cellE164: string;
  email: string;
  siteUrl: string;
  office: {
    name: string;
    short: string;
    affiliation: string;
    address: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    phoneE164: string;
    email: string;
    url: string;
    searchUrl: string;
  };
  socials: { instagram: string; facebook: string; linkedin: string };
  headshot: { thumb: string; preview: string; detail: string };
  bio: { short: string; paragraphs: string[] };
  stats: AgentStat[];
  serviceAreas: string[];
  disclosure: string;
}

export const AGENT = data as Agent;

/** tel: href for the cell. */
export const CELL_HREF = `tel:${AGENT.cellE164}`;
/** sms: href for the cell, with a friendly opener. */
export const SMS_HREF = `sms:${AGENT.cellE164}?&body=${encodeURIComponent(
  "Hi Raegan — I found you through your website."
)}`;
export const MAIL_HREF = `mailto:${AGENT.email}`;
