import { memo } from "react";

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 5V3m0 18v-2m7-7h2M3 12h2m12.95-5.95l1.414-1.414M6.636 17.364 5.222 18.778m12.728 0-1.414-1.414M6.636 6.636 5.222 5.222M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M21 12.79A9 9 0 0 1 11.21 3a7 7 0 1 0 9.79 9.79z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SystemIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M4 4h16v12H4zM2 20h20M9 20v-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThemeToggle = ({ mode, resolvedTheme, onToggle, variant = "hero" }) => {
  const isSystem = mode === "system";
  const isDark = resolvedTheme === "dark";
  const icon = isSystem ? <SystemIcon /> : isDark ? <MoonIcon /> : <SunIcon />;
  const modeLabel = isSystem ? "Systemmodus" : isDark ? "Dunkelmodus" : "Lichtmodus";
  const heroAriaLabel = `Theme-Modus wechseln (aktuell ${modeLabel})`;

  if (variant === "nav") {
    const navLabel = isSystem ? "Auto" : isDark ? "Dunkel" : "Hell";
    return (
      <button
        type="button"
        className="mobile-nav__link mobile-nav__link--button"
        onClick={onToggle}
        aria-label={`Theme-Modus wechseln (aktuell ${navLabel})`}
      >
        <span className="mobile-nav__icon">{icon}</span>
        <span className="mobile-nav__label">{navLabel}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="ghost theme-toggle"
      onClick={onToggle}
      aria-label={heroAriaLabel}
    >
      <span className="theme-toggle__icon">{icon}</span>
      <span className="theme-toggle__label">{modeLabel}</span>
    </button>
  );
};

export default memo(ThemeToggle);
