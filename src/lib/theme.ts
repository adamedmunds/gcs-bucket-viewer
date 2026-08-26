import { useCallback, useEffect, useState } from "react"

export type Theme = "dark" | "light"

const KEY = "gcs-viewer-theme"

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === "dark" || v === "light" ? v : null
  } catch {
    return null
  }
}

/** Dark by default: this is a tool that sits open next to a terminal. */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => stored() ?? "dark")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // Private windows and blocked site data: the choice just does not persist.
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), [])
  return [theme, toggle]
}
