import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyChip({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--surface-3)] border border-[var(--border-2)] text-[var(--text-2)] text-xs font-mono hover:border-[var(--accent-raw)] transition-colors"
      aria-label="Copy Vapi assistant ID"
    >
      {text}
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
}
