import { EvaluationBar } from "../EvaluationBar/EvaluationBar";
import { EngineLines } from "../EngineLines/EngineLines";
import { convertUCIToSAN } from "../../utils/chessNotation";

interface EngineAnalysisProps {
  positionEvaluation: number;
  depth: number;
  bestLine: string;
  possibleMate: string;
  engineLines: Array<{
    moves: string[];
    evaluation: number;
    depth: number;
    possibleMate?: string | null;
  }>;
  isAnalyzing: boolean;
  currentFen: string;
  isFlipped?: boolean;
}

export const EngineAnalysis = ({
  positionEvaluation,
  depth,
  bestLine,
  possibleMate,
  engineLines,
  isAnalyzing,
  currentFen,
  isFlipped = false,
}: EngineAnalysisProps) => {
  // Convert engine lines to SAN notation
  const formattedLines = engineLines.map((line) => ({
    ...line,
    sanNotation: convertUCIToSAN(line.moves, currentFen),
  }));

  return (
    <div className="space-y-4">
      {/* Evaluation Bar */}
      {depth > 0 && (
        <div className="flex items-center gap-4">
          <EvaluationBar
            evaluation={positionEvaluation}
            possibleMate={possibleMate}
            isFlipped={isFlipped}
          />
          <div className="flex-1">
            <div className="mb-1 text-xs text-muted-foreground">
              Depth: {depth}
            </div>
            <div className="text-sm font-medium text-foreground">
              {possibleMate
                ? `Mate in ${possibleMate}`
                : `Evaluation: ${positionEvaluation > 0 ? "+" : ""}${positionEvaluation.toFixed(2)}`}
            </div>
          </div>
        </div>
      )}

      {/* Engine Lines */}
      {formattedLines.length > 0 && (
        <EngineLines
          lines={formattedLines.map((line) => ({
            moves: line.sanNotation.split(" "),
            sanNotation: line.sanNotation,
            evaluation: line.evaluation,
            depth: line.depth,
            mate: line.possibleMate ? parseInt(line.possibleMate) : undefined,
          }))}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
};
