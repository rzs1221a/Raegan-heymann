const imageCache = new Set<string>();

export function addImagePreloadHints(srcs: string[], fetchPriority: "high" | "low" = "high") {
  if (typeof document === "undefined") return;
  for (const src of [...new Set(srcs.filter(Boolean))]) {
    if (document.head.querySelector(`link[rel="preload"][href="${src}"]`)) continue;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    link.fetchPriority = fetchPriority;
    document.head.appendChild(link);
  }
}

export async function preloadImage(src: string, timeout = 3200): Promise<void> {
  if (!src || imageCache.has(src) || typeof Image === "undefined") return;
  await new Promise<void>((resolve) => {
    const img = new Image();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      imageCache.add(src);
      resolve();
    };
    const timer = window.setTimeout(finish, timeout);
    img.onload = async () => {
      try {
        await img.decode?.();
      } catch {
        /* Decode is best-effort; loaded bytes are enough for a fast reveal. */
      } finally {
        window.clearTimeout(timer);
        finish();
      }
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      finish();
    };
    img.decoding = "async";
    img.src = src;
  });
}

export async function preloadImages(
  srcs: string[],
  concurrency = 6,
  timeout = 3200
): Promise<void> {
  const queue = [...new Set(srcs.filter(Boolean))];
  let index = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (index < queue.length) {
        const src = queue[index++];
        await preloadImage(src, timeout);
      }
    })
  );
}

export function warmImage(src?: string, timeout = 2400): void {
  if (!src || imageCache.has(src)) return;
  void preloadImage(src, timeout);
}
