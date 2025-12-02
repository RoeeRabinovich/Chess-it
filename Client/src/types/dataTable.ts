import * as React from "react";

/**
 * Column definition for DataTable
 */
export interface DataTableColumn<T> {
  /** Column header text */
  header: string;

  /**
   * Accessor: key path or function to get cell value
   * Examples: "username" or (row) => row.user.name
   */
  accessor: keyof T | ((row: T) => unknown);

  /** Whether column is sortable */
  sortable?: boolean;

  /**
   * Custom render function for cell content
   * Receives: (value, row, column)
   */
  render?: (
    value: unknown,
    row: T,
    column: DataTableColumn<T>,
  ) => React.ReactNode;

  /** CSS classes for header cell */
  headerClassName?: string;

  /** CSS classes for data cells */
  cellClassName?: string;

  /** Column width (CSS value or number for pixels) */
  width?: string | number;

  /** Minimum column width */
  minWidth?: string | number;

  /** Whether column is visible (for responsive) */
  visible?: boolean | ((breakpoint: string) => boolean);
}

/**
 * Sorting state
 */
export interface SortState {
  column: string | null;
  direction: "asc" | "desc" | null;
}

/**
 * Selection state
 */
export interface SelectionState {
  selectedIds: string[];
  selectable?: boolean;
  selectAll?: boolean;
}

/**
 * Pagination props
 */
export interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSizeSelector?: boolean;
}

/**
 * Search configuration
 */
export interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * Sorting configuration
 */
export interface DataTableSortingProps {
  state: SortState;
  onSort: (column: string, direction: "asc" | "desc" | null) => void;
}

/**
 * Selection configuration
 */
export interface DataTableSelectionProps {
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  selectable?: boolean;
}

/**
 * Main DataTable component props
 */
export interface DataTableProps<T> {
  /** Array of data rows */
  data: T[];

  /** Column definitions */
  columns: DataTableColumn<T>[];

  /** Unique identifier key for each row (default: 'id' or '_id') */
  rowIdKey?: keyof T | ((row: T) => string);

  /** Loading state */
  loading?: boolean;

  /** Pagination configuration */
  pagination?: DataTablePaginationProps;

  /** Search configuration */
  search?: DataTableSearchProps;

  /** Sorting configuration */
  sorting?: DataTableSortingProps;

  /** Row selection configuration */
  selection?: DataTableSelectionProps;

  /** Empty state message */
  emptyMessage?: string;

  /** Custom empty state component */
  emptyComponent?: React.ReactNode;

  /** Custom loading component */
  loadingComponent?: React.ReactNode;

  /** Row click handler */
  onRowClick?: (row: T) => void;

  /** Row hover effect */
  hoverable?: boolean;

  /** Striped rows */
  striped?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Table container CSS classes */
  containerClassName?: string;

  /** Responsive: show cards on mobile instead of table */
  responsive?: boolean;

  /** Mobile card render function */
  renderMobileCard?: (row: T) => React.ReactNode;

  /** Children (for toolbar actions, etc.) */
  children?: React.ReactNode;
}

