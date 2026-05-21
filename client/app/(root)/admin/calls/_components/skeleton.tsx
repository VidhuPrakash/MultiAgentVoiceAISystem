export function SkeletonRow() {
  return (
    <tr className="border-b border-[var(--border-raw)] animate-pulse">
      {/* Call ID */}
      <td className="px-4 py-3">
        <div className="h-5 w-24 rounded bg-[var(--surface-3)]" />
      </td>
      {/* User */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[var(--surface-3)]" />
          <div className="space-y-1">
            <div className="h-3.5 w-28 rounded bg-[var(--surface-3)]" />
            <div className="h-3 w-36 rounded bg-[var(--surface-3)]" />
          </div>
        </div>
      </td>
      {/* Agent */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className="h-3.5 w-24 rounded bg-[var(--surface-3)]" />
          <div className="h-5 w-20 rounded bg-[var(--surface-3)]" />
        </div>
      </td>
      {/* Status */}
      <td className="px-4 py-3">
        <div className="h-5 w-20 rounded-full bg-[var(--surface-3)]" />
      </td>
      {/* Duration */}
      <td className="px-4 py-3">
        <div className="h-4 w-14 rounded bg-[var(--surface-3)]" />
      </td>
      {/* Started */}
      <td className="px-4 py-3">
        <div className="h-4 w-24 rounded bg-[var(--surface-3)]" />
      </td>
      {/* Actions */}
      <td className="px-4 py-3">
        <div className="h-7 w-7 rounded bg-[var(--surface-3)]" />
      </td>
    </tr>
  );
}
