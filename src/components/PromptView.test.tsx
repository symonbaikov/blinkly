import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { formatCountdown } from "../lib/formatCountdown";
import PromptView from "./PromptView";

describe("formatCountdown", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatCountdown(0)).toBe("00:00");
    expect(formatCountdown(32)).toBe("00:32");
    expect(formatCountdown(90)).toBe("01:30");
    expect(formatCountdown(605)).toBe("10:05");
  });
});

describe("PromptView", () => {
  const baseProps = {
    isVisible: true,
    remainingSecs: 16,
    breakType: "short" as const,
    onDefer: vi.fn(),
    onMinimize: vi.fn(),
    onMaximize: vi.fn(),
    onClose: vi.fn(),
  };

  it("renders short break message and countdown", () => {
    render(<PromptView {...baseProps} />);

    expect(screen.getByText("00:16")).toBeInTheDocument();
    expect(screen.getByText("Almost time. Your eyes will appreciate this.")).toBeInTheDocument();
  });

  it("renders long break message", () => {
    render(<PromptView {...baseProps} breakType="long" />);

    expect(
      screen.getByText("A longer reset is coming up. Your focus will thank you.")
    ).toBeInTheDocument();
  });

  it("is hidden when isVisible is false", () => {
    render(<PromptView {...baseProps} isVisible={false} />);

    const windowEl = screen.getByTestId("prompt-window");
    expect(windowEl).toHaveStyle({ opacity: "0" });
  });

  it("calls onDefer(0) when 'Start this break now' is clicked", async () => {
    const user = userEvent.setup();
    const onDefer = vi.fn().mockResolvedValue(undefined);
    render(<PromptView {...baseProps} onDefer={onDefer} />);

    await user.click(screen.getByRole("button", { name: "Start this break now" }));

    expect(onDefer).toHaveBeenCalledTimes(1);
    expect(onDefer).toHaveBeenCalledWith(0);
  });

  it("calls onDefer(60) when '+1m' is clicked", async () => {
    const user = userEvent.setup();
    const onDefer = vi.fn().mockResolvedValue(undefined);
    render(<PromptView {...baseProps} onDefer={onDefer} />);

    await user.click(screen.getByRole("button", { name: "+1m" }));

    expect(onDefer).toHaveBeenCalledTimes(1);
    expect(onDefer).toHaveBeenCalledWith(60);
  });

  it("calls onDefer(300) when '+5m' is clicked", async () => {
    const user = userEvent.setup();
    const onDefer = vi.fn().mockResolvedValue(undefined);
    render(<PromptView {...baseProps} onDefer={onDefer} />);

    await user.click(screen.getByRole("button", { name: "+5m" }));

    expect(onDefer).toHaveBeenCalledTimes(1);
    expect(onDefer).toHaveBeenCalledWith(300);
  });

  it("calls onDefer(900) when '+15m' is clicked", async () => {
    const user = userEvent.setup();
    const onDefer = vi.fn().mockResolvedValue(undefined);
    render(<PromptView {...baseProps} onDefer={onDefer} />);

    await user.click(screen.getByRole("button", { name: "+15m" }));

    expect(onDefer).toHaveBeenCalledTimes(1);
    expect(onDefer).toHaveBeenCalledWith(900);
  });

  it("disables all action buttons while an action is in progress", async () => {
    const user = userEvent.setup();
    const onDefer = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));
    render(<PromptView {...baseProps} onDefer={onDefer} />);

    await user.click(screen.getByRole("button", { name: "+1m" }));

    expect(screen.getByRole("button", { name: "Start this break now" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "+1m" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "+5m" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "+15m" })).toBeDisabled();
  });

  it("shows 'Starting...' text while starting break immediately", async () => {
    const user = userEvent.setup();
    const onDefer = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));
    render(<PromptView {...baseProps} onDefer={onDefer} />);

    await user.click(screen.getByRole("button", { name: "Start this break now" }));

    expect(screen.getByText("Starting...")).toBeInTheDocument();
  });

  it("calls window control handlers", async () => {
    const user = userEvent.setup();
    const onMinimize = vi.fn();
    const onMaximize = vi.fn();
    const onClose = vi.fn();

    render(
      <PromptView
        {...baseProps}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole("button", { name: "Minimize" }));
    expect(onMinimize).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Maximize" }));
    expect(onMaximize).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onDefer again if an action is already busy", async () => {
    const user = userEvent.setup();
    const onDefer = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));
    render(<PromptView {...baseProps} onDefer={onDefer} />);

    await user.click(screen.getByRole("button", { name: "+1m" }));
    await user.click(screen.getByRole("button", { name: "+5m" }));

    expect(onDefer).toHaveBeenCalledTimes(1);
    expect(onDefer).toHaveBeenCalledWith(60);
  });
});
