import { memo, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { buildNavItems } from "../utils/navItems.jsx";

const DesktopNav = ({ stats }) => {
  const { totalEntries = 0, trashEntryCount = 0 } = stats ?? {};

  const navItems = useMemo(
    () => buildNavItems({ totalEntries, trashEntryCount }),
    [totalEntries, trashEntryCount]
  );

  if (!navItems.length) {
    return null;
  }

  return (
    <nav className="desktop-nav" aria-label="Hauptnavigation">
      <ul className="desktop-nav__list">
        {navItems.map((item) => (
          <li key={item.key} className="desktop-nav__item">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `desktop-nav__link${isActive ? " desktop-nav__link--active" : ""}`
              }
            >
              <span className="desktop-nav__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="desktop-nav__label">{item.label}</span>
              {item.badge ? <span className="desktop-nav__badge">{item.badge}</span> : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default memo(DesktopNav);
