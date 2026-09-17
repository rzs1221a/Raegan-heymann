import { AGENT } from "../config/agent";

/** Brokerage identity — rendered by BrandMark on a white plate. */
export const BRAND = {
  name: AGENT.office.short,
  short: "Heymann Williams",
  affiliation: AGENT.office.affiliation,
  logoSrc: "/brand/logo.png" as string | null,
};

export const OFFICE = {
  location: "Fernandina Beach · Amelia Island, Florida",
  address: AGENT.office.address,
  phone: AGENT.office.phone,
  email: AGENT.office.email,
  url: AGENT.office.url,
};

export const SITE_URL = AGENT.siteUrl;
