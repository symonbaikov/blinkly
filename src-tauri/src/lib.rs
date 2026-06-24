pub mod activity;
pub mod commands;
pub mod config;
pub mod events;
pub mod notifications;
pub mod overlay;
pub mod platform;
pub mod power;
pub mod prompt;
pub mod scheduler;
pub mod screen_lock;
pub mod stats;
pub mod storage;
pub mod tray;
pub mod updates;

use std::sync::Arc;

use config::ConfigManager;
use events::EventBus;
use scheduler::{SchedulerPort, TimerScheduler};
use storage::SqliteStorage;
use tauri::{image::Image, Manager, Runtime};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};

const APP_ICON: &[u8] = include_bytes!("../icons/icon.png");

fn apply_window_icons<R: Runtime>(app: &tauri::AppHandle<R>) {
    let Ok(icon) = Image::from_bytes(APP_ICON) else {
        tracing::warn!("Failed to load application icon for windows");
        return;
    };

    for label in ["overlay", "prompt", "settings"] {
        if let Some(window) = app.get_webview_window(label) {
            if let Err(error) = window.set_icon(icon.clone()) {
                tracing::warn!("Failed to apply icon to window '{label}': {error}");
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Runtime-agnostic spawn helper
// ---------------------------------------------------------------------------

/// Spawn a future on the available async runtime.
///
/// - In production (called from Tauri `.setup()`), there is no thread-local
///   Tokio handle yet, so we delegate to `tauri::async_runtime::spawn` which
///   uses Tauri's pre-initialized handle.
/// - In tests (`#[tokio::test]`), a thread-local handle exists, so we use it
///   directly — keeping tests independent of Tauri's runtime.
pub(crate) fn spawn_async<F>(future: F)
where
    F: std::future::Future<Output = ()> + Send + 'static,
{
    match tokio::runtime::Handle::try_current() {
        Ok(handle) => {
            handle.spawn(future);
        }
        Err(_) => {
            tauri::async_runtime::spawn(future);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_writer(std::io::stderr)
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    tracing::info!("App started");

    // Storage and Config can be created before the Tokio runtime starts
    // (they are synchronous).
    let db_path = dirs::data_dir()
        .expect("cannot resolve $XDG_DATA_HOME")
        .join("blinkly")
        .join("data.db");
    let storage: Arc<dyn storage::StoragePort> =
        Arc::new(SqliteStorage::new(&db_path).expect("failed to open database"));

    let bus = Arc::new(EventBus::new());
    let config_manager = Arc::new(ConfigManager::new(Arc::clone(&storage)));

    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(move |app| {
            apply_window_icons(app.handle());

            // Everything that calls tokio::spawn must run here, inside the
            // Tauri-managed Tokio runtime.

            // Sync autostart with saved preference on launch.
            {
                let autostart = app.autolaunch();
                let wants_autostart = config_manager.current().autostart;
                match autostart.is_enabled() {
                    Ok(false) if wants_autostart => {
                        if let Err(error) = autostart.enable() {
                            tracing::warn!("Failed to enable autostart on launch: {error}");
                        }
                    }
                    Ok(true) if !wants_autostart => {
                        if let Err(error) = autostart.disable() {
                            tracing::warn!("Failed to disable autostart on launch: {error}");
                        }
                    }
                    Err(error) => {
                        tracing::warn!("Failed to read autostart state on launch: {error}");
                    }
                    _ => {}
                }
            }

            // Activity Tracker
            use activity::ActivityTracker;
            let activity_source: Arc<dyn platform::ActivitySource> =
                Arc::new(platform::wayland::WaylandIdleSource::new());
            let _activity_tracker =
                ActivityTracker::new(activity_source, Arc::clone(&bus), config_manager.current());

            // Scheduler
            let scheduler = TimerScheduler::new(Arc::clone(&bus), config_manager.current());
            scheduler.start();

            // Tray icon and menu
            if let Err(error) =
                tray::build_tray(app.handle(), Arc::clone(&scheduler), Arc::clone(&bus))
            {
                tracing::warn!("Failed to build tray icon: {error}");
            }

            overlay::spawn_overlay_listener(app.handle().clone(), Arc::clone(&bus));
            prompt::spawn_prompt_listener(app.handle().clone(), Arc::clone(&bus));

            // Create the single Wayland inhibitor immediately so GNOME only has
            // to ask for permission once (on app startup) instead of every break.
            overlay::ensure_overlay_inhibitor_on_main_thread(app.handle());

            // Stats aggregator
            stats::spawn_stats_aggregator(Arc::clone(&storage), Arc::clone(&bus));

            // System notifications
            let notifier = notifications::create_system_notifier();
            notifications::spawn_notification_listener(Arc::clone(&notifier), Arc::clone(&bus));

            // Update checker
            updates::spawn_update_checker(app.handle().clone(), Arc::clone(&notifier));

            // Register managed state (accessible to IPC commands)
            app.manage(Arc::clone(&config_manager));
            app.manage(Arc::clone(&scheduler));
            app.manage(Arc::clone(&storage));
            app.manage(Arc::clone(&bus));

            Ok(())
        })
        .on_window_event(|window, event| {
            if window.label() == "overlay"
                && matches!(event, tauri::WindowEvent::Focused(false))
                && window
                    .try_state::<Arc<TimerScheduler>>()
                    .map(|scheduler| scheduler.state() == events::SchedulerState::OnBreak)
                    .unwrap_or(false)
            {
                let overlay = window.clone();
                crate::spawn_async(async move {
                    tokio::time::sleep(std::time::Duration::from_millis(10)).await;
                    let _ = overlay.set_focus();
                });
            }

            // The settings window is built on demand from the tray (see
            // `tray::open_settings`). We let it fully close/destroy here:
            // hiding + reusing it on GNOME/Wayland leaves the window-manager
            // decoration buttons unresponsive after the first reopen.
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_config,
            commands::set_config,
            commands::get_state,
            commands::get_remaining,
            commands::skip_break,
            commands::snooze_break,
            commands::defer_break,
            commands::pause_timer,
            commands::resume_timer,
            commands::lock_screen,
            commands::suspend_system,
            commands::get_skip_allowance,
            commands::get_stats,
            commands::check_for_update,
            commands::install_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
