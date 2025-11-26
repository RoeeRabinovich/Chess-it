import { Loading } from "../icons/Loading.icon";
import { cn } from "../../lib/utils";

export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default "medium"
   */
  size?: "small" | "medium" | "large";
  /**
   * Optional text to display below the spinner
   */
  text?: string;
  /**
   * Whether to display as a full-screen centered loader
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Text CSS classes
   */
  textClassName?: string;
}

const sizeClasses = {
  small: "h-4 w-4",
  medium: "h-8 w-8",
  large: "h-16 w-16",
};

export const LoadingSpinner = ({
  size = "medium",
  text,
  fullScreen = false,
  className,
  textClassName,
}: LoadingSpinnerProps) => {
  const spinner = (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Loading
        className={cn(
          "text-primary animate-spin",
          sizeClasses[size],
          className,
        )}
      />
      {text && (
        <p className={cn("text-muted-foreground text-sm", textClassName)}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="bg-background flex h-screen items-center justify-center pt-16 sm:pt-20 md:pt-24">
        {spinner}
      </div>
    );
  }

  return spinner;
};
