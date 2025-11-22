import { useEffect, useState } from "react";

interface UsePuzzleTimerProps {
  /** Whether the timer should be running */
  isRunning: boolean;
  /** Key to reset timer when puzzle changes */
  resetKey?: string | number;
}

interface UsePuzzleTimerReturn {
  /** Elapsed time in seconds */
  elapsedTime: number;
  /** Formatted time string (MM:SS or HH:MM:SS) */
  formattedTime: string;
  /** Reset the timer manually */
  reset: () => void;
}

/**
 * Custom hook for managing puzzle timer
 * Starts when isRunning is true, stops when false
 * Resets when resetKey changes
 */
export const usePuzzleTimer = ({
  isRunning,
  resetKey,
}: UsePuzzleTimerProps): UsePuzzleTimerReturn => {
  const [elapsedTime, setElapsedTime] = useState(0); // Time in seconds

  // Reset timer when puzzle changes (resetKey changes)
  useEffect(() => {
    setElapsedTime(0);
  }, [resetKey]);

  // Timer effect - increments every second when running
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const reset = () => {
    setElapsedTime(0);
  };

  return {
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    reset,
  };
};

