/* Forge Academy skill areas: every topic belongs to one area. Modules map to areas for the lesson library. */
window.AREAS = [
  { id: "programming", title: "Programming foundations", d: "Languages and problem solving every role starts from.", topics: ["python", "python-adv", "javascript", "typescript", "dsa", "debugging"] },
  { id: "tools", title: "Developer tools", d: "The terminal, Git and the toolchain you use every day.", topics: ["terminal", "git", "tooling", "bash"] },
  { id: "frontend", title: "Web and frontend", d: "Building the interfaces people see in the browser.", topics: ["internet", "html", "css", "dom", "react", "react-adv", "state-mgmt", "css-frameworks", "nextjs", "a11y", "web-perf", "fe-testing", "fe-security", "deploy-fe"] },
  { id: "backend", title: "Backend and APIs", d: "Servers, APIs, auth and background work.", topics: ["http-rest", "fastapi", "node", "auth", "api-security", "testing", "concurrency", "realtime", "caching", "queues"] },
  { id: "data-stores", title: "Databases", d: "Storing and querying data, relational and not.", topics: ["sql", "orm", "nosql", "sql-analytics"] },
  { id: "architecture", title: "Systems and architecture", d: "Designing systems that scale and stay reliable.", topics: ["scaling", "system-design", "sw-design", "observability"] },
  { id: "devops", title: "DevOps and cloud", d: "Containers, pipelines, infrastructure and reliability.", topics: ["docker", "cicd", "linux-admin", "networking", "kubernetes", "cloud", "iac", "config-mgmt", "sre", "devsecops"] },
  { id: "security", title: "Cybersecurity", d: "Attacking, defending and responding.", topics: ["sec-fundamentals", "crypto", "web-security", "sec-tools", "pentest", "soc", "incident-response", "cloud-security", "sandboxing", "sec-career"] },
  { id: "analytics", title: "Data analysis", d: "Turning data into decisions.", topics: ["spreadsheets", "statistics", "pandas", "data-cleaning", "data-viz", "bi-tools", "storytelling"] },
  { id: "ml", title: "Machine learning", d: "Models that learn from data, and running them in production.", topics: ["math-ml", "numpy", "ml-fundamentals", "feature-eng", "deep-learning", "nlp-llm", "mlops", "data-pipelines"] },
  { id: "ai", title: "AI engineering", d: "Building products on large language models.", topics: ["llm-apis", "prompting", "embeddings", "rag", "tool-calling", "agents", "evals", "doc-processing", "codegen", "ast", "browser-auto", "ai-product"] },
  { id: "mobile", title: "Mobile development", d: "Apps for iOS and Android with React Native.", topics: ["rn-basics", "rn-navigation", "rn-data", "rn-native", "rn-storage", "rn-push", "rn-testing", "rn-release"] },
  { id: "career", title: "Career", d: "Showing your work and getting hired.", topics: ["portfolio", "job-search"] }
];
window.MODULE_AREA = { 1: "programming", 2: "programming", 24: "programming", 21: "tools", 7: "frontend", 26: "frontend",
  3: "backend", 4: "backend", 8: "backend", 9: "backend", 18: "backend", 5: "data-stores", 6: "data-stores", 25: "data-stores",
  22: "architecture", 20: "architecture", 10: "devops", 19: "devops", 27: "analytics",
  11: "ai", 12: "ai", 13: "ai", 14: "ai", 15: "ai", 16: "ai", 17: "ai", 23: "ai" };
