import { Button } from "../../../components/ui/Button";
import { Knight } from "../../../components/icons/Knight.icon";
import { CategorySelector } from "./CategorySelector";
import { ThemeSummary } from "./ThemeSummary";
import { useThemeGrouping } from "../hooks/useThemeGrouping";

interface ThemeSelectorProps {
  selectedThemes: string[];
  onThemesChange: (themes: string[]) => void;
  onThemesApply: () => void;
}

export const ThemeSelector = ({
  selectedThemes,
  onThemesChange,
  onThemesApply,
}: ThemeSelectorProps) => {
  const {
    gamePhaseThemes,
    mergedThemes,
    endgameTypeThemes,
    difficultyThemes,
    specialThemes,
  } = useThemeGrouping();

  const handleThemeToggle = (themeKey: string) => {
    if (selectedThemes.includes(themeKey)) {
      onThemesChange(selectedThemes.filter((key) => key !== themeKey));
    } else {
      onThemesChange([...selectedThemes, themeKey]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-foreground block text-sm font-medium">
        Themes
      </label>

      {/* Game Phase Selector */}
      {gamePhaseThemes.length > 0 && (
        <CategorySelector
          categoryName="Game Phase"
          themes={gamePhaseThemes}
          selectedThemes={selectedThemes}
          onThemeToggle={handleThemeToggle}
          onThemesChange={onThemesChange}
        />
      )}

      {/* Themes Selector (Tactical + Checkmate) */}
      {mergedThemes.length > 0 && (
        <CategorySelector
          categoryName="Themes"
          themes={mergedThemes}
          selectedThemes={selectedThemes}
          onThemeToggle={handleThemeToggle}
          onThemesChange={onThemesChange}
        />
      )}

      {/* Endgame Types Selector */}
      {endgameTypeThemes.length > 0 && (
        <CategorySelector
          categoryName="Endgame Types"
          themes={endgameTypeThemes}
          selectedThemes={selectedThemes}
          onThemeToggle={handleThemeToggle}
          onThemesChange={onThemesChange}
        />
      )}

      {/* Difficulty Selector */}
      {difficultyThemes.length > 0 && (
        <CategorySelector
          categoryName="Difficulty"
          themes={difficultyThemes}
          selectedThemes={selectedThemes}
          onThemeToggle={handleThemeToggle}
          onThemesChange={onThemesChange}
        />
      )}

      {/* Special Selector */}
      {specialThemes.length > 0 && (
        <CategorySelector
          categoryName="Special"
          themes={specialThemes}
          selectedThemes={selectedThemes}
          onThemeToggle={handleThemeToggle}
          onThemesChange={onThemesChange}
        />
      )}

      <ThemeSummary selectedThemes={selectedThemes} />

      <Button
        onClick={onThemesApply}
        className="bg-secondary mt-2 w-full text-xs"
        variant="ghost"
        size="sm"
      >
        <Knight className="h-4 w-4" />
        Set Themes
      </Button>
    </div>
  );
};
