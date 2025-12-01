import { useMemo } from "react";
import { PUZZLE_THEMES } from "../../../constants/puzzleThemes";

interface ThemeGroups {
  gamePhaseThemes: typeof PUZZLE_THEMES;
  mergedThemes: typeof PUZZLE_THEMES;
  endgameTypeThemes: typeof PUZZLE_THEMES;
  difficultyThemes: typeof PUZZLE_THEMES;
  specialThemes: typeof PUZZLE_THEMES;
}

export const useThemeGrouping = (): ThemeGroups => {
  return useMemo(() => {
    const gamePhaseThemes = PUZZLE_THEMES.filter(
      (theme) => theme.category === "gamePhase",
    );
    const tacticalThemes = PUZZLE_THEMES.filter(
      (theme) => theme.category === "tactical",
    );
    const checkmateThemes = PUZZLE_THEMES.filter(
      (theme) => theme.category === "checkmate",
    );
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

    return {
      gamePhaseThemes,
      mergedThemes,
      endgameTypeThemes,
      difficultyThemes,
      specialThemes,
    };
  }, []);
};

