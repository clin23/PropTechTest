interface EvidenceLinkProps {
  href: string;
  fileName?: string | null;
  className?: string;
}

export default function EvidenceLink({
  href,
  fileName,
  className,
}: EvidenceLinkProps) {
  const accessibleLabel = fileName
    ? `View invoice ${fileName}`
    : "View invoice";
  const classes = [
    "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
    "text-blue-600 hover:text-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
    "dark:text-blue-300 dark:hover:text-blue-200",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      aria-label={accessibleLabel}
      title={fileName ?? "View invoice"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M11.03 2.47a1.75 1.75 0 0 1 2.475 0l3.525 3.525a1.75 1.75 0 0 1 0 2.475l-7.4 7.4a1.75 1.75 0 0 1-.991.497l-3.748.536a.75.75 0 0 1-.848-.848l.536-3.748a1.75 1.75 0 0 1 .497-.991l7.4-7.4Zm2.121 1.414a.25.25 0 0 0-.354 0L9.67 7.01l3.323 3.323 3.127-3.127a.25.25 0 0 0 0-.354l-3.97-3.97Z" />
        <path d="M6.147 12.419a.25.25 0 0 0-.071.142l-.389 2.72 2.72-.389a.25.25 0 0 0 .142-.071l3.286-3.286-3.323-3.323-2.365 2.365a.25.25 0 0 0 0 .354l-.046.046a.25.25 0 0 0 .046.442Z" />
      </svg>
      <span className="sr-only">{accessibleLabel}</span>
    </a>
  );
}
