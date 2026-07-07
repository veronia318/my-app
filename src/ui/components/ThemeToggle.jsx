import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../application/theme/ThemeContext";

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="theme-toggle__icon theme-toggle__icon--sun">
        <Sun size={13} />
      </span>
      <span className="theme-toggle__icon theme-toggle__icon--moon">
        <Moon size={13} />
      </span>
      <span
        className={`theme-toggle__thumb ${isDark ? "theme-toggle__thumb--dark" : ""}`}
      >
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  );
}

export default ThemeToggle;
