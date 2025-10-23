import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../../lib/utils";

interface PasswordRequirement {
  text: string;
  isValid: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const PasswordRequirements = ({
  password,
  confirmPassword,
  open,
  onOpenChange,
  children,
}: PasswordRequirementsProps) => {
  const requirements: PasswordRequirement[] = [
    {
      text: "At least 8 characters",
      isValid: password.length >= 8,
    },
    {
      text: "Contains uppercase letter",
      isValid: /[A-Z]/.test(password),
    },
    {
      text: "Contains lowercase letter",
      isValid: /[a-z]/.test(password),
    },
    {
      text: "Contains number",
      isValid: /\d/.test(password),
    },
    {
      text: "Contains special character",
      isValid: /[!@#$%^&*()_+<>?]/.test(password),
    },
    {
      text: "Passwords match",
      isValid: confirmPassword ? password === confirmPassword : true,
    },
  ];

  const allValid = requirements.every((req) => req.isValid);

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cn(
            "bg-popover text-popover-foreground z-50 w-64 rounded-none border-2 border-solid p-4 shadow-md",
            "shadow-[4px_4px_0px_0px_hsl(var(--foreground))]",
            "data-[state=open]:animate-scale-in",
            "data-[state=closed]:animate-fade-out",
          )}
          side="left"
          sideOffset={5}
        >
          <div className="space-y-2">
            <h4 className="font-minecraft text-foreground text-sm font-medium">
              Password Requirements
            </h4>
            <div className="space-y-1">
              {requirements.map((requirement, index) => (
                <div
                  key={index}
                  className={cn(
                    "font-minecraft flex items-center gap-2 text-xs transition-colors",
                    requirement.isValid ? "text-green-600" : "text-destructive",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-none border-2 border-solid text-xs font-bold",
                      requirement.isValid
                        ? "border-green-600 bg-green-100 text-green-600"
                        : "bg-destructive/10 border-destructive text-destructive",
                    )}
                  >
                    {requirement.isValid ? "✓" : "✗"}
                  </span>
                  {requirement.text}
                </div>
              ))}
            </div>
            {allValid && (
              <div className="mt-3 rounded-none border-2 border-solid border-green-600 bg-green-100 p-2">
                <p className="font-minecraft text-xs font-medium text-green-800">
                  🎉 Password meets all requirements!
                </p>
              </div>
            )}
          </div>
          <Popover.Arrow className="fill-popover" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { PasswordRequirements };
