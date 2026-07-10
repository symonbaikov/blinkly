use tauri::{AppHandle, Runtime};
use tauri_plugin_autostart::ManagerExt;

pub(crate) fn should_sync_login_autostart() -> bool {
    // A debug Tauri binary depends on the Vite dev server. Registering it for
    // login autostart launches a broken app after reboot because Vite is absent.
    !cfg!(debug_assertions)
}

pub(crate) fn sync_login_autostart<R: Runtime>(app: &AppHandle<R>, enabled: bool, operation: &str) {
    if !should_sync_login_autostart() {
        tracing::debug!("Skipping login autostart sync in debug build");
        return;
    }

    let autostart = app.autolaunch();
    let result = if enabled {
        autostart.enable()
    } else {
        autostart.disable()
    };

    if let Err(error) = result {
        tracing::warn!("Failed to {operation} login autostart: {error}");
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn debug_builds_do_not_sync_login_autostart() {
        assert!(!super::should_sync_login_autostart());
    }
}
