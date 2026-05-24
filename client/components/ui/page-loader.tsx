"use client";

import { type SVGProps } from "react";

const IconPie = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const IconPhone = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M18.427 14.768 17.2 13.542a1.733 1.733 0 0 0-2.45 0l-.613.613a1.732 1.732 0 0 1-2.45 0l-1.838-1.84a1.735 1.735 0 0 1 0-2.452l.612-.613a1.735 1.735 0 0 0 0-2.452L9.237 5.572a1.6 1.6 0 0 0-2.45 0c-3.223 3.2-1.702 6.896 1.519 10.117 3.22 3.221 6.914 4.745 10.12 1.535a1.601 1.601 0 0 0 0-2.456Z" />
  </svg>
);

const IconBrain = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M12 18.5A2.493 2.493 0 0 1 7.51 20H7.5a2.468 2.468 0 0 1-2.4-3.154 2.98 2.98 0 0 1-.85-5.274 2.468 2.468 0 0 1 .92-3.182 2.477 2.477 0 0 1 1.876-3.344 2.5 2.5 0 0 1 3.41-1.856A2.5 2.5 0 0 1 12 5.5m0 13v-13m0 13a2.493 2.493 0 0 0 4.49 1.5h.01a2.468 2.468 0 0 0 2.403-3.154 2.98 2.98 0 0 0 .847-5.274 2.468 2.468 0 0 0-.921-3.182 2.477 2.477 0 0 0-1.875-3.344A2.5 2.5 0 0 0 14.5 3 2.5 2.5 0 0 0 12 5.5m-8 5a2.5 2.5 0 0 1 3.48-2.3m-.28 8.551a3 3 0 0 1-2.953-5.185M20 10.5a2.5 2.5 0 0 0-3.481-2.3m.28 8.551a3 3 0 0 0 2.954-5.185" />
  </svg>
);

const IconChart = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M4 4v15a1 1 0 0 0 1 1h15M8 16l2.5-5.5 3 3L17.273 7 20 9.667" />
  </svg>
);

const ICONS = [
  IconPie,
  IconPhone,
  IconBrain,
  IconChart,
  IconPie,
  IconPhone,
  IconBrain,
  IconChart,
];

interface PageLoaderProps {
  label?: string;
  className?: string;
}

export function PageLoader({
  label = "Loading…",
  className = "py-20",
}: PageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-label={label}
    >
      {/* Scrolling icon track */}
      <div className="relative w-[220px] h-[48px] overflow-hidden">
        {/* Fade masks */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10"
          style={{
            background: "linear-gradient(to right, var(--bg), transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10"
          style={{
            background: "linear-gradient(to left, var(--bg), transparent)",
          }}
        />

        {/* Sliding strip — width = (icon 36px + gap 18px) × count */}
        <div
          className="flex items-center gap-[18px] absolute top-0 left-0"
          style={{ animation: "aiv-slide 2.4s linear infinite" }}
        >
          {ICONS.map((Icon, i) => (
            <div
              key={i}
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-[10px] border"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border-raw)",
                color: "var(--text-2)",
                animation: `aiv-pop 2.4s ease-in-out infinite`,
                animationDelay: `${i * 0.18}s`,
              }}
            >
              <Icon />
            </div>
          ))}
        </div>
      </div>

      {/* Label */}
      <p
        className="text-[var(--text-2)] text-xs tracking-widest uppercase"
        style={{
          fontFamily: "var(--font-mono)",
          animation: "aiv-pulse 1.6s ease-in-out infinite",
        }}
      >
        {label}
      </p>

      <style>{`
        @keyframes aiv-slide {
          from { transform: translateX(0); }
          to   { transform: translateX(-54px); }
        }
        @keyframes aiv-pop {
          0%,100% { opacity: .3; transform: scale(.9); border-color: var(--border-raw); }
          50%      { opacity: 1;  transform: scale(1.06); border-color: var(--accent-raw); color: var(--accent-raw); }
        }
        @keyframes aiv-pulse {
          0%,100% { opacity: .35; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
