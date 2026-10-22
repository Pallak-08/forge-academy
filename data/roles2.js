/* Forge Academy role roadmaps: three major tech roles (Role → Stages → Modules).
   Modules run in a deliberate learning order, foundations first. All content is original. */
window.ROLES2 = [
 {
  "id": "fullstack",
  "title": "Full Stack Developer",
  "glyph": "FS",
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
    "goal": "How the web works and the tools every developer uses.",
    "mods": [
     "internet",
     "terminal",
     "git",
     "debugging"
    ]
   },
   {
    "t": "Frontend basics",
    "goal": "Build and style pages, then make them interactive.",
    "mods": [
     "html",
     "css",
     "styling",
     "javascript",
     "dom"
    ]
   },
   {
    "t": "Modern frontend",
    "goal": "Types, tooling and React, the way teams build today.",
    "mods": [
     "typescript",
     "fe-tooling",
     "react",
     "nextjs",
     "fe-quality"
    ]
   },
   {
    "t": "Backend and data",
    "goal": "Serve APIs and store data with Node.js.",
    "mods": [
     "node",
     "http-apis",
     "sql",
     "orm",
     "nosql"
    ]
   },
   {
    "t": "Secure, test and ship",
    "goal": "Real users, safely and automatically.",
    "mods": [
     "auth",
     "api-security",
     "testing",
     "docker",
     "cicd",
     "deploy-fe",
     "async-systems"
    ]
   },
   {
    "t": "Systems and hiring",
    "goal": "Design bigger systems and get the job.",
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
   "Build and connect a React frontend and a Node backend",
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
 },
 {
  "id": "ai-engineer",
  "title": "AI / ML Engineer",
  "glyph": "AI",
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
  "id": "devops",
  "title": "Cloud & DevOps Engineer",
  "glyph": "CD",
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
    "goal": "Linux, the terminal, networking and scripting.",
    "mods": [
     "terminal",
     "linux-admin",
     "networking",
     "bash"
    ]
   },
   {
    "t": "Version control and a language",
    "goal": "Git and automation in a real language.",
    "mods": [
     "git",
     "python",
     "http-apis"
    ]
   },
   {
    "t": "Containers",
    "goal": "Package and run anything, then orchestrate it.",
    "mods": [
     "docker",
     "kubernetes"
    ]
   },
   {
    "t": "CI/CD, cloud and infrastructure",
    "goal": "Ship automatically to the cloud, all in code.",
    "mods": [
     "cicd",
     "iac",
     "cloud-aws",
     "cloud-security"
    ]
   },
   {
    "t": "Reliability and security",
    "goal": "Observe, secure and design for failure.",
    "mods": [
     "observability",
     "devsecops",
     "architecture"
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
 }
];
