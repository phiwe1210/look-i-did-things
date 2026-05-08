# What I did

## 1. Planned the V2 development push
We started the session by looking at the seven wireframe images in `look-i-did-things/Wireframes/` together to get a feel for what V2 needs to be. Before committing to anything I asked three clarifying questions: codebase structure (single-file vs split vs framework), where mascot art comes from, and the scope for this push. You picked: split into html/css/js files, crop the mascots out of the existing wireframes for now, and do a visual rebuild that matches the wireframes — keep V1's underlying logic for now, layer the new screens on top later.

## 2. Built the task list
Originally drafted twelve linear phases. After you said "we will work one page at a time, iterate until I'm happy, then move on," I restructured into 4 foundation tasks (no user gate, just prep) plus 7 page tasks (one per wireframe, each one is a build → review → iterate → approve → next loop). Foundation tasks ran straight through; page tasks pause for your sign-off.

## 3. Foundation 1 — Branch check
Confirmed we're on `v2-development` with V1's commit (`f42b09a`) at the tip of `main` already pushed to GitHub. Working tree had three untracked things from the last session: edits to `CLAUDE.md`, the new `Wireframes/` folder, and the `progress/` folder. We left those uncommitted because the bash sandbox running inside this session can't write to the `.git` folder on the Windows mount (Operation not permitted on `index.lock`). All git work now needs to happen in your own terminal — I can't run commits from here. That's a one-time discovery for this project.

## 4. Foundation 2 — Cropped 13 mascot PNG assets
Used Pillow in the bash sandbox to crop assets out of `Wireframes/`. Built three asset families:

- **6 tile assets** at `assets/mascots/tile-{done-duck,focus-frog,task-raccoon,tiny-tortoise,brain-bee,star-snail}.png` — full pastel card with the animal AND the name label, ready to drop straight into the chooser screen for Page 2.
- **6 mascot-only assets** at `assets/mascots/{done-duck,focus-frog,task-raccoon,tiny-tortoise,brain-bee,star-snail}.png` — same cards minus the label, for use as the corner avatar on This Week / Add a Thing / etc.
- **1 welcome hero cluster** at `assets/mascots/welcome-cluster.png` — the full mascot group from the welcome wireframe.

You approved the assets. Quick gotcha: a debug file `_welcome_full.png` (1.6 MB) got left in the folder because the sandbox couldn't unlink it; you deleted it manually with `del "D:\look-i-did-things\look-i-did-things\assets\mascots\_welcome_full.png"`.

## 5. Foundation 3 — Split V1 into separate files
Pure structural refactor of the original single-file V1. The 1,113-line `index.html` became:

- `index.html` (189 lines, markup + `<link>`/`<script>` tags)
- `styles.css` (453 lines, all the V1 CSS verbatim, dedented)
- `app.js` (479 lines, all the V1 JavaScript verbatim, with `defer` on the script tag in the head so the DOM is parsed before it runs)

Bumped the service worker `CACHE_VERSION` from `lidt-v1.0.0` to `lidt-v2.0.0-dev.1` and added the two new files to `APP_SHELL` so they get pre-cached.

Your local Python wasn't installed (Microsoft Store shortcut intercepts the command). The fix is to use the Node-based server you already have:
```
cd D:\look-i-did-things\look-i-did-things
npx serve .
```
First time `npx` will prompt to install `serve@14.2.6` — accept with `y`. Server runs on `http://localhost:3000`. **Don't run it from `C:\Users\phiwe`** — that serves your home directory by mistake. You confirmed V1 still loaded identically (took a couple of minutes the first time because Google Fonts and the service worker were both doing first-install work).

## 6. Foundation 4 — V2 design tokens + base 5-slot nav
Replaced the V1 dark palette with the V2 light palette pulled from the wireframes. New tokens defined at the top of `styles.css`:

- Surfaces: `--bg #fbf6e9` (warm cream), `--surface #ffffff`, `--surface-2 #f5f0e1`, `--border #ece4cf`
- Text: `--text #1d3a35` (dark teal), `--text-muted #7a8480`
- Brand: `--accent #1f6b5c` (deep teal — primary CTA), `--accent-soft`, `--accent-ink #ffffff`, `--mascot-yellow #f4c542`
- 7 life-area pairs (e.g. `--life-creative-bg`/`--life-creative-ink`) for the pill colors
- Radius scale `--radius 16px / --radius-sm 10px / --radius-lg 22px`
- Two shadows: `--shadow-card` (soft) and `--shadow-float` (teal glow under the floating "+")

Swapped fonts from Playfair + DM Sans to a single family — Plus Jakarta Sans 400/500/600/700/800 — to match the friendly geometric feel of the wireframes.

Restructured the bottom nav from 4 flat slots to **5 slots with a center floating "+"** — `Today | Week | + | Progress | Review`. The "+" is a 60×60 teal circle with `margin-top: -28px` so it pops above the bar baseline. Added a stub `view-review` section for the Review tab (real implementation is Page 7).

Updated several places that previously used `var(--bg)` as "color on top of accent" — they're now `var(--accent-ink)` (white on teal): the checkbox checkmark, day-tab active state, carry-banner button, primary button.

## 7. Captured your "no emojis" rule + design MCP discussion
You asked that we avoid emojis for icons going forward and use proper SVG icons. Noted — going forward, every icon in the app gets sourced from Lucide (MIT-licensed clean stroke icons) inlined as SVG. The placeholder emojis in the bottom nav will swap out as we pass through each page.

You also asked about MCPs that could help with design. I flagged Claude in Chrome as the most useful one for this iterative loop — it would let me navigate to your localhost, screenshot each page, compare side-by-side with the wireframe, and self-correct without you having to describe what's off. We didn't enable it in this session; deferred to your call.

## 8. Page 1 first pass — Welcome screen with cropped cluster
Built the welcome screen using the cropped `welcome-cluster.png` as a centered hero image inside a content layout. Title at top ("Look,<br>I Did Things"), tagline below, image in the middle, teal "Get Started →" button with an SVG arrow icon, "Already have an account? Sign in" footer. Hidden header and bottom nav by adding a body class `is-onboarding` that the `setView` function toggles based on the `ONBOARDING_VIEWS` set.

Boot logic now branches: if `lidt_welcome_seen === "1"` OR `lidt_mascot` is set, go to Today; otherwise show the welcome.

## 9. Bug fix — carry-over banner showing on welcome
You spotted that the V1 carry-over banner was bleeding through onto the welcome screen. Added `.carry-banner` to the `body.is-onboarding` hide rule with `display: none !important` so it can't appear on any onboarding screen.

## 10. Page 1 final pass — full-bleed background art
You shared a fresh painted illustration of the mascot scene (768×1376) and asked us to use it as a full-bleed background, not a cropped foreground image. Saved to `assets/backgrounds/welcome-bg.png`.

Restyled `.view-welcome` to use that as `background-image` with `background-size: cover` and a sky-tone fallback colour `#cbe6f3` for any letterbox area on extreme aspect ratios. Removed the inline `<img>` from the markup. Layout uses `justify-content: space-between` so the title naturally sits in the upper sky region, the action area drops to the bottom. The button area has a soft cream gradient veil (`linear-gradient` from transparent to `var(--bg)` at 92%) and a 24px top corner radius — separates the CTA from the painted grass without hiding the artwork.

Subtle 1px white text-shadow on the title and tagline so they read cleanly whether they land on cloud or sky.

You said it looked good. That's where we paused.

# Where things stand

| Thing | Status |
| --- | --- |
| Foundation 1 — branch + audit | ✅ Done |
| Foundation 2 — mascot crops (13 PNGs) | ✅ Done, you approved |
| Foundation 3 — html/css/js split | ✅ Done, you confirmed V1 still works |
| Foundation 4 — V2 tokens + 5-slot nav | ✅ Done, you confirmed |
| Page 1 — Welcome | 🟡 Visual approved, but `Continue` button + sign-up/sign-in destinations still missing |
| Page 2 — Choose Your Animal | ⬜ Next up |
| Pages 3–7 | ⬜ Not started |
| Mascot animation architecture | 🟡 Captured in parking lot, no work done yet |
| Service worker cache version | At `lidt-v2.0.0-dev.5` |
| Git commits on v2-development | Nothing committed yet this session — needs to happen in your terminal |

# What's next / unfinished

- **Add a `Continue` button to Page 1.** You pointed out the welcome screen wireframe has THREE auth-related elements: `Get Started` (new users), `Continue` (returning users), and `Sign in` (link). I built only Get Started + Sign in; Continue is missing. Fix this before we lock Page 1.
- **Create sign-up and sign-in destination pages.** Right now Get Started just routes to Today. There needs to be a sign-up screen behind it and a sign-in screen behind Sign in. These are gated behind the backend phase but the UI hooks need to land first.
- **Architectural reminder for sprite/animation future.** When we render a mascot anywhere going forward, wrap it in a dedicated container element — `<div class="mascot" data-animal="duck">…</div>` — so we can later swap the static PNG for a Lottie file, animated SVG, or sprite sheet without touching the surrounding layout. The welcome screen is fine as a CSS background image; this rule applies more to the chooser tiles, the corner avatar on This Week, the celebration moments, etc.
- **Page 2 — Choose Your Animal** is queued and ready to build. The 6 tile PNGs are already in `assets/mascots/tile-*.png`.
- **Replace bottom-nav emojis with SVG icons** — Today (home), Week (calendar), + (already SVG), Progress (chart), Review (sparkle). I'll do this when we touch each page.
- **Commit on v2-development.** This session's changes are uncommitted on disk. Next session, paste these in your terminal:
  ```
  cd D:\look-i-did-things\look-i-did-things
  git add -A
  git commit -m "feat(v2): foundation split + light palette + welcome screen first pass"
  ```
  Then push:
  ```
  git push -u origin v2-development
  ```

# Notes / gotchas

- **Bash sandbox can't modify `.git/`** on the Windows mount. The Linux mount has read access but the file system blocks unlinks/locks. Practical effect: every git command must run in your terminal, not mine. I'll always surface the exact command to paste.
- **Bash sandbox file reads can lag** behind Windows writes. We hit one false alarm where bash thought `app.js` was truncated to 474 lines while the file on Windows was actually the complete 510 lines. The browser reads from Windows so this doesn't affect what the user sees — it's a sandbox quirk only. Trust the Read tool over `wc -l`.
- **Service worker is cache-first for assets.** Any CSS/JS change needs a `CACHE_VERSION` bump in `service-worker.js`, otherwise the old version keeps getting served. We're currently at `lidt-v2.0.0-dev.5`. Bump every time we change tokens or markup.
- **Hard reload is your friend.** Ctrl+Shift+R bypasses both the browser cache and the SW, useful any time something looks stale after a change.
- **Local server.** `npx serve .` from `D:\look-i-did-things\look-i-did-things\` — not from your home folder. Listens on `http://localhost:3000`.
- **localStorage keys in use:**
  - `lidt_tasks` — V1 task array (you accidentally deleted yours mid-session, which is fine, it was test data)
  - `lidt_carry_dismissed:<weekKey>` — per-week dismissal of the carry banner
  - `lidt_welcome_seen` — set to `"1"` once Get Started is clicked; deleting this re-shows the welcome
  - `lidt_mascot` — will be set in Page 2 once you pick a support animal
- **Untracked work from the previous session still pending commit** alongside this session's work: CLAUDE.md edits, the Wireframes folder, the progress folder. They'll go in alongside V2 changes whenever you commit.
- **Boot routing in `app.js`** is currently `(hasSeenWelcome || hasMascot) ? "today" : "welcome"`. Once Page 2 exists, change `setView("today")` inside the `welcomeStart` click handler to `setView("choose")`.
- **Welcome cluster crop edge.** The earlier cropped `welcome-cluster.png` had a thin lavender phone-bezel sliver on the right that you said was fine to leave. That asset is still in the project but unused now — the full-bleed `welcome-bg.png` superseded it. Could be deleted later or kept for fallback.
