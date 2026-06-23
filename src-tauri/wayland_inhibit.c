/*
 * Small C helper to create Wayland keyboard-shortcuts and pointer-confinement
 * inhibitors for the Blinkly break overlay.
 *
 * We do this in C rather than wayland-client because the overlay surface is
 * owned by GTK/WebKit. Using wayland-client's manage_object() on that surface
 * replaces GTK's dispatcher and causes crashes. The C helper only sends
 * requests that reference the foreign surface; it never changes the surface's
 * event handling.
 */

#include <wayland-client.h>
#include <wayland-util.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#include "keyboard-shortcuts-inhibit-unstable-v1-client-protocol.h"
#include "pointer-constraints-unstable-v1-client-protocol.h"

struct blinkly_inhibit_state {
    struct wl_display *display;
    struct wl_registry *registry;
    struct wl_seat *seat;
    struct wl_pointer *pointer;
    struct zwp_keyboard_shortcuts_inhibit_manager_v1 *kbd_manager;
    struct zwp_pointer_constraints_v1 *constraints;
    struct zwp_keyboard_shortcuts_inhibitor_v1 *inhibitor;
    struct zwp_confined_pointer_v1 *confined_pointer;
    int have_seat;
    int have_kbd_manager;
    int have_constraints;
};

static void registry_global(
    void *data,
    struct wl_registry *registry,
    uint32_t id,
    const char *interface,
    uint32_t version
) {
    (void)version;
    struct blinkly_inhibit_state *state = data;

    if (strcmp(interface, wl_seat_interface.name) == 0 && !state->have_seat) {
        state->seat = wl_registry_bind(registry, id, &wl_seat_interface, 1);
        if (state->seat) {
            state->pointer = wl_seat_get_pointer(state->seat);
            state->have_seat = 1;
        }
    } else if (
        strcmp(interface, zwp_keyboard_shortcuts_inhibit_manager_v1_interface.name) == 0
        && !state->have_kbd_manager
    ) {
        state->kbd_manager = wl_registry_bind(
            registry, id, &zwp_keyboard_shortcuts_inhibit_manager_v1_interface, 1
        );
        state->have_kbd_manager = 1;
    } else if (
        strcmp(interface, zwp_pointer_constraints_v1_interface.name) == 0
        && !state->have_constraints
    ) {
        state->constraints = wl_registry_bind(
            registry, id, &zwp_pointer_constraints_v1_interface, 1
        );
        state->have_constraints = 1;
    }
}

static void registry_global_remove(void *data, struct wl_registry *registry, uint32_t id) {
    (void)data;
    (void)registry;
    (void)id;
}

static const struct wl_registry_listener registry_listener = {
    .global = registry_global,
    .global_remove = registry_global_remove,
};

void blinkly_inhibit_destroy(void *handle);

void *blinkly_inhibit_create(void *display_ptr, void *surface_ptr) {
    struct blinkly_inhibit_state *state = calloc(1, sizeof(*state));
    if (!state) {
        return NULL;
    }

    state->display = (struct wl_display *)display_ptr;
    state->registry = wl_display_get_registry(state->display);
    if (!state->registry) {
        free(state);
        return NULL;
    }

    wl_registry_add_listener(state->registry, &registry_listener, state);

    if (wl_display_roundtrip(state->display) < 0) {
        blinkly_inhibit_destroy(state);
        return NULL;
    }

    if (!state->have_kbd_manager || !state->have_constraints || !state->have_seat) {
        blinkly_inhibit_destroy(state);
        return NULL;
    }

    state->inhibitor = zwp_keyboard_shortcuts_inhibit_manager_v1_inhibit_shortcuts(
        state->kbd_manager, (struct wl_surface *)surface_ptr, state->seat
    );
    // Confine (not lock) the pointer so the user can still move the cursor
    // inside the overlay and click buttons, but cannot leave the window.
    state->confined_pointer = zwp_pointer_constraints_v1_confine_pointer(
        state->constraints,
        (struct wl_surface *)surface_ptr,
        state->pointer,
        NULL,
        ZWP_POINTER_CONSTRAINTS_V1_LIFETIME_PERSISTENT
    );

    wl_display_flush(state->display);
    return state;
}

void blinkly_inhibit_destroy(void *handle) {
    struct blinkly_inhibit_state *state = (struct blinkly_inhibit_state *)handle;
    if (!state) {
        return;
    }

    if (state->inhibitor) {
        zwp_keyboard_shortcuts_inhibitor_v1_destroy(state->inhibitor);
    }
    if (state->confined_pointer) {
        zwp_confined_pointer_v1_destroy(state->confined_pointer);
    }
    if (state->pointer) {
        wl_pointer_destroy(state->pointer);
    }
    if (state->seat) {
        wl_seat_destroy(state->seat);
    }
    if (state->kbd_manager) {
        zwp_keyboard_shortcuts_inhibit_manager_v1_destroy(state->kbd_manager);
    }
    if (state->constraints) {
        zwp_pointer_constraints_v1_destroy(state->constraints);
    }
    if (state->registry) {
        wl_registry_destroy(state->registry);
    }
    if (state->display) {
        wl_display_flush(state->display);
    }
    free(state);
}
