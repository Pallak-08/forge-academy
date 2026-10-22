# Forge Labs

**Build it to learn it.**

**Live site: [forge-academy-learn.vercel.app](https://forge-academy-learn.vercel.app)**

Forge Labs is a free, open platform where you learn to code by **building real, working projects** — not by reading. Every lab drops you into a code editor with a half-finished app, you fill in the gaps, hit **Run** to see it work on live data, and your work is **checked instantly** with ✓/✗ feedback and hints.

It is built for people who learn by doing: the reading-heavy course was replaced with hands-on project labs.

## How a lab works

Each lab is a small, self-contained project:

- **A brief and goals** — what you're building and the handful of things that must work.
- **A live code editor** — pre-filled with starter code and clearly marked `// TODO` spots, each with its hint.
- **Run** — your code executes in a sandbox and the result renders live in the preview, often powered by a **free public API** (REST Countries, GitHub, Dog API — no keys).
- **Check my work** — actually runs your code, grades each goal, turns them green, and celebrates when you finish. Stuck? **Show solution** fills it in.

Progress (which labs you've completed) is saved in your browser, no sign-up.

## The labs

Labs are grouped into tracks (Frontend & Full Stack today; AI and DevOps coming). The current set:

| Lab | What you build | API |
|---|---|---|
| Country Explorer | A searchable grid of countries with flags and populations | built-in data |
| GitHub Profile Card | A profile card for any GitHub username, from the real API | GitHub (free) |
| Dog Gallery | A grid of random dog photos | Dog API (free) |
| Playground | A blank sandbox to build any idea | bring your own |

## Tracks and what's next

Labs are grouped into tracks. **Frontend & Full Stack** labs are live now; **AI & LLM** and **DevOps & Cloud** tracks are next. There's also a **Custom** track with a free-build Playground, and role-based "hot project" labs (the real things companies hire juniors to build) are the direction from here.

The previous version of this site was a reading-based roadmap platform (roles, modules and written lessons). That content still lives in the git history and the old `data/` files if you want it; the live site is now the labs.

## Run locally

It's a static site with no build step:

```bash
git clone https://github.com/Pallak-08/forge-academy.git
cd forge-academy
python3 -m http.server 8000
# open http://localhost:8000
```

## Project structure

The whole app is one self-contained file — no build step, no dependencies beyond a Google Fonts link:

```
index.html   the entire platform: styles, the lab engine (editor, runner,
             checker, gallery) and the lab definitions
data/*        legacy data files from the previous roadmap version (unused by the live site)
```

## Adding a lab

A lab is one entry in the `LABS` array plus two text blocks in `index.html`:

```js
{ id:"my-lab", track:"Frontend & Full Stack", title:"My Lab", level:"Beginner",
  minutes:10, glyph:"🚀", thumb:"#eef0f4",
  tagline:"What you build, in one line.",
  api:"Some API (free)", live:true,
  body:'<div id="app"></div>',   // the preview's HTML shell
  css:"...",                      // preview styles
  boot:"",                        // JS injected before the learner's code (e.g. seed data)
  delay:2000,                     // ms to wait after Run before checking (for async fetches)
  goals:[{ t:"Goal shown to the learner", h:"Hint if it fails" }],
  check:function(doc){ return [ /* one boolean per goal */ ]; } }
```

Then add `<script type="text/plain" id="my-lab.starter">…</script>` and `…id="my-lab.solution">…</script>` blocks with the starter (with `// TODO`s) and the finished code. The engine wires up the editor, Run, Check and Show solution automatically.

Open an issue or a pull request.

## Deploy your own copy

Import the repository into [Vercel](https://vercel.com/new):

- Set the framework preset to **Other**.
- Leave the build command empty.

Netlify, GitHub Pages and any static host work too.

---

Created by **Pallak Khullar**. Many lessons use [SaaSForge](https://github.com/Pallak-08/saasforge), an open-source AI agent that builds SaaS apps, as a real-world example.
