/**
 * Sun/moon button in the header that switches between the light (default)
 * and dark themes. The choice is saved in this browser by setDarkTheme.
 */

import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { isDarkTheme, setDarkTheme } from '../themes'

export default function ThemeToggle() {
  const [dark, setDark] = useState(isDarkTheme)

  function toggle() {
    setDarkTheme(!dark)
    setDark(!dark)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
    >
      {dark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  )
}
