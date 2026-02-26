import { useState, useEffect, useRef, RefObject } from "react";

interface UseBoardSizeReturn {
  boardSize: number;
  isMounted: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
}

const MIN_BOARD_SIZE_PX = 120;
const MAX_BOARD_SIZE_PX = 700;

const calculateBoardSize = (): number => {
  if (typeof window === "undefined") return 300;

  const width = window.innerWidth;
  const height = window.innerHeight;

  let size: number;
  if (width < 640) {
    // Mobile: fit within viewport, accounting for padding and other sections
    const availableHeight = height - 200; // Account for nav, engine lines, eval bar, controls
    const availableWidth = width - 32; // Account for padding
    size = Math.min(availableWidth, availableHeight, 350);
  } else {
    // md (768px+) and lg (1024px+): viewport-aware dynamic calculation
    const sidebarWidth = width >= 1024 ? 400 : 288;
    const navHeight   = width >= 1024 ? 96 : 80;   // pt-24 or pt-20
    const hPadding    = width >= 1024 ? 96 : 64;   // p-6*2 or p-4*2
    const evalBarSpace = 24;                        // eval bar (20px) + gap (4px)
    const availW = width - sidebarWidth - hPadding - evalBarSpace;
    const availH = height - navHeight - 64;
    size = Math.min(availW, availH) / 1.4; // leave room so boardScale=1.4 (max) fits exactly
  }

  // Guard against transient negative/zero sizes during responsive resizes.
  // This prevents react-chessboard from crashing when it can't measure square width.
  if (!Number.isFinite(size)) return 300;
  return Math.max(MIN_BOARD_SIZE_PX, Math.min(MAX_BOARD_SIZE_PX, size));
};

export const useBoardSize = (): UseBoardSizeReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(calculateBoardSize);
  const [isMounted, setIsMounted] = useState(false); 

  // Determine board size based on window width and height
  useEffect(() => {
    const updateSize = () => {
      // Temporarily unmount board while layout stabilizes on resize.
      setIsMounted(false);
      setBoardSize(calculateBoardSize());
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Ensure container is mounted and has dimensions before rendering chessboard
  useEffect(() => {
    if (!containerRef.current) return;

    // Reset mount state whenever we recalc board size.
    setIsMounted(false);

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
