# Forge Academy

A personal, self-paced course that teaches everything needed to build **SaaSForge** (an AI agent that turns a brief or an HTML tool into a tested, deployed SaaS platform) and any other SaaS product.

- **20 modules · 80 lessons · 5 levels**: Python, HTTP and REST, FastAPI, SQL, SQLAlchemy, frontend, auth and security, concurrency, Docker, LLM APIs, prompt engineering, agent design, code generation, ASTs, file processing, Playwright, testing, CI/CD, software design
- Every lesson has sub-topics, an explanation, a code example, an exercise, a quiz and a notes box
- **7 capstone projects** that end with building your own SaaSForge
- Progress, notes and answers are saved in your browser

## Run locally

It is a static site with no build step:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
index.html        the app (layout, styles, logic)
data/part1-5.js   course content: modules 1-20 and the capstone projects
```

To add or edit a lesson, change the matching `data/partN.js` file. Each lesson is an object with `t` (title), `sub` (sub-topics), `body` (HTML), `lang`, `code`, `ex` (exercise) and `q` (question, options, correct index, explanation).

## Deploy

Import this repository in Vercel (Framework preset: **Other**, no build command, output directory `.`). Every push to `main` redeploys.

The AI tutor is only available when the page is opened as a Claude artifact; on other hosts it is hidden and the rest of the course works normally.
