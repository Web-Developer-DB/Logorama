const iconProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  focusable: "false"
};

export const PencilIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path
      d="M15.75 4.75l3.5 3.5m-2-5.5l-8.5 8.5a2 2 0 00-.52.93l-.73 3.07a.5.5 0 00.61.61l3.07-.73a2 2 0 00.93-.52l8.5-8.5a1.5 1.5 0 000-2.12l-1.24-1.24a1.5 1.5 0 00-2.12 0z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CheckIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path
      d="M5.5 12.5l4 4 9-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TrashIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path
      d="M5.5 7h13m-1 0l-.7 11a2 2 0 01-2 1.85H9.2a2 2 0 01-2-1.85L6.5 7m4-3h3a1 1 0 011 1v1h-5V5a1 1 0 011-1z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const RestoreIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path
      d="M6 12h6a4 4 0 014 4m-4-8L6 12l6 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
