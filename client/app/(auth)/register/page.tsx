"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useFormErrors } from "@/hook/use-form-error";
import { AuthLeft } from "../_components/auth-left";
import { EyeIcon } from "../_components/eye-icon";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { useRouter } from "nextjs-toploader/app";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

function validate(form: {
  name: string;
  email: string;
  password: string;
  confirm: string;
}): FieldErrors {
  const errs: FieldErrors = {};

  if (!form.name.trim()) {
    errs.name = "Name is required.";
  } else if (form.name.trim().length < 2) {
    errs.name = "Name must be at least 2 characters.";
  }

  if (!form.email.trim()) {
    errs.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errs.email = "Enter a valid email address.";
  }

  if (!form.password) {
    errs.password = "Password is required.";
  } else if (form.password.length < 8) {
    errs.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(form.password)) {
    errs.password = "Include at least one uppercase letter.";
  } else if (!/[0-9]/.test(form.password)) {
    errs.password = "Include at least one number.";
  }

  if (!form.confirm) {
    errs.confirm = "Please confirm your password.";
  } else if (form.confirm !== form.password) {
    errs.confirm = "Passwords do not match.";
  }

  return errs;
}

function strength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: "Weak", color: "var(--danger)" };
  if (score <= 2) return { score, label: "Fair", color: "var(--warning)" };
  if (score <= 3) return { score, label: "Good", color: "var(--info)" };
  return { score, label: "Strong", color: "var(--accent-raw)" };
}

export default function RegisterPage() {
  const { register, isLoading } = useAuthStore();
  const { globalError, handleApiError, clearErrors } = useFormErrors();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pw = strength(form.password);

  const onlyTouched = (
    errs: FieldErrors,
    t: Record<string, boolean>,
  ): FieldErrors =>
    Object.fromEntries(
      Object.entries(errs).filter(([k]) => t[k]),
    ) as FieldErrors;

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...form, [f]: e.target.value };
    setForm(updated);
    clearErrors();
    if (touched[f]) {
      setFieldErrors(onlyTouched(validate(updated), touched));
    }
  };

  const blur = (f: string) => () => {
    const newTouched = { ...touched, [f]: true };
    setTouched(newTouched);
    setFieldErrors(onlyTouched(validate(form), newTouched));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setTouched({ name: true, email: true, password: true, confirm: true });
      return;
    }
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      const role = useAuthStore.getState().user?.role;
      router.push(role === "admin" ? "/admin/users" : "/dashboard");
    } catch (err) {
      handleApiError(err);
    }
  };

  const inputStyle = (hasErr?: string) => ({
    borderColor: hasErr ? "var(--danger)" : undefined,
    background: "var(--surface-2)",
    color: "var(--text)",
  });

  return (
    <div
      className="flex min-h-screen min-h-dvh"
      style={{
        background: "var(--bg)",
        backgroundImage: `
          radial-gradient(ellipse 600px 400px at 80% 10%, rgba(196,123,43,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 400px 600px at 10% 90%, rgba(46,127,189,0.05) 0%, transparent 70%)
        `,
      }}
    >
      {/* Left panel */}
      <AuthLeft
        headline={
          <>
            Your voice agents,
            <br />
            live in
            <br />
            <span style={{ color: "var(--accent-raw)" }}>minutes.</span>
          </>
        }
        sub="Create your account and deploy your first AI voice agent before your next meeting."
        features={[
          "Free during early access",
          "No credit card required",
          "Unlimited test calls",
          "Dedicated onboarding support",
        ]}
      />

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8 md:px-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10 self-start">
          <div className="w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0">
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

        <div className="w-full max-w-[380px] sm:max-w-[400px]">
          <p
            className="text-[10px] sm:text-[11px] font-medium tracking-[1.5px] uppercase mb-2.5"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}
          >
            New account
          </p>
          <h1
            className="text-[20px] sm:text-[22px] font-medium tracking-tight mb-1.5"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}
          >
            Create account
          </h1>
          <p
            className="text-sm mb-7 sm:mb-8"
            style={{ color: "var(--text-2)" }}
          >
            Already have one?{" "}
            <Link
              href="/login"
              className="underline underline-offset-2 transition-colors"
              style={{ color: "var(--text-2)" }}
            >
              Sign in
            </Link>
          </p>

          {/* Global API error */}
          {globalError && (
            <div
              className="mb-4 rounded-[7px] px-3.5 py-2.5 text-sm"
              style={{
                background: "rgba(192,57,43,0.08)",
                border: "1px solid rgba(192,57,43,0.2)",
                color: "var(--danger)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {globalError}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label
                className="text-[10px] sm:text-[11px] tracking-[0.5px] uppercase mb-1.5 block"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-3)",
                }}
              >
                Full name
              </Label>
              <Input
                type="text"
                placeholder="Jane Smith"
                value={form.name}
                onChange={set("name")}
                onBlur={blur("name")}
                autoComplete="name"
                style={inputStyle(fieldErrors.name)}
              />
              <FieldError msg={fieldErrors.name} />
            </div>

            {/* Email */}
            <div>
              <Label
                className="text-[10px] sm:text-[11px] tracking-[0.5px] uppercase mb-1.5 block"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-3)",
                }}
              >
                Email
              </Label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={set("email")}
                onBlur={blur("email")}
                autoComplete="email"
                style={inputStyle(fieldErrors.email)}
              />
              <FieldError msg={fieldErrors.email} />
            </div>

            {/* Password */}
            <div>
              <Label
                className="text-[10px] sm:text-[11px] tracking-[0.5px] uppercase mb-1.5 block"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-3)",
                }}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  value={form.password}
                  onChange={set("password")}
                  onBlur={blur("password")}
                  autoComplete="new-password"
                  className="pr-10"
                  style={inputStyle(fieldErrors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity"
                  style={{ color: "var(--text-3)" }}
                  tabIndex={-1}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-[3px] flex-1 rounded-full transition-all duration-300"
                        style={{
                          background:
                            i <= pw.score ? pw.color : "var(--border-3)",
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-[10px]"
                    style={{ color: pw.color, fontFamily: "var(--font-mono)" }}
                  >
                    {pw.label}
                  </p>
                </div>
              )}

              <FieldError msg={fieldErrors.password} />
            </div>

            {/* Confirm password */}
            <div>
              <Label
                className="text-[10px] sm:text-[11px] tracking-[0.5px] uppercase mb-1.5 block"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-3)",
                }}
              >
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  onBlur={blur("confirm")}
                  autoComplete="new-password"
                  className="pr-10"
                  style={inputStyle(fieldErrors.confirm)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity"
                  style={{ color: "var(--text-3)" }}
                  tabIndex={-1}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              <FieldError msg={fieldErrors.confirm} />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full mt-1"
              style={{
                background: "var(--accent-raw)",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
              }}
            >
              {isLoading ? "Creating account..." : "Create account →"}
            </Button>

            <p
              className="text-center text-[10px] sm:text-[11px] leading-relaxed"
              style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}
            >
              By registering you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2"
                style={{ color: "var(--text-2)" }}
              >
                Terms
              </Link>{" "}
              &{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2"
                style={{ color: "var(--text-2)" }}
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
