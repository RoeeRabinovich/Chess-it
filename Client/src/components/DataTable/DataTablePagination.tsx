import { Pagination } from "../ui/Pagination";
import { DataTablePaginationProps } from "../../types";
import { cn } from "../../lib/utils";

/**
 * DataTable Pagination Component
 * Wraps the Pagination component with page info display
 */
export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = false,
  className,
}: DataTablePaginationProps & { className?: string }) {
  // Calculate display range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        "border-border bg-card flex flex-col items-center justify-between gap-4 border-t px-4 py-3 sm:flex-row",
        className,
      )}
    >
      {/* Page info */}
      <div className="text-muted-foreground text-sm">
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
        <strong>{totalItems}</strong> {totalItems === 1 ? "result" : "results"}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-4">
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="page-size"
              className="text-muted-foreground text-sm"
            >
              Show:
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border-border bg-background text-foreground focus:ring-ring rounded-md border px-2 py-1 text-sm focus:ring-2 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

DataTablePagination.displayName = "DataTablePagination";
