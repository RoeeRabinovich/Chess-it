/**
 * Builds query parameters for puzzle API request
 */
export interface PuzzleQueryParams {
  url: string;
  actualPlayerMoves: number;
  themesToSend: string[];
}

export const buildPuzzleQueryParams = (
  rating: number,
  count: number,
  themes: string[],
  themesType: "ALL" | "OR",
  playerMoves: number,
): PuzzleQueryParams => {
  const queryParams: string[] = [];

  // Separate difficulty themes from regular themes
  const difficultyThemeMap: Record<string, number> = {
    oneMove: 1,
    short: 2,
    long: 3,
    veryLong: 4,
  };

  const regularThemes =
    themes?.filter((theme) => !(theme in difficultyThemeMap)) || [];
  const difficultyThemes =
    themes?.filter((theme) => theme in difficultyThemeMap) || [];

  // Calculate playerMoves: use difficulty theme if selected, otherwise base on rating
  let actualPlayerMoves = playerMoves;

  if (difficultyThemes.length > 0) {
    actualPlayerMoves = difficultyThemeMap[difficultyThemes[0]];
  } else {
    // Rating-based difficulty mapping
    if (rating < 800) {
      actualPlayerMoves = 2;
    } else if (rating < 1200) {
      actualPlayerMoves = 3;
    } else if (rating < 1600) {
      actualPlayerMoves = 4;
    } else {
      actualPlayerMoves = 4;
    }
  }

  // Handle themes parameter (only non-difficulty themes)
  const specialThemeKeys = [
    "mix",
    "master",
    "masterVsMaster",
    "superGM",
    "playerGames",
  ];
  const themesToSend = regularThemes.filter(
    (theme) => !specialThemeKeys.includes(theme),
  );

  if (themesToSend.length > 0) {
    const themesParam = encodeURIComponent(JSON.stringify(themesToSend));
    queryParams.push(`themes=${themesParam}`);

    if (themesToSend.length > 1) {
      queryParams.push(`themesType=${themesType}`);
    }
  }

  // Add other parameters
  queryParams.push(`rating=${rating}`);
  queryParams.push(`playerMoves=${actualPlayerMoves}`);
  queryParams.push(`count=${count}`);

  const url = `https://chess-puzzles.p.rapidapi.com/?${queryParams.join("&")}`;

  return { url, actualPlayerMoves, themesToSend };
};

