import { AGENT } from "../config/agent";
import { addImagePreloadHints, preloadImages } from "./imagePreload";
import { getExperienceConfig, syncExperienceClass } from "./experienceProfile";

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function routeImport(pathname: string) {
  if (pathname.startsWith("/neighborhoods/")) return import("../pages/NeighborhoodPage");
  if (pathname.startsWith("/listings/")) return import("../pages/ListingDetail");
  if (pathname === "/neighborhoods") return import("../pages/NeighborhoodsIndex");
  if (pathname === "/listings") return import("../pages/Listings");
  if (pathname === "/about") return import("../pages/About");
  if (pathname === "/sell") return import("../pages/Sell");
  if (pathname === "/buy") return import("../pages/Buy");
  if (pathname === "/contact") return import("../pages/Contact");
  if (pathname === "/thanks") return import("../pages/Thanks");
  return import("../pages/Home");
}

/**
 * What the boot gate waits for. Phase 1 is what the first screen needs: the
 * current route's module, the map engine (desktop), the poster, Raegan's
 * portrait, and the motion library. Phase 2 warms the rest in the background
 * after the gate has already started dissolving.
 */
export async function preloadEverything() {
  syncExperienceClass();
  const config = getExperienceConfig();
  const currentPath = window.location.pathname;
  const needsMap = config.preloadMapLibre || config.liveMapRoutes;

  const firstScreen = [
    "/imagery/coast-hero.jpg",
    AGENT.headshot.preview,
    AGENT.headshot.thumb,
  ];
  addImagePreloadHints(firstScreen);

  await Promise.allSettled([
    routeImport(currentPath),
    needsMap ? import("../components/LiveMap") : Promise.resolve(),
    needsMap ? import("maplibre-gl") : Promise.resolve(),
    import("gsap"),
    preloadImages(firstScreen, config.imageConcurrency, config.eagerImageTimeout),
    delay(900),
  ]);

  void Promise.allSettled([
    import("../pages/Home"),
    import("../pages/NeighborhoodsIndex"),
    import("../pages/Listings"),
    import("../pages/About"),
    import("../pages/Sell"),
    import("../pages/Buy"),
    import("../pages/Contact"),
    preloadImages([AGENT.headshot.detail, "/imagery/coast-full.jpg"], 2, 5000),
  ]);
}
