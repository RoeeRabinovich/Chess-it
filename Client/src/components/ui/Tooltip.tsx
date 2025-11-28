import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface TooltipProps {
  /** Tooltip content */
  content: ReactNode;
  /** Child element to attach tooltip to */
  children: ReactNode;
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Position relative to trigger */
  side?: "top" | "bottom" | "left" | "right";
  /** Disabled state */
  disabled?: boolean;
  /** Custom className for tooltip */
  className?: string;
  /** Custom className for trigger wrapper */
  triggerClassName?: string;
}

export const Tooltip = ({
  content,
  children,
  delay = 300,
  side = "top",
  disabled = false,
  className,
  triggerClassName,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const gap = 8; // Gap between trigger and tooltip

    let top = 0;
    let left = 0;

    switch (side) {
      case "top":
        top = triggerRect.top + scrollY - tooltipRect.height - gap;
        left =
          triggerRect.left +
          scrollX +
          triggerRect.width / 2 -
          tooltipRect.width / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + scrollY + gap;
        left =
          triggerRect.left +
          scrollX +
          triggerRect.width / 2 -
          tooltipRect.width / 2;
        break;
      case "left":
        top =
          triggerRect.top +
          scrollY +
          triggerRect.height / 2 -
          tooltipRect.height / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - gap;
        break;
      case "right":
        top =
          triggerRect.top +
          scrollY +
          triggerRect.height / 2 -
          tooltipRect.height / 2;
        left = triggerRect.right + scrollX + gap;
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < scrollX) {
      left = scrollX + 8;
    } else if (left + tooltipRect.width > scrollX + viewportWidth) {
      left = scrollX + viewportWidth - tooltipRect.width - 8;
    }

    if (top < scrollY) {
      top = scrollY + 8;
    } else if (top + tooltipRect.height > scrollY + viewportHeight) {
      top = scrollY + viewportHeight - tooltipRect.height - 8;
    }

    setPosition({ top, left });
  }, [side]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isVisible, side, updatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-background border-l-transparent border-r-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-background border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-background border-t-transparent border-b-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-background border-t-transparent border-b-transparent border-l-transparent",
  };

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={cn(triggerClassName || "inline-block")}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            "bg-background text-foreground border-border animate-in fade-in-0 zoom-in-95 pointer-events-none fixed z-50 max-w-xs rounded-md border px-3 py-1.5 text-sm shadow-md",
            className,
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            position: "fixed",
          }}
        >
          <div className="relative">
            {content}
            {/* Arrow */}
            <div
              className={cn("absolute h-0 w-0 border-4", arrowClasses[side])}
            />
          </div>
        </div>
      )}
    </>
  );
};
