# What I did

## 1. Verified Node.js is installed
Quick sanity check before doing anything else.

```bash
node --version
```

## 2. Ran the uigen app on a local development server
Started the app on your own computer with:

```bash
npm run dev
```

This made the app available at `http://localhost:3000`. "localhost" literally means *this computer* — so your machine was acting as both the kitchen (server) and the customer (browser) at the same time. This kind of server only runs while the terminal is open and only you can reach it — exactly what a *development server* is.

## 3. Added an MCP server (Playwright)
Hooked Claude Code up to a browser-automation tool called Playwright by adding it as an MCP server:

```bash
claude mcp add playwright
```

Different beast from the dev server: this one doesn't serve web pages. It runs in the background as a middleman so Claude can see and interact with web pages through Playwright.

# What I learned

## Node.js — what it is

Node.js is a program that lets your computer run JavaScript code **outside of a browser**. Normally JavaScript only lives inside browsers like Chrome or Edge. Node.js takes the same language and lets it run directly on your computer like any other program.

**The simple analogy**: think of JavaScript as a language that was originally only spoken inside a specific building (the browser). Node.js is what lets that language be spoken anywhere — including on your own computer.

**Where Node.js showed up today**:
- Verified it was installed by running `node --version`
- Every `npm` command in the session was powered by Node.js behind the scenes
- The whole `uigen` app runs on Node.js — `npm run dev` is essentially telling Node.js to start the app

**Why it matters going forward**: almost every modern web app and dev tool is built on Node.js. It's the foundation under tools like Claude Code, npm, and frameworks like Next.js (which uigen uses).

## Servers — what they are

A server is just a program that runs continuously, listens for requests, and sends back responses. When you type a website address into your browser, the browser sends a request to a server somewhere, and that server sends back the page.

**The simple analogy**: a server is like a restaurant kitchen. It runs in the background, waits for orders (requests), and sends out food (responses). The customer (your browser) never sees the kitchen — they just send orders and receive food.

## Two kinds of servers were involved today

### 1. Your local development server
Started by `npm run dev`. Node.js spun up a server on your own computer at `http://localhost:3000`. Your computer was both the kitchen and the customer. Only runs while the terminal is open. Only you can access it.

### 2. The MCP server (Playwright)
Added with `claude mcp add playwright`. This one doesn't serve web pages — it gives Claude extra abilities. Playwright lets Claude actually see and click around inside a browser.

## How it all fits together

Your terminal runs Node.js → Node.js starts the uigen app → the app becomes available at `localhost:3000` → your browser connects to it.

And separately: Claude Code → connects to the MCP server (Playwright) → Playwright controls a browser → Claude can now see and interact with web pages.

## The key difference at a glance

| | Local dev server | MCP server |
| --- | --- | --- |
| Started by | `npm run dev` | `claude mcp add` |
| Purpose | Runs your app | Gives Claude extra abilities |
| Lives at | `localhost:3000` | Runs in the background |
| Stops when | You close the terminal | You remove it or stop Claude |

# Where things stand

| Thing | Status |
| --- | --- |
| Node.js verified working | ✅ Done |
| uigen running locally on `localhost:3000` | ✅ Done |
| Playwright MCP server added to Claude Code | ✅ Done |
| Mental model of Node.js + servers + MCP | ✅ Solid enough to keep building |

# What's next / unfinished
- The dev server only runs while your terminal is open. Next time you want to keep working on uigen, run `npm run dev` again from the uigen project folder.
- Now that Playwright is wired up as an MCP server, Claude Code can actually drive a browser — worth experimenting with that capability.

# Notes / gotchas
- "localhost" = this computer. Local dev servers are private to your machine; nobody else on the internet can reach `localhost:3000`.
- MCP servers and dev servers are completely different things despite sharing the word "server". One serves your app to a browser; the other gives Claude extra tools.
- This was a learning-heavy session, not a building session — the value is in the mental model, not in lines of code shipped.
