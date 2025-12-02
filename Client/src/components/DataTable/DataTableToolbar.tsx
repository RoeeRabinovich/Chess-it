import * as React from "react";
import { SearchInput } from "../ui/SearchInput";
import { DataTableSearchProps } from "../../types";
import { cn } from "../../lib/utils";

export interface DataTableToolbarProps {
  /** Search configuration */
  search?: DataTableSearchProps;
  /** Additional CSS classes */
  className?: string;
  /** Children (for bulk actions, filters, etc.) */
  children?: React.ReactNode;
}

/**
 * DataTable Toolbar Component
 * Displays search input and optional toolbar actions
 */
export function DataTableToolbar({
  search,
  className,
  children,
}: DataTableToolbarProps) {
  // If no search and no children, don't render toolbar
  if (!search && !children) {
    return null;
  }

  return (
    <div
      className={cn(
        "border-border bg-card mb-4 flex flex-col items-stretch gap-3 rounded-lg border px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-4">
        {search && (
          <div className="w-full flex-1 sm:max-w-sm">
            <SearchInput
              value={search.value}
              onChange={search.onChange}
              placeholder={search.placeholder || "Search..."}
              debounceMs={search.debounceMs ?? 0}
              showSearchIcon={true}
              showClearButton={true}
            />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

DataTableToolbar.displayName = "DataTableToolbar";
