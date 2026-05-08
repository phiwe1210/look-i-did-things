# What I did

## 1. Renamed the project
FlowWeek is now officially called `look-i-did-things`, sitting in `D:\look-i-did-things`.

## 2. Installed & configured Git
You already had Git downloaded. We then told Git who you are by setting your name and email — this is what links your saves (commits) to your GitHub account:

```bash
git config --global user.email "phiwe.mpofu.pm@gmail.com"
git config --global user.name "Siwphiwe"
```

## 3. Initialized a Git repository
Inside `D:\look-i-did-things` you ran:

```bash
git init
```

This turned your project folder into a Git-tracked repository — Git's brain (the hidden `.git` folder) now lives inside it.

## 4. Created a `.gitignore`
You created a `.gitignore` file that tells Git to ignore unnecessary files like `node_modules/` so they never get uploaded to GitHub.

## 5. Made your first commit
You staged all your files and saved your first ever snapshot of the project:

```bash
git add .
git commit -m "feat: look-i-did-things v1 - initial commit"
```

Git confirmed **12 files** were saved — your HTML, icons, service worker, manifest, and more.

## 6. Created a GitHub repository
You went to github.com and created a new empty repository called `look-i-did-things` under your account `phiwe1210`.

## 7. Connected local project to GitHub & pushed
You linked your local project to GitHub and uploaded everything:

```bash
git remote add origin https://github.com/phiwe1210/look-i-did-things.git
git branch -M main
git push -u origin main
```

Your V1 code is now live and backed up at **github.com/phiwe1210/look-i-did-things**.

## 8. Created a V2 branch

```bash
git checkout -b v2-development
```

You now have a safe, separate branch where you'll build V2 without ever touching the stable V1 code on `main`.

## 9. Built a progress-logging system
- Created the `progress/` folder with `README.md` (explains the convention) and `TEMPLATE.md` (the three-section format: *What I did* / *What's next* / *Notes & gotchas*).
- Added a **Progress Log** section to `CLAUDE.md` instructing Claude to read the most recent 2–3 entries in `progress/` at the start of every session.
- Added a **Wrap Up Session** section to `CLAUDE.md` defining the wrap-up procedure — two modes (user-provided notes vs. auto-generate from conversation), two output files (`.md` for Claude, `.txt` overview for Phiwe), three steps.
- Switched `progress/` to a **per-day folder layout**: each session now lives inside a `YYYY-MM-DD/` subfolder so things stay tidy as logs pile up. Today's files were migrated from `progress/2026-05-02-progress-and-wrapup.md` to `progress/2026-05-02/progress-and-wrapup.md` (and the same for the `-overview.txt`).

# Where things stand

| Thing | Status |
| --- | --- |
| Git installed & configured | ✅ Done |
| Local repo initialized | ✅ Done |
| V1 committed | ✅ Done |
| GitHub repo created | ✅ Done |
| Code pushed to GitHub | ✅ Done |
| V2 branch created | ✅ Done |
| Progress logging system | ✅ Done |
| Wrap-up command | ✅ Done |
| Per-day folder layout | ✅ Done |

# What's next / unfinished
- `v2-development` is the active branch — all V2 work goes there. **Do not commit to `main`** unless intentionally merging or hotfixing V1.
- Haven't actually started any V2 feature work yet — the runway is open.
- If we ever want `/wrap-up-session` as a real installable slash command (usable across *other* projects too), we'd need to package it as a proper skill. The global skills directory was read-only from this session, so we used `CLAUDE.md` instead. Functionally identical inside this project.
- This entry is the first real test of the wrap-up procedure — worth checking next session whether the `.md` + `.txt` pair feels right or if the format needs tweaking.

# Notes / gotchas
- **Git identity used**: name `Siwphiwe`, email `phiwe.mpofu.pm@gmail.com`. Note this email differs from `mpofusiwaphiwe@gmail.com` listed in CLAUDE.md's `# userEmail` section — Phiwe uses both. Stick with `phiwe.mpofu.pm@gmail.com` for any git work since that's what's globally configured.
- **GitHub username**: `phiwe1210`. Remote URL: `https://github.com/phiwe1210/look-i-did-things.git`.
- **Branch state at end of session**: `main` holds V1 (matches what's pushed to GitHub); `v2-development` is checked out for new work.
- The trigger mechanism for "wrap up session" lives in `CLAUDE.md` under the **Wrap Up Session** heading. If that section gets removed or the file is deleted, the command stops working.
- Global skills path (`/sessions/.../mnt/.claude/skills/`) is mounted read-only, so custom slash commands can't be installed from inside a session.
- Folder rename matches the "Look, I Did Things" rebrand already documented in `CLAUDE.md`. The legacy name "FlowWeek" still appears in subdirectory names (`FlowWeek App/`) and inside `index.html`/`service-worker.js` — leave those alone unless the rebrand is intentional.
- New folder layout: `progress/YYYY-MM-DD/` holds the day's files. If multiple sessions happen in one day, just add more `<slug>.md` + `<slug>-overview.txt` pairs inside the same date folder.
