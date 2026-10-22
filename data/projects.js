/* Forge Academy: project blueprints. Each maps a real project to the exact modules needed,
   in learning order, with a one-line reason per skill. Used to build a custom learning path. */
window.PROJECTS = [
  {
    id: "ai-docs-assistant", title: "AI assistant over your documents", glyph: "AI", level: 2,
    duration: "2-3 months", tags: ["ai", "chatbot", "rag", "python"],
    build: "A chat assistant that answers questions using your own documents (PDFs, help articles, notes) and cites its sources, so answers are grounded and trustworthy.",
    outcomes: ["Upload documents and ask questions in plain language", "Answers cite the source and say 'I don't know' when unsure", "A simple web chat UI with streaming replies", "An eval suite so you can trust changes"],
    mods: ["python", "git", "terminal", "http-apis", "fastapi", "sql", "llm-apis", "prompting", "rag", "testing", "docker", "deploy-fe"],
    why: {
      python: "The language you'll write the whole backend and AI logic in.",
      git: "Version your work and deploy from GitHub.",
      terminal: "Run your app, tools and the vector database from the command line.",
      "http-apis": "Your chat UI talks to your backend over an HTTP API.",
      fastapi: "Build the API that receives questions and streams answers.",
      sql: "Store documents, chunks and chat history; pgvector lives in Postgres.",
      "llm-apis": "Call a language model reliably, with retries and cost control.",
      prompting: "Write grounding prompts that force answers to come from your documents.",
      rag: "The core of the project: embeddings, chunking, retrieval and citations.",
      testing: "Evaluate answer quality so prompt changes don't quietly break it.",
      docker: "Package the app so it runs the same locally and in production.",
      "deploy-fe": "Put the chat interface online for people to use."
    },
    stretch: ["agents", "observability"]
  },
  {
    id: "ai-app-builder", title: "AI agent that builds apps from a brief", glyph: "AG", level: 3,
    duration: "4-6 months", tags: ["ai", "agents", "saas", "advanced"],
    build: "An agent (like SaaSForge) that turns a plain-English brief into a validated spec, generates a working app, tests it in a sandbox and repairs itself on failure.",
    outcomes: ["Asks clarifying questions, then plans before building", "Generates a real app from a validated spec", "Runs generated code safely in a sandbox", "Fixes its own failures in a loop"],
    mods: ["python", "git", "terminal", "debugging", "http-apis", "fastapi", "sql", "testing", "llm-apis", "prompting", "rag", "agents", "docker", "cicd", "observability"],
    why: {
      python: "The language for the agent, the generator and the runtime.",
      git: "Track a large, evolving codebase.",
      terminal: "Drive Docker, tests and the agent loop.",
      debugging: "Agents fail in subtle ways; you'll live in the debugger.",
      "http-apis": "Serve the agent and the apps it generates.",
      fastapi: "The web layer for the agent and generated apps.",
      sql: "Store jobs, plans and generated specs.",
      testing: "Verify generated apps automatically; it's how the agent knows it succeeded.",
      "llm-apis": "Call models with fallback and strict structured output.",
      prompting: "Get reliable JSON plans and avoid prompt injection.",
      rag: "Ground generation in examples and documentation.",
      agents: "The heart of the project: plan, act, verify, repair, with humans in the loop.",
      docker: "Run untrusted generated code in a hardened sandbox.",
      cicd: "Automate testing and deployment of the agent itself.",
      observability: "See what the agent did, what it cost and where it failed."
    },
    stretch: ["kubernetes", "api-security"]
  },
  {
    id: "support-chatbot", title: "Customer-support chatbot", glyph: "CB", level: 2,
    duration: "6-8 weeks", tags: ["ai", "chatbot", "llm"],
    build: "A chatbot for a business that answers common questions, escalates to a human when unsure, and can look up order status through tools.",
    outcomes: ["Answers FAQs from a knowledge base", "Calls tools to check real data (orders, bookings)", "Hands off to a human for anything risky", "Works on a website widget or WhatsApp"],
    mods: ["python", "git", "http-apis", "fastapi", "llm-apis", "prompting", "rag", "agents", "deploy-fe"],
    why: {
      python: "Backend and AI logic.",
      git: "Version and deploy.",
      "http-apis": "Connect the chat widget to your backend.",
      fastapi: "Serve the chat endpoint with streaming.",
      "llm-apis": "Reliable model calls with cost limits.",
      prompting: "Keep answers on-topic, safe and in the right tone.",
      rag: "Answer from the business's own knowledge base.",
      agents: "Tool calling for order lookups and safe human handoff.",
      "deploy-fe": "Ship the chat widget to a real website."
    },
    stretch: ["sql", "observability"]
  },
  {
    id: "churn-model", title: "Customer churn prediction model", glyph: "ML", level: 2,
    duration: "6-10 weeks", tags: ["ml", "data", "python"],
    build: "A model that predicts which customers are likely to leave, so a business can act early, served as an API and monitored in production.",
    outcomes: ["A trained, evaluated model with honest metrics", "Feature engineering from raw customer data", "A prediction API other systems can call", "Monitoring for data drift and performance"],
    mods: ["python", "git", "ml-math", "statistics", "sql", "python-data", "ml-core", "fastapi", "mlops"],
    why: {
      python: "The language of data science and ML.",
      git: "Track experiments and code.",
      "ml-math": "Understand what models do under the hood.",
      statistics: "Judge results honestly and avoid fooling yourself.",
      sql: "Pull and join the customer data you'll learn from.",
      "python-data": "Clean and explore data with pandas.",
      "ml-core": "Train, evaluate and tune the model properly, avoiding leakage.",
      fastapi: "Serve predictions as an API.",
      mlops: "Track experiments, deploy the model and monitor drift."
    },
    stretch: ["deep-learning", "docker"]
  },
  {
    id: "image-classifier", title: "Image classifier (plant disease, waste, etc.)", glyph: "IMG", level: 2,
    duration: "6-10 weeks", tags: ["ml", "deep-learning", "vision"],
    build: "A model that classifies images into categories (for example healthy vs diseased leaves) using transfer learning, wrapped in a simple app.",
    outcomes: ["Collect and label an image dataset", "Fine-tune a pretrained vision model", "Evaluate with a confusion matrix", "A small app or API that classifies new photos"],
    mods: ["python", "git", "ml-math", "python-data", "ml-core", "deep-learning", "fastapi", "mlops"],
    why: {
      python: "Everything is built in Python.",
      git: "Version code and track experiments.",
      "ml-math": "The linear algebra and calculus behind neural networks.",
      "python-data": "Load, augment and inspect image data.",
      "ml-core": "The ML workflow, splits and metrics.",
      "deep-learning": "Convolutional networks and transfer learning, the core skill here.",
      fastapi: "Serve the classifier so a phone or site can use it.",
      mlops: "Package, deploy and monitor the model."
    },
    stretch: ["docker", "deploy-fe"]
  },
  {
    id: "ecommerce", title: "Online store with cart, accounts and payments", glyph: "SH", level: 2,
    duration: "3-4 months", tags: ["fullstack", "web", "payments"],
    build: "A complete e-commerce site: browse products, add to cart, sign in, check out with test payments, and an admin area to manage orders.",
    outcomes: ["Product catalogue, cart and checkout", "User accounts with secure login", "Test-mode payments and order history", "Deployed, tested and responsive"],
    mods: ["html", "css", "javascript", "git", "typescript", "react", "nextjs", "http-apis", "node", "sql", "orm", "auth", "api-security", "testing", "deploy-fe"],
    why: {
      html: "Structure every page.",
      css: "Make it look good and work on phones.",
      javascript: "Interactivity in the browser.",
      git: "Version control and deployment.",
      typescript: "Catch bugs before users do, across a growing codebase.",
      react: "Build the UI from reusable components.",
      nextjs: "Routing, server rendering and a production framework.",
      "http-apis": "Design the API between frontend and backend.",
      node: "Build the backend that handles orders and payments.",
      sql: "Store products, carts, orders and users.",
      orm: "Query the database safely from your code.",
      auth: "Secure login, sessions and sign-in with Google.",
      "api-security": "Protect the API: authorisation, rate limits, no data leaks.",
      testing: "Automated tests so checkout never silently breaks.",
      "deploy-fe": "Put the store online."
    },
    stretch: ["docker", "cicd", "async-systems"]
  },
  {
    id: "saas-dashboard", title: "SaaS app with dashboard and subscriptions", glyph: "SA", level: 3,
    duration: "4-5 months", tags: ["fullstack", "saas", "web"],
    build: "A subscription software product: users sign up, pick a plan, use the app, and see a dashboard of their data, with teams and roles.",
    outcomes: ["Multi-tenant accounts with roles and teams", "Subscription billing in test mode", "A data dashboard with charts", "Secure, tested and deployed"],
    mods: ["html", "css", "javascript", "typescript", "git", "react", "nextjs", "styling", "http-apis", "node", "sql", "orm", "auth", "api-security", "testing", "docker", "cicd", "deploy-fe", "architecture"],
    why: {
      html: "Page structure.", css: "Styling and responsive layout.", javascript: "Browser interactivity.",
      typescript: "Type safety across a large app.", git: "Version control.",
      react: "Component-based UI.", nextjs: "Full-stack React framework.",
      styling: "A consistent design system and component library.",
      "http-apis": "Design clean APIs.", node: "The backend services.",
      sql: "Relational data for tenants, plans and usage.", orm: "Safe, typed data access.",
      auth: "Accounts, teams, roles and SSO.", "api-security": "Protect multi-tenant data.",
      testing: "Confidence to ship often.", docker: "Consistent environments.",
      cicd: "Automated testing and deploys.", "deploy-fe": "Go live.",
      architecture: "Structure a real product that can grow."
    },
    stretch: ["async-systems", "observability", "kubernetes"]
  },
  {
    id: "realtime-chat", title: "Real-time chat / collaboration app", glyph: "RT", level: 2,
    duration: "2-3 months", tags: ["fullstack", "realtime", "web"],
    build: "A chat or collaboration app where messages appear instantly, people see who's online, and history is saved, like a small Slack or Discord.",
    outcomes: ["Instant messaging with WebSockets", "Presence ('who's online') and typing indicators", "Saved history and multiple rooms", "Scales across more than one server"],
    mods: ["html", "css", "javascript", "typescript", "git", "react", "http-apis", "node", "sql", "auth", "async-systems", "deploy-fe"],
    why: {
      html: "Page structure.", css: "Layout and styling.", javascript: "Browser logic.",
      typescript: "Type safety.", git: "Version control.",
      react: "The chat interface.", "http-apis": "The non-realtime parts of the API.",
      node: "The server that relays messages.", sql: "Store users, rooms and message history.",
      auth: "Know who each user is.",
      "async-systems": "WebSockets, presence and scaling connections, the core challenge.",
      "deploy-fe": "Deploy the app."
    },
    stretch: ["docker", "observability"]
  },
  {
    id: "expense-splitter", title: "Expense-splitting app (like Splitwise)", glyph: "EX", level: 1,
    duration: "6-10 weeks", tags: ["fullstack", "web", "beginner"],
    build: "An app for groups to track shared expenses and settle up with the fewest payments, a great first full-stack project used by real people.",
    outcomes: ["Groups, expenses and uneven splits", "A 'settle up' algorithm", "Login and per-group access", "Deployed and usable on a phone"],
    mods: ["html", "css", "javascript", "git", "react", "http-apis", "node", "sql", "orm", "auth", "deploy-fe"],
    why: {
      html: "Structure the pages.", css: "Responsive, mobile-friendly design.",
      javascript: "Browser interactivity.", git: "Version and deploy.",
      react: "Build the UI.", "http-apis": "Frontend-backend communication.",
      node: "The backend.", sql: "Store groups, expenses and balances.",
      orm: "Query data safely.", auth: "Logins and group membership.",
      "deploy-fe": "Put it online for your friends to use."
    },
    stretch: ["testing", "fe-quality"]
  },
  {
    id: "portfolio-cms", title: "Blog or portfolio with a CMS", glyph: "BL", level: 1,
    duration: "4-6 weeks", tags: ["frontend", "web", "beginner"],
    build: "A fast, good-looking personal site or blog where you can add and edit content without touching code, and share your work.",
    outcomes: ["A polished, responsive site", "Write posts in a CMS or markdown", "Great performance and SEO", "Your own domain with HTTPS"],
    mods: ["html", "css", "javascript", "git", "typescript", "react", "nextjs", "fe-quality", "deploy-fe"],
    why: {
      html: "Semantic, accessible structure.", css: "Design and responsive layout.",
      javascript: "Interactivity.", git: "Version control.", typescript: "Type safety.",
      react: "Components.", nextjs: "Static generation, content fetching and SEO.",
      "fe-quality": "Accessibility, performance (Core Web Vitals) and testing.",
      "deploy-fe": "Custom domain, HTTPS and analytics."
    },
    stretch: ["styling"]
  },
  {
    id: "sales-dashboard", title: "Business intelligence dashboard", glyph: "BI", level: 1,
    duration: "6-10 weeks", tags: ["data", "analytics", "bi"],
    build: "A dashboard that turns a business's raw data (sales, orders, users) into clear charts and numbers that drive decisions, refreshed automatically.",
    outcomes: ["Clean and model messy source data", "Interactive dashboards with filters", "Key metrics leaders actually use", "Scheduled refresh and sharing"],
    mods: ["spreadsheets", "statistics", "sql", "sql-analytics", "python", "python-data", "git", "data-viz", "data-modeling"],
    why: {
      spreadsheets: "Where most business data starts; fast cleaning and pivots.",
      statistics: "Summarise data honestly and spot real patterns.",
      sql: "Query the data directly from the database.",
      "sql-analytics": "Funnels, cohorts and the analytics query patterns.",
      python: "Automate analysis beyond spreadsheets.",
      "python-data": "Clean and reshape data with pandas.",
      git: "Version your queries and notebooks.",
      "data-viz": "Build the dashboards in Power BI, Tableau or Looker, the core deliverable.",
      "data-modeling": "Structure data (star schemas) so dashboards are fast and correct."
    },
    stretch: ["pipelines"]
  },
  {
    id: "data-pipeline", title: "Automated data pipeline to a warehouse", glyph: "DP", level: 3,
    duration: "3-4 months", tags: ["data", "engineering", "pipeline"],
    build: "A pipeline that pulls data from sources (apps, APIs, files) on a schedule, cleans and transforms it, and loads it into a warehouse for analysis.",
    outcomes: ["Scheduled, reliable extract-load jobs", "Transformations with dbt and data tests", "A warehouse ready for BI and ML", "Monitoring and data-quality checks"],
    mods: ["python", "git", "terminal", "sql", "sql-analytics", "data-modeling", "pipelines", "big-data", "docker", "cloud-aws"],
    why: {
      python: "Write extractors and glue code.", git: "Version pipeline code.",
      terminal: "Run and schedule jobs.", sql: "The language of the warehouse.",
      "sql-analytics": "Transform data into analytics-ready tables.",
      "data-modeling": "Warehouse design, dimensional models and cloud warehouses.",
      pipelines: "ETL/ELT, orchestration with Airflow, dbt and data quality, the core skill.",
      "big-data": "Handle large volumes with Spark and streaming when needed.",
      docker: "Package pipeline components consistently.",
      "cloud-aws": "Run storage, compute and the warehouse in the cloud."
    },
    stretch: ["iac", "observability"]
  },
  {
    id: "scraper-analysis", title: "Web scraper + data analysis", glyph: "SC", level: 1,
    duration: "4-8 weeks", tags: ["data", "python", "beginner"],
    build: "Collect data from the web or APIs, clean it, analyse it for insights, and present the findings, a complete data project end to end.",
    outcomes: ["Collect data responsibly from sites or APIs", "Clean and explore it in Python", "Find and visualise real insights", "Share a clear, reproducible analysis"],
    mods: ["python", "git", "python-data", "statistics", "sql", "data-viz"],
    why: {
      python: "Write the scraper and analysis.",
      git: "Version and share your work.",
      "python-data": "Clean, reshape and explore data with pandas; read real-world sources.",
      statistics: "Draw honest conclusions and avoid misreading noise.",
      sql: "Store and query the data you collect.",
      "data-viz": "Turn findings into clear charts and a shareable dashboard."
    },
    stretch: ["sql-analytics"]
  },
  {
    id: "deploy-scale", title: "Deploy and scale an app in the cloud", glyph: "CL", level: 2,
    duration: "2-3 months", tags: ["devops", "cloud", "infra"],
    build: "Take an existing app and run it in production the right way: containerised, automatically deployed, scalable, monitored and secure.",
    outcomes: ["Containerise and run the app anywhere", "Automatic deploys on every push", "Scale across servers with Kubernetes", "Monitoring, alerts and a secure cloud setup"],
    mods: ["terminal", "linux-admin", "git", "bash", "docker", "cicd", "cloud-aws", "iac", "kubernetes", "observability"],
    why: {
      terminal: "Everything in ops runs from the command line.",
      "linux-admin": "Servers run Linux; you'll manage them.",
      git: "Infrastructure and app code both live in Git.",
      bash: "Automate repetitive operational tasks.",
      docker: "Containerise the app for consistent deployment.",
      cicd: "Automate build, test and deploy pipelines.",
      "cloud-aws": "Run compute, storage, networking and databases in the cloud.",
      iac: "Define infrastructure as code with Terraform, so it's repeatable.",
      kubernetes: "Orchestrate and scale containers, the central DevOps skill.",
      observability: "Metrics, logs, traces and alerting so you know it's healthy."
    },
    stretch: ["cloud-security", "devsecops"]
  },
  {
    id: "cicd-pipeline", title: "Full CI/CD pipeline for a team", glyph: "CI", level: 2,
    duration: "6-10 weeks", tags: ["devops", "cicd", "automation"],
    build: "A pipeline that lints, tests, builds, scans and deploys an application automatically on every change, with safe rollouts and rollbacks.",
    outcomes: ["Tests and checks run on every pull request", "One-command, zero-downtime deploys", "Staging then production with approvals", "Rollbacks and deployment strategies"],
    mods: ["terminal", "git", "bash", "docker", "testing", "cicd", "cloud-aws", "observability"],
    why: {
      terminal: "Run and debug pipeline steps.", git: "Pipelines trigger on Git events.",
      bash: "Write reliable pipeline scripts.", docker: "Build the artifacts you deploy.",
      testing: "The tests the pipeline runs as quality gates.",
      cicd: "Pipeline design, deployment strategies and GitOps, the core topic.",
      "cloud-aws": "Deploy targets and secrets.", observability: "Verify deploys and catch regressions."
    },
    stretch: ["kubernetes", "iac", "devsecops"]
  },
  {
    id: "security-assessment", title: "Security assessment of a web app", glyph: "SE", level: 2,
    duration: "2-3 months", tags: ["security", "appsec", "web"],
    build: "Assess the security of a web application you're allowed to test: find vulnerabilities, write clear findings, and recommend fixes, like a junior security engineer.",
    outcomes: ["Map an app's attack surface safely", "Find and verify real vulnerabilities", "Write professional findings with fixes", "A full assessment report"],
    mods: ["internet", "networking", "terminal", "linux-admin", "sec-fundamentals", "crypto", "web-security", "auth", "api-security"],
    why: {
      internet: "Understand how the web actually works before attacking it.",
      networking: "Protocols, ports and traffic underpin everything.",
      terminal: "Security tooling is command-line.",
      "linux-admin": "Most servers and tools are Linux.",
      "sec-fundamentals": "Threats, risk, frameworks and threat modelling.",
      crypto: "Understand TLS, hashing and certificates to judge their use.",
      "web-security": "The OWASP risks, finding them and fixing them, the core skill.",
      auth: "Authentication and session flaws are where many bugs live.",
      "api-security": "APIs have their own OWASP Top 10 to assess."
    },
    stretch: ["network-security", "cloud-security"]
  },
  {
    id: "home-soc", title: "Home SOC / threat detection lab", glyph: "SOC", level: 2,
    duration: "2-4 months", tags: ["security", "soc", "detection"],
    build: "Build a small security operations lab that collects logs, detects attacks and lets you practise triage and incident response, a strong portfolio piece for analyst roles.",
    outcomes: ["Collect logs from machines into a SIEM", "Write detections mapped to MITRE ATT&CK", "Triage alerts and reduce false positives", "Handle a simulated incident end to end"],
    mods: ["internet", "networking", "terminal", "linux-admin", "python", "bash", "sec-fundamentals", "network-security", "soc", "incident-response"],
    why: {
      internet: "Know what normal web traffic looks like.",
      networking: "Read and understand network activity.",
      terminal: "Run the lab and tools.", "linux-admin": "Set up and manage the lab machines.",
      python: "Automate enrichment and parsing.", bash: "Glue tools together.",
      "sec-fundamentals": "Attacker behaviour, the kill chain and ATT&CK.",
      "network-security": "Scanning, traffic analysis and defensive tooling.",
      soc: "SIEM, writing detections and alert triage, the core of the project.",
      "incident-response": "Respond to and document incidents properly."
    },
    stretch: ["crypto", "cloud-security", "grc"]
  },
  {
    id: "secure-api", title: "Build a hardened, secure API", glyph: "API", level: 2,
    duration: "2-3 months", tags: ["backend", "security", "api"],
    build: "A production-grade API built with security first: proper authentication, authorisation, input validation, rate limiting, secrets management and testing.",
    outcomes: ["A clean REST API with real auth", "Protection against the OWASP API risks", "Secrets managed properly, nothing leaked", "Security tests in the pipeline"],
    mods: ["python", "git", "http-apis", "fastapi", "sql", "orm", "auth", "api-security", "testing", "crypto", "devsecops"],
    why: {
      python: "Build the API.", git: "Version control.",
      "http-apis": "Design clean, correct endpoints.", fastapi: "Implement the API.",
      sql: "Store data safely.", orm: "Query without SQL injection.",
      auth: "Sessions, OAuth, MFA and account security.",
      "api-security": "The OWASP API Top 10 and how to defend against each.",
      testing: "Automated tests including security cases.",
      crypto: "Encrypt data correctly and understand TLS.",
      devsecops: "Scanning, secrets management and security in the pipeline."
    },
    stretch: ["docker", "cicd", "observability"]
  },
  {
    id: "mobile-backend", title: "Backend + API for a mobile or web app", glyph: "BE", level: 2,
    duration: "2-3 months", tags: ["backend", "api"],
    build: "The server side of an app: a well-designed API, a database, authentication and the background jobs real apps need, ready for any frontend to use.",
    outcomes: ["A documented REST API", "Secure login and user data", "Background jobs (emails, processing)", "Tested, containerised and deployed"],
    mods: ["python", "git", "terminal", "http-apis", "fastapi", "sql", "orm", "auth", "api-security", "testing", "async-systems", "docker"],
    why: {
      python: "Build the backend.", git: "Version control.", terminal: "Run and manage it.",
      "http-apis": "Design the API contract.", fastapi: "Implement the endpoints.",
      sql: "Model and store the data.", orm: "Safe data access.",
      auth: "User accounts and sessions.", "api-security": "Protect the API.",
      testing: "Confidence to change things.",
      "async-systems": "Queues and background jobs for slow work.",
      docker: "Package for deployment."
    },
    stretch: ["cicd", "observability", "architecture"]
  },
  {
    id: "recommendation", title: "Recommendation system", glyph: "RE", level: 3,
    duration: "3-4 months", tags: ["ml", "data", "advanced"],
    build: "A system that recommends products, content or connections, trained offline, evaluated honestly, and served through a live API.",
    outcomes: ["Collaborative and content-based approaches", "Offline evaluation metrics", "A serving API with low latency", "A plan to A/B test it live"],
    mods: ["python", "git", "ml-math", "statistics", "sql", "python-data", "ml-core", "fastapi", "mlops", "async-systems"],
    why: {
      python: "The language for the whole system.", git: "Track experiments and code.",
      "ml-math": "Vectors and similarity underpin recommendations.",
      statistics: "Evaluate recommendations without fooling yourself.",
      sql: "Pull interaction data.", "python-data": "Build features from behaviour.",
      "ml-core": "Model training, evaluation and avoiding leakage.",
      fastapi: "Serve recommendations fast.", mlops: "Deploy and monitor the model.",
      "async-systems": "Precompute and cache recommendations at scale."
    },
    stretch: ["deep-learning", "big-data"]
  },
  {
    id: "ab-analysis", title: "A/B test and experiment analysis", glyph: "AB", level: 1,
    duration: "4-6 weeks", tags: ["data", "statistics", "beginner"],
    build: "Design and analyse experiments properly: decide whether a change really worked, report the effect size and confidence, and avoid common statistical traps.",
    outcomes: ["Design a sound experiment", "Analyse results with the right tests", "Report effect sizes and confidence intervals", "Communicate findings to non-technical people"],
    mods: ["spreadsheets", "statistics", "sql", "sql-analytics", "python", "python-data", "data-viz"],
    why: {
      spreadsheets: "Quick exploration and sharing.",
      statistics: "Hypothesis tests, confidence intervals and avoiding traps, the core skill.",
      sql: "Pull experiment data from the database.",
      "sql-analytics": "Build funnels and cohorts for the analysis.",
      python: "Run the statistical analysis.",
      "python-data": "Clean and reshape the experiment data.",
      "data-viz": "Present results clearly to decision-makers."
    },
    stretch: ["ml-core"]
  },
  {
    id: "monitoring-stack", title: "Monitoring and observability for a system", glyph: "OB", level: 2,
    duration: "6-10 weeks", tags: ["devops", "sre", "observability"],
    build: "Instrument an application and its infrastructure so you can see its health, get alerted before users do, and debug issues fast, the SRE foundation.",
    outcomes: ["Metrics dashboards (RED/USE)", "Centralised logs and distributed tracing", "Alerts on what users actually feel", "SLOs and error budgets"],
    mods: ["terminal", "linux-admin", "git", "docker", "cloud-aws", "observability"],
    why: {
      terminal: "Operate and inspect systems.", "linux-admin": "Understand the hosts you monitor.",
      git: "Version dashboards and alert rules as code.", docker: "Run the monitoring stack.",
      "cloud-aws": "Monitor cloud resources and costs.",
      observability: "Metrics, logs, traces, alerting and SRE practices, the whole project."
    },
    stretch: ["kubernetes", "cicd"]
  },
  {
    id: "booking-app", title: "Booking / appointment system", glyph: "BK", level: 2,
    duration: "2-3 months", tags: ["fullstack", "web"],
    build: "An app where customers book time slots (a salon, clinic or tutor), with availability, reminders and an owner dashboard.",
    outcomes: ["Calendar availability and booking", "Accounts for customers and the owner", "Email or SMS reminders", "A simple owner dashboard"],
    mods: ["html", "css", "javascript", "git", "react", "http-apis", "node", "sql", "orm", "auth", "async-systems", "deploy-fe"],
    why: {
      html: "Page structure.", css: "Responsive design.", javascript: "Interactivity.",
      git: "Version control.", react: "Build the booking UI.",
      "http-apis": "Frontend-backend API.", node: "Backend logic.",
      sql: "Store slots, bookings and users.", orm: "Safe data access.",
      auth: "Customer and owner accounts.",
      "async-systems": "Background jobs for reminders.", "deploy-fe": "Launch it."
    },
    stretch: ["testing", "docker"]
  },
  {
    id: "custom", title: "Something else", glyph: "+", level: 0,
    duration: "", tags: [],
    build: "Describe your own project and the platform will work out the skills you need and build you a custom learning path from the modules.",
    outcomes: [], mods: [], why: {}, stretch: []
  }
];
