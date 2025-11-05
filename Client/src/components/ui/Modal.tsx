import { useEffect, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  children: ReactNode;
  closeLabel?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  preventBackdropClose?: boolean;
  closeButtonDisabled?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  titleId,
  children,
  closeLabel = "Close modal",
  maxWidth = "md",
  preventBackdropClose = false,
  closeButtonDisabled = false,
}: ModalProps) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={preventBackdropClose ? undefined : onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        className={`border-border bg-secondary fixed top-1/2 left-1/2 z-50 w-[90%] ${maxWidthClasses[maxWidth]} -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={closeLabel}
            disabled={closeButtonDisabled}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </>
  );
};

