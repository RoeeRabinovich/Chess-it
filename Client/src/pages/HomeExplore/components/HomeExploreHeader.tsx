import { GameAspect } from "../../../types/study";
import { Input } from "../../../components/ui/Input";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { setSearchQuery } from "../../../store/searchSlice";

interface HomeExploreHeaderProps {
  gameAspect: GameAspect;
}

export const HomeExploreHeader = ({ gameAspect }: HomeExploreHeaderProps) => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.search.query);

  const getHeaderTitle = () => {
    if (gameAspect === "All") {
      return "All Chess Studies";
    }
    return `Chess ${gameAspect}`;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  return (
    <div className="mb-8 space-y-4">
      <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
        {getHeaderTitle()}
      </h1>
      <div className="max-w-md">
        <Input
          type="search"
          placeholder="Search a Study"
          className="w-full"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
    </div>
  );
};
