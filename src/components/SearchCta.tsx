import type { Neighborhood } from "../data/neighborhoods.config";
import { isSearchLive } from "../data/neighborhoods.config";
import { AGENT } from "../config/agent";

/**
 * Primary CTA for neighborhood pages: the handoff to live inventory. While a
 * neighborhood's saved-search URL is still PENDING it points at the
 * brokerage's island-wide search instead of a dead button.
 */
export default function SearchCta({
  neighborhood,
  className = "",
}: {
  neighborhood: Neighborhood;
  className?: string;
}) {
  const live = isSearchLive(neighborhood);
  const href = live ? neighborhood.searchUrl : AGENT.office.searchUrl;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`btn-plum inline-flex items-center gap-2 px-7 py-3.5 text-sm ${className}`}
    >
      {live ? `View ${neighborhood.name} homes for sale` : "Search homes for sale"}
      <span aria-hidden>↗</span>
    </a>
  );
}
