import { GameAspect } from "../../../types/study";
import { cn } from "../../../lib/utils";

interface GameAspectFilterProps {
  selectedAspect: GameAspect;
  onAspectChange: (aspect: GameAspect) => void;
}

const aspects: GameAspect[] = ["All", "Opening", "Endgame", "Strategy", "Tactics"];

export const GameAspectFilter = ({
  selectedAspect,
  onAspectChange,
}: GameAspectFilterProps) => {
  return (
    <div className="space-y-2">
      <h2 className="text-foreground font-minecraft text-lg font-semibold">
        Game Aspect
      </h2>
      <div className="space-y-1">
        {aspects.map((aspect) => (
          <button
            key={aspect}
            onClick={() => onAspectChange(aspect)}
            className={cn(
              "border-border text-foreground hover:bg-accent w-full rounded-lg border px-3 py-1.5 text-left font-minecraft text-sm transition-colors",
              selectedAspect === aspect &&
                "bg-accent border-primary",
            )}
          >
            {aspect}
          </button>
        ))}
      </div>
    </div>
  );
};

