import { DataTableColumn, SortState } from "../../types";
import { cn } from "../../lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface DataTableHeaderProps<T> {
  columns: DataTableColumn<T>[];
  sortState?: SortState;
  onSort?: (column: string, direction: "asc" | "desc" | null) => void;
  getColumnKey: (column: DataTableColumn<T>, index: number) => string;
}

/**
 * Helper function to get column identifier for sorting
 */
export function getColumnKey<T>(
  column: DataTableColumn<T>,
  index: number,
): string {
  // If accessor is a string key, use it directly
  if (typeof column.accessor === "string") {
    return column.accessor;
  }
  // Otherwise, use index as fallback
  return `column-${index}`;
}

/**
 * DataTable Header Component
 * Renders the table header row with column headers and sorting
 */
export function DataTableHeader<T extends Record<string, unknown>>({
  columns,
  sortState,
  onSort,
  getColumnKey,
}: DataTableHeaderProps<T>) {
  const handleSort = (column: DataTableColumn<T>, index: number) => {
    if (!column.sortable || !onSort) return;

    const columnKey = getColumnKey(column, index);
    const currentColumn = sortState?.column;
    const currentDirection = sortState?.direction;

    // Toggle sort: none -> asc -> desc -> none
    if (currentColumn === columnKey) {
      if (currentDirection === "asc") {
        onSort(columnKey, "desc");
      } else if (currentDirection === "desc") {
        onSort(columnKey, null);
      } else {
        onSort(columnKey, "asc");
      }
    } else {
      // New column, start with asc
      onSort(columnKey, "asc");
    }
  };

  return (
    <thead>
      <tr>
        {columns.map((column, index) => {
          const columnKey = getColumnKey(column, index);
          const isSorted = sortState?.column === columnKey;
          const sortDirection = isSorted ? sortState.direction : null;
          const isSortable = column.sortable && !!onSort;

          return (
            <th
              key={index}
              className={cn(
                "border-border bg-muted border-b-2 px-4 py-3 text-left text-sm font-semibold",
                isSortable && "hover:bg-muted/80 cursor-pointer select-none",
                column.headerClassName,
              )}
              style={{
                width: column.width,
                minWidth: column.minWidth,
              }}
              onClick={() => handleSort(column, index)}
              role={isSortable ? "button" : undefined}
              aria-sort={
                isSorted
                  ? sortDirection === "asc"
                    ? "ascending"
                    : sortDirection === "desc"
                      ? "descending"
                      : "none"
                  : undefined
              }
            >
              <div className="flex items-center gap-2">
                <span>{column.header}</span>
                {isSortable && (
                  <span className="flex flex-col">
                    <ChevronUp
                      className={cn(
                        "h-3 w-3 transition-opacity",
                        isSorted && sortDirection === "asc"
                          ? "text-primary opacity-100"
                          : "opacity-30",
                      )}
                      aria-hidden="true"
                    />
                    <ChevronDown
                      className={cn(
                        "-mt-1 h-3 w-3 transition-opacity",
                        isSorted && sortDirection === "desc"
                          ? "text-primary opacity-100"
                          : "opacity-30",
                      )}
                      aria-hidden="true"
                    />
                  </span>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

DataTableHeader.displayName = "DataTableHeader";
