use std::env;
use std::io::ErrorKind;
use std::process::{Command, Stdio};

use anyhow::{anyhow, bail, Result};
use zbus::blocking::{Connection, Proxy};
use zbus::zvariant::OwnedObjectPath;

struct DbusLockMethod {
    destination: &'static str,
    path: &'static str,
    interface: &'static str,
    method: &'static str,
}

struct LockCommand {
    program: &'static str,
    args: &'static [&'static str],
    spawn_only: bool,
    x11_only: bool,
}

const DBUS_LOCK_METHODS: &[DbusLockMethod] = &[
    DbusLockMethod {
        destination: "org.gnome.ScreenSaver",
        path: "/org/gnome/ScreenSaver",
        interface: "org.gnome.ScreenSaver",
        method: "Lock",
    },
    DbusLockMethod {
        destination: "org.freedesktop.ScreenSaver",
        path: "/ScreenSaver",
        interface: "org.freedesktop.ScreenSaver",
        method: "Lock",
    },
];

const LOCK_COMMANDS: &[LockCommand] = &[
    LockCommand {
        program: "xdg-screensaver",
        args: &["lock"],
        spawn_only: false,
        x11_only: true,
    },
    LockCommand {
        program: "gnome-screensaver-command",
        args: &["-l"],
        spawn_only: false,
        x11_only: false,
    },
    LockCommand {
        program: "dm-tool",
        args: &["lock"],
        spawn_only: false,
        x11_only: false,
    },
    LockCommand {
        program: "qdbus6",
        args: &["org.freedesktop.ScreenSaver", "/ScreenSaver", "Lock"],
        spawn_only: false,
        x11_only: false,
    },
    LockCommand {
        program: "qdbus",
        args: &["org.freedesktop.ScreenSaver", "/ScreenSaver", "Lock"],
        spawn_only: false,
        x11_only: false,
    },
    LockCommand {
        program: "dbus-send",
        args: &[
            "--session",
            "--dest=org.freedesktop.ScreenSaver",
            "--type=method_call",
            "/ScreenSaver",
            "org.freedesktop.ScreenSaver.Lock",
        ],
        spawn_only: false,
        x11_only: false,
    },
    LockCommand {
        program: "dbus-send",
        args: &[
            "--session",
            "--dest=org.gnome.ScreenSaver",
            "--type=method_call",
            "/org/gnome/ScreenSaver",
            "org.gnome.ScreenSaver.Lock",
        ],
        spawn_only: false,
        x11_only: false,
    },
    LockCommand {
        program: "swaylock",
        args: &["-f"],
        spawn_only: true,
        x11_only: false,
    },
    LockCommand {
        program: "waylock",
        args: &[],
        spawn_only: true,
        x11_only: false,
    },
    LockCommand {
        program: "hyprlock",
        args: &[],
        spawn_only: true,
        x11_only: false,
    },
];

pub fn lock_screen() -> Result<()> {
    let session_type = env::var("XDG_SESSION_TYPE")
        .unwrap_or_default()
        .to_ascii_lowercase();
    let mut failures = Vec::new();

    if try_login1_dbus_lock(&mut failures) {
        return Ok(());
    }

    if try_dbus_lock(&mut failures) {
        return Ok(());
    }

    if try_loginctl_lock(&mut failures) {
        return Ok(());
    }

    for candidate in LOCK_COMMANDS {
        if candidate.x11_only && session_type == "wayland" {
            continue;
        }

        match try_lock(candidate) {
            Ok(true) => {
                tracing::info!(program = candidate.program, "screen lock command succeeded");
                return Ok(());
            }
            Ok(false) => continue,
            Err(error) => {
                tracing::warn!(program = candidate.program, error = %error, "screen lock command failed");
                failures.push(format!("{}: {error}", candidate.program));
            }
        }
    }

    if failures.is_empty() {
        bail!(
            "Could not lock the screen automatically. No supported screen lock command was found on this system."
        );
    }

    Err(anyhow!(
        "Could not lock the screen automatically. Tried: {}",
        failures.join("; ")
    ))
}

fn try_login1_dbus_lock(failures: &mut Vec<String>) -> bool {
    let conn = match Connection::system() {
        Ok(conn) => conn,
        Err(error) => {
            failures.push(format!("system bus: {error}"));
            return false;
        }
    };

    let manager = match Proxy::new(
        &conn,
        "org.freedesktop.login1",
        "/org/freedesktop/login1",
        "org.freedesktop.login1.Manager",
    ) {
        Ok(proxy) => proxy,
        Err(error) => {
            failures.push(format!("login1 manager proxy: {error}"));
            return false;
        }
    };

    let sessions: Vec<(String, u32, String, String, OwnedObjectPath)> =
        match manager.call("ListSessions", &()) {
            Ok(sessions) => sessions,
            Err(error) => {
                failures.push(format!("login1 ListSessions: {error}"));
                return false;
            }
        };

    let Some(session_id) = select_graphical_session(&conn, &sessions) else {
        failures.push("login1: no active graphical user session found".to_string());
        return false;
    };

    match manager.call_method("LockSession", &(session_id.as_str(),)) {
        Ok(_) => {
            tracing::info!(session_id, "screen lock succeeded via login1 D-Bus");
            true
        }
        Err(error) => {
            tracing::warn!(session_id, error = %error, "screen lock failed via login1 D-Bus");
            failures.push(format!("login1 LockSession({session_id}): {error}"));
            false
        }
    }
}

fn select_graphical_session(
    conn: &Connection,
    sessions: &[(String, u32, String, String, OwnedObjectPath)],
) -> Option<String> {
    let mut active_user_session = None;

    for (session_id, _uid, _user, _seat, path) in sessions {
        let proxy = match Proxy::new(
            conn,
            "org.freedesktop.login1",
            path.as_str(),
            "org.freedesktop.login1.Session",
        ) {
            Ok(proxy) => proxy,
            Err(error) => {
                tracing::warn!(session_id, error = %error, "failed to inspect login1 session proxy");
                continue;
            }
        };

        let active = proxy.get_property::<bool>("Active").ok().unwrap_or(false);
        let class = proxy
            .get_property::<String>("Class")
            .ok()
            .unwrap_or_default();
        let session_type = proxy
            .get_property::<String>("Type")
            .ok()
            .unwrap_or_default();

        if active && class == "user" && (session_type == "wayland" || session_type == "x11") {
            return Some(session_id.clone());
        }

        if active && class == "user" && active_user_session.is_none() {
            active_user_session = Some(session_id.clone());
        }
    }

    active_user_session
}

fn try_dbus_lock(failures: &mut Vec<String>) -> bool {
    let conn = match Connection::session() {
        Ok(conn) => conn,
        Err(error) => {
            failures.push(format!("session bus: {error}"));
            return false;
        }
    };

    for method in DBUS_LOCK_METHODS {
        match conn.call_method(
            Some(method.destination),
            method.path,
            Some(method.interface),
            method.method,
            &(),
        ) {
            Ok(_) => {
                tracing::info!(
                    destination = method.destination,
                    "screen lock D-Bus call succeeded"
                );
                return true;
            }
            Err(error) => {
                tracing::warn!(destination = method.destination, error = %error, "screen lock D-Bus call failed");
                failures.push(format!("{}: {error}", method.destination));
            }
        }
    }

    false
}

fn try_loginctl_lock(failures: &mut Vec<String>) -> bool {
    let Some(session_id) = env::var("XDG_SESSION_ID").ok().filter(|id| !id.is_empty()) else {
        return false;
    };

    match Command::new("loginctl")
        .args(["lock-session", session_id.as_str()])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
    {
        Ok(status) if status.success() => {
            tracing::info!(session_id, "screen lock command succeeded via loginctl");
            true
        }
        Ok(status) => {
            let message = format!("loginctl: exited with status {status}");
            tracing::warn!(session_id, status = %status, "screen lock command failed via loginctl");
            failures.push(message);
            false
        }
        Err(error) if error.kind() == ErrorKind::NotFound => false,
        Err(error) => {
            tracing::warn!(session_id, error = %error, "screen lock command errored via loginctl");
            failures.push(format!("loginctl: {error}"));
            false
        }
    }
}

fn try_lock(command: &LockCommand) -> Result<bool> {
    let mut process = Command::new(command.program);
    process
        .args(command.args)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    if command.spawn_only {
        match process.spawn() {
            Ok(_) => Ok(true),
            Err(error) if error.kind() == ErrorKind::NotFound => Ok(false),
            Err(error) => Err(error.into()),
        }
    } else {
        match process.status() {
            Ok(status) if status.success() => Ok(true),
            Ok(status) => Err(anyhow!("exited with status {status}")),
            Err(error) if error.kind() == ErrorKind::NotFound => Ok(false),
            Err(error) => Err(error.into()),
        }
    }
}
