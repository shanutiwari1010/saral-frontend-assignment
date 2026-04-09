import { useState } from "react";
import {
  Home,
  Briefcase,
  User,
  Brain,
  NotepadText,
  Wallet,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", id: "home" },
  { icon: Brain, label: "Insights", id: "insights" },
  { icon: Briefcase, label: "Gamification", id: "gamification" },
  { icon: NotepadText, label: "Applications", id: "applications" },
  { icon: Wallet, label: "Payments", id: "payments" },
];

export default function Sidebar() {
  const [active, setActive] = useState("gamification");

  return (
    <aside
      className="flex flex-col py-5 px-3 min-h-screen bg-sidebar-bg shrink-0"
      style={{
        width: "188px",
        minWidth: "188px",
      }}
    >
      {/* ── Logo ──────────────────────────────────── */}
      <div className="px-3 mb-6">
        <img src="/logo.svg" alt="SARAL" className="h-6" />
      </div>

      {/* ── Nav Items ─────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {navItems.map(({ icon: Icon, label, id }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium w-full text-left transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-sidebar-active-bg shadow-sm"
                  : "hover:bg-sidebar-active-bg/40"
              }`}
            >
              <Icon
                className={`shrink-0 ${
                  isActive ? "text-primary" : "text-secondary"
                }`}
                size={15}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span
                className={
                  isActive ? "text-primary font-semibold" : "text-secondary"
                }
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Bottom: Settings ──────────────────────── */}
      <div className="mt-auto">
        <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium w-full text-left text-secondary hover:bg-sidebar-active-bg/40 transition-colors cursor-pointer">
          <User size={15} strokeWidth={1.75} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
