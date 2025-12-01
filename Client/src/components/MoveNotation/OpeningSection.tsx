import { Badge } from "../ui/Badge";

interface OpeningSectionProps {
  opening?: { name: string; eco: string };
}

export const OpeningSection = ({ opening }: OpeningSectionProps) => {
  return (
    <div className="mb-2 sm:mb-3 lg:mb-4">
      <h3 className="text-foreground mb-1 text-xs font-semibold sm:mb-2 sm:text-sm lg:text-lg">
        Opening
      </h3>
      {opening ? (
        <div className="mb-2 flex flex-wrap gap-1">
          <Badge variant="info" size="sm">
            {opening.name}
          </Badge>
          <Badge variant="outline" size="sm">
            {opening.eco}
          </Badge>
        </div>
      ) : (
        <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">
          Custom Position
        </p>
      )}
    </div>
  );
};

