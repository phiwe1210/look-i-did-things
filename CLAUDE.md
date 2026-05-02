# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**FlowWeek** (rebranding to "Look, I Did Things") is an ADHD-friendly weekly task and attention tracker. It is a **single-file PWA** — no framework, no build step, no backend. The entire app lives in `FlowWeek App/index.html`.

## Running Locally

```sh
# From the "FlowWeek App" directory:
python -m http.server 5173
# or
npx serve .
```

The service worker only registers on `https://` or `http://localhost`, so always use a local server rather than opening the file directly.

## Deployment

Bump `CACHE_VERSION` in `FlowWeek App/service-worker.js` before deploying to force all clients to fetch fresh assets. The manifest and icons are in the same directory.

## Architecture

**Single state object → mutate → save → render.** There is no framework; all reactivity is manual.

- `state` — one object holding all tasks and UI state. Persisted to `localStorage` under key `lidt_tasks`.
- **Views**: Week View, Today View, Add Task, Progress/Attention Dashboard. All four view containers exist in the DOM simultaneously; active view is toggled via CSS classes.
- **Week keys**: Tasks are grouped by ISO-8601 week strings (`"2026-W18"`). The `getWeekKey(date)` function is the canonical source for which week a date belongs to.
- **Task model**: each task has `id`, `title`, `area` (one of 7 life areas), `effort` (Light/Medium/Deep), `status` (Not Started/Started/Done/Moved/Dropped), `weekKey`, and optional carry-over metadata.

## Design System

CSS custom properties are defined at the top of the `<style>` block in `index.html`. Key tokens:

- Primary gold: `#f4a535` / background dark: `#0f0f13`
- Standard radius: `12px`; small: `8px`
- Fonts: Playfair Display (headings), DM Sans (body) via Google Fonts

Layout is mobile-first with a single `768px` breakpoint for desktop.

## Life Areas

Seven fixed areas used throughout the app: **Work, Learning, Health, Creative, Admin, Relationships, Rest.** These drive the radar chart (Life Attention Star Chart) in the Attention Dashboard.

## Key Docs

- `FlowWeek App/README.md` — product vision, feature spec, and roadmap
- `FlowWeek App/WALKTHROUGH.md` — line-by-line code explanation (read this before making structural changes)
