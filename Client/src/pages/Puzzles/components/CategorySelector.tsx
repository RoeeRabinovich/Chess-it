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

interface CategorySelectorProps {
  categoryName: string;
  themes: typeof PUZZLE_THEMES;
  selectedThemes: string[];
  onThemeToggle: (themeKey: string) => void;
  onThemesChange: (themes: string[]) => void;
}

export const CategorySelector = ({
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
      const newSelectedThemes = [
        ...selectedThemes,
        ...themeKeys.filter((key) => !selectedThemes.includes(key)),
      ];
      onThemesChange(newSelectedThemes);
    } else {
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

