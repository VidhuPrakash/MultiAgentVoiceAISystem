export function PagBtn({
  children,
  onClick,
  disabled = false,
  active = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
        ${
          active
            ? "bg-[var(--accent-raw)] text-white shadow-[0_0_12px_var(--accent-glow)]"
            : "border border-[var(--border-raw)] text-[var(--text-2)] hover:text-[var(--text)] hover:border-[var(--accent-raw)] hover:bg-[var(--accent-raw)]/5"
        }
        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[var(--border-raw)] disabled:hover:bg-transparent disabled:hover:text-[var(--text-2)]
      `}
    >
      {children}
    </button>
  );
}
