/* Forge Academy: deeper material for Docker and Git foundation lessons. */
window.DEEP = window.DEEP || {};
Object.assign(DEEP, {
  "10-0": {
    more: `<p><b>The problem containers solve</b> is "it works on my machine". A <b>container</b> bundles your application with its exact dependencies, libraries and configuration, so it runs identically on a laptop, a teammate's machine, CI and production. Unlike a virtual machine, a container shares the host's kernel and isolates only the process and its filesystem, so it starts in milliseconds and is lightweight.</p>
<p><b>Image vs container</b>: an <b>image</b> is a read-only template (a filesystem snapshot plus metadata like the command to run); a <b>container</b> is a running instance of an image, with a thin writable layer on top. You build an image once and run many containers from it. When a container is removed, its writable layer is gone (persist data with volumes, covered later).</p>
<p><b>The Dockerfile</b> describes how to build an image, one instruction per line, each creating a <b>layer</b>: <code>FROM</code> (base image), <code>WORKDIR</code> (set the working directory), <code>COPY</code> (bring files in), <code>RUN</code> (execute a build command, like installing dependencies), <code>ENV</code> (environment variables), <code>EXPOSE</code> (document a port), and <code>CMD</code> or <code>ENTRYPOINT</code> (what runs when the container starts).</p>
<p><b>Layer caching is the key to fast builds.</b> Docker caches each layer and reuses it if that instruction and its inputs haven't changed. Since dependencies change far less often than source code, copy and install dependencies <i>before</i> copying your code: then editing your code only rebuilds the last cheap layers, not the slow dependency install. Getting this order wrong makes every build reinstall everything.</p>
<p><b>Core commands</b>: <code>docker build -t name:tag .</code> (build), <code>docker run</code> (start a container, with <code>-p host:container</code> to publish a port, <code>-e</code> for env vars, <code>-d</code> to detach), <code>docker ps</code> (running containers), <code>docker logs</code>, <code>docker exec -it container sh</code> (a shell inside), <code>docker rm</code>/<code>rmi</code> (remove). Use a <code>.dockerignore</code> to keep <code>.git</code>, <code>node_modules</code> and secrets out of the build context.</p>`,
    example: {
      t: "A Dockerfile that builds fast thanks to layer ordering",
      intro: "The same app, built the slow way and the fast way. The only difference is the order of COPY and install, which decides what the cache can reuse.",
      lang: "dockerfile",
      code: `# --- SLOW: any code change busts the dependency cache ---
# FROM python:3.12-slim
# WORKDIR /app
# COPY . .                         # <-- copying everything first
# RUN pip install -r requirements.txt   # re-runs on EVERY code change
# CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# --- FAST: dependencies cached until requirements.txt changes ---
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

COPY requirements.txt .                 # 1. copy only the dependency manifest
RUN pip install --no-cache-dir -r requirements.txt   # 2. cached unless requirements.txt changes

COPY . .                                # 3. copy source LAST: code edits rebuild only from here
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# .dockerignore (so the build context stays small and secrets never get baked in):
#   .git
#   __pycache__/
#   .env
#   *.sqlite3
#   node_modules/

# Build and run:
#   docker build -t myapp:dev .
#   docker run --rm -p 8000:8000 -e APP_ENV=development myapp:dev
#   docker exec -it <id> sh          # a shell inside a running container, to debug
#   docker logs -f <id>`,
      after: "After the first build, editing <code>main.py</code> and rebuilding reuses the cached dependency layer and finishes in a second or two. With the slow ordering, every code change triggers a full reinstall."
    },
    mistakes: [
      "Copying all source before installing dependencies, so every code change reinstalls everything.",
      "No <code>.dockerignore</code>, so <code>.git</code>, node_modules and <code>.env</code> secrets bloat the image or leak into it.",
      "Running the app as root inside the container (the default); create and use a non-root user in production images.",
      "Using a huge base image (full OS) when a slim or distroless base would be far smaller and safer.",
      "Expecting data written inside a container to persist after it's removed; it won't without a volume."
    ],
    practice: [
      ["Why copy requirements.txt and install dependencies before copying the rest of the code?", "Docker caches layers and only rebuilds from the first changed instruction. Dependencies change rarely; copying them first means code edits reuse the cached install layer, making rebuilds seconds instead of minutes."],
      ["What's the difference between an image and a container?", "An image is a read-only template (a filesystem and metadata). A container is a running instance of an image with a thin writable layer. One image can run many containers."],
      ["You edit code, rebuild, and the running container still shows old behaviour. Why?", "A running container keeps running the old image; rebuilding creates a new image but doesn't restart existing containers. Stop and remove the old container and <code>docker run</code> the new image (or use Compose to recreate it)."]
    ]
  },

  "10-1": {
    more: `<p><b>Multi-stage builds</b> let one Dockerfile have several <code>FROM</code> stages, each named with <code>AS</code>. You do heavy work (compiling, installing build tools, running tests) in early stages, then copy only the finished artifacts into a small final stage. The build tools, test dependencies and intermediate files never reach the production image.</p>
<p><b>Why it matters</b>: smaller images pull and start faster, cost less to store, and have a smaller attack surface (fewer packages means fewer vulnerabilities and fewer tools for an attacker who gets in). A Node app that needs the full toolchain to build can ship as just the runtime plus the built bundle; a Go or Rust program can ship as a single binary in a near-empty image.</p>
<p><b>The pattern</b>: a <b>base</b> stage with shared setup; a <b>build</b> stage that compiles or installs everything; optionally a <b>test</b> stage that runs the test suite (so a failing test fails the build); and a <b>final</b> stage starting from a minimal base that <code>COPY --from=build</code> brings only the needed artifacts into. <code>docker build --target test .</code> builds up to a named stage, which CI uses to run tests without producing the production image.</p>
<p><b>Minimal final images</b>: <code>-slim</code> variants (Debian with less), <code>alpine</code> (very small, but uses musl libc which occasionally causes compatibility issues), or <b>distroless</b> images (just your app and its runtime, no shell or package manager, which is excellent for security but harder to debug). Always run as a <b>non-root user</b> in the final stage, and copy in only what runs in production.</p>`,
    example: {
      t: "A multi-stage build: build, test, then a tiny non-root production image",
      intro: "The build tools and test dependencies stay in earlier stages; the final image contains only the installed runtime dependencies and the app, running as a non-root user.",
      lang: "dockerfile",
      code: `# 1. Base: shared settings
FROM python:3.12-slim AS base
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app

# 2. Build: install dependencies into an isolated prefix
FROM base AS build
COPY requirements.txt .
RUN pip install --prefix=/install -r requirements.txt

# 3. Test: bring deps + code, install dev tools, run the suite (fails the build if tests fail)
FROM build AS test
COPY --from=build /install /usr/local
COPY . .
RUN pip install --prefix=/usr/local pytest ruff && ruff check . && pytest -q

# 4. Final: minimal, non-root, only runtime deps + app (no pytest, no ruff, no build tools)
FROM base AS final
RUN useradd --system --no-create-home appuser
COPY --from=build /install /usr/local      # only the installed runtime packages
COPY --chown=appuser . .
USER appuser                                # never run as root in production
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# CI runs the tests without building the production image:
#   docker build --target test -t myapp:test .
# Production build (stops at 'final'):
#   docker build -t myapp:1.4.0 .
# Compare sizes:
#   docker images myapp   # the final image is much smaller than one that kept build tools + pytest`,
      after: "The production image never contains pytest, ruff, compilers or caches. It's smaller, starts faster and has fewer packages that could carry a vulnerability, and it runs as <code>appuser</code> rather than root."
    },
    mistakes: [
      "Shipping build tools, compilers and test dependencies in the production image, bloating it and widening the attack surface.",
      "Running the final container as root, so a compromise has more power than it needs.",
      "Copying the whole earlier stage into the final image instead of only the needed artifacts.",
      "Choosing alpine blindly for Python or Node, then fighting musl libc compatibility and slow installs; slim is often simpler.",
      "Not running tests in a stage, so broken code can still produce a deployable image."
    ],
    practice: [
      ["How does a multi-stage build make the final image smaller?", "Heavy work (compilers, build tools, dev dependencies) happens in early stages. The final stage starts from a minimal base and copies in only the finished artifacts with <code>COPY --from=build</code>, leaving all the build-time bulk behind."],
      ["What does <code>docker build --target test .</code> do and why is it useful?", "It builds only up to the stage named <code>test</code>, not the whole Dockerfile. CI uses it to run the test suite inside the image without producing the production image, and a failing test fails the build."],
      ["Why run the final container as a non-root user?", "If an attacker exploits the application, running as a limited user restricts what they can do inside the container (and reduces the impact of a container escape). It's a cheap, important hardening step."]
    ]
  },

  "10-3": {
    more: `<p><b>Docker Compose</b> runs multi-container applications from a single YAML file. Real apps aren't one container: a web app needs a database, maybe Redis, maybe a worker. Compose defines all of them as <b>services</b>, wires up a private network so they can reach each other by name, and starts them with one command (<code>docker compose up</code>). It's the standard way to run a full stack locally and in tests.</p>
<p><b>A Compose file</b> lists services with their image or build context, published ports, environment variables, volumes (for persistence and live code reload in development), and dependencies. Services on the same Compose network reach each other by <b>service name</b> as the hostname: the app connects to <code>postgres:5432</code>, not <code>localhost</code> (inside a container, localhost is the container itself).</p>
<p><b>Health checks and startup order.</b> <code>depends_on</code> controls start order but not readiness: a database container can be "started" seconds before it actually accepts connections. Add a <b>healthcheck</b> (for Postgres, <code>pg_isready</code>) and <code>depends_on: { condition: service_healthy }</code> so the app only starts once the database is truly ready. This removes the flaky "connection refused on startup" failures.</p>
<p><b>Smoke tests</b> verify a freshly started container actually works: after <code>up</code>, hit a health endpoint over HTTP and check for a 200, run a trivial end-to-end request, confirm the database migration ran. A smoke test is the minimum "is it alive?" check, run in CI after building and starting the stack, and after each deploy. It catches gross breakage (the app won't start, a missing environment variable, a broken database connection) that unit tests miss.</p>
<p><b>Cleanup</b>: <code>docker compose down</code> stops and removes containers and the network; add <code>-v</code> to also remove named volumes (wiping the database). <code>docker system prune</code> reclaims space from stopped containers, unused images and build cache, which otherwise grows steadily.</p>`,
    example: {
      t: "A Compose stack with a health-gated database and a smoke test",
      intro: "An app and Postgres together, where the app waits for the database to be genuinely ready, plus a smoke test script that CI runs after starting the stack.",
      lang: "yaml",
      code: `# compose.yaml
services:
  app:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql://app:app@db:5432/app   # "db" = the service name, not localhost
    depends_on:
      db:
        condition: service_healthy                     # wait until the healthcheck passes
    volumes:
      - ./src:/app/src                                 # live code reload in development

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data                # named volume: data survives 'down' (without -v)
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 3s
      timeout: 3s
      retries: 10

volumes:
  pgdata:

# --- smoke_test.sh (run in CI after 'docker compose up -d') ---
#!/usr/bin/env bash
# set -euo pipefail
# for i in $(seq 1 30); do
#   if curl -fsS http://localhost:8000/health > /dev/null; then
#     echo "app is healthy"
#     body=$(curl -fsS http://localhost:8000/api/ping)       # a trivial end-to-end request
#     [ "$body" = '{"pong":true}' ] || { echo "unexpected: $body"; exit 1; }
#     exit 0
#   fi
#   sleep 2
# done
# echo "app never became healthy"; docker compose logs app; exit 1

# Commands:
#   docker compose up -d --build        # start everything
#   bash smoke_test.sh                  # verify it actually works
#   docker compose down                 # stop + remove (keeps the volume)
#   docker compose down -v              # also wipe the database volume`,
      after: "The combination of a healthcheck on the database and <code>condition: service_healthy</code> on the app eliminates the classic flaky failure where the app starts a moment before Postgres is ready to accept connections."
    },
    mistakes: [
      "Connecting to <code>localhost</code> from inside a container instead of the service name; localhost means the container itself.",
      "Relying on <code>depends_on</code> alone for readiness; it controls start order, not whether the dependency accepts connections.",
      "No smoke test, so a stack that builds but doesn't actually run passes CI and breaks in production.",
      "Forgetting named volumes, so database data vanishes every time you recreate the stack.",
      "Never pruning, so stopped containers, dangling images and build cache fill the disk over time."
    ],
    practice: [
      ["Your app container crashes on startup with \"connection refused\" to the database, which is also in the Compose file. What's the fix?", "The database isn't ready yet when the app starts. Add a healthcheck to the db service (<code>pg_isready</code>) and make the app <code>depends_on</code> it <code>condition: service_healthy</code>, so the app only starts once the database accepts connections."],
      ["What does a smoke test check, and when do you run it?", "That a freshly started service is actually alive and minimally working: a health endpoint returns 200, a trivial request succeeds, migrations ran. Run it in CI after building and starting the stack, and after each deploy, to catch gross breakage unit tests can't."],
      ["What's the difference between <code>docker compose down</code> and <code>docker compose down -v</code>?", "Both stop and remove the containers and network. <code>-v</code> additionally removes named volumes, which wipes persistent data like the database. Use <code>-v</code> for a clean reset, omit it to keep your data."]
    ]
  },

  "21-0": {
    more: `<p><b>Git tracks the history of your project as a series of snapshots</b> called commits. Each commit records the full state of your tracked files, a message, an author and a link to the previous commit, forming a chain you can inspect and return to. This means you can experiment fearlessly: anything committed can be recovered, and you can see exactly what changed, when and why.</p>
<p><b>The three areas</b>: the <b>working directory</b> (your files as they are now), the <b>staging area</b> (the "index": changes you've marked to include in the next commit with <code>git add</code>), and the <b>repository</b> (committed history). The loop is: edit files, <code>git status</code> to see what changed, <code>git add</code> the changes you want, <code>git commit -m "message"</code> to record them. Staging lets you craft focused commits by including only related changes, even from the same file (<code>git add -p</code> stages hunk by hunk).</p>
<p><b>Good commits</b> are small and focused: one logical change per commit, so history reads like a story and bad changes are easy to isolate and revert. Messages matter: a concise summary line in the imperative ("Add retry to payment client", not "added stuff"), under about 50 characters, optionally followed by a blank line and a body explaining <i>why</i>. Future you and your teammates read these constantly.</p>
<p><b>Branches</b> are cheap, movable pointers to a commit. You create a branch to work on a feature or fix in isolation (<code>git switch -c feat/login</code>), commit on it, then <b>merge</b> it back into the main branch. Because branches are just pointers, creating and switching them is instant. This is what lets many people work on the same project without stepping on each other.</p>
<p><b>.gitignore</b> lists files Git should never track: dependencies (<code>node_modules/</code>, <code>.venv/</code>), build output, editor files, and critically <b>secrets</b> (<code>.env</code>, keys, credentials). A leaked secret in history is hard to remove and must be rotated, so set up <code>.gitignore</code> before your first commit, and never commit anything you wouldn't want public.</p>`,
    example: {
      t: "The core Git workflow, from first commit to a merged branch",
      intro: "A realistic sequence: set up ignores, make focused commits, branch for a feature, and merge it back.",
      lang: "bash",
      code: `# Start a repo and protect secrets BEFORE the first commit
git init
cat > .gitignore <<'EOF'
.venv/
__pycache__/
.env             # never commit secrets
*.sqlite3
.DS_Store
EOF
git add .gitignore && git commit -m "Add gitignore"

# See what's changed, stage selectively, commit with a clear message
git status
git add app/pricing.py                      # stage one file's worth of a change
git commit -m "Add GST calculation to pricing"

# Stage part of a file (interactive): keep unrelated changes out of this commit
git add -p app/checkout.py

# Inspect history
git log --oneline --graph                   # compact view of the commit tree
git diff HEAD~1                             # what changed in the last commit
git show <commit>                           # full details of one commit

# Branch for a feature, work, then merge back
git switch -c feat/coupons                  # create and switch
# ... edit, add, commit on the branch ...
git commit -am "Apply coupon discounts at checkout"
git switch main
git merge feat/coupons                      # bring the feature into main
git branch -d feat/coupons                  # delete the merged branch

# Undo safely:
git restore app/pricing.py                  # discard uncommitted changes to a file
git restore --staged app/pricing.py         # unstage, keep the edits
git commit --amend                          # fix the last commit's message or contents (if unpushed)`,
      after: "Setting up <code>.gitignore</code> as the very first commit matters: once a secret is committed it lives in history even if you delete it later, so the only safe fix is to rotate the secret. Prevention is far easier."
    },
    mistakes: [
      "Committing secrets (.env, API keys) or huge generated folders because .gitignore wasn't set up first.",
      "Giant commits mixing many unrelated changes, so history is unreadable and reverting one change is impossible.",
      "Vague commit messages (\"update\", \"fix\", \"stuff\") that tell future readers nothing.",
      "Working directly on main for everything instead of branches, making collaboration and review harder.",
      "Amending or rebasing commits that have already been pushed and pulled by others, rewriting shared history."
    ],
    practice: [
      ["What's the difference between the working directory, the staging area and the repository?", "The working directory is your current files. The staging area holds changes you've marked (<code>git add</code>) for the next commit. The repository is the committed history. Staging lets you choose exactly what goes into each commit."],
      ["You accidentally committed a file with an API key. Deleting it in a new commit isn't enough. Why, and what must you do?", "The key still exists in earlier history, which anyone with the repo can read. You must rotate (revoke and replace) the key immediately, and separately scrub it from history (e.g. git filter-repo) if the repo is shared."],
      ["Write a good commit message for adding input validation to a signup form.", "Summary line in the imperative, e.g. \"Validate email and password on signup\", optionally with a body explaining why (\"rejects malformed emails and passwords under 12 chars before hitting the database\")."]
    ]
  },

  "21-1": {
    more: `<p><b>GitHub (and GitLab, Bitbucket) hosts your repositories</b> so you can back them up, share them and collaborate. Your local repo connects to a hosted copy called a <b>remote</b>, named <code>origin</code> by default. You <code>push</code> commits up and <code>pull</code> (fetch + merge) others' commits down. <code>git fetch</code> downloads remote changes without merging, so you can inspect them first; <code>git pull</code> fetches and merges in one step.</p>
<p><b>Clone vs fork</b>: <code>git clone</code> copies a repo you have access to onto your machine. A <b>fork</b> is your own server-side copy of someone else's repo (used for open-source contributions when you can't push to the original); you clone your fork, push to it, then open a pull request against the original.</p>
<p><b>Pull requests (PRs)</b> are how changes get reviewed and merged on a team. You push a branch, open a PR describing what and why, automated checks (tests, linting) run, teammates review and comment, you address feedback with more commits, and once approved the branch is merged. PRs are where code quality, knowledge sharing and catching bugs happen. Good PRs are small and focused (easier to review well), have a clear description, and link the issue they close (<code>Closes #42</code>).</p>
<p><b>Merge conflicts</b> happen when two branches change the same lines differently; Git can't decide which to keep, so it marks the conflict in the file with <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code> and <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> markers. You resolve it by editing the file to the correct combined result, removing the markers, then <code>git add</code> and continuing. Conflicts are normal; keeping branches short-lived and pulling main frequently keeps them small. Pull the latest main into your branch regularly so conflicts surface early in small pieces.</p>
<p><b>Your public profile</b> is a portfolio for technical roles: a good README on each project (what it does, screenshot, how to run it), pinned repositories, and tidy commit history show employers you can build and communicate, often more convincingly than a CV.</p>`,
    example: {
      t: "Collaborating through a pull request, including resolving a conflict",
      intro: "The everyday team flow: branch, push, open a PR, then handle a merge conflict when main has moved on.",
      lang: "bash",
      code: `# Connect a local repo to GitHub (first time)
git remote add origin https://github.com/you/shop.git
git push -u origin main                     # -u sets the upstream, so later just 'git push'

# Feature workflow
git switch -c feat/wishlist
# ... work, commit ...
git push -u origin feat/wishlist            # push the branch
# Open a PR on GitHub: title, description of what/why, "Closes #58"
# Teammates review; you push more commits to address feedback; checks run; then merge.

# Keep your branch current so conflicts stay small
git switch main && git pull                 # get the latest main
git switch feat/wishlist
git merge main                              # bring main's changes into your branch early

# A conflict appears:
#   Auto-merging app/cart.py
#   CONFLICT (content): Merge conflict in app/cart.py
git status                                  # lists the conflicted files

# app/cart.py now contains:
#   <<<<<<< HEAD              (your branch's version)
#   total = subtotal * 1.18
#   =======
#   total = round(subtotal * 1.18, 2)
#   >>>>>>> main             (main's version)
# Edit the file to the correct final result, delete the markers, then:
git add app/cart.py
git commit                                  # completes the merge
git push

# Fetch vs pull:
git fetch origin                            # download, don't merge: inspect with 'git log origin/main'
git pull                                    # download and merge in one step`,
      after: "Merging main into your branch <i>frequently</i> is the trick to painless conflicts: you resolve a few small conflicts early instead of one enormous tangled conflict after days of divergence."
    },
    mistakes: [
      "Long-lived branches that drift far from main, producing huge painful merge conflicts.",
      "Giant pull requests that reviewers can't review properly, so bugs slip through.",
      "Pushing directly to main and skipping review, losing the main benefit of pull requests.",
      "Leaving conflict markers (<code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>) in a file after a botched resolution, breaking the code.",
      "A PR description that just says \"fixes\" with no context, making review and future history useless."
    ],
    practice: [
      ["What's the difference between <code>git fetch</code> and <code>git pull</code>?", "<code>git fetch</code> downloads remote commits but doesn't change your working branch, so you can inspect them first. <code>git pull</code> does a fetch and then merges them into your current branch in one step."],
      ["When would you fork a repository instead of just cloning it?", "When you want to contribute to a project you don't have push access to (typical open source). You fork to get your own server-side copy, clone and push to that, then open a pull request against the original repository."],
      ["You see <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD ... ======= ... &gt;&gt;&gt;&gt;&gt;&gt;&gt; main</code> in a file. What are these and what do you do?", "Conflict markers: the part after HEAD is your branch's version, the part after ======= is the other branch's. Edit the file to the correct combined result, remove all three markers, then <code>git add</code> the file and commit to finish the merge."]
    ]
  }
});
