import { useEffect, useRef, RefObject } from "react";

interface UseMoveNotationScrollReturn {
  moveRefs: React.MutableRefObject<Map<number, HTMLButtonElement>>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

export const useMoveNotationScroll = (
  currentMoveIndex: number,
): UseMoveNotationScrollReturn => {
  const moveRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If at starting position (index -1), scroll to top
    if (currentMoveIndex === -1 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    // For main line moves
    const activeMoveButton = moveRefs.current.get(currentMoveIndex);
    if (activeMoveButton && scrollContainerRef.current) {
      activeMoveButton.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [currentMoveIndex]);

  return { moveRefs, scrollContainerRef };
};
