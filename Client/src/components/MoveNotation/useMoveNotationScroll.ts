import { useEffect, useRef, RefObject } from "react";

interface UseMoveNotationScrollReturn {
  moveRefs: React.MutableRefObject<Map<number, HTMLButtonElement>>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

const getPrefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
};

export const useMoveNotationScroll = (
  currentMoveIndex: number,
): UseMoveNotationScrollReturn => {
  const moveRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const behavior: ScrollBehavior = getPrefersReducedMotion() ? "auto" : "smooth";

    // If at starting position (index -1), scroll to top
    if (currentMoveIndex === -1) {
      container.scrollTo({
        top: 0,
        behavior,
      });
      return;
    }

    // For main line moves
    const activeMoveButton = moveRefs.current.get(currentMoveIndex);
    if (!activeMoveButton) return;

    // Scroll ONLY the move list container (avoid scrolling the page).
    // We also only scroll if the active move is actually out of view.
    const raf = requestAnimationFrame(() => {
      // If container can't scroll, do nothing (also avoids accidental page jumps).
      if (container.scrollHeight <= container.clientHeight) return;

      const padding = 8;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeMoveButton.getBoundingClientRect();

      const topLimit = containerRect.top + padding;
      const bottomLimit = containerRect.bottom - padding;

      const isAbove = buttonRect.top < topLimit;
      const isBelow = buttonRect.bottom > bottomLimit;
      if (!isAbove && !isBelow) return;

      // Compute delta in container scroll space using viewport rects.
      const delta = isAbove
        ? buttonRect.top - topLimit
        : buttonRect.bottom - bottomLimit;

      container.scrollTo({
        top: container.scrollTop + delta,
        behavior,
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [currentMoveIndex]);

  return { moveRefs, scrollContainerRef };
};
