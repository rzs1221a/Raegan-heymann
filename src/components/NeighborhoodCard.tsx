import { Link } from "react-router-dom";
import AerialPhoto from "./AerialPhoto";
import type { Neighborhood } from "../data/neighborhoods.config";
import { neighborhoodPath, neighborhoodPhoto } from "../data/neighborhoods.config";

export default function NeighborhoodCard({
  neighborhood,
  onHover,
  onHoverEnd,
}: {
  neighborhood: Neighborhood;
  onHover?: () => void;
  onHoverEnd?: () => void;
}) {
  return (
    <Link
      to={neighborhoodPath(neighborhood)}
      className="card-hover group block rounded-3xl"
      onPointerEnter={onHover}
      onPointerLeave={onHoverEnd}
    >
      <div className="relative overflow-hidden rounded-3xl">
        <AerialPhoto
          src={neighborhoodPhoto(neighborhood.slug)}
          alt={`Aerial view of ${neighborhood.name}`}
          fallbackVariant={neighborhood.thumb}
          className="h-44 rounded-3xl"
        />
        <div className="glass relative -mt-10 rounded-3xl p-5">
          <h3 className="text-lg font-medium leading-snug text-mist-100">
            {neighborhood.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            {neighborhood.tagline}
          </p>
          <p className="mt-3 text-xs text-mist-400">
            <span className="text-mist-300">Price read:</span>{" "}
            {neighborhood.priceNote.split(";")[0]}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-plum-400 transition group-hover:gap-2.5 group-hover:text-plum-500">
            View neighborhood <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
