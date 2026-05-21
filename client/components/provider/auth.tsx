"use client";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useRef, useState } from "react";
import { PageLoader } from "@/components/ui/page-loader";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      const ok = await useAuthStore.getState().refreshToken();
      if (!ok) {
        // No valid session — clear everything and send to login.
        // Skip redirect if already on a public page to prevent a reload loop.
        useAuthStore.getState().reset();
        document.cookie = "role=;path=/;max-age=0";
        const { pathname } = window.location;
        if (
          !pathname.startsWith("/login") &&
          !pathname.startsWith("/register")
        ) {
          window.location.replace("/login");
          return; // stay on loader while navigating away
        }
        setInitializing(false);
        return;
      }
      // Token restored — fetch user (also sets the role cookie for the proxy).
      await useAuthStore.getState().fetchMe();
      setInitializing(false);
    })();
  }, []);

  return (
    <>
      {initializing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg)]">
          <PageLoader />
        </div>
      )}
      {children}
    </>
  );
}
