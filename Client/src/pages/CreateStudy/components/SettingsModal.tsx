import { Modal } from "../../../components/ui/Modal";
import { ImportExportSection } from "./ImportExportSection";
import { EngineSettingsSection } from "./EngineSettingsSection";

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
  analysisMode: "quick" | "deep";
  onAnalysisModeChange: (mode: "quick" | "deep") => void;
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
  analysisMode,
  onAnalysisModeChange,
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
        <ImportExportSection onLoadFEN={onLoadFEN} onLoadPGN={onLoadPGN} />
        <EngineSettingsSection
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
      </div>
    </Modal>
  );
};
