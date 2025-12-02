import * as React from "react";
import { DataTableColumn } from "../../types";
import { cn } from "../../lib/utils";
import { DataTableCell } from "./DataTableCell";

export interface DataTableRowProps<T> {
  row: T;
  rowIndex: number;
  columns: DataTableColumn<T>[];
  getCellValue: (row: T, accessor: keyof T | ((row: T) => unknown)) => unknown;
  onRowClick?: (row: T) => void;
  hoverable?: boolean;
  striped?: boolean;
  selection?: {
    selectedIds: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    selectable?: boolean;
  };
  rowId: string;
}

/**
 * DataTable Row Component
 * Renders a single table row with cells
 */
export function DataTableRow<T extends Record<string, unknown>>({
  row,
  rowIndex,
  columns,
  getCellValue,
  onRowClick,
  hoverable = true,
  striped = false,
  selection,
  rowId,
}: DataTableRowProps<T>) {
  const isSelectable = selection?.selectable ?? false;
  const selectedIds = selection?.selectedIds ?? [];
  const isSelected = selectedIds.includes(rowId);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent row click
    if (!selection?.onSelectionChange) return;

    if (e.target.checked) {
      // Add to selection
      selection.onSelectionChange([...selectedIds, rowId]);
    } else {
      // Remove from selection
      selection.onSelectionChange(selectedIds.filter(id => id !== rowId));
    }
  };

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't trigger row click if clicking on checkbox or action buttons
    const target = e.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest('button') ||
      target.closest('[role="menuitem"]')
    ) {
      return;
    }
    onRowClick?.(row);
  };

  return (
    <tr
      onClick={handleRowClick}
      className={cn(
        "border-border border-b transition-colors",
        hoverable && "hover:bg-muted/50 cursor-pointer",
        striped && rowIndex % 2 === 0 && "bg-muted/30",
        onRowClick && "cursor-pointer",
        isSelected && "bg-accent/20",
      )}
    >
      {isSelectable && (
        <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="h-4 w-4 cursor-pointer rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={`Select row ${rowIndex + 1}`}
          />
        </td>
      )}
      {columns.map((column, colIndex) => {
        const value = getCellValue(row, column.accessor);
        return (
          <DataTableCell
            key={colIndex}
            value={value}
            row={row}
            column={column}
          />
        );
      })}
    </tr>
  );
}

DataTableRow.displayName = "DataTableRow";
