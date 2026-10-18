/* Forge Academy role roadmaps: Role → Stages → Modules. Original content; roadmap.sh is linked only as an outside reference. */
window.ROLES2 = [
  { id: "frontend", title: "Frontend Developer", glyph: "FE", ref: "https://roadmap.sh/frontend",
    tagline: "Build the interfaces people see and use.", who: "You like visual work, user experience and seeing results instantly in the browser.",
    jobs: ["Frontend developer", "React developer", "UI engineer"], duration: "6-8 months at 10 hours a week",
    stages: [
      { t: "Foundations", goal: "How the web works and the tools you use daily.", mods: ["internet", "terminal", "git", "debugging"] },
      { t: "Core web", goal: "Structure, style and interactivity without frameworks.", mods: ["html", "css", "javascript", "dom"] },
      { t: "Modern tooling", goal: "Types and a professional toolchain.", mods: ["typescript", "fe-tooling"] },
      { t: "Frameworks", goal: "Component-based apps and a production framework.", mods: ["react", "styling", "nextjs"] },
      { t: "Professional quality", goal: "Fast, accessible, tested and secure interfaces.", mods: ["fe-quality", "http-apis", "deploy-fe"] },
      { t: "Get hired", goal: "Problem solving, portfolio and interviews.", mods: ["dsa", "career"] }
    ],
    big: { t: "Project management app", brief: "A Trello-style app with boards, lists and draggable cards shared between team members.", features: ["Auth and team boards", "Drag and drop with optimistic updates", "Real-time updates", "Tests, CI and Lighthouse 90+"] },
    capstone: { t: "Production SaaS frontend", brief: "The complete frontend of a real product idea in Next.js, with a design system, auth, payments in test mode, a dashboard and end-to-end tests.", features: ["Design system and dark mode", "Server and client rendering where each fits", "Accessibility and performance budgets in CI", "Case study and demo video"] },
    jobReady: ["Build any layout from a design without a framework", "Explain the event loop, closures and promises", "Build a React app with routing, data fetching and global state", "Meet WCAG AA and explain your choices", "Measure and fix Core Web Vitals", "Write component and end-to-end tests", "Explain XSS, CORS and where to store tokens", "Have 3 deployed projects with strong READMEs"],
    interview: ["What happens when you type a URL and press Enter?", "Explain closures with an example.", "How does React decide when to re-render?", "SSR vs SSG vs CSR: when would you use each?", "How would you make a slow page faster?", "Build a debounced search input."] },

  { id: "backend", title: "Backend Developer", glyph: "BE", ref: "https://roadmap.sh/backend",
    tagline: "Build the APIs, data and systems behind every product.", who: "You enjoy logic, data and making systems reliable and fast.",
    jobs: ["Backend developer", "Python / Node developer", "API engineer"], duration: "7-9 months at 10 hours a week",
    stages: [
      { t: "Foundations", goal: "How computers and the internet work, and your daily tools.", mods: ["internet", "cs-basics", "terminal", "git"] },
      { t: "A backend language", goal: "One language in depth, with problem solving.", mods: ["python", "debugging", "dsa"] },
      { t: "APIs and databases", goal: "Design and build real APIs backed by databases.", mods: ["http-apis", "fastapi", "sql", "orm", "nosql"] },
      { t: "Security and quality", goal: "Make it safe and prove it works.", mods: ["auth", "api-security", "testing"] },
      { t: "Production systems", goal: "Ship, scale and observe.", mods: ["docker", "cicd", "async-systems", "observability"] },
      { t: "Architecture and hiring", goal: "Think in systems and land the job.", mods: ["architecture", "node", "career"] }
    ],
    big: { t: "Job queue platform", brief: "A service that accepts jobs over HTTP, runs them on a worker pool and streams progress, with a dashboard.", features: ["Retries, idempotency and dead letters", "Workers in hardened containers", "Metrics and structured logs", "Load tested across three instances"] },
    capstone: { t: "Multi-tenant SaaS backend", brief: "The backend of a real B2B product: organisations, roles, billing in test mode, background jobs, audit logs and a public API.", features: ["Tenant isolation proven by tests", "Postgres, Redis and a queue", "CI/CD to the cloud with monitoring", "Architecture doc and API docs"] },
    jobReady: ["Design a REST API before writing code", "Write joins, aggregates and indexes by hand", "Implement auth with roles and per-record access, with tests", "Use caching and background jobs appropriately", "Ship with Docker and CI/CD", "Explain scaling, idempotency and timeouts", "Solve medium DSA problems", "Have a deployed backend with docs and tests"],
    interview: ["What happens when two users update the same row at once?", "How would you design a rate limiter?", "SQL vs NoSQL: how do you choose?", "Explain how token-based authentication works and its risks.", "How would you make this endpoint 10× faster?", "Design a URL shortener."] },

  { id: "fullstack", title: "Full Stack Developer", glyph: "FS", ref: "https://roadmap.sh/full-stack",
    tagline: "Build complete products, from the database to the button.", who: "You want to build whole products on your own or in a small team.",
    jobs: ["Full stack developer", "Software engineer", "Startup engineer"], duration: "9-11 months at 10 hours a week",
    stages: [
      { t: "Foundations", goal: "The web and your tools.", mods: ["internet", "terminal", "git", "debugging"] },
      { t: "Frontend", goal: "Interfaces from HTML to React.", mods: ["html", "css", "javascript", "dom", "typescript", "react"] },
      { t: "Backend", goal: "APIs and data with Node.js or Python.", mods: ["node", "http-apis", "sql", "orm"] },
      { t: "Security and testing", goal: "Real users, safely.", mods: ["auth", "api-security", "testing", "fe-quality"] },
      { t: "Ship and scale", goal: "Deploy, automate and add real-time features.", mods: ["nextjs", "docker", "cicd", "deploy-fe", "async-systems"] },
      { t: "Design and hiring", goal: "Systems thinking and getting hired.", mods: ["architecture", "dsa", "career"] }
    ],
    big: { t: "Marketplace app", brief: "A two-sided marketplace (for example tutors and students) with listings, search, booking and reviews.", features: ["Two user types and permissions", "Search with filters", "Booking workflow with notifications", "Tests, CI/CD and monitoring"] },
    capstone: { t: "Launch a real SaaS", brief: "Build and launch a small SaaS that solves a real problem for real users.", features: ["Landing page, auth and core feature", "Payments in test mode and admin dashboard", "At least five real users and their feedback", "Architecture doc, tests and CI/CD"] },
    jobReady: ["Build and connect a React frontend and a Node or Python backend", "Model and secure data per user", "Deploy a full stack app with CI/CD", "Add background jobs and real-time features", "Test both frontend and backend", "Explain system design trade-offs", "Show 2 complete products with live links"],
    interview: ["Walk me through a login from the browser to the database.", "How would you structure a full stack project?", "How do you handle state that lives on both client and server?", "How do you deploy and roll back safely?", "Design a simple e-commerce system."] },

  { id: "devops", title: "DevOps Engineer", glyph: "DO", ref: "https://roadmap.sh/devops",
    tagline: "Automate, deploy and keep systems running.", who: "You like automation, infrastructure and fixing things when they break.",
    jobs: ["DevOps engineer", "Cloud engineer", "Site reliability engineer"], duration: "7-9 months at 10 hours a week",
    stages: [
      { t: "Operating systems and networks", goal: "Linux, networking and scripting.", mods: ["terminal", "linux-admin", "networking", "bash", "git"] },
      { t: "A programming language", goal: "Automation in a real language.", mods: ["python", "http-apis"] },
      { t: "Containers", goal: "Package and run anything.", mods: ["docker", "kubernetes"] },
      { t: "CI/CD and cloud", goal: "Ship automatically to the cloud.", mods: ["cicd", "cloud-aws", "iac"] },
      { t: "Reliability and security", goal: "Observe, secure and respond.", mods: ["observability", "devsecops", "architecture"] },
      { t: "Get hired", goal: "Show your infrastructure work.", mods: ["career"] }
    ],
    big: { t: "Internal developer platform", brief: "A template that gives any app CI/CD, containers, infrastructure, monitoring and preview environments out of the box.", features: ["Reusable Terraform modules", "Pipeline templates", "Preview environments per pull request", "Dashboards and alerts by default"] },
    capstone: { t: "Production platform on Kubernetes", brief: "Run a multi-service app on managed Kubernetes with GitOps, autoscaling, secrets, observability, backups and a recovery drill.", features: ["Infrastructure fully in code", "GitOps deployments", "SLOs, alerts and runbooks", "Recorded recovery from a simulated outage"] },
    jobReady: ["Administer Linux servers and debug from logs", "Explain TCP/IP, DNS, TLS and load balancing", "Write production Dockerfiles and run Kubernetes workloads", "Build CI/CD pipelines with tests and security checks", "Provision cloud infrastructure with Terraform", "Set up monitoring, SLOs and alerts", "Run and document an incident"],
    interview: ["A website is down. Walk me through troubleshooting it.", "What happens during a Kubernetes rolling update?", "How do you manage secrets in CI/CD?", "Container vs virtual machine: what's the difference?", "How would you design a zero-downtime deployment?"] },

  { id: "devsecops", title: "DevSecOps Engineer", glyph: "DSO", ref: "https://roadmap.sh/devsecops",
    tagline: "Make software delivery fast and secure at the same time.", who: "You like both automation and security, and want to build safety into how software ships.",
    jobs: ["DevSecOps engineer", "Application security engineer", "Cloud security engineer"], duration: "8-10 months at 10 hours a week",
    stages: [
      { t: "Foundations", goal: "Linux, networking and code.", mods: ["terminal", "linux-admin", "networking", "git", "python"] },
      { t: "Security fundamentals", goal: "How systems are attacked and defended.", mods: ["sec-fundamentals", "crypto", "web-security", "api-security"] },
      { t: "Delivery platform", goal: "Containers, pipelines and cloud.", mods: ["docker", "cicd", "cloud-aws", "iac", "kubernetes"] },
      { t: "Security in the pipeline", goal: "Automated security at every stage.", mods: ["devsecops", "cloud-security"] },
      { t: "Detect and respond", goal: "Monitoring, response and compliance.", mods: ["observability", "soc", "incident-response", "grc"] },
      { t: "Get hired", goal: "Show your work.", mods: ["career"] }
    ],
    big: { t: "Secure delivery pipeline", brief: "A CI/CD pipeline with security gates at every stage for a real app.", features: ["SAST, SCA, DAST and IaC scans", "Signed images and SBOMs", "Secrets with short-lived credentials", "Security dashboard"] },
    capstone: { t: "Secure cloud platform", brief: "Design and run a cloud platform with security guardrails, automated scanning, detection and an incident drill.", features: ["Policy as code and guardrails", "Secure CI/CD", "Detections and alerting", "Incident drill and report"] },
    jobReady: ["Explain the OWASP Top 10 and fix issues in code", "Add SAST, SCA and container scanning to CI", "Manage secrets without long-lived keys", "Write policy as code", "Secure a Kubernetes cluster and cloud account", "Write detections and respond to incidents", "Map controls to a compliance framework"],
    interview: ["How would you add security to an existing CI/CD pipeline without slowing teams down?", "What is an SBOM and why does it matter?", "How do you manage secrets in Kubernetes?", "Explain shift-left security.", "How would you respond to a leaked cloud access key?"] },

  { id: "ai-engineer", title: "AI Engineer", glyph: "AI", ref: "https://roadmap.sh/ai-engineer",
    tagline: "Build products powered by large language models.", who: "You want to build assistants, agents and AI features that work in production.",
    jobs: ["AI engineer", "LLM application developer", "Applied AI engineer"], duration: "7-9 months at 10 hours a week",
    stages: [
      { t: "Foundations", goal: "Python and the tools around it.", mods: ["terminal", "git", "python", "debugging"] },
      { t: "Backend for AI", goal: "APIs that serve AI features.", mods: ["http-apis", "fastapi", "sql", "testing"] },
      { t: "LLM fundamentals", goal: "Call models reliably and get structured output.", mods: ["llm-apis", "prompting"] },
      { t: "Retrieval and tools", goal: "Ground answers in data and let models act.", mods: ["rag"] },
      { t: "Agents", goal: "Multi-step systems with people in the loop.", mods: ["agents"] },
      { t: "Production and hiring", goal: "Ship AI responsibly and get hired.", mods: ["docker", "cicd", "observability", "career"] }
    ],
    big: { t: "AI support assistant", brief: "An assistant for product docs that answers with citations, creates tickets through tools and hands off to a human.", features: ["Hybrid search over docs", "Tool calling with permissions", "Eval suite and dashboards", "Guardrails against prompt injection"] },
    capstone: { t: "AI app builder (like SaaSForge)", brief: "An agent that turns a plain-English brief into a validated spec, generates a working app, tests it in a sandbox and repairs itself on failure.", features: ["Clarifying questions and approval", "Deterministic generator from a validated spec", "Sandboxed verification and fix loop", "Architecture document and demo"] },
    jobReady: ["Call LLM APIs with retries and fallback", "Get validated structured output", "Build RAG with citations and refusals", "Implement tool calling with permission checks", "Design agents with budgets and approvals", "Evaluate changes with an eval suite", "Defend against prompt injection", "Ship with streaming, cost tracking and monitoring"],
    interview: ["How would you reduce hallucinations in a RAG system?", "When would you fine-tune instead of using RAG or prompting?", "How do you evaluate an LLM feature before and after a change?", "How would you design an agent that books meetings safely?", "How do you control cost and latency?", "What is prompt injection and how do you defend against it?"] },

  { id: "ai-data-scientist", title: "AI and Data Scientist", glyph: "DS", ref: "https://roadmap.sh/ai-data-scientist",
    tagline: "Find insight in data and build models that predict.", who: "You enjoy maths, experiments and explaining what data means.",
    jobs: ["Data scientist", "Applied scientist", "ML engineer (junior)"], duration: "9-11 months at 10 hours a week",
    stages: [
      { t: "Foundations", goal: "Python, maths and tools.", mods: ["python", "git", "ml-math", "statistics"] },
      { t: "Data handling", goal: "Get, clean and explore data.", mods: ["sql-analytics", "python-data", "data-viz"] },
      { t: "Machine learning", goal: "Train and evaluate models.", mods: ["ml-core"] },
      { t: "Deep learning and LLMs", goal: "Neural networks and language models.", mods: ["deep-learning", "llm-apis", "rag"] },
      { t: "Production", goal: "Models people can use.", mods: ["mlops", "fastapi", "docker"] },
      { t: "Get hired", goal: "Show your work.", mods: ["dsa", "career"] }
    ],
    big: { t: "Recommendation system", brief: "A product or content recommender with offline evaluation and a live API.", features: ["Collaborative and content-based approaches", "Offline metrics", "Serving API", "A/B test plan"] },
    capstone: { t: "End-to-end ML product", brief: "Frame a real problem, collect data, train and evaluate models, deploy with monitoring and wrap it in a small app.", features: ["Problem framing and baseline", "Reproducible training", "Deployed, monitored model", "Model card and write-up"] },
    jobReady: ["Explain core ML algorithms and when to use them", "Avoid leakage and pick the right metrics", "Run and interpret experiments", "Train and fine-tune neural networks", "Use LLMs and embeddings appropriately", "Deploy and monitor a model", "Communicate findings to non-technical people"],
    interview: ["Explain the bias-variance trade-off.", "How would you handle a highly imbalanced dataset?", "Precision or recall for fraud detection, and why?", "How would you detect a degrading model in production?", "Walk me through a project from problem to deployment."] },

  { id: "data-analyst", title: "Data Analyst", glyph: "DA", ref: "https://roadmap.sh/data-analyst",
    tagline: "Turn data into decisions.", who: "You like finding patterns, asking good questions and explaining results to people.",
    jobs: ["Data analyst", "Business analyst", "BI analyst"], duration: "5-7 months at 10 hours a week",
    stages: [
      { t: "Spreadsheets and statistics", goal: "The analyst's base toolkit.", mods: ["spreadsheets", "statistics"] },
      { t: "SQL", goal: "Query data directly.", mods: ["sql", "sql-analytics"] },
      { t: "Python for data", goal: "Reproducible analysis in code.", mods: ["python", "python-data", "git"] },
      { t: "Visualisation and BI", goal: "Make insights obvious.", mods: ["data-viz"] },
      { t: "Data at work", goal: "Warehouses and pipelines analysts use daily.", mods: ["data-modeling"] },
      { t: "Get hired", goal: "Show your analysis work.", mods: ["career"] }
    ],
    big: { t: "Customer analytics project", brief: "End-to-end analysis of customer behaviour: cleaning, SQL, cohorts, segmentation and a dashboard.", features: ["SQL + Python pipeline", "Retention and segments", "Interactive dashboard", "Recommendations deck"] },
    capstone: { t: "Business intelligence system", brief: "An automated reporting system for a fictional company with daily refresh, a clean model, a KPI dashboard and a monthly insights report.", features: ["Scheduled data refresh", "Clean data model", "KPI dashboard with definitions", "Monthly insights presentation"] },
    jobReady: ["Clean data and build pivots quickly", "Write SQL with joins, CTEs and window functions", "Analyse data in pandas reproducibly", "Build a BI dashboard", "Run and interpret an A/B test", "Present findings as recommendations", "Have 3 case studies with dashboards"],
    interview: ["Write a query for each customer's second purchase.", "How would you investigate a sudden drop in sales?", "Correlation vs causation: give an example.", "How do you handle missing data?", "Tell me about an insight that changed a decision."] },

  { id: "data-engineer", title: "Data Engineer", glyph: "DE", ref: "https://roadmap.sh/data-engineer",
    tagline: "Build the pipelines and platforms that data runs on.", who: "You like building reliable systems that move and shape large amounts of data.",
    jobs: ["Data engineer", "Analytics engineer", "Big data engineer"], duration: "8-10 months at 10 hours a week",
    stages: [
      { t: "Foundations", goal: "Linux, Git and a language.", mods: ["terminal", "git", "python", "cs-basics"] },
      { t: "Databases", goal: "SQL and data modelling in depth.", mods: ["sql", "sql-analytics", "nosql", "data-modeling"] },
      { t: "Pipelines", goal: "Batch pipelines, orchestration and quality.", mods: ["pipelines"] },
      { t: "Big data and streaming", goal: "Scale beyond one machine.", mods: ["big-data"] },
      { t: "Platform skills", goal: "Containers, cloud and infrastructure.", mods: ["docker", "cloud-aws", "iac", "cicd", "observability"] },
      { t: "Get hired", goal: "Show your work.", mods: ["dsa", "career"] }
    ],
    big: { t: "End-to-end ELT platform", brief: "Scheduled pipelines from several sources into a warehouse with tested models and a dashboard.", features: ["Orchestrated extraction", "dbt models and tests", "Data quality checks", "Dashboard"] },
    capstone: { t: "Real-time data platform", brief: "A platform combining batch and streaming data into a lakehouse, with orchestration, quality checks, infrastructure as code and monitoring.", features: ["Kafka streaming and batch Spark jobs", "Lakehouse tables", "Infrastructure in Terraform", "Monitoring and data quality alerts"] },
    jobReady: ["Model data for analytics (star schemas, SCDs)", "Write efficient SQL on large tables", "Build idempotent, scheduled pipelines", "Use dbt with tests and docs", "Process large data with Spark", "Stream data with Kafka", "Deploy data infrastructure with code"],
    interview: ["ETL vs ELT: when would you choose each?", "How do you make a pipeline idempotent?", "Explain partitioning and why it matters.", "How would you handle late-arriving data?", "Design a pipeline for clickstream analytics."] },

  { id: "ml-engineer", title: "Machine Learning / MLOps Engineer", glyph: "ML", ref: "https://roadmap.sh/mlops",
    tagline: "Take models from notebooks to reliable products.", who: "You like both machine learning and engineering, and want models that work in the real world.",
    jobs: ["Machine learning engineer", "MLOps engineer", "ML platform engineer"], duration: "9-11 months at 10 hours a week",
    stages: [
      { t: "Foundations", goal: "Python, Linux, Git and maths.", mods: ["python", "terminal", "git", "ml-math"] },
      { t: "Machine learning", goal: "Models and evaluation.", mods: ["statistics", "python-data", "ml-core", "deep-learning"] },
      { t: "Engineering", goal: "APIs, testing and data.", mods: ["fastapi", "sql", "testing", "pipelines"] },
      { t: "Infrastructure", goal: "Containers, cloud and orchestration.", mods: ["docker", "kubernetes", "cloud-aws", "cicd"] },
      { t: "MLOps", goal: "Serving, monitoring and LLM systems.", mods: ["mlops", "observability", "llm-apis", "rag"] },
      { t: "Get hired", goal: "Show your work.", mods: ["dsa", "career"] }
    ],
    big: { t: "Model serving platform", brief: "Serve several models behind one API with versioning, A/B routing and monitoring.", features: ["Model registry", "Versioned deployments", "A/B routing", "Latency and drift dashboards"] },
    capstone: { t: "Production ML system", brief: "A full ML system with data pipeline, training pipeline, serving on Kubernetes, monitoring and automated retraining.", features: ["Reproducible training pipeline", "Kubernetes serving with autoscaling", "Drift and performance monitoring", "Automated retraining with approval"] },
    jobReady: ["Train and evaluate models properly", "Track experiments and version data and models", "Serve models with low latency", "Build training and deployment pipelines", "Run ML on Kubernetes and the cloud", "Monitor drift and performance", "Serve and evaluate LLM features"],
    interview: ["How would you deploy a model that needs sub-100ms latency?", "How do you detect and handle data drift?", "Batch vs online inference: trade-offs?", "How do you make training reproducible?", "Design an ML platform for a team of ten data scientists."] },

  { id: "android", title: "Android Developer", glyph: "AN", ref: "https://roadmap.sh/android",
    tagline: "Build native apps for the world's most used mobile platform.", who: "You want to build apps people carry in their pockets, especially for the huge Android market in India.",
    jobs: ["Android developer", "Mobile engineer", "Kotlin developer"], duration: "6-8 months at 10 hours a week",
    stages: [
      { t: "Foundations", goal: "Tools and programming basics.", mods: ["git", "terminal", "debugging"] },
      { t: "Kotlin", goal: "The language of Android.", mods: ["kotlin"] },
      { t: "Android development", goal: "Native apps with Jetpack Compose.", mods: ["android"] },
      { t: "Backend connection", goal: "APIs, auth and data.", mods: ["http-apis", "auth", "sql"] },
      { t: "Cross-platform and quality", goal: "Know the alternatives and ship quality.", mods: ["react-native", "testing"] },
      { t: "Get hired", goal: "Show your apps.", mods: ["dsa", "career"] }
    ],
    big: { t: "Social fitness app", brief: "Track workouts, follow friends and get reminders, with an API backend.", features: ["Auth and profiles", "Feed and follow system", "Push notifications", "Offline logging"] },
    capstone: { t: "Published Android app", brief: "Design, build and publish a complete app that solves a real problem, with a backend, analytics and crash reporting.", features: ["Live on a Play Store track", "MVVM, Room and Retrofit", "Crash reporting and analytics", "Case study and demo video"] },
    jobReady: ["Write idiomatic Kotlin with coroutines", "Build Compose UIs with state", "Structure apps with MVVM and DI", "Use Room, Retrofit and WorkManager", "Test and profile apps", "Publish to Google Play", "Have 2 apps people can install"],
    interview: ["Explain the Activity lifecycle.", "How does recomposition work in Compose?", "How would you make an app work offline?", "What is a coroutine scope and why does it matter?", "How do you prevent memory leaks on Android?"] },

  { id: "ios", title: "iOS Developer", glyph: "iOS", ref: "https://roadmap.sh/ios",
    tagline: "Build polished native apps for iPhone and iPad.", who: "You care about design and detail and want to build for Apple's platforms.",
    jobs: ["iOS developer", "Mobile engineer", "Swift developer"], duration: "6-8 months at 10 hours a week",
    stages: [
      { t: "Foundations", goal: "Tools and programming basics.", mods: ["git", "terminal", "debugging"] },
      { t: "Swift", goal: "The language of Apple platforms.", mods: ["swift"] },
      { t: "iOS development", goal: "Native apps with SwiftUI.", mods: ["ios"] },
      { t: "Backend connection", goal: "APIs, auth and data.", mods: ["http-apis", "auth", "sql"] },
      { t: "Cross-platform and quality", goal: "Know the alternatives and ship quality.", mods: ["react-native", "testing"] },
      { t: "Get hired", goal: "Show your apps.", mods: ["dsa", "career"] }
    ],
    big: { t: "Habit and journaling app", brief: "A SwiftUI app with sync, widgets and reminders.", features: ["SwiftData persistence", "Cloud sync", "Widgets and notifications", "Tests"] },
    capstone: { t: "Published iOS app", brief: "Design, build and ship a complete app on TestFlight or the App Store.", features: ["SwiftUI and MVVM", "Networking and persistence", "Crash reporting", "Case study and demo video"] },
    jobReady: ["Write idiomatic Swift with async/await", "Build SwiftUI interfaces with correct state handling", "Structure apps with MVVM", "Persist data and call APIs", "Test with XCTest and profile with Instruments", "Ship through TestFlight", "Have 2 apps on TestFlight or the App Store"],
    interview: ["Struct vs class in Swift: when do you use each?", "How does state management work in SwiftUI?", "Explain optionals and safe unwrapping.", "How would you cache images in a list?", "What are actors and why do they exist?"] },

  { id: "cyber-security", title: "Cyber Security Analyst", glyph: "SEC", ref: "https://roadmap.sh/cyber-security",
    tagline: "Protect systems, detect threats and respond to incidents.", who: "You are curious about how systems fail and want to defend people and organisations.",
    jobs: ["SOC analyst", "Security analyst", "Security engineer (junior)"], duration: "8-10 months at 10 hours a week",
    stages: [
      { t: "IT foundations", goal: "How systems and networks work.", mods: ["internet", "networking", "terminal", "linux-admin", "cs-basics"] },
      { t: "Security fundamentals", goal: "Concepts, cryptography and scripting.", mods: ["sec-fundamentals", "crypto", "python", "bash"] },
      { t: "Application and network security", goal: "Where systems are weak and how to protect them.", mods: ["web-security", "network-security", "auth"] },
      { t: "Cloud and DevSecOps", goal: "Securing modern infrastructure.", mods: ["cloud-aws", "cloud-security", "devsecops"] },
      { t: "Detect and respond", goal: "Monitoring, response and governance.", mods: ["soc", "incident-response", "grc"] },
      { t: "Get hired", goal: "Certifications, portfolio and interviews.", mods: ["career"] }
    ],
    big: { t: "Security monitoring platform", brief: "Collect logs from several services, detect suspicious behaviour and show alerts on a dashboard.", features: ["Log pipeline and SIEM", "Custom detections with tests", "Automated response for one alert type", "Runbooks"] },
    capstone: { t: "Security programme for a startup", brief: "Design the security programme for a fictional startup: threat model, controls, cloud baseline, monitoring, incident playbooks and an executive summary.", features: ["Threat model and risk register", "Cloud security baseline", "Detections and playbooks", "Executive report"] },
    jobReady: ["Explain networking, Linux and Windows fundamentals", "Explain common attacks and their controls", "Find and fix OWASP Top 10 issues in code", "Write detections and triage alerts in a SIEM", "Follow an incident response process", "Secure a cloud account", "Have a home lab and public write-ups"],
    interview: ["Vulnerability vs threat vs risk: what's the difference?", "Walk me through a TLS handshake.", "How would you investigate repeated failed logins?", "Explain SQL injection and how to prevent it.", "What would you do in the first hour of a ransomware incident?"] },

  { id: "qa", title: "QA Engineer", glyph: "QA", ref: "https://roadmap.sh/qa",
    tagline: "Make sure software works before users find out it doesn't.", who: "You notice details, enjoy breaking things and want to own quality.",
    jobs: ["QA engineer", "SDET", "Test automation engineer"], duration: "5-7 months at 10 hours a week",
    stages: [
      { t: "Foundations", goal: "How software and the web work.", mods: ["internet", "git", "terminal"] },
      { t: "Testing fundamentals", goal: "How quality is planned and tested.", mods: ["qa-fundamentals"] },
      { t: "Programming for testers", goal: "Enough code to automate.", mods: ["javascript", "python", "html"] },
      { t: "Automation", goal: "UI, API and performance automation.", mods: ["test-automation", "testing", "http-apis"] },
      { t: "Quality in delivery", goal: "Testing in pipelines and production.", mods: ["cicd", "docker", "sql", "fe-quality"] },
      { t: "Get hired", goal: "Show your work.", mods: ["career"] }
    ],
    big: { t: "Automation framework", brief: "A reusable automation framework for a real web app: UI, API and load tests in CI.", features: ["Page objects and fixtures", "API and contract tests", "Load tests", "CI reports"] },
    capstone: { t: "Quality programme for an app", brief: "Own quality for an open-source or demo app: strategy, manual and automated tests, performance and accessibility checks and a release report.", features: ["Test strategy and plan", "Automated suites in CI", "Performance and accessibility audits", "Release quality report"] },
    jobReady: ["Design test cases with proven techniques", "Write clear bug reports", "Automate UI tests with Playwright or Selenium", "Test APIs and validate schemas", "Run load tests and read the results", "Run suites in CI with reports", "Explain a test strategy for a feature"],
    interview: ["How would you test a login page?", "Severity vs priority: give examples.", "How do you deal with flaky tests?", "What would you automate first, and why?", "How do you decide a release is ready?"] }
];
