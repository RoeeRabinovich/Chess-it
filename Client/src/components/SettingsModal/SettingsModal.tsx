import { useState, useEffect } from "react";
import { Button } from "../ui/Button";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadFEN: () => void;
  onLoadPGN: () => void;
  isEngineEnabled: boolean;
  onEngineToggle: (enabled: boolean) => void;
  engineLinesCount: number;
  onEngineLinesCountChange: (count: number) => void;
  engineDepth: number;
  onEngineDepthChange: (depth: number) => void;
  boardScale: number;
  onBoardScaleChange: (scale: number) => void;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  onLoadFEN,
  onLoadPGN,
  isEngineEnabled,
  onEngineToggle,
  engineLinesCount,
  onEngineLinesCountChange,
  engineDepth,
  onEngineDepthChange,
  boardScale,
  onBoardScaleChange,
}: SettingsModalProps) => {
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="settings-modal-title"
            className="text-lg font-semibold"
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
            aria-label="Close settings"
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

        <div className="space-y-6">
          {/* Import/Export Section */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium uppercase tracking-wide">
              Import / Export
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadFEN}
                className="flex-1"
              >
                Load FEN
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadPGN}
                className="flex-1"
              >
                Load PGN
              </Button>
            </div>
          </div>

          {/* Engine Settings Section */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium uppercase tracking-wide">
              Engine Settings
            </h3>
            <div className="space-y-4">
              {/* Engine Toggle */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="engine-toggle"
                  className="text-sm font-medium"
                >
                  Enable Engine
                </label>
                <button
                  id="engine-toggle"
                  onClick={() => onEngineToggle(!isEngineEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isEngineEnabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  role="switch"
                  aria-checked={isEngineEnabled}
                  aria-label="Toggle engine"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEngineEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Engine Lines Count */}
              <div>
                <label
                  htmlFor="engine-lines"
                  className="text-muted-foreground mb-2 block text-sm font-medium"
                >
                  Number of Engine Lines: {engineLinesCount}
                </label>
                <select
                  id="engine-lines"
                  value={engineLinesCount}
                  onChange={(e) =>
                    onEngineLinesCountChange(parseInt(e.target.value))
                  }
                  disabled={!isEngineEnabled}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              {/* Engine Depth */}
              <div>
                <label
                  htmlFor="engine-depth"
                  className="text-muted-foreground mb-2 block text-sm font-medium"
                >
                  Engine Depth: {engineDepth}
                </label>
                <input
                  id="engine-depth"
                  type="range"
                  min="8"
                  max="20"
                  step="1"
                  value={engineDepth}
                  onChange={(e) =>
                    onEngineDepthChange(parseInt(e.target.value))
                  }
                  disabled={!isEngineEnabled}
                  className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                  <span>8</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            {/* Board Size Control - Hidden on mobile */}
            <div className="hidden lg:block">
              <label
                htmlFor="board-scale"
                className="text-muted-foreground mb-2 block text-sm font-medium"
              >
                Board Size: {Math.round(boardScale * 100)}%
              </label>
              <input
                id="board-scale"
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={boardScale}
                onChange={(e) =>
                  onBoardScaleChange(parseFloat(e.target.value))
                }
                className="w-full cursor-pointer"
              />
              <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                <span>50%</span>
                <span>150%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

