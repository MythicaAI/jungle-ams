import { extendTheme } from '@mui/joy';

export const useTheme = () => {
  const palette = {
    primary: {
      solidBg: '#367C64',
      solidBorder: '#367C64',
      solidHoverBg: '#639C8E',
      solidHoverBorder: '#639C8E',
      solidActiveBg: '#639C8E',
      solidActiveBorder: '#639C8E',
      solidDisabledBg: '#596066',
      solidDisabledBorder: '#596066',
      softColor: '#000',
      softBg: '#f8f9fa',
      softBorder: '#f8f9fa',
      softHoverBg: '#f9fafbd6',
      softHoverBorder: '#f9fafbd6',
      softActiveBg: '#f9fafb',
      softActiveBorder: '#f9fafb',
      softDisabledBg: '#f8f9fa',
      softDisabledBorder: '#f8f9fa',
      outlinedBg: 'transparent',
      outlinedColor: '#fff',
      outlinedBorder: '#367C64',
      outlinedHoverBg: '#639C8E',
      outlinedHoverBorder: '#639C8E',
      outlinedActiveBg: '#639C8E',
      outlinedActiveBorder: '#639C8E',
      outlinedDisabledBg: '#596066',
      outlinedDisabledBorder: '#596066',
    },
    soft: {
      solidBg: '#367C64',
      solidBorder: '#367C64',
      solidHoverBg: '#639C8E',
      solidHoverBorder: '#639C8E',
      solidActiveBg: '#639C8E',
      solidActiveBorder: '#639C8E',
      solidDisabledBg: '#596066',
      solidDisabledBorder: '#596066',
    },
    neutral: {
      solidBg: '#6c757d',
      solidBorder: '#6c757d',
      solidHoverBg: '#5c636a',
      solidHoverBorder: '#565e64',
      solidActiveBg: '#565e64',
      solidActiveBorder: '#51585e',
      solidDisabledBg: '#6c757d',
      solidDisabledBorder: '#6c757d',
      // btn-light
      softColor: '#000',
      softBg: '#f8f9fa',
      softBorder: '#f8f9fa',
      softHoverBg: '#f9fafb',
      softHoverBorder: '#f9fafb',
      softActiveBg: '#f9fafb',
      softActiveBorder: '#f9fafb',
      softDisabledBg: '#f8f9fa',
      softDisabledBorder: '#f8f9fa',
    },
  };

  const baseTheme = extendTheme();

  const darkOnlyTheme = extendTheme({
    components: {
      JoyInput: {
        styleOverrides: {
          root: () => ({
            '&:focus-within::before': {
              border: `2px solid #367C64`,
              boxShadow: 'none',
            },
          }),
        },
      },
    },
    colorSchemes: {
      light: { ...baseTheme.colorSchemes.dark, palette },
      dark: { ...baseTheme.colorSchemes.dark, palette },
    },
  });

  return { theme: darkOnlyTheme };
};
