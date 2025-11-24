import { getAvatarColor, getInitial } from "../../utils/avatarUtils";
import { cn } from "../../lib/utils";

interface AvatarProps {
  username: string;
  imageUrl?: string;
  imageAlt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showBorder?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-2xl",
};

export const Avatar = ({
  username,
  imageUrl,
  imageAlt,
  size = "md",
  className,
  showBorder = false,
}: AvatarProps) => {
  const backgroundColor = getAvatarColor(username);
  const initial = getInitial(username);
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full font-bold text-white",
        sizeClass,
        showBorder && "border-border border-2",
        className,
      )}
      style={{ backgroundColor }}
      role="img"
      aria-label={`Avatar for ${username}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt || username}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback to initial if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.textContent = initial;
            }
          }}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
};
