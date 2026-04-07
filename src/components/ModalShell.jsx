import { useEffect } from "react";

/**
 * Generischer Dialog-Wrapper für fokussierte Eingaben und sekundäre Workflows.
 *
 * @param {Object} props React-Props.
 * @param {string} props.title Sichtbarer Dialogtitel für Screenreader und UI.
 * @param {string} [props.eyebrow="Schneller Eingabemodus"] Kurze Kontextzeile oberhalb des Titels.
 * @param {() => void} props.onClose Schließt den Dialog.
 * @param {string} [props.dialogClassName] Zusätzliche CSS-Klassen für die Dialoghülle.
 * @param {string} [props.bodyClassName] Zusätzliche CSS-Klassen für den scrollbaren Dialoginhalt.
 * @param {React.ReactNode} props.children Inhalt des Dialogs.
 * @returns {JSX.Element} Zentrierter Modal-Dialog mit Overlay.
 */
const ModalShell = ({
  title,
  eyebrow = "Schneller Eingabemodus",
  onClose,
  dialogClassName = "",
  bodyClassName = "",
  children
}) => {
  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-shell" role="presentation">
      <div className="modal-shell__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className={["modal-shell__dialog", dialogClassName].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-shell-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-shell__header">
          <div>
            <p className="panel-eyebrow">{eyebrow}</p>
            <h2 id="modal-shell-title" className="modal-shell__title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="ghost modal-shell__close"
            onClick={onClose}
            aria-label="Dialog schließen"
          >
            Schließen
          </button>
        </div>
        <div className={["modal-shell__body", bodyClassName].filter(Boolean).join(" ")}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalShell;
