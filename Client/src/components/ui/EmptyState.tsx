import { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Search } from "../icons/Search.icon";
import { Book } from "../icons/Book.icon";
import { Error as ErrorIcon } from "../icons/Error.icon";

interface EmptyStateProps {
  /** Icon or illustration to display */
  icon?: ReactNode;

  /** Main title/heading */
  title: string;

  /** Optional description text */
  description?: string ;

  /** Optional action button */
  action?: ReactNode;

  /** Optional secondary action (e.g., "Learn more" link) */
  secondaryAction?: ReactNode;

  /** Custom className for the container */
  className?: string;

  /** Size variant */
  size?: "sm" | "md" | "lg";

  /** Variant for different contexts */
  variant?: "default" | "search" | "empty" | "error";
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
  variant = "default",
}: EmptyStateProps) => {
  const sizeClasses = {
    sm: "py-8",
    md: "py-12",
    lg: "py-16",
  };

  const variantIcons = {
    default: null,
    search: <Search className="text-muted-foreground h-6 w-6" />,
    empty: <Book className="text-muted-foreground h-6 w-6" />,
    error: <ErrorIcon className="text-destructive h-6 w-6" />,
  };

  const displayIcon = icon || variantIcons[variant];

  return (
    <div
      className={cn(
        "flex min-h-[400px] items-center justify-center",
        sizeClasses[size],
        className,
      )}
    >
      <div className="mx-auto max-w-md px-4 text-center">
        {displayIcon && (
          <div className="mb-4 flex justify-center">{displayIcon}</div>
        )}

        <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>

        {description && (
          <p className="text-muted-foreground mb-6 text-sm">{description}</p>
        )}

        {action && (
          <div className="flex justify-center gap-3">
            {action}
            {secondaryAction && secondaryAction}
          </div>
        )}

        {!action && secondaryAction && (
          <div className="flex justify-center">{secondaryAction}</div>
        )}
      </div>
    </div>
  );
};
