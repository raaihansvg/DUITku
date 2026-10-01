export type Theme = 'light' | 'dark'

export const THEME_COOKIE = 'duitku_theme'
export const THEME_MAX_AGE = 60 * 60 * 24 * 365 // 1 tahun

/**
 * Validasi nilai cookie tema. Mengembalikan 'light' jika nilai tidak valid.
 */
export function parseTheme(value: string | undefined): Theme {
  if (value === 'dark') return 'dark'
  return 'light'
}
