/**
 * @file App.jsx
 * @description Verantwortet die App-Shell der Logorama-PWA. Bindet Routing,
 * globale Manager-Hooks und Navigation ein, sodass untergeordnete
 * Seitenkomponenten schlank und fokussiert bleiben.
 */

import { useCallback, useEffect } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import DesktopNav from "./components/DesktopNav.jsx";
import MobileNav from "./components/MobileNav.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import HomePage from "./pages/HomePage.jsx";
import EntriesPage from "./pages/EntriesPage.jsx";
import NewEntryPage from "./pages/NewEntryPage.jsx";
import TrashPage from "./pages/TrashPage.jsx";
import BackupPage from "./pages/BackupPage.jsx";
import HelpPage from "./pages/HelpPage.jsx";
import { formatDateTime } from "./utils/formatters.js";
import useThemeManager from "./hooks/useThemeManager.js";
import useEntriesManager from "./hooks/useEntriesManager.js";
import useInstallPrompt from "./hooks/useInstallPrompt.js";

/**
 * Root-Komponente der Anwendung. Stellt Navigationsleisten und alle
 * Seitenrouten bereit, delegiert dabei sämtliche Daten- und Eventflüsse an die
 * spezialisierten Hooks.
 *
 * @returns {JSX.Element} Gerenderte App-Shell mit Routen und Navigation.
 *
 * @example
 * ```jsx
 * import { createRoot } from "react-dom/client";
 * import App from "./App.jsx";
 *
 * createRoot(document.getElementById("root")).render(<App />);
 * ```
 */
const App = () => {
  const { themeMode, resolvedTheme, cycleThemeMode } = useThemeManager();
  const {
    entries,
    latestEntries,
    filteredEntries,
    sortedTrashEntries,
    trashEntryCount,
    totalEntries,
    todayCount,
    weekCount,
    formState,
    search,
    filter,
    handleInputChange,
    handleSubmit,
    handleDelete,
    handleUpdate,
    handleRestore,
    handleDeleteForever,
    handleEmptyTrash,
    handleSearchChange,
    handleFilterChange,
    handleExport,
    handleImportFile,
    resetQueryState
  } = useEntriesManager();
  const { installPromptEvent, promptInstall } = useInstallPrompt();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Beim Verlassen der Verwaltungsseite Suche und Filter zurücksetzen,
    // damit Nutzer:innen bei der Rückkehr eine frische, ungefilterte Liste sehen.
    if (location.pathname !== "/entries") {
      resetQueryState();
    }
  }, [location.pathname, resetQueryState]);

  const isHelpRoute = location.pathname === "/help";
  const sharedStats = {
    totalEntries,
    todayCount,
    weekCount,
    trashEntryCount
  };

  /**
   * Reicht den Formular-Submit weiter und navigiert nur bei erfolgreicher
   * Speicherung auf die Übersicht. Fehlerhafte Eingaben verbleiben auf der
   * Seite, damit Nutzende sie sofort korrigieren können.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Native Submit-Event.
   */
  const handleCreateEntry = useCallback(
    (event) => {
      const didCreate = handleSubmit(event);
      if (didCreate) {
        navigate("/entries");
      }
    },
    [handleSubmit, navigate]
  );

  return (
    <>
      <main className={`app-shell${isHelpRoute ? " app-shell--has-footer" : ""}`}>
        <DesktopNav stats={sharedStats} />
        <div className="app-shell__content">
          <header className="app-topbar">
            <div className="app-topbar__brand">
              <span className="app-topbar__eyebrow">Offline-first Journal</span>
              <div className="app-topbar__brand-row">
                <Link to="/home" className="app-topbar__title">
                  Logorama
                </Link>
                <div className="app-topbar__pills" aria-label="App-Status">
                  <span className="app-topbar__pill">PWA bereit</span>
                  <span className="app-topbar__pill">{totalEntries} aktiv</span>
                  {trashEntryCount ? (
                    <span className="app-topbar__pill">{trashEntryCount} im Papierkorb</span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="app-topbar__actions">
              <ThemeToggle
                mode={themeMode}
                resolvedTheme={resolvedTheme}
                onToggle={cycleThemeMode}
              />
              {installPromptEvent ? (
                <button type="button" className="ghost" onClick={promptInstall}>
                  App installieren
                </button>
              ) : null}
              <Link to="/new" className="primary">
                Neuer Eintrag
              </Link>
            </div>
          </header>
          <div className="app-canvas">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route
                path="/home"
                element={
                  <HomePage
                    stats={sharedStats}
                    latestEntries={latestEntries}
                    onDeleteEntry={handleDelete}
                    onUpdateEntry={handleUpdate}
                  />
                }
              />
              <Route
                path="/entries"
                element={
                  <EntriesPage
                    entries={filteredEntries}
                    searchValue={search}
                    onSearchChange={handleSearchChange}
                    filterValue={filter}
                    onFilterChange={handleFilterChange}
                    onDeleteEntry={handleDelete}
                    onUpdateEntry={handleUpdate}
                  />
                }
              />
              <Route
                path="/new"
                element={
                  <NewEntryPage
                    formState={formState}
                    onInputChange={handleInputChange}
                    onSubmit={handleCreateEntry}
                  />
                }
              />
              <Route
                path="/trash"
                element={
                  <TrashPage
                    entries={sortedTrashEntries}
                    onRestoreEntry={handleRestore}
                    onDeleteForever={handleDeleteForever}
                    onEmptyTrash={handleEmptyTrash}
                    formatDateTime={formatDateTime}
                  />
                }
              />
              <Route
                path="/backup"
                element={
                  <BackupPage
                    onExport={handleExport}
                    onImportFile={handleImportFile}
                    disableExport={!entries.length}
                  />
                }
              />
              <Route path="/help" element={<HelpPage />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </div>
      </main>
      {isHelpRoute ? (
        <>
          <footer className="app-footer">
            <div className="app-footer__inner">
              <span>MIT License · Created by Dimitri B</span>
              <a
                href="https://github.com/Web-Developer-DB/Logorama"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source Code auf GitHub
              </a>
            </div>
          </footer>
          <div className="app-footer__spacer" />
        </>
      ) : null}
      <MobileNav stats={sharedStats} />
    </>
  );
};

export default App;
