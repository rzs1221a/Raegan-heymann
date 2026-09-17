export type ExperienceProfile = "desktop-cinematic" | "mobile-cinematic";

type NavigatorConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

export type ExperienceConfig = {
  profile: ExperienceProfile;
  persistentMap: boolean;
  liveMapRoutes: boolean;
  preloadMapLibre: boolean;
  imageConcurrency: number;
  eagerImageTimeout: number;
  mapDprClear: number;
  mapDprDimmed: number;
  routeBloom: boolean;
  routeBlur: boolean;
  orbit: boolean;
  motionScale: number;
  agentOceanPortrait: boolean;
  portraitEffects: "cinematic" | "off";
  glass: "cinematic" | "mobile";
};

const desktopCinematic: ExperienceConfig = {
  profile: "desktop-cinematic",
  persistentMap: true,
  liveMapRoutes: true,
  preloadMapLibre: true,
  imageConcurrency: 8,
  eagerImageTimeout: 4200,
  mapDprClear: 2,
  mapDprDimmed: 1.5,
  routeBloom: true,
  routeBlur: true,
  orbit: true,
  motionScale: 1,
  agentOceanPortrait: true,
  portraitEffects: "cinematic",
  glass: "cinematic",
};

const mobileCinematic: ExperienceConfig = {
  profile: "mobile-cinematic",
  persistentMap: false,
  liveMapRoutes: true,
  preloadMapLibre: false,
  imageConcurrency: 4,
  eagerImageTimeout: 3000,
  mapDprClear: 1.15,
  mapDprDimmed: 1,
  routeBloom: false,
  routeBlur: false,
  orbit: false,
  motionScale: 0.72,
  agentOceanPortrait: false,
  portraitEffects: "off",
  glass: "mobile",
};

function media(query: string): boolean {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

function overrideFromUrl(): ExperienceProfile | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("experience");
  if (value === "desktop-cinematic" || value === "desktop-lean") {
    return "desktop-cinematic";
  }
  if (value === "mobile-cinematic" || value === "mobile-static") {
    return "mobile-cinematic";
  }
  return null;
}

export function getExperienceProfile(): ExperienceProfile {
  const override = overrideFromUrl();
  if (override) return override;
  if (typeof window === "undefined") return "desktop-cinematic";

  const nav = navigator as NavigatorConnection;
  const saveData = Boolean(nav.connection?.saveData);
  const slowNetwork =
    nav.connection?.effectiveType === "slow-2g" ||
    nav.connection?.effectiveType === "2g";
  const mobile =
    !media("(min-width: 821px)") ||
    media("(pointer: coarse) and (max-width: 1024px)");

  if (mobile || saveData || slowNetwork) return "mobile-cinematic";
  return "desktop-cinematic";
}

export function getExperienceConfig(): ExperienceConfig {
  return getExperienceConfigForProfile(getExperienceProfile());
}

export function getExperienceConfigForProfile(
  profile: ExperienceProfile
): ExperienceConfig {
  return profile === "mobile-cinematic" ? mobileCinematic : desktopCinematic;
}

export function scaledExperienceDuration(duration: number): number {
  return Math.max(100, Math.round(duration * getExperienceConfig().motionScale));
}

export function syncExperienceClass(): ExperienceProfile {
  const profile = getExperienceProfile();
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.dataset.experience = profile;
    root.dataset.performance = profile === "desktop-cinematic" ? "high" : "light";
    root.classList.toggle("experience-desktop-cinematic", profile === "desktop-cinematic");
    root.classList.toggle("experience-mobile-cinematic", profile === "mobile-cinematic");
    root.classList.toggle("perf-high", profile === "desktop-cinematic");
    root.classList.toggle("perf-light", profile === "mobile-cinematic");
    root.classList.remove("experience-desktop-lean", "experience-mobile-static", "perf-balanced");
  }
  return profile;
}
