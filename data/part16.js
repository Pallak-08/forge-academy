/* Forge Academy lessons: incident response, governance risk and compliance, career */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 44, id: "incident-response-lessons", fills: "incident-response", title: "Incident response and forensics basics", level: 3,
  blurb: "Handling security incidents calmly, preserving evidence and communicating well.",
  lessons: [
    {
      t: "The incident response lifecycle",
      sub: ["Preparation", "Detection and analysis", "Containment, eradication, recovery", "Lessons learned"],
      body: `<p>The widely used NIST incident response lifecycle (SP 800-61) has four phases. Real incidents loop between them, but the structure keeps a stressful situation organised.</p>
<p><b>1. Preparation</b> happens before anything goes wrong, and decides how well everything else goes: an incident response plan with roles and contacts; playbooks for likely scenarios (ransomware, account takeover, data leak); logging already in place with enough retention; tested, offline or immutable backups; an out-of-band communication channel in case email or chat is compromised; and practice through tabletop exercises.</p>
<p><b>2. Detection and analysis</b>: confirm it's a real incident, decide severity, and <b>scope</b> it: which systems, accounts and data are affected, when did it start, how did they get in? Start a timeline and an evidence log immediately.</p>
<p><b>3. Containment, eradication and recovery</b>. <b>Contain</b> to stop the spread while preserving evidence: isolate hosts with EDR rather than wiping them, disable compromised accounts, revoke sessions and keys, block malicious domains. <b>Eradicate</b> the root cause: remove malware and persistence, patch the exploited vulnerability, rotate every credential that may be exposed. <b>Recover</b>: restore from clean backups, rebuild rather than "clean" badly compromised systems, return to service in stages with extra monitoring.</p>
<p><b>4. Lessons learned</b>: within about two weeks, hold a <b>blameless</b> review: what happened, what went well, what didn't, and concrete actions with owners and dates (new detections, hardening, playbook updates). Incidents that don't produce improvements tend to happen again.</p>`,
      lang: "markdown",
      code: `## Incident severity matrix (example)

| Severity | Examples | Response |
|----------|----------|----------|
| SEV1 Critical | Ransomware spreading; confirmed customer data exfiltration; production down by attack | Page IR lead + CISO now; war room; exec updates hourly |
| SEV2 High | Admin account compromised; malware on a server; public bucket with personal data | IR lead within 30 min; updates every 4 h |
| SEV3 Medium | Single laptop malware contained by EDR; phishing with credentials entered (MFA held) | Next business hours; ticket |
| SEV4 Low | Blocked phishing; policy violation | Normal queue |

## First 60 minutes checklist (SEV1/SEV2)
- [ ] Declare the incident, assign an incident commander, open a channel (out-of-band if needed)
- [ ] Start the timeline and evidence log (UTC timestamps)
- [ ] Scope: affected hosts, accounts, data; patient zero; still active?
- [ ] Contain without destroying evidence: EDR isolate, disable accounts, revoke tokens/keys
- [ ] Preserve: memory/disk images of key hosts, export relevant logs before they roll over
- [ ] Decide notifications: legal, leadership, regulators (CERT-In: 6 hours), customers
- [ ] Schedule the next update

## Lessons-learned questions (blameless)
1. How and when did we detect it? Could we have detected it earlier?
2. What slowed containment?
3. Which control, if it had existed, would have prevented or limited this?
4. Actions: owner + due date for each`,
      ex: "Run a tabletop exercise (alone or with friends): a ransomware note appears on three file servers on a Friday evening. Walk through all four phases, writing down decisions, who you'd call, what evidence you'd preserve, how you'd recover and what you'd notify. Finish with a lessons-learned list of five actions with owners.",
      q: ["Why isolate a compromised machine (for example with EDR network isolation) rather than immediately wiping it?", ["Wiping is too slow", "Isolation stops the spread while preserving evidence needed to understand how the attacker got in and what they did", "Wiping is illegal", "Isolation removes the malware"], 1, "Without evidence you may miss the entry point and other compromised systems, and the attacker comes back."]
    },
    {
      t: "Evidence and investigation",
      sub: ["Order of volatility", "Preserving evidence", "Timelines", "Chain of custody"],
      body: `<p>Digital evidence disappears easily: rebooting clears memory, logs roll over, attackers delete traces. Collect it in the <b>order of volatility</b>, most fleeting first:</p>
<ol><li>CPU state and memory (running processes, network connections, decrypted data, malware that only lives in RAM).</li>
<li>Network state: active connections, ARP and routing tables.</li>
<li>Running processes and logged-in users.</li>
<li>Disk contents.</li>
<li>Remote logs (SIEM, cloud audit logs) and backups, which last longest but can still expire.</li></ol>
<p><b>Preserving evidence</b>: capture memory with a tool such as WinPmem or AVML (Linux); take forensic disk images (or cloud volume snapshots) instead of examining the original; compute <b>hashes</b> (SHA-256) of every image and file at collection time so you can later prove nothing changed; work only on copies, mounted read-only. Export logs from systems where they might be overwritten. In the cloud, snapshot volumes and copy relevant audit logs to a locked bucket before you terminate anything.</p>
<p>A <b>timeline</b> is the backbone of every investigation: all relevant events from all sources, in UTC, in order. It answers how they got in, what they did, when, and whether they're still there. Tools such as Plaso/log2timeline and Timesketch build "super timelines" from many artefacts.</p>
<p><b>Chain of custody</b> records who collected each piece of evidence, when, how, its hash, and every person who handled it afterwards. If an incident may lead to legal action or law enforcement involvement, an unbroken chain is what makes evidence usable. Involve legal counsel early in serious incidents.</p>`,
      lang: "bash",
      code: `# Linux live response on a suspected host (run from trusted tools on a USB/share, write to external storage)
CASE=INC-311; OUT=/mnt/evidence/$CASE/$(hostname); mkdir -p "$OUT"
date -u +%FT%TZ > "$OUT/collected_at_utc.txt"

# 1. Memory first (AVML: https://github.com/microsoft/avml)
sudo ./avml "$OUT/memory.lime"

# 2. Network state, processes, users
ss -tanp            > "$OUT/connections.txt"
ip neigh; ip route  > "$OUT/net_tables.txt"
ps auxwwf           > "$OUT/processes.txt"
who -a; last -Faiw  > "$OUT/logins.txt"
sudo ls -la /proc/*/exe 2>/dev/null > "$OUT/proc_exe.txt"   # binaries behind running processes
crontab -l; ls -la /etc/cron* /etc/systemd/system > "$OUT/persistence.txt" 2>&1

# 3. Logs before they rotate
sudo tar czf "$OUT/varlog.tgz" /var/log
sudo journalctl --since "-14 days" -o json > "$OUT/journal.json"

# 4. Hash everything collected
( cd "$OUT" && sha256sum * > SHA256SUMS )

# Cloud: snapshot the volume instead of imaging the disk
# aws ec2 create-snapshot --volume-id vol-0abc --description "$CASE web01 evidence"

# Chain-of-custody log (one line per transfer)
# item, sha256, collected_by, collected_at_utc, transferred_to, transferred_at_utc, purpose`,
      ex: "On a lab VM, simulate a small compromise yourself (add a new user, a cron job that calls out to a URL you own, and a suspicious file in /tmp). Then act as the responder: collect volatile data and logs in order of volatility, hash everything, build a timeline of the 'attack' from the evidence alone, and fill in a chain-of-custody record.",
      q: ["Why should memory be captured before shutting down a compromised machine?", ["Shutting down is faster afterwards", "RAM holds running processes, network connections and memory-only malware that are lost when power is removed", "Disks can't be imaged after shutdown", "It's a legal requirement in every country"], 1, "Memory is the most volatile evidence. Some malware never touches disk, so RAM may be the only place it can be found."]
    },
    {
      t: "Communication during incidents",
      sub: ["Roles: incident commander, comms, scribe", "Stakeholder updates", "Regulatory notification", "Post-incident reports"],
      body: `<p>Incidents fail as often through poor communication as through technical mistakes: duplicated work, conflicting messages, leadership surprised by the news. Assign clear <b>roles</b> at the start:</p>
<ul><li><b>Incident commander</b> (IC): coordinates, makes decisions, sets priorities. The IC doesn't do hands-on technical work, so they can keep the big picture.</li>
<li><b>Technical leads</b>: investigate and contain, reporting findings to the IC.</li>
<li><b>Communications lead</b>: drafts internal and external messages and handles stakeholders, so engineers aren't interrupted constantly.</li>
<li><b>Scribe</b>: keeps the timeline of decisions, actions and findings with timestamps. That record becomes the basis of the report.</li></ul>
<p><b>Stakeholder updates</b> go out on a fixed rhythm (for example every hour for SEV1), even if there's no news. A good update covers: current status and impact, what we know and what we don't, actions taken, next steps and the time of the next update. Be factual and avoid speculation. Use an out-of-band channel if the attacker may be reading email or chat.</p>
<p><b>Regulatory notification</b> has legal deadlines. In India, CERT-In's 2022 directions require reporting specified cyber incidents within <b>6 hours</b> of noticing them, and the DPDP Act requires notifying the Data Protection Board and affected people of personal data breaches. GDPR requires notifying the authority within 72 hours. Check current rules with legal counsel, and know these deadlines before you need them.</p>
<p>The <b>post-incident report</b> records the summary, impact, a detailed timeline, root cause and contributing factors, what went well and badly in the response, and action items with owners. Write it <b>blamelessly</b>: focus on systems and processes, not on who made a mistake, so people report problems honestly next time.</p>`,
      lang: "markdown",
      code: `## Stakeholder update #3 - INC-311 (SEV2)  - 14:00 IST, 18 Oct 2026

**Status:** Contained. Investigation ongoing.
**Impact:** One employee mailbox accessed by an unauthorised party between 02:14 and 09:40 IST.
No evidence so far of access to other systems or customer databases.

**What we know**
- Password guessed after a credential-stuffing burst; user approved an MFA push at 02:14.
- Attacker created an inbox rule forwarding invoices to an external address.

**What we don't know yet**
- Whether any forwarded email contained customer personal data (review in progress, ETA 18:00).

**Actions taken**
- Sessions revoked, password reset, MFA switched to number matching; forwarding rule removed.
- Attacker IP blocked; same IP checked against all accounts (no other successful logins).

**Next steps**
- Complete mailbox content review; decide on DPDP / customer notification with Legal by 19:00.
- Enforce phishing-resistant MFA for finance team this week.

**Next update:** 18:00 IST, or sooner if the situation changes.
IC: P. Khullar  |  Comms: R. Iyer  |  Scribe: A. Shah`,
      ex: "Using your tabletop scenario from the first lesson, write: the role assignments, three stakeholder updates at different stages, a draft regulatory notification checklist (what information CERT-In and the Data Protection Board would need), and a two-page blameless post-incident report with a timeline and five action items.",
      q: ["Why should the incident commander avoid doing hands-on technical work during a major incident?", ["They usually lack technical skills", "Coordinating, prioritising and keeping the big picture is a full-time job; getting absorbed in one task leaves the response leaderless", "It's against compliance rules", "Technical work isn't logged"], 1, "The IC's value is coordination and decisions. Deep technical work belongs to the technical leads."]
    }
  ]
});

COURSE.push({
  n: 45, id: "grc-lessons", fills: "grc", title: "Governance, risk and compliance", level: 2,
  blurb: "Managing security risk, writing policies and preparing for audits.",
  lessons: [
    {
      t: "Risk management",
      sub: ["Identifying and scoring risk", "Risk registers", "Treat, transfer, accept, avoid", "Third-party risk"],
      body: `<p>No organisation can fix everything, so security spending follows <b>risk</b>. Risk management is a repeatable process: identify risks, assess them, decide how to treat each, and monitor them over time.</p>
<p><b>Identifying</b> risks: start from assets (customer data, the payments system, source code, key people), then ask what threats could affect each and which weaknesses make that possible. Sources include threat models, audit findings, incidents, vulnerability scans and conversations with teams.</p>
<p><b>Scoring</b>: most teams use a qualitative 5×5 matrix of <b>likelihood</b> (rare to almost certain) and <b>impact</b> (negligible to severe, defined in business terms such as money, legal exposure, customers affected, downtime). Define the scales in writing so different people score consistently. Quantitative methods (like FAIR) estimate ranges of financial loss when decisions need money figures.</p>
<p>A <b>risk register</b> tracks each risk: description, owner (a business owner, not only the security team), inherent score, existing controls, residual score, treatment decision, actions and review date.</p>
<p>Four <b>treatment</b> options: <b>mitigate</b> (add controls to reduce likelihood or impact); <b>transfer</b> (insurance, or contracting to a provider, though accountability remains with you); <b>accept</b> (formally, by someone with the authority, when the cost of treating exceeds the risk); <b>avoid</b> (stop the risky activity entirely).</p>
<p><b>Third-party risk</b>: vendors with access to your data or systems extend your attack surface. Assess them proportionally: questionnaires and certifications (SOC 2, ISO 27001) for critical vendors, contract clauses on security and breach notification, minimal data sharing and periodic review.</p>`,
      lang: "text",
      code: `RISK REGISTER (excerpt)                                  Likelihood x Impact (1-5)

ID   Risk                                    Owner        Inherent  Existing controls          Residual  Treatment   Action / due
R-01 Ransomware encrypts file servers and    COO          4x5=20    EDR on 80% of hosts,       3x5=15    Mitigate    EDR to 100% (Nov);
     backups                                                        nightly backups (online)                         immutable backups (Dec)
R-02 Customer data leaked via public bucket  CTO          3x5=15    Block Public Access on     1x5=5     Accept      Quarterly CSPM review
                                                                    all accounts, CSPM alerts
R-03 Payroll vendor breached, staff PII      HR head      3x4=12    Vendor SOC 2 report        2x4=8     Transfer +  Breach clause + cyber
     exposed                                                                                             mitigate    insurance renewal (Jan)
R-04 Legacy FTP server with known flaws      IT manager   4x4=16    None                       -         Avoid       Decommission by 30 Nov
R-05 Key engineer leaves; nobody can run     CTO          3x3=9     Partial runbooks           2x3=6     Mitigate    Runbooks + 2nd on-call
     deploys

Impact scale (defined in writing)
  5 Severe: > Rs 5 crore loss, regulatory action, > 10,000 customers affected, > 2 days outage
  3 Moderate: Rs 10 lakh - 1 crore, < 1,000 customers, < 8 hours outage
  1 Negligible: < Rs 1 lakh, no customer impact`,
      ex: "Pick a real or imaginary 50-person company (a food delivery startup works well). Write impact and likelihood scales in business terms, identify ten risks, build a register with owners, inherent and residual scores and a treatment for each, and justify one 'accept' decision in a short paragraph addressed to the CEO.",
      q: ["A company buys cyber insurance for ransomware. Which treatment is this?", ["Avoid", "Accept", "Transfer", "Ignore"], 2, "Insurance transfers part of the financial impact to the insurer. The company still owns the risk and must still have controls, often required by the insurer."]
    },
    {
      t: "Policies and controls",
      sub: ["Writing security policies", "Control frameworks", "Security awareness training", "Access reviews"],
      body: `<p>A <b>policy</b> states what the organisation requires and why; <b>standards</b> give the specific rules (passwords must be at least 12 characters, MFA required); <b>procedures</b> describe how to do something step by step. Keep policies short, readable and owned, with an approver and a review date. A 40-page policy nobody reads protects nothing.</p>
<p>A typical small-company policy set: information security policy (the umbrella), acceptable use, access control, data classification and handling, incident response, business continuity and backup, vendor management, secure development, and asset management. Write them to match what you actually do, then improve both together. Auditors check that practice matches policy.</p>
<p><b>Control frameworks</b> supply a structured list of controls so nothing important is missed: ISO 27001 Annex A (93 controls in four themes), NIST CSF, CIS Controls (a prioritised list; Implementation Group 1 is a good baseline for small organisations) and SOC 2 criteria. Map each control to an owner, how it operates and what evidence it produces. A single control often satisfies several frameworks.</p>
<p><b>Security awareness training</b> works when it's short, frequent, relevant and positive: onboarding training, short refreshers, realistic phishing simulations followed by instant feedback (not public shaming), and a one-click way to report suspicious messages. Measure the report rate, not just the click rate.</p>
<p><b>Access reviews</b>: people accumulate access as they change roles, and leavers' accounts linger. Each quarter, managers or system owners review who has access to critical systems and remove what's not needed; offboarding should revoke access on the last day automatically through the identity provider.</p>`,
      lang: "markdown",
      code: `# Access Control Policy (excerpt)

**Owner:** Head of IT  |  **Approved by:** CEO  |  **Version:** 1.2  |  **Review:** Oct 2027

## Purpose
Ensure only authorised people can access company systems and data, with the minimum access needed.

## Policy
1. All access is granted through the company identity provider (SSO) where the system supports it.
2. MFA is required for all accounts; phishing-resistant MFA for administrators and finance.
3. Access follows least privilege and is approved by the system owner.
4. Administrator rights use separate admin accounts, not daily accounts.
5. Access to Confidential systems is reviewed quarterly by the system owner.
6. Leavers' access is revoked on their last working day; movers' old access within 5 working days.
7. Shared accounts are prohibited unless approved, stored in the password manager and logged.

## Evidence (for audit)
- IdP MFA enforcement report (monthly)
- Quarterly access review sign-offs per Confidential system
- HR leaver list reconciled with IdP deactivations (monthly)

## Exceptions
Requested in writing, approved by the Head of IT, time-limited, recorded in the exception register.`,
      ex: "Write three short policies for a small company: acceptable use, access control and incident response, each under two pages with owner, review date and evidence. Then run a mock quarterly access review: export the members of a GitHub organisation or Google Workspace group you manage (or invent a list), flag anyone who shouldn't have access and record the decisions.",
      q: ["What do auditors mainly check about policies?", ["That they are long", "That actual practice matches what the policy says, with evidence", "That they use legal language", "That they mention every framework"], 1, "A policy is a commitment. Audits test whether the organisation actually operates the controls it describes."]
    },
    {
      t: "Audits and certifications",
      sub: ["Preparing for an audit", "Evidence collection", "ISO 27001 and SOC 2 journeys", "Security certifications for your career (Security+, CySA+)"],
      body: `<p>Companies pursue <b>ISO 27001</b> certification or a <b>SOC 2</b> report mainly because customers require them, especially enterprise buyers. A typical first journey takes 6–12 months:</p>
<ol><li><b>Scope</b>: which products, teams and locations are included.</li>
<li><b>Gap assessment</b> against the standard: what exists, what's missing.</li>
<li><b>Remediate</b>: write policies, implement missing controls, start collecting evidence.</li>
<li>For ISO 27001: a risk assessment, Statement of Applicability, internal audit and management review, then a two-stage certification audit, followed by yearly surveillance audits.</li>
<li>For SOC 2: often a Type I (design at a point in time), then a Type II covering an observation period of 3–12 months.</li></ol>
<p><b>Evidence collection</b> is most of the work: screenshots and exports showing controls operating (MFA reports, access review sign-offs, backup restore tests, vulnerability scan results, training completion, change approvals). Collect evidence continuously, store it in an organised way per control and period, and automate wherever possible. Compliance automation platforms (Vanta, Drata, Sprinto) pull much of it from cloud and HR systems directly.</p>
<p>During the audit: answer exactly what's asked, provide evidence promptly, don't guess, and treat findings as improvement opportunities.</p>
<p>For your <b>career</b>, certifications help you get past résumé filters, especially in security. Common entry points: <b>CompTIA Security+</b> (broad fundamentals, widely requested), <b>ISC2 Certified in Cybersecurity (CC)</b> (beginner level), <b>CompTIA CySA+</b> or vendor SOC certifications for analyst roles, and cloud security certifications later (AWS Security Specialty, Microsoft SC-200). Pair certifications with hands-on labs and a portfolio; together they beat either alone.</p>`,
      lang: "text",
      code: `Evidence folder structure (one folder per control, per period)

compliance/
├── scope.md                         # in-scope systems, teams, locations
├── risk-assessment-2026.xlsx
├── statement-of-applicability.xlsx  # ISO: which Annex A controls apply and why
├── policies/                        # approved PDFs with version and date
└── evidence/
    ├── AC-1_mfa-enforced/
    │   ├── 2026-07_idp-mfa-report.csv
    │   ├── 2026-08_idp-mfa-report.csv
    │   └── 2026-09_idp-mfa-report.csv
    ├── AC-2_quarterly-access-review/
    │   └── 2026-Q3_signed-review-github-aws-db.pdf
    ├── BK-1_backup-restore-test/
    │   └── 2026-09-14_restore-test-log.md
    ├── VM-1_vulnerability-scans/
    │   └── 2026-09_scan-summary-and-tickets.pdf
    └── HR-2_security-training/
        └── 2026-Q3_completion-report.csv

Typical auditor requests (SOC 2 Type II)
  "Provide the population of new hires in the period and evidence of training for a sample of 5."
  "Provide a list of production changes and approvals for a sample of 10."
  "Show the leaver list and evidence of access removal within the SLA for a sample of 5."

Career certification path (security)
  Start:   ISC2 CC  or  CompTIA Security+
  Analyst: CompTIA CySA+  /  Microsoft SC-200  /  Splunk Core User
  Cloud:   AWS Security Specialty  /  Azure AZ-500
  + always: home lab, write-ups, GitHub portfolio`,
      ex: "Do a mini gap assessment of your own project or club website against ten CIS Controls IG1 safeguards: for each, note the current state, the gap, the fix and the evidence you'd show an auditor. Then pick one certification from the career path, find its official exam objectives, and map each domain to Forge Academy modules you've done or plan to do.",
      q: ["What's the key difference in evidence between a SOC 2 Type I and Type II audit?", ["Type II doesn't need evidence", "Type II requires evidence that controls operated throughout an observation period, often checked by sampling", "Type I covers more controls", "They need the same evidence"], 1, "Type II proves sustained operation, so auditors sample activity (hires, changes, leavers) across months."]
    }
  ]
});

COURSE.push({
  n: 46, id: "career-lessons", fills: "career", title: "Portfolio, interviews and getting hired", level: 1,
  blurb: "Turning skills into interviews, offers and a strong first year.",
  lessons: [
    {
      t: "Building a portfolio that gets interviews",
      sub: ["Choosing 3-4 strong projects", "READMEs with screenshots and live links", "A simple portfolio site", "Writing case studies"],
      body: `<p>Recruiters and hiring managers spend about a minute on a profile. A portfolio's job is to prove, in that minute, that you can build real things in the role you're applying for.</p>
<p><b>Choose 3–4 strong projects</b> rather than fifteen tutorials. A strong project solves a real problem (for you, a club, a small business), is relevant to the target role (a dashboard for data analysts, an API with auth and tests for backend, a detection lab for SOC analysts), is <b>deployed</b> so people can try it, and shows depth beyond the tutorial: authentication, tests, error handling, CI, monitoring. One big project worked on for months beats many small clones.</p>
<p><b>READMEs</b> are where projects are judged. Include: a one-line description of what it does and for whom; a live link and a screenshot or GIF at the top; key features; the tech stack and <i>why</i> you chose it; how to run it locally in a few commands; architecture (a simple diagram); and what you'd do next. Pin the best repos on your GitHub profile.</p>
<p>A <b>simple portfolio site</b> (one page is enough) links everything: your name and target role, 3–4 project cards with screenshots and links, a short About, and contact details. Host it free on Vercel, Netlify or GitHub Pages, ideally with your own domain.</p>
<p><b>Case studies</b> show how you think: the problem, constraints, options you considered, what you built, the results (numbers if you have them: users, speed-ups, accuracy), and what you learned. Interviewers love asking about these, and a written case study means you've already rehearsed the story.</p>`,
      lang: "markdown",
      code: `# 🧾 SplitSmart: shared expenses for hostel roommates

**Live:** https://splitsmart.vercel.app  ·  **Demo login:** demo@splitsmart.app / demo1234

![Dashboard screenshot](docs/dashboard.png)

SplitSmart tracks shared expenses for groups and settles up with the fewest UPI payments.
Built for my hostel floor; now used by 3 floors (~60 people).

## Features
- Groups, expenses with uneven splits, receipts upload
- "Settle up" computes the minimum number of payments (greedy graph algorithm)
- Email + Google sign-in; group roles (owner/member)
- Monthly summary emails

## Tech stack (and why)
- **Next.js + TypeScript**: one codebase for UI and API routes, type safety
- **PostgreSQL (Supabase)**: relational data (users, groups, splits) with row-level security
- **Vitest + Playwright**: unit tests for the settle-up algorithm, end-to-end tests for key flows
- **GitHub Actions → Vercel**: tests on every PR, preview deploys

## Run locally
\`\`\`bash
git clone https://github.com/you/splitsmart && cd splitsmart
cp .env.example .env.local      # add your Supabase keys
npm install && npm run dev
\`\`\`

## Architecture
![Architecture](docs/architecture.png)

## What I learned / next
- Row-level security policies replaced 200 lines of permission checks
- Next: offline mode, recurring expenses`,
      ex: "Choose your 3 best (or planned) projects for your target role. Rewrite each README using the template above, add a screenshot or GIF and a live link, and pin them on GitHub. Build a one-page portfolio site linking all three and write a 300-word case study for the strongest one.",
      q: ["What makes a portfolio project most convincing to an employer?", ["It follows a popular tutorial exactly", "It solves a real problem, is deployed, and shows depth like auth, tests and CI, with a clear README", "It uses as many technologies as possible", "It has a long name"], 1, "Employers want evidence you can build and ship real software. A live, well-documented, tested project shows exactly that."]
    },
    {
      t: "GitHub and LinkedIn",
      sub: ["Pinned repos and profile README", "LinkedIn headline and About", "Posting about what you build", "Networking without awkwardness"],
      body: `<p>Your <b>GitHub profile</b> is a second résumé for technical roles. Pin your 4–6 best repositories (not forks of tutorials). Add a <b>profile README</b> (a repository named after your username): a two-line intro with your target role, what you're building, your main skills and how to contact you. Regular commits across real projects show consistency, but quality beats a perfectly green contribution graph.</p>
<p>On <b>LinkedIn</b>, recruiters search by keywords, so your <b>headline</b> should name the role and skills, not just "Student at X": for example "Aspiring Backend Developer | Python, FastAPI, PostgreSQL | Building SplitSmart". Use a clear photo and a simple banner. The <b>About</b> section, in 4–6 short lines: what you do, what you've built (with numbers), what you're looking for, and how to reach you. Fill in Projects and Featured with links, and list skills that match the job descriptions you're targeting.</p>
<p><b>Posting about what you build</b> is the most underrated job-search tool for students. Short posts showing a project demo, a bug you solved, or what you learned from a hackathon make recruiters and engineers notice you. Be specific, add a screenshot or short video, and keep it genuine rather than salesy. Once or twice a month is plenty.</p>
<p><b>Networking</b> works best as giving, not asking. Comment thoughtfully on posts by engineers at companies you like; join communities (local meetups, Discord servers, open-source projects, college tech clubs, hackathons); when you reach out, be specific and brief, and ask for advice rather than a job. Referrals come naturally from relationships built this way.</p>`,
      lang: "text",
      code: `LINKEDIN HEADLINE (pick a pattern)
  Aspiring [Role] | [Skill], [Skill], [Skill] | Building [Project]
  e.g. Aspiring SOC Analyst | SIEM, Wazuh, Linux, Python | Security+ | Home detection lab

ABOUT (4-6 lines)
  I'm a final-year CS student who builds backend systems with Python and PostgreSQL.
  I built SplitSmart, an expense-splitting app used by 60+ students, with Next.js, Supabase and CI/CD.
  Currently learning distributed systems and contributing to an open-source FastAPI plugin.
  Looking for backend / full-stack internships and graduate roles from June 2027.
  Projects and code: github.com/you  ·  Email: you@example.com

OUTREACH MESSAGE (short, specific, easy to answer)
  Hi Neha, I enjoyed your post on how your team moved billing to event-driven queues.
  I'm a student building a small payment-reminder service and hit the same retry problem
  you described. Could I ask one question: how did you decide on the dead-letter strategy?
  Thanks either way!

POST IDEA TEMPLATE
  Hook:    "My app took 9 seconds to load the dashboard. Now it takes 300 ms."
  Story:   what was slow, how I measured it (profiler screenshot), the fix (one index + caching)
  Lesson:  "Measure before optimising"
  Link:    repo / demo  ·  #webdev #postgres`,
      ex: "Update your GitHub profile (profile README plus pinned repos) and your LinkedIn headline, About and Featured sections using the templates. Write and publish one post about something you built or learned this month, and send two thoughtful, specific messages to engineers in roles you're aiming for.",
      q: ["Which LinkedIn headline is most likely to appear in recruiter searches for a backend role?", ["Student at XYZ College", "Aspiring Backend Developer | Python, FastAPI, PostgreSQL | Building SplitSmart", "Hardworking and passionate person", "Open to opportunities"], 1, "Recruiters search by role and skill keywords. A headline naming the role and core technologies matches those searches."]
    },
    {
      t: "Resume and applications",
      sub: ["One-page resume", "Impact bullets with numbers", "Tailoring for each role", "Referrals and tracking applications"],
      body: `<p>For students and early-career roles, keep the <b>résumé to one page</b>. Use a clean, single-column layout that applicant tracking systems (ATS) can parse: standard section headings, no tables or graphics for key content, and a PDF export. Typical order: name and links (email, phone, GitHub, LinkedIn, portfolio); education; skills; projects; experience (internships, freelance, TA roles); achievements (hackathons, competitive programming, certifications).</p>
<p>Write <b>impact bullets</b>: action verb + what you did + how (tech) + result, with numbers where possible. "Worked on the backend" says nothing. "Built a FastAPI service for expense splitting with PostgreSQL and Redis caching, cutting dashboard load time from 9 s to 300 ms for 60 daily users" says a lot. Numbers can be users, time saved, accuracy, test coverage, cost or scale.</p>
<p><b>Tailor</b> each application: read the job description, mirror its key skills and keywords honestly in your skills and bullets, and reorder projects so the most relevant comes first. Keep a master résumé with everything, and trim it per role.</p>
<p><b>Referrals</b> are the highest-conversion channel by far: ask people you've genuinely connected with, make it easy (send the job link, your résumé and two lines on why you fit). Apply early in hiring cycles, use campus placements, off-campus portals, company career pages and job boards, and <b>track applications</b> in a sheet: company, role, date, source, contact, status, next step. Follow up after a week or two. Expect many rejections; it's a numbers game combined with quality.</p>`,
      lang: "text",
      code: `WEAK  → STRONG BULLETS

✗ Made a website for my college club.
✓ Built and deployed the coding club's event site (Next.js, Vercel) used by 1,200 students;
  added Google sign-in and RSVP tracking, cutting manual registration work by ~5 hours per event.

✗ Did data analysis in Python.
✓ Analysed 2 years of canteen sales (180k rows) with pandas and SQL; identified 3 low-margin items
  and a peak-hour staffing gap, leading to a menu change that raised weekly profit by 8%.

✗ Responsible for security monitoring.
✓ Built a home SOC lab (Wazuh, Sysmon, 3 VMs) and wrote 12 Sigma-based detections mapped to
  MITRE ATT&CK; documented triage playbooks in a public write-up (2k views).

APPLICATION TRACKER (columns)
Company | Role | Link | Date applied | Source (referral/portal/campus) | Contact | Status | Next step | Notes
Acme    | SDE Intern | ... | 2026-10-12 | Referral (Neha) | neha@... | OA done | Interview 22 Oct | prep SQL joins

ATS-FRIENDLY CHECKLIST
[ ] One column, standard headings (Education, Skills, Projects, Experience)
[ ] Text-based PDF (you can select the words), file name: Firstname_Lastname_Resume.pdf
[ ] Keywords from the job description that you can genuinely back up
[ ] Every bullet starts with a verb and has a result`,
      ex: "Rewrite your résumé to one page using impact bullets with numbers for every project and experience. Create two tailored versions for two real job postings in your target role, highlighting the matching keywords. Set up an application tracker and apply to five roles this week, including at least one via a referral request.",
      q: ["Which résumé bullet is strongest?", ["Worked on a machine learning project", "Responsible for the backend", "Built a churn model (XGBoost) on 50k customer records with 0.86 AUC; its top features shaped a retention email campaign", "Good knowledge of Python"], 2, "It names the action, the technology, the scale and a measurable result, so a reader can judge real ability."]
    },
    {
      t: "Interviews",
      sub: ["Behavioural answers with STAR", "Technical and take-home rounds", "System design for juniors", "Questions to ask them"],
      body: `<p>Most hiring processes include a screening call, one or more technical rounds (online assessment, live coding, take-home or role-specific case), sometimes a system design round, and a behavioural or hiring-manager round.</p>
<p><b>Behavioural questions</b> ("Tell me about a time you disagreed with a teammate") are answered with <b>STAR</b>: <b>S</b>ituation (brief context), <b>T</b>ask (your responsibility), <b>A</b>ction (what <i>you</i> did, specifically, most of the answer), <b>R</b>esult (outcome, with numbers if possible, plus what you learned). Prepare 6–8 stories from projects, internships, hackathons and clubs that cover common themes: a challenge, a failure, conflict, leadership, learning something fast, a tight deadline.</p>
<p><b>Live coding</b>: clarify the problem and constraints first, talk through a simple approach, then optimise; write clean code while explaining; test with examples including edge cases. Interviewers assess how you think and communicate, not just the final answer. Practise on LeetCode or similar platforms, focusing on patterns (two pointers, hashing, BFS/DFS, sliding window) rather than memorising solutions. <b>Take-homes</b>: meet the requirements fully, add tests and a clear README with your decisions and trade-offs, and keep scope sensible.</p>
<p><b>System design for juniors</b> is usually lighter: design a URL shortener or a notification service. Clarify requirements and scale, sketch the components (client, API, database, cache, queue), design the data model and API, then discuss bottlenecks and trade-offs. Saying "I'd start simple and add a cache when reads become a bottleneck" shows good judgement.</p>
<p><b>Ask them questions</b>: what a new joiner's first 3 months look like, how the team reviews code and deploys, how they support learning, what success looks like in the role. It shows interest and helps you choose.</p>`,
      lang: "text",
      code: `STAR ANSWER (about 2 minutes)

Q: "Tell me about a time something you built failed."

S  Two days before our college fest, the event registration site I built started timing out
   when registrations opened - about 800 people hit it in the first 10 minutes.
T  I was the only developer, and registrations had to reopen within the hour.
A  I checked the logs and saw every request ran 4 database queries, one with no index.
   I added an index on (event_id, email), cached the event list for 60 seconds,
   and moved confirmation emails to a background queue so requests returned immediately.
   I load-tested with k6 at 200 requests/second before reopening.
R  The site reopened in 45 minutes and handled 3,000 registrations with p95 latency under 300 ms.
   Since then I load-test anything with a launch spike, and I added monitoring alerts.

LIVE CODING FLOW
 1. Restate the problem; ask about input size, edge cases, expected output
 2. Brute force first, state its complexity
 3. Improve (which data structure? which pattern?), state the new complexity
 4. Code it cleanly, narrating
 5. Walk through 2-3 test cases, including an edge case
 6. Mention what you'd do with more time

GOOD QUESTIONS TO ASK
 - What would a successful first 90 days look like for this role?
 - How does code get from a pull request to production here?
 - How do juniors get feedback and mentoring?
 - What's the hardest problem the team is working on right now?`,
      ex: "Write six STAR stories from your own experience covering: a challenge, a failure, a conflict, leading something, learning fast and a deadline. Practise saying two of them aloud in under 2.5 minutes. Then do three timed coding problems while talking aloud (record yourself), and do one mock system design of a URL shortener with a friend or the tutor.",
      q: ["In a STAR answer, which part should take the most time?", ["Situation", "Task", "Action: what you specifically did", "Result"], 2, "Interviewers want to understand your contribution and thinking. Keep context short and spend most of the answer on your actions, then the result."]
    },
    {
      t: "Offers and your first year",
      sub: ["Comparing offers", "Negotiating", "Onboarding well", "Growing towards your next role"],
      body: `<p><b>Comparing offers</b>: look beyond the headline CTC. In India especially, CTC often includes variable pay, joining and retention bonuses, ESOPs or RSUs, gratuity and insurance. Compare the <b>fixed in-hand monthly salary</b>, how variable pay is actually paid out, the vesting schedule and real value of equity (startup ESOPs may be worth nothing), and bond or clawback clauses. Weigh the non-money factors too: what you'll learn, the quality of your manager and team, the tech you'll work with, work-life balance, location and the company's stability. In your first job, learning and mentorship compound for years.</p>
<p><b>Negotiating</b> is normal and rarely makes companies withdraw an offer when done politely. Be appreciative, base requests on data (market ranges, competing offers you actually have), and negotiate the whole package: base, joining bonus, start date, relocation. Get the final offer in writing. For campus roles with fixed packages, there may be little room, and that's fine.</p>
<p><b>Onboarding well</b>: in the first weeks, set up your environment, read the docs and codebase, and ship a small change early. Ask questions, but show what you tried first. Keep a work log of what you did, learned and got stuck on. Have regular one-on-ones with your manager and agree on what success looks like at 30, 60 and 90 days.</p>
<p><b>Growing</b>: volunteer for slightly uncomfortable tasks, ask for code-review feedback and act on it, learn the business behind the code, write things down (docs, runbooks), and help newer people. Keep a "brag document" of achievements with impact; it makes performance reviews and promotion conversations much easier. Revisit your roadmap here yearly to plan the next set of skills for your next role.</p>`,
      lang: "text",
      code: `OFFER COMPARISON (example, annual figures in Rs lakh)

                         Company A (product)   Company B (service)   Startup C
Fixed base                    14.0                  9.5                 12.0
Variable (target)              2.0 (paid ~80%)       0.5                  0
Joining bonus                  1.5 (clawback 1y)     0                    1.0
ESOPs / RSUs (yearly)          3.0 RSU, 4y vest      0                    "10,000 ESOPs" (?)
Headline CTC                  20.5                 10.0                 13.0+
Monthly in-hand (approx.)      ~0.95                ~0.70                ~0.85
Bond                           none                  2 years             none
Learning / mentor quality      high                  medium              high, little structure
Tech stack                     Go, K8s, AWS          Java, legacy        Next.js, Python, LLMs

Questions to ask before deciding
  - Exact fixed vs variable split; how was variable paid last year?
  - RSU/ESOP: vesting schedule, cliff, strike price, latest valuation, exit history
  - Who will my manager be? Can I talk to someone on the team?
  - Notice period, bond, relocation support

NEGOTIATION EMAIL (polite, specific)
  Thank you for the offer - I'm excited about the team and the work on the payments platform.
  I have another offer with a fixed salary of Rs 15 L. Given my internship experience with
  Go and Kubernetes, would you be able to move the base closer to Rs 15.5 L? If that's
  difficult, a higher joining bonus would also help. I'd love to make this work.

30-60-90 PLAN
  30: environment set up, first 3 PRs merged, understand the main service end to end
  60: own a small feature from design to deploy; join on-call shadowing
  90: own a component; improve one piece of docs or tooling; feedback session with manager`,
      ex: "Using two real or sample offers, fill in the comparison table, calculate the monthly in-hand pay for each (use an online Indian income tax calculator) and list three questions you'd ask each company. Write a polite negotiation email, and draft a 30-60-90 day plan for your target first role.",
      q: ["Two offers have the same headline CTC. What should you compare first?", ["The office decor", "Fixed salary and monthly in-hand pay, how variable pay and equity actually work, and bonds or clawbacks", "Which company's name sounds better", "Only the joining bonus"], 1, "CTC can include uncertain variable pay, illiquid equity and one-time bonuses. Fixed and in-hand pay, plus the conditions attached, show the real value."]
    }
  ]
});
