import { useState } from "react";
import { Bell, Check, Menu, Search, Sparkles, X } from "lucide-react";
import { useBugs } from "../context/BugContext";

export default function Header({ title, subtitle, onSearch, onMenu }) {
  const { currentUser, aiActivity } = useBugs();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenu}
            aria-label="Open mobile navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F7F8FA] hover:text-[#172033] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-[#172033] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden truncate text-xs text-[#667085] sm:block leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Search, Notifications, User */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Desktop Search */}
          <div className="relative hidden w-64 md:block xl:w-72">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]"
            />
            <input
              type="search"
              value={query}
              onChange={handleSearch}
              placeholder="Search bugs, IDs, teams..."
              aria-label="Search bugs"
              className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-8 text-xs text-[#172033] placeholder:text-[#667085] transition-colors focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={searchOpen ? "Close search" : "Open search"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F7F8FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
          >
            {searchOpen ? <X size={16} /> : <Search size={16} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="View notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F7F8FA] hover:text-[#172033] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
            >
              <Bell size={16} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 top-11 z-40 w-80 sm:w-96 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2 px-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#2563EB]" /> AI Activity Feed
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Live Sync
                    </span>
                  </div>
                  <ul className="mt-2 divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {aiActivity.slice(0, 5).map((act) => (
                      <li key={act.id} className="py-2 px-1 text-xs hover:bg-[#F7F8FA] rounded-md transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-blue-600">{act.bugId}</span>
                          <span className="text-[10px] text-[#667085]">{act.time}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-[#172033] leading-snug">{act.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          <span className="hidden h-6 w-px bg-[#E5E7EB] sm:block" aria-hidden="true" />

          {/* User profile capsule */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#2563EB] shadow-xs">
              {currentUser.avatar}
            </span>
            <div className="hidden min-w-0 sm:block text-left">
              <p className="truncate text-xs font-semibold leading-tight text-[#172033]">
                {currentUser.name}
              </p>
              <span className="mt-0.5 inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-[#2563EB] ring-1 ring-inset ring-blue-600/20">
                {currentUser.roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search expanded */}
      {searchOpen && (
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-2 md:hidden">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]"
            />
            <input
              type="search"
              value={query}
              onChange={handleSearch}
              autoFocus
              placeholder="Search bugs..."
              className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-xs text-[#172033] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}
