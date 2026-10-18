/* Forge Academy: career roadmaps and portfolio project ideas */
window.TRACKS = [
  {
    id: "web", title: "Web Developer", short: "Web",
    who: "You want to build websites and web apps end to end: the page people see and the API behind it.",
    roles: ["Junior web developer", "Frontend developer", "Full-stack intern"],
    weeks: "10-14 weeks at 8-10 hours a week",
    modules: [1, 2, 3, 7, 4, 5, 6, 8, 18, 19],
    jobReady: [
      "Build a responsive page with semantic HTML and CSS Grid/Flexbox without a framework",
      "Call a REST API with fetch, handle loading, errors and 401s",
      "Build a CRUD API with FastAPI, Pydantic validation and a SQL database",
      "Explain how sign-in works: password hashing, tokens, roles",
      "Write tests for your API and run them in GitHub Actions",
      "Deploy a full-stack app with a real database and share the live link",
      "Explain XSS and SQL injection and show how your code prevents them"
    ]
  },
  {
    id: "backend", title: "Backend Engineer", short: "Backend",
    who: "You enjoy data, APIs and making systems reliable. You want to build what runs behind the screen.",
    roles: ["Backend developer", "Python developer", "API engineer"],
    weeks: "12-16 weeks at 8-10 hours a week",
    modules: [1, 2, 3, 4, 5, 6, 8, 9, 10, 18, 19, 20],
    jobReady: [
      "Design a REST API (resources, status codes, pagination) before writing code",
      "Model data with tables, keys and indexes; write joins and aggregates by hand",
      "Use SQLAlchemy sessions correctly and handle integrity errors",
      "Implement auth with roles and per-record access, and test that it holds",
      "Run slow work in the background and stream progress to the client",
      "Ship the service in a multi-stage Docker image with CI",
      "Explain retries, timeouts and idempotency in a design interview"
    ]
  },
  {
    id: "security", title: "Security & Systems", short: "Security",
    who: "You want to understand how systems are attacked and defended, and how code runs safely in production.",
    roles: ["Application security intern", "Junior security engineer", "Systems / platform engineer"],
    weeks: "12-16 weeks at 8-10 hours a week",
    modules: [1, 2, 3, 5, 8, 9, 10, 15, 16, 18, 19, 20],
    jobReady: [
      "Explain the OWASP Top 10 and fix injection, XSS and path traversal in real code",
      "Hash passwords properly and build and verify signed tokens",
      "Design role-based access with row-level scoping and prove it with tests",
      "Sandbox untrusted code with Docker: capabilities, read-only, no network, limits",
      "Replace eval with a safe AST-based evaluator",
      "Validate uploads: size caps, magic bytes, zip bombs",
      "Read logs and design for failure: timeouts, cleanup, audit trails"
    ]
  },
  {
    id: "ai", title: "AI Engineer", short: "AI",
    who: "You want to build products on top of large language models: assistants, agents and AI-powered tools.",
    roles: ["AI engineer", "LLM application developer", "Applied AI intern"],
    weeks: "14-18 weeks at 8-10 hours a week",
    modules: [1, 2, 3, 4, 11, 12, 13, 14, 15, 16, 17, 18, 20],
    jobReady: [
      "Call LLM APIs directly over HTTP, with retries, backoff and provider fallback",
      "Get reliable structured JSON from a model and validate it with code",
      "Design an agent loop with tools, budgets and stopping conditions",
      "Put people in the loop at the right moments (questions, approvals)",
      "Defend against prompt injection by limiting what model output can do",
      "Process real documents (CSV, Excel, PDF, Word, HTML) into model context",
      "Test an AI feature deterministically with a fake model"
    ]
  },
  {
    id: "devops", title: "DevOps & Cloud", short: "DevOps",
    who: "You like automation and infrastructure: getting code tested, packaged, deployed and kept running.",
    roles: ["DevOps intern", "Cloud / platform engineer", "Site reliability (junior)"],
    weeks: "8-12 weeks at 8-10 hours a week",
    modules: [1, 2, 3, 4, 9, 10, 18, 19, 20],
    jobReady: [
      "Write a multi-stage Dockerfile with cached layers and a non-root user",
      "Run an app and Postgres together with docker compose and health checks",
      "Build a CI pipeline that tests, builds and blocks broken changes",
      "Deploy to a PaaS with secrets in environment variables",
      "Add structured logs, request ids and health endpoints",
      "Harden containers and explain each flag",
      "Explain a rollback plan and how you would back up and restore a database"
    ]
  },
  {
    id: "full", title: "Full Roadmap: build an AI SaaS builder", short: "Full",
    who: "You want the whole picture, ending with a platform that builds platforms, like the open-source SaaSForge project.",
    roles: ["Full-stack engineer", "Founding engineer", "AI product engineer"],
    weeks: "24-30 weeks at 8-10 hours a week",
    modules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    jobReady: [
      "Everything in the Web, Backend, Security, AI and DevOps checklists",
      "Design a layered system and write its architecture document",
      "Build a spec-driven engine that turns validated JSON into a working app",
      "Run generated code in a hardened sandbox with a self-correcting fix loop",
      "Ship a portfolio of the 7 capstone projects with live links"
    ]
  }
];

/* Portfolio project ideas: three per roadmap, beginner to advanced */
window.IDEAS = [
  { track: "web", level: "Beginner", title: "Personal portfolio with a contact API",
    pitch: "A responsive portfolio site plus a tiny FastAPI endpoint that stores contact messages in SQLite.",
    features: ["Semantic HTML, CSS Grid, dark mode", "Contact form with validation on both sides", "Admin page listing messages behind a password"],
    stretch: "Rate-limit the contact form and add spam protection." },
  { track: "web", level: "Intermediate", title: "Campus events board",
    pitch: "Students post events, others RSVP, organisers see attendee lists.",
    features: ["Sign-in with roles: student, organiser, admin", "Search and filter by date and category", "CSV export of attendees"],
    stretch: "Live attendee counts with Server-Sent Events." },
  { track: "web", level: "Advanced", title: "Mini Trello",
    pitch: "Boards, lists and cards with drag and drop, shared between team members.",
    features: ["Hash-routed single-page app without a framework", "Per-board membership and permissions", "Activity log and undo"],
    stretch: "Real-time updates across browsers." },

  { track: "backend", level: "Beginner", title: "URL shortener API",
    pitch: "Create short links, redirect them, and count clicks.",
    features: ["Unique codes with collision handling", "Click analytics with GROUP BY", "API keys per user"],
    stretch: "Expiring links and a background cleanup job." },
  { track: "backend", level: "Intermediate", title: "Library management system",
    pitch: "Books, members and loans with due dates and fines.",
    features: ["Relational schema with foreign keys and constraints", "Workflow: reserved, borrowed, returned, overdue", "Role-based access for librarians and members"],
    stretch: "Nightly overdue report generated in the background." },
  { track: "backend", level: "Advanced", title: "Job queue service",
    pitch: "A service that accepts jobs over HTTP, runs them with a worker pool and streams progress.",
    features: ["Worker pool with concurrency limits and cancellation", "Retries with backoff, dead-letter list", "SSE progress stream and job history"],
    stretch: "Run each job in a hardened Docker container." },

  { track: "security", level: "Beginner", title: "Password strength and breach checker",
    pitch: "A CLI and API that scores passwords and stores only scrypt hashes for a demo login.",
    features: ["scrypt hashing with salts", "Constant-time comparison", "Login throttling"],
    stretch: "Write a short report on why each design choice matters." },
  { track: "security", level: "Intermediate", title: "Vulnerable-by-design app, then fixed",
    pitch: "Build a small app with deliberate flaws (SQLi, XSS, path traversal), exploit each, then fix and test it.",
    features: ["One branch vulnerable, one fixed", "A test per vulnerability that fails before the fix", "Write-up for each issue"],
    stretch: "Add a CSP and security headers and verify them." },
  { track: "security", level: "Advanced", title: "Code sandbox service",
    pitch: "Users submit Python snippets; the service runs them safely and returns output.",
    features: ["Docker with --network none, --read-only, cap-drop, limits", "Timeouts and kill", "Audit log of every run"],
    stretch: "A safe formula language using an AST whitelist instead of Python." },

  { track: "ai", level: "Beginner", title: "Study notes summariser",
    pitch: "Upload lecture notes (PDF or Word) and get a summary, key terms and 5 quiz questions as JSON.",
    features: ["PDF and DOCX text extraction", "Structured JSON output with validation", "Retries and provider fallback"],
    stretch: "Flashcard mode in the browser." },
  { track: "ai", level: "Intermediate", title: "Resume and job-description matcher",
    pitch: "Compare a resume with a job post and get a match score, gaps and suggested bullet points.",
    features: ["Prompt with schema, rules and an example", "Prompt-injection resistant (job post is data)", "Tests with a fake model"],
    stretch: "Batch-compare one resume against ten job posts." },
  { track: "ai", level: "Advanced", title: "AI app builder (mini SaaSForge)",
    pitch: "Turn a one-line brief into a JSON spec, generate a CRUD app from it, test it in Docker and fix the spec on failure.",
    features: ["Clarifying questions and plan approval", "Spec validation and a deterministic generator", "Self-correction loop with failure fingerprints"],
    stretch: "Wrap an existing HTML tool with Playwright as a multi-user service." },

  { track: "devops", level: "Beginner", title: "Dockerise and deploy any app",
    pitch: "Take a project you already built and make it production-ready.",
    features: ["Multi-stage Dockerfile, non-root user", "docker compose with Postgres", "Deploy to a free PaaS"],
    stretch: "Health checks and a zero-downtime redeploy." },
  { track: "devops", level: "Intermediate", title: "CI/CD pipeline template",
    pitch: "A reusable GitHub Actions setup: lint, test, build image, deploy on main.",
    features: ["Cached dependencies", "Tests in a hardened container", "Status badge and required checks"],
    stretch: "Preview deployments for pull requests." },
  { track: "devops", level: "Advanced", title: "Uptime and log dashboard",
    pitch: "A service that pings your apps, stores results and shows uptime and recent errors.",
    features: ["Background scheduler and worker", "Structured JSON logs with request ids", "Alert when a check fails twice"],
    stretch: "Store metrics in Postgres and chart them." }
];
