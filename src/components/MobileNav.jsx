/**
 * @file MobileNav.jsx
 * @description Kompakte Hauptnavigation für kleinere Displays. Nutzt dieselbe
 * Datenquelle wie die Desktop-Variante, rendert jedoch Touch-optimierte Buttons.
 */

import { memo, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { buildNavItems } from "../utils/navItems.jsx";

/**
 * Mobile Variante der Hauptnavigation mit Icons und Badges.
 *
 * @param {Object} props React-Props.
 * @param {{ totalEntries?: number, trashEntryCount?: number }} props.stats
 *        Summen, die optional als Badges angezeigt werden.
 * @returns {JSX.Element} Navigationsleiste für mobile Geräte.
 */
const MobileNav = ({ stats }) => {
  const { totalEntries = 0, trashEntryCount = 0 } = stats ?? {};

  /**
   * Reduziert Re-Renders, indem die Navigationspunkte nur bei Stat-Änderungen neu berechnet werden.
   */
  const navItems = useMemo(
    () => buildNavItems({ totalEntries, trashEntryCount }),
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
      </ul>
    </nav>
  );
};

export default memo(MobileNav);
