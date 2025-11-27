import * as React from "react";
import * as Label from "@radix-ui/react-label";
import { cn } from "../../lib/utils";

export interface FormFieldProps {
  /**
   * Label text for the form field
   */
  label: string;
  /**
   * Error message to display below the field
   */
  error?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Hint text to display below the field (shown when there's no error)
   */
  hint?: string;
  /**
   * The form input element(s) to wrap
   */
  children: React.ReactNode;
  /**
   * HTML id for the field (auto-generated if not provided)
   */
  id?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * HTML id for the label (for accessibility)
   */
  labelId?: string;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    { label, error, required = false, hint, children, id, className, labelId },
    ref,
  ) => {
    const generatedId = React.useId();
    const fieldId = id || generatedId;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;
    const labelIdFinal = labelId || `${fieldId}-label`;

    // Clone children to pass id and aria attributes
    const childrenWithProps = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const existingProps = child.props as Record<string, unknown>;
        const existingAriaDescribedBy = existingProps["aria-describedby"] as
          | string
          | undefined;

        // Merge props: existing props first, then our additions (so existing props take precedence)
        return React.cloneElement(child, {
          ...existingProps,
          id: (existingProps.id as string) || fieldId, // Only set id if not already provided
          "aria-invalid": error ? "true" : "false",
          "aria-describedby": cn(
            existingAriaDescribedBy,
            error && errorId,
            hint && !error && hintId,
          ),
        } as React.HTMLAttributes<HTMLElement>);
      }
      return child;
    });

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        <Label.Root
          htmlFor={fieldId}
          id={labelIdFinal}
          className="text-foreground font-minecraft block text-sm font-medium"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label.Root>
        {childrenWithProps}
        {hint && !error && (
          <p
            id={hintId}
            className="text-muted-foreground font-minecraft text-xs"
          >
            {hint}
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

FormField.displayName = "FormField";
