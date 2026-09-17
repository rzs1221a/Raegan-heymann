import { useEffect, useState } from "react";
import { ISLAND_CENTER } from "../lib/geo";
import { lightLabel, sunAltitude } from "../lib/sun";

const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
});

function read() {
  const now = new Date();
  const [lon, lat] = ISLAND_CENTER;
  return { time: fmt.format(now), light: lightLabel(sunAltitude(now, lat, lon)) };
}

/** Fernandina Beach local time and the real state of the light there. */
export default function LocalTimeChip({ className = "" }: { className?: string }) {
  const [state, setState] = useState(read);
  useEffect(() => {
    const id = window.setInterval(() => setState(read()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className={`time-chip ${className}`} aria-live="off">
      <span className="time-chip-dot" aria-hidden="true" />
      Fernandina Beach · {state.time} · {state.light}
    </span>
  );
}
