/* Forge Academy curriculum, part 2: DevOps, security, QA. Original syllabus text. */
window.MODS = window.MODS || [];
(function () {
  const M = (id, t, area, d, les, lab, proj) => MODS.push({ id, t, area, d, les, lab, proj });
  const lab = (t, steps, done) => ({ t, steps, done });
  const proj = (t, brief, features) => ({ t, brief, features });

  /* ================= DEVOPS & CLOUD ================= */
  M("linux-admin", "Linux administration", "devops", "Running, securing and troubleshooting servers.", [
    ["Users, permissions and SSH", ["Users and groups", "sudoers", "SSH keys and config", "Disabling password login", "fail2ban"]],
    ["Services and systemd", ["Unit files", "Starting, enabling and restarting", "Timers instead of cron", "Service logs"]],
    ["Storage and filesystems", ["Disks, partitions and mounts", "df, du, lsblk", "Permissions on shared folders", "Backups with rsync"]],
    ["Performance and troubleshooting", ["CPU, memory, disk and network tools", "Load average", "strace and lsof", "A troubleshooting checklist"]],
    ["Web servers and reverse proxies", ["Nginx basics", "Reverse proxy to an app", "HTTPS with Let's Encrypt", "Load balancing upstreams"]]
  ], lab("Run a server by hand", ["Create a Linux VM and connect with SSH keys", "Harden SSH and set up a firewall", "Run an app as a systemd service behind Nginx with HTTPS", "Schedule a backup"], "Your app survives reboots and crashes, and you can debug it from logs."),
  proj("Self-hosted app server", "A production-style server you set up yourself.", ["Hardened SSH and firewall", "Nginx + HTTPS", "systemd service", "Automated backups"]));

  M("networking", "Networking for engineers", "devops", "How machines find and talk to each other. Core for DevOps, cloud and security.", [
    ["Network models and protocols", ["OSI and TCP/IP models", "Ethernet, IP, TCP, UDP", "ICMP and ping", "Common ports"]],
    ["IP addressing and subnets", ["CIDR notation", "Subnetting by hand", "Public vs private ranges", "NAT"]],
    ["DNS, DHCP and load balancing", ["DNS resolution chain", "DHCP", "Layer 4 vs layer 7 load balancers", "Reverse proxies"]],
    ["Network troubleshooting", ["ping, traceroute, mtr", "dig and nslookup", "netstat / ss", "tcpdump and Wireshark"]],
    ["Firewalls, VPNs and TLS", ["Stateful firewalls and security groups", "VPNs and tunnels", "TLS termination", "Zero trust in brief"]]
  ], lab("Network detective", ["Map your home network", "Split a /24 into four subnets on paper", "Capture a DNS lookup and TLS handshake in Wireshark", "Trace a request through a load balancer"], "You can explain every packet in a capture of a simple web request."),
  proj("Network lab", "A documented virtual network with subnets, a firewall and a load balancer.", ["Network diagram", "Firewall rules", "Load-balanced app", "Troubleshooting notes"]));

  M("bash", "Shell scripting", "devops", "Automating repetitive operational work safely.", [
    ["Bash fundamentals", ["Variables and quoting", "Conditionals and loops", "Functions and arguments", "Exit codes"]],
    ["Writing safe scripts", ["set -euo pipefail", "Traps and cleanup", "Input validation", "Idempotent scripts"]],
    ["Text processing and automation", ["sed and awk", "jq for JSON", "cron and timers", "Scripting APIs with curl"]]
  ], lab("Ops toolkit", ["A timestamped backup script", "A log summariser", "A URL health checker with alerts", "Schedule two of them"], "Three scripts that fail safely and log what they did."),
  proj("Server bootstrap script", "One script that turns a fresh Linux VM into a ready app server.", ["Idempotent", "Logs every step", "Configurable", "Tested on a fresh VM"]));

  M("docker", "Docker and containers", "devops", "Packaging apps so they run the same everywhere.", ["10-0", "10-1", "10-2", "10-3",
    ["Volumes, networks and registries", ["Volumes and bind mounts", "Container networking", "Pushing to registries", "Image tagging strategy"]]
  ], lab("Containerise a stack", ["Multi-stage Dockerfile with a non-root user", "App + Postgres + Redis with compose", "Health checks", "Push the image to a registry"], "docker compose up gives a working stack from a clean machine."),
  proj("Containerised microservice stack", "Three services and a database in containers.", ["Compose file", "Health checks", "Hardened images", "Documented setup"]));

  M("cicd", "CI/CD pipelines", "devops", "Testing and shipping automatically on every change.", ["19-0", "19-1",
    ["Pipeline design", ["Stages: lint, test, build, deploy", "Caching and parallel jobs", "Artifacts", "Environments and approvals"]],
    ["Deployment strategies", ["Rolling, blue-green and canary", "Feature flags", "Rollbacks", "Database migrations in deploys"]],
    ["GitOps", ["Declarative deployments", "Argo CD / Flux", "Drift detection", "Promotion between environments"]]
  ], lab("Automated pipeline", ["Run tests on every push", "Build and push a Docker image", "Deploy main automatically to staging", "Block deploys on failing tests"], "Green builds deploy themselves; red builds never reach users."),
  proj("Production pipeline", "A full CI/CD pipeline with staging and production.", ["Tests and security scans", "Staging auto-deploy", "Manual production approval", "Rollback procedure"]));

  M("cloud-aws", "Cloud fundamentals with AWS", "devops", "The core services every cloud role uses. Skills transfer to Azure and GCP.", [
    ["Cloud concepts and IAM", ["Regions and availability zones", "Shared responsibility", "IAM users, roles and policies", "Least privilege", "MFA and the root account"]],
    ["Compute", ["EC2 instances", "Auto Scaling groups", "Containers: ECS / Fargate", "Serverless with Lambda"]],
    ["Storage and databases", ["S3 buckets and policies", "EBS and EFS", "RDS and Aurora", "DynamoDB basics"]],
    ["Networking in the cloud", ["VPCs and subnets", "Security groups and NACLs", "Load balancers", "Route 53 DNS", "CloudFront CDN"]],
    ["Cost, monitoring and well-architected design", ["Billing alerts and budgets", "CloudWatch", "The Well-Architected pillars", "Cleaning up resources"]]
  ], lab("First cloud deployment", ["Create an account with MFA and an admin role", "Host a static site on S3 + CloudFront", "Run a container with a managed database", "Set a billing alert and tear down"], "A working deployment with least-privilege IAM and a cost alert."),
  proj("Three-tier cloud app", "A load-balanced app with a managed database in a private subnet.", ["VPC with public/private subnets", "Auto-scaling compute", "Managed database", "Architecture diagram and cost estimate"]));

  M("iac", "Infrastructure as code", "devops", "Defining infrastructure in version-controlled files with Terraform and Ansible.", [
    ["Terraform fundamentals", ["Providers and resources", "State", "Variables and outputs", "plan, apply, destroy"]],
    ["Terraform at scale", ["Modules", "Remote state and locking", "Workspaces and environments", "Testing and linting IaC"]],
    ["Configuration management with Ansible", ["Inventories", "Playbooks and roles", "Idempotency", "Ansible Vault"]]
  ], lab("Infra in code", ["Terraform an S3 bucket and IAM role", "Add a VPC with subnets", "Parameterise environments", "Destroy and recreate everything"], "terraform apply builds your environment from scratch."),
  proj("Reusable infrastructure modules", "Terraform modules for a standard web app environment.", ["Network, compute and database modules", "Remote state", "Staging and production", "CI plan on pull requests"]));

  M("kubernetes", "Kubernetes", "devops", "Running containers at scale: the standard platform for modern infrastructure.", [
    ["Kubernetes architecture", ["Control plane and nodes", "Pods", "kubectl", "Namespaces"]],
    ["Workloads and services", ["Deployments and ReplicaSets", "Services and Ingress", "StatefulSets and Jobs", "DaemonSets"]],
    ["Configuration and secrets", ["ConfigMaps", "Secrets", "Resource requests and limits", "Probes"]],
    ["Scaling and updates", ["Horizontal pod autoscaling", "Rolling updates and rollbacks", "Pod disruption budgets", "Cluster autoscaling"]],
    ["Helm and the ecosystem", ["Helm charts", "Operators", "Service meshes in brief", "Managed Kubernetes (EKS, GKE, AKS)"]]
  ], lab("Deploy to a local cluster", ["Start kind or minikube", "Deploy an app and database with manifests", "Add probes, config and secrets", "Scale to 3 and roll out an update with zero downtime"], "The update completes with zero failed requests."),
  proj("App on Kubernetes", "A multi-service app packaged with Helm.", ["Helm chart", "Autoscaling", "Ingress with TLS", "Zero-downtime deploys"]));

  M("observability", "Observability and reliability", "devops", "Knowing what your systems are doing and keeping them up.", ["19-3",
    ["Metrics with Prometheus and Grafana", ["Metric types", "PromQL basics", "Dashboards", "The RED and USE methods"]],
    ["Logs and traces", ["Centralised logging", "Structured logs", "Distributed tracing with OpenTelemetry", "Correlation ids"]],
    ["SRE practices", ["SLIs, SLOs and error budgets", "Actionable alerting", "Incident response and on-call", "Blameless postmortems"]]
  ], lab("Make it observable", ["Expose metrics and build a Grafana dashboard", "Centralise JSON logs", "Define two SLOs with alerts", "Trigger an incident and write a postmortem"], "You detect a fault from an alert and trace it to its cause."),
  proj("Observability stack", "Metrics, logs, traces and alerts for a multi-service app.", ["Prometheus + Grafana", "Log aggregation", "Tracing", "SLO dashboard and runbook"]));

  /* ================= DEVSECOPS & SECURITY ================= */
  M("devsecops", "DevSecOps: security in the pipeline", "security", "Building security into every stage of delivery instead of bolting it on.", [
    ["Shift-left security", ["Security in the SDLC", "Threat modelling in design reviews", "Secure coding standards", "Security champions"]],
    ["Static and dynamic testing", ["SAST (Semgrep, CodeQL, Bandit)", "DAST (OWASP ZAP)", "IAST overview", "Triaging findings"]],
    ["Software supply chain security", ["Dependency scanning (SCA)", "SBOMs", "Signing artifacts (Sigstore)", "Pinning and provenance"]],
    ["Secrets management", ["Secret scanning", "Vault and cloud secret managers", "Rotation", "Short-lived credentials (OIDC)"]],
    ["Container and infrastructure security", ["Image scanning (Trivy)", "Minimal base images", "IaC scanning (Checkov, tfsec)", "Policy as code (OPA)"]]
  ], lab("Secure the pipeline", ["Add SAST and dependency scanning to CI", "Scan your images and IaC", "Move secrets to a secret store with OIDC", "Fail the build on a known-vulnerable dependency"], "CI blocks the vulnerable dependency you added on purpose."),
  proj("Secure delivery pipeline", "A CI/CD pipeline with security gates at every stage.", ["SAST, SCA, DAST and IaC scans", "SBOM and signed images", "Secret management", "Security dashboard"]));

  M("sec-fundamentals", "Security fundamentals", "security", "The concepts every security role starts from.", [
    ["Core concepts", ["CIA triad", "Threats, vulnerabilities and risk", "Defence in depth", "Least privilege"]],
    ["Attackers and attacks", ["Threat actors", "The cyber kill chain", "MITRE ATT&CK", "Social engineering and phishing"]],
    ["Security frameworks and compliance", ["NIST CSF", "ISO 27001", "SOC 2", "GDPR and India's DPDP Act in brief"]],
    ["Threat modelling", ["STRIDE", "Data flow diagrams", "Ranking risks", "Choosing controls"]]
  ], lab("Threat model an app", ["Pick an app you use daily", "List assets, entry points and attackers", "Rank five threats", "Propose a control for each"], "A one-page threat model a team could act on."),
  proj("Security policy pack", "A starter set of security policies for a small startup.", ["Access control policy", "Incident response policy", "Password and MFA policy", "Risk register"]));

  M("crypto", "Applied cryptography", "security", "Using cryptography correctly. Most failures come from misuse, not broken maths.", ["8-0", "8-1",
    ["Encryption in practice", ["Symmetric: AES-GCM", "Asymmetric: RSA and elliptic curves", "Key exchange", "Encryption at rest and in transit"]],
    ["PKI and certificates", ["Certificate authorities", "Certificate chains", "mTLS", "Revocation"]]
  ], lab("Crypto in practice", ["Hash and verify passwords", "Encrypt and decrypt a file with AES-GCM", "Sign a file with a key pair", "Inspect a site's certificate chain"], "You can pick the right primitive for each job and explain why."),
  proj("Encrypted notes app", "A notes tool that encrypts data before storing it.", ["Key derivation from a passphrase", "Authenticated encryption", "Threat model", "Tests"]));

  M("web-security", "Web application security", "security", "How real web attacks work and how to stop them.", ["8-3",
    ["Injection and XSS", ["SQL and command injection", "Stored, reflected and DOM XSS", "Template injection", "Defences"]],
    ["Access control and session attacks", ["IDOR / broken access control", "CSRF", "Session fixation", "JWT pitfalls"]],
    ["Server-side attacks", ["SSRF", "Path traversal", "File upload attacks", "Deserialisation"]],
    ["Testing web apps", ["Burp Suite workflow", "OWASP Testing Guide", "Writing findings", "Responsible disclosure"]]
  ], lab("Practise on a vulnerable app", ["Run OWASP Juice Shop locally", "Exploit SQLi, XSS and broken access control", "Write up each finding", "Fix the same flaws in your own code"], "Five professional findings with fixes."),
  proj("Vulnerable-then-fixed app", "An app built with deliberate flaws, then fixed and tested.", ["Five vulnerability classes", "A test per flaw", "Write-ups", "Before/after branches"]));

  M("network-security", "Network security and tools", "security", "Scanning, monitoring and defending networks.", [
    ["Scanning and enumeration", ["Nmap scans", "Service and version detection", "Enumeration", "Legal and ethical boundaries"]],
    ["Traffic analysis", ["Wireshark filters", "Spotting suspicious traffic", "Extracting files from captures", "Zeek overview"]],
    ["Defensive network controls", ["Firewalls and segmentation", "IDS/IPS (Snort, Suricata)", "VPN and zero trust", "Network hardening"]],
    ["Wireless and endpoint security", ["Wi-Fi security", "Endpoint protection", "Hardening Windows and Linux", "Patch management"]]
  ], lab("Lab assessment", ["Build a lab with an attacker and two target VMs", "Scan and document open services", "Capture and analyse an attack in Wireshark", "Write an IDS rule that detects it"], "Your rule detects the attack and you can explain every step. Only test systems you own."),
  proj("Home security lab", "A documented lab for practising attack and defence.", ["Network diagram", "Attack and target machines", "IDS", "Write-ups"]));

  M("soc", "Security operations and monitoring", "security", "Detecting threats from logs and alerts: the most common entry-level security job.", [
    ["How a SOC works", ["SOC tiers and roles", "The alert lifecycle", "Shifts, handovers and playbooks", "Key metrics: MTTD and MTTR"]],
    ["Logs and SIEM", ["Log sources: OS, network, cloud, application", "SIEM concepts (Splunk, Elastic, Wazuh)", "Normalising and enriching logs", "Retention"]],
    ["Writing detections", ["Detection logic and thresholds", "Sigma rules", "Mapping to MITRE ATT&CK", "Reducing false positives"]],
    ["Alert triage and threat intelligence", ["Triage questions", "Indicators of compromise", "Threat intel feeds", "Escalation and documentation"]]
  ], lab("Detect repeated failed logins", ["Run Wazuh or the Elastic stack in Docker", "Send authentication logs to it", "Write a rule for repeated failed logins", "Generate test events and triage the alert"], "Your rule fires on the test events and not on normal activity."),
  proj("Mini SOC", "A small monitoring setup for a lab environment.", ["Log collection from several machines", "Three detections mapped to ATT&CK", "Triage notes", "Weekly report"]));

  M("incident-response", "Incident response and forensics basics", "security", "What to do when something goes wrong.", [
    ["The incident response lifecycle", ["Preparation", "Detection and analysis", "Containment, eradication, recovery", "Lessons learned"]],
    ["Evidence and investigation", ["Order of volatility", "Preserving evidence", "Timelines", "Chain of custody"]],
    ["Communication during incidents", ["Roles: incident commander, comms, scribe", "Stakeholder updates", "Regulatory notification", "Post-incident reports"]]
  ], lab("Tabletop exercise", ["Write a ransomware scenario for a small company", "Walk through each IR phase and decide actions", "List evidence to collect and how to preserve it", "Write the post-incident report"], "A complete incident playbook for one scenario."),
  proj("Incident response playbooks", "Playbooks for three common incident types.", ["Phishing, ransomware and data leak", "Roles and contacts", "Checklists", "Report template"]));

  M("cloud-security", "Cloud security", "security", "Most breaches today involve cloud misconfiguration.", [
    ["Cloud security foundations", ["Shared responsibility", "Identity as the new perimeter", "Landing zones and account structure", "Guardrails"]],
    ["Common misconfigurations", ["Public storage buckets", "Over-permissive IAM", "Exposed management ports", "Unencrypted data"]],
    ["Monitoring and posture management", ["CloudTrail and audit logs", "GuardDuty / Defender / Security Command Center", "CSPM tools", "Automated remediation"]]
  ], lab("Audit a cloud account", ["In a free-tier account, create a deliberately public bucket", "Detect it with built-in security checks", "Fix it and tighten an over-permissive role", "Find your own actions in the audit log"], "You find, fix and log the misconfigurations you created."),
  proj("Cloud security baseline", "A secure baseline for a new cloud account.", ["Guardrail policies", "Audit logging", "Alerting on risky changes", "Documentation"]));

  M("grc", "Governance, risk and compliance", "security", "The policy side of security that every organisation needs.", [
    ["Risk management", ["Identifying and scoring risk", "Risk registers", "Treat, transfer, accept, avoid", "Third-party risk"]],
    ["Policies and controls", ["Writing security policies", "Control frameworks", "Security awareness training", "Access reviews"]],
    ["Audits and certifications", ["Preparing for an audit", "Evidence collection", "ISO 27001 and SOC 2 journeys", "Security certifications for your career (Security+, CySA+)"]]
  ], lab("Risk assessment", ["Pick a small business scenario", "Identify and score ten risks", "Map controls to each", "Write an executive summary"], "A risk register and summary a manager could act on."),
  proj("Compliance starter kit", "Documents a startup needs for its first security audit.", ["Risk register", "Policy set", "Control matrix", "Audit evidence checklist"]));

  /* ================= QA ================= */
  M("qa-fundamentals", "QA and testing fundamentals", "qa", "How quality is planned, tested and reported in software teams.", [
    ["Quality in the software lifecycle", ["SDLC and STLC", "Agile and the tester's role", "Verification vs validation", "Shift-left testing"]],
    ["Types and levels of testing", ["Unit, integration, system, acceptance", "Functional vs non-functional", "Smoke, sanity and regression", "Exploratory testing"]],
    ["Test design techniques", ["Equivalence partitioning", "Boundary value analysis", "Decision tables", "State transition testing"]],
    ["Test cases, bugs and reporting", ["Writing clear test cases", "Bug reports that get fixed", "Severity vs priority", "Test plans and reports"]]
  ], lab("Test a real app manually", ["Pick a sign-up form on any site", "Design 15 test cases with boundary values", "Run them and log at least three issues", "Write a short test report"], "Your test cases and bug reports are clear enough for a developer to act on without asking."),
  proj("Test plan and report", "A professional test plan and execution report for an app.", ["Scope and strategy", "Test cases", "Bug reports", "Summary with metrics"]));

  M("test-automation", "Test automation", "qa", "Automating UI, API and performance tests and running them in CI.", ["17-0", "17-1", "18-2",
    ["Automation frameworks and design", ["Page object model", "Test data management", "Flaky tests and how to fix them", "Selenium vs Playwright vs Cypress"]],
    ["API testing", ["Postman collections", "Contract testing", "Schema validation", "Testing auth flows"]],
    ["Performance and load testing", ["Load, stress and soak tests", "k6 and JMeter", "Reading latency percentiles", "Finding bottlenecks"]],
    ["Testing in CI/CD", ["Running suites on every pull request", "Parallel runs", "Reports and screenshots", "Quality gates"]]
  ], lab("Automate a test suite", ["Write 10 Playwright UI tests with page objects", "Write API tests for the same app", "Run a load test with k6", "Run everything in GitHub Actions"], "Your suite runs in CI on every push and catches a bug you introduce."),
  proj("Automation framework", "A reusable test automation framework for a web app.", ["UI and API tests", "Page objects and fixtures", "CI with reports", "Load test scripts"]));
})();
