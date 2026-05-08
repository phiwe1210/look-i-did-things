# What I did

## 1. Caught up on the project state
Started the session by running the new "catch me up" command. Read every overview in `progress/` (May 1, May 2, May 7) chronologically to build the project arc, then noted where things actually stood. The previous session had left V2 work committed locally on `v2-development` but **the push to GitHub had never completed** — terminal showed `Enumerating objects: 60, done.` and stopped.

## 2. Switched the mounted Cowork folder
Cowork was mounted on `D:\FlowWeek\FlowWeek App` (the old empty folder). Asked Cowork to mount `D:\look-i-did-things` instead so I could access the real project files. The Cowork folder selector in the desktop app is what controls this — change it there to make the new folder the default for future sessions.

## 3. Pushed v2-development to GitHub (finishing last session's work)
Confirmed the local commit was still there (`2ce80bd9` on `v2-development` per `.git/refs/heads/v2-development`), then re-ran the push:

```
cd D:\look-i-did-things
git push -u origin v2-development
```

This time the push completed: `* [new branch] v2-development -> v2-development`. Then the leftover CLAUDE.md change from last session got committed:

```
git add CLAUDE.md
git commit -m "docs: add catch-me-up command to CLAUDE.md"
git push
```

(Side note: when pasting commands from chat, the markdown-link version `[CLAUDE.md](http://CLAUDE.md)` snuck into one commit message. Harmless — git treated the brackets as a glob and matched the real file — but the commit history has one ugly message in it.)

## 4. Made V2 the main branch
Decided to collapse `v2-development` into `main` for simpler ongoing solo dev. Tagged V1 first so it's permanently reachable, then merged + deleted the dev branch. Steps:

```
# Tag V1 so we can always come back to it
git tag v1.0 main
git push --tags

# Fast-forward main to v2-development's tip
git checkout main
git merge v2-development
git push

# Delete the now-redundant branch locally and on GitHub
git branch -d v2-development
git push origin --delete v2-development
```

Result: GitHub now shows **1 Branch** (main) plus a Tags section with `v1.0`. All future work happens directly on main. To revisit V1 ever: `git checkout v1.0` to look, `git checkout main` to come back.

## 5. Added the Continue button to the welcome screen
Last session noted the welcome screen needed a Continue button between Get Started and the Sign in link, for users who already have an account. Added it as a `.btn-secondary` (outlined teal pill) sitting between the two existing elements. Wired the click to alert "Sign-in is coming with the backend" — same parking-lot message as the Sign in link, until the backend ships. Files: `index.html`, `styles.css`, `app.js`.

## 6. Made the Get Started arrow yellow
Quick polish — changed the arrow icon's stroke color from white (currentColor inheriting from button text) to `var(--mascot-yellow)` (Done Duck yellow #f4c542 — a token already defined in `:root`). Single edit in `styles.css` on `.welcome-actions .btn-icon`. Bumped service worker for cache-bust.

## 7. Locked in the V2 architecture pattern
Phiwe clarified the asset architecture for every page going forward:

- **`Wireframes/<n>.<page>/`** — visual reference mockups only (design source-of-truth)
- **`assets/backgrounds/<page>-bg.png`** — production background image, painted scene with the character integrated
- **DOM** — every interactive thing (forms, inputs, buttons, dynamic text, page-specific titles, speech bubbles) is real DOM layered on top of the painted bg

This deprecates last session's plan to use cropped `tile-*.png` mascots wrapped in `.mascot[data-animal]` containers. Animation strategy is now TBD — likely either swapping the bg image, layering an animated overlay, or generating an animated version of the whole scene.

## 8. Renumbered the Wireframes folder
Sign Up and Sign In need to slot between the welcome page and Your Animal. Renumbered everything from 4 onwards by 2:

```
git mv "look-i-did-things/Wireframes/7.Week_Review" "look-i-did-things/Wireframes/9.Week_Review"
git mv "look-i-did-things/Wireframes/6.Evidence Log" "look-i-did-things/Wireframes/8.Evidence Log"
git mv "look-i-did-things/Wireframes/5.Star Chart" "look-i-did-things/Wireframes/7.Star Chart"
git mv "look-i-did-things/Wireframes/4.Add a thing" "look-i-did-things/Wireframes/6.Add a thing"
git mv "look-i-did-things/Wireframes/3.This Week" "look-i-did-things/Wireframes/5.This Week"
git mv "look-i-did-things/Wireframes/2.Your Animal" "look-i-did-things/Wireframes/4.Your Animal"
mkdir "look-i-did-things\Wireframes\2.Sign Up"
mkdir "look-i-did-things\Wireframes\3.Sign In"
```

Important: the renames must run highest-number first or you get collisions. Phiwe then dropped the sign-up wireframe into `2.Sign Up/` and sign-in wireframe into `3.Sign In/`, and saved a shared painted background to `assets/backgrounds/signup-bg.png` (used by both Sign Up and Sign In since they share the same hero illustration).

## 9. Built the Sign Up page (Page 2)
Created a new view section in `index.html` with this structure:

- `auth-header` — DOM title "Create your account" + subtitle with a purple heart glyph
- `auth-hero` — painted scene from `signup-bg.png` (duck + decorations) with a "Let's get to know you!" speech bubble overlaid
- `auth-form` — four pill-shaped inputs with circular pastel icons (green name, purple email, blue lock with eye toggle, yellow star), gentle-reminders checkbox with linked Terms / Privacy, **Create account** button (yellow arrow on teal pill), **Continue as guest** secondary button, "Already have an account? Sign in" link

CSS lives in `styles.css` as a new "AUTH PAGES" section. New tokens: `.field`, `.field-icon`, `.field-input`, `.field-trailing`, `.checkbox-row`, `.options-row`, `.speech-bubble[data-tail="down-left"]`, `.auth-foot`. Reused existing `.btn-primary` and `.btn-secondary`. JS handlers in `app.js` route the form submit and Continue-as-guest to `finishOnboarding()`, and the cross-link to `setView("signin")`.

## 10. Built the Sign In page (Page 3)
Same painted bg (`signup-bg.png`) — different DOM. Title "Welcome back", subtitle "Sign in and let's keep track of your little wins.", different speech bubble text "Ready to do things?". Two-field form (email + password with eye toggle), Remember me + Forgot password row, Sign in + Continue as guest, "New here? Create account" link at bottom. Forgot password is parked with an alert until backend phase.

## 11. Wired up the auth flow end-to-end
Updated welcome handlers so:
- Get Started → `setView("signup")`
- Continue → `setView("signin")`
- Sign in link → `setView("signin")`

Added `signup` and `signin` to `ONBOARDING_VIEWS` so the header + bottom nav stay hidden on those screens. Added matching cases to the master `render()` switch.

Added a `[data-toggle-pw="<inputId>"]` pattern that any element can use to flip a password input between password and text — both signup and signin use this for the eye icon.

## 12. Connected Claude in Chrome for live preview
Phiwe already had the extension installed. Used `mcp__Claude_in_Chrome__list_connected_browsers` → got "Browser 1" → selected it. Opened a new tab → `npx serve .` was already running locally → navigated to `http://localhost:3000`. Chrome screenshots were intermittently flaky (CDP timeouts), but the JavaScript inspector worked reliably for diagnosing layout issues.

## 13. Fixed three layout bugs found during live preview
- **`.view-auth { display: flex }` was being overridden** by `.view.is-active { display: block }` (higher specificity). Fixed by re-targeting with `.view-auth.is-active { display: flex }` to match specificity. Same for `.view-choose` later.
- **Title was inside `.auth-hero`** so the painted bg image rendered behind the title and overlapped it. Restructured the markup: `.auth-header` now sits ABOVE `.auth-hero` instead of inside it.
- **`background-size: contain`** was leaving narrow whitespace strips on wide viewports. The painted bg image is portrait so it never quite fills landscape-ish boxes — left it as `contain` for now since the duck stays centered, and constrained `.auth-hero` to a fixed `height: 46vh; max-height: 360px` on mobile, `height: 320px` on desktop.

## 14. Hit (and fixed) a service-worker cache stacking bug
Phiwe noticed that after clearing localStorage on a fresh load, **the welcome page showed up but the sign-up and sign-in pages were also visible underneath it** — all three views stacked. Diagnosed via JS:

```js
// Showed display: flex on signup/signin even when not is-active
```

Cause: the SW had cached the *old* `styles.css` from before the layout fix (when `.view-auth { display: flex }` was unconditional). Bumping `CACHE_VERSION` in `service-worker.js` wasn't enough on its own because the old SW was still controlling the page. Fix: clear caches + unregister SW + reload.

Console snippet to keep handy:
```
(async () => {
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const r of regs) await r.unregister();
  const keys = await caches.keys();
  for (const k of keys) await caches.delete(k);
  location.reload();
})()
```

Or DevTools → Application → Storage → "Clear site data" button.

## 15. Built Page 4 (Choose Your Animal — the mascot chooser)
Phiwe created six new clean mascot icons (transparent-ish backgrounds, no card framing) and saved them to `assets/mascots/`:

```
assets/mascots/done-duck.png
assets/mascots/focus-frog.png
assets/mascots/task-raccoon.png
assets/mascots/tiny-tortoise.png
assets/mascots/brain-bee.png
assets/mascots/star-snail.png
```

Built the chooser using **option C** (DOM tiles with the icons as content, pastel card bg from CSS, selected state via CSS):

- New `<section id="view-choose">` in `index.html` with a back button, title "Choose your<br>support animal", subtitle, and a small `done-duck.png` decoration in the top right
- Empty `#mascotGrid` div populated by JS from a new `MASCOTS` array (id, name, tagline, tint)
- Footer with `#choosePreview` (small mascot + name + tagline, hidden until selection) and a Continue button (disabled until selection)

JS additions to `app.js`:

- New `MASCOTS` array near the top of the file
- New `renderChooseView()` function that builds the 6 tiles, paints the `is-selected` state, populates the preview chip, and toggles the Continue button between disabled (muted grey-teal) and enabled (full teal pill with yellow arrow)
- New `state.chosenMascot` initialized from `localStorage.getItem(MASCOT_KEY)`
- New event handlers: `chooseBack` → `setView("welcome")`, `chooseContinue` → save mascot to localStorage + `setView("today")`
- Updated `finishOnboarding()` to go to `"choose"` instead of `"today"`
- Updated initial view logic: if mascot is set, go to today; if welcome seen but no mascot, go to choose; else welcome

## 16. Bumped service worker
Service worker version went from `lidt-v2.0.0-dev.5` (start of session) to `lidt-v2.0.0-dev.10` (end of session) — bumped after every CSS or JS change so caches refresh.

# Where things stand

| Thing | Status |
| --- | --- |
| v2-development pushed to GitHub | ✅ Done |
| CLAUDE.md catch-me-up command committed | ✅ Done |
| V1 tagged as `v1.0` | ✅ Done |
| `main` branch contains all V2 work | ✅ Done |
| `v2-development` branch deleted (local + remote) | ✅ Done |
| Welcome page Continue button | ✅ Done |
| Get Started arrow yellow | ✅ Done |
| Wireframes folder renumbered | ✅ Done |
| Page 2 (Sign Up) — built | ✅ Done |
| Page 3 (Sign In) — built | ✅ Done |
| Live preview via Claude in Chrome | ✅ Connected |
| View stacking bug | ✅ Fixed |
| Page 4 (Choose Your Animal) — built | ✅ Done |
| Mascot selection state, preview chip, Continue gating | ✅ Working |
| Onboarding flow: welcome → auth → choose → today | ✅ Working |
| All this session's code committed to git | ⬜ NOT YET — uncommitted on main |
| Page 5 (This Week) | ⬜ Queued |
| Pages 6–9 | ⬜ Queued |
| Real backend auth (Phase 4) | ⬜ Future |

# What's next / unfinished

- **Commit this session's work.** Everything since the catch-me-up commit (`f7da41b`) is sitting uncommitted on `main`. When picking back up, run from `D:\look-i-did-things`:
  ```
  git add -A
  git commit -m "feat(v2): auth pages + mascot chooser (Pages 2-4)"
  git push
  ```
- **Page 5 — This Week.** The wireframe is in `Wireframes/5.This Week/`. Will need a painted bg from Phiwe (or we use cream + mascot avatar), and the existing V1 week view rebuilt to match the new design. Continue from chooser currently routes to `today` as a placeholder — once Page 5 is built, change to `week` (or whatever Phiwe wants).
- **Mascot tile transparency choice.** The mascot PNGs render with a visible white/cream square behind each illustration inside the pastel tile. Phiwe to decide:
  1. Leave it (looks like an intentional polaroid/photo card).
  2. Re-export PNGs with transparent backgrounds and re-drop.
  3. Style the white area as an explicit rounded card so it looks deliberate.
- **Decorative duck top-right of chooser** is reusing `done-duck.png`. Phiwe might want a custom small illustration there instead.
- **Mascot taglines are placeholders** I made up. Easy to swap once Phiwe has real copy:
  - Done Duck — "Invisible effort counts."
  - Focus Frog — "Sit. Stare. Stay with it."
  - Task Raccoon — "Collects every little win."
  - Tiny Tortoise — "Slow is still moving."
  - Brain Bee — "Busy in all directions."
  - Star Snail — "Every step is a star moment."
- **Speech bubble position on auth pages** is at `top: 32%, right: 8%` of the painted hero — looks right on desktop in Chrome but could drift on different aspect ratios. Worth eyeballing on real phone.

# Notes / gotchas

- **Service worker caches aggressively.** Bumping `CACHE_VERSION` in `service-worker.js` is required on every CSS/JS change but is not always sufficient on its own. If something looks stale or wrong after a deploy, clear via DevTools (Application → Storage → Clear site data) or the console snippet in section 14.
- **Pasting commands from chat:** the markdown-link rendering `[CLAUDE.md](http://CLAUDE.md)` will sometimes come along when copying. Type filenames plainly in the terminal. Brackets do glob-match the real file in `git add`, so the command works, but the commit message keeps the ugly link formatting.
- **`git mv` with renames:** when renumbering folders that contain numbered names (like `5.Star Chart` → `7.Star Chart`), do them highest-number first to avoid colliding with existing folders.
- **Architecture rule going forward:** every page = painted full-bleed background (under `assets/backgrounds/`) + DOM overlays for everything interactive or page-specific. The chooser is the one exception (mascots have to be individually tappable, so they're DOM PNGs in DOM cards).
- **The bash sandbox occasionally hangs on previous calls.** When that happens, switch to file-tools (Read/Glob/Grep/Edit/Write) which don't share the sandbox. The hang clears itself in a minute or two.
- **Identifiers worth remembering:**
  - GitHub: `phiwe1210/look-i-did-things`, branch `main`, tag `v1.0`
  - localStorage keys: `lidt_tasks`, `lidt_carry_dismissed`, `lidt_welcome_seen`, `lidt_mascot`
  - Service worker key (current): `lidt-v2.0.0-dev.10`
  - Local dev: `cd D:\look-i-did-things\look-i-did-things` → `npx serve .` → `http://localhost:3000`
- **Files modified this session:**
  - `look-i-did-things/index.html` — added signup, signin, choose view sections
  - `look-i-did-things/styles.css` — added auth styles section, choose styles section, multiple layout fixes
  - `look-i-did-things/app.js` — `MASCOTS` array, `renderChooseView()`, auth handlers, password toggle, choose handlers, updated `finishOnboarding()` and initial view logic
  - `look-i-did-things/service-worker.js` — `CACHE_VERSION` bumps
  - `CLAUDE.md` — catch-me-up command (committed earlier this session)
  - `look-i-did-things/Wireframes/` — renumbered subfolders, new `2.Sign Up/` and `3.Sign In/`
  - `look-i-did-things/assets/backgrounds/signup-bg.png` — new
  - `look-i-did-things/assets/mascots/*.png` — six mascot icons replaced with new clean versions
