import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      titleId="settings-modal-title"
      closeLabel="Close settings"
    >
      <div className="space-y-6">
          {/* Import/Export Section */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium tracking-wide uppercase">
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
            <h3 className="text-muted-foreground mb-3 text-sm font-medium tracking-wide uppercase">
              Engine Settings
            </h3>
            <div className="space-y-4">
              {/* Engine Toggle */}
              <div className="flex items-center justify-between">
                <label htmlFor="engine-toggle" className="text-sm font-medium">
                  Enable Engine
                </label>
                <button
                  id="engine-toggle"
                  onClick={() => onEngineToggle(!isEngineEnabled)}
                  className={`focus:ring-primary relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                    isEngineEnabled ? "bg-pastel-mint" : "bg-pastel-red"
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
                  className="border-border bg-background focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                max="1.4"
                step="0.01"
                value={boardScale}
                onChange={(e) => onBoardScaleChange(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                <span>50%</span>
                <span>140%</span>
              </div>
            </div>
          </div>
        </div>
    </Modal>
  );
};

