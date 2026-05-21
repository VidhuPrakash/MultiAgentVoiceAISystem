import { useAuthStore } from "@/store/auth-store";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function UserMenu({
  collapsed,
  name,
  subtitle,
  initials,
}: {
  collapsed: boolean;
  name: string;
  subtitle: string;
  initials: string;
}) {
  const [open, setOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="user-menu" ref={ref}>
      <button
        className={`user-menu__trigger ${collapsed ? "user-menu__trigger--collapsed" : ""}`}
        onClick={() => setOpen((p) => !p)}
        title={collapsed ? name : undefined}
        suppressHydrationWarning
      >
        <span className="avatar">{initials}</span>
        {!collapsed && (
          <>
            <span className="user-menu__info">
              <span className="user-menu__name">{name}</span>
              <span className="user-menu__sub">{subtitle}</span>
            </span>
            <ChevronDown
              size={13}
              className={`user-menu__caret ${open ? "user-menu__caret--open" : ""}`}
            />
          </>
        )}
      </button>

      {open && (
        <div className="user-menu__popover">
          <div className="user-menu__header">
            <span className="avatar avatar--lg">{initials}</span>
            <div>
              <p className="user-menu__pop-name">{name}</p>
              <p className="user-menu__pop-sub">{subtitle}</p>
            </div>
          </div>
          <div className="user-menu__divider" />
          
          <button
            className="user-menu__item user-menu__item--danger"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
