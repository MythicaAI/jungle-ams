// src/hooks/useScrollPosition.ts
import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Hook that tracks scroll position and direction
 * @returns {Object} Scroll data including position, direction, and progress
 */
export const useScrollPosition = () => {
  const [scrollData, setScrollData] = useState({
    y: 0,                   // Current scroll position
    lastY: 0,               // Last scroll position for direction calculation
    direction: 'none',      // 'up', 'down', or 'none'
    progress: 0,            // Normalized scroll progress (0 to 1)
    velocity: 0,            // Scroll velocity
    scrollHeight: 0,        // Total scrollable height
    viewportHeight: 0,      // Viewport height
    maxScroll: 0,           // Maximum scroll value
    isAtTop: true,          // Is at the top of the page
    isAtBottom: false,      // Is at the bottom of the page
  });

  // For velocity calculation
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const scrollHeight = document.body.scrollHeight;
    const maxScroll = scrollHeight - viewportHeight;
    
    // Calculate velocity
    const now = Date.now();
    const deltaTime = now - lastScrollTime.current;
    const deltaY = scrollY - lastScrollY.current;
    const velocity = deltaTime > 0 ? deltaY / deltaTime * 100 : 0;
    
    // Update refs for next calculation
    lastScrollY.current = scrollY;
    lastScrollTime.current = now;
    
    // Progress is a value between 0 and 1 representing how far through the page we've scrolled
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
    
    setScrollData({
      y: scrollY,
      lastY: scrollData.y,
      direction: scrollY > scrollData.y ? 'down' : scrollY < scrollData.y ? 'up' : scrollData.direction,
      progress,
      velocity,
      scrollHeight,
      viewportHeight,
      maxScroll,
      isAtTop: scrollY < 10,
      isAtBottom: Math.abs(scrollY + viewportHeight - scrollHeight) < 10,
    });
  }, [scrollData.y]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  return scrollData;
};
