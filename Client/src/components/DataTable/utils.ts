import { DataTableColumn } from "../../types";

/**
 * Get the value from a row using the accessor
 */
export function getValueFromRow<T>(
  row: T,
  accessor: keyof T | ((row: T) => unknown),
): unknown {
  if (typeof accessor === "function") {
    return accessor(row);
  }
  return row[accessor];
}

/**
 * Filter data based on search query
 * Searches across all columns
 */
export function filterData<T extends Record<string, unknown>>(
  data: T[],
  columns: DataTableColumn<T>[],
  searchQuery: string,
): T[] {
  if (!searchQuery.trim()) {
    return data;
  }

  const query = searchQuery.toLowerCase().trim();

  return data.filter((row) => {
    return columns.some((column) => {
      const value = getValueFromRow(row, column.accessor);
      
      // Convert value to string for searching
      const searchableValue = value != null 
        ? String(value).toLowerCase()
        : "";
      
      return searchableValue.includes(query);
    });
  });
}

/**
 * Sort data based on column and direction
 */
export function sortData<T extends Record<string, unknown>>(
  data: T[],
  column: DataTableColumn<T>,
  direction: "asc" | "desc",
  getColumnKey: (column: DataTableColumn<T>, index: number) => string,
  columnIndex: number,
): T[] {
  const sortedData = [...data];

  sortedData.sort((a, b) => {
    const aValue = getValueFromRow(a, column.accessor);
    const bValue = getValueFromRow(b, column.accessor);

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === "asc" ? -1 : 1;
    if (bValue == null) return direction === "asc" ? 1 : -1;

    // Compare values
    let comparison = 0;

    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else if (
      typeof aValue === "string" &&
      typeof bValue === "string" &&
      !isNaN(Date.parse(aValue)) &&
      !isNaN(Date.parse(bValue))
    ) {
      // Handle date strings
      comparison =
        new Date(aValue).getTime() - new Date(bValue).getTime();
    } else {
      // Fallback: convert to string and compare
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return direction === "asc" ? comparison : -comparison;
  });

  return sortedData;
}
