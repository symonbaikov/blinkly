//! Placement helpers for Blinkly's top-level windows on Linux desktops.
//!
//! Wayland compositors retain the final say for normal window placement. We
//! therefore use the system primary monitor as a placement request for normal
//! windows, while GTK's monitor-specific fullscreen API is used for the break
//! overlay.

use gtk::prelude::*;
use tauri::{PhysicalPosition, Runtime, WebviewWindow};

/// Fullscreen the window on the monitor selected as primary by the desktop.
///
/// This must run on GTK's main thread because `gtk_window` is main-thread
/// bound. If the primary monitor cannot be resolved, retain the regular Tauri
/// fullscreen behaviour instead of preventing a break from being shown.
pub fn fullscreen_on_primary_monitor<R: Runtime>(window: &WebviewWindow<R>) -> tauri::Result<()> {
    let gtk_window = window.gtk_window()?;
    let display = gtk_window.display();

    let Some(primary) = display.primary_monitor() else {
        tracing::warn!("Window placement: no primary monitor; using default fullscreen target");
        gtk_window.fullscreen();
        return Ok(());
    };

    let primary_index = (0..display.n_monitors())
        .find(|index| display.monitor(*index).as_ref() == Some(&primary));

    let Some(primary_index) = primary_index else {
        tracing::warn!("Window placement: primary monitor was not enumerated; using default fullscreen target");
        gtk_window.fullscreen();
        return Ok(());
    };

    // Re-evaluate on every break so a primary-monitor change made while
    // Blinkly is running takes effect on the next overlay.
    gtk_window.unfullscreen();
    gtk_window.fullscreen_on_monitor(&display.default_screen(), primary_index);
    tracing::debug!(primary_index, "Window placement: fullscreening overlay on primary monitor");
    Ok(())
}

/// Request that a normal window be centred in the primary monitor's work area.
///
/// Wayland compositors may ignore this request; callers re-apply it after the
/// window is mapped to give compliant compositors a second chance.
pub fn center_on_primary_monitor<R: Runtime>(window: &WebviewWindow<R>) -> tauri::Result<()> {
    let Some(monitor) = window.primary_monitor()? else {
        tracing::warn!("Window placement: no primary monitor; centring window normally");
        return window.center();
    };

    let work_area = monitor.work_area();
    let window_size = window.outer_size()?;
    let x = work_area.position.x
        + ((work_area.size.width as i32 - window_size.width as i32) / 2).max(0);
    let y = work_area.position.y
        + ((work_area.size.height as i32 - window_size.height as i32) / 2).max(0);

    window.set_position(PhysicalPosition::new(x, y))?;
    tracing::debug!(x, y, "Window placement: centred window on primary monitor");
    Ok(())
}

/// Request that a normal window be top-centred in the primary monitor's work
/// area, preserving the supplied top margin.
pub fn top_center_on_primary_monitor<R: Runtime>(
    window: &WebviewWindow<R>,
    margin_top: i32,
) -> tauri::Result<()> {
    let Some(monitor) = window.primary_monitor()? else {
        tracing::warn!("Window placement: no primary monitor; centring prompt normally");
        return window.center();
    };

    let work_area = monitor.work_area();
    let window_size = window.outer_size()?;
    let x = work_area.position.x
        + ((work_area.size.width as i32 - window_size.width as i32) / 2).max(0);
    let y = work_area.position.y + margin_top;

    window.set_position(PhysicalPosition::new(x, y))?;
    tracing::debug!(x, y, "Window placement: top-centred prompt on primary monitor");
    Ok(())
}
