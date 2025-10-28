import { useEffect, useRef, useState } from "react";

/**
 * Button mit zweistufiger Bestätigung: erster Klick aktiviert den Warnzustand,
 * zweiter Klick innerhalb des Zeitfensters führt die Aktion aus.
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
