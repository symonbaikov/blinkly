use std::sync::Arc;
use std::time::Duration;

use chrono::{DateTime, TimeZone};
use tauri::{AppHandle, State};
use tauri_plugin_autostart::ManagerExt;

use crate::config::{AppConfig, ConfigManager};
use crate::events::{AppEvent, EventBus, SchedulerState};
use crate::power;
use crate::scheduler::{SchedulerPort, TimerScheduler};
use crate::screen_lock;
use crate::storage::{DateRange, DayStat, StoragePort};
use crate::updates;

const MAX_DAILY_SKIPS: u32 = 4;

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SkipAllowance {
    pub used: u32,
    pub remaining: u32,
    pub limit: u32,
}

/// Tauri IPC error — serialized as a plain string for the frontend.
#[derive(Debug, serde::Serialize)]
pub struct IpcError(String);

impl<E: std::fmt::Display> From<E> for IpcError {
    fn from(e: E) -> Self {
        IpcError(e.to_string())
    }
}

type IpcResult<T> = std::result::Result<T, IpcError>;

// ---------------------------------------------------------------------------
// Config commands
// ---------------------------------------------------------------------------

/// Return the current application configuration.
#[tauri::command]
pub fn get_config(config_manager: State<Arc<ConfigManager>>) -> AppConfig {
    config_manager.current()
}

/// Validate and persist a new configuration.
#[tauri::command]
pub fn set_config(
    config: AppConfig,
    app_handle: AppHandle,
    config_manager: State<Arc<ConfigManager>>,
    bus: State<Arc<EventBus>>,
) -> IpcResult<()> {
    config_manager
        .update(config.clone())
        .map_err(IpcError::from)?;

    // Notify the rest of the app so timer/idle settings take effect immediately.
    bus.emit(AppEvent::ConfigUpdated(config.clone()));

    // Sync login autostart with the new preference.
    let autostart = app_handle.autolaunch();
    if config.autostart {
        if let Err(error) = autostart.enable() {
            tracing::warn!("Failed to enable autostart: {error}");
        }
    } else if let Err(error) = autostart.disable() {
        tracing::warn!("Failed to disable autostart: {error}");
    }

    Ok(())
}

// ---------------------------------------------------------------------------
// Scheduler commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn get_state(scheduler: State<Arc<TimerScheduler>>) -> SchedulerState {
    scheduler.state()
}

#[tauri::command]
pub fn get_remaining(scheduler: State<Arc<TimerScheduler>>) -> u64 {
    scheduler.remaining_secs()
}

#[tauri::command]
pub fn skip_break(
    scheduler: State<Arc<TimerScheduler>>,
    storage: State<Arc<dyn StoragePort>>,
) -> IpcResult<()> {
    let allowance = get_skip_allowance_impl(storage.inner())?;
    if allowance.remaining == 0 {
        return Err(IpcError(format!(
            "Daily skip limit reached ({MAX_DAILY_SKIPS} per day)."
        )));
    }

    scheduler.skip();
    Ok(())
}

#[tauri::command]
pub fn snooze_break(duration_secs: u64, scheduler: State<Arc<TimerScheduler>>) {
    scheduler.snooze(Duration::from_secs(duration_secs));
}

#[tauri::command]
pub fn defer_break(duration_secs: u64, scheduler: State<Arc<TimerScheduler>>) {
    scheduler.defer_break(Duration::from_secs(duration_secs));
}

#[tauri::command]
pub fn pause_timer(scheduler: State<Arc<TimerScheduler>>) {
    scheduler.pause();
}

#[tauri::command]
pub fn resume_timer(scheduler: State<Arc<TimerScheduler>>) {
    scheduler.resume();
}

#[tauri::command]
pub fn lock_screen() -> IpcResult<()> {
    screen_lock::lock_screen().map_err(IpcError::from)
}

#[tauri::command]
pub fn suspend_system() -> IpcResult<()> {
    power::suspend_system().map_err(IpcError::from)
}

#[tauri::command]
pub fn get_skip_allowance(storage: State<Arc<dyn StoragePort>>) -> IpcResult<SkipAllowance> {
    get_skip_allowance_impl(storage.inner())
}

fn get_skip_allowance_impl(storage: &Arc<dyn StoragePort>) -> IpcResult<SkipAllowance> {
    get_skip_allowance_at(storage, chrono::Local::now())
}

fn get_skip_allowance_at<Tz>(
    storage: &Arc<dyn StoragePort>,
    now: DateTime<Tz>,
) -> IpcResult<SkipAllowance>
where
    Tz: TimeZone,
    Tz::Offset: std::fmt::Display,
{
    let (start, end) = local_day_bounds_utc(now)?;

    let used = storage
        .count_breaks_by_status(&start, &end, "skipped")
        .map_err(IpcError::from)?;
    let remaining = MAX_DAILY_SKIPS.saturating_sub(used);

    Ok(SkipAllowance {
        used,
        remaining,
        limit: MAX_DAILY_SKIPS,
    })
}

fn local_day_bounds_utc<Tz>(now: DateTime<Tz>) -> IpcResult<(String, String)>
where
    Tz: TimeZone,
    Tz::Offset: std::fmt::Display,
{
    let timezone = now.timezone();
    let today = now.date_naive();
    let start_naive = today
        .and_hms_opt(0, 0, 0)
        .ok_or_else(|| IpcError("Invalid local start of day.".to_string()))?;
    let end_naive = today
        .succ_opt()
        .ok_or_else(|| IpcError("Invalid next local day.".to_string()))?
        .and_hms_opt(0, 0, 0)
        .ok_or_else(|| IpcError("Invalid local end of day.".to_string()))?;
    let start = timezone
        .from_local_datetime(&start_naive)
        .earliest()
        .ok_or_else(|| IpcError("Local start of day does not exist.".to_string()))?
        .with_timezone(&chrono::Utc)
        .to_rfc3339();
    let end = timezone
        .from_local_datetime(&end_naive)
        .earliest()
        .ok_or_else(|| IpcError("Local end of day does not exist.".to_string()))?
        .with_timezone(&chrono::Utc)
        .to_rfc3339();

    Ok((start, end))
}

// ---------------------------------------------------------------------------
// Stats commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn get_stats(
    range: DateRange,
    storage: State<Arc<dyn StoragePort>>,
) -> IpcResult<Vec<DayStat>> {
    storage.get_stats(&range).map_err(IpcError::from)
}

#[tauri::command]
pub async fn check_for_update(
    app_handle: tauri::AppHandle,
) -> IpcResult<Option<updates::UpdateInfo>> {
    updates::check_for_update(&app_handle)
        .await
        .map_err(IpcError::from)
}

#[tauri::command]
pub async fn install_update(app_handle: tauri::AppHandle) -> IpcResult<()> {
    updates::install_update(&app_handle)
        .await
        .map_err(IpcError::from)
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use chrono::{FixedOffset, TimeZone, Utc};

    use super::*;
    use crate::storage::{mock::MockStorage, BreakRecord, StoragePort};

    fn skipped_at(id: &str, started_at: chrono::DateTime<Utc>) -> BreakRecord {
        BreakRecord {
            id: id.to_string(),
            break_type: "short".to_string(),
            status: "skipped".to_string(),
            started_at: started_at.to_rfc3339(),
            ended_at: Some(started_at.to_rfc3339()),
        }
    }

    fn storage_with_breaks(records: Vec<BreakRecord>) -> Arc<dyn StoragePort> {
        let storage = Arc::new(MockStorage::new());
        for record in records {
            storage.record_break(&record).unwrap();
        }
        storage
    }

    #[test]
    fn skip_allowance_counts_skips_inside_local_day() {
        let tz = FixedOffset::east_opt(2 * 60 * 60).unwrap();
        let now = tz.with_ymd_and_hms(2026, 6, 30, 13, 0, 0).single().unwrap();
        let storage = storage_with_breaks(vec![
            skipped_at("previous-day", Utc.with_ymd_and_hms(2026, 6, 29, 21, 59, 59).unwrap()),
            skipped_at("first-today", Utc.with_ymd_and_hms(2026, 6, 29, 22, 0, 0).unwrap()),
            skipped_at("middle-today", Utc.with_ymd_and_hms(2026, 6, 30, 12, 0, 0).unwrap()),
            skipped_at("last-today", Utc.with_ymd_and_hms(2026, 6, 30, 21, 59, 59).unwrap()),
            skipped_at("next-day", Utc.with_ymd_and_hms(2026, 6, 30, 22, 0, 0).unwrap()),
        ]);

        let allowance = get_skip_allowance_at(&storage, now).unwrap();

        assert_eq!(allowance.used, 3);
        assert_eq!(allowance.remaining, 1);
        assert_eq!(allowance.limit, MAX_DAILY_SKIPS);
    }

    #[test]
    fn skip_allowance_resets_after_local_midnight() {
        let tz = FixedOffset::east_opt(2 * 60 * 60).unwrap();
        let now = tz.with_ymd_and_hms(2026, 7, 1, 0, 1, 0).single().unwrap();
        let storage = storage_with_breaks(vec![skipped_at(
            "previous-local-day",
            Utc.with_ymd_and_hms(2026, 6, 30, 21, 59, 59).unwrap(),
        )]);

        let allowance = get_skip_allowance_at(&storage, now).unwrap();

        assert_eq!(allowance.used, 0);
        assert_eq!(allowance.remaining, MAX_DAILY_SKIPS);
    }

    #[test]
    fn skip_allowance_remaining_saturates_at_zero() {
        let tz = FixedOffset::east_opt(2 * 60 * 60).unwrap();
        let now = tz.with_ymd_and_hms(2026, 6, 30, 13, 0, 0).single().unwrap();
        let storage = storage_with_breaks(
            (0..5)
                .map(|index| {
                    skipped_at(
                        &format!("skip-{index}"),
                        Utc.with_ymd_and_hms(2026, 6, 30, 12, index, 0).unwrap(),
                    )
                })
                .collect(),
        );

        let allowance = get_skip_allowance_at(&storage, now).unwrap();

        assert_eq!(allowance.used, 5);
        assert_eq!(allowance.remaining, 0);
    }
}
