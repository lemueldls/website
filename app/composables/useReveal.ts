export function useReveal() {
  let observer: IntersectionObserver | null = null;
  let mutations: MutationObserver | null = null;

  function scan() {
    if (import.meta.server) return;

    if (!("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    const io: IntersectionObserver = (observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          markRevealed(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -2% 0px", threshold: 0.02 },
    ));

    for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
      if (el.hasAttribute("data-revealed")) continue;
      if (isInView(el)) markRevealed(el);
      else io.observe(el);
    }

    for (const group of document.querySelectorAll<HTMLElement>("[data-reveal-group]")) {
      Array.from(group.children).forEach((child, i) => {
        const el = child as HTMLElement;
        el.setAttribute("data-reveal", "");
        el.style.setProperty("--reveal-delay", `${Math.min(i, 8) * 70}ms`);

        if (el.hasAttribute("data-revealed")) return;
        if (isInView(el)) markRevealed(el);
        else io.observe(el);
      });
    }
  }

  onMounted(() => {
    scan();

    if (!("MutationObserver" in window)) return;

    let pending = false;
    mutations = new MutationObserver(() => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        scan();
      });
    });

    mutations.observe(document.body, { childList: true, subtree: true });
  });

  onScopeDispose(() => {
    observer?.disconnect();
    mutations?.disconnect();
  });

  return { refresh: scan };
}

function markRevealed(el: HTMLElement) {
  el.setAttribute("data-revealed", "");
}

function isInView(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

function revealAll() {
  for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
    markRevealed(el);
  }
}
