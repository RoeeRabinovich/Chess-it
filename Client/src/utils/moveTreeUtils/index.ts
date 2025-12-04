// Re-export all public functions for backward compatibility
export {
  ROOT_PATH_INDEX,
  isRootBranchPath,
  pathToString,
  pathFromString,
  getPathDepth,
  isMainLinePath,
  getMainLineMoves,
  getAbsoluteMoveIndex,
  getBranchesAtPath,
} from "./moveTreePathUtils";

export {
  getBranchContextForPath,
  getNodeAtPath,
  getMovesAlongPath,
  loadPositionFromPath,
} from "./moveTreeNavigation";

export { addMoveToTree } from "./moveTreeModification";

