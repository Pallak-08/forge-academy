/* Forge Academy lessons: DevSecOps, security operations */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 42, id: "devsecops-lessons", fills: "devsecops", title: "DevSecOps: security in the pipeline", level: 3,
  blurb: "Building security into design, code, dependencies, secrets and infrastructure.",
  lessons: [
    {
      t: "Shift-left security",
      sub: ["Security in the SDLC", "Threat modelling in design reviews", "Secure coding standards", "Security champions"],
      body: `<p>Fixing a security flaw in design costs minutes; fixing it after a breach costs months. <b>Shift left</b> means moving security earlier in the software development lifecycle (SDLC), so it becomes part of how every feature is built rather than a gate at the end.</p>
<p>Security activities at each stage:</p>
<ul><li><b>Plan and design</b>: security requirements in user stories ("only the invoice owner can download it"), a lightweight threat model for risky features.</li>
<li><b>Code</b>: secure coding standards, linters and IDE plugins, peer review with a security checklist.</li>
<li><b>Build</b>: automated scans in CI (SAST, dependencies, secrets, containers, IaC).</li>
<li><b>Test and release</b>: DAST against staging, signed artifacts, deployment policy checks.</li>
<li><b>Operate</b>: monitoring, vulnerability management, incident response, and feeding lessons back into design.</li></ul>
<p><b>Threat modelling in design reviews</b> doesn't need a workshop: for any feature touching auth, payments, file handling, personal data or new external integrations, add a short section to the design doc covering the data flow, trust boundaries, the top STRIDE threats and the mitigations.</p>
<p><b>Secure coding standards</b> turn lessons into defaults: use the framework's ORM and auto-escaping, a shared auth middleware, central input validation (Pydantic, zod), approved crypto libraries, no secrets in code, structured logging without personal data. Encode as many as possible into linters and templates so the safe way is the easy way.</p>
<p><b>Security champions</b> are developers in each team with extra security training who review risky changes, triage scanner findings and bring questions to the security team. They scale a small security team across many product teams.</p>`,
      lang: "markdown",
      code: `## Security section for a design doc (template)

**Feature:** Team workspace invitations by email
**Data involved:** inviter and invitee emails, workspace ID, role
**Risk level:** Medium (grants access to customer data)

### Data flow and trust boundaries
Browser -> API (auth required) -> Postgres (invites table) -> Email provider (3rd party)
Invite link -> API (unauthenticated until accepted)

### Top threats (STRIDE)
| # | Threat | Mitigation |
|---|--------|-----------|
| 1 | Invite token guessed or reused (S/E) | 32-byte random token, stored hashed, single use, 72 h expiry |
| 2 | Member invites themselves as admin (E) | Only admins can invite admins; role checked server-side |
| 3 | Invite spam to arbitrary emails (D) | Rate limit 20 invites/hour per workspace |
| 4 | Email enumeration via invite errors (I) | Same response whether or not the email has an account |
| 5 | No record of who added whom (R) | Audit log entry on invite, accept and revoke |

### Security tests to add
- [ ] member cannot create admin invites (403)
- [ ] expired / reused token rejected
- [ ] cross-workspace accept rejected

### Secure coding checklist (PR template)
- [ ] Input validated with schema; output encoded by framework
- [ ] Authorisation checked server-side for every new endpoint
- [ ] No secrets, tokens or personal data in logs
- [ ] New dependencies reviewed (maintained? licence? necessary?)`,
      ex: "Pick a feature from one of your projects (login, file upload or sharing). Write the security section of its design doc using the template: data flow, five threats with mitigations and the security tests you'll add. Then add a security checklist to your repository's pull request template.",
      q: ["What does 'shift left' mean in DevSecOps?", ["Moving servers to another region", "Doing security activities earlier in the development lifecycle, when issues are cheaper to fix", "Letting the security team approve every deploy at the end", "Writing code from right to left"], 1, "Design-time and code-time checks catch problems before they're built into production systems."]
    },
    {
      t: "Static and dynamic testing",
      sub: ["SAST (Semgrep, CodeQL, Bandit)", "DAST (OWASP ZAP)", "IAST overview", "Triaging findings"],
      body: `<p><b>SAST</b> (static application security testing) analyses source code without running it, looking for risky patterns: SQL built with string formatting, <code>eval</code> on input, weak hashing, disabled TLS verification. Tools: <b>Semgrep</b> (fast, readable rules, easy to write your own), <b>CodeQL</b> (deep data-flow analysis, free for public GitHub repos), <b>Bandit</b> (Python), ESLint security plugins (JavaScript). Run SAST on every pull request so developers see findings in context, while the code is fresh in their minds.</p>
<p><b>DAST</b> (dynamic testing) attacks a <i>running</i> app from the outside like a user would, finding issues SAST can't see: missing security headers, misconfigured cookies, server errors leaking details, some injection and XSS. <b>OWASP ZAP</b> has a baseline scan (passive, safe for CI against staging) and a full scan (active, only against environments you own and that can tolerate it).</p>
<p><b>IAST</b> (interactive testing) instruments the app at runtime while tests or QA run, combining code-level detail with real execution. It's mostly found in commercial tools.</p>
<p>Scanners produce false positives, and teams that are flooded with noise learn to ignore everything. <b>Triage</b> deliberately: confirm the finding is reachable and exploitable; set severity by real impact; fix, or mark as a false positive or accepted risk with a reason; tune or suppress rules that are consistently wrong for your codebase. Start by blocking merges only on high-confidence, high-severity rules, and report the rest.</p>`,
      lang: "yaml",
      code: `# .github/workflows/security.yml
name: security
on: [pull_request]
permissions: { contents: read, security-events: write }

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Semgrep (block on high-confidence findings)
        run: |
          pip install semgrep
          semgrep scan --config p/python --config p/owasp-top-ten --config .semgrep/ \\
            --severity ERROR --error --sarif -o semgrep.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with: { sarif_file: semgrep.sarif }

  dast:
    runs-on: ubuntu-latest
    needs: sast
    steps:
      - name: ZAP baseline scan against the PR preview (passive, safe)
        uses: zaproxy/action-baseline@v0.12.0
        with:
          target: https://pr-\${{ github.event.number }}.preview.example.com
          rules_file_name: .zap/rules.tsv     # tune: IGNORE / WARN / FAIL per rule

# .semgrep/no-fstring-sql.yml : a custom rule for your codebase
# rules:
#   - id: no-fstring-sql
#     languages: [python]
#     severity: ERROR
#     message: Build SQL with parameters, not f-strings
#     pattern-either:
#       - pattern: $DB.execute(f"...")
#       - pattern: $DB.execute("..." % ...)`,
      ex: "Add Semgrep and Bandit (or ESLint security rules) to the CI of one of your repositories, and a ZAP baseline scan against a locally running or preview deployment. Write one custom Semgrep rule for a mistake you've actually made. Triage every finding into fix, false positive or accepted risk, with a one-line reason each.",
      q: ["Which issue is DAST more likely to find than SAST?", ["An f-string used to build SQL in a rarely called function", "Missing security headers and insecure cookie flags on the deployed app", "A hard-coded password in a test file", "An unused import"], 1, "Headers and cookie flags are often set by servers, proxies or configuration, visible only when the app actually runs."]
    },
    {
      t: "Software supply chain security",
      sub: ["Dependency scanning (SCA)", "SBOMs", "Signing artifacts (Sigstore)", "Pinning and provenance"],
      body: `<p>Most of the code you ship was written by someone else: open-source dependencies, base images, build tools, CI actions. The <b>software supply chain</b> is everything that goes into producing your artifact, and attackers target it because one compromised package reaches thousands of victims (typosquatted packages, hijacked maintainer accounts, malicious updates, compromised build systems).</p>
<p><b>Software composition analysis</b> (SCA) checks your dependencies against vulnerability databases: Dependabot, Renovate, <code>npm audit</code>, <code>pip-audit</code>, OSV-Scanner, Trivy. Keep dependencies updated in small, regular steps rather than giant yearly upgrades, and prioritise vulnerabilities that are reachable and actively exploited.</p>
<p>An <b>SBOM</b> (software bill of materials) is a machine-readable list of every component and version in your artifact, in SPDX or CycloneDX format. When the next Log4Shell-style vulnerability is announced, an SBOM tells you in minutes which services are affected. Generate one in CI for every release (Syft, Trivy).</p>
<p><b>Signing</b> proves an artifact came from your pipeline and wasn't altered. <b>Sigstore cosign</b> signs container images using short-lived certificates tied to your CI identity (keyless signing via OIDC), recorded in a public transparency log; clusters can then refuse unsigned images.</p>
<p><b>Pinning and provenance</b>: commit lock files; pin CI actions to full commit SHAs, not tags that can be moved; pin base images by digest; and generate <b>build provenance</b> (SLSA attestations) stating which source commit and workflow produced each artifact. Review new dependencies before adding them: are they maintained, widely used and actually necessary?</p>`,
      lang: "yaml",
      code: `# Release job: SBOM, vulnerability gate, keyless signing, provenance
name: release
on: { push: { tags: ["v*"] } }
permissions: { contents: read, packages: write, id-token: write, attestations: write }

jobs:
  image:
    runs-on: ubuntu-latest
    steps:
      # pin third-party actions to a full commit SHA (tags can be moved)
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683   # v4.2.2
      - name: Build and push
        id: build
        run: |
          IMG=ghcr.io/\${{ github.repository }}:\${{ github.ref_name }}
          docker build -t $IMG . && docker push $IMG
          echo "digest=$(docker inspect --format='{{index .RepoDigests 0}}' $IMG)" >> $GITHUB_OUTPUT
      - name: SBOM (CycloneDX)
        run: |
          curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b .
          ./syft \${{ steps.build.outputs.digest }} -o cyclonedx-json > sbom.json
      - name: Fail on fixable critical vulnerabilities
        uses: aquasecurity/trivy-action@0.28.0
        with: { image-ref: "\${{ steps.build.outputs.digest }}", severity: CRITICAL, ignore-unfixed: true, exit-code: "1" }
      - name: Keyless sign with Sigstore
        run: |
          curl -sSfL -o cosign https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64 && chmod +x cosign
          ./cosign sign --yes \${{ steps.build.outputs.digest }}
      - name: Build provenance attestation
        uses: actions/attest-build-provenance@v1
        with: { subject-name: "ghcr.io/\${{ github.repository }}", subject-digest: "\${{ steps.build.outputs.digest }}" }

# Verify before deploying:
#   cosign verify ghcr.io/org/app@sha256:... \\
#     --certificate-identity-regexp 'https://github.com/org/app/.github/workflows/release.yml@.*' \\
#     --certificate-oidc-issuer https://token.actions.githubusercontent.com`,
      ex: "For one of your projects: enable Dependabot or Renovate, run <code>pip-audit</code> or <code>npm audit</code> and OSV-Scanner and fix what's reachable, generate an SBOM with Syft, pin your GitHub Actions to commit SHAs, and sign a container image with cosign and verify it. Write a short note on which dependency you'd remove and why.",
      q: ["Why pin a GitHub Action to a commit SHA rather than a tag like @v3?", ["SHAs run faster", "A tag can be moved to point at different (possibly malicious) code; a commit SHA is immutable", "Tags are not allowed in workflows", "SHAs give free CI minutes"], 1, "If an action's repository is compromised, the attacker can re-point tags. A full SHA always refers to the exact code you reviewed."]
    },
    {
      t: "Secrets management",
      sub: ["Secret scanning", "Vault and cloud secret managers", "Rotation", "Short-lived credentials (OIDC)"],
      body: `<p>Leaked secrets (API keys, database passwords, cloud credentials, private keys) are one of the most common causes of breaches. Bots scan public GitHub commits within seconds. And deleting a secret in a later commit doesn't help: it's still in history, so a leaked secret must be <b>revoked and rotated</b>.</p>
<p><b>Secret scanning</b> at several points: a pre-commit hook (gitleaks, detect-secrets) stops secrets before they're committed; CI scans every push; GitHub's push protection blocks known token formats; and periodic scans cover history and other places secrets end up (wikis, tickets, container images, logs).</p>
<p>Store secrets in a <b>secret manager</b>, not in code, images or plain config files: HashiCorp <b>Vault</b>, AWS Secrets Manager or Parameter Store, Azure Key Vault, GCP Secret Manager. Apps fetch secrets at runtime using their workload identity; access is controlled per secret and every read is logged. Locally, use a <code>.env</code> file that is git-ignored, with a committed <code>.env.example</code> listing names only.</p>
<p><b>Rotation</b> limits how long a leaked secret is useful. Managers can rotate database passwords automatically; design apps to reload secrets without redeploying, and support two valid keys during the switch-over.</p>
<p>Better still, eliminate long-lived secrets. <b>OIDC federation</b> lets CI systems (GitHub Actions, GitLab) exchange a short-lived identity token for temporary cloud credentials, scoped to a specific repository and branch, with nothing stored in CI. Vault's dynamic secrets create a unique database user per app instance that expires automatically.</p>`,
      lang: "yaml",
      code: `# 1. Pre-commit hook: block secrets before they reach git  (.pre-commit-config.yaml)
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.2
    hooks: [ { id: gitleaks } ]
# install once:  pip install pre-commit && pre-commit install

---
# 2. GitHub Actions deploying to AWS with OIDC: no access keys stored anywhere
name: deploy
on: { push: { branches: [main] } }
permissions: { id-token: write, contents: read }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/gha-deploy-forge
          aws-region: ap-south-1          # credentials last ~1 hour
      - run: aws ecs update-service --cluster prod --service api --force-new-deployment

# The role's trust policy only accepts this repo's main branch:
#   "Condition": {
#     "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
#     "StringLike":   { "token.actions.githubusercontent.com:sub": "repo:Pallak-08/forge-academy:ref:refs/heads/main" }
#   }

---
# 3. App reads its database password at startup (Python)
#   import boto3, json
#   secret = json.loads(boto3.client("secretsmanager")
#              .get_secret_value(SecretId="prod/forge/db")["SecretString"])`,
      ex: "Install gitleaks as a pre-commit hook and scan the full history of your repositories (<code>gitleaks git -v</code>); rotate anything it finds. Move one project's secrets into a secret manager (or Doppler / 1Password CLI for personal projects), and replace any stored cloud keys in CI with OIDC federation scoped to one repo and branch.",
      q: ["You accidentally pushed an API key to a public repo and deleted it in the next commit. What must you do?", ["Nothing, it's deleted", "Revoke and rotate the key immediately, then check logs for misuse; it's still in git history and may already be harvested", "Make the repo private and carry on", "Rename the variable"], 1, "Bots harvest keys from public commits within seconds, and history keeps the old value. Only revocation makes the leaked key useless."]
    },
    {
      t: "Container and infrastructure security",
      sub: ["Image scanning (Trivy)", "Minimal base images", "IaC scanning (Checkov, tfsec)", "Policy as code (OPA)"],
      body: `<p><b>Image scanning</b> finds known vulnerabilities in OS packages and language dependencies inside container images. <b>Trivy</b> and Grype scan locally and in CI, and registries (ECR, GHCR, Artifact Registry) can scan on push. Gate on fixable critical issues, and rebuild images regularly, because base images get patched upstream even when your code doesn't change.</p>
<p><b>Minimal base images</b> shrink the attack surface: fewer packages means fewer vulnerabilities and fewer tools for an attacker. Use slim or distroless images, multi-stage builds that leave compilers behind, a non-root <code>USER</code>, no secrets in layers, and a read-only filesystem at runtime where possible. In Kubernetes, enforce this with the "restricted" Pod Security Standard: no privileged containers, no root, dropped capabilities.</p>
<p><b>IaC scanning</b> checks Terraform, CloudFormation, Kubernetes manifests and Dockerfiles for misconfigurations <i>before</i> they're deployed: public buckets, open security groups, unencrypted databases, missing logging. Tools: <b>Checkov</b>, <b>tfsec</b> (now part of Trivy: <code>trivy config</code>), KICS. Run them on every pull request alongside <code>terraform plan</code>.</p>
<p><b>Policy as code</b> expresses organisational rules in code that is versioned, reviewed and enforced automatically. <b>Open Policy Agent</b> (OPA) uses the Rego language: evaluate Terraform plans in CI with Conftest, and enforce rules in Kubernetes with Gatekeeper or Kyverno admission control (for example: only images from our registry, signed images only, resource limits required).</p>`,
      lang: "dockerfile",
      code: `# Multi-stage, minimal, non-root image
FROM python:3.12-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
COPY . .

FROM gcr.io/distroless/python3-debian12:nonroot   # no shell, no package manager
WORKDIR /app
COPY --from=build /install /usr/local
COPY --from=build /app /app
ENV PYTHONPATH=/usr/local/lib/python3.12/site-packages
USER nonroot
EXPOSE 8000
ENTRYPOINT ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# --- CI checks ---
# trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 myapp:latest
# trivy config --severity HIGH,CRITICAL ./infra          # Terraform, K8s, Dockerfile
# checkov -d ./infra --compact --quiet
#
# --- OPA / Conftest policy for Terraform plans: policy/s3.rego ---
# package main
# deny[msg] {
#   r := input.resource_changes[_]
#   r.type == "aws_s3_bucket_public_access_block"
#   r.change.after.block_public_policy == false
#   msg := sprintf("%s must block public policies", [r.address])
# }
# terraform plan -out tf.plan && terraform show -json tf.plan > plan.json && conftest test plan.json`,
      ex: "Take a Dockerfile from one of your projects. Scan the image with Trivy and record the vulnerability count, then rebuild it as a multi-stage, non-root, slim or distroless image and scan again. Run Checkov or <code>trivy config</code> on some Terraform or Kubernetes YAML, fix three findings, and write one Conftest policy that blocks a misconfiguration you care about.",
      q: ["Why do distroless or slim base images improve security?", ["They encrypt the container", "Fewer packages means fewer vulnerabilities to patch and fewer tools an attacker can use after getting in", "They run as root by default", "They disable networking"], 1, "Every package is potential attack surface. Without a shell or package manager, post-exploitation is much harder too."]
    }
  ]
});

COURSE.push({
  n: 43, id: "soc-lessons", fills: "soc", title: "Security operations and monitoring", level: 2,
  blurb: "How a SOC detects, triages and escalates threats.",
  lessons: [
    {
      t: "How a SOC works",
      sub: ["SOC tiers and roles", "The alert lifecycle", "Shifts, handovers and playbooks", "Key metrics: MTTD and MTTR"],
      body: `<p>A <b>security operations centre</b> (SOC) is the team that monitors an organisation's systems around the clock, detects threats and coordinates the response. SOC analyst is one of the most common entry points into cybersecurity.</p>
<p>A typical structure:</p>
<ul><li><b>Tier 1 analysts</b> watch the alert queue, triage alerts against playbooks, close false positives and escalate real issues.</li>
<li><b>Tier 2</b> (incident responders) investigate escalated cases in depth, scope impact and contain threats.</li>
<li><b>Tier 3</b> (threat hunters, detection engineers) proactively hunt for threats that evaded alerts and build and tune detections.</li>
<li>A <b>SOC manager</b> runs operations, metrics and reporting. Many companies outsource part of this to an MSSP or MDR provider.</li></ul>
<p>The <b>alert lifecycle</b>: a detection fires → the alert enters the queue with a severity → an analyst triages (true or false positive? how serious?) → it's closed with notes, or escalated into an incident → the incident is contained and resolved → lessons feed back into tuning detections.</p>
<p>Because SOCs run 24/7, <b>handovers</b> between shifts matter: open cases, what's been tried, what to watch. <b>Playbooks</b> (runbooks) give step-by-step responses for common alerts (phishing reported, malware detected, impossible-travel login), so any analyst handles them consistently. SOAR platforms automate the repetitive steps.</p>
<p>Key metrics: <b>MTTD</b> (mean time to detect: from the start of malicious activity to an alert), <b>MTTR</b> (mean time to respond or resolve), alert volume per analyst, and false-positive rate per detection, which shows where tuning effort pays off most.</p>`,
      lang: "markdown",
      code: `## Playbook: "Impossible travel" sign-in alert

**Trigger:** same user signs in from two locations too far apart for the time between them
**Severity:** Medium (High if admin account)

### Triage (Tier 1, target 15 min)
1. Open the user's sign-in log for the last 24 h (IdP / SIEM).
2. Check both IPs: corporate VPN or known cloud egress? Known travel? Mobile carrier?
3. Was MFA satisfied on the unusual sign-in? Which method?
4. Any risky follow-up actions: new MFA device, mailbox forwarding rule, OAuth app consent,
   mass downloads?
5. Contact the user through a known channel (not by replying to email).

### Decide
- Explained (VPN, travel confirmed) -> close as benign, note the evidence, tune if recurring.
- Unexplained or risky follow-up actions -> escalate to Tier 2 as a suspected account compromise.

### Containment (Tier 2)
- Revoke sessions and refresh tokens; reset password; remove unknown MFA methods.
- Remove malicious inbox rules and OAuth grants; block the source IP.
- Search for the same IP across other accounts.

### Shift handover note (template)
| Case | Status | Done so far | Next step | Owner |
|------|--------|-------------|-----------|-------|
| #4821 impossible travel, r.mehta | Waiting on user | sessions revoked | confirm travel | night shift |`,
      ex: "Write playbooks for three common SOC alerts: a user-reported phishing email, a malware detection on a laptop and a burst of failed logins against one account. Each should have triage steps, decision criteria, containment actions and what to record. Then define how you would measure MTTD and MTTR for your SOC.",
      q: ["What is the main job of a Tier 1 SOC analyst?", ["Writing new malware", "Triaging incoming alerts, closing false positives with notes and escalating real threats", "Managing the company budget", "Designing the network"], 1, "Tier 1 handles the alert queue using playbooks so deeper investigation time goes to genuine incidents."]
    },
    {
      t: "Logs and SIEM",
      sub: ["Log sources: OS, network, cloud, application", "SIEM concepts (Splunk, Elastic, Wazuh)", "Normalising and enriching logs", "Retention"],
      body: `<p>Detection is only as good as the data you collect. Key <b>log sources</b>:</p>
<ul><li><b>Identity</b>: sign-ins, MFA events, admin changes (Entra ID / Azure AD, Okta, Google Workspace). Often the most valuable source.</li>
<li><b>Endpoints</b>: Windows Security event logs (4624 logon, 4625 failed logon, 4688 process creation, 4720 user created), Sysmon, Linux auth logs and auditd, EDR telemetry.</li>
<li><b>Network</b>: firewall, VPN, DNS, proxy and Zeek logs.</li>
<li><b>Cloud</b>: CloudTrail, Azure Activity, GCP Audit logs, GuardDuty findings.</li>
<li><b>Applications</b>: auth events, admin actions, errors and access to sensitive data, logged in structured JSON.</li></ul>
<p>A <b>SIEM</b> (security information and event management) collects logs from everywhere, makes them searchable, correlates events and raises alerts. Common platforms: <b>Splunk</b>, <b>Microsoft Sentinel</b>, <b>Elastic Security</b>, Google SecOps, and the open-source <b>Wazuh</b>, which is excellent for learning.</p>
<p><b>Normalising</b> maps different formats to common field names (for example the Elastic Common Schema: <code>source.ip</code>, <code>user.name</code>, <code>event.outcome</code>), so one query or rule works across sources. <b>Enriching</b> adds context at ingest: geolocation and reputation of IPs, the asset's owner and criticality, the user's department. Analysts triage much faster with context already attached.</p>
<p><b>Retention</b> balances cost against investigation needs and regulation. A common pattern is 30–90 days "hot" and searchable, and a year or more in cheap archive storage. Incidents are often discovered months after they start, so short retention can leave you blind. Check legal requirements too; in India, CERT-In's 2022 directions require many organisations to keep ICT system logs for 180 days.</p>`,
      lang: "text",
      code: `Same event, three raw formats -> one normalised record

Linux /var/log/auth.log
  Oct 18 10:42:01 web01 sshd[2211]: Failed password for invalid user admin from 203.0.113.77 port 52114 ssh2

Windows Security log (Event ID 4625)
  An account failed to log on. Account Name: admin  Source Network Address: 203.0.113.77  Logon Type: 10

Okta System Log (JSON)
  {"eventType":"user.session.start","outcome":{"result":"FAILURE"},"client":{"ipAddress":"203.0.113.77"},
   "actor":{"alternateId":"admin@corp.com"}}

Normalised (ECS-style) after parsing + enrichment
  @timestamp        2026-10-18T05:12:01Z
  event.category    authentication
  event.outcome     failure
  user.name         admin
  source.ip         203.0.113.77
  source.geo.country_iso_code  NL            <- enrichment
  threat.indicator.matched     true          <- IP on a threat intel list
  host.name         web01
  asset.criticality high                     <- from the asset inventory

Queries over the normalised data
  Splunk:   index=auth event.outcome=failure | stats count by source.ip, user.name | where count > 20
  KQL:      SigninLogs | where ResultType != 0 | summarize count() by IPAddress, UserPrincipalName
  Elastic:  event.category:authentication and event.outcome:failure and source.ip:203.0.113.77`,
      ex: "Deploy Wazuh with Docker (the single-node compose file), enrol a Linux VM or container as an agent, and generate events: failed SSH logins, a new user, a sudo command, a modified file in /etc. Find each event in the dashboard, note which fields it was normalised into, and write one search query per event.",
      q: ["Why do SIEMs normalise logs into common field names?", ["To compress them", "So one search or detection rule works across many different log sources", "Because raw logs can't be stored", "To delete duplicate events"], 1, "A rule for 'failed logins from one IP' should match Linux, Windows and cloud identity logs alike. Normalisation makes that possible."]
    },
    {
      t: "Writing detections",
      sub: ["Detection logic and thresholds", "Sigma rules", "Mapping to MITRE ATT&CK", "Reducing false positives"],
      body: `<p>A <b>detection</b> is a query that runs on a schedule or in real time and raises an alert when it matches. Good detections target <b>attacker behaviour</b> rather than single values that change easily. An IP address is trivial for an attacker to swap; "a new mailbox rule forwarding all mail to an external domain" describes what they want to achieve.</p>
<p>Common detection logic patterns:</p>
<ul><li><b>Single event</b>: an audit log was cleared; a user was added to Domain Admins.</li>
<li><b>Threshold</b>: more than 20 failed logins for one account in 5 minutes. Pick thresholds from your baseline data, not guesses.</li>
<li><b>Sequence or correlation</b>: many failures followed by a success from the same IP (a password guessed).</li>
<li><b>Anomaly</b>: first time a user signs in from a country, or a process never seen before on servers.</li></ul>
<p><b>Sigma</b> is an open, vendor-neutral format for detection rules written in YAML. You write a rule once and convert it into Splunk, Sentinel KQL, Elastic and other query languages with <code>sigma-cli</code>. Thousands of community rules are on GitHub (SigmaHQ).</p>
<p>Tag each rule with <b>MITRE ATT&amp;CK</b> techniques. Mapping your rules onto the ATT&amp;CK matrix shows coverage and gaps, and helps prioritise which behaviours to detect next.</p>
<p><b>Reducing false positives</b>: test new rules against 30 days of historical data before enabling them; add precise exclusions (a named service account, a known scanner) rather than broad ones; enrich alerts so triage is fast; and review each rule's true-positive rate regularly. Treat detections like code: version-controlled, peer-reviewed and tested.</p>`,
      lang: "yaml",
      code: `title: Suspicious inbox forwarding rule to an external domain
id: 6f1c2b77-3d1e-4c0a-9a3b-6b2f1c9e2a10
status: experimental
description: Detects a new mailbox rule that forwards or redirects mail outside the organisation,
  a common step after an account is taken over.
references:
  - https://attack.mitre.org/techniques/T1114/003/
author: Forge Academy
date: 2026/10/18
tags:
  - attack.collection
  - attack.t1114.003          # Email Collection: Email Forwarding Rule
logsource:
  product: m365
  service: exchange
detection:
  selection:
    Operation:
      - New-InboxRule
      - Set-InboxRule
  forwarding:
    Parameters|contains:
      - 'ForwardTo'
      - 'RedirectTo'
      - 'ForwardAsAttachmentTo'
  internal:
    Parameters|contains: '@corp.example.com'
  condition: selection and forwarding and not internal
falsepositives:
  - Users forwarding to their own personal mailbox (should be blocked by policy anyway)
level: high

# Convert to your SIEM's language:
#   pip install sigma-cli && sigma plugin install splunk microsoft365defender
#   sigma convert -t splunk forwarding_rule.yml
#   sigma convert -t kusto  forwarding_rule.yml`,
      ex: "In your Wazuh or Elastic lab, write three detections: a threshold rule for SSH brute force, a single-event rule for a new user being added to the sudo group, and a correlation rule for a successful login after more than 10 failures. Write each also as a Sigma rule with ATT&amp;CK tags, generate test events, and record the true and false positives over a day of normal lab use.",
      q: ["Why are behaviour-based detections generally better than detections on a single bad IP address?", ["They're shorter to write", "Attackers can change IPs easily, but they still need to perform the behaviour (like creating forwarding rules) to achieve their goal", "IP addresses aren't logged", "SIEMs can't search IPs"], 1, "Indicators like IPs and hashes are cheap for attackers to change. Behaviours are tied to their objectives and are much harder to avoid."]
    },
    {
      t: "Alert triage and threat intelligence",
      sub: ["Triage questions", "Indicators of compromise", "Threat intel feeds", "Escalation and documentation"],
      body: `<p><b>Triage</b> decides quickly whether an alert is real and how urgent it is. Work through the same questions every time:</p>
<ol><li><b>What</b> exactly fired, and what does the rule look for?</li>
<li><b>Who and what</b> is involved: which user, host, IP? How critical are they (an admin, a domain controller, a payment server)?</li>
<li><b>Is it expected?</b> Known change window, IT activity, a scanner, the user's normal behaviour?</li>
<li><b>What happened before and after</b> on that host or account? Related alerts?</li>
<li><b>Verdict and severity</b>: true positive, benign true positive (real but authorised), or false positive; and how bad.</li></ol>
<p><b>Indicators of compromise</b> (IOCs) are artefacts that suggest malicious activity: file hashes, IPs, domains, URLs, email senders, registry keys. The "pyramid of pain" ranks them: hashes and IPs are easy for attackers to change; tools and behaviours (TTPs) are hard. Use IOCs to search your environment quickly, but rely on behaviour for durable detection.</p>
<p><b>Threat intelligence</b> adds context: is this IP a known malicious host? Which group uses this technique? Free and community sources include VirusTotal, AbuseIPDB, AlienVault OTX, abuse.ch (URLhaus, MalwareBazaar), CISA advisories and, in India, CERT-In advisories. Platforms like MISP share and manage intel. Intel feeds enrich alerts automatically and drive hunts ("search the last 90 days for these domains").</p>
<p><b>Document</b> every alert, even false positives: what you checked, the evidence, the verdict and why. Escalate with a clear summary: what happened, affected assets, timeline so far, actions already taken, and what you need. Good notes make handovers, later investigations and detection tuning possible.</p>`,
      lang: "python",
      code: `# Enrich an alert's indicators with free threat intel APIs (keys from your own accounts)
import os, requests

VT = os.environ["VT_API_KEY"]
ABUSE = os.environ["ABUSEIPDB_KEY"]

def ip_reputation(ip):
    r = requests.get("https://api.abuseipdb.com/api/v2/check",
                     headers={"Key": ABUSE, "Accept": "application/json"},
                     params={"ipAddress": ip, "maxAgeInDays": 90}, timeout=10).json()["data"]
    return {"ip": ip, "abuse_score": r["abuseConfidenceScore"], "country": r["countryCode"],
            "reports": r["totalReports"], "isp": r["isp"]}

def file_reputation(sha256):
    r = requests.get(f"https://www.virustotal.com/api/v3/files/{sha256}",
                     headers={"x-apikey": VT}, timeout=10)
    if r.status_code == 404:
        return {"sha256": sha256, "known": False}
    stats = r.json()["data"]["attributes"]["last_analysis_stats"]
    return {"sha256": sha256, "malicious": stats["malicious"], "undetected": stats["undetected"]}

alert = {"id": 4821, "rule": "Brute force then success", "user": "r.mehta",
         "src_ip": "203.0.113.77", "file": None}
print(ip_reputation(alert["src_ip"]))

# Triage note template
NOTE = """Alert {id}: {rule}
Entities: user={user}, src_ip={src_ip} (abuse score {score}, {country})
Checked: sign-in history 24h, MFA result, follow-up actions, other users from same IP
Verdict: TRUE POSITIVE - password guessed, MFA push approved by user at 02:14
Actions: sessions revoked, password reset, IP blocked; escalated to IR as INC-311
"""`,
      ex: "Take five indicators from a recent public CISA or CERT-In advisory (IPs, domains, hashes). Write a script that enriches each one with VirusTotal and AbuseIPDB (free accounts), then search your Wazuh or Elastic lab for them. Finally, write a full triage note for one simulated alert using the five triage questions.",
      q: ["In the 'pyramid of pain', why are TTPs (tactics, techniques and procedures) at the top?", ["They're the easiest indicators to collect", "They're the hardest for attackers to change, so detecting them causes attackers the most difficulty", "They never produce false positives", "They're only used by nation states"], 1, "Changing a hash or IP is trivial. Changing how you operate means new tools, skills and infrastructure."]
    }
  ]
});
