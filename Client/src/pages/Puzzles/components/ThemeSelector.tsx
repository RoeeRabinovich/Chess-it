import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/Dropdown-menu";
import { Button } from "../../../components/ui/Button";
import { PUZZLE_THEMES } from "../../../constants/puzzleThemes";
import { ChevronDown } from "lucide-react";

interface ThemeSelectorProps {
  /** Selected theme keys */
  selectedThemes: string[];
  /** Callback when themes change */
  onThemesChange: (themes: string[]) => void;
}

export const ThemeSelector = ({
  selectedThemes,
  onThemesChange,
}: ThemeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get selected theme names for display
  const selectedThemeNames = PUZZLE_THEMES.filter((theme) =>
    selectedThemes.includes(theme.key),
  ).map((theme) => theme.name);

  const handleThemeToggle = (themeKey: string) => {
    if (selectedThemes.includes(themeKey)) {
      // Remove theme
      onThemesChange(selectedThemes.filter((key) => key !== themeKey));
    } else {
      // Add theme
      onThemesChange([...selectedThemes, themeKey]);
    }
  };

  // Group themes by category for better organization
  const gamePhaseThemes = PUZZLE_THEMES.filter((theme) =>
    ["opening", "middlegame", "endgame"].includes(theme.key),
  );
  const mateThemes = PUZZLE_THEMES.filter((theme) =>
    theme.key.includes("mate") || theme.key.includes("Mate"),
  );
  const endgameThemes = PUZZLE_THEMES.filter((theme) =>
    theme.key.includes("endgame") || theme.key.includes("Endgame"),
  );
  const tacticalThemes = PUZZLE_THEMES.filter(
    (theme) =>
      !gamePhaseThemes.includes(theme) &&
      !mateThemes.includes(theme) &&
      !endgameThemes.includes(theme) &&
      theme.key !== "mix" &&
      theme.key !== "playerGames" &&
      !theme.key.includes("master") &&
      !theme.key.includes("long") &&
      !theme.key.includes("short") &&
      !theme.key.includes("veryLong") &&
      !theme.key.includes("oneMove"),
  );
  const difficultyThemes = PUZZLE_THEMES.filter((theme) =>
    ["short", "long", "veryLong", "oneMove"].includes(theme.key),
  );
  const specialThemes = PUZZLE_THEMES.filter((theme) =>
    ["mix", "master", "masterVsMaster", "superGM", "playerGames"].includes(
      theme.key,
    ),
  );

  const displayText =
    selectedThemeNames.length === 0
      ? "Select themes"
      : selectedThemeNames.length === 1
        ? selectedThemeNames[0]
        : `${selectedThemeNames.length} themes selected`;

  return (
    <div className="space-y-2">
      <label className="text-foreground block text-sm font-medium">
        Themes
      </label>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            aria-label="Select puzzle themes"
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[400px] w-[300px] overflow-y-auto">
          <DropdownMenuLabel>Game Phase</DropdownMenuLabel>
          {gamePhaseThemes.map((theme) => (
            <DropdownMenuCheckboxItem
              key={theme.key}
              checked={selectedThemes.includes(theme.key)}
              onCheckedChange={() => handleThemeToggle(theme.key)}
            >
              {theme.name}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />

          <DropdownMenuLabel>Tactical Themes</DropdownMenuLabel>
          {tacticalThemes.map((theme) => (
            <DropdownMenuCheckboxItem
              key={theme.key}
              checked={selectedThemes.includes(theme.key)}
              onCheckedChange={() => handleThemeToggle(theme.key)}
            >
              {theme.name}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />

          <DropdownMenuLabel>Checkmate Patterns</DropdownMenuLabel>
          {mateThemes.map((theme) => (
            <DropdownMenuCheckboxItem
              key={theme.key}
              checked={selectedThemes.includes(theme.key)}
              onCheckedChange={() => handleThemeToggle(theme.key)}
            >
              {theme.name}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />

          <DropdownMenuLabel>Endgame Types</DropdownMenuLabel>
          {endgameThemes.map((theme) => (
            <DropdownMenuCheckboxItem
              key={theme.key}
              checked={selectedThemes.includes(theme.key)}
              onCheckedChange={() => handleThemeToggle(theme.key)}
            >
              {theme.name}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />

          <DropdownMenuLabel>Difficulty</DropdownMenuLabel>
          {difficultyThemes.map((theme) => (
            <DropdownMenuCheckboxItem
              key={theme.key}
              checked={selectedThemes.includes(theme.key)}
              onCheckedChange={() => handleThemeToggle(theme.key)}
            >
              {theme.name}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />

          <DropdownMenuLabel>Special</DropdownMenuLabel>
          {specialThemes.map((theme) => (
            <DropdownMenuCheckboxItem
              key={theme.key}
              checked={selectedThemes.includes(theme.key)}
              onCheckedChange={() => handleThemeToggle(theme.key)}
            >
              {theme.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedThemeNames.length > 0 && (
        <p className="text-muted-foreground text-xs">
          {selectedThemeNames.join(", ")}
        </p>
      )}
    </div>
  );
};

