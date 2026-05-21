import { useEffect, useRef, useState } from "react";
import { Range } from "../page";
import { ChevronDown } from "lucide-react";

export function RangeDropdown({
  value,
  onChange,
}: {
  value: Range;
  onChange: (r: Range) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const opts: Range[] = ["daily", "monthly", "yearly"];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "4px 10px 4px 10px",
          background: "var(--surface-2)",
          border: "1px solid var(--border-raw)",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "11px",
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          color: "var(--text-2)",
          textTransform: "capitalize",
          transition: "border-color .15s",
          whiteSpace: "nowrap",
        }}
      >
        {value}
        <ChevronDown
          size={11}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .15s",
          }}
        />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            zIndex: 50,
            background: "var(--surface)",
            border: "1px solid var(--border-raw)",
            borderRadius: "10px",
            padding: "4px",
            minWidth: "100px",
            boxShadow: "0 8px 24px rgba(0,0,0,.12)",
          }}
        >
          {opts.map((o) => (
            <button
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "7px 12px",
                textAlign: "left",
                background: o === value ? "var(--surface-2)" : "transparent",
                border: "none",
                borderRadius: "7px",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                fontWeight: o === value ? 600 : 400,
                color: o === value ? "var(--text)" : "var(--text-2)",
                textTransform: "capitalize",
                transition: "background .1s",
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
