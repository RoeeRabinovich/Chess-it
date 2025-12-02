import { DataTableColumn } from "../../types";
import { cn } from "../../lib/utils";

export interface DataTableCellProps<T> {
  value: unknown;
  row: T;
  column: DataTableColumn<T>;
}

/**
 * DataTable Cell Component
 * Renders a single table cell with custom rendering support
 */
export function DataTableCell<T extends Record<string, unknown>>({
  value,
  row,
  column,
}: DataTableCellProps<T>) {
  const cellContent = column.render
    ? column.render(value, row, column)
    : String(value ?? "");

  return (
    <td
      className={cn("text-foreground px-4 py-3 text-sm", column.cellClassName)}
    >
      {cellContent}
    </td>
  );
}

DataTableCell.displayName = "DataTableCell";
