import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useTauriEvents } from "../hooks/useTauriEvents";
import { useSchedulerStore } from "../stores/useSchedulerStore";
import PromptView from "./PromptView";

export default function PromptWindow() {
  useTauriEvents();

  const isPromptVisible = useSchedulerStore((s) => s.isPromptVisible);
  const promptRemaining = useSchedulerStore((s) => s.promptRemaining);
  const promptBreakType = useSchedulerStore((s) => s.promptBreakType);
  const deferPrompt = useSchedulerStore((s) => s.deferPrompt);

  const window = getCurrentWebviewWindow();

  return (
    <PromptView
      isVisible={isPromptVisible}
      remainingSecs={promptRemaining}
      breakType={promptBreakType}
      onDefer={deferPrompt}
      onMinimize={() => void window.minimize()}
      onMaximize={() => void window.toggleMaximize()}
      onClose={() => void window.hide()}
    />
  );
}
