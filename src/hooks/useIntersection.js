import { useEffect, useRef, useState } from 'react';

export function useIntersection(options = {}) {
  const { onVisible, ...observerOptions } = options;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (onVisible) onVisible();
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, ...observerOptions }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}
