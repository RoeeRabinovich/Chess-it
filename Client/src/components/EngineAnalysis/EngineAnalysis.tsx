interface EngineAnalysisProps {
  positionEvaluation: number;
  depth: number;
  bestLine: string;
  possibleMate: string;
}

export const EngineAnalysis = ({
  positionEvaluation,
  depth,
  bestLine,
  possibleMate,
}: EngineAnalysisProps) => {
  return (
    <div className="bg-muted min-h-[200px] rounded-xl p-6">
      {depth > 0 ? (
        <div className="h-full space-y-3">
          <div className="min-h-[32px]">
            <p className="text-muted-foreground mb-1 text-sm">
              Position Evaluation:
            </p>
            <p
              className={`text-2xl font-bold ${
                positionEvaluation > 0
                  ? "text-green-600"
                  : positionEvaluation < 0
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              {possibleMate
                ? `#${possibleMate}`
                : positionEvaluation.toFixed(2)}
            </p>
          </div>
          <div className="min-h-[32px]">
            <p className="text-muted-foreground mb-1 text-sm">Depth:</p>
            <p className="text-foreground text-lg font-semibold">{depth}</p>
          </div>
          {bestLine && (
            <div className="min-h-[48px]">
              <p className="text-muted-foreground mb-1 text-sm">Best Line:</p>
              <p className="text-foreground text-sm italic">
                {bestLine.slice(0, 50)}
                {bestLine.length > 50 ? "..." : ""}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <div className="mb-2 animate-pulse text-4xl">🤖</div>
            <p className="text-muted-foreground text-sm">Analyzing...</p>
          </div>
        </div>
      )}
    </div>
  );
};
