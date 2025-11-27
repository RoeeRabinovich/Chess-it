import { ReactNode } from "react";
import { Badge, BadgeProps } from "./Badge";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ChipProps extends BadgeProps {
  /** Show remove button */
  removable?: boolean;
  /** Callback when remove button is clicked */
  onRemove?: () => void;
  /** Custom remove button icon */
  removeIcon?: ReactNode;
}

export const Chip = ({
  removable = false,
  onRemove,
  removeIcon,
  children,
  className,
  ...badgeProps
}: ChipProps) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <Badge
      className={cn(
        "bg-pastel-mint text-foreground dark:!text-[#1A1A1A] border-transparent gap-1.5 pr-1.5 px-3 py-1 text-sm",
        removable && "cursor-pointer",
        className
      )}
      {...badgeProps}
    >
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-0.5 rounded-sm hover:bg-background/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          aria-label="Remove"
        >
          {removeIcon || (
            <X className="h-3.5 w-3.5 text-current opacity-70 hover:opacity-100" />
          )}
        </button>
      )}
    </Badge>
  );
};

