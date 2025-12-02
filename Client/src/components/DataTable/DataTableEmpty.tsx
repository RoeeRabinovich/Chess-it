import * as React from "react";
import { EmptyState } from "../ui/EmptyState";
import { cn } from "../../lib/utils";

export interface DataTableEmptyProps {
  /** Custom empty component */
  customComponent?: React.ReactNode;
  /** Empty state message */
  message?: string;
  /** Empty state description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DataTable Empty Component
 * Displays empty state when no data is available
 */
export function DataTableEmpty({
  customComponent,
  message = "No data available",
  description,
  className,
}: DataTableEmptyProps) {
  if (customComponent) {
    return <>{customComponent}</>;
  }

  return (
    <div className={cn("w-full", className)}>
      <EmptyState
        variant="empty"
        title={message}
        description={description}
        size="md"
      />
    </div>
  );
}

DataTableEmpty.displayName = "DataTableEmpty";

