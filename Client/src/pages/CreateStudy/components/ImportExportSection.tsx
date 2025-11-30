import { Button } from "../../../components/ui/Button";

interface ImportExportSectionProps {
  onLoadFEN: () => void;
  onLoadPGN: () => void;
}

export const ImportExportSection = ({
  onLoadFEN,
  onLoadPGN,
}: ImportExportSectionProps) => {
  return (
    <div>
      <h3 className="text-muted-foreground mb-3 text-sm font-medium tracking-wide uppercase">
        Import / Export
      </h3>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadFEN}
          className="flex-1"
        >
          Load FEN
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadPGN}
          className="flex-1"
        >
          Load PGN
        </Button>
      </div>
    </div>
  );
};

