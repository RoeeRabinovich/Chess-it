import * as React from "react";
import { DataTableColumn, SortState } from "../../types";
import { cn } from "../../lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { getColumnKey } from "./utils";

export interface DataTableHeaderProps<T> {
  columns: DataTableColumn<T>[];
  sortState?: SortState;
  onSort?: (column: string, direction: "asc" | "desc" | null) => void;
  selection?: {
    selectedIds: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    selectable?: boolean;
  };
  allRowIds?: string[];
}

/**
 * DataTable Header Component
 * Renders the table header row with column headers and sorting
 */
export function DataTableHeader<T extends Record<string, unknown>>({
  columns,
  sortState,
  onSort,
  selection,
  allRowIds = [],
}: DataTableHeaderProps<T>) {
  // Selection logic
  const isSelectable = selection?.selectable ?? false;
  const selectedIds = selection?.selectedIds ?? [];
  const allSelected =
    isSelectable &&
    allRowIds.length > 0 &&
    allRowIds.every((id) => selectedIds.includes(id));
  const someSelected = isSelectable && selectedIds.length > 0 && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    if (!selection?.onSelectionChange) return;

    if (checked) {
      // Select all rows
      selection.onSelectionChange([...allRowIds]);
    } else {
      // Deselect all rows
      selection.onSelectionChange([]);
    }
  };
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

  // Filter columns based on visibility
  const visibleColumns = React.useMemo(() => {
    return columns.filter((col) => {
      if (col.visible === false) return false;
      if (typeof col.visible === "function") {
        // For now, show all columns in table view
        // Mobile card view will handle its own filtering
        return true;
      }
      return true;
    });
  }, [columns]);

  return (
    <thead>
      <tr>
        {isSelectable && (
          <th className="border-border bg-muted w-12 border-b-2 px-4 py-3">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="border-border text-primary focus:ring-ring h-4 w-4 cursor-pointer rounded focus:ring-2 focus:ring-offset-2"
              aria-label="Select all rows"
            />
          </th>
        )}
        {visibleColumns.map((column, index) => {
          const columnKey = getColumnKey(column, index);
          const isSorted = sortState?.column === columnKey;
          const sortDirection = isSorted ? sortState.direction : null;
          const isSortable = column.sortable && !!onSort;

          // Determine column visibility
          const visibilityClass =
            typeof column.visible === "function"
              ? "" // Function-based visibility handled by CSS or logic
              : column.visible === false
                ? "hidden"
                : "";

          return (
            <th
              key={index}
              className={cn(
                "border-border bg-muted border-b-2 px-4 py-3 text-left text-sm font-semibold",
                isSortable && "hover:bg-muted/80 cursor-pointer select-none",
                visibilityClass,
                // Hide less important columns on mobile
                typeof column.visible === "function" && "hidden sm:table-cell",
                column.headerClassName,
              )}
              style={{
                width: column.width,
                minWidth: column.minWidth,
              }}
              onClick={() => handleSort(column, index)}
              onKeyDown={(e) => {
                if (isSortable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleSort(column, index);
                }
              }}
              role={isSortable ? "button" : undefined}
              tabIndex={isSortable ? 0 : undefined}
              aria-sort={
                isSorted
                  ? sortDirection === "asc"
                    ? "ascending"
                    : sortDirection === "desc"
                      ? "descending"
                      : "none"
                  : undefined
              }
              aria-label={
                isSortable
                  ? `Sort by ${column.header}${isSorted ? ` (${sortDirection === "asc" ? "ascending" : "descending"})` : ""}`
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
