import * as React from "react";
import { DataTableProps } from "../../types";
import { cn } from "../../lib/utils";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableRow } from "./DataTableRow";
import { DataTableLoading } from "./DataTableLoading";
import { DataTableEmpty } from "./DataTableEmpty";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableMobileCard } from "./DataTableMobileCard";

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
  responsive = true,
  renderMobileCard,
  children,
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

  // Detect mobile screen size (using Tailwind's sm breakpoint: 640px)
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 640;
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className={cn("w-full", containerClassName)}>
        {search && (
          <DataTableToolbar search={search}>{children}</DataTableToolbar>
        )}
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
      {search && (
        <DataTableToolbar search={search}>{children}</DataTableToolbar>
      )}
      {data.length === 0 ? (
        <DataTableEmpty
          customComponent={emptyComponent}
          message={emptyMessage}
        />
      ) : responsive && isMobile ? (
        // Mobile card view
        <div className={cn("space-y-3", className)}>
          {renderMobileCard
            ? // Custom mobile card render function
              data.map((row) => {
                const rowId = getRowId(row);
                return <div key={rowId}>{renderMobileCard(row)}</div>;
              })
            : // Default mobile card component
              data.map((row) => {
                const rowId = getRowId(row);
                return (
                  <DataTableMobileCard
                    key={rowId}
                    row={row}
                    columns={columns}
                    rowId={rowId}
                    onRowClick={onRowClick}
                    selection={selection}
                  />
                );
              })}
          {pagination && (
            <div className="mt-4">
              <DataTablePagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                onPageChange={pagination.onPageChange}
                onPageSizeChange={pagination.onPageSizeChange}
                showPageSizeSelector={pagination.showPageSizeSelector}
              />
            </div>
          )}
        </div>
      ) : (
        // Desktop table view
        <div className={cn("bg-card rounded-lg border shadow-sm", className)}>
          <div className="-mx-1 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[640px] border-collapse">
              <DataTableHeader
                columns={columns}
                sortState={sorting?.state}
                onSort={sorting?.onSort}
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
