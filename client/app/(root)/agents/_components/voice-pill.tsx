import { Mic } from "lucide-react";
import { VOICE_LABELS, VoiceType } from "../page";

export function VoicePill({ voice }: { voice: VoiceType }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[--border-2] bg-[--surface-2] px-2 py-0.5 font-mono text-[10px] text-[--text-2]">
      <Mic className="h-2.5 w-2.5" />
      {VOICE_LABELS[voice]}
    </span>
  );
}
