import { EvaluationBar } from "../../../components/EvaluationBar/EvaluationBar";

interface MobileEvalBarProps {
  isEngineEnabled: boolean;
  evalBarWidth: number;
  boardScale: number;
  evaluation: number;
  possibleMate?: string | null;
  isFlipped: boolean;
}

export const MobileEvalBar = ({
  isEngineEnabled,
  evalBarWidth,
  boardScale,
  evaluation,
  possibleMate,
  isFlipped,
}: MobileEvalBarProps) => {
  if (!isEngineEnabled) {
    return null;
  }

  return (
    <div className="border-border bg-card w-full border-b px-2 py-1.5 sm:px-3 sm:py-2">
      <div
        className="mx-auto flex-shrink-0 transition-all duration-200"
        style={{
          width: `${evalBarWidth * boardScale}px`,
          maxWidth: `min(${280 * boardScale}px, calc(100vw - 32px))`,
          height: `${24 * boardScale}px`,
        }}
      >
        <EvaluationBar
          evaluation={evaluation}
          possibleMate={possibleMate}
          isFlipped={isFlipped}
          height={24 * boardScale}
          width={evalBarWidth * boardScale}
        />
      </div>
    </div>
  );
};

