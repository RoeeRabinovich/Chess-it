import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/Dropdown-menu";
import { Button } from "../../../components/ui/Button";
import { PUZZLE_THEMES } from "../../../constants/puzzleThemes";
import { ChevronDown } from "lucide-react";

interface ThemeSelectorProps {
  /** Selected theme keys */
  selectedThemes: string[];
  /** Callback when themes change (for preview) */
  onThemesChange: (themes: string[]) => void;
  /** Callback when "Set Themes" button is clicked */
  onThemesApply: () => void;
}

interface CategorySelectorProps {
  categoryName: string;
  themes: typeof PUZZLE_THEMES;
  selectedThemes: string[];
  onThemeToggle: (themeKey: string) => void;
  onThemesChange: (themes: string[]) => void;
}

const CategorySelector = ({
  categoryName,
  themes,
  selectedThemes,
  onThemeToggle,
  onThemesChange,
}: CategorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedInCategory = themes.filter((theme) =>
    selectedThemes.includes(theme.key),
  );
  const allSelected = selectedInCategory.length === themes.length;
  const someSelected = selectedInCategory.length > 0 && !allSelected;

  const displayText =
    allSelected && themes.length > 0
      ? `All (${themes.length})`
      : someSelected
        ? `${selectedInCategory.length} selected`
        : "None";

  const handleSelectAll = (checked: boolean) => {
    const themeKeys = themes.map((theme) => theme.key);

    if (checked) {
      // Select all themes in this category
      // Add all theme keys from this category that aren't already selected
      const newSelectedThemes = [
        ...selectedThemes,
        ...themeKeys.filter((key) => !selectedThemes.includes(key)),
      ];
      onThemesChange(newSelectedThemes);
    } else {
      // Deselect all themes in this category
      // Remove all theme keys from this category
      const newSelectedThemes = selectedThemes.filter(
        (key) => !themeKeys.includes(key),
      );
      onThemesChange(newSelectedThemes);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-foreground block text-xs font-medium">
        {categoryName}
      </label>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-xs"
            aria-label={`Select ${categoryName} themes`}
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background max-h-[300px] w-[250px] overflow-y-auto">
          <DropdownMenuCheckboxItem
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            onSelect={(e) => e.preventDefault()}
            className="text-xs font-semibold"
          >
            Select All
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {themes.map((theme) => (
            <DropdownMenuCheckboxItem
              key={theme.key}
              checked={selectedThemes.includes(theme.key)}
              onCheckedChange={() => onThemeToggle(theme.key)}
              onSelect={(e) => e.preventDefault()}
              className="text-xs"
            >
              {theme.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const ThemeSelector = ({
  selectedThemes,
  onThemesChange,
  onThemesApply,
}: ThemeSelectorProps) => {
  // Get selected theme names for display
  const selectedThemeNames = PUZZLE_THEMES.filter((theme) =>
    selectedThemes.includes(theme.key),
  ).map((theme) => theme.name);

  // Check if all themes are selected
  const allThemeKeys = PUZZLE_THEMES.map((theme) => theme.key);
  const isAllSelected =
    selectedThemes.length === allThemeKeys.length &&
    allThemeKeys.every((key) => selectedThemes.includes(key));

  const handleThemeToggle = (themeKey: string) => {
    if (selectedThemes.includes(themeKey)) {
      // Remove theme
      onThemesChange(selectedThemes.filter((key) => key !== themeKey));
    } else {
      // Add theme
      onThemesChange([...selectedThemes, themeKey]);
    }
  };

  // Group themes by category
  const gamePhaseThemes = PUZZLE_THEMES.filter(
    (theme) => theme.category === "gamePhase",
  );
  const tacticalThemes = PUZZLE_THEMES.filter(
    (theme) => theme.category === "tactical",
  );
  const checkmateThemes = PUZZLE_THEMES.filter(
    (theme) => theme.category === "checkmate",
  );
  // Merge tactical and checkmate themes into one "Themes" category
  const mergedThemes = [...tacticalThemes, ...checkmateThemes];
  const endgameTypeThemes = PUZZLE_THEMES.filter(
    (theme) => theme.category === "endgameType",
  );
  const difficultyThemes = PUZZLE_THEMES.filter(
    (theme) => theme.category === "difficulty",
  );
  const specialThemes = PUZZLE_THEMES.filter(
    (theme) => theme.category === "special",
  );

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

      {/* Selected themes summary */}
      {selectedThemeNames.length > 0 && (
        <div className="border-border bg-muted/50 rounded-md border p-2">
          <p className="text-muted-foreground text-xs font-medium">
            {isAllSelected
              ? "All themes selected"
              : `${selectedThemeNames.length} theme${selectedThemeNames.length !== 1 ? "s" : ""} selected`}
          </p>
          {!isAllSelected && selectedThemeNames.length <= 5 && (
            <p className="text-muted-foreground mt-1 text-xs">
              {selectedThemeNames.join(", ")}
            </p>
          )}
        </div>
      )}

      <Button onClick={onThemesApply} className="mt-2 w-full" variant="default">
        Set Themes
      </Button>
    </div>
  );
};
