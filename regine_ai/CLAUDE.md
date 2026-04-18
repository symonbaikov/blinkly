# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout — two codebases

This git repo (`regine_ai/`) holds the **original static prototype**. The **active Angular port** lives in a sibling directory `../regine-ai-angular/` (not tracked here). Both must be understood together — the Angular app is a port-in-progress of the prototype, and the prototype is the reference for visuals/behavior.

- `regine_ai/` (this repo) — React 18 + Babel-standalone loaded via CDN, no build step. Entry: `Rengine AI.html`. JSX in `components/`, data in `data/`, global CSS in `styles/theme.css`. Opens directly in a browser.
- `../regine-ai-angular/` — Angular 21 standalone app, reimplementation of the prototype.

When the user references screens/components by name (Landing, BrowseCatalog, Detail, Tweaks, PromptCard), they usually exist in **both** codebases — check the Angular version first, fall back to the JSX in `components/` as the reference.

## Angular app — commands

Run from `../regine-ai-angular/`:

```bash
npm start          # ng serve → http://localhost:4200
npm run build      # production build → dist/
npm run watch      # dev build with --watch
npm test           # Vitest via @angular/build:unit-test
```

Single test: the `test` builder is `@angular/build:unit-test` (Vitest under the hood). Vitest-style filtering applies — `npx vitest run path/to/file.spec.ts` or use `.only` / `.skip` in the spec. The generator-default `src/app/app.spec.ts` is broken (asserts an `h1 "Hello, regine-ai-angular"` that doesn't exist) — fix or delete when touching it.

Formatting: Prettier (`.prettierrc`: 100 width, single quotes, Angular parser for `.html`).

## Angular app — architecture

**Navigation is custom, not `@angular/router`.** `app.routes.ts` exports an empty `Routes = []` and `provideRouter(routes)` is registered but unused. Screen switching is driven by a signal in `StateService`:

- `state.navigate({ name: 'browse', id? })` sets the screen, persists to `localStorage['rengine-screen']`, scrolls to top.
- `src/app/app.html` picks the screen with a chain of `*ngIf="screen.name === '…'"` — **add new screens by adding another `*ngIf` branch**, not a route.
- Do not add `<router-outlet>`; do not introduce route-based navigation without converting the whole screen-switching mechanism.

**State is centralized in signals.** `src/app/services/state.service.ts` owns everything: `settings`, `screen`, `lang`, `favs`, `filters`, `searchQuery`, `toast`, `tweaksOpen`. Three `effect()`s persist to localStorage and push theme variables (`--accent`, `--surface`, fonts, density) onto `document.documentElement` via CSS `data-*` attributes. Theme values come from `ACCENTS` / `FONTS` maps inside the service.

**Two data sources, inconsistently used.** `services/api.service.ts` hits `http://localhost:3000/api` (no backend is checked in — assume the user runs one separately or uses the static dump). `services/store.service.ts` wraps it with loading signals. But several screens (e.g. `screens/account/account.component.ts`) import `PROMPTS_DATA` directly from the 729 KB static dump `services/data.ts` instead of going through the store. Prefer `StoreService` for new code; be aware the static dump exists for offline/fallback rendering.

**i18n is a plain dictionary, not `@angular/localize`.** `services/i18n.ts` exports `T['ru']` and `T['en']`. Components access it via `get t() { return T[this.state.lang()]; }` and read keys like `t.nav_about`. Add translations to both language maps — TypeScript won't catch a missing key because of the string-indexed access.

**Component conventions.**

- Standalone components only (no NgModules). Each has its own `imports` array.
- DI via `inject()` function, not constructor parameters — `state = inject(StateService);`.
- Template + TS are split files (`foo.component.ts` + `foo.component.html`). No inline templates.
- Per-component styles are discouraged: `angular.json` sets `anyComponentStyle` warning at 4 kB. Global styles live in `src/styles.css` (≈14 KB of theme vars + utility classes like `.btn`, `.container`, `.nav-link`).
- TS is strict (`strictTemplates`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`) — expect template errors on typos and bracket access on index signatures.

**Global keybinding.** `App` has `@HostListener('window:keydown')` that maps `Ctrl/Cmd+K` to `state.navigate({ name: 'search' })`. Don't duplicate the listener elsewhere.

## Prototype (`regine_ai/`) — how to run

No build step. Open `Rengine AI.html` directly in a browser (or serve with any static server). Babel-standalone compiles JSX at runtime; React 18 comes from unpkg. The `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` marker in the inline script around the `DEFAULTS` object is intentional — some external tooling rewrites it. Do not remove the comment markers when editing defaults.

## When porting prototype → Angular

The JSX components use React hooks and inline `localStorage` reads; the Angular versions replace these with `StateService` signals. When re-porting a screen: find the prototype file in `components/*.jsx`, locate the Angular counterpart in `../regine-ai-angular/src/app/screens/` or `components/`, and wire it through `StateService` / `StoreService` rather than copying the hook-based state.
