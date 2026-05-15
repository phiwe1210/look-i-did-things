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
const SCHEMA_KEY  = "lidt_schema_version";         // bump to wipe legacy tasks on next load
const SCHEMA_VERSION = 2;                          // V2 = lifeArea + effort + capitalised priority

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

/* ----- V2 task model constants ---------------------------------
   The 7 Life Areas (canonical short-form ids from CLAUDE.md). The
   display label can differ from the id — "Relationships" stores
   internally but the chip label says "Social" per the wireframe.
   Each entry also carries its Lucide SVG icon shape. */
const LIFE_AREAS = [
  { id: "Creative",      label: "Creative",  icon: '<path d="M12 2a10 10 0 0 0 0 20c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/><circle cx="8.5" cy="7.5" r="1" fill="currentColor"/><circle cx="13.5" cy="6.5" r="1" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1" fill="currentColor"/><circle cx="6.5" cy="12.5" r="1" fill="currentColor"/>' },
  { id: "Health",        label: "Health",    icon: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>' },
  { id: "Learning",      label: "Learning",  icon: '<path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="M12 7v14"/>' },
  { id: "Admin",         label: "Admin",     icon: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>' },
  { id: "Work",          label: "Work",      icon: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
  { id: "Relationships", label: "Social",    icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { id: "Rest",          label: "Rest",      icon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' },
];

const EFFORTS = [
  { id: "Light",  label: "Light",  icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
  { id: "Medium", label: "Medium", icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  { id: "Deep",   label: "Deep",   icon: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>' },
];

const PRIORITIES = [
  { id: "Low",    label: "Low",    icon: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>' },
  { id: "Medium", label: "Medium", icon: '<path d="M5 12h14"/>' },
  { id: "High",   label: "High",   icon: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>' },
];

/* Day chip row visual order — Monday first (matches the wireframe).
   We still store day as JS getDay() (0=Sun…6=Sat) for compat with V1
   helpers, so the chip carries jsDay separately from its visual slot. */
const DAY_CHIPS = [
  { short: "Mon", jsDay: 1 },
  { short: "Tue", jsDay: 2 },
  { short: "Wed", jsDay: 3 },
  { short: "Thu", jsDay: 4 },
  { short: "Fri", jsDay: 5 },
  { short: "Sat", jsDay: 6 },
  { short: "Sun", jsDay: 0 },
];

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };
const PRIORITY_LABEL = { High: "🔴 High", Medium: "🟡 Medium", Low: "🟢 Low" };

// ---------- 2. STATE --------------------------------------------
// One object holds everything the UI needs. When it changes, we re-render.
const state = {
  tasks: [],           // array of task objects, see data shape in README
  activeView: "today", // which view is showing
  selectedDay: null,   // which day is selected in the Week view (0-6)
  chosenMascot: localStorage.getItem(MASCOT_KEY) || null, // user's pick from Page 4
  // Draft state for the Add a Thing form (Page 6). Lives here so
  // render() can redraw chip-selected states from a single source of
  // truth. Reset to defaults after each successful save.
  addDraft: {
    day:          new Date().getDay(),
    lifeArea:     null,
    effort:       null,
    priority:     null,
    inTodayThree: false,
  },
};

// ---------- 3. STORAGE HELPERS ----------------------------------
// Read tasks from localStorage. If anything goes wrong (corrupt data,
// first-ever run), return an empty array so the app still works.
//
// Schema check: if the stored SCHEMA_VERSION doesn't match the current
// constant, wipe tasks. V1 → V2 changes the task fields (lifeArea
// replaces category, effort added, priority capitalised) and the old
// rows aren't worth migrating for dev data — easier to start fresh.
function loadTasks() {
  try {
    const stored = Number(localStorage.getItem(SCHEMA_KEY) || 0);
    if (stored !== SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
      return [];
    }
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
// V2 task shape: lifeArea (one of LIFE_AREAS.id), effort (Light/Medium/
// Deep), priority (Low/Medium/High), inTodayThree boolean. The legacy
// `done` boolean stays around so the Today/Week/Progress views still
// work until they're rebuilt in Pages 5 and 7.
function addTask({ text, day, lifeArea, effort, priority, inTodayThree }) {
  const task = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    text: text.trim(),
    day: Number(day),
    lifeArea,
    effort,
    priority,
    inTodayThree: !!inTodayThree,
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
  // V2 priority storage is "Low"/"Medium"/"High" — map to the
  // existing lowercase CSS class names from V1 so the coloured
  // priority bar on each card still works.
  const priorityClass = String(t.priority || "").toLowerCase() || "medium";
  const card = el("div", { class: `task priority-${priorityClass} ${t.done ? "done" : ""}`, dataset: { id: t.id } });

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
      el("span", { class: "pill" }, t.lifeArea || ""),
      el("span", { class: "pill" }, PRIORITY_LABEL[t.priority] || t.priority || ""),
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

// Build a chip button. Used by the day row, life-area grid, effort
// and priority pill rows. Selection state is reflected by toggling
// the .is-selected class against the current value in state.addDraft.
function buildChip({ className, label, iconHtml, dataset, isSelected, onSelect }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `${className}${isSelected ? " is-selected" : ""}`;
  btn.setAttribute("role", "radio");
  btn.setAttribute("aria-checked", isSelected ? "true" : "false");
  if (dataset) Object.assign(btn.dataset, dataset);
  if (iconHtml) {
    const ico = document.createElement("span");
    ico.className = `${className}-icon`;
    ico.setAttribute("aria-hidden", "true");
    ico.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconHtml}</svg>`;
    btn.appendChild(ico);
  }
  if (label) {
    const txt = document.createElement("span");
    txt.textContent = label;
    btn.appendChild(txt);
  }
  btn.addEventListener("click", () => { onSelect(); render(); });
  return btn;
}

function renderAddView() {
  const draft = state.addDraft;

  // Day-of-week row (Mon → Sun visually, JS getDay() index in storage).
  const dayRow = document.getElementById("dayChips");
  dayRow.innerHTML = "";
  DAY_CHIPS.forEach(({ short, jsDay }) => {
    dayRow.appendChild(buildChip({
      className: "chip",
      label: short,
      isSelected: draft.day === jsDay,
      onSelect: () => { draft.day = jsDay; },
    }));
  });

  // Life Area chip grid.
  const lifeRow = document.getElementById("lifeChips");
  lifeRow.innerHTML = "";
  LIFE_AREAS.forEach(la => {
    lifeRow.appendChild(buildChip({
      className: "life-chip",
      label: la.label,
      iconHtml: la.icon,
      dataset: { life: la.id },
      isSelected: draft.lifeArea === la.id,
      onSelect: () => { draft.lifeArea = la.id; },
    }));
  });

  // Effort pill row.
  const effortRow = document.getElementById("effortChips");
  effortRow.innerHTML = "";
  EFFORTS.forEach(eff => {
    effortRow.appendChild(buildChip({
      className: "pill-chip",
      label: eff.label,
      iconHtml: eff.icon,
      dataset: { effort: eff.id },
      isSelected: draft.effort === eff.id,
      onSelect: () => { draft.effort = eff.id; },
    }));
  });

  // Priority pill row.
  const prioRow = document.getElementById("priorityChips");
  prioRow.innerHTML = "";
  PRIORITIES.forEach(p => {
    prioRow.appendChild(buildChip({
      className: "pill-chip",
      label: p.label,
      iconHtml: p.icon,
      dataset: { priority: p.id },
      isSelected: draft.priority === p.id,
      onSelect: () => { draft.priority = p.id; },
    }));
  });

  // Today's 3 toggle reflects the draft.
  const today3 = document.getElementById("taskTodayThree");
  if (today3) today3.checked = !!draft.inTodayThree;
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

  // By priority — V2 keys are "High"/"Medium"/"Low".
  const pStats = document.getElementById("priorityStats");
  pStats.innerHTML = "";
  ["High","Medium","Low"].forEach(p => {
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
        el("div", { class: `progress-fill ${p.toLowerCase()}`, style: `width:${pct}%` }),
      ]),
    ]));
  });

  // By life area — replaces V1's "by category" loop.
  const cStats = document.getElementById("categoryStats");
  cStats.innerHTML = "";
  LIFE_AREAS.forEach(la => {
    const items = tasks.filter(t => t.lifeArea === la.id);
    if (items.length === 0) return;
    const d = items.filter(t => t.done).length;
    const total = items.length;
    const pct = total ? Math.round((d / total) * 100) : 0;
    cStats.appendChild(el("div", {}, [
      el("div", { class: "stat-row" }, [
        el("span", { class: "label" }, la.label),
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

// Add a Thing (Page 6) — validate the draft, push a task, then
// route to This Week so the user sees the thing they just added.
document.getElementById("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const textInput = document.getElementById("taskText");
  const text = textInput.value.trim();
  const draft = state.addDraft;

  // Lightweight validation: everything except inTodayThree is required.
  // (Day always has a default of today, so it can't be empty.)
  const missing = [];
  if (!text)            missing.push("a name");
  if (!draft.lifeArea)  missing.push("a life area");
  if (!draft.effort)    missing.push("an effort level");
  if (!draft.priority)  missing.push("a priority");
  if (missing.length) {
    alert(`Please pick ${missing.join(", ")} before saving.`);
    return;
  }

  // Read the toggle just-in-time (it doesn't drive render so we
  // don't push every keystroke through state).
  draft.inTodayThree = !!document.getElementById("taskTodayThree").checked;

  addTask({
    text,
    day:          draft.day,
    lifeArea:     draft.lifeArea,
    effort:       draft.effort,
    priority:     draft.priority,
    inTodayThree: draft.inTodayThree,
  });

  // Reset the draft for next time — keep `day` defaulted to today.
  state.addDraft = {
    day:          new Date().getDay(),
    lifeArea:     null,
    effort:       null,
    priority:     null,
    inTodayThree: false,
  };
  textInput.value = "";

  // Land in This Week so the user sees the thing they just added.
  setView("week");
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
