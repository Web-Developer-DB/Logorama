/**
 * @file DataSafetyPanel.jsx
 * @description UI-Baustein für Export- und Importaktionen. Bindet einen
 * versteckten Dateiupload ein, damit Nutzende JSON-Backups auswählen können.
 */

import { memo, useRef } from "react";

/**
 * Kompakte Sicherungszentrale für Export & Import.
 * Die eigentliche Logik wird von der aufrufenden Komponente (App) via Props geliefert.
 *
 * @param {Object} props React-Props.
 * @param {() => void} props.onExport Löst den JSON-Export aus.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.onImportFile
 *        Verarbeitet eine ausgewählte JSON-Datei.
 * @param {boolean} props.disableExport Deaktiviert den Export-Button, wenn keine Daten vorliegen.
 * @returns {JSX.Element} Panel mit Aktionsknöpfen und Dateiupload.
 */
const DataSafetyPanel = ({
  onExport,
  onImportFile,
  disableExport
}) => {
  const fileInputRef = useRef(null);

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    onImportFile?.(event);
    // Input zurücksetzen, damit derselbe Dateiname erneut gewählt werden kann.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="panel data-safety-panel">
      <header className="panel-heading">
        <h2 className="panel-title">Daten sichern &amp; wiederherstellen</h2>
        <p className="panel-subtitle">
          Exportiere deine Einträge als JSON oder spiele vorhandene Sicherungen wieder ein.
        </p>
      </header>
      <p>
        Lade eine Sicherung deiner Einträge herunter oder spiele sie bei Bedarf wieder ein. So kannst
        du Inhalte jederzeit retten – auch wenn etwas versehentlich gelöscht wurde.
      </p>
      <div className="actions">
        <button type="button" className="primary" onClick={onExport} disabled={disableExport}>
          Daten sichern (Upload)
        </button>
        <button type="button" className="secondary" onClick={handleRestoreClick}>
          Daten wiederherstellen (Download)
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="visually-hidden"
      />
      <p className="data-safety-panel__hint">
        Tipp: Lege dir regelmäßige lokale Sicherungen an, damit du Änderungen rückgängig machen oder
        auf andere Geräte übertragen kannst.
      </p>
    </section>
  );
};

export default memo(DataSafetyPanel);
