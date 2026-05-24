export function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-[var(--border-raw)]">
          {[120, 110, 110, 80, 90, 90, 60].map((w, j) => (
            <td key={j} className="px-4 py-3.5">
              <div
                className="h-4 rounded bg-[var(--surface-2)] animate-pulse"
                style={{ width: w, opacity: 1 - i * 0.12 }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
