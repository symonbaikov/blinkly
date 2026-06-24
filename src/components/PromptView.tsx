import { useMemo, useState } from "react";
import { formatCountdown } from "../lib/formatCountdown";

export interface PromptViewProps {
  isVisible: boolean;
  remainingSecs: number;
  breakType: "short" | "long" | null;
  onDefer: (durationSecs: number) => Promise<void> | void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

function WindowControls({
  onMinimize,
  onMaximize,
  onClose,
}: {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onMinimize}
        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
        aria-label="Minimize"
        style={{ pointerEvents: "auto" }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect x="1" y="4.5" width="8" height="1" fill="currentColor" />
        </svg>
      </button>
      <button
        onClick={onMaximize}
        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
        aria-label="Maximize"
        style={{ pointerEvents: "auto" }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect
            x="1"
            y="1"
            width="8"
            height="8"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </button>
      <button
        onClick={onClose}
        className="w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/80 transition-colors flex items-center justify-center cursor-pointer"
        aria-label="Close"
        style={{ pointerEvents: "auto" }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1 1L9 9M9 1L1 9"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default function PromptView({
  isVisible,
  remainingSecs,
  breakType,
  onDefer,
  onMinimize,
  onMaximize,
  onClose,
}: PromptViewProps) {
  const [busyAction, setBusyAction] = useState<number | null>(null);
  const options = useMemo(() => [0, 60, 300, 900], []);

  const handleAction = async (durationSecs: number) => {
    try {
      setBusyAction(durationSecs);
      await onDefer(durationSecs);
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-[#1a1340] text-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.45)]"
      style={{
        fontFamily: "'Nunito', sans-serif",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 220ms ease",
      }}
      data-testid="prompt-window"
    >
      <div className="absolute inset-0 flex flex-col px-5 py-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,116,188,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(100,170,255,0.22),transparent_44%)] pointer-events-none rounded-2xl" />

        <div className="relative flex items-center justify-end mb-2">
          <WindowControls onMinimize={onMinimize} onMaximize={onMaximize} onClose={onClose} />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-orange-300 shadow-[0_10px_28px_rgba(255,95,175,0.35)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle
                cx="12"
                cy="12"
                r="8.5"
                stroke="currentColor"
                strokeWidth="1.8"
                opacity="0.95"
              />
              <path
                d="M12 7v5l3.5 2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[18px] leading-none font-extrabold tracking-wide">
              {formatCountdown(remainingSecs)}
            </div>
            <p className="mt-1 text-[14px] leading-5 text-white/72 font-semibold">
              {breakType === "long"
                ? "A longer reset is coming up. Your focus will thank you."
                : "Almost time. Your eyes will appreciate this."}
            </p>
          </div>
        </div>

        <div className="relative mt-4 flex items-center gap-2">
          {options.map((durationSecs) => {
            const isPrimary = durationSecs === 0;
            const label =
              durationSecs === 0 ? "Start this break now" : `+${Math.round(durationSecs / 60)}m`;

            return (
              <button
                key={durationSecs}
                onClick={() => {
                  void handleAction(durationSecs);
                }}
                disabled={busyAction !== null}
                className={`rounded-full border text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isPrimary
                    ? "px-4 h-9 bg-white/10 border-white/10 text-white/90 hover:bg-white/16"
                    : "px-5 h-9 bg-transparent border-white/16 text-white/82 hover:bg-white/8"
                } ${busyAction === durationSecs ? "opacity-70" : ""}`}
                aria-label={label}
                data-testid={`prompt-button-${durationSecs}`}
              >
                {busyAction === durationSecs && durationSecs === 0 ? "Starting..." : label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
