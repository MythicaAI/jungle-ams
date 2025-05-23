import { useCallback, useEffect, useRef, useState } from "react";

type GestureType = 'swipe' | 'tap' | 'press' | null;
type GestureDirection = 'up' | 'down' | 'left' | 'right' | null;
interface Vec2 {
    x: number,
    y: number
};

interface Gesture {
    type: GestureType,
    direction: GestureDirection,
    distance: Vec2,
    velocity: Vec2
};

const initGesture = {
    type: null, // 'swipe', 'tap', 'press', etc.
    direction: null, // for swipes: 'up', 'down', 'left', 'right'
    distance: { x: 0, y: 0 }, // total distance moved
    velocity: { x: 0, y: 0 }, // speed of gesture
  };

/**
 * Hook for gesture detection on touch devices
 */
export const useGestureDetection = () => {
  const [gesture, setGesture] = useState<Gesture>(initGesture);
  
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchEndRef = useRef({ x: 0, y: 0, time: 0 });
  
  const minSwipeDistance = 50; // minimum distance for a swipe
  const maxTapDuration = 200; // maximum ms for a tap
  const minPressDuration = 500; // minimum ms for a press
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    // Reset gesture
    setGesture(initGesture);
  }, []);
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
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
      let type: GestureType = null;
      let direction: GestureDirection = null;
      
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
