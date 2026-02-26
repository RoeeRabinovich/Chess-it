import { EngineLines } from "../../../components/EngineLines/EngineLines";
import { SectionHeader } from "./SectionHeader";

interface EngineLinesSectionProps {
  isEngineEnabled: boolean;
  isAnalyzing: boolean;
  formattedEngineLines: Array<{
    sanNotation: string;
    evaluation: number;
    depth: number;
    possibleMate?: string | null;
  }>;
  engineLinesCount: number;
  movesCount: number;
}

export const EngineLinesSection = ({
  isEngineEnabled,
  isAnalyzing,
  formattedEngineLines,
  engineLinesCount,
  movesCount,
}: EngineLinesSectionProps) => {
  const indicatorColor = isEngineEnabled
    ? isAnalyzing
      ? "animate-pulse bg-yellow-500"
      : "bg-green-500"
    : "";

  return (
    <>
      <SectionHeader
        title="Engine Lines"
        indicatorColor={indicatorColor}
        showIndicator={isEngineEnabled}
      />
      <div className="mb-2 flex min-h-16 max-h-[18vh] flex-col overflow-y-auto sm:mb-3 sm:min-h-20 lg:mb-4 lg:min-h-28">
        {movesCount === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <span className="text-muted-foreground text-[10px] sm:text-xs">
              Make a move to see engine analysis
            </span>
          </div>
        ) : (
          <div className="w-[360px] max-w-full self-center">
            <EngineLines
              lines={formattedEngineLines.map((line) => ({
                moves: line.sanNotation.split(" "),
                evaluation: line.evaluation,
                depth: line.depth,
                mate: line.possibleMate
                  ? parseInt(line.possibleMate)
                  : undefined,
              }))}
              isAnalyzing={isAnalyzing}
              maxLines={engineLinesCount}
            />
          </div>
        )}
      </div>
      <hr className="border-border/30 my-1.5 sm:my-2 lg:my-4" />
    </>
  );
};

