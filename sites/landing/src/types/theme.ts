// src/types/theme.ts
import { ThemeOptions } from '@mui/joy/styles';

/**
 * Brand theme tokens
 */
export interface BrandTokens {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
}

/**
 * Feedback color tokens
 */
export interface FeedbackTokens {
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * Neutral color scale
 */
export interface NeutralTokens {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

/**
 * Animation timing tokens
 */
export interface AnimationTokens {
  fast: string;
  medium: string;
  slow: string;
}

/**
 * Border radius tokens
 */
export interface RadiusTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  round: string;
}

/**
 * Spacing tokens
 */
export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

/**
 * Typography tokens
 */
export interface TypographyTokens {
  fontFamily: {
    body: string;
    display: string;
    mono: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    bold: number;
  };
}

/**
 * Z-index scale
 */
export interface ZIndexTokens {
  header: number;
  modal: number;
  tooltip: number;
}

/**
 * Theme tokens
 */
export interface ThemeTokens {
  brand: BrandTokens;
  feedback: FeedbackTokens;
  neutral: NeutralTokens;
  animation: AnimationTokens;
  radius: RadiusTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  zIndex: ZIndexTokens;
}

/**
 * Extend the MUI Joy ThemeOptions interface
 */
declare module '@mui/joy/styles' {
  interface ThemeOptions {
    tokens?: Partial<ThemeTokens>;
  }
}