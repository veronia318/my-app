import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(undefined);

const STORAGE_KEY = "energysaver-theme";
const VALID_THEMES = ["light", "dark"];

// Reads the user's last-chosen theme from localStorage. If nothing was
// saved yet, fall back to the visitor's OS-level preference, and default
// to "dark" (the app's original look) if that isn't available either.
function getInitialTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (VALID_THEMES.includes(stored)) return stored;
  } catch (err) {
    // localStorage may be unavailable (e.g. privacy mode) — ignore.
  }

  try {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }
  } catch (err) {
    // matchMedia unavailable — ignore.
  }

  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply the theme to the document root so every component's CSS
  // (which reads variables from :root / :root[data-theme="light"])
  // updates instantly, and persist the user's choice.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      // Ignore write failures — theme still works for this session.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      isLight: theme === "light",
      setTheme,
      toggleTheme,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
