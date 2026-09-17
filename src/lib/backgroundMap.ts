import { createRef } from "react";
import type { LiveMapHandle, MapMarker } from "../components/LiveMap";
import type { MapView } from "./geo";

/**
 * Shared handle to the single persistent background map. BackgroundMap attaches
 * the live map to this ref; Layout flies its camera on every route change so the
 * coast feels like one continuous flight — as if the map never left.
 */
export const backgroundMapRef = createRef<LiveMapHandle>();

/**
 * Marker store for the shared map. The Homes page pushes its listing pins here
 * (prices/labels) so the background map "lights up" with the inventory, then
 * clears them on leave so other routes show the plain coast.
 */
let bgMarkers: MapMarker[] = [];
const markerSubs = new Set<() => void>();
const emptyMarkers: MapMarker[] = [];

export function setBackgroundMarkers(next: MapMarker[]): void {
  bgMarkers = next;
  markerSubs.forEach((fn) => fn());
}
export function getBackgroundMarkers(): MapMarker[] {
  return bgMarkers;
}
export function getEmptyMarkers(): MapMarker[] {
  return emptyMarkers;
}
export function subscribeBackgroundMarkers(fn: () => void): () => void {
  markerSubs.add(fn);
  return () => {
    markerSubs.delete(fn);
  };
}

const DEFAULT: MapView = { center: [-81.452, 30.605], zoom: 11.7, pitch: 60, bearing: -26 };

/**
 * A distinct cinematic camera per route — all centered on the island, each
 * with its own zoom, pitch and bearing so every navigation lands the flight
 * somewhere new.
 */
const ROUTE_VIEWS: Record<string, MapView> = {
  "/": DEFAULT,
  "/about": { center: [-81.4626, 30.6697], zoom: 12.6, pitch: 56, bearing: 18 },
  "/neighborhoods": { center: [-81.49, 30.61], zoom: 10.9, pitch: 46, bearing: 4 },
  "/listings": { center: [-81.47, 30.59], zoom: 11.1, pitch: 42, bearing: -12 },
  "/buy": { center: [-81.44, 30.63], zoom: 12.1, pitch: 58, bearing: 34 },
  "/sell": { center: [-81.46, 30.67], zoom: 12.4, pitch: 56, bearing: -28 },
  "/contact": { center: [-81.4613, 30.6119], zoom: 12.8, pitch: 54, bearing: -16 },
  "/thanks": { center: [-81.4283, 30.6642], zoom: 12.9, pitch: 60, bearing: 62 },
};

function responsiveMapView(view: MapView): MapView {
  if (typeof window === "undefined") return view;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const wideBoost = width >= 1900 ? 0.32 : width >= 1500 ? 0.2 : width >= 1024 ? 0.1 : 0;
  const shortTrim = height < 760 ? -0.08 : 0;
  return {
    ...view,
    zoom: view.zoom + wideBoost + shortTrim,
  };
}

export function viewForRoute(pathname: string): MapView {
  if (pathname.startsWith("/neighborhoods/"))
    return responsiveMapView({
      center: [-81.5, 30.6],
      zoom: 11.8,
      pitch: 52,
      bearing: 8,
    });
  if (pathname.startsWith("/listings/"))
    return responsiveMapView({
      center: [-81.45, 30.6],
      zoom: 12.8,
      pitch: 58,
      bearing: -20,
    });
  return responsiveMapView(ROUTE_VIEWS[pathname] ?? DEFAULT);
}
