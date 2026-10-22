# Forge Academy

**Find your path in tech. Then walk it.**

**Live site: [forge-academy-learn.vercel.app](https://forge-academy-learn.vercel.app)**

Forge Academy is a free, open platform with complete career roadmaps for the most in-demand tech roles. Each roadmap comes with everything you need to learn it: notes, worked code, hands-on labs, quizzes, small projects, big projects and a final capstone.

It is built for college students, people in their first job who want to grow or switch roles, and anyone moving into tech who is tired of stitching together ten incomplete courses.

## How it is organised

Everything follows one structure: **Role → Stage → Module → Lesson**.

- **Role:** a complete roadmap for one job, from zero to job-ready, ending in a big project, a capstone, a job-ready checklist and interview questions.
- **Stage:** a group of modules in learning order, each with a clear goal.
- **Module:** one skill (React, Docker, SQL, statistics…) with several lessons, a **hands-on lab** with a "done when" finish line, and a **mini project**.
- **Lesson:** notes, worked code, an exercise and a quiz. Lessons still being written show their full outline as a study checklist.

Modules are shared between roles, so "Git and GitHub" is the same module everywhere and progress counts once.

## Roles

Forge Academy focuses on three of the most in-demand tech roles of 2026, so each one can go deep instead of spreading thin. Every module within a role is placed in a deliberate learning order — foundations first, then the skills that build on them.

| Role | Modules | Lessons | Capstone |
|---|---|---|---|
| Full Stack Developer | 29 | 134 | Launch a real SaaS |
| AI / ML Engineer | 21 | 113 | AI app builder (like SaaSForge) |
| Cloud & DevOps Engineer | 17 | 84 | Production platform on Kubernetes |

All syllabi, lessons, labs and assignments here are original.

## How you learn

- **Role roadmaps:** pick a role and follow it stage by stage. Each stage is a group of modules in the order you should learn them; each module has detailed lessons, a hands-on lab and a project.
- **My path:** start from any role, then add modules from other areas or drop ones you don't need. Shared modules (like Git or SQL) are the same everywhere, so switching roles never wastes progress.
- **Module catalog:** every module on the platform, grouped by area — add any of them to your path.

## What's ready now

- All 3 roadmaps are fully structured: every module has detailed lessons, a hands-on lab with a "done when" finish line, and a project assignment; every role ends in a big project and a final capstone.
- Over 100 lessons are fully written with notes, worked code, an exercise and a quiz, many expanded with deeper notes, worked examples, common mistakes and practice problems. The rest show their complete outline as a study checklist and are being written in waves.
- Progress is saved in your browser, with no sign-up.

## Run locally

It's a static site with no build step:

```bash
git clone https://github.com/Pallak-08/forge-academy.git
cd forge-academy
python3 -m http.server 8000
# open http://localhost:8000
```

## Project structure

```
index.html            the app: layout, styles and logic
data/roles2.js        the 3 role roadmaps: stages, big project, capstone, job-ready checklist, interview questions
data/cur1-3.js        the modules: lessons (full or outline), lab and project
data/part*.js         the full written lessons (newer files declare the module they fill)
data/deep*.js         deeper lesson content: extended notes, worked examples, common mistakes and practice
```

## Contributing

The most valuable contribution is turning an outline lesson into a full one.

**A full lesson** is a plain object inside a module in `data/partN.js`:

```js
{ t: "Title", sub: ["sub-topic"], body: "<p>Notes</p>", lang: "python", code: "...",
  ex: "Exercise", q: ["Question?", ["A", "B", "C", "D"], 1, "Why B"] }
```

**In a module** (`data/cur*.js`), each entry in `les` is either an outline `["Title", ["sub-topic", ...]]` or a reference to a full lesson (`"partModuleNumber-lessonIndex"`). Replace the outline with the reference once the lesson is written.

Open an issue or a pull request.

## Deploy your own copy

Import the repository into [Vercel](https://vercel.com/new):

- Set the framework preset to **Other**.
- Leave the build command empty.

Netlify, GitHub Pages and any static host work too.

---

Created by **Pallak Khullar**. Many lessons use [SaaSForge](https://github.com/Pallak-08/saasforge), an open-source AI agent that builds SaaS apps, as a real-world example.
