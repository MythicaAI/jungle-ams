import { extendTheme } from '@mui/joy/styles';

// Core theme values that can be easily modified
const themeTokens = {
  // Primary brand colors - change these to match your brand
  brand: {
    primary: '#2d5a4f',  // Main brand color
    secondary: '#9acd32', // Secondary brand color
    accent: '#ff006e',   // Accent color for highlights
    dark: '#2d3748',     // Dark shade for backgrounds
    light: '#e8e8e8',    // Light shade for backgrounds
  },

  // UI feedback colors
  feedback: {
    success: '#06d6a0',
    warning: '#ffbe0b',
    error: '#ef476f',
    info: '#4cc9f0',
  },

  // Neutral shades for text, borders, etc.
  neutral: {
    900: '#212529', // Darkest - for primary text
    800: '#343a40',
    700: '#495057',
    600: '#6c757d', // For secondary text
    500: '#adb5bd',
    400: '#ced4da',
    300: '#dee2e6', // For borders
    200: '#e9ecef',
    100: '#f1f3f5',
    50: '#f8f9fa',  // Lightest - for backgrounds
  },

  // Animation timing
  animation: {
    fast: '0.2s',
    medium: '0.3s',
    slow: '0.5s',
  },

  // Border radius
  radius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    round: '50%',
  },

  // Spacing units - using 4px base increment
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  // Typography
  typography: {
    fontFamily: {
      body: '"Inter", "Roboto", "Helvetica", sans-serif',
      display: '"Space Grotesk", "Inter", sans-serif',
      mono: '"Roboto Mono", monospace',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },

  // Z-index scale
  zIndex: {
    header: 100,
    modal: 200,
    tooltip: 300,
  },
};

// Create the theme configuration
const createAppTheme = (mode = 'dark', customTokens = {}) => {
  // Merge default tokens with any custom tokens
  const tokens = {
    ...themeTokens,
    ...customTokens,
  };

  // Helper function to generate palette
  const generatePalette = (baseColor, darkShade, lightShade) => ({
    primary: {
      solidBg: tokens.brand[baseColor],
      solidHoverBg: darkShade ? tokens.brand[darkShade] : undefined,
      solidActiveBg: lightShade ? tokens.brand[lightShade] : undefined,
    }
  });

  // Base theme configuration
  return extendTheme({
    colorSchemes: {
      light: {
        palette: {
          primary: {
            solidBg: tokens.brand.primary,
            solidHoverBg: tokens.brand.dark,
            solidActiveBg: tokens.brand.secondary,
            solidColor: tokens.neutral[50],
          },
          neutral: {
            solidBg: tokens.neutral[900],
            solidHoverBg: tokens.neutral[800],
            solidActiveBg: tokens.neutral[700],
            outlinedBorder: tokens.neutral[300],
            outlinedColor: tokens.neutral[900],
            outlinedHoverBg: tokens.neutral[100],
            plainColor: tokens.neutral[900],
            plainHoverBg: tokens.neutral[100],
            plainActiveBg: tokens.neutral[200],
          },
          background: {
            body: tokens.neutral[50],
            surface: '#ffffff',
          },
          text: {
            primary: tokens.neutral[900],
            secondary: tokens.neutral[600],
          },
        },
      },
      dark: {
        palette: {
          primary: {
            solidBg: tokens.brand.primary,
            solidHoverBg: tokens.brand.secondary,
            solidActiveBg: tokens.brand.accent,
            solidColor: tokens.neutral[50],
          },
          neutral: {
            solidBg: tokens.neutral[200],
            solidHoverBg: tokens.neutral[300],
            solidActiveBg: tokens.neutral[400],
            outlinedBorder: tokens.neutral[700],
            outlinedColor: tokens.neutral[100],
            outlinedHoverBg: tokens.neutral[800],
            plainColor: tokens.neutral[100],
            plainHoverBg: tokens.neutral[800],
            plainActiveBg: tokens.neutral[700],
          },
          background: {
            body: tokens.brand.dark,
            surface: tokens.neutral[900],
          },
          text: {
            primary: tokens.neutral[100],
            secondary: tokens.neutral[400],
          },
        },
      },
    },
    fontFamily: {
      display: tokens.typography.fontFamily.display,
      body: tokens.typography.fontFamily.body,
      code: tokens.typography.fontFamily.mono,
    },
    radius: {
      xs: tokens.radius.sm,
      sm: tokens.radius.sm,
      md: tokens.radius.md,
      lg: tokens.radius.lg,
      xl: tokens.radius.xl,
    },
    shadow: {
      xs: '0 1px 2px rgba(0,0,0,0.05)',
      sm: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
      md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    },
    typography: {
      h1: {
        fontFamily: tokens.typography.fontFamily.display,
        fontWeight: tokens.typography.fontWeight.bold,
        fontSize: '3.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontFamily: tokens.typography.fontFamily.display,
        fontWeight: tokens.typography.fontWeight.bold,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h3: {
        fontFamily: tokens.typography.fontFamily.display,
        fontWeight: tokens.typography.fontWeight.bold,
        fontSize: '2rem',
        lineHeight: 1.2,
      },
      h4: {
        fontFamily: tokens.typography.fontFamily.display,
        fontWeight: tokens.typography.fontWeight.medium,
        fontSize: '1.5rem',
        lineHeight: 1.3,
      },
      h5: {
        fontFamily: tokens.typography.fontFamily.display,
        fontWeight: tokens.typography.fontWeight.medium,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h6: {
        fontFamily: tokens.typography.fontFamily.display,
        fontWeight: tokens.typography.fontWeight.medium,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body1: {
        fontFamily: tokens.typography.fontFamily.body,
        fontWeight: tokens.typography.fontWeight.regular,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontFamily: tokens.typography.fontFamily.body,
        fontWeight: tokens.typography.fontWeight.regular,
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      caption: {
        fontFamily: tokens.typography.fontFamily.body,
        fontWeight: tokens.typography.fontWeight.regular,
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
    components: {
      // Global component overrides can go here
      JoyButton: {
        styleOverrides: {
          root: {
            transition: `all ${tokens.animation.medium} ${tokens.transitions?.easing?.easeInOut}`,
          },
        },
      },
    },
  });
};

// Export the theme, tokens, and helper functions
export { createAppTheme, themeTokens };

// Usage example:
// 1. Import the theme creator and tokens
// import { createAppTheme, themeTokens } from './theme';
//
// 2. Create a customized theme (optional)
// const customTokens = {
//   brand: {
//     ...themeTokens.brand,
//     primary: '#ff0000', // Override primary color
//   }
// };
//
// 3. Create the theme with optional mode and custom tokens
// const theme = createAppTheme('light', customTokens);
//
// 4. Use it in your app
// <CssVarsProvider theme={theme}>
//   <App />
// </CssVarsProvider>