import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { ExperienceContext } from "../lib/experienceContext";
import {
  getExperienceConfigForProfile,
  getExperienceProfile,
  syncExperienceClass,
} from "../lib/experienceProfile";

export default function ExperienceShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [profile, setProfile] = useState(() => getExperienceProfile());
  const config = useMemo(() => getExperienceConfigForProfile(profile), [profile]);

  useEffect(() => {
    const refresh = () => setProfile(syncExperienceClass());
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onResize = () => refresh();
    const onChange = () => refresh();
    window.addEventListener("resize", onResize);
    if (motion.addEventListener) motion.addEventListener("change", onChange);
    else motion.addListener(onChange);
    syncExperienceClass();
    return () => {
      window.removeEventListener("resize", onResize);
      if (motion.removeEventListener) motion.removeEventListener("change", onChange);
      else motion.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setProfile(syncExperienceClass());
    });
    return () => window.cancelAnimationFrame(raf);
  }, [location.pathname, location.search]);

  return (
    <ExperienceContext.Provider value={config}>
      {children}
    </ExperienceContext.Provider>
  );
}
