# Look, I Did Things 🦆

> *"A silly little app for proving you actually did stuff."*

An ADHD-friendly weekly attention tracker. Not just a to-do list — a way to see where your energy actually went, celebrate invisible effort, and understand yourself better across the week.

The core problem this app solves: for someone with ADHD, the question is rarely "Did I finish everything?" It's "Where did my energy go?", "Am I neglecting something important?", "Why do I feel like I did nothing even when I did a lot?" This app helps you see **effort, attention, and balance** — not just completed tasks.

---

## What's in this folder

```
look-i-did-things/
├── index.html         ← the entire app: HTML + CSS + JavaScript
├── manifest.json      ← PWA identity (name, icon, colors)
├── service-worker.js  ← offline support + caching
├── icons/
│   ├── icon-192.png   ← app icon (192x192)
│   └── icon-512.png   ← app icon (512x512, also used as maskable)
└── README.md          ← this file
```

---

## Run it locally

A service worker only registers over `https://` or `http://localhost`, so opening the file directly with `file://` won't get you the full PWA experience. Use a tiny local server:

```bash
# Option 1 — Python (already on most machines)
python3 -m http.server 5173
# then open http://localhost:5173

# Option 2 — Node (if you have it)
npx serve .
```

---

## The mascot: Done Duck 🦆

Done Duck is the default mascot. Ducks look calm above the water while paddling hard underneath — which is a perfect metaphor for invisible effort. You may look fine on the outside while working hard to focus, start tasks, stay organised, and keep going.

Done Duck shows up to celebrate completions, cheer you through the done list, and remind you: effort still counts, even when progress isn't obvious.

In future versions, users will be able to choose their own support animal. Candidates include:
- 🐸 **Focus Frog** — jumps between lily pads, fits scattered attention moving between tasks
- 🦝 **Task Raccoon** — chaotic, clever, slightly messy, collects tasks like shiny objects
- 🐦 **Progress Pigeon** — silly city-bird energy, delivers tiny proof you did things
- 🐌 **Star Snail** — slow and cute, leaves a trail of progress, links to the star chart
- 🐢 **Tiny Tortoise** — slow progress, non-shame productivity
- 🐝 **Brain Bee** — busy, buzzing, moving between different flowers/tasks
- 🦋 **Momentum Moth** — drawn to little lights, fits ideas of focus, attention, small moments of progress
- 🐔 **Checklist Chicken** — nervous but determined, relatable for overwhelmed planners
- 👺 **Goblin Assistant** — silly task gremlin that hoards completed tasks and celebrates small wins

---

## Core concept: the Life Attention Star Chart

The star chart is the visual and emotional heart of the app. Instead of a progress bar, the Attention Dashboard shows a radar/star chart where each point represents a life area.

| Life Area | What it represents |
|---|---|
| Work / Career | Internship, client work, portfolio, business |
| Learning | Coding, art study, reading, courses |
| Health | Gym, running, sleep, meals, recovery |
| Creative Projects | Drawing, 3D, animation, writing, Ilanga Visiolabs |
| Admin / Life Maintenance | Cleaning, finance, errands, emails |
| Relationships / Social | Family, friends, dates, calls, community |
| Rest / Recovery | Breaks, hobbies, low-stimulation time |

The chart shows which areas are receiving the most attention during the week. Five small admin tasks shouldn't automatically "weigh" more than one deep creative session — which is why each task carries an **effort level**.

---

## Task fields

Each task has three key inputs beyond title and day:

| Field | Options | Purpose |
|---|---|---|
| Life Area | Work, Learning, Health, Creative, Admin, Relationships, Rest | Shows where the task belongs |
| Priority | Low, Medium, High | Shows importance |
| Effort | Light, Medium, Deep | Shows attention required |

The task data model:

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

---

## Task statuses

Instead of a simple checkbox, tasks have five statuses:

| Status | Meaning |
|---|---|
| Not Started | No progress yet |
| Started | You touched it — this counts |
| Done | Completed |
| Moved | Intentionally moved to another day |
| Dropped | No longer relevant — close the loop without guilt |

"Started" matters because with ADHD, beginning a task is often real progress. A started-but-unfinished task is not the same as something you completely avoided. "Dropped" matters because not every unfinished task should carry guilt into the next week.

---

## Attention scoring

Each task generates an **Attention Score** for its life area:

```
Attention Score = Effort Points × Completion Status
```

- Light = 1 point, Medium = 2 points, Deep = 3 points
- Done = full points, Started = 50%, Not Started or Dropped = 0

This gives a much more honest picture of where your week went than a raw task count.

---

## The four screens

### Week View
Day-by-day task layout. Shows effort level, life area, and status on each task. Includes a **Break Down Task** button for splitting vague tasks into smaller steps.

### Today View
Calm and focused. Separates tasks into sections to avoid overwhelm:

| Section | Purpose |
|---|---|
| Today's 3 | The three tasks that would make today feel successful |
| Quick Wins | Small tasks under 10 minutes |
| Deep Work | Tasks that need sustained focus |
| Later | Everything else |

Also includes a **Done List** — a running log of what you actually completed today, with effort level noted. This is the emotional core of the app: evidence that you are moving, even on messy days.

### Add Task
Task creation form with all the new fields: title, day, life area, priority, effort level, and optional notes.

### Attention Dashboard
The reflection hub. Contains:

1. **Weekly completion percentage** — the classic summary
2. **Life Attention Star Chart** — the radar showing where your attention went
3. **Planned vs Actual** — the Sunday planned-star compared against the actual completed-star. This reveals patterns: what you intended to focus on versus what you actually did, what keeps getting ignored, what is consuming more time than expected.
4. **Insight cards** — e.g. "Creative Projects received the most attention this week", "Health and Rest received the least attention", "Admin tasks are carrying over most often"
5. **Weekly Review prompts** — guided reflection for Sunday

---

## Carry-over reasons

When a task carries over to the next week, the app prompts for a reason. This turns carry-over from a failure signal into a learning signal:

| Reason | Meaning |
|---|---|
| Too big | Needs to be broken down |
| Forgot | Needs a reminder or better visibility |
| Avoided | May be emotionally difficult or unclear |
| No time | Week was overloaded |
| Not important | Should be dropped or deprioritised |

---

## Attention warnings (gentle, not shaming)

The app can flag patterns without sounding negative. Examples:

| Pattern | Message |
|---|---|
| Too many deep tasks in one day | "This day may be overloaded." |
| No rest tasks planned | "Add at least one recovery block?" |
| Same task carried over twice | "This task may need to be broken down." |
| One life area dominates the week | "Most attention is going to Work. Is that intentional?" |
| Low completion but high started count | "You started a lot. Consider fewer tasks tomorrow." |

---

## Done List / Evidence Log

A key feature for ADHD. Shows completed tasks by day, life area, and effort level. The function is emotional: it gives you evidence that you are moving, even on messy weeks.

Example:
| Day | Done |
|---|---|
| Monday | 2 admin tasks, 1 deep creative task |
| Tuesday | Gym, cleaned workspace, coded for 45 minutes |
| Wednesday | Handled emails, updated portfolio, rested intentionally |

---

## Weekly Review (Sunday Reset)

Sunday is not only for carry-over planning — it becomes a Weekly Reset. The review prompts:

- What got most of my attention this week?
- What did I neglect?
- What am I proud of?
- What carried over and why?
- What is one area I want to protect next week?

The app then generates a short weekly summary, e.g.:

> "This week, most of your attention went to Creative Projects and Admin. Health and Rest were lower than planned. You completed 14 tasks, including 4 deep-focus tasks. Three tasks carried over, mostly because they were too large or unclear."

---

## Feature build priority for v2

| Priority | Feature | Why it matters |
|---|---|---|
| 1 | Effort levels | Makes progress more accurate than task count |
| 2 | Life Attention Star Chart | Gives the app its unique visual identity |
| 3 | Planned vs Actual attention | Shows how your week really unfolded |
| 4 | Done List / Evidence Log | Reduces the feeling of "I did nothing" |
| 5 | Carry-over reasons | Turns unfinished tasks into useful feedback |
| 6 | Today's 3 | Reduces overwhelm |
| 7 | Weekly Review | Helps with reflection and planning |

---

## Technical concepts

### localStorage
A small key-value store baked into every browser. Tasks are stored as a JSON-serialized array. It is private (only this site can read it), persistent (survives closing the tab), and per-browser-per-device (switching devices loses your data — the limitation that motivates a future backend).

### The week-key system
Every task carries a `weekKey` like `"2026-W18"` so the app knows which week it belongs to. The function `getWeekKey(date)` walks back to the Sunday at or before the date, then computes the week number. This is what makes carry-over work.

### State + render
One state object holds the tasks plus which view is active. Every action (add, toggle, delete, navigate) mutates state, calls `saveTasks()`, then calls `render()`. `render()` redraws the active view from scratch — the same pattern React uses, without the library.

### PWA manifest
`manifest.json` makes the site installable. It tells the browser the app's name, icons, theme color, and that it should open in `standalone` mode (no address bar, feels like a native app).

### Service worker
`service-worker.js` runs in the background and intercepts network requests so the app loads instantly from cache after the first visit, works offline, and updates cleanly when you redeploy (bump `CACHE_VERSION` in the worker to force a refresh).

### Responsive design
Mobile-first CSS. Rules outside any `@media` query target phones. The block under `@media (min-width: 768px)` overrides for tablets and desktops. One file, two layouts.

---

## Roadmap

| Phase | Status | What |
|---|---|---|
| 1 | ✅ Built | Core app (FlowWeek) — task manager, localStorage, responsive, PWA |
| 2 | 🔨 Next | Rebrand to Look, I Did Things + effort levels + star chart + done list + new statuses + carry-over reasons |
| 3 | Future | Today's 3, weekly review, attention warnings, task breakdown helper, energy check-in |
| 4 | Future | Node.js + Express + Postgres backend with sync and login |
| 5 | Future | Mascot chooser, recurring routines, push notifications, weekly summary email |

---

## Notes

- All your data is in `localStorage`. To back it up before clearing your browser, paste this in DevTools console: `copy(localStorage.getItem("lidt_tasks"))`.
- Bump `CACHE_VERSION` in `service-worker.js` whenever you change `index.html` and want returning users to pick up the new version.
- The icons are "FW" monograms — replace them with Done Duck art once branding is ready.
