/* Forge Academy role roadmaps: the 6 most in-demand tech roles of 2026 (Role → Stages → Modules).
   Original content; roadmap.sh is linked only as an outside reference. */
window.ROLES2 = [
 {
  "id": "ai-engineer",
  "title": "AI / ML Engineer",
  "glyph": "AI",
  "ref": "https://roadmap.sh/ai-engineer",
  "tagline": "Build machine learning models and LLM-powered products, and run them in production.",
  "who": "You like maths and code, and want to build the AI features companies are hiring hardest for in 2026.",
  "jobs": [
   "AI engineer",
   "Machine learning engineer",
   "LLM application developer",
   "MLOps engineer"
  ],
  "duration": "9-12 months at 10 hours a week",
  "stages": [
   {
    "t": "Foundations",
    "goal": "Python and the developer toolkit.",
    "mods": [
     "terminal",
     "git",
     "python",
     "debugging"
    ]
   },
   {
    "t": "Maths and data",
    "goal": "The maths behind models and the data skills to feed them.",
    "mods": [
     "ml-math",
     "statistics",
     "sql",
     "python-data"
    ]
   },
   {
    "t": "Machine learning",
    "goal": "Train, evaluate and improve models properly.",
    "mods": [
     "ml-core",
     "deep-learning"
    ]
   },
   {
    "t": "LLM engineering",
    "goal": "Build reliable products on large language models.",
    "mods": [
     "llm-apis",
     "prompting",
     "rag",
     "agents"
    ]
   },
   {
    "t": "Production",
    "goal": "Serve, monitor and automate models and AI features.",
    "mods": [
     "fastapi",
     "testing",
     "docker",
     "mlops",
     "observability"
    ]
   },
   {
    "t": "Get hired",
    "goal": "Problem solving, portfolio and interviews.",
    "mods": [
     "dsa",
     "career"
    ]
   }
  ],
  "big": {
   "t": "AI support assistant",
   "brief": "An assistant for product docs that answers with citations, creates tickets through tools and hands off to a human.",
   "features": [
    "Hybrid search over docs",
    "Tool calling with permissions",
    "Eval suite and dashboards",
    "Guardrails against prompt injection"
   ]
  },
  "capstone": {
   "t": "AI app builder (like SaaSForge)",
   "brief": "An agent that turns a plain-English brief into a validated spec, generates a working app, tests it in a sandbox and repairs itself on failure.",
   "features": [
    "Clarifying questions and approval",
    "Deterministic generator from a validated spec",
    "Sandboxed verification and fix loop",
    "Architecture document and demo"
   ]
  },
  "jobReady": [
   "Train and evaluate models properly",
   "Track experiments and version data and models",
   "Call LLM APIs with retries and fallback",
   "Get validated structured output",
   "Build RAG with citations and refusals",
   "Implement tool calling with permission checks",
   "Design agents with budgets and approvals",
   "Evaluate changes with an eval suite",
   "Defend against prompt injection",
   "Ship with streaming, cost tracking and monitoring",
   "Serve models with low latency",
   "Monitor drift and performance"
  ],
  "interview": [
   "How would you deploy a model that needs sub-100ms latency?",
   "How do you detect and handle data drift?",
   "Batch vs online inference: trade-offs?",
   "How would you reduce hallucinations in a RAG system?",
   "When would you fine-tune instead of using RAG or prompting?",
   "How do you evaluate an LLM feature before and after a change?",
   "How would you design an agent that books meetings safely?",
   "How do you control cost and latency?",
   "What is prompt injection and how do you defend against it?"
  ]
 },
 {
  "id": "cyber-security",
  "title": "Cyber Security Analyst",
  "glyph": "SEC",
  "ref": "https://roadmap.sh/cyber-security",
  "tagline": "Protect systems, detect threats and respond to incidents.",
  "who": "You are curious about how systems fail and want to defend people and organisations.",
  "jobs": [
   "SOC analyst",
   "Security analyst",
   "Security engineer (junior)"
  ],
  "duration": "8-10 months at 10 hours a week",
  "stages": [
   {
    "t": "IT foundations",
    "goal": "How systems and networks work.",
    "mods": [
     "internet",
     "networking",
     "terminal",
     "linux-admin",
     "cs-basics"
    ]
   },
   {
    "t": "Security fundamentals",
    "goal": "Concepts, cryptography and scripting.",
    "mods": [
     "sec-fundamentals",
     "crypto",
     "python",
     "bash"
    ]
   },
   {
    "t": "Application and network security",
    "goal": "Where systems are weak and how to protect them.",
    "mods": [
     "web-security",
     "network-security",
     "auth"
    ]
   },
   {
    "t": "Cloud and DevSecOps",
    "goal": "Securing modern infrastructure.",
    "mods": [
     "cloud-aws",
     "cloud-security",
     "devsecops"
    ]
   },
   {
    "t": "Detect and respond",
    "goal": "Monitoring, response and governance.",
    "mods": [
     "soc",
     "incident-response",
     "grc"
    ]
   },
   {
    "t": "Get hired",
    "goal": "Certifications, portfolio and interviews.",
    "mods": [
     "career"
    ]
   }
  ],
  "big": {
   "t": "Security monitoring platform",
   "brief": "Collect logs from several services, detect suspicious behaviour and show alerts on a dashboard.",
   "features": [
    "Log pipeline and SIEM",
    "Custom detections with tests",
    "Automated response for one alert type",
    "Runbooks"
   ]
  },
  "capstone": {
   "t": "Security programme for a startup",
   "brief": "Design the security programme for a fictional startup: threat model, controls, cloud baseline, monitoring, incident playbooks and an executive summary.",
   "features": [
    "Threat model and risk register",
    "Cloud security baseline",
    "Detections and playbooks",
    "Executive report"
   ]
  },
  "jobReady": [
   "Explain networking, Linux and Windows fundamentals",
   "Explain common attacks and their controls",
   "Find and fix OWASP Top 10 issues in code",
   "Write detections and triage alerts in a SIEM",
   "Follow an incident response process",
   "Secure a cloud account",
   "Have a home lab and public write-ups"
  ],
  "interview": [
   "Vulnerability vs threat vs risk: what's the difference?",
   "Walk me through a TLS handshake.",
   "How would you investigate repeated failed logins?",
   "Explain SQL injection and how to prevent it.",
   "What would you do in the first hour of a ransomware incident?"
  ]
 },
 {
  "id": "devops",
  "title": "Cloud & DevOps Engineer",
  "glyph": "CD",
  "ref": "https://roadmap.sh/devops",
  "tagline": "Run applications on the cloud: automated, secure and reliable.",
  "who": "You like automation, infrastructure and fixing things when they break.",
  "jobs": [
   "Cloud engineer",
   "DevOps engineer",
   "Site reliability engineer",
   "Platform engineer"
  ],
  "duration": "7-9 months at 10 hours a week",
  "stages": [
   {
    "t": "Operating systems and networks",
    "goal": "Linux, networking and scripting.",
    "mods": [
     "terminal",
     "linux-admin",
     "networking",
     "bash",
     "git"
    ]
   },
   {
    "t": "A programming language",
    "goal": "Automation in a real language.",
    "mods": [
     "python",
     "http-apis"
    ]
   },
   {
    "t": "Containers",
    "goal": "Package and run anything.",
    "mods": [
     "docker",
     "kubernetes"
    ]
   },
   {
    "t": "CI/CD and cloud",
    "goal": "Ship automatically to the cloud.",
    "mods": [
     "cicd",
     "cloud-aws",
     "iac"
    ]
   },
   {
    "t": "Reliability and security",
    "goal": "Observe, secure and respond.",
    "mods": [
     "observability",
     "devsecops",
     "architecture",
     "cloud-security"
    ]
   },
   {
    "t": "Get hired",
    "goal": "Show your infrastructure work.",
    "mods": [
     "career"
    ]
   }
  ],
  "big": {
   "t": "Internal developer platform",
   "brief": "A template that gives any app CI/CD, containers, infrastructure, monitoring and preview environments out of the box.",
   "features": [
    "Reusable Terraform modules",
    "Pipeline templates",
    "Preview environments per pull request",
    "Dashboards and alerts by default"
   ]
  },
  "capstone": {
   "t": "Production platform on Kubernetes",
   "brief": "Run a multi-service app on managed Kubernetes with GitOps, autoscaling, secrets, observability, backups and a recovery drill.",
   "features": [
    "Infrastructure fully in code",
    "GitOps deployments",
    "SLOs, alerts and runbooks",
    "Recorded recovery from a simulated outage"
   ]
  },
  "jobReady": [
   "Administer Linux servers and debug from logs",
   "Explain TCP/IP, DNS, TLS and load balancing",
   "Write production Dockerfiles and run Kubernetes workloads",
   "Build CI/CD pipelines with tests and security checks",
   "Provision cloud infrastructure with Terraform",
   "Set up monitoring, SLOs and alerts",
   "Run and document an incident"
  ],
  "interview": [
   "A website is down. Walk me through troubleshooting it.",
   "What happens during a Kubernetes rolling update?",
   "How do you manage secrets in CI/CD?",
   "Container vs virtual machine: what's the difference?",
   "How would you design a zero-downtime deployment?"
  ]
 },
 {
  "id": "data-engineer",
  "title": "Data Engineer",
  "glyph": "DE",
  "ref": "https://roadmap.sh/data-engineer",
  "tagline": "Build the pipelines and platforms that data runs on.",
  "who": "You like building reliable systems that move and shape large amounts of data.",
  "jobs": [
   "Data engineer",
   "Analytics engineer",
   "Big data engineer"
  ],
  "duration": "8-10 months at 10 hours a week",
  "stages": [
   {
    "t": "Foundations",
    "goal": "Linux, Git and a language.",
    "mods": [
     "terminal",
     "git",
     "python",
     "cs-basics"
    ]
   },
   {
    "t": "Databases",
    "goal": "SQL and data modelling in depth.",
    "mods": [
     "sql",
     "sql-analytics",
     "nosql",
     "data-modeling"
    ]
   },
   {
    "t": "Pipelines",
    "goal": "Batch pipelines, orchestration and quality.",
    "mods": [
     "pipelines"
    ]
   },
   {
    "t": "Big data and streaming",
    "goal": "Scale beyond one machine.",
    "mods": [
     "big-data"
    ]
   },
   {
    "t": "Platform skills",
    "goal": "Containers, cloud and infrastructure.",
    "mods": [
     "docker",
     "cloud-aws",
     "iac",
     "cicd",
     "observability"
    ]
   },
   {
    "t": "Get hired",
    "goal": "Show your work.",
    "mods": [
     "dsa",
     "career"
    ]
   }
  ],
  "big": {
   "t": "End-to-end ELT platform",
   "brief": "Scheduled pipelines from several sources into a warehouse with tested models and a dashboard.",
   "features": [
    "Orchestrated extraction",
    "dbt models and tests",
    "Data quality checks",
    "Dashboard"
   ]
  },
  "capstone": {
   "t": "Real-time data platform",
   "brief": "A platform combining batch and streaming data into a lakehouse, with orchestration, quality checks, infrastructure as code and monitoring.",
   "features": [
    "Kafka streaming and batch Spark jobs",
    "Lakehouse tables",
    "Infrastructure in Terraform",
    "Monitoring and data quality alerts"
   ]
  },
  "jobReady": [
   "Model data for analytics (star schemas, SCDs)",
   "Write efficient SQL on large tables",
   "Build idempotent, scheduled pipelines",
   "Use dbt with tests and docs",
   "Process large data with Spark",
   "Stream data with Kafka",
   "Deploy data infrastructure with code"
  ],
  "interview": [
   "ETL vs ELT: when would you choose each?",
   "How do you make a pipeline idempotent?",
   "Explain partitioning and why it matters.",
   "How would you handle late-arriving data?",
   "Design a pipeline for clickstream analytics."
  ]
 },
 {
  "id": "data-analyst",
  "title": "Data Analyst",
  "glyph": "DA",
  "ref": "https://roadmap.sh/data-analyst",
  "tagline": "Turn data into decisions.",
  "who": "You like finding patterns, asking good questions and explaining results to people.",
  "jobs": [
   "Data analyst",
   "Business analyst",
   "BI analyst"
  ],
  "duration": "5-7 months at 10 hours a week",
  "stages": [
   {
    "t": "Spreadsheets and statistics",
    "goal": "The analyst's base toolkit.",
    "mods": [
     "spreadsheets",
     "statistics"
    ]
   },
   {
    "t": "SQL",
    "goal": "Query data directly.",
    "mods": [
     "sql",
     "sql-analytics"
    ]
   },
   {
    "t": "Python for data",
    "goal": "Reproducible analysis in code.",
    "mods": [
     "python",
     "python-data",
     "git"
    ]
   },
   {
    "t": "Visualisation and BI",
    "goal": "Make insights obvious.",
    "mods": [
     "data-viz"
    ]
   },
   {
    "t": "Data at work",
    "goal": "Warehouses and pipelines analysts use daily.",
    "mods": [
     "data-modeling"
    ]
   },
   {
    "t": "Get hired",
    "goal": "Show your analysis work.",
    "mods": [
     "career"
    ]
   }
  ],
  "big": {
   "t": "Customer analytics project",
   "brief": "End-to-end analysis of customer behaviour: cleaning, SQL, cohorts, segmentation and a dashboard.",
   "features": [
    "SQL + Python pipeline",
    "Retention and segments",
    "Interactive dashboard",
    "Recommendations deck"
   ]
  },
  "capstone": {
   "t": "Business intelligence system",
   "brief": "An automated reporting system for a fictional company with daily refresh, a clean model, a KPI dashboard and a monthly insights report.",
   "features": [
    "Scheduled data refresh",
    "Clean data model",
    "KPI dashboard with definitions",
    "Monthly insights presentation"
   ]
  },
  "jobReady": [
   "Clean data and build pivots quickly",
   "Write SQL with joins, CTEs and window functions",
   "Analyse data in pandas reproducibly",
   "Build a BI dashboard",
   "Run and interpret an A/B test",
   "Present findings as recommendations",
   "Have 3 case studies with dashboards"
  ],
  "interview": [
   "Write a query for each customer's second purchase.",
   "How would you investigate a sudden drop in sales?",
   "Correlation vs causation: give an example.",
   "How do you handle missing data?",
   "Tell me about an insight that changed a decision."
  ]
 },
 {
  "id": "fullstack",
  "title": "Full Stack Developer",
  "glyph": "FS",
  "ref": "https://roadmap.sh/full-stack",
  "tagline": "Build complete products, from the database to the button.",
  "who": "You want to build whole products on your own or in a small team.",
  "jobs": [
   "Full stack developer",
   "Software engineer",
   "Startup engineer"
  ],
  "duration": "9-11 months at 10 hours a week",
  "stages": [
   {
    "t": "Foundations",
    "goal": "The web and your tools.",
    "mods": [
     "internet",
     "terminal",
     "git",
     "debugging"
    ]
   },
   {
    "t": "Frontend",
    "goal": "Interfaces from HTML to React.",
    "mods": [
     "html",
     "css",
     "javascript",
     "dom",
     "typescript",
     "react"
    ]
   },
   {
    "t": "Backend",
    "goal": "APIs and data with Node.js or Python.",
    "mods": [
     "node",
     "http-apis",
     "sql",
     "orm"
    ]
   },
   {
    "t": "Security and testing",
    "goal": "Real users, safely.",
    "mods": [
     "auth",
     "api-security",
     "testing",
     "fe-quality"
    ]
   },
   {
    "t": "Ship and scale",
    "goal": "Deploy, automate and add real-time features.",
    "mods": [
     "nextjs",
     "docker",
     "cicd",
     "deploy-fe",
     "async-systems"
    ]
   },
   {
    "t": "Design and hiring",
    "goal": "Systems thinking and getting hired.",
    "mods": [
     "architecture",
     "dsa",
     "career"
    ]
   }
  ],
  "big": {
   "t": "Marketplace app",
   "brief": "A two-sided marketplace (for example tutors and students) with listings, search, booking and reviews.",
   "features": [
    "Two user types and permissions",
    "Search with filters",
    "Booking workflow with notifications",
    "Tests, CI/CD and monitoring"
   ]
  },
  "capstone": {
   "t": "Launch a real SaaS",
   "brief": "Build and launch a small SaaS that solves a real problem for real users.",
   "features": [
    "Landing page, auth and core feature",
    "Payments in test mode and admin dashboard",
    "At least five real users and their feedback",
    "Architecture doc, tests and CI/CD"
   ]
  },
  "jobReady": [
   "Build and connect a React frontend and a Node or Python backend",
   "Model and secure data per user",
   "Deploy a full stack app with CI/CD",
   "Add background jobs and real-time features",
   "Test both frontend and backend",
   "Explain system design trade-offs",
   "Show 2 complete products with live links"
  ],
  "interview": [
   "Walk me through a login from the browser to the database.",
   "How would you structure a full stack project?",
   "How do you handle state that lives on both client and server?",
   "How do you deploy and roll back safely?",
   "Design a simple e-commerce system."
  ]
 }
];
