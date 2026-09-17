/** Tiny event bus so any control (e.g. the hero search) can open the ⌘K bar. */
const EVENT = "hw:open-command";

export function openCommandBar(query = "") {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: query }));
}

export function onOpenCommandBar(handler: (query: string) => void) {
  const fn = (e: Event) => handler((e as CustomEvent<string>).detail ?? "");
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}
