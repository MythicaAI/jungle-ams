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

/**
 * Hook to detect when an element intersects the viewport
 * @param {Object} options - IntersectionObserver options
 * @param {Function} callback - Optional callback when intersection changes
 * @returns {Array} [ref, isIntersecting, entry]
 */
export const useIntersectionObserver = (options = {}, callback) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

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

/**
 * Calculate parallax effect values based on scroll position
 * @param {number} scrollPosition - Current scroll position
 * @param {number} speed - Speed of parallax effect (1 is normal, lower is slower, higher is faster)
 * @param {number} offset - Starting offset
 * @returns {number} Calculated transform value
 */
export const useParallaxEffect = (speed = 0.5, offset = 0) => {
  const [transform, setTransform] = useState(offset);
  const { y: scrollY } = useScrollPosition();
  
  useEffect(() => {
    const calculatedValue = offset + (scrollY * speed);
    setTransform(calculatedValue);
  }, [scrollY, speed, offset]);
  
  return transform;
};

/**
 * Custom hook for smooth scrolling to elements
 */
export const useSmoothScroll = () => {
  const scrollToElement = useCallback((elementId, options = {}) => {
    const defaults = {
      behavior: 'smooth',
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

/**
 * Hook for gesture detection on touch devices
 */
export const useGestureDetection = () => {
  const [gesture, setGesture] = useState({
    type: null, // 'swipe', 'tap', 'press', etc.
    direction: null, // for swipes: 'up', 'down', 'left', 'right'
    distance: { x: 0, y: 0 }, // total distance moved
    velocity: { x: 0, y: 0 }, // speed of gesture
  });
  
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchEndRef = useRef({ x: 0, y: 0, time: 0 });
  
  const minSwipeDistance = 50; // minimum distance for a swipe
  const maxTapDuration = 200; // maximum ms for a tap
  const minPressDuration = 500; // minimum ms for a press
  
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    // Reset gesture
    setGesture({
      type: null,
      direction: null,
      distance: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
    });
  }, []);
  
  const handleTouchEnd = useCallback((e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      
      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = touchEndRef.current.y - touchStartRef.current.y;
      const deltaTime = touchEndRef.current.time - touchStartRef.current.time;
      
      // Calculate distance and velocity
      const distance = {
        x: Math.abs(deltaX),
        y: Math.abs(deltaY),
      };
      
      const velocity = {
        x: distance.x / deltaTime,
        y: distance.y / deltaTime,
      };
      
      // Determine gesture type
      let type = null;
      let direction = null;
      
      if (deltaTime < maxTapDuration && distance.x < 10 && distance.y < 10) {
        type = 'tap';
      } else if (deltaTime > minPressDuration && distance.x < 10 && distance.y < 10) {
        type = 'press';
      } else if (distance.x > minSwipeDistance || distance.y > minSwipeDistance) {
        type = 'swipe';
        
        // Determine swipe direction
        if (distance.x > distance.y) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }
      }
      
      setGesture({
        type,
        direction,
        distance,
        velocity,
      });
    }
  }, []);
  
  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);
  
  return gesture;
};

/**
 * Custom hook for handling theme modes
 * @param {string} initialMode - Initial theme mode ('light' or 'dark')
 * @returns {Array} [mode, toggleMode, setMode]
 */
export const useThemeMode = (initialMode = 'light') => {
  const [mode, setMode] = useState(() => {
    // Try to load from localStorage
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }
    
    // Check user preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Fallback to initial mode
    return initialMode;
  });
  
  // Update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    // Optional: Update document attributes or classes
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);
  
  const toggleMode = useCallback(() => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  }, []);
  
  return [mode, toggleMode, setMode];
};