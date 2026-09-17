/**
 * Sun altitude at a point on Earth — pure astronomy, no network. Used by the
 * local-time chip to say "golden hour" honestly. Port of the almanac in
 * LiveLoveAmelia's gl/sun.js (NOAA solar position, ±1°).
 */
export function sunAltitude(date: Date, lat: number, lon: number): number {
  const rad = Math.PI / 180;
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * rad;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad;
  const eps = (23.439 - 0.0000004 * n) * rad;
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda));
  const dec = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
  const lst = ((gmst + lon / 15) % 24) * 15 * rad;
  const ha = lst - ra;
  const alt = Math.asin(
    Math.sin(lat * rad) * Math.sin(dec) + Math.cos(lat * rad) * Math.cos(dec) * Math.cos(ha)
  );
  return alt / rad;
}

/** A short, honest label for the light right now. */
export function lightLabel(altDeg: number): string {
  if (altDeg < -12) return "night";
  if (altDeg < -6) return "nautical twilight";
  if (altDeg < 0) return "civil twilight";
  if (altDeg < 6) return "golden hour";
  if (altDeg < 25) return "soft light";
  return "full sun";
}
