export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-[var(--foreground)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
    >
      Skip to main content
    </a>
  );
}
