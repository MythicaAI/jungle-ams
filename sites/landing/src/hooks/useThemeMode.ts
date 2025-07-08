import { useCallback, useEffect, useState } from "react";

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