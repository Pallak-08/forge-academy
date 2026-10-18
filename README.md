# Forge Academy

**Find your path in tech. Then walk it.**

**Live site: [forge-academy-learn.vercel.app](https://forge-academy-learn.vercel.app)**

Forge Academy is a free, open platform with complete career roadmaps for the most in-demand tech roles. Each roadmap comes with everything you need to learn it: notes, worked code, hands-on labs, quizzes, small projects, big projects and a final capstone.

It is built for college students, people in their first job who want to grow or switch roles, and anyone moving into tech who is tired of stitching together ten incomplete courses.

## Roles

| Role | Stages | What you'll build at the end |
|---|---|---|
| Frontend Developer | 6 | Production SaaS frontend in Next.js |
| Backend Developer | 6 | Multi-tenant SaaS backend |
| Full-Stack Developer | 6 | A real SaaS launched to real users |
| AI Engineer | 6 | AI app builder (like SaaSForge) |
| DevOps & Cloud Engineer | 6 | Production platform on Kubernetes |
| Cybersecurity Analyst | 6 | Full security assessment and report |
| Data Analyst | 6 | Automated business intelligence system |
| Data Scientist / ML Engineer | 6 | End-to-end ML product |
| Mobile Developer | 6 | Published production app |

## What every roadmap includes

- **Stages in learning order.** Each stage has a clear goal and a set of topics.
- **Every topic has:**
  - a checklist of what to learn
  - full lessons where available, each with notes, a code example, an exercise and a quiz
  - a **hands-on lab** with steps and a "done when" finish line
- **A mini project at the end of every stage**, then a big project and a capstone.
- **A job-ready checklist** and **common interview questions** for the role.
- **Progress tracking** in your browser, with no sign-up. Topics shared between roles (Git, SQL, Docker and so on) count once, so switching roles never wastes progress.

## What's ready now

- All 9 roadmaps are complete: 99 topics, 99 labs and 72 projects.
- 98 full lessons across 25 modules are live.
- Backend Developer and AI Engineer have full lessons for every technical topic.
- Other roles have full lessons for shared topics today. More lessons are added in waves, and contributions are welcome.

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
index.html          the app: layout, styles and logic
data/roles.js       the 9 roadmaps: stages, projects, job-ready checklists, interview questions
data/topics1-2.js   the topic library: what to learn, labs, links to lessons
data/part1-7.js     full lessons, grouped into 25 modules
```

## Contributing

The most valuable contributions are new lessons for topics that only have a guide so far (frontend, data, mobile, DevOps and security topics).

**A lesson** is a plain object inside a module in `data/partN.js`:

```js
{ t: "Title", sub: ["sub-topic"], body: "<p>Notes</p>", lang: "python", code: "...",
  ex: "Exercise", q: ["Question?", ["A", "B", "C", "D"], 1, "Why B"] }
```

**To link a lesson to a topic**, add its reference (`"moduleNumber-lessonIndex"`) to that topic's `les` array in `data/topics*.js`.

Open an issue or a pull request.

## Deploy your own copy

Import the repository into [Vercel](https://vercel.com/new):

- Set the framework preset to **Other**.
- Leave the build command empty.

Netlify, GitHub Pages and any static host work too.

---

Created by **Pallak Khullar**. Many lessons use [SaaSForge](https://github.com/Pallak-08/saasforge), an open-source AI agent that builds SaaS apps, as a real-world example.
