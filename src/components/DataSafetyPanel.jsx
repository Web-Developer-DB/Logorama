import { useRef, useState } from "react";

/**
 * Kompakte Sicherungszentrale mit Akkordeon-Mechanik für Export & Import.
 * Die eigentliche Logik wird von der aufrufenden Komponente (App) via Props geliefert.
 */
const DataSafetyPanel = ({ onExport, onImportFile, disableExport }) => {
  const fileInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  const handleFileChange = (event) => {
    onImportFile?.(event);
    // Input zurücksetzen, damit derselbe Dateiname erneut gewählt werden kann.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="card data-safety-card">
      <div className={`accordion ${isOpen ? "open" : ""}`}>
        <button
          type="button"
          className="accordion-toggle"
          onClick={toggleAccordion}
          aria-expanded={isOpen}
        >
          <span>Daten sichern &amp; wiederherstellen</span>
          <span className="accordion-icon">{isOpen ? "^" : "v"}</span>
        </button>

        {isOpen ? (
          <div className="accordion-panel">
            <p>
              Lade eine Sicherung deiner Einträge herunter oder spiele sie bei Bedarf wieder ein.
              So kannst du Inhalte jederzeit retten – auch wenn etwas versehentlich gelöscht wurde.
            </p>
            <div className="actions">
              <button
                type="button"
                className="primary"
                onClick={onExport}
                disabled={disableExport}
              >
                Daten sichern (Download)
              </button>
              <button type="button" className="secondary" onClick={handleRestoreClick}>
                Daten wiederherstellen (Upload)
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </section>
  );
};

export default DataSafetyPanel;
