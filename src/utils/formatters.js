/**
 * @file formatters.js
 * @description Formatierungshelper für Datum/Zeit Darstellung in der UI.
 */

const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short"
});

/**
 * Formatiert einen ISO-String (z. B. `2024-05-01T18:30:00Z`) in ein lokalisiertes
 * Datum/Zeit-Muster.
 *
 * @param {string} isoString
 * @returns {string} Menschlich lesbarer Zeitstempel oder leerer String bei Fehlern.
 */
export const formatDateTime = (isoString) => {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return dateTimeFormatter.format(date);
};
