import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FloatingNav from "./FloatingNav";
import Footer from "./Footer";
import Atmosphere from "./Atmosphere";
import BackgroundMap from "./BackgroundMap";
import MagneticField from "./MagneticField";
import CommandBar from "./CommandBar";
import ErrorBoundary from "./ErrorBoundary";
import MobileTabBar from "./MobileTabBar";
import MobileMenu from "./MobileMenu";
import ScrollProgress from "./ScrollProgress";
import { useExperienceConfig } from "../lib/experienceContext";
import { refreshScrollTriggers } from "../lib/motion/gsap";
import { AGENT } from "../config/agent";

/** Static per-route titles. Detail routes set their own via useDocumentTitle. */
const ROUTE_TITLES: Record<string, string> = {
  "/": "Amelia Island Native · Realtor",
  "/about": "About Raegan",
  "/neighborhoods": "Amelia Island & Yulee neighborhood guides",
  "/listings": "Homes for sale",
  "/buy": "Buy on Amelia Island",
  "/sell": "What's my home worth?",
  "/contact": "Contact Raegan",
  "/thanks": "Thank you",
};

export default function Layout() {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const routeMotionRef = useRef<number | null>(null);
  const experience = useExperienceConfig();
  const appLike = pathname === "/listings";

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMoreOpen(false));
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    // Pinned/scrubbed sections re-measure after the new route paints.
    const id = window.setTimeout(refreshScrollTriggers, 400);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(() => refreshScrollTriggers()).catch(() => {});
    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    if (routeMotionRef.current) window.clearTimeout(routeMotionRef.current);
    document.body.classList.remove("route-blooming");
    if (!experience.routeBloom) return;
    void document.body.offsetWidth;
    document.body.classList.add("route-blooming");
    routeMotionRef.current = window.setTimeout(() => {
      document.body.classList.remove("route-blooming");
      routeMotionRef.current = null;
    }, 620);
    return () => {
      if (routeMotionRef.current) window.clearTimeout(routeMotionRef.current);
      document.body.classList.remove("route-blooming");
      routeMotionRef.current = null;
    };
  }, [pathname, experience.routeBloom]);

  useEffect(() => {
    if (/^\/(listings|neighborhoods)\/.+/.test(pathname)) return;
    const t = ROUTE_TITLES[pathname];
    document.title = t ? `${t} · ${AGENT.name}` : AGENT.name;
  }, [pathname]);

  return (
    <div
      className={`relative flex min-h-screen flex-col ${
        appLike ? "" : "pb-[calc(env(safe-area-inset-bottom)+4.25rem)] lg:pb-0"
      }`}
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <BackgroundMap />
      <Atmosphere />
      <MagneticField />
      <ScrollProgress />
      <FloatingNav />
      <CommandBar />
      <main id="main" className="flex-1">
        {/* No opacity wrapper here: any opacity/will-change on this element
            makes it a backdrop root, which stops the glass panels inside from
            frosting the fixed map behind the page. */}
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      {!appLike && <Footer />}
      <MobileTabBar onMore={() => setMoreOpen(true)} moreActive={moreOpen} />
      <MobileMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
