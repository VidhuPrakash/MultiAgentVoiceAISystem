export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p
      className="mt-1.5 text-[11px]"
      style={{ color: "var(--danger)", fontFamily: "var(--font-mono)" }}
    >
      {msg}
    </p>
  );
}
