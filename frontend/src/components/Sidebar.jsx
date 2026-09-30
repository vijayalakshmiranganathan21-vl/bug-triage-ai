import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bug,
  ClipboardCheck,
  FlaskConical,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useBugs } from "../context/BugContext";

const ITEMS = {
  overview: { label: "Overview", icon: LayoutDashboard, end: true },
  inbox: { label: "Bug Inbox", icon: Inbox, to: "/bugs" },
  triage: { label: "AI Triage", icon: Sparkles, to: "/bugs" },
  myBugs: { label: "My Bugs", icon: ListChecks, to: "/developer" },
  queue: { label: "Testing Queue", icon: ClipboardCheck, to: "/qa" },
  repro: { label: "Reproduction", icon: FlaskConical, to: "/bugs" },
  teams: { label: "Teams", icon: Users, to: "/manager" },
  analytics: { label: "Analytics", icon: BarChart3, to: "/manager" },
};

const ROLES_CONFIG = {
  developer: {
    home: "/developer",
    roleLabel: "Developer",
    user: "Arun Kumar",
    nav: ["overview", "myBugs", "inbox", "repro"],
  },
  qa: {
    home: "/qa",
    roleLabel: "QA Engineer",
    user: "Meera Nair",
    nav: ["overview", "inbox", "triage", "queue", "repro"],
  },
  manager: {
    home: "/manager",
    roleLabel: "Engineering Manager",
    user: "Rohan Kapoor",
    nav: ["overview", "inbox", "triage", "teams", "analytics"],
  },
};

const cx = (...parts) => parts.filter(Boolean).join(" ");

function SidebarBody({ onNavigate }) {
  const { currentRole, currentUser, setCurrentRole } = useBugs();
  const navigate = useNavigate();
  const config = ROLES_CONFIG[currentRole] || ROLES_CONFIG.developer;

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setCurrentRole(newRole);
    if (newRole === "developer") navigate("/developer");
    else if (newRole === "qa") navigate("/qa");
    else if (newRole === "manager") navigate("/manager");
    onNavigate?.();
  };

  const handleLogout = () => {
    navigate("/login");
    onNavigate?.();
  };

  return (
    <div className="flex h-full w-full flex-col bg-white border-r border-[#E5E7EB]">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E5E7EB] px-5">
        <NavLink
          to={config.home}
          onClick={onNavigate}
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-sm">
            <Bug size={18} />
          </span>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-[#172033]">BugFlow AI</span>
            <span className="text-[10px] font-medium tracking-wide uppercase text-blue-600">Enterprise</span>
          </div>
        </NavLink>
      </div>

      {/* Role Switcher Banner */}
      <div className="px-3 pt-3">
        <div className="rounded-lg bg-slate-50 border border-[#E5E7EB] p-2">
          <label htmlFor="sidebar-role-select" className="block text-[11px] font-medium text-[#667085] mb-1">
            Active Workspace Role
          </label>
          <select
            id="sidebar-role-select"
            value={currentRole}
            onChange={handleRoleChange}
            aria-label="Active Workspace Role"
            className="w-full text-xs font-semibold text-[#172033] bg-white border border-[#E5E7EB] rounded-md py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="developer">Developer (Arun Kumar)</option>
            <option value="qa">QA / Tester (Meera Nair)</option>
            <option value="manager">Manager (Rohan Kapoor)</option>
          </select>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
        <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
          Navigation
        </div>
        <ul className="space-y-1">
          {config.nav.map((key) => {
            const item = ITEMS[key];
            if (!item) return null;
            const Icon = item.icon;
            const to = item.to || config.home;
            return (
              <li key={key}>
                <NavLink
                  to={to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cx(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      isActive
                        ? "bg-blue-50 text-[#2563EB]"
                        : "text-[#667085] hover:bg-[#F7F8FA] hover:text-[#172033]"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-[#2563EB]"
                        />
                      )}
                      <Icon
                        size={18}
                        className={cx(
                          "shrink-0 transition-colors",
                          isActive ? "text-[#2563EB]" : "text-[#667085] group-hover:text-[#172033]"
                        )}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile & Logout */}
      <div className="shrink-0 border-t border-[#E5E7EB] p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 bg-[#F7F8FA]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#2563EB]">
            {currentUser.avatar || "U"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#172033]">{currentUser.name}</p>
            <p className="truncate text-xs text-[#667085]">{currentUser.roleLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out to Login"
            aria-label="Sign Out"
            className="rounded-lg p-1.5 text-[#667085] hover:bg-white hover:text-red-600 transition-colors border border-transparent hover:border-[#E5E7EB]"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = open !== undefined;
  const drawerOpen = controlled ? open : internalOpen;
  const closeDrawer = () => (controlled ? onClose?.() : setInternalOpen(false));

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  return (
    <>
      {/* Desktop rail (fixed w-64 = 256px) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#E5E7EB] bg-white lg:block">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-[#172033]/40 backdrop-blur-xs transition-opacity" onClick={closeDrawer} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            className="fixed inset-y-0 left-0 w-64 border-r border-[#E5E7EB] bg-white shadow-xl flex flex-col"
          >
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close navigation"
              className="absolute right-3 top-3.5 z-10 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X size={18} />
            </button>
            <SidebarBody onNavigate={closeDrawer} />
          </aside>
        </div>
      )}
    </>
  );
}
