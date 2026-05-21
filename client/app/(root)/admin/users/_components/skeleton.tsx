export function SkeletonRow() {
  return (
    <tr className="border-b border-[var(--border-raw)]">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded bg-[var(--surface-3)] animate-pulse"
            style={{ width: `${50 + ((i * 13) % 40)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}
