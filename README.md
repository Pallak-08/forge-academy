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

Forge Academy focuses on the six roles with the strongest hiring demand in 2026 (AI, cybersecurity, cloud and data roles lead hiring surveys), so each one can go deep instead of spreading thin.

| Role | Modules | Lessons | Capstone |
|---|---|---|---|
| AI / ML Engineer | 21 | 113 | AI app builder (like SaaSForge) |
| Cyber Security Analyst | 19 | 87 | Security programme for a startup |
| Cloud & DevOps Engineer | 17 | 84 | Production platform on Kubernetes |
| Data Engineer | 17 | 79 | Real-time data platform |
| Data Analyst | 10 | 44 | Business intelligence system |
| Full Stack Developer | 26 | 124 | Launch a real SaaS |

Every role page links to its roadmap.sh counterpart as a second opinion. All syllabi, lessons, labs and projects here are original.

## Three ways to learn

- **Build a project (start here):** tell Forge what you want to build — "an AI chatbot that answers questions from my PDFs", "an online store with payments" — and it turns that into an ordered path of exactly the skills that project needs, each module marked with *why* it's there, ending in the project itself as your capstone. Pick from a library of ready-made project blueprints, or describe your own in a sentence and let Forge map the skills for you.
- **Role roadmaps:** a ready-made path for one job, in the right order.
- **My path:** start from a project *or* a role, then add modules from other areas, drop ones you don't need, or build a path entirely from the catalog. Progress is the same wherever a module appears.

The **module catalog** holds all the shared modules (foundations, frontend, backend, DevOps and cloud, security, QA, data, machine learning, AI engineering, mobile, career) that these paths are assembled from.

## What's ready now

- All 6 roadmaps are fully written: every lesson has notes, worked code, an exercise and a quiz; every module has a lab and a project.
- Lessons are being expanded with deeper notes, worked examples, common mistakes and practice problems, role by role.
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
data/roles2.js        the 6 role roadmaps: stages, big project, capstone, job-ready checklist, interview questions
data/projects.js      the project blueprints: each maps a thing to build to an ordered set of modules, with a reason per module
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
