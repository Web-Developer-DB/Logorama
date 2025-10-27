import { memo, useMemo } from "react";
import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M3 11.5L12 4l9 7.5M5 10.5V20h5v-4h4v4h5v-9.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PencilIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M15.75 4.75l3.5 3.5m-2-5.5l-8.5 8.5a2 2 0 00-.52.93l-.73 3.07a.5.5 0 00.61.61l3.07-.73a2 2 0 00.93-.52l8.5-8.5a1.5 1.5 0 000-2.12l-1.24-1.24a1.5 1.5 0 00-2.12 0z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ListIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M7 7h12M7 12h12M7 17h12M4 7h.01M4 12h.01M4 17h.01"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M5.5 7h13m-1 0l-.7 11a2 2 0 01-2 1.85H9.2a2 2 0 01-2-1.85L6.5 7m4-3h3a1 1 0 011 1v1h-5V5a1 1 0 011-1z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloudIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M7 18h10a3.5 3.5 0 002.8-5.7A4.5 4.5 0 0013 7.5h-.3A5 5 0 003 12.3 3.5 3.5 0 007 18zm5-5v5m0 0l-2-2m2 2l2-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MobileNav = ({ stats, theme, onToggleTheme }) => {
  const { totalEntries = 0, trashEntryCount = 0 } = stats ?? {};

  const navItems = useMemo(
    () => [
      {
        key: "home",
        label: "Home",
        to: "/home",
        icon: <HomeIcon />,
        end: true
      },
      {
        key: "entries",
        label: "Einträge",
        to: "/entries",
        icon: <ListIcon />,
        badge: totalEntries > 0 ? totalEntries : null,
        end: true
      },
      {
        key: "new-entry",
        label: "Neu",
        to: "/new",
        icon: <PencilIcon />,
        end: true
      },
      {
        key: "trash",
        label: "Papierkorb",
        to: "/trash",
        icon: <TrashIcon />,
        badge: trashEntryCount > 0 ? trashEntryCount : null,
        end: true
      },
      {
        key: "backup",
        label: "Backup",
        to: "/backup",
        icon: <CloudIcon />,
        end: true
      }
    ],
    [totalEntries, trashEntryCount]
  );

  return (
    <nav className="mobile-nav" aria-label="Bereiche">
      <ul className="mobile-nav__list">
        {navItems.map((item) => (
          <li key={item.key} className="mobile-nav__item">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `mobile-nav__link${isActive ? " mobile-nav__link--active" : ""}`
              }
            >
              <span className="mobile-nav__icon">{item.icon}</span>
              <span className="mobile-nav__label">{item.label}</span>
              {item.badge ? <span className="mobile-nav__badge">{item.badge}</span> : null}
            </NavLink>
          </li>
        ))}
        <li className="mobile-nav__item">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="nav" />
        </li>
      </ul>
    </nav>
  );
};

export default memo(MobileNav);
