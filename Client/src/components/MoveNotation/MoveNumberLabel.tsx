interface MoveNumberLabelProps {
  moveNumber: number;
  isFirstMove: boolean;
  isBlackMove: boolean;
}

export const MoveNumberLabel = ({
  moveNumber,
  isFirstMove,
  isBlackMove,
}: MoveNumberLabelProps) => {
  if (isFirstMove && !isBlackMove) {
    return (
      <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
        {moveNumber}.
      </span>
    );
  }

  if (isFirstMove && isBlackMove) {
    return (
      <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
        {moveNumber}...
      </span>
    );
  }

  if (!isFirstMove && !isBlackMove) {
    return (
      <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
        {moveNumber}.
      </span>
    );
  }

  return (
    <span className="text-muted-foreground text-[10px] sm:text-xs">...</span>
  );
};

