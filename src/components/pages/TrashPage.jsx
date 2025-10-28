import TrashSection from "../TrashSection.jsx";

/**
 * Präsentationskomponente für den Papierkorb-Tab. Sie delegiert sämtliche
 * Aktionen an Props und kann so unkompliziert getestet werden.
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
