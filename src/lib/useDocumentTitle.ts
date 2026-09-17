import { useEffect } from "react";

const BASE = "Heymann Williams Realty";

/**
 * Set a route-specific document title (and optionally the meta description) for
 * SEO + social sharing. Pass the page-specific part; the brand suffix is added
 * automatically. No dependency — just the DOM.
 */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} · ${BASE}` : BASE;

    let restoreDesc: (() => void) | undefined;
    if (description) {
      const tag = document.querySelector('meta[name="description"]');
      if (tag) {
        const prevDesc = tag.getAttribute("content");
        tag.setAttribute("content", description);
        restoreDesc = () => prevDesc && tag.setAttribute("content", prevDesc);
      }
    }
    return () => {
      document.title = prev;
      restoreDesc?.();
    };
  }, [title, description]);
}
