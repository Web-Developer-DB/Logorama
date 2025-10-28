import { useCallback, useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import DesktopNav from "./components/DesktopNav.jsx";
import MobileNav from "./components/MobileNav.jsx";
import HomePage from "./components/pages/HomePage.jsx";
import EntriesPage from "./components/pages/EntriesPage.jsx";
import NewEntryPage from "./components/pages/NewEntryPage.jsx";
import TrashPage from "./components/pages/TrashPage.jsx";
import BackupPage from "./components/pages/BackupPage.jsx";
import HelpPage from "./components/pages/HelpPage.jsx";
import { formatDateTime } from "./utils/formatters.js";
import useThemeManager from "./hooks/useThemeManager.js";
import useEntriesManager from "./hooks/useEntriesManager.js";
import useInstallPrompt from "./hooks/useInstallPrompt.js";
import useGoogleDriveSync from "./hooks/useGoogleDriveSync.js";

/**
 * Root-Komponente der Anwendung. Koordiniert globale Hooks, Routings und
 * reicht Daten/Handler an Seitenkomponenten weiter, damit diese schlank bleiben.
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
    applyImportedEntries,
    resetQueryState
  } = useEntriesManager();
  const { installPromptEvent, promptInstall } = useInstallPrompt();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== "/entries") {
      resetQueryState();
    }
  }, [location.pathname, resetQueryState]);

  const {
    driveSyncEnabled,
    toggleDriveSync,
    driveStatus,
    driveLastSync,
    driveError,
    syncNow: triggerDriveSync,
    restoreFromDrive,
    STATUS: DRIVE_STATUS
  } = useGoogleDriveSync({
    entries,
    onImportEntries: applyImportedEntries
  });

  const isDriveSyncing = driveStatus === DRIVE_STATUS.SYNCING;
  const isHelpRoute = location.pathname === "/help";

  /**
   * Reicht den Formular-Submit weiter und navigiert nur bei erfolgreichem Speichern.
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
        <DesktopNav
          stats={{
            totalEntries,
            todayCount,
            weekCount,
            trashEntryCount
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route
            path="/home"
            element={
              <HomePage
                stats={{
                  totalEntries,
                  todayCount,
                  weekCount,
                  trashEntryCount
                }}
                latestEntries={latestEntries}
                onDeleteEntry={handleDelete}
                onUpdateEntry={handleUpdate}
                themeMode={themeMode}
                resolvedTheme={resolvedTheme}
                onToggleTheme={cycleThemeMode}
                onInstallApp={promptInstall}
                canInstall={Boolean(installPromptEvent)}
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
                driveSyncEnabled={driveSyncEnabled}
                onToggleDriveSync={toggleDriveSync}
                driveStatus={driveStatus}
                driveLastSync={driveLastSync}
                driveError={driveError}
                onDriveSync={triggerDriveSync}
                onDriveRestore={restoreFromDrive}
                driveIsSyncing={isDriveSyncing}
              />
            }
          />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
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
      <MobileNav
        stats={{
          totalEntries,
          todayCount,
          weekCount,
          trashEntryCount
        }}
      />
    </>
  );
};

export default App;
