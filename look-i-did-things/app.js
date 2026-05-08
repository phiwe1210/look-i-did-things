/* ================================================================
   LOOK, I DID THINGS — APPLICATION LOGIC
   ----------------------------------------------------------------
   Concepts you'll see used here:
     1. localStorage  — persist data in the browser, no server.
     2. State + render — keep one source of truth, redraw on change.
     3. Event delegation — one listener handles many task cards.
     4. Date math      — generate "week keys" so tasks belong to a week.
   ================================================================ */

// ---------- 1. CONSTANTS ----------------------------------------
// We store all tasks under one key in localStorage.
// A "key" is just a name. The value must be a string, so we
// JSON.stringify our array when saving, and JSON.parse when reading.
const STORAGE_KEY = "lidt_tasks";
const CARRY_DISMISS_KEY = "lidt_carry_dismissed"; // tracks which weeks user dismissed the banner for
const MASCOT_KEY = "lidt_mascot";                  // the user's chosen support animal (set on Page 4)

// Support mascots offered on the Choose Your Animal page (Page 4).
// Each entry maps to assets/mascots/<id>.png. Tint is the pastel
// fill class applied to the tile background.
const MASCOTS = [
  { id: "done-duck",     name: "Done Duck",     tagline: "Invisible effort counts.",       tint: "tile-yellow" },
  { id: "focus-frog",    name: "Focus Frog",    tagline: "Sit. Stare. Stay with it.",      tint: "tile-green"  },
  { id: "task-raccoon",  name: "Task Raccoon",  tagline: "Collects every little win.",     tint: "tile-beige"  },
  { id: "tiny-tortoise", name: "Tiny Tortoise", tagline: "Slow is still moving.",          tint: "tile-mint"   },
  { id: "brain-bee",     name: "Brain Bee",     tagline: "Busy in all directions.",        tint: "tile-cream"  },
  { id: "star-snail",    name: "Star Snail",    tagline: "Every step is a star moment.",   tint: "tile-lilac"  },
];

// Views that take over the whole screen and hide the header + bottom nav.
const ONBOARDING_VIEWS = new Set(["welcome", "signup", "signin", "choose"]);

const DAY_NAMES_FULL  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_NAMES_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const CATEGORIES = ["Work","Personal","Physical","Spiritual","Intellectual","Mental Health","Financial"];

const PRIORITY_ORDER = { high: 0, mid: 1, low: 2 };
const PRIORITY_LABEL = { high: "🔴 High", mid: "🟡 Mid", low: "🟢 Low" };

// ---------- 2. STATE --------------------------------------------
// One object holds everything the UI needs. When it changes, we re-render.
const state = {
  tasks: [],           // array of task objects, see data shape in README
  activeView: "today", // which view is showing
  selectedDay: null,   // which day is selected in the Week view (0-6)
  chosenMascot: localStorage.getItem(MASCOT_KEY) || null, // user's pick from Page 4
};

// ---------- 3. STORAGE HELPERS ----------------------------------
// Read tasks from localStorage. If anything goes wrong (corrupt data,
// first-ever run), return an empty array so the app still works.
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Could not load tasks:", e);
    return [];
  }
}

// Save the entire tasks array. We do this after every mutation.
// For thousands of tasks this would be slow, but for personal use
// (dozens per week) it's fine and keeps the code simple.
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch (e) {
    // localStorage can fail if disk is full or in private mode.
    console.error("Could not save tasks:", e);
    alert("Could not save your tasks. Storage may be full.");
  }
}

// ---------- 4. WEEK KEY LOGIC -----------------------------------
// Every task is tagged with a week key like "2026-W18" so we know
// which week it belongs to. Our weeks run Sunday → Saturday.
//
// Algorithm:
//   1. Find the Sunday at or before the date (start of that week).
//   2. Find Jan 1 of that Sunday's year, rolled back to its Sunday.
//   3. The week number = floor((days between) / 7) + 1.
function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // back to Sunday

  const yearStart = new Date(d.getFullYear(), 0, 1);
  yearStart.setDate(yearStart.getDate() - yearStart.getDay()); // its Sunday

  const diffMs = d - yearStart;
  const diffDays = Math.round(diffMs / 86400000);
  const weekNum = Math.floor(diffDays / 7) + 1;
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function currentWeekKey()  { return getWeekKey(new Date()); }
function previousWeekKey() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return getWeekKey(d);
}

// Friendly "Week of Apr 27" string for the header
function currentWeekLabel() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday of this week
  const month = d.toLocaleString(undefined, { month: "short" });
  return `Week of ${month} ${d.getDate()}`;
}

// ---------- 5. TASK OPERATIONS ----------------------------------
function addTask({ text, day, category, priority }) {
  const task = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    text: text.trim(),
    day: Number(day),
    category,
    priority,
    done: false,
    weekKey: currentWeekKey(),
    createdAt: Date.now(),
  };
  state.tasks.push(task);
  saveTasks();
}

function toggleTask(id) {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  saveTasks();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(x => x.id !== id);
  saveTasks();
}

// Move all undone tasks from previous week into the current week.
function carryOverFromLastWeek() {
  const prev = previousWeekKey();
  const cur  = currentWeekKey();
  let count = 0;
  state.tasks.forEach(t => {
    if (t.weekKey === prev && !t.done) {
      t.weekKey = cur;
      count++;
    }
  });
  if (count) saveTasks();
  return count;
}

// ---------- 6. SORTING & FILTERING ------------------------------
function sortTasks(tasks) {
  // Undone first, then High → Mid → Low, then by created time.
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (p !== 0) return p;
    return a.createdAt - b.createdAt;
  });
}

function tasksThisWeek()        { return state.tasks.filter(t => t.weekKey === currentWeekKey()); }
function tasksForDay(day)       { return tasksThisWeek().filter(t => t.day === day); }
function tasksForToday()        { return tasksForDay(new Date().getDay()); }
function undoneFromLastWeek()   { return state.tasks.filter(t => t.weekKey === previousWeekKey() && !t.done); }

// ---------- 7. SAFE DOM HELPERS ---------------------------------
// Always use textContent (not innerHTML) for user-supplied text.
// This prevents accidental script injection if a task contains "<script>".
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "html") node.innerHTML = v; // only for safe, non-user content
    else node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c == null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

// Build a single task card element
function taskCard(t, { showMeta = true } = {}) {
  const card = el("div", { class: `task priority-${t.priority} ${t.done ? "done" : ""}`, dataset: { id: t.id } });

  const checkbox = el("button", {
    class: `checkbox ${t.done ? "is-checked" : ""}`,
    "aria-label": t.done ? "Mark incomplete" : "Mark complete",
    onclick: (e) => { e.stopPropagation(); toggleTask(t.id); render(); },
  });

  const body = el("div", { class: "task-body" }, [
    el("div", { class: "task-text" }, t.text),
  ]);
  if (showMeta) {
    const meta = el("div", { class: "task-meta" }, [
      el("span", { class: "pill" }, DAY_NAMES_SHORT[t.day]),
      el("span", { class: "pill" }, t.category),
      el("span", { class: "pill" }, PRIORITY_LABEL[t.priority]),
    ]);
    body.appendChild(meta);
  }

  const del = el("button", {
    class: "delete",
    "aria-label": "Delete task",
    onclick: (e) => {
      e.stopPropagation();
      if (confirm("Delete this task?")) { deleteTask(t.id); render(); }
    },
  }, "×");

  card.append(checkbox, body, del);
  return card;
}

// Render a list of tasks (or an empty-state) into a container
function renderTaskList(container, tasks, emptyText = "No tasks yet.", opts = {}) {
  container.innerHTML = "";
  if (tasks.length === 0) {
    container.appendChild(el("div", { class: "empty" }, [
      el("span", { class: "emoji" }, opts.emptyEmoji || "🍃"),
      el("div", {}, emptyText),
    ]));
    return;
  }
  sortTasks(tasks).forEach(t => container.appendChild(taskCard(t, opts)));
}

// ---------- 8. VIEW RENDERERS -----------------------------------
function renderWeekView() {
  const today = new Date().getDay();
  const selected = state.selectedDay ?? today;

  // Mobile: day tabs
  const tabs = document.getElementById("dayTabs");
  tabs.innerHTML = "";
  DAY_NAMES_SHORT.forEach((name, i) => {
    const dayTasks = tasksForDay(i);
    const done = dayTasks.filter(t => t.done).length;
    const total = dayTasks.length;
    const tab = el("button", {
      class: `day-tab ${i === today ? "is-today" : ""} ${i === selected ? "is-active" : ""}`,
      dataset: { day: i },
      onclick: () => { state.selectedDay = i; render(); },
    }, [
      name,
      el("span", { class: "count" }, total ? `${done}/${total}` : "—"),
    ]);
    tabs.appendChild(tab);
  });

  // Mobile: tasks for selected day
  const list = document.getElementById("weekDayList");
  const selectedTasks = tasksForDay(selected);
  const heading = el("h3", { style: "font-family: var(--font-body); font-size:1rem; margin-bottom:8px;" },
    `${DAY_NAMES_FULL[selected]}${selected === today ? " (today)" : ""}`);
  list.innerHTML = "";
  list.appendChild(heading);
  // progress bar for the selected day
  const total = selectedTasks.length;
  const done = selectedTasks.filter(t => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  list.appendChild(el("div", { class: "progress" }, [el("div", { class: "progress-fill", style: `width:${pct}%` })]));
  const taskWrap = el("div");
  list.appendChild(taskWrap);
  renderTaskList(taskWrap, selectedTasks, "Nothing planned for this day yet.");

  // Desktop: 7-column grid
  const grid = document.getElementById("weekGrid");
  grid.innerHTML = "";
  DAY_NAMES_FULL.forEach((name, i) => {
    const col = el("div", { class: `day-column ${i === today ? "is-today" : ""}` });
    col.appendChild(el("h3", {}, name));
    const dayTasks = tasksForDay(i);
    if (dayTasks.length === 0) {
      col.appendChild(el("div", { class: "empty", style: "padding: 16px 4px; font-size: 0.8rem;" }, "—"));
    } else {
      sortTasks(dayTasks).forEach(t => col.appendChild(taskCard(t, { showMeta: false })));
    }
    grid.appendChild(col);
  });
}

// ---------- CHOOSE YOUR ANIMAL (Page 4) -------------------------
// Renders the 2-column grid of mascot tiles plus the bottom preview
// chip. The current selection lives on state.chosenMascot and is
// re-rendered on every click.
function renderChooseView() {
  const grid = document.getElementById("mascotGrid");
  if (!grid) return;
  grid.innerHTML = "";
  MASCOTS.forEach(m => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = `mascot-tile ${m.tint}`;
    tile.dataset.mascot = m.id;
    if (state.chosenMascot === m.id) tile.classList.add("is-selected");
    tile.innerHTML = `
      <span class="mascot-tile-check" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </span>
      <img class="mascot-tile-img" src="assets/mascots/${m.id}.png" alt="${m.name}">
      <span class="mascot-tile-name">${m.name}</span>
    `;
    tile.addEventListener("click", () => {
      state.chosenMascot = m.id;
      render();
    });
    grid.appendChild(tile);
  });

  // Preview chip + Continue button reflect the current selection.
  const preview     = document.getElementById("choosePreview");
  const previewImg  = document.getElementById("choosePreviewImg");
  const previewName = document.getElementById("choosePreviewName");
  const previewTag  = document.getElementById("choosePreviewTagline");
  const continueBtn = document.getElementById("chooseContinue");
  const chosen = MASCOTS.find(m => m.id === state.chosenMascot);
  if (chosen) {
    preview.hidden = false;
    previewImg.src = `assets/mascots/${chosen.id}.png`;
    previewImg.alt = chosen.name;
    previewName.textContent = chosen.name;
    previewTag.textContent = ` — ${chosen.tagline}`;
    continueBtn.disabled = false;
  } else {
    preview.hidden = true;
    continueBtn.disabled = true;
  }
}

function renderTodayView() {
  const today = new Date().getDay();
  const list = document.getElementById("todayList");
  const tasks = tasksForToday();
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  document.getElementById("todayTitle").textContent = `Today — ${DAY_NAMES_FULL[today]}`;
  document.getElementById("todaySub").textContent =
    total === 0 ? "No tasks scheduled. Free day, or add one in the Add tab." :
                  `${done} of ${total} complete`;
  document.getElementById("todayProgress").style.width = pct + "%";

  list.innerHTML = "";
  if (total > 0 && done === total) {
    list.appendChild(el("div", { class: "celebrate" }, [
      el("span", { class: "emoji" }, "🎉"),
      el("h3", {}, "All done for today"),
      el("p", { style: "color: var(--text-muted); margin: 0;" }, "Rest, recover, or get a head start on tomorrow."),
    ]));
  }
  renderTaskList(list, tasks, "No tasks scheduled for today.", { emptyEmoji: "☕" });
}

function renderAddView() {
  const list = document.getElementById("addThisWeekList");
  renderTaskList(list, tasksThisWeek(), "No tasks added yet this week.");

  // On first render, default the day dropdown to today
  const dayDropdown = document.getElementById("taskDay");
  if (!dayDropdown.dataset.touched) {
    dayDropdown.value = String(new Date().getDay());
  }
}

function renderProgressView() {
  const tasks = tasksThisWeek();
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  document.getElementById("overallPct").textContent = pct + "%";
  document.getElementById("overallBar").style.width = pct + "%";
  document.getElementById("overallCount").textContent = `${done} / ${total}`;
  document.getElementById("progressSub").textContent =
    total ? `${total} task${total === 1 ? "" : "s"} this week` : "No tasks this week yet.";

  // By priority
  const pStats = document.getElementById("priorityStats");
  pStats.innerHTML = "";
  ["high","mid","low"].forEach(p => {
    const items = tasks.filter(t => t.priority === p);
    const d = items.filter(t => t.done).length;
    const total = items.length;
    const pct = total ? Math.round((d / total) * 100) : 0;
    pStats.appendChild(el("div", {}, [
      el("div", { class: "stat-row" }, [
        el("span", { class: "label" }, PRIORITY_LABEL[p]),
        el("span", { class: "value" }, total ? `${d} / ${total}` : "—"),
      ]),
      el("div", { class: "progress" }, [
        el("div", { class: `progress-fill ${p}`, style: `width:${pct}%` }),
      ]),
    ]));
  });

  // By category
  const cStats = document.getElementById("categoryStats");
  cStats.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const items = tasks.filter(t => t.category === cat);
    if (items.length === 0) return;
    const d = items.filter(t => t.done).length;
    const total = items.length;
    const pct = total ? Math.round((d / total) * 100) : 0;
    cStats.appendChild(el("div", {}, [
      el("div", { class: "stat-row" }, [
        el("span", { class: "label" }, cat),
        el("span", { class: "value" }, `${d} / ${total}`),
      ]),
      el("div", { class: "progress" }, [
        el("div", { class: "progress-fill", style: `width:${pct}%` }),
      ]),
    ]));
  });
  if (!cStats.children.length) cStats.appendChild(el("p", { class: "section-sub", style: "margin:0;" }, "No tasks this week."));

  // By day (bar chart)
  const dayBars = document.getElementById("dayBars");
  dayBars.innerHTML = "";
  // Find max so all bars are scaled the same
  const dayCounts = DAY_NAMES_SHORT.map((_, i) => tasksForDay(i).length);
  const maxCount = Math.max(1, ...dayCounts);
  DAY_NAMES_SHORT.forEach((name, i) => {
    const items = tasksForDay(i);
    const d = items.filter(t => t.done).length;
    // The full bar represents max possible; the fill represents `done`,
    // but if no tasks, just an empty bar.
    const heightPct = items.length ? Math.round((d / items.length) * 100) : 0;
    const barHeight = (items.length / maxCount) * 100; // overall presence on day
    dayBars.appendChild(el("div", { class: "day-bar" }, [
      el("div", { class: "bar", style: `height:${barHeight}%` }, [
        el("div", { class: "bar-fill", style: `height:${heightPct}%` }),
      ]),
      el("div", { class: "name" }, name),
    ]));
  });
}

// ---------- 9. CARRY-OVER BANNER --------------------------------
function renderCarryBanner() {
  const banner = document.getElementById("carryBanner");
  const undone = undoneFromLastWeek();
  const dismissedKey = `${CARRY_DISMISS_KEY}:${currentWeekKey()}`;
  const dismissed = localStorage.getItem(dismissedKey) === "1";
  if (undone.length === 0 || dismissed) { banner.hidden = true; return; }

  banner.hidden = false;
  document.getElementById("carryText").textContent =
    `${undone.length} task${undone.length === 1 ? "" : "s"} from last week not done. Carry them into this week?`;

  document.getElementById("carryConfirm").onclick = () => {
    carryOverFromLastWeek();
    banner.hidden = true;
    render();
  };
  document.getElementById("carryDismiss").onclick = () => {
    localStorage.setItem(dismissedKey, "1");
    banner.hidden = true;
  };
}

// ---------- 10. NAVIGATION --------------------------------------
function setView(view) {
  state.activeView = view;
  // Update view visibility
  document.querySelectorAll(".view").forEach(v => v.classList.remove("is-active"));
  document.getElementById(`view-${view}`).classList.add("is-active");
  // Update nav button highlight
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("is-active", b.dataset.view === view);
  });
  // Onboarding views hide the header + nav by toggling a body class
  document.body.classList.toggle("is-onboarding", ONBOARDING_VIEWS.has(view));
  render();
}

// ---------- 11. MASTER RENDER -----------------------------------
// Called any time state changes. Re-renders only the active view
// (plus the banner, which is global). Keeps everything in sync.
function render() {
  document.getElementById("weekLabel").textContent = currentWeekLabel();
  renderCarryBanner();
  switch (state.activeView) {
    case "welcome":  /* static markup, nothing to re-render yet */ break;
    case "signup":   /* static markup, no dynamic rendering yet */ break;
    case "signin":   /* static markup, no dynamic rendering yet */ break;
    case "choose":   renderChooseView(); break;
    case "week":     renderWeekView(); break;
    case "today":    renderTodayView(); break;
    case "add":      renderAddView(); break;
    case "progress": renderProgressView(); break;
    case "review":   /* stub — will be built in Page 7 */ break;
  }
}

// ---------- 12. EVENT WIRING ------------------------------------
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => setView(btn.dataset.view));
});

document.getElementById("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.getElementById("taskText").value.trim();
  if (!text) return;
  addTask({
    text,
    day: document.getElementById("taskDay").value,
    category: document.getElementById("taskCategory").value,
    priority: document.getElementById("taskPriority").value,
  });
  // Reset only the text — keep day/category/priority for fast bulk entry
  document.getElementById("taskText").value = "";
  document.getElementById("taskText").focus();
  render();
});

document.getElementById("taskDay").addEventListener("change", (e) => {
  e.target.dataset.touched = "1";
});

// Page 1 — Welcome wiring.
// "Get Started" advances toward the chooser flow. Page 2 (Choose Your
// Animal) doesn't exist yet, so until it lands we drop the user on
// Today after dismissing welcome — the welcome won't appear again
// because we mark it dismissed in localStorage.
// Welcome → Sign Up (new users) / Sign In (returning users).
document.getElementById("welcomeStart").addEventListener("click", () => {
  setView("signup");
});
document.getElementById("welcomeContinue").addEventListener("click", () => {
  setView("signin");
});
document.getElementById("welcomeSignIn").addEventListener("click", (e) => {
  e.preventDefault();
  setView("signin");
});

// Auth pages — every "submit" / "guest" button marks onboarding
// done and drops the user into the Choose Your Animal page. Real
// auth lands with the backend (Phase 4).
function finishOnboarding() {
  localStorage.setItem("lidt_welcome_seen", "1");
  setView("choose");
}
document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  finishOnboarding();
});
document.getElementById("signupGuest").addEventListener("click", finishOnboarding);
document.getElementById("signupToSignin").addEventListener("click", (e) => {
  e.preventDefault();
  setView("signin");
});

document.getElementById("signinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  finishOnboarding();
});
document.getElementById("signinGuest").addEventListener("click", finishOnboarding);
document.getElementById("signinToSignup").addEventListener("click", (e) => {
  e.preventDefault();
  setView("signup");
});
document.getElementById("signinForgot").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Password reset is coming with the backend (Phase 4 in the roadmap).");
});

// Password show/hide toggle. Any element with [data-toggle-pw="<inputId>"]
// flips that input between password and text.
document.querySelectorAll("[data-toggle-pw]").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.togglePw);
    if (!input) return;
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });
});

// Choose Your Animal — back goes to welcome; Continue saves the
// pick and advances to Today (eventually Page 5: This Week).
document.getElementById("chooseBack").addEventListener("click", () => {
  setView("welcome");
});
document.getElementById("chooseContinue").addEventListener("click", () => {
  if (!state.chosenMascot) return;
  localStorage.setItem(MASCOT_KEY, state.chosenMascot);
  setView("today");
});

// ---------- 13. SERVICE WORKER REGISTRATION ---------------------
// Registers the offline cache. Only runs in production (via https or localhost).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .catch(err => console.warn("Service worker registration failed:", err));
  });
}

// ---------- 14. BOOT --------------------------------------------
state.tasks = loadTasks();

// First-time visitor (no mascot picked, welcome not yet dismissed) lands
// on the welcome screen. Returning users skip straight to Today.
// Onboarding gate: pick the right starting view based on how far
// the user has progressed.
//   - never seen welcome → welcome
//   - seen welcome but no mascot picked → choose
//   - mascot picked → today (the regular app)
const hasSeenWelcome = localStorage.getItem("lidt_welcome_seen") === "1";
const hasMascot      = !!localStorage.getItem(MASCOT_KEY);
let initialView;
if (hasMascot)             initialView = "today";
else if (hasSeenWelcome)   initialView = "choose";
else                       initialView = "welcome";
setView(initialView);
