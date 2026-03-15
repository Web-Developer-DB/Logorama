/**
 * @file DesktopNav.jsx
 * @description Hauptnavigation für große Viewports. Hebt aktive Route hervor
 * und zeigt Badges mit Anzahl der Einträge bzw. Papierkorbeinträge.
 */

import { memo, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { buildNavItems } from "../utils/navItems.jsx";

/**
 * Desktop-Navigationsleiste mit Badge-Zählern für einzelne Bereiche.
 * Berechnet die sichtbaren Einträge über die navItems-Utility.
 *
 * @param {Object} props React-Props.
 * @param {{ totalEntries?: number, trashEntryCount?: number }} props.stats
 *        Aggregierte Statistiken für Badges.
 * @returns {JSX.Element|null} Navigationsliste oder `null`, wenn keine Items existieren.
 */
const DesktopNav = ({ stats }) => {
  const { totalEntries = 0, todayCount = 0, weekCount = 0, trashEntryCount = 0 } = stats ?? {};

  /**
   * Erzeugt das Navigationsmodell nur neu, wenn sich relevante Statistiken ändern.
   */
  const navItems = useMemo(
    () => buildNavItems({ totalEntries, trashEntryCount }),
    [totalEntries, trashEntryCount]
  );

  if (!navItems.length) {
    return null;
  }

  return (
    <nav className="desktop-nav" aria-label="Hauptnavigation">
      <div className="desktop-nav__section">
        <p className="desktop-nav__eyebrow">Bereiche</p>
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
      </div>
      <section className="desktop-nav__summary" aria-labelledby="desktop-nav-summary-title">
        <p id="desktop-nav-summary-title" className="desktop-nav__summary-title">
          Im Fokus
        </p>
        <dl className="desktop-nav__summary-list">
          <div className="desktop-nav__summary-item">
            <dt>Heute</dt>
            <dd>{todayCount}</dd>
          </div>
          <div className="desktop-nav__summary-item">
            <dt>Woche</dt>
            <dd>{weekCount}</dd>
          </div>
        </dl>
        <p className="desktop-nav__summary-copy">
          Schneller Zugriff auf alle Bereiche, ohne den eigentlichen Arbeitsbereich zu überladen.
        </p>
      </section>
    </nav>
  );
};

export default memo(DesktopNav);
