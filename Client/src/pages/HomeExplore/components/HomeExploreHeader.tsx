import { GameAspect } from "../../../types/study";
import { Input } from "../../../components/ui/Input";

interface HomeExploreHeaderProps {
  gameAspect: GameAspect;
}

export const HomeExploreHeader = ({ gameAspect }: HomeExploreHeaderProps) => {
  const getHeaderTitle = () => {
    if (gameAspect === "All") {
      return "All Chess Studies";
    }
    return `Chess ${gameAspect}`;
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
          disabled
        />
      </div>
    </div>
  );
};

