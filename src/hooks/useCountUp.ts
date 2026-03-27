import { useState, useEffect, useRef } from 'react';

export function useCountUp(end: number, duration: number = 1500, start: number = 0, trigger: boolean = true) {
  const [value, setValue] = useState(start);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!trigger) return;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (end - start) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [end, duration, start, trigger]);

  return Math.round(value);
}

export function formatIndian(num: number): string {
  return num.toLocaleString('en-IN');
}
