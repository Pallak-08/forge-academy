# Forge Academy

**A free, open roadmap from zero to job-ready software engineer.**

Forge Academy is for college and university students, career switchers and self-learners who want a clear plan, real foundations and portfolio projects before their first engineering job.

## What's inside

- **6 career roadmaps:** Web Developer, Backend Engineer, Security & Systems, AI Engineer, DevOps & Cloud, and a Full Roadmap that ends with building an AI SaaS builder. Each one puts the modules in order for that role and ends with a job-ready checklist.
- **20 modules, 80 lessons, 5 levels:**
  - Python and advanced Python
  - HTTP and REST, FastAPI, SQL, SQLAlchemy, frontend (HTML, CSS, JavaScript)
  - Authentication and security, concurrency and processes, Docker and sandboxing
  - LLM APIs, prompt engineering, AI agent design, code generation, parsing and ASTs, data and document processing, browser automation with Playwright
  - Testing, CI/CD and deployment, software design
- **Every lesson includes** sub-topics, an explanation, a working code example, a hands-on exercise, a quiz question with an explanation, and a notes box.
- **Projects:**
  - 15 portfolio project ideas (beginner, intermediate and advanced for each roadmap)
  - A 7-part capstone series where each project builds on the last
- **Progress tracking** in your browser, with no sign-up needed.

Many lessons use [SaaSForge](https://github.com/Pallak-08/saasforge), an open-source AI agent that builds SaaS apps, as a real-world example of how the pieces fit together.

## How to use it

1. Pick the roadmap for the job you want. You can switch later, and your progress is shared between roadmaps.
2. Do the lessons in order. Type the code yourself, do the exercise, then answer the quiz.
3. Build the projects and push each one to GitHub with a README and a live link.
4. Work through the job-ready checklist before you apply.
5. Share what you build on LinkedIn.

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
index.html        the app: layout, styles and logic
data/part1-5.js   course content: modules 1-20 and the capstone series
data/tracks.js    career roadmaps, job-ready checklists and project ideas
```

## Contributing

Corrections, new lessons and new project ideas are welcome. Lessons are plain JavaScript objects:

```js
{
  t: "Lesson title",
  sub: ["sub-topic", "sub-topic"],
  body: "<p>Explanation in HTML</p>",
  lang: "python",
  code: "print('example')",
  ex: "Exercise text",
  q: ["Question?", ["A", "B", "C", "D"], 2, "Why C is correct"]
}
```

Open an issue or a pull request.

## Deploy your own copy

Import the repository into [Vercel](https://vercel.com/new):

- Set the framework preset to **Other**.
- Leave the build command empty.

Netlify, GitHub Pages and any static host work too.

---

Created by **Pallak Khullar**.
