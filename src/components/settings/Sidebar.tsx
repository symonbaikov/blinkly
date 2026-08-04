import { useEffect, type ReactNode } from "react";
import { useAppVersion } from "../../hooks/useAppVersion";
import { useUpdateStore } from "../../stores/useUpdateStore";

export type Page = "general" | "timers" | "sound" | "appearance" | "statistics" | "about";

interface SidebarProps {
  active: Page;
  onChange: (page: Page) => void;
}

interface NavItem {
  id: Page;
  label: string;
  icon: ReactNode;
}

// Inline SVG icons (16×16)
const icons = {
  general: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 1.5" />
    </svg>
  ),
  timers: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <path d="M5 8h6M8 5v6" />
    </svg>
  ),
  sound: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h2l3-3v10L5 10H3a1 1 0 01-1-1V7a1 1 0 011-1z" />
      <path d="M11 5.5a3 3 0 010 5" />
    </svg>
  ),
  appearance: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
  ),
  statistics: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="8" width="3" height="6" rx="0.5" />
      <rect x="6.5" y="4" width="3" height="10" rx="0.5" />
      <rect x="11" y="2" width="3" height="12" rx="0.5" />
    </svg>
  ),
  about: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 11V7M8 5h.01" />
    </svg>
  ),
};

const navItems: NavItem[] = [
  { id: "general", label: "General", icon: icons.general },
  { id: "timers", label: "Timers", icon: icons.timers },
  { id: "sound", label: "Sound", icon: icons.sound },
  { id: "appearance", label: "Appearance", icon: icons.appearance },
  { id: "statistics", label: "Statistics", icon: icons.statistics },
  { id: "about", label: "About", icon: icons.about },
];

export default function Sidebar({ active, onChange }: SidebarProps) {
  const version = useAppVersion();
  const { status, update, downloadProgress, checkForUpdate, installUpdate } = useUpdateStore();
  const showUpdateAction =
    update && (status === "available" || status === "downloading" || status === "error");
  const isDownloading = status === "downloading";
  const actionLabel =
    status === "error"
      ? "Retry update"
      : update?.installType === "appimage"
        ? "Update"
        : "Get update";

  useEffect(() => {
    void checkForUpdate();
  }, [checkForUpdate]);

  return (
    <div className="w-[220px] shrink-0 bg-transparent flex flex-col h-full py-4 px-3 transition-colors">
      {/* Brand */}
      <div className="px-4 mb-6 mt-2 flex items-center gap-3">
        <img src="/logo.png" alt="Blinkly Logo" className="w-8 h-8 drop-shadow-sm rounded-lg" />
        <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500">
          Blinkly
        </h2>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
              active === item.id
                ? "bg-white/60 dark:bg-gray-800/80 text-blue-600 dark:text-blue-400 shadow-sm backdrop-blur-md border border-white/50 dark:border-gray-700/60 translate-x-1"
                : "text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 hover:translate-x-0.5 border border-transparent"
            }`}
          >
            <span
              className={`shrink-0 transition-colors ${active === item.id ? "text-pink-500 dark:text-pink-400" : ""}`}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-3 px-4 py-4">
        {showUpdateAction && update && (
          <button
            type="button"
            onClick={() => void installUpdate()}
            disabled={isDownloading}
            aria-label={`${actionLabel} Blinkly to version ${update.version}`}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400 p-px text-left shadow-[0_0_20px_rgba(236,72,153,0.55),0_0_34px_rgba(34,211,238,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(236,72,153,0.8),0_0_42px_rgba(34,211,238,0.4)] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-pink-50 disabled:cursor-wait disabled:opacity-80 dark:focus-visible:ring-offset-gray-900"
          >
            <span className="flex min-h-11 items-center gap-2 rounded-[11px] bg-white/90 px-3 py-2 text-xs font-extrabold text-fuchsia-600 backdrop-blur-sm transition-colors group-hover:bg-white dark:bg-gray-900/90 dark:text-pink-300 dark:group-hover:bg-gray-900">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-white shadow-[0_0_12px_rgba(217,70,239,0.65)]">
                {isDownloading ? (
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity="0.3"
                    />
                    <path
                      d="M21 12a9 9 0 00-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M8 2v7M5 6l3 3 3-3M3 12h10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block">{isDownloading ? "Updating…" : actionLabel}</span>
                <span className="block text-[10px] font-bold text-fuchsia-500/75 dark:text-pink-200/75">
                  {isDownloading
                    ? `${downloadProgress}% downloaded`
                    : `v${update.version} is ready`}
                </span>
              </span>
            </span>
          </button>
        )}
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500">v{version}</p>
      </div>
    </div>
  );
}
