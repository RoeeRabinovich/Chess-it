interface SectionHeaderProps {
  title: string;
  indicatorColor?: string;
  showIndicator?: boolean;
  isPulsing?: boolean;
}

export const SectionHeader = ({
  title,
  indicatorColor = "bg-blue-500",
  showIndicator = true,
  isPulsing = false,
}: SectionHeaderProps) => {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 lg:mb-3">
      {showIndicator && (
        <div
          className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${indicatorColor} ${isPulsing ? "animate-pulse" : ""}`}
        />
      )}
      <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
        {title}
      </span>
    </div>
  );
};

