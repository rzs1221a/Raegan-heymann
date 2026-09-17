import { useEffect } from "react";

/**
 * Inject a schema.org JSON-LD block into <head> for the current page and
 * remove it on unmount. The prerender pass snapshots the DOM after render,
 * so this markup ships in the static HTML crawlers and AI agents read.
 */
export function useJsonLd(schema: object | null) {
  useEffect(() => {
    if (!schema) return;
    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.dataset.route = "true";
    tag.textContent = JSON.stringify(schema);
    document.head.appendChild(tag);
    return () => {
      tag.remove();
    };
  }, [schema]);
}
