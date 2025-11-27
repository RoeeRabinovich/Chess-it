import { GameAspect } from "../../../types/study";
import { SearchInput } from "../../../components/ui/SearchInput";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { setSearchQuery } from "../../../store/searchSlice";
import { toggleArchive } from "../../../store/archiveSlice";
import { Bookmark } from "lucide-react";

interface HomeExploreHeaderProps {
  gameAspect: GameAspect;
  selectedFilter?: string;
  onAspectClear?: () => void;
  onFilterClear?: () => void;
}

export const HomeExploreHeader = ({
  gameAspect,
  selectedFilter,
  onAspectClear,
  onFilterClear,
}: HomeExploreHeaderProps) => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.search.query);
  const isArchiveActive = useAppSelector((state) => state.archive.isActive);

  const getHeaderTitle = () => {
    if (gameAspect === "All") {
      return "All Chess Studies";
    }
    return `Chess ${gameAspect}`;
  };

  const handleSearchChange = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const handleArchiveToggle = () => {
    dispatch(toggleArchive());
  };

  return (
    <div className="mb-8 space-y-4">
      <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
        {getHeaderTitle()}
      </h1>
      <div className="space-y-3">
        <div className="flex max-w-md items-center gap-2">
          <SearchInput
            placeholder="Search a Study"
            className="flex-1"
            value={searchQuery}
            onChange={handleSearchChange}
            showClearButton
            showSearchIcon={false}
          />
          <Button
            variant={isArchiveActive ? "default" : "outline"}
            size="default"
            onClick={handleArchiveToggle}
            className="shrink-0"
            title="Archive"
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Archive</span>
          </Button>
        </div>
        {/* Active Filters as Chips */}
        {(gameAspect !== "All" || selectedFilter !== "All") && (
          <div className="flex flex-wrap items-center gap-2">
            {gameAspect !== "All" && onAspectClear && (
              <Chip removable onRemove={onAspectClear} variant="outline" size="sm">
                {gameAspect}
              </Chip>
            )}
            {selectedFilter && selectedFilter !== "All" && onFilterClear && (
              <Chip removable onRemove={onFilterClear} variant="outline" size="sm">
                {selectedFilter}
              </Chip>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
