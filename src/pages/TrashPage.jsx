/**
 * @file TrashPage.jsx
 * @description Route für den Papierkorb. Nutzt `TrashSection`, behält aber die
 * Handler-Benennungen der App bei, um Prop-Weitergaben übersichtlich zu halten.
 */

import TrashSection from "../components/TrashSection.jsx";

/**
 * Präsentationskomponente für den Papierkorb-Tab. Sie delegiert sämtliche
 * Aktionen an Props und kann so unkompliziert getestet werden.
 *
 * @param {Object} props React-Props.
 * @param {Array} props.entries Papierkorb-Einträge einschließlich Zeitstempel.
 * @param {(id: string) => void} props.onRestoreEntry Stellt einen Eintrag wieder her.
 * @param {(id: string) => void} props.onDeleteForever Entfernt den Eintrag dauerhaft.
 * @param {() => void} props.onEmptyTrash Entfernt alle Einträge mit Nutzerbestätigung.
 * @param {(isoString: string) => string} props.formatDateTime Formatiert Datum in menschenlesbare Form.
 * @returns {JSX.Element} Panel-Wrapper für den Papierkorb.
 */
const TrashPage = ({
  entries,
  onRestoreEntry,
  onDeleteForever,
  onEmptyTrash,
  formatDateTime
}) => (
  <TrashSection
    entries={entries}
    onRestore={onRestoreEntry}
    onDeleteForever={onDeleteForever}
    onEmptyTrash={onEmptyTrash}
    formatDateTime={formatDateTime}
  />
);

export default TrashPage;
