import * as React from "react";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export interface PaginationProps {
  /**
   * Current active page (1-indexed)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;
  /**
   * Maximum number of page buttons to show (excluding ellipsis)
   * @default 7
   */
  maxVisiblePages?: number;
  /**
   * Whether to show previous/next buttons
   * @default true
   */
  showPrevNext?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Size of the pagination buttons
   * @default "default"
   */
  size?: "sm" | "default" | "lg";
}

/**
 * Calculate which page numbers to display
 */
const getPageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number,
): (number | "ellipsis")[] => {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];
  const halfVisible = Math.floor(maxVisiblePages / 2);

  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, currentPage + halfVisible);

  // Adjust if we're near the start or end
  if (currentPage <= halfVisible) {
    endPage = Math.min(maxVisiblePages, totalPages);
  }
  if (currentPage > totalPages - halfVisible) {
    startPage = Math.max(1, totalPages - maxVisiblePages + 1);
  }

  // Add first page
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push("ellipsis");
    }
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push("ellipsis");
    }
    pages.push(totalPages);
  }

  return pages;
};

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      maxVisiblePages = 7,
      showPrevNext = true,
      className,
      size = "default",
    },
    ref,
  ) => {
    // Validate props
    if (totalPages < 1) {
      return null;
    }

    if (currentPage < 1 || currentPage > totalPages) {
      console.warn(
        `Pagination: currentPage (${currentPage}) is out of range [1, ${totalPages}]`,
      );
      return null;
    }

    const pageNumbers = getPageNumbers(
      currentPage,
      totalPages,
      maxVisiblePages,
    );

    const handlePageClick = (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    };

    const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "default";

    return (
      <nav
        ref={ref}
        className={cn("flex items-center justify-center gap-1", className)}
        aria-label="Pagination"
      >
        {showPrevNext && (
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className="font-minecraft"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        )}

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="text-muted-foreground px-2 py-1 text-sm"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <Button
                key={page}
                variant={isActive ? "default" : "outline"}
                size={buttonSize}
                onClick={() => handlePageClick(page)}
                className={cn(
                  "font-minecraft min-w-[2.5rem]",
                  isActive && "shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
                )}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {showPrevNext && (
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="font-minecraft"
            aria-label="Go to next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </nav>
    );
  },
);

Pagination.displayName = "Pagination";
