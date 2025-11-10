import { StudyFilters } from "../../../types/study";
import { cn } from "../../../lib/utils";

interface StudyFilterProps {
  selectedFilter: StudyFilters;
  onFilterChange: (filter: StudyFilters) => void;
}

const filters: StudyFilters[] = ["All", "New", "Popular"];

export const StudyFilter = ({
  selectedFilter,
  onFilterChange,
}: StudyFilterProps) => {
  return (
    <div className="space-y-2">
      <h2 className="text-foreground font-minecraft text-lg font-semibold">
        Filters
      </h2>
      <div className="space-y-1">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={cn(
              "border-border text-foreground hover:bg-accent font-minecraft w-full rounded-lg border-2 px-4 py-2 text-left shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]",
              selectedFilter === filter &&
                "bg-accent border-primary shadow-[3px_3px_0px_0px_hsl(var(--primary))]",
            )}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};
