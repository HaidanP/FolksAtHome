import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  target: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  formatter?: (n: number) => string;
}

export default function CountUp({
  target,
  duration = 1800,
  delay = 0,
  suffix = '',
  formatter,
}: CountUpProps) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.round(eased * target));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  const display = formatter ? formatter(current) : String(current);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}
