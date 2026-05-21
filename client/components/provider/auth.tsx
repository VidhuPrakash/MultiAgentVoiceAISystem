"use client";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useRef } from "react";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { refreshToken, fetchMe } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const ok = await refreshToken();
      if (ok) await fetchMe();
    };

    init();
  }, []);

  return <>{children}</>;
}
