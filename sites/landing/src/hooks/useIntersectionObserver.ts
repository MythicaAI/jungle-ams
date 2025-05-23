import { useEffect, useRef, useState } from "react";

type IntersectionCallback = (param: IntersectionObserverEntry) => void;
/**
 * Hook to detect when an element intersects the viewport
 * @param {Object} options - IntersectionObserver options
 * @param {Function} callback - Optional callback when intersection changes
 * @returns {Array} [ref, isIntersecting, entry]
 */
export const useIntersectionObserver = (options = {}, callback: IntersectionCallback | undefined) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options,
  };

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element) return;
    
    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
      
      if (callback) {
        callback(entry);
      }
    }, defaultOptions);
    
    observerRef.current.observe(element);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, defaultOptions]);

  return [elementRef, isIntersecting, entry];
};

