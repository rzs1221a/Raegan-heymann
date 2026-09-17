import { BRAND } from "../lib/constants";

/**
 * Brokerage identity lockup. The official maroon logo is transparent, so it
 * sits on a white plate inside a gold-gradient frame (matching the BHHS
 * luxury reference). Falls back to a typographic lockup if the asset is
 * removed.
 */
export default function BrandMark({
  size = "nav",
}: {
  size?: "nav" | "footer";
}) {
  if (BRAND.logoSrc) {
    const plateClass =
      size === "footer" ? "px-4 py-2.5" : "px-3 py-1.5";
    const imgClass = size === "footer" ? "h-8 w-auto" : "h-6 w-auto md:h-7";
    return (
      <span className="logo-frame inline-block">
        <span className={`logo-plate ${plateClass}`}>
          <img
            src={BRAND.logoSrc}
            alt={`${BRAND.affiliation} ${BRAND.name}`}
            width={470}
            height={72}
            className={`${imgClass} object-contain`}
          />
        </span>
      </span>
    );
  }

  if (size === "footer") {
    return (
      <div>
        <p className="text-[10px] font-semibold tracking-[0.18em] text-mist-400">
          BERKSHIRE HATHAWAY
        </p>
        <p className="text-[10px] font-semibold tracking-[0.18em] text-mist-400">
          HOMESERVICES
        </p>
        <p className="mt-1.5 border-t border-white/15 pt-1.5 text-base font-semibold tracking-wide text-mist-100">
          {BRAND.name}
        </p>
      </div>
    );
  }

  return (
    <div>
      <span className="block text-sm font-semibold tracking-wide text-mist-100">
        {BRAND.short}
      </span>
      <span className="block text-[9px] tracking-[0.15em] text-mist-400">
        BERKSHIRE HATHAWAY HOMESERVICES
      </span>
    </div>
  );
}
