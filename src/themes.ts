/**
 * Theme catalog.
 *
 * The scaffold ships two placeholder themes: `slate` (dark default, defined
 * in styles.css) and `paper` (light example, defined in themes.css). They
 * are scaffolding, not a design — give the app its own theme before first
 * deploy:
 *   1. Add a `[data-theme="my-id"] { ... }` block in src/themes.css with
 *      the shadcn token overrides (include `color-scheme: light;` for
 *      light themes).
 *   2. Add an entry here for type safety, autocomplete, and UI display.
 *   3. Add the theme's background to the first-paint <style> block in
 *      index.html so the pre-CSS frame matches (no white flash).
 *   4. Switch via `data-theme` on <html> in index.html.
 *
 * Color values live in styles.css / themes.css — this file is metadata only.
 */

export const THEMES = [
  {
    id: 'meetup',
    label: 'Meetup',
    description: 'The app theme: white page with purple buttons and links.',
  },
  {
    id: 'meetup-dark',
    label: 'Meetup dark',
    description: 'Dark version of the app theme, chosen with the header toggle.',
  },
  {
    id: 'slate',
    label: 'Slate',
    description: 'Neutral dark placeholder default. Replace with your own theme.',
  },
  {
    id: 'paper',
    label: 'Paper',
    description: 'Light example theme showing the token contract. Replace or delete.',
  },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

/** Read the currently active theme id from <html data-theme>. */
export function getActiveTheme(): ThemeId {
  if (typeof document === 'undefined') return 'slate'
  const id = document.documentElement.getAttribute('data-theme') as ThemeId | null
  return id ?? 'slate'
}

/**
 * Light/dark toggle. Light ('meetup') is the default; picking dark is
 * remembered in this browser. index.html reads the same key before the page
 * paints, so a dark-mode visitor never sees a light flash.
 */
export const LIGHT_THEME = 'meetup'
export const DARK_THEME = 'meetup-dark'
const THEME_KEY = 'theme'

export function isDarkTheme(): boolean {
  return getActiveTheme() === DARK_THEME
}

export function setDarkTheme(dark: boolean): void {
  document.documentElement.setAttribute('data-theme', dark ? DARK_THEME : LIGHT_THEME)
  try {
    if (dark) localStorage.setItem(THEME_KEY, 'dark')
    else localStorage.removeItem(THEME_KEY)
  } catch {
    // Storage can be blocked (private mode); the toggle still works for this visit.
  }
}

/** Look up a theme entry by id, or fall back to the first theme. */
export function getTheme(id: string) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
