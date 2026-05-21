type Props = {
  headline: React.ReactNode;
  sub: string;
  features: string[];
};

export function AuthLeft({ headline, sub, features }: Props) {
  return (
    <div
      className="
        hidden lg:flex
        w-[320px] xl:w-[380px] min-w-[320px] xl:min-w-[380px]
        flex-col p-8 xl:p-11 relative overflow-hidden flex-shrink-0
      "
      style={{
        borderRight: "1px solid var(--border-2)",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(46,127,189,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-auto pb-12">
        <div className="w-8 h-8 rounded-[6px] flex items-center justify-center flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
        </div>
        <span
          className="text-[13px] font-medium tracking-[0.5px]"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}
        >
          Multi<span style={{ color: "var(--text-2)" }}>AgentVoice</span>
        </span>
      </div>

      {/* Headline */}
      <h2
        className="text-[22px] xl:text-[26px] font-medium leading-[1.25] tracking-[-0.8px] mb-3"
        style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}
      >
        {headline}
      </h2>
      <p
        className="text-[12.5px] xl:text-[13px] leading-relaxed mb-10"
        style={{ color: "var(--text-2)" }}
      >
        {sub}
      </p>

      {/* Features */}
      <ul className="flex flex-col gap-3 mt-auto">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2.5 text-[12px] xl:text-[12.5px]"
            style={{ color: "var(--text-2)" }}
          >
            <span
              className="w-1 h-1 rounded-full flex-shrink-0"
              style={{ background: "var(--accent-raw)" }}
            />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
