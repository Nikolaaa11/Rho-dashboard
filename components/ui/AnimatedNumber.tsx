"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  durationMs?: number;
  className?: string;
  startOnView?: boolean;
}

/**
 * Animates a number from 0 to `value` with an eased curve.
 * Triggers on intersection by default so it animates as the user scrolls in.
 */
export default function AnimatedNumber({
  value,
  format,
  durationMs = 1200,
  className,
  startOnView = true,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(startOnView ? 0 : value);
  const [hasStarted, setHasStarted] = useState(!startOnView);

  // Trigger on first intersection
  useEffect(() => {
    if (!startOnView || hasStarted) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setHasStarted(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [startOnView, hasStarted]);

  // Animate when started
  useEffect(() => {
    if (!hasStarted) return;
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutQuint
      const eased = 1 - Math.pow(1 - t, 5);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasStarted, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  );
}
