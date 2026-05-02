# Look, I Did Things — Line-by-Line Walkthrough

A beginner's annotated tour of every meaningful section of your app. Read it next to the code: open `index.html`, `manifest.json`, and `service-worker.js` in another window and follow along.

The app is three files. `index.html` does almost everything — it has the HTML (the structure of the page), the CSS (the styling), and the JavaScript (the behavior) all in one file. `manifest.json` and `service-worker.js` are what make it installable as a PWA (Progressive Web App).

---

## File 1: `index.html`

### Lines 1–12 — The doctype and the file header comment

```
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- comment about Look, I Did Things v1 -->
```

`<!DOCTYPE html>` is a one-line declaration that tells the browser *"this is a modern HTML5 document, render it the modern way."* It's not optional — leave it out and browsers fall back to weird old behavior.

`<html lang="en">` opens the root element of the page. The `lang="en"` tells screen readers and search engines this page is in English.

`<head>` opens the head section, which contains information *about* the page (settings, fonts, metadata) but nothing the user actually sees on screen.

The big comment block in `<!-- ... -->` is just a note for humans. Browsers ignore HTML comments. They're there so you remember what this file does six months from now.

### Lines 14–16 — Character set, viewport, and title

```
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Look, I Did Things</title>
```

`charset="UTF-8"` tells the browser which character encoding to use. UTF-8 supports every language and every emoji. Always include this — without it, accented letters and emojis can render as gibberish.

The `viewport` meta tag is the most important one for mobile. `width=device-width` says *"make the page width match the actual phone screen, not pretend it's a desktop."* `initial-scale=1.0` says *"don't zoom in or out by default."* `viewport-fit=cover` lets the design extend behind the iPhone notch.

`<title>` is what shows in the browser tab and in bookmarks.

### Lines 18–29 — PWA hookups and icons

```
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#f4a535" />
<meta name="apple-mobile-web-app-capable" content="yes" />
... (apple-specific tags) ...
<link rel="icon" type="image/png" href="/icons/icon-192.png" />
```

`<link rel="manifest">` points to your `manifest.json` file. This is what tells the browser "I'm a Progressive Web App, here's the rulebook." Without this line, the install prompt never appears.

`theme-color` is the color the browser paints around the app — the address bar on Android, the title bar on Windows desktop. We picked your gold accent.

The Apple-specific tags exist because iPhones don't fully support the standard manifest yet. They're how iPhones learn the app's name, status bar style, and home-screen icon.

The `<link rel="icon">` is the favicon — the little image in the browser tab.

### Lines 31–37 — Loading Google Fonts

```
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans..." rel="stylesheet" />
```

`preconnect` is a performance hint: *"hey browser, you're about to need this server, start the connection now while you're parsing the rest of the page."* It shaves a fraction of a second off font loading.

The third `<link>` actually loads two fonts: **Playfair Display** (a serif font, used for headings) and **DM Sans** (a clean sans-serif, used for body text). The query string `wght@400;500;600;700` picks which weights (regular, medium, semibold, bold) to download.

### Lines 39–66 — Design tokens (CSS variables)

```css
:root {
  --bg: #0f0f13;
  --accent: #f4a535;
  ...
}
```

`:root` is a CSS selector that matches the whole document. Anything you put here is available everywhere on the page.

The lines starting with `--` are **custom properties**, a.k.a. CSS variables. `--bg` is your background color. `--accent` is your gold. `--radius` is `12px` — the roundedness of corners.

You use them everywhere else with `var(--bg)`. The huge benefit: change `--accent` from gold to teal in this one place, and every button, banner, and highlight in the entire app retypes itself in teal. This is called a **design token system** and it's how real apps stay consistent.

### Lines 68–84 — Reset and base styles

```css
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { background: var(--bg); ... }
```

`* { box-sizing: border-box; }` is one of the single most useful CSS rules ever. By default, when you set a box's width to `100px` and add `10px` of padding, the box is actually `120px` wide. With `border-box`, the padding is included *inside* the 100px. It makes layout sane.

Setting `margin: 0; padding: 0;` on `html, body` removes the small default margin browsers add around the page edge.

The `body { ... }` block sets the page-wide background, text color, font, line height, and a bottom padding so content never hides behind the bottom navigation bar. `env(safe-area-inset-bottom)` is the iPhone home-bar height — included so content respects modern phone hardware.

### Lines 86–93 — The `.app` container

```css
.app {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
}
```

Everything sits inside one `<div class="app">`. On mobile, it's capped at 480px wide and centered (`margin: 0 auto` is the classic centering trick). The 16px padding gives breathing room from the screen edge.

### Lines 95–135 — Header and carry-over banner styles

These style two things: the sticky header at the top (with the app brand and week label) and the carry-over banner that appears when you have undone tasks from last week.

`position: sticky; top: 0;` is what makes the header stay put as you scroll. `z-index: 10` is "stacking order" — higher numbers float above lower ones, so the header doesn't get covered by other content.

The banner uses your `--accent-soft` color (gold at 15% opacity) for a subtle glow.

### Lines 137–170 — Day tabs

These are the horizontal pill-shaped day buttons (Sun, Mon, Tue, Wed...) on the Week view on mobile.

`overflow-x: auto` lets them scroll sideways if they don't fit. `scrollbar-width: none` and `::-webkit-scrollbar { display: none }` hide the scrollbar in Firefox and Chrome respectively, for a cleaner look.

`.is-today` is the modifier class added when a tab represents the actual current day. `.is-active` is added when the user has selected that tab.

### Lines 172–196 — Section titles, sub-headings, progress bars

Reusable utility styles. The `.progress` is the gray track of a progress bar; `.progress-fill` is the colored part inside that grows from 0% to 100% width.

`.progress-fill.high`, `.mid`, `.low` are color variants depending on priority.

### Lines 198–265 — Task cards

This is the styling for an individual task row. Three important pieces:

- The **left border** (`border-left: 4px solid`) shows priority color — red, amber, or green.
- `.done` makes the card semi-transparent and adds a strikethrough.
- The **circular checkbox** uses CSS to draw a checkmark with `border-width: 0 2px 2px 0` and a 45° rotation — no checkmark image required, it's all CSS.

### Lines 267–273 — Empty state

When there are no tasks in a list, instead of showing nothing, we show an emoji and a message ("No tasks scheduled. Free day..."). This is friendlier than a blank screen.

### Lines 275–309 — Add form styling

The form inputs use your dark theme (`--surface` background, `--border` outline) and turn gold on focus. `form-row` is a 2-column grid for the day/priority side-by-side row.

The `.btn-primary:active { transform: scale(0.98) }` line gives the button a subtle press-down effect when tapped — a small detail that makes the app feel polished.

### Lines 311–349 — Stats and bar chart styles

Used in the Progress view. The `.day-bars` is a 7-column CSS grid (one column per day of the week) that draws little bar charts.

### Lines 351–362 — Celebration banner

The "All done for today" banner — gradient background, gold border. Only shows when every task for today is checked off.

### Lines 364–387 — Bottom navigation

The fixed bar at the bottom of mobile screens with 4 buttons: Week, Today, Add, Progress. `position: fixed` pins it to the viewport so it doesn't scroll away.

### Lines 389–391 — View visibility

```css
.view { display: none; }
.view.is-active { display: block; }
```

This is how the app shows only one screen at a time. All four `<section class="view">` blocks exist in the HTML simultaneously, but only the one with `is-active` added to it is visible. Switching tabs is just a class swap — no page navigation.

### Lines 393–485 — Desktop layout (`@media (min-width: 768px)`)

Everything inside this `@media` block only applies when the screen is **768 pixels wide or wider**. This is "responsive design" via "media queries."

Big changes that kick in on desktop:

- The `.app` becomes a 2-column grid: 220px sidebar on the left, content on the right.
- The bottom nav becomes that left sidebar.
- The Week view becomes a 7-column grid showing all days at once.
- The horizontal day tabs (`.day-tabs`) get hidden because the grid replaces them.
- The Add view splits into form-on-left, list-on-right.

This is **mobile-first CSS**: the base styles target phones, and overrides for bigger screens come later. It's the modern best practice.

### Lines 488–489 — Body opens, app container opens

```html
<body>
  <div class="app">
```

End of `<head>`, beginning of the visible page. Everything from here on is what the user actually sees.

### Lines 491–496 — The header

```html
<header class="header">
  <div class="header-row">
    <h1 class="brand">Look, I Did Things</h1>
    <span class="week-label" id="weekLabel">Week —</span>
  </div>
</header>
```

A flexbox row with the brand name on the left and a week label on the right. The label says "Week —" as a placeholder; JavaScript fills in the real week ("Week of Apr 27") on page load.

The `id="weekLabel"` is a unique handle so JavaScript can find this element later via `document.getElementById("weekLabel")`.

### Lines 498–505 — Carry-over banner

```html
<div id="carryBanner" class="carry-banner" hidden>
  <p id="carryText"></p>
  ...
</div>
```

The `hidden` attribute hides this element by default. JavaScript will remove `hidden` if there are undone tasks from last week.

### Lines 507–620 — The four views

These are the four `<section class="view">` blocks — Week, Today, Add, Progress. They all live in the HTML at the same time, but only one is `is-active` at any moment.

Quick tour:

- **Week view (511–523)**: A title, a sub-line, the day tabs (mobile), the day-list (mobile), and the 7-column grid (desktop). All initially empty — JavaScript fills them with your tasks.
- **Today view (526–531)**: Title, sub-line, a progress bar showing today's completion %, and the task list.
- **Add view (534–588)**: A `<form>` with a textarea for the task text, two `<select>` dropdowns for day and priority (in a side-by-side grid), and a category dropdown. To the right (on desktop), a list of all tasks added this week.
- **Progress view (591–618)**: Four "stat cards" — overall completion, by priority, by life area, and a bar chart by day.

### Lines 622–628 — Bottom navigation buttons

```html
<button class="nav-btn" data-view="week" ...><span class="icon">📅</span><span>Week</span></button>
```

Four buttons, each tagged with `data-view="week|today|add|progress"`. The JavaScript reads that `data-view` attribute when you tap a button and switches to the matching view. `data-*` attributes are the standard way to attach custom info to an element.

---

### Lines 631–1111 — JavaScript (the brain)

The entire app's behavior. It's wrapped in one `<script>` tag and split into 14 commented sections.

### Lines 642–655 — Constants

```js
const STORAGE_KEY = "lidt_tasks";
const DAY_NAMES_FULL = ["Sunday","Monday",...];
const PRIORITY_ORDER = { high: 0, mid: 1, low: 2 };
```

`const` means "this value never changes." These are the lookup tables and named keys we use throughout. `STORAGE_KEY` is the name we'll save tasks under in localStorage. The `PRIORITY_ORDER` object is so we can sort by priority numerically (high=0 sorts before mid=1 sorts before low=2).

### Lines 657–663 — State

```js
const state = {
  tasks: [],
  activeView: "today",
  selectedDay: null,
};
```

The single source of truth for the app. Three fields: the tasks array, which view is currently showing, and which day is selected in the Week view. **Everything the UI shows is derived from this object.** Change the object, call `render()`, and the screen updates to match.

### Lines 665–691 — `loadTasks()` and `saveTasks()`

`loadTasks()` reads the saved tasks from localStorage. localStorage only stores strings, so we use `JSON.parse()` to turn the saved string back into a JavaScript array. The whole thing is wrapped in `try { } catch { }` so if anything goes wrong (corrupt data, first run), we return an empty array instead of crashing.

`saveTasks()` does the reverse — uses `JSON.stringify()` to turn the array into a string and saves it under `"lidt_tasks"`. We call this every time anything changes (add, toggle, delete).

### Lines 693–729 — Week-key logic

The trickiest math in the app. Every task is tagged with a `weekKey` like `"2026-W18"` so we know which week it belongs to.

`getWeekKey(date)` does three things: roll the date back to its Sunday (the start of the week), find Jan 1 of that year and roll it back to its Sunday too, then compute the week number as `(days between) / 7 + 1`.

`currentWeekKey()` returns the key for today's week. `previousWeekKey()` subtracts 7 days and returns that key. These are how the carry-over banner finds last week's undone tasks.

`currentWeekLabel()` returns a friendlier "Week of Apr 27" string for the header.

### Lines 731–772 — Task operations

The four actions you can perform on tasks:

- **`addTask`** — creates a new task object with a unique `id` (made by combining the timestamp and a random string), trims whitespace from the text, tags it with the current week, and pushes it onto the array.
- **`toggleTask`** — finds the task by id and flips its `done` value from true to false or vice versa.
- **`deleteTask`** — uses `.filter()` to return a new array without that task, replacing the original.
- **`carryOverFromLastWeek`** — loops through every task; for any that's tagged with last week's key and is not done, change its tag to this week's key.

Every one of these calls `saveTasks()` so the change is persisted.

### Lines 774–788 — Sorting and filtering

`sortTasks` returns tasks in this order: undone tasks first, then by priority (high→mid→low), then by creation time (oldest first). The `[...tasks]` syntax is a "spread" — it makes a copy of the array so the original isn't mutated.

The four one-line functions below filter the master list down to slices we care about: tasks for this week, for a specific day, for today, and undone tasks from last week.

### Lines 790–808 — `el()` helper

A small utility for building HTML elements in JavaScript. Instead of writing raw HTML strings (which is dangerous — see the comment about XSS), you call `el("div", { class: "task" }, "Hello")` and it builds a `<div class="task">Hello</div>` for you safely.

The reason for the safety: if a user types `<script>...</script>` as their task text, raw HTML insertion would *run that script*. Using `textContent` (which `el()` does internally for strings) treats it as text, not code. This is called preventing **XSS** (cross-site scripting).

### Lines 810–843 — `taskCard()`

Builds one task card. Three children: the circular checkbox (with a click handler that toggles done), the body (the text + meta pills), and the delete X button (with a confirm dialog before deleting). Returns the card element ready to be added to the page.

### Lines 845–856 — `renderTaskList()`

Takes a container element and an array of tasks. If the array is empty, shows the empty-state emoji and message. Otherwise, sorts the tasks and appends a card for each one. The line `container.innerHTML = ""` wipes whatever was there before — this is the simplest way to "re-render" a section.

### Lines 858–911 — `renderWeekView()`

Builds the Week view. On mobile, builds the day tabs (each tab shows the day name + the done/total count) and the list of tasks for the currently selected day, with a per-day progress bar above. On desktop, builds the 7-column grid where every day gets its own column.

### Lines 913–936 — `renderTodayView()`

Builds the Today view. Sets the title (e.g. "Today — Tuesday"), the sub-text (e.g. "3 of 5 complete"), the progress bar width, and either shows the celebration banner (if all done) or the task list.

### Lines 938–947 — `renderAddView()`

Mostly just renders the "Added this week" list on the right side. Also sets the day dropdown's default to today (but only if the user hasn't manually changed it — we track this with a `data-touched` attribute).

### Lines 949–1021 — `renderProgressView()`

The most stat-heavy view. Computes overall completion %, then breaks it down by priority, by category, and by day (the bar chart). The bar chart math is the only fiddly bit: each bar's height represents how many tasks that day has compared to the busiest day, and the colored fill represents what % of those are done.

### Lines 1023–1044 — `renderCarryBanner()`

Decides whether to show the "X tasks from last week not done. Carry them into this week?" banner. Hides it if there are no undone tasks, or if you've already dismissed it for the current week (we remember that dismissal in localStorage under a key like `lidt_carry_dismissed:2026-W18`).

Wires up the Confirm and Dismiss buttons.

### Lines 1046–1057 — `setView()`

Changes which view is active. Three steps: update `state.activeView`, swap the `is-active` class on the four `<section>` views, and swap the `is-active` class on the four nav buttons. Then re-render.

### Lines 1059–1071 — `render()`

The master function. Called any time anything changes. Updates the week label, renders the carry-over banner, then dispatches to whichever view is active. This keeps everything consistent — no out-of-sync UI.

### Lines 1073–1096 — Event wiring

Hooks up the page's event listeners:

- Each nav button calls `setView(...)` with its data-view value.
- The Add form's `submit` event creates a new task. `e.preventDefault()` stops the browser's default form behavior (which would reload the page). After adding, we clear the textarea and re-focus it so you can immediately type the next one — small detail, big productivity win.
- The day dropdown gets a `data-touched="1"` flag the first time you change it, so it stops auto-defaulting to today.

### Lines 1098–1106 — Service worker registration

```js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")...
  });
}
```

Checks if the browser supports service workers (most do). If yes, registers `service-worker.js` after the page finishes loading. This is what makes the offline + caching magic happen. We wait for `load` so we don't slow down the first paint.

### Lines 1108–1110 — Boot

```js
state.tasks = loadTasks();
setView("today");
```

The two lines that actually start the app. Load saved tasks into state, then show the Today view (which calls `render()` for you via `setView`). This runs immediately when the script tag is reached on first page load.

---

## File 2: `manifest.json`

```json
{
  "name": "Look, I Did Things",
  "short_name": "Did Things",
  "description": "An ADHD-friendly weekly attention tracker — see where your energy actually went.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0f0f13",
  "theme_color": "#f4a535",
  "categories": ["productivity", "lifestyle"],
  "icons": [ ... ]
}
```

Each key:

- **`name`** — full app name. Shown on the install prompt and splash screen.
- **`short_name`** — shorter version for under-the-icon labels on home screens.
- **`description`** — one-line summary, used in app stores and install dialogs.
- **`start_url`** — the URL the app opens to when launched from the home screen. `/` means "the root of the site."
- **`scope`** — the URLs that count as "inside" the app. If the user navigates outside this scope, it opens in a regular browser tab. `/` means the whole site.
- **`display`** — `"standalone"` means open without a browser address bar, like a real native app. Other options: `"fullscreen"`, `"minimal-ui"`, `"browser"`.
- **`orientation`** — locks the app to portrait mode on phones.
- **`background_color`** — the splash screen background while the app loads.
- **`theme_color`** — same as the meta tag in HTML — colors the OS chrome.
- **`categories`** — hints for app store classification.
- **`icons`** — array of icon definitions. We have three entries: 192px, 512px, and a "maskable" version (which lets Android crop the icon into circles, squircles, etc. without breaking the design).

---

## File 3: `service-worker.js`

A service worker is a JavaScript file the browser keeps running in the background, separate from any page. It can intercept network requests, which is what enables offline support and caching.

### Lines 18–25 — Cache version and app shell

```js
const CACHE_VERSION = "lidt-v1.0.0";
const APP_SHELL = ["/", "/index.html", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];
```

`CACHE_VERSION` is the name of the cache. **When you deploy new code, bump this string** (e.g. to `"lidt-v1.0.1"`) — the activate step below will then delete the old cache and make sure users get the fresh files.

`APP_SHELL` is the list of files to pre-cache on first visit. These five files are everything the app needs to boot — once cached, the app can launch even with no internet.

### Lines 27–34 — Install event

```js
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
```

Fires the very first time a user visits. We open a cache named after our version and dump the app shell into it. `event.waitUntil(...)` tells the browser "don't finish installing until this promise resolves."

`self.skipWaiting()` tells the browser to activate this new worker right away instead of waiting for old browser tabs to close.

### Lines 36–47 — Activate event

```js
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
```

Fires when a new worker takes over. We list every cache, delete any that aren't the current version (cleanup of old `lidt-v0.x.x` caches), and call `self.clients.claim()` to immediately take control of any open tabs (instead of waiting for them to be reloaded).

### Lines 53–90 — Fetch event

This is the hook that runs for every network request the app makes. We use **two strategies** depending on what's being requested.

For HTML pages (the page navigations themselves), we use **network-first**: try to fetch fresh from the server, and if that succeeds, also tuck a copy into the cache. If the network fails (offline), fall back to the cached version. This way, online users always see the latest version, and offline users still get the app.

For everything else (CSS, JS, images), we use **cache-first**: if it's in the cache, return it instantly without touching the network. If it's not, fetch it, return it, and tuck a copy into the cache for next time. This makes assets load instantly on repeat visits.

`req.method !== "GET"` skips POST/PUT/DELETE requests — those should always go straight to the network.

`url.origin !== self.location.origin` skips cross-origin requests (like Google Fonts) — let the browser handle those normally; we don't want to cache other people's stuff.

---

## How it all fits together — one user action

When you check off a task, here's the chain that fires:

1. Your finger taps the circular checkbox.
2. The `onclick` handler set in `taskCard()` runs: `toggleTask(t.id); render();`
3. `toggleTask` finds the task in `state.tasks`, flips `done`, calls `saveTasks()`.
4. `saveTasks()` JSON-stringifies the whole tasks array and writes it to localStorage under `"lidt_tasks"`.
5. `render()` runs, redraws the active view from the new state, and the checkbox now shows checked.

Total elapsed time: a few milliseconds. No server, no internet, no framework. Just state in, render out.

---

## What's NOT in v1 (for context)

These are deliberate omissions you'll add later:

- **No backend / database.** Data lives in this one browser. Clear the browser → lose data. Phase 3 fixes this with a Node + Postgres backend.
- **No accounts / sign-in.** Same browser = same data; no concept of "your" tasks.
- **No notifications or reminders.** Phase 2 adds EmailJS for morning emails, browser push for evening, and a Sunday summary.
- **No editing tasks.** You can add, toggle, and delete — but to edit text, you delete and re-add. Easy to add later.
- **No drag-to-reorder.** Tasks are sorted by priority + creation time, no manual reordering.

---

## Suggested reading order if you want to actually understand the code

1. Start with the **HTML body** (lines 488–629) — that's what you can *see*.
2. Then the **state + render pattern** in JS (lines 657–671 and 1059–1071) — that's the heart of the architecture.
3. Then `addTask` / `toggleTask` / `deleteTask` (lines 731–757) — the simplest functions, do real work.
4. Then any one of the `render*View()` functions — pick the simplest, `renderTodayView`, lines 913–936.
5. Save CSS (lines 39–485), week-key math (693–729), and the service worker for last — they're useful but not load-bearing for understanding the app.
