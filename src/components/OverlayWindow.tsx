import { useEffect, useRef, useState } from "react";
import { useTauriEvents } from "../hooks/useTauriEvents";
import { lockScreen } from "../lib/ipc";
import { useSchedulerStore } from "../stores/useSchedulerStore";
import { getConfig, getRemaining, getState } from "../lib/ipc";

function CurrentTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(time.getHours()).padStart(2, "0");
  const m = String(time.getMinutes()).padStart(2, "0");
  return (
    <span>
      {h}:{m}
    </span>
  );
}

function TimeDisplay({ remaining }: { remaining: number }) {
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return (
    <span>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

export default function OverlayWindow() {
  useTauriEvents();

  const startBreak = useSchedulerStore((s) => s.startBreak);
  const endBreak = useSchedulerStore((s) => s.endBreak);
  const setRemaining = useSchedulerStore((s) => s.setRemaining);
  const isBreakActive = useSchedulerStore((s) => s.isBreakActive);
  const remaining = useSchedulerStore((s) => s.remaining);
  const skip = useSchedulerStore((s) => s.skip);

  const [visible, setVisible] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);
  const [lockStatus, setLockStatus] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isBreakActive) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      const t = setTimeout(() => setVisible(true), 150);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isBreakActive]);

  useEffect(() => {
    const poll = async () => {
      try {
        const state = await getState();
        const isActive = useSchedulerStore.getState().isBreakActive;
        if (state === "on_break") {
          const rem = await getRemaining();
          if (!isActive) {
            const config = await getConfig();
            startBreak("short", config.break_duration_secs);
          }
          setRemaining(rem);
        } else if (isActive) {
          endBreak();
        }
      } catch (e) {
        console.error("Failed to poll state:", e);
      }
    };

    const id = setInterval(() => {
      void poll();
    }, 500);
    void poll();
    return () => clearInterval(id);
  }, [startBreak, endBreak, setRemaining]);

  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const duration = prefersReducedMotion ? 0 : 3;

  const handleLockScreen = async () => {
    if (isLocking) return;

    try {
      setIsLocking(true);
      setLockError(null);
      setLockStatus("Sending lock request...");
      await lockScreen();
      setLockStatus("Lock request sent");
    } catch (error) {
      console.error("Failed to lock screen:", error);
      const message =
        error && typeof error === "object" && "toString" in error
          ? String(error)
          : "Unable to lock the screen on this system.";
      setLockError(message);
      setLockStatus(null);
    } finally {
      setIsLocking(false);
    }
  };

  useEffect(() => {
    if (!lockStatus) return;
    const timeout = window.setTimeout(() => setLockStatus(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [lockStatus]);

  return (
    <div
      className="h-screen w-screen overflow-hidden select-none relative font-sans flex flex-col items-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}s ease-in-out`,
        pointerEvents: visible ? "auto" : "none",
        background: "rgba(20, 30, 45, 0.6)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="absolute top-12 flex items-center gap-1.5 text-white/90 font-medium text-sm tracking-wide">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <CurrentTime />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center -mt-16 w-full">
        <h1 className="text-white font-bold tracking-tight mb-4" style={{ fontSize: "52px" }}>
          Eyes to the horizon
        </h1>

        <p className="text-white/90 text-xl font-medium mb-10 text-center tracking-wide">
          Set your eyes on something distant until the countdown is over
        </p>

        <div className="w-24 h-[1px] bg-white/30 mb-8 rounded-full"></div>

        <div
          className="font-bold tracking-wider tabular-nums"
          style={{
            fontSize: "64px",
            color: "#A5D8FF",
            textShadow: "0 0 30px rgba(165, 216, 255, 0.4)",
          }}
        >
          <TimeDisplay remaining={remaining} />
        </div>
      </div>

      <div className="absolute bottom-16 flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <button
            onClick={() => void skip()}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm cursor-pointer border border-white/20 transition-all hover:bg-white/20 active:bg-white/30"
            style={{
              background: "rgba(30, 60, 100, 0.5)",
              color: "white",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
            Skip Break
          </button>

          <button
            onClick={() => {
              void handleLockScreen();
            }}
            disabled={isLocking}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm cursor-pointer border border-white/20 transition-all hover:bg-white/20 active:bg-white/30"
            style={{
              background: "rgba(30, 50, 90, 0.5)",
              color: "white",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              opacity: isLocking ? 0.7 : 1,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            {isLocking ? "Locking..." : "Lock Screen"}
          </button>
        </div>

        <div className="text-center flex flex-col gap-1.5 mt-2">
          {lockStatus ? (
            <p className="text-[11px] font-medium text-sky-200/90">{lockStatus}</p>
          ) : null}
          {lockError ? (
            <p className="max-w-sm text-[11px] font-medium text-amber-200/90">{lockError}</p>
          ) : null}
          <p className="text-white/50 text-xs font-medium">4 snoozes available</p>
          <p className="text-white/50 text-xs font-medium flex items-center gap-1.5 justify-center">
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-sans text-[10px] text-white/80">
              Esc
            </kbd>{" "}
            twice to skip the break
          </p>
        </div>
      </div>
    </div>
  );
}
