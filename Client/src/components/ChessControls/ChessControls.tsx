import { useState } from "react";
import { Button } from "../ui/Button";
import { Settings } from "../icons/Settings.icon";
import { Flip } from "../icons/Flip.icon";
import { Undo } from "../icons/Undo.icon";
import { Redo } from "../icons/Redo.icon";
import { LeftArrow } from "../icons/LeftArrow.icon";
import { RightArrow } from "../icons/RightArrow.icon";
import { SettingsModal } from "../SettingsModal/SettingsModal";

interface ChessControlsProps {
  onFlipBoard: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onLoadFEN: () => void;
  onLoadPGN: () => void;
  canUndo: boolean;
  canRedo: boolean;
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
  // Board scale props
  boardScale: number;
  onBoardScaleChange: (scale: number) => void;
}

export const ChessControls = ({
  onFlipBoard,
  onUndo,
  onRedo,
  onLoadFEN,
  onLoadPGN,
  canUndo,
  canRedo,
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
  boardScale,
  onBoardScaleChange,
}: ChessControlsProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Top Row: Navigation Arrows (4x bigger, full width) */}
        <div className="flex w-full items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMove}
            disabled={!canGoToPreviousMove}
            aria-label="Previous move"
            className="h-12 w-full flex-1 bg-secondary sm:h-14"
          >
            <LeftArrow className="h-8 w-8 sm:h-10 sm:w-10" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMove}
            disabled={!canGoToNextMove}
            aria-label="Next move"
            className="h-12 w-full flex-1 bg-secondary sm:h-14"
          >
            <RightArrow className="h-8 w-8 sm:h-10 sm:w-10" />
          </Button>
        </div>

        {/* Bottom Row: Undo, Redo on left, Settings on right */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo move"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Redo className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
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
        boardScale={boardScale}
        onBoardScaleChange={onBoardScaleChange}
      />
    </>
  );
};
