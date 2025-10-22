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
  ...props
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  return (
    <button
      type="button"
      {...props}
      className={composedClassName}
      onClick={handleClick}
    >
      {isConfirming ? confirmLabel : initialLabel}
    </button>
  );
};

export default ConfirmButton;
