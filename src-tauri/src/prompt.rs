use std::sync::Arc;

use serde::Serialize;
use tauri::{AppHandle, Emitter, EventTarget, Manager, PhysicalPosition, Runtime};
use tokio::sync::broadcast;

use crate::events::{AppEvent, BreakType, EventBus};

const PROMPT_LABEL: &str = "prompt";
const PROMPT_MARGIN_TOP: i32 = 40;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct PromptTickPayload {
    break_type: String,
    remaining_secs: u64,
}

pub fn spawn_prompt_listener<R: Runtime>(app: AppHandle<R>, bus: Arc<EventBus>) {
    let mut rx = bus.subscribe();

    crate::spawn_async(async move {
        loop {
            match rx.recv().await {
                Ok(AppEvent::PreBreakPromptTick {
                    break_type,
                    remaining_secs,
                }) => {
                    let break_type_str = match break_type {
                        BreakType::Short => "short",
                        BreakType::Long => "long",
                    };

                    if let Some(window) = app.get_webview_window(PROMPT_LABEL) {
                        if let Err(error) = position_prompt_window(&window) {
                            tracing::warn!("Failed to position prompt window: {error}");
                        }
                        let _ = window.show();
                        // Re-apply after the surface is mapped: some
                        // compositors only honor positioning once the
                        // window exists.
                        let win = window.clone();
                        crate::spawn_async(async move {
                            tokio::time::sleep(std::time::Duration::from_millis(60)).await;
                            if let Err(error) = position_prompt_window(&win) {
                                tracing::warn!("Failed to reposition prompt window: {error}");
                            }
                        });
                    }

                    let _ = app.emit_to(
                        EventTarget::webview(PROMPT_LABEL),
                        "pre-break-prompt-tick",
                        PromptTickPayload {
                            break_type: break_type_str.to_string(),
                            remaining_secs,
                        },
                    );
                }
                Ok(AppEvent::PreBreakPromptHidden)
                | Ok(AppEvent::BreakDue { .. })
                | Ok(AppEvent::BreakCompleted)
                | Ok(AppEvent::BreakSkipped)
                | Ok(AppEvent::BreakDeferred { .. })
                | Ok(AppEvent::BreakSnoozed { .. }) => {
                    if let Some(window) = app.get_webview_window(PROMPT_LABEL) {
                        let _ = app.emit_to(
                            EventTarget::webview(PROMPT_LABEL),
                            "pre-break-prompt-hide",
                            (),
                        );
                        let _ = window.hide();
                    }
                }
                Ok(AppEvent::StateChanged(crate::events::SchedulerState::Idle))
                | Ok(AppEvent::StateChanged(crate::events::SchedulerState::Paused)) => {
                    if let Some(window) = app.get_webview_window(PROMPT_LABEL) {
                        let _ = app.emit_to(
                            EventTarget::webview(PROMPT_LABEL),
                            "pre-break-prompt-hide",
                            (),
                        );
                        let _ = window.hide();
                    }
                }
                Err(broadcast::error::RecvError::Closed) => break,
                Err(broadcast::error::RecvError::Lagged(n)) => {
                    tracing::warn!("Prompt listener lagged {n} events");
                }
                _ => {}
            }
        }
    });
}

fn position_prompt_window<R: Runtime>(window: &tauri::WebviewWindow<R>) -> tauri::Result<()> {
    let monitor = window
        .current_monitor()?
        .or_else(|| window.primary_monitor().ok().flatten());

    if let Some(monitor) = monitor {
        let size = monitor.size();
        let work_area = monitor.work_area();
        let window_size = window.outer_size()?;
        let x = work_area.position.x + ((size.width as i32 - window_size.width as i32) / 2).max(0);
        let y = work_area.position.y + PROMPT_MARGIN_TOP;
        window.set_position(PhysicalPosition::new(x, y))?;
    }

    Ok(())
}
