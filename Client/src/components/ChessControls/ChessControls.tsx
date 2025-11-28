import { useState } from "react";
import { Button } from "../ui/Button";
import { Tooltip } from "../ui/Tooltip";
import { Settings } from "../icons/Settings.icon";
import { Book } from "../icons/Book.icon";
import { Undo } from "../icons/Undo.icon";
import { Redo as ResetIcon } from "../icons/Redo.icon";
import { Flip } from "../icons/Flip.icon";
import { LeftArrow } from "../icons/LeftArrow.icon";
import { RightArrow } from "../icons/RightArrow.icon";
import { SettingsModal } from "../../pages/CreateStudy/components/SettingsModal";

interface ChessControlsProps {
  onFlipBoard: () => void;
  onUndo: () => void;
  onReset: () => void;
  onLoadFEN: () => void;
  onLoadPGN: () => void;
  canUndo: boolean;
  canGoToPreviousMove: boolean;
  canGoToNextMove: boolean;
  onPreviousMove: () => void;
  onNextMove: () => void;
  // Settings modal props
  isEngineEnabled: boolean;
  onEngineToggle: (enabled: boolean) => void;
  engineLinesCount: number;
  onEngineLinesCountChange: (count: number) => void;
  engineDepth: number;
  onEngineDepthChange: (depth: number) => void;
  analysisMode: "quick" | "deep";
  onAnalysisModeChange: (mode: "quick" | "deep") => void;
  // Board scale props
  boardScale: number;
  onBoardScaleChange: (scale: number) => void;
  // Create Study
  onCreateStudy?: () => void;
}

export const ChessControls = ({
  onFlipBoard,
  onUndo,
  onReset,
  onLoadFEN,
  onLoadPGN,
  canUndo,
  canGoToPreviousMove,
  canGoToNextMove,
  onPreviousMove,
  onNextMove,
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
  onCreateStudy,
}: ChessControlsProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Top Row: Navigation Arrows (4x bigger, full width) */}
        <div className="flex w-full items-center justify-center gap-2">
          <Tooltip
            content="Previous move"
            side="top"
            triggerClassName="flex-1 w-full"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreviousMove}
              disabled={!canGoToPreviousMove}
              aria-label="Previous move"
              className="bg-secondary h-12 w-full sm:h-14"
            >
              <LeftArrow className="h-8 w-8 sm:h-10 sm:w-10" />
            </Button>
          </Tooltip>
          <Tooltip
            content="Next move"
            side="top"
            triggerClassName="flex-1 w-full"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextMove}
              disabled={!canGoToNextMove}
              aria-label="Next move"
              className="bg-secondary h-12 w-full sm:h-14"
            >
              <RightArrow className="h-8 w-8 sm:h-10 sm:w-10" />
            </Button>
          </Tooltip>
        </div>

        {/* Bottom Row: Undo, Reset on left, Create Study in middle, Settings on right */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Tooltip content="Undo last move" side="top">
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Undo move"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <Undo className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Tooltip>
            {/* Hide reset button in CreateStudy page */}
            {!onCreateStudy && (
              <Tooltip content="Reset to starting position" side="top">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onReset}
                  aria-label="Reset study"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <ResetIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Tooltip>
            )}
            <Tooltip content="Flip board" side="top">
              <Button
                variant="ghost"
                size="icon"
                onClick={onFlipBoard}
                aria-label="Flip board"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <Flip className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            {onCreateStudy && (
              <Tooltip content="Save as study" side="top">
                <Button
                  variant="ghost"
                  onClick={onCreateStudy}
                  aria-label="Create Study"
                  className="bg-secondary h-8 gap-1.5 px-2 sm:h-9 sm:px-3"
                >
                  <Book className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden text-xs sm:inline sm:text-sm">
                    Create Study
                  </span>
                </Button>
              </Tooltip>
            )}
            <Tooltip content="Open settings" side="top">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Open settings"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLoadFEN={onLoadFEN}
        onLoadPGN={onLoadPGN}
        isEngineEnabled={isEngineEnabled}
        onEngineToggle={onEngineToggle}
        engineLinesCount={engineLinesCount}
        onEngineLinesCountChange={onEngineLinesCountChange}
        engineDepth={engineDepth}
        onEngineDepthChange={onEngineDepthChange}
        analysisMode={analysisMode}
        onAnalysisModeChange={onAnalysisModeChange}
        boardScale={boardScale}
        onBoardScaleChange={onBoardScaleChange}
      />
    </>
  );
};
