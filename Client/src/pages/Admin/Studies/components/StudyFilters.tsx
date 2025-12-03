interface StudyFiltersProps {
  categoryFilter: string;
  visibilityFilter: string;
  dateFilter: string;
  dateSort: "asc" | "desc";
  onCategoryChange: (value: string) => void;
  onVisibilityChange: (value: string) => void;
  onDateFilterChange: (value: string) => void;
  onDateSortChange: (value: "asc" | "desc") => void;
}

export const StudyFilters = ({
  categoryFilter,
  visibilityFilter,
  dateFilter,
  dateSort,
  onCategoryChange,
  onVisibilityChange,
  onDateFilterChange,
  onDateSortChange,
}: StudyFiltersProps) => {
  return (
    <div className="bg-card flex flex-wrap gap-4 rounded-lg border p-4">
      <div className="min-w-[200px] flex-1">
        <label className="text-muted-foreground mb-2 block text-sm font-medium">
          Category
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="border-input bg-background font-minecraft focus-visible:ring-ring h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <option value="All">All</option>
          <option value="Opening">Opening</option>
          <option value="Endgame">Endgame</option>
          <option value="Strategy">Strategy</option>
          <option value="Tactics">Tactics</option>
        </select>
      </div>

      <div className="min-w-[200px] flex-1">
        <label className="text-muted-foreground mb-2 block text-sm font-medium">
          Visibility
        </label>
        <select
          value={visibilityFilter}
          onChange={(e) => onVisibilityChange(e.target.value)}
          className="border-input bg-background font-minecraft focus-visible:ring-ring h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <option value="All">All</option>
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </select>
      </div>

      <div className="min-w-[200px] flex-1">
        <label className="text-muted-foreground mb-2 block text-sm font-medium">
          Date Filter
        </label>
        <select
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className="border-input bg-background font-minecraft focus-visible:ring-ring h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <option value="All">All</option>
          <option value="Last 7 days">Last 7 days</option>
          <option value="Last 30 days">Last 30 days</option>
          <option value="Last year">Last year</option>
        </select>
      </div>

      <div className="min-w-[200px] flex-1">
        <label className="text-muted-foreground mb-2 block text-sm font-medium">
          Date Sort
        </label>
        <select
          value={dateSort}
          onChange={(e) => onDateSortChange(e.target.value as "asc" | "desc")}
          className="border-input bg-background font-minecraft focus-visible:ring-ring h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
    </div>
  );
};

