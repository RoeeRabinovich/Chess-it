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
              "border-border text-foreground hover:bg-accent w-full rounded-lg border-2 px-4 py-2 text-left font-minecraft shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]",
              selectedAspect === aspect &&
                "bg-accent border-primary shadow-[3px_3px_0px_0px_hsl(var(--primary))]",
            )}
          >
            {aspect}
          </button>
        ))}
      </div>
    </div>
  );
};

