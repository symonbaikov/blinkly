import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { useConfigStore } from "../../stores/useConfigStore";
import { applyTheme } from "../../lib/theme";
import Sidebar, { type Page } from "./Sidebar";
import GeneralPage from "./pages/GeneralPage";
import TimersPage from "./pages/TimersPage";
import SoundPage from "./pages/SoundPage";
import AppearancePage from "./pages/AppearancePage";
import StatsPage from "./pages/StatsPage";
import AboutPage from "./pages/AboutPage";
import UpdateBanner from "./UpdateBanner";

const pagesWithSave = new Set<Page>(["timers", "sound", "appearance"]);

const validPages: Page[] = ["general", "timers", "sound", "appearance", "statistics", "about"];

function parsePage(value: string): Page | null {
  const trimmed = value.replace(/^#/, "");
  return validPages.includes(trimmed as Page) ? (trimmed as Page) : null;
}

export default function SettingsLayout() {
  const [page, setPage] = useState<Page>(parsePage(window.location.hash) ?? "general");
  const { draft, error, isSaving, load, update, save } = useConfigStore();

  useEffect(() => {
    void load();
  }, [load]);

  // Listen for page navigation requests from the tray menu.
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    void listen<string>("navigate-to-page", (event) => {
      const requested = parsePage(event.payload);
      if (requested && !cancelled) {
        setPage(requested);
      }
    }).then((unlisten) => {
      if (cancelled) {
        unlisten();
        return;
      }
      cleanup = unlisten;
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  // Apply theme immediately when the user changes it in the draft.
  useEffect(() => {
    if (draft?.theme) {
      applyTheme(draft.theme);
    }
  }, [draft?.theme]);

  if (!draft) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case "general":
        return <GeneralPage />;
      case "timers":
        return <TimersPage draft={draft} update={update} />;
      case "sound":
        return <SoundPage draft={draft} update={update} />;
      case "appearance":
        return <AppearancePage draft={draft} update={update} />;
      case "statistics":
        return <StatsPage />;
      case "about":
        return <AboutPage />;
    }
  };

  const showSave = pagesWithSave.has(page);

  return (
    <div className="h-screen flex bg-gradient-to-br from-pink-100/50 via-purple-50/50 to-blue-100/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 font-sans transition-colors">
      <Sidebar active={page} onChange={setPage} />

      <div className="flex-1 flex flex-col min-w-0 bg-white/60 dark:bg-gray-900/70 backdrop-blur-3xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] rounded-l-[2.5rem] border-l border-white/60 dark:border-gray-700/60 my-2 mr-2 overflow-hidden transition-colors">
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <UpdateBanner />
          {renderPage()}

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50/80 dark:bg-red-950/40 backdrop-blur rounded-lg px-3 py-2 mt-4 border border-red-100 dark:border-red-900/50">
              {error}
            </p>
          )}
        </div>

        {/* Save footer */}
        {showSave && (
          <div className="px-8 py-5 bg-white/40 dark:bg-gray-800/60 backdrop-blur-md border-t border-white/50 dark:border-gray-700/60 transition-colors">
            <button
              onClick={() => void save()}
              disabled={isSaving}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 shadow-lg shadow-pink-500/25 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
