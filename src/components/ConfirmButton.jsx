/**
 * @file ConfirmButton.jsx
 * @description Wiederverwendbarer Button mit zweistufiger Sicherheitsabfrage.
 * Nutzt ein Zeitfenster, in dem die zweite Aktion bestätigt werden muss.
 */

import { useEffect, useRef, useState } from "react";

/**
 * Button mit zweistufiger Bestätigung: erster Klick aktiviert den Warnzustand,
 * zweiter Klick innerhalb des Zeitfensters führt die Aktion aus.
 *
 * @param {Object} props React-Props.
 * @param {string} props.initialLabel Label für den ersten Klick.
 * @param {string} props.confirmLabel Label im Bestätigungszustand.
 * @param {(event: React.MouseEvent<HTMLButtonElement>) => void} props.onConfirm
 *        Callback nach erfolgreicher Zweitbestätigung.
 * @param {number} [props.resetDelay=1200] Zeitspanne in Millisekunden, bis der Button zurückspringt.
 * @param {string} [props.className=""] Basisklasse für den Button.
 * @param {string} [props.confirmClassName=""] Zusatzklasse im Confirm-State.
 * @param {React.ReactNode} [props.initialIcon=null] Optionale Ikone für den Default-Button.
 * @param {React.ReactNode} [props.confirmIcon=null] Ikone im Warnzustand; fällt auf initialIcon zurück.
 * @returns {JSX.Element} Button mit Sicherheitsmechanik.
 */
const ConfirmButton = ({
  initialLabel,
  confirmLabel,
  onConfirm,
  resetDelay = 1200,
  className = "",
  confirmClassName = "",
  initialIcon = null,
  confirmIcon = null,
  ...props
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const timeoutRef = useRef(null);

  /**
   * Räumt den Timer beim Unmount auf, damit keine State-Updates nach dem Entfernen passieren.
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Steuert den Klick-Flow: erster Klick schaltet in den Bestätigungsmodus,
   * zweiter Klick ruft die übergebene onConfirm-Callback auf.
   */
  const handleClick = (event) => {
    if (isConfirming) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsConfirming(false);
      if (onConfirm) {
        onConfirm(event);
      }
      return;
    }

    setIsConfirming(true);
    timeoutRef.current = setTimeout(() => {
      setIsConfirming(false);
      timeoutRef.current = null;
    }, resetDelay);
  };

  const composedClassName = `${className} ${
    isConfirming && confirmClassName ? confirmClassName : ""
  }`.trim();

  const iconToRender = isConfirming ? confirmIcon ?? initialIcon : initialIcon;

  return (
    <button
      type="button"
      {...props}
      className={composedClassName}
      onClick={handleClick}
    >
      {iconToRender ? <span className="button-icon">{iconToRender}</span> : null}
      <span className="button-label">{isConfirming ? confirmLabel : initialLabel}</span>
    </button>
  );
};

export default ConfirmButton;
