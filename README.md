# Superwhisper — concept mockup

A Next.js mockup of a redesigned settings/UX for [Superwhisper](https://superwhisper.com), the macOS voice dictation app. Built to accompany a product feedback email to the Superwhisper team — not affiliated with or endorsed by them.

**Live demo:** [https://superwhisper-mockup.vercel.app](https://superwhisper-mockup.vercel.app)

Or run it locally at [http://localhost:3000](http://localhost:3000) (see below) — the root path redirects to `/settings`, which is the whole app.

## The idea

**Super is the base. A Mode is a diff against it, never a full config.**

Every dictation setting (language, formatting, output behavior, capture, privacy, model) lives in one place — `BaseSettings`. A custom Mode doesn't hold its own copy of every setting; it holds a `Partial<BaseSettings>` of only what it changes, and inherits everything else from Super. Editing a setting anywhere (Super's own page or a Mode's overrides) writes through the same state — never two sources of truth for one value.

This mockup pushes that architecture through the actual UI in a few concrete ways:

- **Daily Use vs Settings.** Home, Modes, and Dictionary are the primary sidebar — the things you touch daily. Account, Billing, General, Shortcuts, Sound, and Privacy live behind a Settings modal, one level down, closer to real macOS System Settings than to a typical web app's flat settings page.
- **Modes is a first-class tab**, not buried in Settings — competitors that lean on "Styles" (Wispr Flow, Willow) put that concept in the primary nav too, and Superwhisper's actual configurability is its real differentiator, not something to hide.
- **A Mode's editor starts small.** Custom instructions, activation (apps + shortcut), done — the same handful of fields VoiceInk needs for the same prompt-plus-auto-switch mechanism. Everything else (voice/language model, formatting, capture, privacy) lives in a named "Overrides" section, added on demand via "+ Add an override," ordered by when you added it rather than a fixed schema order.
- **Super's own page is directly editable** — grouped the same way a Mode is, with Models pinned first and "Recommended (S1-Voice)" / "Recommended (S1-Language)" as the default (server-decided, remotely changeable, still overridable to a concrete model).
- **Dictionary** splits Terms (recognized as-is, with an optional correction toggle — misspelling → fix) from Shortcuts (a short trigger phrase expanding to a longer block of text) — two different mechanisms that don't belong in the same list.
- **A live preview input** above the Modes list — type anything and watch it transform through each mode's actual settings in real time, instead of a hardcoded sample sentence.

## Fidelity constraints

Two rules held throughout:

1. **Match real macOS/Apple HIG conventions** — vibrancy, hairline (0.5px) borders, the SF Pro system font stack, native traffic-light chrome, System Settings' row/section patterns.
2. **Match the real Superwhisper product** where it's knowable (superwhisper.com/docs, its actual Mode screenshots) rather than inventing plausible-sounding features — and explicitly avoid reading as a copy of Wispr Flow or Willow, even when their patterns are worth learning from.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- shadcn/ui components on Radix primitives (Switch, Tabs, Separator, Slider)
- No backend — everything is client-side `useState`, in-memory, reset on reload. This is a visual/interaction mockup, not a working product.

## Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/settings`, which is the whole app.

## Structure

- `app/settings/page.tsx` — nearly the entire app: layout shell, all panels, all state. Large by design; this is a mockup, not a production codebase.
- `components/` — shared primitives (`mac-window`, `settings-window`, `detail-modal`, `inline-edit`, `popup-button`, `segmented-control`, `settings-parts`) plus `ui/` (shadcn-generated Radix wrappers).
- `app/globals.css` — the design token system: light/dark palettes, elevation tiers (`--shadow-surface` / `--shadow-modal` / `--shadow-popover`), hairline utilities.
