use std::process::Command;

fn main() {
    tauri_build::build();
    build_wayland_inhibit();
}

fn build_wayland_inhibit() {
    let out_dir = std::env::var("OUT_DIR").expect("OUT_DIR not set");
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR not set");

    let protocols_dir = std::path::Path::new(&manifest_dir).join("wayland-protocols");
    let kbd_xml = protocols_dir.join("keyboard-shortcuts-inhibit-unstable-v1.xml");
    let ptr_xml = protocols_dir.join("pointer-constraints-unstable-v1.xml");

    let kbd_header = std::path::Path::new(&out_dir)
        .join("keyboard-shortcuts-inhibit-unstable-v1-client-protocol.h");
    let ptr_header =
        std::path::Path::new(&out_dir).join("pointer-constraints-unstable-v1-client-protocol.h");
    let kbd_code =
        std::path::Path::new(&out_dir).join("keyboard-shortcuts-inhibit-unstable-v1-protocol.c");
    let ptr_code =
        std::path::Path::new(&out_dir).join("pointer-constraints-unstable-v1-protocol.c");

    run_wayland_scanner("client-header", &kbd_xml, &kbd_header);
    run_wayland_scanner("private-code", &kbd_xml, &kbd_code);
    run_wayland_scanner("client-header", &ptr_xml, &ptr_header);
    run_wayland_scanner("private-code", &ptr_xml, &ptr_code);

    let mut build = cc::Build::new();
    build
        .file("wayland_inhibit.c")
        .file(kbd_code)
        .file(ptr_code)
        .include(&out_dir);

    if let Ok(wayland) = pkg_config::probe_library("wayland-client") {
        for include in &wayland.include_paths {
            build.include(include);
        }
    } else {
        // Fallback: most systems keep the headers in a standard location.
        println!("cargo:warning=pkg-config could not find wayland-client; relying on default include paths");
    }

    build.compile("wayland_inhibit");

    println!("cargo:rerun-if-changed=wayland_inhibit.c");
    println!("cargo:rerun-if-changed=wayland-protocols/keyboard-shortcuts-inhibit-unstable-v1.xml");
    println!("cargo:rerun-if-changed=wayland-protocols/pointer-constraints-unstable-v1.xml");
}

fn run_wayland_scanner(mode: &str, input: &std::path::Path, output: &std::path::Path) {
    let status = Command::new("wayland-scanner")
        .arg(mode)
        .arg(input)
        .arg(output)
        .status()
        .expect("failed to run wayland-scanner");

    if !status.success() {
        panic!("wayland-scanner {} failed for {:?}", mode, input);
    }
}
