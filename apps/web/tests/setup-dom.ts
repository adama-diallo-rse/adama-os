// Prothèses jsdom, chargées avant chaque fichier de test.
//
// jsdom n'implémente ni IntersectionObserver ni matchMedia, dont Framer Motion
// se sert pour les entrées au défilement et pour prefers-reduced-motion. Sans
// ces deux stubs, un test de rendu échoue pour une raison qui n'a rien à voir
// avec le composant testé. Aucun effet en environnement node : les gardes
// ci-dessous ne posent rien si l'objet window n'existe pas.
class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: number[] = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: IntersectionObserverStub,
  });
}

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
