import { Easing } from 'react-native-reanimated'

/**
 * The same palette as the web app, expressed as plain values. Both themes are
 * designed, not inverted — dark is warm charcoal with warmed type, never black.
 */
export type Palette = {
  canvas: string
  surface: string
  raised: string
  ink: string
  muted: string
  faint: string
  line: string
  ember: string
  moss: string
  amber: string
  iris: string
  onInk: string
  scrim: string
  shadow: string
}

export const LIGHT: Palette = {
  canvas: '#F6F3EC',
  surface: '#FDFBF7',
  raised: '#FFFFFF',
  ink: '#181512',
  muted: '#6C6459',
  faint: '#9C9386',
  line: '#E4DDD1',
  ember: '#D14A28',
  moss: '#2F7D6B',
  amber: '#BE8A20',
  iris: '#5A54C4',
  onInk: '#F6F3EC',
  scrim: 'rgba(20,16,12,0.45)',
  shadow: '#3D2E1C',
}

export const DARK: Palette = {
  canvas: '#0F0E0D',
  surface: '#181615',
  raised: '#201D1B',
  ink: '#F1ECE4',
  muted: '#9E9589',
  faint: '#766E64',
  line: '#2E2A27',
  ember: '#E86C48',
  moss: '#5AB29B',
  amber: '#E2B04C',
  iris: '#8F89F0',
  onInk: '#0F0E0D',
  scrim: 'rgba(0,0,0,0.6)',
  shadow: '#000000',
}

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 30 } as const

export const RADIUS = { sm: 10, md: 14, lg: 18, xl: 26, pill: 999 } as const

/**
 * Fraunces and Newsreader are loaded at startup; the fallbacks are the platform
 * serif and sans so the app is legible on the very first frame.
 */
export const FONT = {
  display: 'Fraunces_600SemiBold',
  displayFallback: 'serif',
  read: 'Newsreader_400Regular',
  readFallback: 'serif',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
} as const

export const TIMING = { fast: 160, base: 260, slow: 420 } as const

/**
 * One motion vocabulary, and it is all timing rather than springs. A spring that
 * is not critically damped overshoots, and that overshoot reads as a wobble when
 * a column of cards or a tab indicator settles.
 */
export const CURVE = Easing.bezier(0.22, 1, 0.36, 1)

/** Press feedback: barely registered. */
export const T_FAST = { duration: 130, easing: CURVE } as const
/** Tabs, toggles, toasts — the default. */
export const T_BASE = { duration: 260, easing: CURVE } as const
/** Sheets, the reader morph, anything crossing distance. */
export const T_SLOW = { duration: 340, easing: CURVE } as const
