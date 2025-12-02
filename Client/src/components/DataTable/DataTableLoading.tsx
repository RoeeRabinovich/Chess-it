import * as React from "react";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { cn } from "../../lib/utils";

export interface DataTableLoadingProps {
  /** Custom loading component */
  customComponent?: React.ReactNode;
  /** Loading message */
  message?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DataTable Loading Component
 * Displays loading state for the table
 */
export function DataTableLoading({
  customComponent,
  message = "Loading data...",
  className,
}: DataTableLoadingProps) {
  if (customComponent) {
    return <>{customComponent}</>;
  }

  return (
    <div
      className={cn(
        "flex min-h-[200px] items-center justify-center p-8",
        className,
      )}
    >
      <LoadingSpinner size="medium" text={message} />
    </div>
  );
}

DataTableLoading.displayName = "DataTableLoading";

