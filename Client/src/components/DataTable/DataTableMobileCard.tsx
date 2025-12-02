import * as React from "react";
import { DataTableColumn } from "../../types";
import { cn } from "../../lib/utils";
import { getValueFromRow } from "./utils";

export interface DataTableMobileCardProps<T> {
  row: T;
  columns: DataTableColumn<T>[];
  rowId: string;
  onRowClick?: (row: T) => void;
  selection?: {
    selectedIds: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    selectable?: boolean;
  };
}

/**
 * DataTable Mobile Card Component
 * Renders a card view for mobile devices instead of table rows
 */
export function DataTableMobileCard<T extends Record<string, unknown>>({
  row,
  columns,
  rowId,
  onRowClick,
  selection,
}: DataTableMobileCardProps<T>) {
  const isSelectable = selection?.selectable ?? false;
  const selectedIds = selection?.selectedIds ?? [];
  const isSelected = selectedIds.includes(rowId);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!selection?.onSelectionChange) return;

    if (e.target.checked) {
      selection.onSelectionChange([...selectedIds, rowId]);
    } else {
      selection.onSelectionChange(selectedIds.filter((id) => id !== rowId));
    }
  };

  // Filter columns that should be visible on mobile
  const visibleColumns = columns.filter((col) => {
    if (col.visible === false) return false;
    if (typeof col.visible === "function") {
      return col.visible("mobile");
    }
    return true;
  });

  return (
    <div
      onClick={() => onRowClick?.(row)}
      className={cn(
        "border-border bg-card rounded-lg border p-4 shadow-sm transition-colors",
        onRowClick && "hover:bg-muted/50 cursor-pointer",
        isSelected && "bg-accent/20 ring-accent ring-2",
      )}
    >
      <div className="flex items-start gap-3">
        {isSelectable && (
          <div
            className="flex-shrink-0 pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className="border-border text-primary focus:ring-ring h-4 w-4 cursor-pointer rounded focus:ring-2 focus:ring-offset-2"
              aria-label="Select row"
            />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          {visibleColumns.map((column, index) => {
            const value = getValueFromRow(row, column.accessor);
            const cellContent = column.render
              ? column.render(value, row, column)
              : String(value ?? "");

            return (
              <div key={index} className="flex flex-col gap-1">
                <div className="text-muted-foreground text-xs font-semibold uppercase">
                  {column.header}
                </div>
                <div className={cn("text-sm", column.cellClassName)}>
                  {cellContent}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

DataTableMobileCard.displayName = "DataTableMobileCard";
