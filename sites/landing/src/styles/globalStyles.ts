// src/styles/globalStyles.ts

// Define global CSS variables and styles
const globalStyles = `
  :root {
    --scroll-behavior: smooth;
    --font-smoothing: antialiased;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(58, 134, 255, 0.3);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(58, 134, 255, 0.5);
  }

  /* Link transition */
  a {
    transition: color 0.2s ease;
  }

  /* Smooth element transitions */
  * {
    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, filter;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
  }

  /* Focus styles */
  *:focus-visible {
    outline: 2px solid rgba(58, 134, 255, 0.6);
    outline-offset: 2px;
  }

  /* Selection color */
  ::selection {
    background-color: rgba(58, 134, 255, 0.2);
  }
`;

// Apply global styles
const style = document.createElement('style');
style.textContent = globalStyles;
document.head.appendChild(style);

export default globalStyles;