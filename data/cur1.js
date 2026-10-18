/* Forge Academy curriculum, part 1: foundations, frontend, backend.
   A module = { id, t, area, d, les: [ "n-i" (full lesson) | [title, [sub-topics]] (outline) ], lab, proj }.
   All syllabus text is original to Forge Academy. */
window.MODS = window.MODS || [];
(function () {
  const M = (id, t, area, d, les, lab, proj) => MODS.push({ id, t, area, d, les, lab, proj });
  const lab = (t, steps, done) => ({ t, steps, done });
  const proj = (t, brief, features) => ({ t, brief, features });

  /* ================= FOUNDATIONS ================= */
  M("internet", "How the internet and the web work", "foundations", "What happens between typing an address and seeing a page. Every tech role builds on this.", [
    ["Networks, IP addresses and packets", ["What a network is", "IP addresses: IPv4 and IPv6", "Packets and routing", "TCP vs UDP", "Ports"]],
    ["DNS and domain names", ["How a name becomes an IP address", "Record types: A, AAAA, CNAME, MX, TXT", "Registrars and nameservers", "DNS caching and TTL", "Using dig and nslookup"]],
    "3-0",
    ["HTTPS and TLS", ["Why plain HTTP is unsafe", "Certificates and certificate authorities", "The TLS handshake in plain words", "HSTS", "Inspecting a certificate"]],
    ["How browsers render pages", ["Parsing HTML into the DOM", "CSS and the render tree", "Layout, paint and composite", "Where JavaScript blocks rendering", "DevTools Network and Performance panels"]],
    ["Hosting, servers and the cloud", ["What a web server does", "Static vs dynamic hosting", "CDNs", "Shared, VPS, PaaS and serverless hosting", "Domains + hosting = a live site"]]
  ], lab("Trace a page load end to end", ["Use dig on three domains and record their DNS answers", "Load a site with DevTools open and list the first 10 requests, their types and status codes", "Compare curl -I output with what DevTools shows", "Write a one-page explanation of the journey from URL to rendered page"], "You can explain DNS, TCP, TLS, HTTP and rendering in order without notes."),
  proj("Network detective report", "A short illustrated report explaining exactly how one real website reaches your screen.", ["DNS records and hosting provider identified", "Request waterfall annotated", "TLS certificate chain explained", "Published as a Markdown page on GitHub"]));

  M("cs-basics", "Computer science essentials", "foundations", "How computers actually run your code: enough to reason about performance, memory and concurrency.", [
    ["How a computer runs a program", ["CPU, memory, storage", "Binary and how data is represented", "Compiled vs interpreted languages", "What happens when you run a script"]],
    ["Operating systems", ["Processes and threads", "Memory: stack and heap", "File systems", "System calls", "Scheduling in brief"]],
    ["Character encoding and data formats", ["ASCII and Unicode / UTF-8", "JSON, CSV, XML, YAML", "Binary vs text formats", "Serialisation"]],
    ["Complexity and performance intuition", ["Big-O revisited", "Latency numbers every engineer should know", "Caches and locality", "Measuring before optimising"]]
  ], lab("Look under the hood", ["Use top / Activity Monitor to watch a program's CPU and memory", "Write a script that leaks memory and observe it grow", "Save the same data as JSON, CSV and a binary pickle and compare sizes", "Time a loop over 10 million items in Python and explain the result"], "You can explain processes, memory and encodings with examples from your own machine."),
  proj("System explorer CLI", "A command-line tool that reports what is running on your machine and how resources are used.", ["Lists top processes by CPU and memory", "Shows disk usage per folder", "Outputs JSON or a table", "Packaged with a README"]));

  M("terminal", "Terminal and Linux basics", "foundations", "Servers, containers and most developer tools are driven from the command line.", [
    "21-2",
    ["Files, permissions and users", ["Absolute and relative paths", "Permissions: read, write, execute; chmod and chown", "Users, groups and sudo", "Hidden files and dotfiles"]],
    ["Processes, services and logs", ["ps, top, kill and signals", "Background jobs", "Services with systemd", "Reading logs with journalctl and tail"]],
    ["Package managers and environment", ["apt, brew, winget", "Environment variables and PATH", "Shell config files (.bashrc, .zshrc)", "Installing language versions (pyenv, nvm)"]],
    ["Text processing power tools", ["grep, sed and awk", "sort, uniq, wc, cut", "Pipes and redirection", "find and xargs"]]
  ], lab("A day without a GUI", ["Create a project tree using only commands", "Generate a 500-line fake log with a loop", "Report the top 5 error messages using grep, sort and uniq", "Write a run.sh with set -euo pipefail and make it executable"], "You can do routine file, process and text work without a graphical file manager."),
  proj("Log analyser script", "A shell script that summarises any log file.", ["Counts errors and warnings", "Top 10 messages and IP addresses", "Works on files of any size", "Usage help with --help"]));

  M("git", "Git and GitHub", "foundations", "Version control and collaboration. Your GitHub profile is also your portfolio.", [
    "21-0", "21-1",
    ["Branching strategies and team workflows", ["Feature branches and trunk-based development", "Rebase vs merge", "Tags and releases", "Conventional commits", "Undoing things: revert, reset, restore"]],
    ["GitHub beyond code", ["Issues and project boards", "README, LICENSE and CONTRIBUTING", "GitHub Actions in one minute", "GitHub Pages", "Profile README"]]
  ], lab("Run a repo like a team", ["Create a repo with .gitignore, README and LICENSE", "Build a feature on a branch and open a pull request", "Create and resolve a merge conflict", "Tag a v1.0.0 release"], "Your repo has clean history, a merged PR, a release and a helpful README."),
  proj("Polished open-source repo", "Turn a small project into a repo a stranger could use and contribute to.", ["README with screenshots and setup", "Issues and labels", "CONTRIBUTING guide", "A tagged release"]));

  M("python", "Python programming", "foundations", "A readable language used for backend, data, AI, automation and security tooling.", ["1-0", "1-1", "1-2", "1-3", "2-0", "2-1", "2-2", "2-3",
    ["Virtual environments and packaging", ["venv and pip", "requirements.txt and pyproject.toml", "uv / poetry overview", "Publishing a package"]]
  ], lab("CLI expense tracker", ["Store expenses as dataclasses", "Add, list and total-by-category commands", "Save and load JSON", "Type-check with mypy and handle bad input with custom exceptions"], "The tool works, survives bad input, and mypy passes."),
  proj("Automation toolkit", "Three Python scripts that save you real time.", ["A file organiser", "A web page change notifier", "A CSV report generator", "Each with tests and a README"]));

  M("javascript", "JavaScript", "foundations", "The language of the browser, and with Node.js, of servers and tools too.", [
    ["Syntax, types and operators", ["let and const", "Primitive types and objects", "Equality: == vs ===", "Truthy and falsy", "Template literals"]],
    ["Functions, scope and closures", ["Function declarations and arrows", "Scope and hoisting", "Closures", "this and binding", "Higher-order functions"]],
    ["Objects, arrays and data handling", ["Destructuring and spread", "map, filter, reduce, find", "Sets and Maps", "JSON", "Immutability habits"]],
    "7-2",
    ["The event loop and asynchronous JavaScript", ["Call stack, task queue, microtasks", "Callbacks to promises to async/await", "Promise.all and Promise.race", "Error handling in async code"]],
    ["Modules, classes and error handling", ["ES modules: import and export", "Classes and prototypes", "try / catch / finally", "Custom errors"]]
  ], lab("Data wrangling in plain JavaScript", ["Load a JSON array of 100 products", "Compute totals by category with reduce", "Fetch data from a public API with async/await", "Handle network and parsing errors gracefully"], "You can transform data and call APIs in JavaScript without looking up syntax."),
  proj("Quiz game", "A browser quiz game in plain JavaScript.", ["Questions loaded from JSON", "Timer and scoring", "High scores saved in localStorage", "No frameworks"]));

  M("typescript", "TypeScript", "foundations", "JavaScript with types: the default for professional frontend and Node codebases.", ["26-0",
    ["Advanced types", ["Utility types: Partial, Pick, Omit, Record", "Mapped and conditional types", "Type guards and assertion functions", "unknown vs any", "Declaration files"]],
    ["TypeScript in real projects", ["tsconfig and strict mode", "Typing React components and hooks", "Typing Express/Node handlers", "Runtime validation with zod", "Migrating a JS project"]]
  ], lab("Type an existing project", ["Convert a small JS app to TypeScript", "Turn on strict mode and fix every error", "Validate an API response with zod", "Remove every any"], "Strict mode passes with no any and runtime data is validated."),
  proj("Typed API client", "A small, fully typed client library for a public API.", ["Typed request and response models", "zod validation", "Error result types", "Published on npm or GitHub"]));

  M("dsa", "Data structures and algorithms", "foundations", "The patterns behind coding interviews, and behind code that stays fast as data grows.", ["24-0", "24-1", "24-2", "24-3",
    ["Heaps, tries and advanced graphs", ["Priority queues and heaps", "Tries for prefix search", "Dijkstra's shortest path", "Topological sort", "Union-find"]],
    ["Interview problem-solving strategy", ["Clarify, examples, brute force, optimise", "Talking while you code", "Testing your own solution", "A 12-week practice plan"]]
  ], lab("Pattern practice sprint", ["Solve 3 problems each for hash maps, two pointers, sliding window and BFS/DFS", "Write time and space complexity for each", "Re-solve 4 of them a week later without notes", "Do one timed mock interview"], "You recognise common patterns and explain complexity out loud."),
  proj("Algorithm visualiser", "A small web page that animates sorting and graph search.", ["Bubble, merge and quick sort", "BFS and DFS on a grid", "Speed control", "Complexity shown for each"]));

  M("debugging", "Debugging and problem solving", "foundations", "The skill used every day: turning an error into a fix quickly.", ["21-3",
    ["Debugging tools", ["Breakpoints in VS Code", "Browser DevTools debugger", "Logging levels", "Reading network traces"]],
    ["Learning effectively as an engineer", ["Reading official documentation", "Minimal reproductions", "Asking good questions", "Using AI assistants without losing understanding"]]
  ], lab("Break it, then fix it", ["Introduce three different bugs into a working program", "Find each from its stack trace", "Use a breakpoint to inspect state at least once", "Write a 'what, expected, got, tried' note for one"], "You fix unfamiliar errors by reading them, not by guessing."),
  proj("Bug journal", "A public log of ten real bugs you hit and how you solved them.", ["Error, cause and fix for each", "Lessons learned", "Links to commits"]));

  /* ================= FRONTEND ================= */
  M("html", "HTML and semantic markup", "frontend", "The structure of every web page and the foundation of accessibility and SEO.", ["7-0",
    ["Forms in depth", ["Input types and attributes", "Labels, fieldsets and legends", "Native validation", "Accessible error messages"]],
    ["Media, tables and embeds", ["Images, srcset and alt text", "Video and audio", "Data tables done right", "iframes and their risks"]],
    ["SEO basics for developers", ["Titles and meta descriptions", "Headings and structure", "Open Graph tags", "Sitemaps and robots.txt"]]
  ], lab("Rebuild a real page's structure", ["Write the HTML of a news article page with no CSS", "Use header, nav, main, article, aside and footer correctly", "Add an accessible sign-up form", "Navigate it fully with the keyboard"], "The page is usable and well structured with zero CSS."),
  proj("Semantic recipe site", "A multi-page recipe site in pure HTML.", ["Semantic structure", "Accessible forms and tables", "SEO metadata", "Validated with the W3C validator"]));

  M("css", "CSS and responsive layout", "frontend", "Turning structure into design: the cascade, Flexbox, Grid and responsive layouts.", ["7-1",
    ["Selectors, specificity and the cascade", ["Selector types", "Specificity and inheritance", "The box model", "Units: px, rem, %, vw"]],
    ["Flexbox and Grid in depth", ["Flex direction, wrap, grow, shrink", "Grid templates and areas", "Alignment", "When to use which"]],
    ["Responsive design", ["Mobile first", "Media and container queries", "Fluid type with clamp()", "Responsive images"]],
    ["Animations and modern CSS", ["Transitions and keyframes", "Transforms", "prefers-reduced-motion", ":has(), nesting and layers"]]
  ], lab("Clone a landing page", ["Recreate a real landing page layout with Grid and Flexbox", "Define colours and spacing as CSS variables", "Make it work at 375, 768 and 1280px", "Add dark mode"], "Your clone matches at three widths with no horizontal scroll."),
  proj("Responsive portfolio", "Your personal portfolio site, hand-written.", ["Responsive layout", "Dark mode", "Accessible navigation", "Deployed with a live link"]));

  M("dom", "DOM, events and browser APIs", "frontend", "Making pages interactive without a framework, which is what frameworks do under the hood.", ["7-3",
    ["Events in depth", ["Bubbling and capturing", "Event delegation", "Keyboard and pointer events", "Custom events"]],
    ["Browser storage and APIs", ["localStorage, sessionStorage, IndexedDB", "Cookies", "Fetch, AbortController", "Intersection and Resize observers"]],
    ["Rendering lists and state by hand", ["Keeping state in one object", "Re-rendering from state", "Templates", "Safe rendering vs innerHTML"]]
  ], lab("Vanilla to-do app", ["Add, complete, delete and filter to-dos", "Use event delegation", "Persist to localStorage", "Render all user text safely"], "The app works after reload and survives a to-do named <script>alert(1)</script>."),
  proj("Weather dashboard", "Search a city and show weather from a public API, in plain JavaScript.", ["Debounced search", "Loading and error states", "Recent searches saved", "Responsive"]));

  M("fe-tooling", "Frontend tooling", "frontend", "How modern frontend projects are created, built and kept clean.", ["26-1",
    ["Bundlers and build pipelines", ["What a bundler does", "Vite, webpack, esbuild", "Code splitting", "Source maps"]],
    ["Code quality automation", ["ESLint rules", "Prettier", "Husky and lint-staged", "Type checking in CI"]]
  ], lab("Professional project setup", ["Create a Vite + TypeScript project and explain every file", "Add ESLint, Prettier and a pre-commit hook", "Use an environment variable for the API URL", "Build and inspect the bundle"], "npm run build produces a small bundle and lint runs on every commit."),
  proj("Starter template", "A reusable frontend starter you'll use for every project.", ["TypeScript, linting, formatting, tests", "CI workflow", "Documented in a README"]));

  M("react", "React", "frontend", "The most used frontend library: components, state, effects, routing and data.", ["26-2", "26-3", "26-4",
    ["Forms in React", ["Controlled vs uncontrolled inputs", "React Hook Form", "Validation with zod", "Accessible error states"]],
    ["React performance", ["How rendering works", "memo, useMemo, useCallback", "Lists and virtualisation", "Profiling with React DevTools"]]
  ], lab("Product catalogue", ["Split the UI into reusable components", "Search, filter and a persisted cart", "Fetch data with loading and error states", "Add routes for list, detail and 404"], "The catalogue is fast, routable and handles every state."),
  proj("E-commerce storefront", "A complete React storefront.", ["Routing and protected checkout", "Global cart state", "Server data with caching", "Validated checkout form"]));

  M("styling", "Design systems and styling at scale", "frontend", "Consistent, themeable interfaces: Tailwind, component libraries and design tokens.", ["26-5",
    ["Component libraries and headless UI", ["shadcn/ui and Radix", "MUI and Chakra", "Theming", "Building vs adopting"]],
    ["Working with designers and Figma", ["Reading a Figma file", "Design tokens", "Spacing and typography scales", "Handoff and review"]]
  ], lab("Mini design system", ["Configure tokens for colour, spacing and type", "Build Button, Input, Card and Modal with variants", "Add dark mode", "Document every component on one page"], "Every screen uses your components and theme changes need no page-specific CSS."),
  proj("Component library", "A documented, accessible component library.", ["Six components with variants", "Keyboard and screen-reader support", "Docs page", "Published as a package or repo"]));

  M("nextjs", "Next.js and rendering strategies", "frontend", "The leading React framework: routing, server rendering and full-stack features.", ["26-6",
    ["Data fetching and caching in Next.js", ["Server fetching and caching", "Revalidation", "Loading and error UI", "Streaming"]],
    ["Auth, APIs and deployment", ["Route handlers and server actions", "Authentication with Auth.js", "Middleware", "Deploying to Vercel"]]
  ], lab("Server-rendered blog", ["Create routes and a shared layout", "Render posts from Markdown statically", "Add a dynamic server-rendered page", "Add SEO metadata and check the HTML source"], "Content is visible in the HTML source and pages load fast."),
  proj("SaaS landing + dashboard", "A Next.js app with a marketing site and a signed-in dashboard.", ["Static marketing pages", "Auth and protected dashboard", "Server actions", "Deployed"]));

  M("fe-quality", "Frontend testing, performance and accessibility", "frontend", "Shipping interfaces that work for everyone, load fast and stay correct.", ["26-7",
    ["Accessibility in practice", ["WCAG levels", "Keyboard and focus management", "ARIA: when and when not", "Screen reader testing", "Colour contrast"]],
    ["Web performance", ["Core Web Vitals", "Images and fonts", "Bundle analysis", "Caching and CDNs"]],
    ["Frontend security", ["XSS and safe rendering", "CORS", "Content Security Policy", "Storing tokens", "Dependency audits"]]
  ], lab("Audit and fix", ["Run Lighthouse and axe on your app", "Fix every accessibility issue found", "Improve LCP and CLS and record before/after", "Add a CSP header"], "Lighthouse is 90+ in every category and the app is usable without a mouse."),
  proj("Quality report", "A before/after quality audit of one of your apps.", ["Accessibility fixes", "Performance improvements with numbers", "Test suite added", "Written case study"]));

  M("deploy-fe", "Deploying frontends", "frontend", "Getting your work live with a link you can share.", ["19-2",
    ["Static hosting platforms", ["Vercel, Netlify, GitHub Pages, Cloudflare Pages", "Build settings", "Environment variables", "Preview deployments"]],
    ["Domains and monitoring", ["Custom domains and HTTPS", "Redirects", "Error tracking (Sentry)", "Analytics"]]
  ], lab("Ship it", ["Deploy a React app from GitHub", "Configure an environment variable", "Use a pull request preview", "Add error tracking"], "A live link updates on every push and errors are reported to you."),
  proj("Live portfolio", "All your frontend projects deployed with clean URLs.", ["Each project live", "Custom domain or clean names", "Linked from your portfolio"]));

  /* ================= BACKEND ================= */
  M("http-apis", "HTTP and API design", "backend", "The contract between clients and servers: REST, status codes, streaming and alternatives.", ["3-1", "3-2", "3-3",
    ["GraphQL and gRPC", ["GraphQL schemas, queries and mutations", "When GraphQL helps and hurts", "gRPC and protocol buffers", "Choosing an API style"]],
    ["API documentation and versioning", ["OpenAPI / Swagger", "Versioning strategies", "Pagination styles", "Idempotency keys", "Webhooks"]]
  ], lab("Design before you code", ["Write a full REST API design for a library app", "Write an OpenAPI spec for it", "Call three public APIs and note their conventions", "Mark which of your routes are idempotent"], "Someone could build a client from your API document alone."),
  proj("Public API spec", "A professional API design document for a product idea.", ["OpenAPI spec", "Error format", "Pagination and versioning", "Example requests"]));

  M("fastapi", "Python web APIs with FastAPI", "backend", "A modern Python framework with automatic validation and docs.", ["4-0", "4-1", "4-2", "4-3",
    ["Async, background tasks and WebSockets", ["async endpoints", "BackgroundTasks", "WebSockets", "Lifespan events"]]
  ], lab("Notes API", ["CRUD routes with Pydantic models", "Search and pagination", "A current_user dependency", "Routers and middleware"], "Every route works from /docs with correct status codes."),
  proj("Library management API", "Books, members and loans with due dates.", ["CRUD with validation", "Workflow states", "Interactive docs", "Tests"]));

  M("node", "Node.js and Express", "backend", "JavaScript on the server, common in startups and full-stack JavaScript teams.", [
    ["The Node.js runtime", ["The event loop on the server", "Modules and npm", "File system and streams", "Environment and process"]],
    ["Express fundamentals", ["Routing and middleware", "Request validation with zod", "Error handling middleware", "Static files"]],
    ["Databases from Node", ["Prisma ORM", "Migrations", "Transactions", "Connection pooling"]],
    ["Production Node", ["Logging with pino", "Graceful shutdown", "Clustering and PM2", "Security headers with helmet"]]
  ], lab("Notes API in Express", ["Recreate the notes API in Express", "Validate bodies with zod", "Store data with Prisma", "Add error middleware and logging"], "Both a FastAPI and an Express version pass the same HTTP tests."),
  proj("URL shortener service", "A Node service that shortens links and counts clicks.", ["Collision-safe codes", "Click analytics", "Rate limiting", "Docker and tests"]));

  M("sql", "SQL and relational databases", "backend", "Where almost every product keeps its data.", ["5-0", "5-1", "5-2", "5-3",
    ["Database design and normalisation", ["Entities and relationships", "Normal forms in practice", "When to denormalise", "ER diagrams"]],
    ["PostgreSQL features", ["JSONB", "Full-text search", "Views and materialised views", "Constraints and triggers", "EXPLAIN ANALYZE"]]
  ], lab("Model a real domain", ["Design tables for a clinic", "Write 10 queries including joins and GROUP BY", "Compare EXPLAIN output before and after an index", "Write a safe booking transaction"], "Queries are correct, parameterised and use indexes."),
  proj("Analytics-ready schema", "A normalised schema and query pack for a real domain.", ["ER diagram", "Seed data", "20 documented queries", "Indexes justified with EXPLAIN"]));

  M("orm", "ORMs and data access", "backend", "Working with rows as objects, safely and efficiently.", ["6-0", "6-1", "6-2", "6-3",
    ["Migrations and performance", ["Alembic migrations", "The N+1 query problem", "Eager vs lazy loading", "Bulk operations"]]
  ], lab("Database-backed API", ["Replace in-memory storage with SQLAlchemy", "Add owner_id and enforce ownership", "Write a migration", "Fix an N+1 query"], "Data persists, users only see their own rows, and query counts stay low."),
  proj("Multi-user notes service", "A secure, database-backed notes API.", ["Per-user isolation", "Migrations", "Pagination and search", "Tests"]));

  M("nosql", "NoSQL and search", "backend", "Document, key-value and search stores, and when they beat tables.", ["25-0", "22-0",
    ["Search engines", ["Inverted indexes", "Elasticsearch / OpenSearch basics", "Relevance and analyzers", "Keeping search in sync"]],
    ["Choosing a database", ["Consistency models and CAP", "Read and write patterns", "Polyglot persistence", "A decision checklist"]]
  ], lab("Same app, three stores", ["Store notes in MongoDB", "Cache hot reads in Redis", "Add full-text search", "Write a decision note on when to use each"], "You can justify a database choice with real trade-offs."),
  proj("Product search service", "Fast product search with filters and autocomplete.", ["Indexed search", "Autocomplete", "Facets", "Benchmarks"]));

  M("auth", "Authentication and authorisation", "backend", "Sign-in, sessions, tokens, OAuth and per-record access.", ["8-0", "8-1", "8-2",
    ["Sessions, cookies and OAuth", ["Session cookies vs tokens", "Cookie flags: HttpOnly, Secure, SameSite", "OAuth 2.0 and OpenID Connect", "Sign in with Google/GitHub"]],
    ["Multi-factor and account security", ["TOTP two-factor", "Password reset flows", "Account lockout", "Passkeys overview"]]
  ], lab("Auth from scratch", ["Register and login with hashed passwords", "Signed expiring tokens", "Roles on admin routes", "Isolation tests between users"], "Isolation tests pass and tampered tokens are rejected."),
  proj("Auth service", "A reusable authentication service.", ["Email/password and OAuth login", "Refresh tokens", "Roles", "Security tests"]));

  M("api-security", "API security", "backend", "Defending against the attacks every public API sees.", ["8-3",
    ["OWASP API Security Top 10", ["Broken object level authorisation", "Excessive data exposure", "Mass assignment", "Rate limiting and resource abuse"]],
    ["Secrets and dependency security", ["Environment variables and secret stores", "Rotating keys", "Dependency scanning", "Supply-chain attacks"]]
  ], lab("Pentest your own API", ["Try injection, path traversal and oversized uploads", "Add login rate limiting", "Move every secret into the environment", "Add security headers"], "Every attack you tried is blocked and covered by a test."),
  proj("Hardened API", "A security write-up and fixes for one of your APIs.", ["Threat model", "Fixes with tests", "Security headers", "Report"]));

  M("testing", "Automated testing", "backend", "Proving code works and keeps working.", ["18-0", "18-1", "18-2", "18-3",
    ["Test strategy", ["The test pyramid", "Contract tests", "Test data management", "Coverage: useful and misleading"]]
  ], lab("Test suite for your API", ["Unit tests for pure functions", "API tests for auth, validation and isolation", "A parametrised permission matrix", "Measure coverage"], "Breaking any important rule makes a test fail."),
  proj("Tested service", "Take an untested project to 80%+ meaningful coverage.", ["Unit, API and e2e tests", "Fixtures and fakes", "CI running tests"]));

  M("async-systems", "Concurrency, queues and real-time", "backend", "Background work, message queues and live updates.", ["9-0", "9-1", "9-2", "9-3", "22-1",
    ["Message brokers and event-driven design", ["RabbitMQ vs Kafka", "Pub/sub", "Event-driven architecture", "Outbox pattern"]],
    ["WebSockets and real-time", ["Polling vs SSE vs WebSockets", "Scaling connections", "Presence", "Reconnection"]]
  ], lab("Report generator", ["Endpoint enqueues a report job", "Worker builds the file", "Stream progress with SSE", "Retries and idempotency"], "Requests return instantly and jobs survive a worker restart."),
  proj("Job queue platform", "A service that runs jobs over HTTP with a dashboard.", ["Worker pool", "Retries and dead letters", "Live progress", "Metrics"]));

  M("architecture", "System design and architecture", "backend", "Designing systems that scale, stay reliable and can be explained.", ["22-2", "22-3", "20-0", "20-1", "20-2", "20-3",
    ["Architecture styles", ["Monolith vs microservices", "Modular monolith", "Serverless", "Event-driven systems"]],
    ["Design patterns for backend code", ["Repository and service layers", "Dependency injection", "Strategy, adapter, factory", "Clean / hexagonal architecture"]]
  ], lab("Design three systems", ["Design a URL shortener with the six-step method", "Design a chat app", "Design a news feed", "Time each to 45 minutes"], "You follow a method and state trade-offs for every choice."),
  proj("Architecture portfolio", "Written designs for three classic systems.", ["Diagrams", "Capacity estimates", "Trade-offs", "Published repo"]));
})();
