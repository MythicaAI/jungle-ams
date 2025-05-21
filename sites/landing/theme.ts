// theme.ts
import { extendTheme } from '@mui/joy/styles';

export const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          solidBg: '#00f0ff',
          solidHoverBg: '#00c0cc',
        },
        background: {
          surface: '#111',
          body: '#0a0a0a',
        },
      },
    },
  },
});
