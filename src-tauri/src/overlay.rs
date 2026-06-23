use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, Mutex, OnceLock,
};

use serde::Serialize;
use tauri::{AppHandle, Emitter, EventTarget, Manager, Runtime};
use tokio::sync::broadcast;

use crate::events::{AppEvent, BreakType, EventBus};
use crate::platform::wayland_inhibit::BreakInhibitor;

const OVERLAY_LABEL: &str = "overlay";

// ---------------------------------------------------------------------------
// Payloads sent to the frontend
// ---------------------------------------------------------------------------

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct BreakDuePayload {
    break_type: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct BreakTickPayload {
    remaining_secs: u64,
}

// ---------------------------------------------------------------------------
// Main-thread inhibitor state
// ---------------------------------------------------------------------------

/// The inhibitor must be created and dropped on the GTK main thread because
/// the underlying Wayland display is owned by GTK/WebKit and is not safe to
/// access from other threads.
static OVERLAY_INHIBITOR: OnceLock<Mutex<Option<BreakInhibitor>>> = OnceLock::new();

fn inhibitor_slot() -> &'static Mutex<Option<BreakInhibitor>> {
    OVERLAY_INHIBITOR.get_or_init(|| Mutex::new(None))
}

// ---------------------------------------------------------------------------
// Background listener
// ---------------------------------------------------------------------------

/// Spawns a task that bridges internal `AppEvent`s to Tauri window events.
///
/// Shows the overlay fullscreen window on break start, hides it on break end.
/// The React component uses polling to sync state after the window is shown,
/// avoiding any race conditions with event delivery.
pub fn spawn_overlay_listener<R: Runtime>(app: AppHandle<R>, bus: Arc<EventBus>) {
    let mut rx = bus.subscribe();

    crate::spawn_async(async move {
        let mut watchdog_stop: Option<Arc<AtomicBool>> = None;

        loop {
            match rx.recv().await {
                Ok(AppEvent::BreakDue { break_type }) => {
                    let break_type_str = match break_type {
                        BreakType::Short => "short",
                        BreakType::Long => "long",
                    };

                    if let Some(window) = app.get_webview_window(OVERLAY_LABEL) {
                        let _ = window.set_visible_on_all_workspaces(true);
                        let _ = window.show();
                        let _ = window.set_focus();

                        // Create the inhibitor on the main thread: the Wayland
                        // display is owned by GTK and must not be touched from
                        // a Tokio worker thread.
                        let app_for_main = app.clone();
                        let _ = app.run_on_main_thread(move || {
                            if let Some(window) = app_for_main.get_webview_window(OVERLAY_LABEL) {
                                match BreakInhibitor::new(&window) {
                                    Ok(inhibitor) => {
                                        *inhibitor_slot().lock().expect("inhibitor lock") =
                                            Some(inhibitor);
                                        tracing::info!("Overlay: Wayland inhibitors active");
                                    }
                                    Err(error) => {
                                        tracing::warn!(
                                            %error,
                                            "Overlay: failed to create Wayland inhibitors"
                                        );
                                    }
                                }
                            }
                        });

                        watchdog_stop = Some(spawn_focus_watchdog(window));
                    }

                    let _ = app.emit_to(
                        EventTarget::webview(OVERLAY_LABEL),
                        "break-due",
                        BreakDuePayload {
                            break_type: break_type_str.to_string(),
                        },
                    );
                    tracing::info!("Overlay: shown for {} break", break_type_str);
                }
                Ok(AppEvent::BreakTick { remaining_secs }) => {
                    let _ = app.emit_to(
                        EventTarget::webview(OVERLAY_LABEL),
                        "break-tick",
                        BreakTickPayload { remaining_secs },
                    );
                }
                Ok(AppEvent::BreakSkipped) | Ok(AppEvent::BreakSnoozed { .. }) => {
                    let _ = app.emit_to(EventTarget::webview(OVERLAY_LABEL), "break-completed", ());

                    release_inhibitor_on_main_thread(&app);
                    if let Some(stop) = watchdog_stop.take() {
                        stop.store(false, Ordering::Relaxed);
                    }

                    // Skip/snooze should feel instant — hide the overlay right away.
                    if let Some(window) = app.get_webview_window(OVERLAY_LABEL) {
                        let _ = window.hide();
                    }
                    tracing::info!("Overlay: hidden immediately (skip/snooze)");
                }
                Ok(AppEvent::BreakCompleted) => {
                    let _ = app.emit_to(EventTarget::webview(OVERLAY_LABEL), "break-completed", ());

                    release_inhibitor_on_main_thread(&app);
                    if let Some(stop) = watchdog_stop.take() {
                        stop.store(false, Ordering::Relaxed);
                    }

                    // Wait for the 3-second CSS fade-out animation to finish.
                    tokio::time::sleep(std::time::Duration::from_millis(3200)).await;
                    if let Some(window) = app.get_webview_window(OVERLAY_LABEL) {
                        let _ = window.hide();
                    }
                    tracing::info!("Overlay: hidden");
                }
                Err(broadcast::error::RecvError::Closed) => break,
                Err(broadcast::error::RecvError::Lagged(n)) => {
                    tracing::warn!("Overlay listener lagged {n} events");
                }
                _ => {}
            }
        }
    });
}

fn release_inhibitor_on_main_thread<R: Runtime>(app: &AppHandle<R>) {
    let app = app.clone();
    let _ = app.run_on_main_thread(move || {
        *inhibitor_slot().lock().expect("inhibitor lock") = None;
    });
}

fn spawn_focus_watchdog<R: Runtime>(window: tauri::WebviewWindow<R>) -> Arc<AtomicBool> {
    let active = Arc::new(AtomicBool::new(true));

    // The existing lib.rs focus handler also tries to restore focus, but a
    // polling watchdog catches cases where the compositor silently switches
    // focus without emitting a blur event.
    crate::spawn_async({
        let active = Arc::clone(&active);
        async move {
            while active.load(Ordering::Relaxed) {
                tokio::time::sleep(std::time::Duration::from_millis(150)).await;
                let _ = window.set_focus();
                let _ = window.set_always_on_top(true);
            }
        }
    });

    active
}
