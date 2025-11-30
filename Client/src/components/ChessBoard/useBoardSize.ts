import { useState, useEffect, useRef, RefObject } from "react";

interface UseBoardSizeReturn {
  boardSize: number;
  isMounted: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
}

const calculateBoardSize = (): number => {
  if (typeof window === "undefined") return 300;

  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width < 640) {
    // Mobile: fit within viewport, accounting for padding and other sections
    const availableHeight = height - 200; // Account for nav, engine lines, eval bar, controls
    const availableWidth = width - 32; // Account for padding
    return Math.min(availableWidth, availableHeight, 350);
  } else if (width >= 1024) {
    return 550; // lg desktop
  } else if (width >= 768) {
    return 400; // md tablet - reduced from 500
  } else {
    // 640-768px range - make it smaller to fit better
    const availableHeight = height - 250; // Account for all sections
    const availableWidth = width - 64; // Account for padding
    return Math.min(availableWidth, availableHeight, 350);
  }
};

export const useBoardSize = (): UseBoardSizeReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(calculateBoardSize);
  const [isMounted, setIsMounted] = useState(false);

  // Determine board size based on window width and height
  useEffect(() => {
    const updateSize = () => {
      setBoardSize(calculateBoardSize());
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Ensure container is mounted and has dimensions before rendering chessboard
  useEffect(() => {
    if (!containerRef.current) return;

    const checkReady = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        if (offsetWidth > 0 && offsetHeight > 0) {
          setIsMounted(true);
        } else {
          // Retry after a short delay
          setTimeout(checkReady, 50);
        }
      }
    };

    // Use double RAF to ensure DOM is fully laid out
    requestAnimationFrame(() => {
      requestAnimationFrame(checkReady);
    });
  }, [boardSize]);

  return { boardSize, isMounted, containerRef };
};
