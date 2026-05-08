# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Look, I Did Things** 🦆 (formerly **FlowWeek**) is an ADHD-friendly weekly attention tracker. Tagline: *"A silly little app for proving you actually did stuff."* It is a **single-file PWA** — no framework, no build step, no backend. The entire app lives in `look-i-did-things/index.html`.

The problem it solves: for someone with ADHD, the question is rarely *"Did I finish everything?"* — it's *"Where did my energy go?"*, *"Am I neglecting something important?"*, *"Why do I feel like I did nothing even when I did a lot?"* The app helps surface **effort, attention, and balance** — not just completed tasks.

The mascot is **Done Duck** 🦆 — calm above water, paddling hard underneath. A metaphor for invisible effort. Done Duck shows up to celebrate completions. Future versions will let users pick from other support animals (Focus Frog, Task Raccoon, Star Snail, Tiny Tortoise, Brain Bee, Momentum Moth, Checklist Chicken, Goblin Assistant — see README).

## Running Locally

```bash
# From the look-i-did-things/ directory:
python3 -m http.server 5173
# then open http://localhost:5173
# or
npx serve .
```

The service worker only registers on `https://` or `http://localhost`, so always use a local server rather than opening the file directly.

## Deployment

Bump `CACHE_VERSION` in `look-i-did-things/service-worker.js` before deploying to force all clients to fetch fresh assets. The manifest and icons are in the same directory. Current icons are placeholder "FW" monograms — swap them out for Done Duck art when branding is ready.

## Architecture

**Single state object → mutate → save → render.** There is no framework; all reactivity is manual.

- `state` — one object holding all tasks and UI state. Persisted to `localStorage` under key `lidt_tasks`.
- **Views (4)**: Week View, Today View, Add Task, Attention Dashboard. All four containers exist in the DOM simultaneously; the active one is toggled via CSS classes.
- **Week keys**: tasks are grouped by ISO-8601 week strings (e.g. `"2026-W18"`). `getWeekKey(date)` walks back to the Sunday at or before the given date and computes the week number — canonical source for which week a task belongs to.
- **Render flow**: every action (add, toggle, delete, navigate) mutates `state`, calls `saveTasks()`, then calls `render()` which redraws the active view from scratch.

### Task model

```json
{
  "id": "task_001",
  "title": "Work on portfolio homepage",
  "day": "Tuesday",
  "lifeArea": "Creative",
  "priority": "High",
  "effort": "Deep",
  "status": "Started",
  "weekKey": "2026-W18",
  "createdAt": "2026-05-01",
  "completedAt": null,
  "carryOverCount": 1,
  "carryOverReason": "Too big",
  "notes": "Break into smaller pieces"
}
```

### Task statuses

Five statuses, not a simple checkbox:

| Status | Meaning |
| --- | --- |
| Not Started | No progress yet |
| Started | You touched it — this counts |
| Done | Completed |
| Moved | Intentionally moved to another day |
| Dropped | No longer relevant — closes the loop without guilt |

"Started" matters because beginning a task is real progress for someone with ADHD. "Dropped" matters because not every unfinished task should carry guilt into the next week.

### Attention scoring

```
Attention Score = Effort Points × Completion Status
```

- **Effort points**: Light = 1, Medium = 2, Deep = 3
- **Completion**: Done = 100%, Started = 50%, Not Started or Dropped = 0%

Drives the Life Attention Star Chart on the Attention Dashboard. Gives a more honest picture of where the week went than raw task counts.

### Carry-over reasons

When a task carries over to the next week, the user picks one of these — turning carry-over from a failure signal into a learning signal:

| Reason | Meaning |
| --- | --- |
| Too big | Needs to be broken down |
| Forgot | Needs a reminder or better visibility |
| Avoided | May be emotionally difficult or unclear |
| No time | Week was overloaded |
| Not important | Should be dropped or deprioritised |

## Design System

CSS custom properties are defined at the top of the `<style>` block in `index.html`. Key tokens (verify against the file before relying on them):

- Primary gold: `#f4a535` / background dark: `#0f0f13`
- Standard radius: `12px`; small: `8px`
- Fonts: Playfair Display (headings), DM Sans (body) via Google Fonts

Layout is mobile-first with a single `768px` breakpoint. Rules outside any `@media` query target phones; the block under `@media (min-width: 768px)` overrides for tablets and desktops.

## Life Areas

Seven fixed areas drive the Life Attention Star Chart:

| Display name | Short form (in code) |
| --- | --- |
| Work / Career | Work |
| Learning | Learning |
| Health | Health |
| Creative Projects | Creative |
| Admin / Life Maintenance | Admin |
| Relationships / Social | Relationships |
| Rest / Recovery | Rest |

## Roadmap

| Phase | Status | What |
| --- | --- | --- |
| 1 | ✅ Built | Core app (FlowWeek): task manager, localStorage, responsive, PWA |
| 2 | 🔨 Active | Rebrand to "Look, I Did Things" + effort levels + star chart + done list + new statuses + carry-over reasons |
| 3 | Future | Today's 3, weekly review, attention warnings, task breakdown helper, energy check-in |
| 4 | Future | Node.js + Express + Postgres backend with sync and login |
| 5 | Future | Mascot chooser, recurring routines, push notifications, weekly summary email |

V2 work happens on the `v2-development` branch; `main` holds the stable V1 deployed version.

## Key Docs

- `look-i-did-things/README.md` — product vision, feature spec, and roadmap
- `look-i-did-things/WALKTHROUGH.md` — line-by-line code explanation (read this before making structural changes)

## Progress Log

The `progress/` folder contains summaries of past work sessions, organised into per-day subfolders like `progress/2026-05-07/`. Each subfolder has two files: a structured `YYYY-MM-DD-slug.md` log with numbered headings, exact commands, file names, and gotchas; and a `YYYY-MM-DD-slug-overview.txt` written in flowing prose for fast skimming. See `progress/README.md` for the convention and `progress/TEMPLATE.md` for the format.

## Catch Me Up

When the user says **"catch me up"** (or close variants like "where are we", "what was I working on", "let's continue", "what was the last thing", "/catch-up"), do this BEFORE starting any new work:

### Step 1 — Read every overview, oldest first

List the contents of `progress/` and identify every dated subfolder. Sort them by date ascending (oldest first). For each subfolder, read the `*-overview.txt` file. Reading them oldest-to-newest builds a mental timeline of how the project got to where it is today, not just a snapshot of the latest moment.

The overviews are written specifically as the prose, low-jargon recap layer — they're the right size for absorbing a lot of history without burning context. Read them all, even if there are many; they're short.

### Step 2 — Dive into the structured logs only as needed

The matching `*.md` structured logs contain operational detail (exact file paths, exact commands, line numbers, decisions like "we tried X but went with Y", numbered step-by-step recipes). Don't read these all up front. Read a specific structured log only when:

- The user asks "remind me what command we ran to do X"
- The user asks about a specific decision or trade-off
- You need the precise file paths or git state from a particular session
- An overview references something you'd need exact detail for to act on it

### Step 3 — Read the project anchors

After the overviews, also read:

- `look-i-did-things/README.md` — product vision and feature spec
- `look-i-did-things/WALKTHROUGH.md` — line-by-line code explanation, especially before making structural changes

These give context that the per-session logs don't repeat (the *why* of the project, not just the *what* of last session).

### Step 4 — Run `git status` and `git branch --show-current`

Check what branch we're on and what's uncommitted. The progress logs describe what *was* committed; git tells you what's *currently* in the working tree. Both matter for picking up cleanly.

### Step 5 — Summarise back to Phiwe

In 6–10 sentences, tell him:
- The arc of the project so far (one or two sentences pulled from the oldest sessions)
- What was completed in the most recent session
- What's left unfinished or queued for "next time"
- Any open gotchas that affect today's work
- What branch we're on and whether there's anything uncommitted

Then ask what he'd like to pick up. Don't start coding until he answers.

## Wrap Up Session

When the user says **"wrap up session"** (or close variants like "let's wrap up", "end of session", "I'm taking a break", "/wrap-up-session"), follow this procedure. The point is to leave a clean handoff so future-Phiwe and future-Claude can pick up exactly where things left off — without him having to remember anything.

### Step 1 — Pick the source of truth

There are two modes. Choose based on what the user provided:

- **Mode A — User-written summary.** If the user has attached, pasted, or pointed to a text file with their own session notes (e.g. "here's my notes: notes.txt", or content pasted into the chat), use *that* as the source. Don't embellish or invent details beyond what they wrote — they captured what matters to them. Just reformat it into the structure below.
- **Mode B — Auto-generate from the conversation.** If no summary was provided, look back over the current conversation and reconstruct the session yourself. Identify: concrete things that got done (files created/changed, decisions made, bugs fixed), what's unfinished or queued for next time, and any gotchas worth remembering.

If it's ambiguous which mode applies, briefly ask before proceeding.

### Step 2 — Write two files

Write both of these to the `progress/` folder. Use today's date and a 2–4 word lowercase slug describing the session theme (e.g. `2026-05-02-add-progress-folder.md`). **Both files should be detailed and walk through what happened step by step — no terse one-line bullets.** Phiwe wants to be able to read these and actually relive the session, not just see a checklist.

#### 1. `progress/YYYY-MM-DD-slug.md` — structured log

Use this layout:

```markdown
# What I did

## 1. <Short heading for the first major thing>
Plain-English explanation of *what* was done and *why* it matters, in 1–3 sentences. If commands were run, include them in a fenced code block. If files were created or changed, name them.

## 2. <Next heading>
Same shape — explanation, then commands/file names if relevant.

(...continue numbering through every meaningful thing that happened. Don't skip "small" steps; setup steps matter for someone learning.)

# Where things stand
| Thing | Status |
| --- | --- |
| <thing> | ✅ Done / 🟡 In progress / ⬜ Not started |

# What's next / unfinished
- Concrete next actions, things half-finished, branches still open.

# Notes / gotchas
- Decisions made, surprises, identifiers worth remembering (usernames, emails, URLs, branch names), things that could trip up future-Claude or future-Phiwe.
```

The structured `.md` is what Claude reads next session, so prioritise concrete details — file paths, exact commands, branch names, "we tried X but went with Y" decisions. Numbered headings (not bullets) for *What I did* — bullets are fine inside sections.

#### 2. `progress/YYYY-MM-DD-slug-overview.txt` — plain-text overview

This is the friendly, readable version Phiwe skims on his phone or prints out. Plain text only — no markdown, no asterisks, no code fences. But it should still be **detailed**: walk through the same numbered steps from the `.md`, just rewritten as flowing prose paragraphs that explain things in plain English. Include the commands inline where they matter (e.g. `git init`, `git push -u origin main`). End with a short "where things stand" recap and a warm closing line.

Aim for the file to feel like a friend writing him a letter recapping the session — thorough, readable, no jargon dumps.

### Step 3 — Hand off cleanly

Link both files for the user using `computer://` links. Keep your message short — a one-line summary of what was logged and the two links. Don't add coaching or next-step suggestions; the wrap-up command is for stepping *away*, not for kicking off more work.
