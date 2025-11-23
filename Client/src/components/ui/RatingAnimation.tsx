import { useEffect, useState } from "react";

interface RatingAnimationProps {
  startValue: number;
  change: number;
  duration?: number;
  onComplete?: () => void;
}

export const RatingAnimation = ({
  startValue,
  change,
  duration = 1000,
  onComplete,
}: RatingAnimationProps) => {
  const [displayValue, setDisplayValue] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (change === 0) return;

    setIsAnimating(true);
    const endValue = startValue + change;
    const startTime = Date.now();
    const startVal = startValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startVal + change * easeOut);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
        if (onComplete) {
          onComplete();
        }
      }
    };

    requestAnimationFrame(animate);
  }, [startValue, change, duration, onComplete]);

  const isPositive = change > 0;
  const changeText = isPositive ? `+${change}` : `${change}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold sm:text-3xl">{displayValue}</span>
      {isAnimating && change !== 0 && (
        <span
          className={`text-sm font-semibold transition-opacity ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {changeText}
        </span>
      )}
    </div>
  );
};

