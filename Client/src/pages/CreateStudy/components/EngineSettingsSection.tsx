import { ToggleSwitch } from "./ToggleSwitch";
import { RangeSlider } from "./RangeSlider";

interface EngineSettingsSectionProps {
  isEngineEnabled: boolean;
  onEngineToggle: (enabled: boolean) => void;
  engineLinesCount: number;
  onEngineLinesCountChange: (count: number) => void;
  engineDepth: number;
  onEngineDepthChange: (depth: number) => void;
  analysisMode: "quick" | "deep";
  onAnalysisModeChange: (mode: "quick" | "deep") => void;
  boardScale: number;
  onBoardScaleChange: (scale: number) => void;
}

export const EngineSettingsSection = ({
  isEngineEnabled,
  onEngineToggle,
  engineLinesCount,
  onEngineLinesCountChange,
  engineDepth,
  onEngineDepthChange,
  analysisMode,
  onAnalysisModeChange,
  boardScale,
  onBoardScaleChange,
}: EngineSettingsSectionProps) => {
  return (
    <div>
      <h3 className="text-muted-foreground mb-3 text-sm font-medium tracking-wide uppercase">
        Engine Settings
      </h3>
      <div className="space-y-4">
        <ToggleSwitch
          id="engine-toggle"
          label="Enable Engine"
          checked={isEngineEnabled}
          onChange={onEngineToggle}
          ariaLabel="Toggle engine"
        />

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
            onChange={(e) => onEngineLinesCountChange(parseInt(e.target.value))}
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

        <div>
          <label
            htmlFor="analysis-mode"
            className="text-muted-foreground mb-2 block text-sm font-medium"
          >
            Analysis Mode
          </label>
          <select
            id="analysis-mode"
            value={analysisMode}
            onChange={(e) =>
              onAnalysisModeChange(e.target.value as "quick" | "deep")
            }
            disabled={!isEngineEnabled}
            className="border-border bg-background focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="quick">Quick (Depth-based)</option>
            <option value="deep">Deep (Time-based, ~8s)</option>
          </select>
          <p className="text-muted-foreground mt-1 text-xs">
            {analysisMode === "quick"
              ? "Fast analysis to fixed depth"
              : "Deeper analysis for better accuracy"}
          </p>
        </div>

        {analysisMode === "quick" && (
          <RangeSlider
            id="engine-depth"
            label="Engine Depth"
            value={engineDepth}
            min={8}
            max={20}
            step={1}
            onChange={onEngineDepthChange}
            disabled={!isEngineEnabled}
            minLabel="8"
            maxLabel="20"
          />
        )}
      </div>

      <div className="hidden lg:block">
        <RangeSlider
          id="board-scale"
          label="Board Size"
          value={boardScale}
          min={0.5}
          max={1.4}
          step={0.01}
          onChange={onBoardScaleChange}
          minLabel="50%"
          maxLabel="140%"
          formatValue={(value) => `${Math.round(value * 100)}%`}
        />
      </div>
    </div>
  );
};

