import { useEffect, useState } from "react";
import { useScrollPosition } from "./useScrollPosition";

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