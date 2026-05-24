export function Avatar({
  name,
  phone,
  size = "sm",
}: {
  name?: string;
  phone?: string;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? "w-12 h-12 text-base" : "w-8 h-8 text-xs";
  function initials(name?: string, phone?: string): string {
    if (name) {
      const parts = name.trim().split(" ");
      return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
    }
    if (phone) return phone.slice(-2);
    return "??";
  }
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-semibold shrink-0`}
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--accent-raw) 30%, transparent), color-mix(in srgb, var(--accent-glow) 20%, transparent))",
        border:
          "1px solid color-mix(in srgb, var(--accent-raw) 30%, transparent)",
        color: "var(--accent-raw)",
      }}
    >
      {initials(name, phone)}
    </div>
  );
}
