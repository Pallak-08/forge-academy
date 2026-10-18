/* Forge Academy lessons: Git workflows, GitHub, API security, Docker storage and networking, CI/CD */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 47, id: "git-lessons", fills: "git", title: "Git and GitHub", level: 1,
  blurb: "Team workflows and everything GitHub offers beyond hosting code.",
  lessons: [
    {
      t: "Branching strategies and team workflows",
      sub: ["Feature branches and trunk-based development", "Rebase vs merge", "Tags and releases", "Conventional commits", "Undoing things: revert, reset, restore"],
      body: `<p>Teams need an agreed way to work on code together. Two common strategies:</p>
<ul><li><b>Feature branches</b> (GitHub flow): each change gets a short-lived branch from <code>main</code>, a pull request with review and CI, then a merge. Simple and the most common for web teams.</li>
<li><b>Trunk-based development</b>: everyone integrates into <code>main</code> at least daily with very small changes, using feature flags to hide unfinished work. It avoids long-lived branches and painful merges, and suits teams that deploy many times a day.</li></ul>
<p>Avoid long-running branches either way: the longer a branch lives, the worse the merge conflicts.</p>
<p><b>Merge vs rebase</b>: merging keeps history exactly as it happened and adds a merge commit. Rebasing replays your commits on top of the latest <code>main</code>, giving a straight, readable history. A common rule: rebase your own local branch to update it, but never rebase commits other people have already pulled. Many teams "squash and merge" pull requests so each feature is one commit on <code>main</code>.</p>
<p><b>Tags</b> mark releases (<code>v1.4.0</code>), usually following <b>semantic versioning</b>: MAJOR for breaking changes, MINOR for new features, PATCH for fixes. GitHub Releases attach notes and files to tags.</p>
<p><b>Conventional commits</b> use a prefix: <code>feat:</code>, <code>fix:</code>, <code>docs:</code>, <code>refactor:</code>, <code>test:</code>, <code>chore:</code>, with <code>!</code> for breaking changes. Tools can then generate changelogs and version numbers automatically.</p>
<p><b>Undoing things</b>: <code>git restore file</code> discards uncommitted changes; <code>git reset</code> moves your branch back (rewrites history, so only for local, unpushed work); <code>git revert</code> creates a new commit that undoes an old one (safe on shared branches). <code>git reflog</code> shows where HEAD has been, so you can recover almost anything.</p>`,
      lang: "bash",
      code: `# Feature branch workflow
git switch main && git pull
git switch -c feat/csv-export
# ...work, commit in small steps...
git commit -m "feat(export): add CSV download for invoices"
git fetch origin && git rebase origin/main      # update your branch on top of latest main
git push -u origin feat/csv-export              # open a pull request on GitHub
# after rebasing an already-pushed branch (your own branch only):
git push --force-with-lease

# Releases
git tag -a v1.4.0 -m "CSV export, faster dashboard"
git push origin v1.4.0
gh release create v1.4.0 --generate-notes

# Undoing
git restore src/app.py                # throw away uncommitted edits to one file
git restore --staged src/app.py       # unstage, keep edits
git commit --amend                    # fix the last (unpushed) commit message or contents
git reset --soft HEAD~1               # undo last commit, keep changes staged (local only)
git revert 3f2a91c                    # safely undo a pushed commit with a new commit
git reflog                            # find a "lost" commit, then: git switch -c rescue <sha>

# Interactive clean-up of your own branch before review
git rebase -i origin/main             # squash "wip" commits, reword messages`,
      ex: "In a practice repo, simulate a team: create two feature branches that edit the same file, merge one, then rebase the other and resolve the conflict. Make three commits with conventional commit messages, tag a release, and practise recovery: reset away a commit, then recover it with reflog; revert a pushed commit.",
      q: ["A bad commit is already on the shared main branch that teammates have pulled. How should you undo it?", ["git reset --hard and force push", "git revert, which adds a new commit undoing the change without rewriting history", "Delete the repository", "git restore"], 1, "Rewriting shared history breaks everyone else's copies. Revert is the safe way to undo published commits."]
    },
    {
      t: "GitHub beyond code",
      sub: ["Issues and project boards", "README, LICENSE and CONTRIBUTING", "GitHub Actions in one minute", "GitHub Pages", "Profile README"],
      body: `<p>GitHub is also where projects are planned, documented, automated and presented.</p>
<p><b>Issues</b> track bugs, features and tasks. Good issues have a clear title, steps to reproduce or acceptance criteria, labels (bug, enhancement, good first issue) and an assignee. Writing <code>Fixes #42</code> in a pull request closes the issue automatically on merge. <b>Projects</b> boards organise issues into columns or tables (To do, In progress, Done) with custom fields like priority and sprint. Issue templates make reporters give you the information you need.</p>
<p>Every repository needs a few files. <b>README.md</b>: what it is, a screenshot, how to install and run it, and how to contribute. <b>LICENSE</b>: without one, others legally can't reuse your code. MIT and Apache-2.0 are permissive; GPL requires derivatives to stay open source. <b>CONTRIBUTING.md</b>: how to set up, the coding style and the pull request process. Optionally <code>CODE_OF_CONDUCT.md</code> and <code>SECURITY.md</code> (how to report vulnerabilities privately).</p>
<p><b>GitHub Actions</b> runs workflows on events (push, pull request, schedule, release): YAML files in <code>.github/workflows/</code> define jobs made of steps, using shell commands or reusable actions. Typical uses: run tests and linters on every pull request, build and deploy on merge, run scheduled jobs.</p>
<p><b>GitHub Pages</b> hosts static sites for free from a repository (docs, portfolios, project pages), at <code>username.github.io</code> or a custom domain.</p>
<p>A <b>profile README</b> (a repository with the same name as your username) appears at the top of your GitHub profile; use it to introduce yourself and link your best work.</p>`,
      lang: "yaml",
      code: `# .github/workflows/ci.yml : test every push and pull request
name: ci
on:
  push: { branches: [main] }
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12", cache: pip }
      - run: pip install -r requirements.txt
      - run: ruff check . && pytest -q

---
# .github/ISSUE_TEMPLATE/bug.yml : make bug reports useful
name: Bug report
description: Something isn't working
labels: [bug]
body:
  - type: textarea
    id: steps
    attributes: { label: Steps to reproduce, placeholder: "1. Go to ... 2. Click ..." }
    validations: { required: true }
  - type: textarea
    id: expected
    attributes: { label: Expected vs actual behaviour }
  - type: input
    id: version
    attributes: { label: Version or commit }

# Handy gh CLI commands
#   gh issue create --title "CSV export ignores date filter" --label bug
#   gh pr create --fill --base main
#   gh pr checks --watch
#   gh repo edit --enable-pages   (or Settings > Pages > Deploy from branch)`,
      ex: "Pick one of your repositories and make it look like a real open-source project: a full README with a screenshot, a LICENSE, CONTRIBUTING.md, issue templates for bugs and features, a project board with five issues, and a CI workflow that runs tests on pull requests. Then publish its docs or a demo page with GitHub Pages.",
      q: ["You publish code on GitHub with no LICENSE file. What can others legally do with it?", ["Anything they want", "Very little: by default, copyright law reserves all rights, so others can't legally reuse or modify it", "Only commercial use", "Only modify it"], 1, "Public visibility isn't permission. A licence such as MIT or Apache-2.0 grants others the rights to use and modify the code."]
    }
  ]
});

COURSE.push({
  n: 48, id: "api-security-lessons", fills: "api-security", title: "API security", level: 2,
  blurb: "The OWASP API Top 10 and protecting secrets and dependencies.",
  lessons: [
    {
      t: "OWASP API Security Top 10",
      sub: ["Broken object level authorisation", "Excessive data exposure", "Mass assignment", "Rate limiting and resource abuse"],
      body: `<p>APIs expose your business logic and data directly, so they have their own OWASP Top 10. Four issues cause most real API breaches.</p>
<p><b>Broken object level authorisation</b> (BOLA, number 1): the API accepts an object ID (<code>/api/orders/8812</code>) and returns it without checking that the caller may access that object. Fix: scope every data access by the authenticated user or tenant, centrally, and test cross-user access on every endpoint. Related: <b>broken function level authorisation</b>, where normal users can call admin endpoints.</p>
<p><b>Excessive data exposure</b> (now "broken object property level authorisation"): the API returns whole database objects (password hashes, internal flags, other users' emails) and relies on the front end to hide fields. Attackers read raw responses. Fix: explicit response schemas that list only the fields each role should see.</p>
<p><b>Mass assignment</b>: the API binds request JSON straight onto a model, so a user can add <code>"role": "admin"</code> or <code>"balance": 99999</code> to a profile update. Fix: separate input schemas that accept only the fields users may set.</p>
<p><b>Unrestricted resource consumption</b>: no rate limits, huge page sizes, unbounded uploads or expensive queries let one client degrade the service or run up your bills (SMS, email, LLM calls). Fix: rate limits per user, IP and API key; maximum page sizes and request bodies; timeouts; quotas on costly operations.</p>
<p>Others on the list include broken authentication, server-side request forgery, security misconfiguration, poor API inventory (forgotten old versions still running) and unsafe consumption of third-party APIs.</p>`,
      lang: "python",
      code: `from fastapi import Depends, FastAPI, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# --- Input schema: only fields a user may change (prevents mass assignment) ---
class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    bio: str = Field(default="", max_length=500)
    model_config = {"extra": "forbid"}          # "role": "admin" in the body -> 422 error

# --- Output schema: only fields this caller should see (prevents data exposure) ---
class PublicProfile(BaseModel):
    id: int
    name: str
    bio: str

class MyProfile(PublicProfile):
    email: EmailStr                              # only the owner sees their email

@app.patch("/me", response_model=MyProfile)
def update_me(body: ProfileUpdate, user=Depends(current_user)):
    return db.update_user(user.id, **body.model_dump())

# --- BOLA: authorisation by ownership, and limits on cost ---
@app.get("/orders", response_model=list[OrderOut])
@limiter.limit("60/minute")
def list_orders(request: Request, page: int = 1, size: int = 20, user=Depends(current_user)):
    size = min(size, 100)                        # cap page size
    return db.orders.filter(tenant_id=user.tenant_id).page(page, size)

@app.post("/otp/send")
@limiter.limit("3/10minutes")                    # expensive and abusable: SMS costs money
def send_otp(request: Request, user=Depends(current_user)):
    ...`,
      ex: "Audit an API you've built against these four risks. For each endpoint, record: is access scoped by owner, what fields does it return versus what the caller needs, does it accept extra fields, and what stops abuse. Fix the issues with input and output schemas and rate limits, and add automated tests for cross-user access and mass assignment.",
      q: ["A PATCH /me endpoint copies all request JSON fields onto the user record. A user sends {\"name\": \"Asha\", \"is_admin\": true}. What's this vulnerability?", ["SQL injection", "Mass assignment", "CSRF", "SSRF"], 1, "Binding raw input onto models lets clients set fields they shouldn't. Accept only an explicit list of allowed fields."]
    },
    {
      t: "Secrets and dependency security",
      sub: ["Environment variables and secret stores", "Rotating keys", "Dependency scanning", "Supply-chain attacks"],
      body: `<p>APIs depend on many secrets: database passwords, signing keys for tokens, keys for payment, email and AI providers. Rules that prevent most leaks:</p>
<ul><li><b>Never in code</b>: not in source files, not in Docker images, not in front-end bundles (anything shipped to the browser is public, so browser apps must call your backend, which holds the key).</li>
<li><b>Environment variables</b> are the simplest way to inject secrets at runtime; locally from a git-ignored <code>.env</code>, in production from the platform's secret settings (Vercel, Render, Kubernetes Secrets) or a <b>secret store</b> like AWS Secrets Manager or Vault.</li>
<li>Give each environment its own keys, with the least permissions the provider allows (restricted API keys, IP restrictions, spend limits).</li>
<li>Don't log secrets or full request headers; scrub them from error reports.</li></ul>
<p><b>Rotating keys</b>: plan for it before you need it. Support two active keys during a switch-over (for example, verify JWTs with both the old and new keys while signing with the new one). Rotate on a schedule, immediately when someone with access leaves, and whenever a leak is suspected.</p>
<p><b>Dependency scanning</b>: most of your API is other people's code. Use Dependabot or Renovate for update pull requests, and <code>pip-audit</code>, <code>npm audit</code> or OSV-Scanner in CI to flag known vulnerabilities. Prioritise vulnerabilities in code paths you actually use.</p>
<p><b>Supply-chain attacks</b> target the packages themselves: typosquatting (<code>reqeusts</code> instead of <code>requests</code>), hijacked maintainer accounts publishing malicious versions, and packages that run code at install time. Defences: lock files with hashes, review new dependencies, prefer well-maintained packages, and be wary of brand-new versions of critical packages.</p>`,
      lang: "python",
      code: `# settings.py : typed settings from environment variables (pip install pydantic-settings)
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: SecretStr
    jwt_signing_keys: list[SecretStr]            # newest first: sign with [0], verify with all
    razorpay_key_secret: SecretStr
    openai_api_key: SecretStr

settings = Settings()                            # fails fast at startup if anything is missing
print(settings.openai_api_key)                   # SecretStr('**********') : safe if logged by accident

# JWT key rotation: verify against every active key
import jwt
def verify(token: str):
    for key in settings.jwt_signing_keys:
        try:
            return jwt.decode(token, key.get_secret_value(), algorithms=["HS256"], audience="api")
        except jwt.InvalidSignatureError:
            continue
    raise jwt.InvalidTokenError("no key matched")

def sign(claims: dict) -> str:
    return jwt.encode(claims, settings.jwt_signing_keys[0].get_secret_value(), algorithm="HS256")

# .gitignore         ->  .env
# .env.example       ->  DATABASE_URL=  JWT_SIGNING_KEYS=["..."]  RAZORPAY_KEY_SECRET=  OPENAI_API_KEY=
#
# CI dependency checks:
#   pip-audit -r requirements.txt --strict
#   pip install --require-hashes -r requirements.lock     (lock with hashes: uv pip compile --generate-hashes)`,
      ex: "Move every secret in one of your APIs into environment variables loaded through a typed settings class, add a <code>.env.example</code>, and scan the repo history with gitleaks. Implement JWT key rotation with two keys and test that tokens signed with the old key still verify until you remove it. Add pip-audit or npm audit to CI.",
      q: ["Your React app needs to call an AI API that requires a secret key. Where should the key live?", ["In the React code, minified", "In localStorage", "On your backend, which the React app calls; the browser never sees the key", "In a hidden HTML input"], 2, "Everything shipped to the browser can be read by users. Only a server you control can keep the key secret and enforce limits."]
    }
  ]
});

COURSE.push({
  n: 49, id: "docker-lessons", fills: "docker", title: "Docker and containers", level: 2,
  blurb: "Persistent data, container networking and publishing images.",
  lessons: [
    {
      t: "Volumes, networks and registries",
      sub: ["Volumes and bind mounts", "Container networking", "Pushing to registries", "Image tagging strategy"],
      body: `<p>A container's filesystem is thrown away when the container is removed. To keep data, mount storage into it:</p>
<ul><li><b>Named volumes</b> (<code>-v pgdata:/var/lib/postgresql/data</code>) are managed by Docker, survive container removal and are the right choice for databases and other persistent data.</li>
<li><b>Bind mounts</b> (<code>-v $(pwd):/app</code>) map a host folder into the container. Ideal in development so code changes appear instantly; avoid them in production.</li></ul>
<p><b>Networking</b>: containers on the same user-defined network reach each other by <b>service or container name</b> through Docker's built-in DNS: the API connects to <code>postgres:5432</code>, not <code>localhost</code> (inside a container, localhost means that container itself). Docker Compose creates such a network automatically. <b>Publishing</b> a port (<code>-p 8080:8000</code>) exposes a container port on the host; only publish what must be reachable from outside, and bind development databases to <code>127.0.0.1</code>.</p>
<p><b>Registries</b> store and distribute images: Docker Hub, GitHub Container Registry (ghcr.io), AWS ECR, Google Artifact Registry. You tag an image with the registry path, log in, and push; servers and clusters pull it from there.</p>
<p><b>Tagging strategy</b>: <code>latest</code> is just a default tag name, not "newest", and it changes under you, so never deploy it. Tag each build with the <b>git commit SHA</b> (unique, traceable) and releases with semantic versions (<code>1.4.0</code>, and optionally <code>1.4</code>, <code>1</code>). For maximum reproducibility, deploy by <b>digest</b> (<code>@sha256:...</code>), which can never change.</p>`,
      lang: "yaml",
      code: `# compose.yaml : volumes and networking in one place
services:
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql://app:app@db:5432/app   # "db" resolves via Docker DNS
      REDIS_URL: redis://cache:6379/0
    volumes:
      - ./src:/app/src                # bind mount: live code reload in development
    depends_on: { db: { condition: service_healthy } }
  db:
    image: postgres:16
    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: app, POSTGRES_DB: app }
    volumes: [pgdata:/var/lib/postgresql/data]    # named volume: data survives restarts
    ports: ["127.0.0.1:5432:5432"]                # reachable only from this machine
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U app"], interval: 5s, retries: 5 }
  cache:
    image: redis:7-alpine                         # no ports published: only api can reach it
volumes:
  pgdata:

# Registry workflow (GitHub Container Registry)
#   echo $GITHUB_TOKEN | docker login ghcr.io -u <user> --password-stdin
#   SHA=$(git rev-parse --short HEAD)
#   docker build -t ghcr.io/<user>/forge-api:$SHA -t ghcr.io/<user>/forge-api:1.4.0 .
#   docker push ghcr.io/<user>/forge-api:$SHA && docker push ghcr.io/<user>/forge-api:1.4.0
#   docker inspect --format '{{index .RepoDigests 0}}' ghcr.io/<user>/forge-api:1.4.0   # deploy this digest
#
# Inspect
#   docker volume ls ; docker network ls ; docker network inspect <project>_default`,
      ex: "Run an API, Postgres and Redis with Compose. Prove data persistence (insert rows, run <code>docker compose down</code> then <code>up</code>, rows remain; then <code>down -v</code> and they're gone). Show that Redis isn't reachable from your host but is from the API. Push the API image to GHCR tagged with the commit SHA and a version, and record its digest.",
      q: ["Inside the API container, why does connecting to localhost:5432 fail to reach the Postgres container?", ["Postgres doesn't support Docker", "Inside a container, localhost is the container itself; other containers are reached by their service name, like db:5432", "Port 5432 is blocked by Docker", "You need a VPN"], 1, "Each container has its own network namespace. Docker's DNS resolves service names on the shared network."]
    }
  ]
});

COURSE.push({
  n: 50, id: "cicd-lessons", fills: "cicd", title: "CI/CD pipelines", level: 2,
  blurb: "Designing pipelines, deploying safely and GitOps.",
  lessons: [
    {
      t: "Pipeline design",
      sub: ["Stages: lint, test, build, deploy", "Caching and parallel jobs", "Artifacts", "Environments and approvals"],
      body: `<p>A pipeline turns every change into a tested, deployable artifact automatically. A typical flow orders stages from fastest and cheapest to slowest, so problems are caught early:</p>
<ol><li><b>Lint and format</b> (seconds): style, type checks, obvious bugs.</li>
<li><b>Unit tests</b> (seconds to minutes).</li>
<li><b>Build</b> the artifact once: a container image, a bundle, a binary.</li>
<li><b>Integration and end-to-end tests</b> against the built artifact, with real dependencies (databases in service containers).</li>
<li><b>Security scans</b>: dependencies, secrets, image, IaC.</li>
<li><b>Deploy</b> to staging, then production.</li></ol>
<p><b>Build once, deploy many</b>: the exact artifact tested in staging is the one promoted to production, configured by environment variables. Rebuilding per environment risks shipping something different from what you tested.</p>
<p><b>Speed</b> matters, because slow pipelines get skipped. <b>Cache</b> dependencies (pip, npm, Docker layers) keyed on lock files; run independent jobs in <b>parallel</b>; use a <b>matrix</b> for several versions or operating systems; shard long test suites; and only run expensive jobs when relevant files change.</p>
<p><b>Artifacts</b> pass outputs between jobs and keep them for inspection: build outputs, test reports, coverage, screenshots from failed browser tests.</p>
<p><b>Environments</b> (staging, production) hold their own secrets and URLs. Add protection rules: production deploys only from <code>main</code>, required reviewers or a manual approval, and wait timers. Pipelines should be defined in code, reviewed like code, and give the same result for the same commit.</p>`,
      lang: "yaml",
      code: `name: pipeline
on:
  push: { branches: [main] }
  pull_request:
concurrency: { group: "\${{ github.ref }}", cancel-in-progress: true }   # cancel stale runs

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }          # dependency cache keyed on package-lock.json
      - run: npm ci && npm run lint && npm run typecheck

  test:
    runs-on: ubuntu-latest
    strategy: { matrix: { shard: [1, 2, 3] } }          # parallel shards
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test }
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci && npx vitest run --shard=\${{ matrix.shard }}/3 --coverage
        env: { DATABASE_URL: "postgresql://postgres:test@localhost:5432/postgres" }
      - uses: actions/upload-artifact@v4
        with: { name: "coverage-\${{ matrix.shard }}", path: coverage/ }

  build:
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    outputs: { image: "\${{ steps.meta.outputs.image }}" }
    steps:
      - uses: actions/checkout@v4
      - id: meta
        run: echo "image=ghcr.io/\${{ github.repository }}:\${{ github.sha }}" >> $GITHUB_OUTPUT
      - run: docker build -t \${{ steps.meta.outputs.image }} . && docker push \${{ steps.meta.outputs.image }}

  deploy-staging:
    needs: build
    environment: staging
    runs-on: ubuntu-latest
    steps: [ { run: "./deploy.sh staging \${{ needs.build.outputs.image }}" } ]

  deploy-production:
    needs: deploy-staging
    environment: production          # protected: required reviewer approves in the GitHub UI
    runs-on: ubuntu-latest
    steps: [ { run: "./deploy.sh production \${{ needs.build.outputs.image }}" } ]`,
      ex: "Build a full pipeline for one of your projects: lint, unit tests with caching, integration tests with a Postgres service container, a single image build tagged with the commit SHA, automatic deploy to a staging environment, and a production deploy that needs manual approval. Measure the pipeline time, then cut it by at least 30% with caching and parallelism.",
      q: ["Why 'build once, deploy many' instead of rebuilding the image for each environment?", ["It saves disk space", "The exact artifact that passed testing in staging is what reaches production, avoiding differences from rebuilds", "Registries only allow one build", "It's required by Docker"], 1, "Rebuilds can pull different dependency versions or base images. Promoting one immutable artifact guarantees you ship what you tested."]
    },
    {
      t: "Deployment strategies",
      sub: ["Rolling, blue-green and canary", "Feature flags", "Rollbacks", "Database migrations in deploys"],
      body: `<p>How you replace the old version with the new one decides how much risk each deploy carries.</p>
<ul><li><b>Rolling</b>: replace instances a few at a time while health checks pass. The default in Kubernetes and ECS. Simple, but old and new versions run side by side for a while, and rolling back takes another rollout.</li>
<li><b>Blue-green</b>: run the new version (green) next to the old one (blue), test it, then switch all traffic at the load balancer. Rollback is an instant switch back. It costs double capacity during the deploy.</li>
<li><b>Canary</b>: send a small share of traffic (say 5%) to the new version, watch error rates and latency, then increase step by step. Problems affect few users and can be caught automatically (Argo Rollouts, Flagger, cloud load balancer weights).</li></ul>
<p><b>Feature flags</b> separate <i>deploying</i> code from <i>releasing</i> features: ship code turned off, then enable it for internal users, then a percentage, then everyone, without redeploying. They also act as kill switches. Remove old flags to avoid clutter (LaunchDarkly, Unleash, GrowthBook, or a simple config table).</p>
<p><b>Rollbacks</b> should be one command and rehearsed: redeploy the previous image tag or digest. Keep at least the last few releases ready.</p>
<p><b>Database migrations</b> are the hard part, because the old and new code run at the same time during a deploy and rolling back code doesn't roll back the schema. Use the <b>expand and contract</b> pattern: first add new columns or tables in a backward-compatible way (expand); deploy code that writes both and reads the new; backfill data; later remove the old columns (contract) in a separate release. Never rename or drop a column in the same deploy as the code that stops using it.</p>`,
      lang: "text",
      code: `EXPAND / CONTRACT: renaming users.fullname -> users.display_name with zero downtime

Release 1 (expand)
  migration:  ALTER TABLE users ADD COLUMN display_name text;          -- nullable, old code unaffected
  code:       writes BOTH fullname and display_name; reads fullname

Release 2 (backfill + switch reads)
  job:        UPDATE users SET display_name = fullname WHERE display_name IS NULL;   -- in batches
  code:       reads display_name (falls back to fullname); still writes both

Release 3 (contract)
  code:       stops using fullname completely
  migration:  ALTER TABLE users DROP COLUMN fullname;                  -- only after release 3 is stable

CANARY PLAN (Argo Rollouts style)
  steps:
    - setWeight: 5      # 5% of traffic to the new version
    - pause: 10m        # automated analysis: error rate < 1%, p95 latency < 400 ms
    - setWeight: 25
    - pause: 10m
    - setWeight: 50
    - pause: 10m
    - setWeight: 100
  on failed analysis: abort -> all traffic back to stable automatically

FEATURE FLAG (simple)
  if flags.enabled("new-checkout", user_id=user.id):   # 10% rollout, internal users always on
      return new_checkout(cart)
  return old_checkout(cart)

ROLLBACK (one command, rehearsed)
  kubectl rollout undo deployment/api        # or redeploy the previous image digest`,
      ex: "Implement two deployment strategies for a small app: a blue-green switch (two Compose services or two Kubernetes deployments behind one Nginx or Service, switched by changing the target) and a feature flag that enables a new page for 20% of users. Then perform a column rename with the expand and contract pattern across three commits, keeping the app working at every step.",
      q: ["Why not rename a database column in the same release as the code change that uses the new name?", ["Databases can't rename columns", "During a rolling deploy old code still runs and would break, and rolling back the code wouldn't undo the rename", "It's slower", "Migrations must be in separate repositories"], 1, "Old and new versions overlap during deploys. Backward-compatible schema steps keep both working and keep rollbacks safe."]
    },
    {
      t: "GitOps",
      sub: ["Declarative deployments", "Argo CD / Flux", "Drift detection", "Promotion between environments"],
      body: `<p><b>GitOps</b> makes a Git repository the single source of truth for what should be running. Instead of CI scripts pushing changes into clusters, you describe the desired state declaratively (Kubernetes manifests, Helm values, Kustomize overlays) in Git, and an agent running inside the cluster continuously <b>pulls</b> and applies it.</p>
<p>Benefits: every change goes through a pull request (review, history, easy revert with <code>git revert</code>); the cluster doesn't need to give CI admin credentials; the same process deploys apps and cluster add-ons; and you can rebuild a cluster from the repo.</p>
<p><b>Argo CD</b> and <b>Flux</b> are the two main CNCF GitOps tools. Argo CD has a strong web UI showing each application's sync and health status; Flux is lightweight and composable. Both watch a repo path and reconcile the cluster to match.</p>
<p><b>Drift detection</b>: if someone changes the cluster by hand (<code>kubectl edit</code>), the GitOps agent sees that live state differs from Git and marks the app <i>OutOfSync</i>, and with self-heal enabled reverts the change automatically. Manual hotfixes must therefore go through Git too.</p>
<p><b>Promotion between environments</b>: a common layout is a config repo with a base and overlays per environment. CI builds an image and opens a pull request updating the image tag in the staging overlay; after checks pass, promotion to production is another pull request changing the production overlay to the same tag. Tools like Argo CD Image Updater or Kargo can automate those pull requests.</p>`,
      lang: "yaml",
      code: `# Config repo layout
# deploy/
# ├── base/            deployment.yaml, service.yaml, kustomization.yaml
# └── overlays/
#     ├── staging/     kustomization.yaml  (image tag, replicas: 1)
#     └── production/  kustomization.yaml  (image tag, replicas: 3)

# deploy/overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources: [../../base]
namespace: forge-prod
images:
  - name: ghcr.io/pallak-08/forge-api
    newTag: 3f2a91c          # promotion = a pull request changing this line
replicas:
  - name: forge-api
    count: 3

---
# Argo CD Application watching the production overlay
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata: { name: forge-api-prod, namespace: argocd }
spec:
  project: default
  source:
    repoURL: https://github.com/Pallak-08/forge-deploy
    targetRevision: main
    path: deploy/overlays/production
  destination: { server: https://kubernetes.default.svc, namespace: forge-prod }
  syncPolicy:
    automated: { prune: true, selfHeal: true }   # apply Git changes, revert manual drift
    syncOptions: [CreateNamespace=true]

# CI (app repo) after building image 3f2a91c:
#   cd forge-deploy/deploy/overlays/staging && kustomize edit set image ghcr.io/pallak-08/forge-api:3f2a91c
#   git commit -am "staging: forge-api 3f2a91c" && gh pr create --fill`,
      ex: "On a local cluster (kind or minikube), install Argo CD, create a config repo with base and staging/production overlays, and point two Argo CD Applications at them. Deploy by changing the image tag through a pull request, promote it to production with a second pull request, then make a manual <code>kubectl scale</code> change and watch self-heal revert it.",
      q: ["In GitOps, an engineer scales a deployment manually with kubectl. With self-heal on, what happens?", ["The change becomes permanent", "The agent detects drift from Git and reverts the cluster to the state declared in the repository", "The cluster crashes", "Git is updated automatically to match"], 1, "Git is the source of truth. Changes must be made through commits; manual changes are treated as drift and undone."]
    }
  ]
});
