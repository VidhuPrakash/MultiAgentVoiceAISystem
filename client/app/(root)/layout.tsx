"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Bot,
  PhoneCall,
  BarChart3,
  CreditCard,
  History,
  TrendingUp,
  Database,
} from "lucide-react";
import { Sidebar } from "./_components/sidebar";
import { Topbar } from "./_components/top-bar";
import "./_components/style.scss";
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Agents", href: "/admin/agents", icon: Bot },
  { label: "Calls", href: "/admin/calls", icon: PhoneCall },
];

export const userNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agent Management", href: "/agents", icon: Bot },
  { label: "Call History", href: "/calls", icon: History },
  { label: "Analytics", href: "/analytics", icon: TrendingUp },
  { label: "Leads / Data", href: "/leads", icon: Database },
  { label: "Billing", href: "/billing", icon: CreditCard },
];

export function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function sync() {
      const narrow = window.innerWidth < 1024;
      setCollapsed(narrow);
      if (!narrow) setMobileOpen(false);
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "var(--font-sans, 'Instrument Sans', sans-serif)",
        }}
      >
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Right column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <Topbar onMenuClick={() => setMobileOpen(true)} />

          <main
            className="main-content"
            style={{
              backgroundSize: "100% 100%, 36px 36px, 36px 36px",
              backgroundPosition: "0 0, -0.5px -0.5px, -0.5px -0.5px",
            }}
          >
            {children}
          </main>

          <footer className="layout-footer">
            <span className="layout-footer__copy">
              © {new Date().getFullYear()} MultiAgentVoice
            </span>
            <nav className="layout-footer__links">
              {["Privacy", "Terms", "Support"].map((l) => (
                <a key={l} href="#" className="layout-footer__link">
                  {l}
                </a>
              ))}
            </nav>
          </footer>
        </div>
      </div>
    </>
  );
}
