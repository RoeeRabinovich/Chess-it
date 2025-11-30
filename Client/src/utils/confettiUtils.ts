import confetti from "canvas-confetti";

/**
 * Triggers a celebration confetti animation
 */
export const triggerConfetti = (): void => {
  const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0 },
    colors: colors,
  });

  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
    colors,
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
    });
  }, 250);
};

