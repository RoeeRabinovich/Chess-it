import { PUZZLE_THEMES } from "../../../constants/puzzleThemes";

interface ThemeSummaryProps {
  selectedThemes: string[];
}

export const ThemeSummary = ({ selectedThemes }: ThemeSummaryProps) => {
  const selectedThemeNames = PUZZLE_THEMES.filter((theme) =>
    selectedThemes.includes(theme.key),
  ).map((theme) => theme.name);

  const allThemeKeys = PUZZLE_THEMES.map((theme) => theme.key);
  const isAllSelected =
    selectedThemes.length === allThemeKeys.length &&
    allThemeKeys.every((key) => selectedThemes.includes(key));

  if (selectedThemeNames.length === 0) {
    return null;
  }

  return (
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
  );
};

