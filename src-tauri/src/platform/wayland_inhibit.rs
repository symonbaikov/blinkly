use anyhow::{bail, Context, Result};
use raw_window_handle::{HasDisplayHandle, HasWindowHandle, RawDisplayHandle, RawWindowHandle};
use tauri::{Runtime, WebviewWindow};

/// Opaque handle returned by the C helper.
pub struct BreakInhibitor {
    handle: *mut std::ffi::c_void,
}

impl BreakInhibitor {
    /// Create inhibitors for the given overlay window.
    pub fn new<R: Runtime>(window: &WebviewWindow<R>) -> Result<Self> {
        let (display_ptr, surface_ptr) = wayland_handles(window)?;

        // SAFETY: the C helper only sends requests on the foreign surface and
        // never changes its dispatcher. The display/surface outlive the break.
        let handle = unsafe { blinkly_inhibit_create(display_ptr, surface_ptr) };

        if handle.is_null() {
            bail!("Wayland compositor did not provide required inhibitors");
        }

        Ok(Self { handle })
    }
}

impl Drop for BreakInhibitor {
    fn drop(&mut self) {
        if !self.handle.is_null() {
            // SAFETY: handle was created by blinkly_inhibit_create and is only
            // dropped once here.
            unsafe { blinkly_inhibit_destroy(self.handle) };
            self.handle = std::ptr::null_mut();
        }
    }
}

// SAFETY: BreakInhibitor is only created and dropped on the GTK main thread.
unsafe impl Send for BreakInhibitor {}
unsafe impl Sync for BreakInhibitor {}

extern "C" {
    fn blinkly_inhibit_create(
        display: *mut std::ffi::c_void,
        surface: *mut std::ffi::c_void,
    ) -> *mut std::ffi::c_void;
    fn blinkly_inhibit_destroy(handle: *mut std::ffi::c_void);
}

fn wayland_handles<R: Runtime>(
    window: &WebviewWindow<R>,
) -> Result<(*mut std::ffi::c_void, *mut std::ffi::c_void)> {
    let display_handle = window
        .display_handle()
        .context("resolve raw display handle")?;
    let window_handle = window
        .window_handle()
        .context("resolve raw window handle")?;

    let display_ptr = match display_handle.as_raw() {
        RawDisplayHandle::Wayland(handle) => handle.display.as_ptr(),
        other => bail!("overlay is not running on a Wayland display backend: {other:?}"),
    };

    let surface_ptr = match window_handle.as_raw() {
        RawWindowHandle::Wayland(handle) => handle.surface.as_ptr(),
        other => bail!("overlay is not running on a Wayland window backend: {other:?}"),
    };

    Ok((display_ptr, surface_ptr))
}
