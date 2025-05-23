import { useCallback } from "react";

/**
 * Custom hook for smooth scrolling to elements
 */
export const useSmoothScroll = () => {
  const scrollToElement = useCallback((elementId: string, options = {}) => {
    const defaults = {
      behavior: 'smooth' as ScrollBehavior,
      offset: 0,
      duration: 1000,
    };
    
    const config = { ...defaults, ...options };
    const element = document.getElementById(elementId);
    
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - config.offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: config.behavior,
    });
  }, []);
  
  return { scrollToElement };
};
