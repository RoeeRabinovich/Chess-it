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
              "border-border text-foreground hover:bg-accent font-minecraft w-full rounded-lg border px-3 py-1.5 text-left text-sm transition-colors",
              selectedFilter === filter && "bg-accent border-primary",
            )}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};
