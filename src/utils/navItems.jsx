const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M3 11.5L12 4l9 7.5M5 10.5V20h5v-4h4v4h5v-9.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PencilIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M15.75 4.75l3.5 3.5m-2-5.5l-8.5 8.5a2 2 0 00-.52.93l-.73 3.07a.5.5 0 00.61.61l3.07-.73a2 2 0 00.93-.52l8.5-8.5a1.5 1.5 0 000-2.12l-1.24-1.24a1.5 1.5 0 00-2.12 0z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ListIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M7 7h12M7 12h12M7 17h12M4 7h.01M4 12h.01M4 17h.01"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M5.5 7h13m-1 0l-.7 11a2 2 0 01-2 1.85H9.2a2 2 0 01-2-1.85L6.5 7m4-3h3a1 1 0 011 1v1h-5V5a1 1 0 011-1z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloudIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M7 18h10a3.5 3.5 0 002.8-5.7A4.5 4.5 0 0013 7.5h-.3A5 5 0 003 12.3 3.5 3.5 0 007 18zm5-5v5m0 0l-2-2m2 2l2-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HelpIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 18h.01M11.1 9a1.9 1.9 0 113.8 0c0 1.9-1.9 1.9-1.9 3.8M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NAV_CONFIG = [
  {
    key: "home",
    label: "Home",
    to: "/home",
    Icon: HomeIcon,
    end: true
  },
  {
    key: "new-entry",
    label: "Neu",
    to: "/new",
    Icon: PencilIcon,
    end: true
  },
  {
    key: "entries",
    label: "Einträge",
    to: "/entries",
    Icon: ListIcon,
    end: true,
    badgeKey: "totalEntries"
  },
  {
    key: "trash",
    label: "Papierkorb",
    to: "/trash",
    Icon: TrashIcon,
    end: true,
    badgeKey: "trashEntryCount"
  },
  {
    key: "backup",
    label: "Backup",
    to: "/backup",
    Icon: CloudIcon,
    end: true
  },
  {
    key: "help",
    label: "Hilfe",
    to: "/help",
    Icon: HelpIcon,
    end: true
  }
];

const resolveBadge = (badgeKey, stats = {}) => {
  if (!badgeKey) {
    return null;
  }
  const value = stats[badgeKey];
  if (typeof value !== "number" || value <= 0) {
    return null;
  }
  return value;
};

export const buildNavItems = (stats = {}) =>
  NAV_CONFIG.map(({ Icon, badgeKey, ...item }) => ({
    ...item,
    icon: <Icon />,
    badge: resolveBadge(badgeKey, stats)
  }));
