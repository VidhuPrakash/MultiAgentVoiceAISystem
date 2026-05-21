export function CardHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12px",
        flexShrink: 0,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "10px",
          fontWeight: 600,
          color: "var(--text-2)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontFamily: "var(--font-sans)",
        }}
      >
        {title}
      </p>
      {action}
    </div>
  );
}
