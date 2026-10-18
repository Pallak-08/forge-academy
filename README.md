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

| Role | Modules | Lessons | Fully written | Capstone |
|---|---|---|---|---|
| Frontend Developer | 18 | 77 | 32% | Production SaaS frontend |
| Backend Developer | 22 | 113 | 53% | Multi-tenant SaaS backend |
| Full Stack Developer | 26 | 124 | 45% | Launch a real SaaS |
| DevOps Engineer | 16 | 81 | 33% | Production platform on Kubernetes |
| DevSecOps Engineer | 21 | 94 | 23% | Secure cloud platform |
| AI Engineer | 16 | 94 | 70% | AI app builder (like SaaSForge) |
| AI and Data Scientist | 16 | 79 | 54% | End-to-end ML product |
| Data Analyst | 10 | 44 | 52% | Business intelligence system |
| Data Engineer | 17 | 79 | 39% | Real-time data platform |
| Machine Learning / MLOps Engineer | 22 | 110 | 45% | Production ML system |
| Android Developer | 12 | 56 | 39% | Published Android app |
| iOS Developer | 12 | 55 | 40% | Published iOS app |
| Cyber Security Analyst | 19 | 87 | 18% | Security programme for a startup |
| QA Engineer | 15 | 80 | 44% | Quality programme for an app |

The role list mirrors the popular roles on [roadmap.sh](https://roadmap.sh), and every role page links to its roadmap.sh counterpart as a second opinion. All syllabi, lessons, labs and projects here are original.

## Two ways to learn

- **Role roadmaps:** a ready-made path for one job, in the right order.
- **Module catalog:** all 71 modules in 11 areas (foundations, frontend, backend, DevOps and cloud, security, QA, data, machine learning, AI engineering, mobile, career).
- **My path:** start from any role, then add modules from other areas or skip ones you don't need, or build a path entirely from the catalog.

## What's ready now

- All 14 roadmaps, 71 modules and 323 lessons are fully outlined; every module has a lab and a project.
- 120 lessons are fully written with notes, code, an exercise and a quiz. The rest are being written in waves, role by role.
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
data/roles2.js        the 14 role roadmaps: stages, big project, capstone, job-ready checklist, interview questions
data/cur1-3.js        the 71 modules: lessons (full or outline), lab and project
data/part1-9.js       the full written lessons
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
