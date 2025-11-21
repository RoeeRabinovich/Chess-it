import { GameAspect } from "../../../types/study";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { setSearchQuery } from "../../../store/searchSlice";
import { toggleArchive } from "../../../store/archiveSlice";
import { Bookmark } from "lucide-react";

interface HomeExploreHeaderProps {
  gameAspect: GameAspect;
}

export const HomeExploreHeader = ({ gameAspect }: HomeExploreHeaderProps) => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.search.query);
  const isArchiveActive = useAppSelector((state) => state.archive.isActive);

  const getHeaderTitle = () => {
    if (gameAspect === "All") {
      return "All Chess Studies";
    }
    return `Chess ${gameAspect}`;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleArchiveToggle = () => {
    dispatch(toggleArchive());
  };

  return (
    <div className="mb-8 space-y-4">
      <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
        {getHeaderTitle()}
      </h1>
      <div className="flex max-w-md items-center gap-2">
        <Input
          type="search"
          placeholder="Search a Study"
          className="flex-1"
          value={searchQuery}
          onChange={handleSearchChange}
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
    </div>
  );
};
