import * as React from "react";
import { Input, InputProps } from "./Input";
import { X, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export interface SearchInputProps
  extends Omit<InputProps, "type" | "onChange" | "value"> {
  /**
   * Current search value (controlled mode)
   */
  value?: string;
  /**
   * Callback when search value changes
   */
  onChange?: (value: string) => void;
  /**
   * Callback when search is cleared
   */
  onClear?: () => void;
  /**
   * Placeholder text
   * @default "Search..."
   */
  placeholder?: string;
  /**
   * Whether to show a clear button when there's text
   * @default true
   */
  showClearButton?: boolean;
  /**
   * Whether to show a search icon
   * @default false
   */
  showSearchIcon?: boolean;
  /**
   * Debounce delay in milliseconds (0 = no debounce)
   * @default 0
   */
  debounceMs?: number;
  /**
   * Additional CSS classes for the container
   */
  containerClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value: controlledValue,
      onChange,
      onClear,
      placeholder = "Search...",
      showClearButton = true,
      showSearchIcon = false,
      debounceMs = 0,
      containerClassName,
      className,
      ...inputProps
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      controlledValue || "",
    );
    const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );
    const isControlled = controlledValue !== undefined;

    // Use controlled value if provided, otherwise use internal state
    const value = isControlled ? controlledValue : internalValue;
    const hasValue = value.length > 0;

    // Debounced onChange handler
    const handleChange = React.useCallback(
      (newValue: string) => {
        if (debounceMs > 0) {
          // Clear existing timer
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          // Set internal value immediately for responsive UI
          if (!isControlled) {
            setInternalValue(newValue);
          }

          // Debounce the onChange callback
          debounceTimerRef.current = setTimeout(() => {
            onChange?.(newValue);
          }, debounceMs);
        } else {
          // No debounce - update immediately
          if (!isControlled) {
            setInternalValue(newValue);
          }
          onChange?.(newValue);
        }
      },
      [onChange, debounceMs, isControlled],
    );

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      handleChange(newValue);
    };

    // Handle clear
    const handleClear = () => {
      if (!isControlled) {
        setInternalValue("");
      }
      handleChange("");
      onClear?.();
    };

    // Cleanup debounce timer on unmount
    React.useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    // Sync internal value with controlled value
    React.useEffect(() => {
      if (isControlled && controlledValue !== internalValue) {
        setInternalValue(controlledValue);
      }
    }, [controlledValue, isControlled, internalValue]);

    return (
      <div className={cn("relative", containerClassName)}>
        {showSearchIcon && (
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        )}
        <Input
          ref={ref}
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          className={cn(
            showSearchIcon && "pl-9",
            showClearButton && hasValue && "pr-9",
            // Hide native search input clear button
            "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
            className,
          )}
          {...inputProps}
        />
        {showClearButton && hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
