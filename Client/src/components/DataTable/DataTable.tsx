import * as React from "react";
import { DataTableProps } from "../../types";
import { cn } from "../../lib/utils";
import { DataTableHeader, getColumnKey } from "./DataTableHeader";
import { DataTableRow } from "./DataTableRow";
import { DataTableLoading } from "./DataTableLoading";
import { DataTableEmpty } from "./DataTableEmpty";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";

/**
 * DataTable Component
 *
 * A flexible, reusable data table component with support for:
 * - Sorting
 * - Search/Filtering
 * - Pagination
 * - Row selection
 * - Custom cell rendering
 * - Responsive design
 */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowIdKey,
  loading = false,
  pagination,
  search,
  sorting,
  selection,
  emptyMessage = "No data available",
  emptyComponent,
  loadingComponent,
  onRowClick,
  hoverable = true,
  striped = false,
  className,
  containerClassName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  responsive: _responsive,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderMobileCard: _renderMobileCard,
}: DataTableProps<T>) {
  // Get row ID helper function
  const getRowId = React.useCallback(
    (row: T): string => {
      if (rowIdKey) {
        if (typeof rowIdKey === "function") {
          return rowIdKey(row);
        }
        return String(row[rowIdKey]);
      }
      // Default: try 'id' or '_id'
      return String(row.id || row._id || "");
    },
    [rowIdKey],
  );

  // Get cell value helper function
  const getCellValue = React.useCallback(
    (row: T, accessor: keyof T | ((row: T) => unknown)): unknown => {
      if (typeof accessor === "function") {
        return accessor(row);
      }
      return row[accessor];
    },
    [],
  );

  // Render loading state
  if (loading) {
    return (
      <div className={cn("w-full", containerClassName)}>
        {search && <DataTableToolbar search={search} />}
        <DataTableLoading
          customComponent={loadingComponent}
          message="Loading data..."
        />
      </div>
    );
  }

  // Basic table structure (will be enhanced in next steps)
  return (
    <div className={cn("w-full", containerClassName)}>
      {search && <DataTableToolbar search={search} />}
      {data.length === 0 ? (
        <DataTableEmpty
          customComponent={emptyComponent}
          message={emptyMessage}
        />
      ) : (
        <div className={cn("bg-card rounded-lg border shadow-sm", className)}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <DataTableHeader
                columns={columns}
                sortState={sorting?.state}
                onSort={sorting?.onSort}
                getColumnKey={getColumnKey}
                selection={selection}
                allRowIds={data.map((row) => getRowId(row))}
              />
              <tbody>
                {data.map((row, rowIndex) => {
                  const rowId = getRowId(row);
                  return (
                    <DataTableRow
                      key={rowId}
                      row={row}
                      rowIndex={rowIndex}
                      columns={columns}
                      getCellValue={getCellValue}
                      onRowClick={onRowClick}
                      hoverable={hoverable}
                      striped={striped}
                      selection={selection}
                      rowId={rowId}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          {pagination && (
            <DataTablePagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              onPageChange={pagination.onPageChange}
              onPageSizeChange={pagination.onPageSizeChange}
              showPageSizeSelector={pagination.showPageSizeSelector}
            />
          )}
        </div>
      )}
    </div>
  );
}

DataTable.displayName = "DataTable";
