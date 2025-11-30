import * as React from "react";
import { cn } from "../../lib/utils";
import * as Label from "@radix-ui/react-label";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, label, error, description, required, id, ...props },
    ref,
  ) => {
    const generatedId = React.useId();
    // Always use provided id if available, otherwise generate one
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;

    return (
      <div className="space-y-2">
        {label && (
          <Label.Root
            htmlFor={inputId}
            className="text-foreground block text-sm font-medium"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label.Root>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              // Base pixelated styling
              "border-input bg-background font-minecraft flex h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Pixelated border effect
              "shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
              "hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]",
              "focus-visible:shadow-[3px_3px_0px_0px_hsl(var(--ring))]",
              // Error state
              error &&
                "border-destructive shadow-[2px_2px_0px_0px_hsl(var(--destructive))]",
              error &&
                "focus-visible:shadow-[3px_3px_0px_0px_hsl(var(--destructive))]",
              // Transition
              "transition-all duration-200 ease-in-out",
              className,
            )}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={cn(
              error && errorId,
              description && descriptionId,
            )}
            {...props}
            // id from props takes precedence (set after spread so FormField's id is used)
            id={inputId}
          />
        </div>
        {description && !error && (
          <p
            id={descriptionId}
            className="text-muted-foreground font-minecraft text-xs"
          >
            {description}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            className="text-destructive font-minecraft flex items-center gap-1 text-xs"
            role="alert"
            aria-live="polite"
          >
            <span className="text-destructive">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
