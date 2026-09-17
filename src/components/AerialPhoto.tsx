import { useState } from "react";
import AerialThumb from "./AerialThumb";

/**
 * Card-sized aerial image with graceful fallback: renders real stitched
 * satellite imagery, and falls back to the stylized AerialThumb illustration
 * if the file is missing (e.g. before scripts/fetch-imagery.mjs has run).
 */
export default function AerialPhoto({
  src,
  alt = "",
  fallbackVariant,
  className = "",
}: {
  src: string;
  alt?: string;
  fallbackVariant: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <AerialThumb variant={fallbackVariant} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full select-none object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ocean-950/45 via-transparent to-ocean-950/15" />
    </div>
  );
}
