"use client";
import { useState } from "react";
import Link from "next/link";
import { useFormErrors } from "@/hook/use-form-error";
import { useAuthStore } from "@/store/auth-store";
import { AuthLeft } from "../_components/auth-left";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { useRouter } from "nextjs-toploader/app";

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const { fieldErrors, globalError, handleApiError, clearErrors, setErrors } =
    useFormErrors();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    clearErrors();
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Invalid email address";
    if (!form.password) errors.password = "Password is required";
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      await login(form.email, form.password);
      const role = useAuthStore.getState().user?.role;
      router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      handleApiError(err);
    }
  };

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
      {/* Left panel — hidden below lg */}
      <AuthLeft
        headline={
          <>
            Intelligent voice
            <br />
            agents for
            <br />
            <span style={{ color: "var(--accent-raw)" }}>every business.</span>
          </>
        }
        sub="Deploy AI receptionists, booking assistants and support agents from a single dashboard."
        features={[
          "Receptionist, booking and FAQ agents",
          "Real-time call logs and recordings",
          "Automatic lead capture from calls",
          "Isolated multi-tenant architecture",
        ]}
      />

      {/* Right panel — full width on mobile, flex-1 on lg+ */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8 md:px-12">
        {/* Mobile-only logo */}
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
            Account access
          </p>
          <h1
            className="text-[20px] sm:text-[22px] font-medium tracking-tight mb-1.5"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}
          >
            Sign in
          </h1>
          <p
            className="text-sm mb-7 sm:mb-8"
            style={{ color: "var(--text-2)" }}
          >
            No account?{" "}
            <Link
              href="/register"
              className="underline underline-offset-2 transition-colors"
              style={{ color: "var(--text-2)" }}
            >
              Create one
            </Link>
          </p>

          {globalError && (
            <div
              className="mb-4 rounded-[7px] px-3.5 py-2.5 text-sm"
              style={{
                background: "rgba(192,57,43,0.08)",
                border: "1px solid rgba(192,57,43,0.2)",
                color: "var(--danger)",
              }}
            >
              {globalError}
            </div>
          )}

          <div className="space-y-4">
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
                required
                className={fieldErrors.email ? "border-[--danger]" : ""}
              />
              <FieldError msg={fieldErrors.email} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label
                  className="text-[10px] sm:text-[11px] tracking-[0.5px] uppercase"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-3)",
                  }}
                >
                  Password
                </Label>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={set("password")}
                required
                className={fieldErrors.password ? "border-[--danger]" : ""}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full mt-2"
              style={{
                background: "var(--accent-raw)",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
              }}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
