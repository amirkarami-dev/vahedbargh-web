"use client";
import { useState, useEffect } from "react";

export function useCounter(
  target: number,
  duration = 2500,
  active = false
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    const startTime = performance.now();
    const startValue = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startValue + (target - startValue) * eased));

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration, active]);

  return count;
}
