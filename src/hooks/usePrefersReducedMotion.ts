import { useEffect, useState } from "react";

/**
 * React hook for reading the user's reduced motion preference in a safe way.
 */
export const usePrefersReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    const listener = (event: MediaQueryListEvent): void => {
      setPrefersReducedMotion(event.matches);
    };

    // Older Safari versions require addListener/removeListener.
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", listener);
      return () => {
        query.removeEventListener("change", listener);
      };
    }

    query.addListener(listener);
    return () => {
      query.removeListener(listener);
    };
  }, []);

  return prefersReducedMotion;
};
