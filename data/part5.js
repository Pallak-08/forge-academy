/* Forge Academy course data, modules 17-20 and capstone projects */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 17, id: "browser-automation", title: "Browser automation", level: 4,
  blurb: "Drive a real browser from code with Playwright: navigate, click, type, wait, block the network and capture downloads.",
  saas: "<code>convert/runtime/runner.py</code> (381 lines: runs a client's HTML tool headlessly), <code>convert/pipeline.py</code> (the baseline run), <code>convert/runtime/worker.py</code>.",
  lessons: [
    {
      t: "Playwright basics",
      sub: ["Installing Playwright and a browser", "Browser, context, page", "Sync vs async API", "goto, title, content, screenshot", "Headless vs headed mode"],
      body: `<p><b>Playwright</b> controls Chromium, Firefox or WebKit from Python. A <b>browser</b> holds isolated <b>contexts</b> (like private windows, each with its own cookies), and each context has <b>pages</b> (tabs).</p>
<p>Convert mode runs a company's HTML tool exactly as a person would, but headless (no visible window) inside a container. Start with the sync API to learn; SaaSForge uses the async API because it waits on many events at once.</p>`,
      lang: "python",
      code: `# pip install playwright   then:  playwright install chromium
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 800}, accept_downloads=True)
    page = context.new_page()
    page.goto("https://example.com")
    print(page.title())
    print(page.locator("h1").inner_text())
    page.screenshot(path="example.png", full_page=True)
    browser.close()

# Async version (what runner.py uses):
# import asyncio
# from playwright.async_api import async_playwright
# async def main():
#     async with async_playwright() as p:
#         browser = await p.chromium.launch()
#         page = await browser.new_page()
#         await page.goto("file:///path/to/tool.html")
#         print(await page.title())
# asyncio.run(main())`,
      ex: "Open a local HTML file of your own with <code>page.goto('file:///...')</code>, take a screenshot and print the text of every button on the page.",
      q: ["What is a browser context?", ["A tab", "An isolated session with its own cookies and storage", "A screenshot", "The DOM"], 1, "Contexts are like separate private windows within one browser."]
    },
    {
      t: "Locators, actions and waiting",
      sub: ["Locators: get_by_role, get_by_label, CSS, text", "click, fill, select_option, set_input_files", "Auto-waiting and explicit waits", "Reading results: inner_text, is_visible, evaluate", "Detecting 'done': stable content and progress signals"],
      body: `<p>A <b>locator</b> describes how to find an element; Playwright re-finds it and <b>waits</b> until it is visible and enabled before acting, which removes most flaky sleeps.</p>
<p>The hard part of automating someone else's tool is knowing when it has <b>finished</b>. <code>runner.py</code> watches for a progress element to disappear, step indicators to reach a done state, an error message to appear, or the page content to stop changing for <code>stable_s</code> seconds, with an overall timeout.</p>`,
      lang: "python",
      code: `import time
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

def run_tool(path: str, input_file: str, timeout_s: int = 120, stable_s: int = 5) -> str:
    with sync_playwright() as p:
        page = p.chromium.launch().new_page()
        page.goto(f"file://{path}")
        page.locator("input[type=file]").first.set_input_files(input_file)
        page.get_by_label("Interest rate").fill("10.5")
        page.get_by_role("button", name="Run analysis").click()

        try:
            page.locator("#progress").wait_for(state="hidden", timeout=timeout_s * 1000)
        except PWTimeout:
            pass                                          # fall back to stability check

        last, since, t0 = None, time.time(), time.time()
        while time.time() - t0 < timeout_s:               # wait until the report stops changing
            html = page.locator("#report").inner_html()
            if html != last:
                last, since = html, time.time()
            elif time.time() - since >= stable_s:
                break
            if page.locator(".error").first.is_visible():
                raise RuntimeError(page.locator(".error").first.inner_text())
            time.sleep(0.5)
        return page.evaluate("() => document.querySelector('#report').innerText")`,
      ex: "Write a small HTML tool that takes a CSV upload and shows a summary after a random 1-5 second delay. Automate it with Playwright and detect completion without a fixed sleep.",
      q: ["What does Playwright do before clicking a locator?", ["Nothing", "Waits until the element is attached, visible, stable and enabled", "Scrolls to the top", "Reloads the page"], 1, "Auto-waiting makes actions robust without manual sleeps."]
    },
    {
      t: "Network interception and downloads",
      sub: ["page.route: inspect every request", "Blocking all outside traffic", "Serving the tool from a fake origin", "Capturing downloads: expect_download, save_as", "Injecting scripts before the page loads (add_init_script)"],
      body: `<p>A client's tool might try to call home or load trackers. <code>runner.py</code> registers a <b>route</b> handler (<code>gate</code>) that aborts every request except to its own fake origin <code>http://engine.local/</code>, from which it serves the tool file. The tool runs fully offline and nothing leaks.</p>
<p>Many tools produce their result as a download (an Excel report). Playwright captures downloads so the runner can save them into the case folder. <code>add_init_script</code> injects code before the tool's own scripts, useful for recording state.</p>`,
      lang: "python",
      code: `from pathlib import Path
from playwright.sync_api import sync_playwright

ORIGIN = "http://engine.local/"

def run_offline(tool: Path, out: Path):
    out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        context = p.chromium.launch().new_context(accept_downloads=True)
        page = context.new_page()

        def gate(route):
            url = route.request.url
            if url == ORIGIN or url == ORIGIN + "index.html":
                route.fulfill(status=200, content_type="text/html", body=tool.read_text(encoding="utf-8"))
            elif url.startswith(ORIGIN):
                route.fulfill(status=404, body="")
            else:
                print("blocked", url)
                route.abort()                             # nothing leaves the sandbox
        context.route("**/*", gate)

        context.add_init_script("window.__forge = { started: Date.now() };")
        page.goto(ORIGIN)

        with page.expect_download(timeout=60_000) as info:
            page.get_by_role("button", name="Download report").click()
        d = info.value
        d.save_as(out / d.suggested_filename)
        print("saved", d.suggested_filename)`,
      ex: "Add a <code>fetch('https://example.com')</code> call to your test tool and confirm the gate blocks it. Then make the tool offer a CSV download and capture it.",
      q: ["Why serve the tool from a fake origin instead of file://?", ["file:// is slower", "So every request goes through the route gate and can be allowed or blocked", "Playwright cannot open files", "For HTTPS"], 1, "A controlled origin puts all traffic under the interception handler."]
    },
    {
      t: "Running browser jobs as a service",
      sub: ["One subprocess per job; progress files", "Timeouts and cleanup of stuck browsers", "Golden runs: record expected output once", "Comparing new runs to the golden output", "Heavier container limits for browsers (shm, memory)"],
      body: `<p>In a generated convert-mode platform, each upload becomes a case. The worker launches <code>runner.py</code> as a subprocess with a timeout, the runner writes progress to a JSON file the API reads, and results (report tabs and downloads) land in the case folder.</p>
<p>At build time SaaSForge does a <b>baseline run</b> with your sample file and saves the result as <code>golden.json</code>. The generated test suite reruns the sample inside Docker and checks the output still matches, which proves the wrapped tool works in the container. Browsers need more memory and processes, so <code>sandbox.HEAVY_HARDEN</code> raises the limits for these apps.</p>`,
      lang: "python",
      code: `import hashlib, json, subprocess, sys
from pathlib import Path

def run_case(case_dir: Path, tool: Path, input_file: Path, timeout: int = 1800) -> dict:
    cmd = [sys.executable, "-m", "app.runner", str(tool), str(input_file), str(case_dir)]
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return {"status": "failed", "error": f"timed out after {timeout}s"}
    if p.returncode != 0:
        return {"status": "failed", "error": p.stderr[-1500:]}
    return json.loads((case_dir / "result.json").read_text())

def fingerprint_output(result: dict) -> dict:
    """What must stay the same between runs (ignore timestamps and ids)."""
    return {
        "tabs": [t["title"] for t in result.get("tabs", [])],
        "downloads": sorted(d["name"] for d in result.get("downloads", [])),
        "text_sha": hashlib.sha256(result.get("text", "").encode()).hexdigest()[:16],
    }

def test_sample_matches_golden(tmp_path):
    golden = json.loads(Path("tests/fixtures/golden.json").read_text())
    result = run_case(tmp_path, Path("app/engine/original.html"), Path("tests/fixtures/sample.bin"))
    assert result["status"] == "done"
    assert fingerprint_output(result) == golden`,
      ex: "Turn your test tool into a mini service: a FastAPI upload endpoint that queues a case, a worker that runs the Playwright script in a subprocess, and an endpoint that returns the result.",
      q: ["What does the golden test prove?", ["The UI looks nice", "The wrapped tool still produces the expected output inside the container", "The database is fast", "The model is accurate"], 1, "It compares a fresh run against output recorded at build time."]
    }
  ]
});

COURSE.push({
  n: 18, id: "testing", title: "Testing", level: 5,
  blurb: "Prove your code works and keeps working: pytest, fixtures, parametrisation, API tests, mocks and golden files.",
  saas: "<code>platform/runtime/test_platform.py</code> (the suite every generated app gets), <code>convert/runtime/test_convert.py</code>, the conftest string in <code>scaffold.py</code>, and SaaSForge's own 57 tests.",
  lessons: [
    {
      t: "pytest fundamentals",
      sub: ["Test discovery: test_*.py, test_ functions", "Plain assert and helpful failure output", "pytest.raises for expected errors", "Running: -q, -x, -k, --lf", "Arrange, act, assert"],
      body: `<p>pytest finds files named <code>test_*.py</code> and runs every function starting with <code>test_</code>. You write plain <code>assert</code> statements and pytest shows you exactly which values differed when one fails.</p>
<p>Test the pure functions first: they are easiest and catch the most bugs per line. <code>snake()</code>, <code>infer_type()</code>, <code>evaluate()</code> and <code>normalize_plan()</code> are all perfect targets.</p>`,
      lang: "python",
      code: `# test_basics.py      run with:  pytest -q
import pytest
from safe_expr import evaluate
from plan_utils import snake

def test_snake_handles_spaces_and_case():
    assert snake("Loan Amount") == "loan_amount"
    assert snake("loanAmount") == "loan_amount"

def test_emi_matches_bank_formula():
    value = evaluate("emi(amount, rate, months)", {"amount": 100000, "rate": 12, "months": 12})
    assert value == pytest.approx(8884.88, abs=0.01)

def test_attribute_access_is_rejected():
    with pytest.raises(ValueError, match="not allowed"):
        evaluate("().__class__", {})

def test_division_by_zero_returns_none():
    assert evaluate("a / b", {"a": 1, "b": 0}) is None

# pytest -x       stop at first failure
# pytest -k emi   only tests whose name contains "emi"
# pytest --lf     rerun only the last failures`,
      ex: "Write at least eight tests for the safe evaluator you built in Module 15, including three that prove dangerous input is rejected.",
      q: ["How does pytest know a function is a test?", ["A @test decorator", "Its name starts with test_ in a test_*.py file", "It returns True", "It is in a tests class"], 1, "Discovery is by naming convention."]
    },
    {
      t: "Fixtures and parametrize",
      sub: ["@pytest.fixture: setup shared by tests", "Fixture scope: function, module, session", "Fixtures using fixtures; yield for teardown", "conftest.py: fixtures for a whole folder", "@pytest.mark.parametrize: one test, many cases"],
      body: `<p>A <b>fixture</b> prepares something a test needs (a client, a database, a signed-in admin) and hands it in by name. Put shared fixtures in <code>conftest.py</code>.</p>
<p><b>parametrize</b> runs one test for many inputs. SaaSForge's generated suite parametrises over every entity and every role, so an app with 4 entities and 3 roles gets dozens of permission tests from a few functions.</p>`,
      lang: "python",
      code: `import pytest

ROLES = ["officer", "manager", "viewer"]
ENTITIES = ["loan", "borrower"]
PERMS = {("viewer", "loan"): {"read"}, ("viewer", "borrower"): {"read"},
         ("officer", "loan"): {"create", "read", "update"}, ("officer", "borrower"): {"create", "read"},
         ("manager", "loan"): {"create", "read", "update", "delete"},
         ("manager", "borrower"): {"create", "read", "update", "delete"}}

@pytest.fixture
def db(tmp_path):
    path = tmp_path / "test.db"            # fresh database per test
    yield str(path)
    # teardown runs here

@pytest.fixture
def make_user(db):
    def make(role: str) -> dict:
        return {"role": role, "db": db}
    return make

@pytest.mark.parametrize("role", ROLES)
@pytest.mark.parametrize("entity", ENTITIES)
@pytest.mark.parametrize("action", ["create", "read", "update", "delete"])
def test_permission_matrix(make_user, role, entity, action):
    user = make_user(role)
    allowed = action in PERMS[(role, entity)]
    assert can(user, entity, action) is allowed       # 3 x 2 x 4 = 24 tests

@pytest.mark.parametrize("raw,expected", [("12", "int"), ("1.5", "float"), ("2026-01-02", "date"), ("hello", "str")])
def test_infer_type(raw, expected):
    assert infer_type([raw, raw, raw])[0] == expected`,
      ex: "Write a conftest.py with a <code>client</code> fixture for your FastAPI app and an <code>admin_headers</code> fixture that registers and logs in an admin. Compare with the conftest in scaffold.py.",
      q: ["Stacking three parametrize decorators with 3, 2 and 4 values creates how many tests?", ["9", "24", "3", "12"], 1, "Parametrize decorators multiply: 3 × 2 × 4 = 24."]
    },
    {
      t: "Testing APIs with TestClient",
      sub: ["fastapi.testclient.TestClient", "Isolated test databases via environment variables", "Testing auth flows: register, login, headers", "Testing permissions and isolation between users", "Testing uploads and downloads"],
      body: `<p><code>TestClient</code> calls your FastAPI app in-process, with no server, so API tests are fast. Point the app at a temporary database by setting <code>DATABASE_URL</code> before importing it, as the scaffold's conftest does.</p>
<p>The most valuable API tests check <b>isolation</b>: user A creates a record, user B with an "own records" role must not see it in lists or fetch it by id. That one test catches the bugs that leak data between customers.</p>`,
      lang: "python",
      code: `import os, tempfile
os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mkdtemp()}/test.db"   # before importing the app
os.environ["SECRET_KEY"] = "test-secret"

import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:            # runs lifespan: tables get created
        yield c

def signup(client, email, role=None):
    client.post("/api/auth/register", json={"email": email, "password": "pw-123456"})
    token = client.post("/api/auth/login", json={"email": email, "password": "pw-123456"}).json()["token"]
    return {"Authorization": f"Bearer {token}"}

def test_requires_login(client):
    assert client.get("/api/loans").status_code == 401

def test_officers_only_see_their_own_records(client):
    a, b = signup(client, "a@x.com"), signup(client, "b@x.com")
    rid = client.post("/api/loans", json={"amount": 1000, "months": 12}, headers=a).json()["id"]
    assert client.get(f"/api/loans/{rid}", headers=b).status_code == 404
    assert all(r["id"] != rid for r in client.get("/api/loans", headers=b).json()["items"])

def test_csv_export(client):
    h = signup(client, "c@x.com")
    r = client.get("/api/loans/export.csv", headers=h)
    assert r.status_code == 200 and r.headers["content-type"].startswith("text/csv")`,
      ex: "Write an isolation test, an invalid-body test (expect 422) and a role-change test for your capstone app. Make one of them fail on purpose and read pytest's output.",
      q: ["Why set DATABASE_URL before importing the app in tests?", ["Speed", "The app reads it at import time; tests must never touch your real database", "TestClient requires it", "For logging"], 1, "Module-level configuration is read on import, so set it first."]
    },
    {
      t: "Mocks, fakes and golden files",
      sub: ["monkeypatch: replace functions and env vars", "Fakes: a fake LLM, a fake runner", "Never call paid APIs or the network in unit tests", "Golden files: record expected output, compare later", "Testing the agent loop end to end with fakes"],
      body: `<p>Tests must be fast, free and repeatable, so replace slow or external things with <b>fakes</b>. <code>test_convert.py</code> swaps the real browser runner for a tiny fake script with <code>monkeypatch</code>, so the whole case lifecycle is tested in seconds without a browser.</p>
<p>To test an agent, give it a fake LLM that returns canned replies in order. You can then test the clarify, plan, fix loop deterministically, including failure paths that are hard to trigger with a real model.</p>`,
      lang: "python",
      code: `import json
import pytest

class FakeLLM:
    def __init__(self, replies: list[str]):
        self.replies, self.prompts = list(replies), []
    def complete(self, system: str, user: str, **kw) -> str:
        self.prompts.append(user)
        if not self.replies:
            raise AssertionError("model called more times than expected")
        return self.replies.pop(0)

GOOD_PLAN = json.dumps({"name": "Loans", "slug": "loans", "roles": [{"name": "officer"}],
                        "entities": [{"name": "loan", "fields": [{"name": "amount", "type": "float", "required": True}]}]})

def test_fix_loop_recovers_after_one_failure(monkeypatch):
    llm = FakeLLM([GOOD_PLAN, GOOD_PLAN])           # initial plan, then the fixed plan
    results = iter([("tests", "AssertionError: amount"), (None, "")])
    monkeypatch.setattr("agent.verify", lambda files: next(results))
    out = build_with_fixes(make_plan(llm, "loan tracker"), llm, generate, verify, max_fixes=2)
    assert out["ok"] and out["attempts"] == 2
    assert "AssertionError" in llm.prompts[-1]       # the failure was fed back

def test_missing_key_message(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    with pytest.raises(LLMError, match="No API key"):
        LLM()

def test_report_matches_golden(tmp_path):
    result = build_report(sample_rows())
    golden = tmp_path.parent / "golden.json"          # in a real suite: tests/fixtures/golden.json
    if not golden.exists():
        golden.write_text(json.dumps(result, indent=2, sort_keys=True))
    assert result == json.loads(golden.read_text())`,
      ex: "Write an end-to-end test of your own agent (capstone 5) with a FakeLLM: a bad plan first, a good plan second, and a verify step that fails once.",
      q: ["Why use a fake LLM in tests?", ["Real models are inaccurate", "Tests become free, fast and deterministic, and can force failure paths", "pytest cannot use httpx", "To hide keys"], 1, "Canned replies make the agent's behaviour repeatable and testable."]
    }
  ]
});

COURSE.push({
  n: 19, id: "deploy", title: "CI/CD and deployment", level: 5,
  blurb: "Ship it: configuration, secrets, continuous integration, hosting, managed databases and running in production.",
  saas: "<code>deploy.py</code> (writes Dockerfile, compose, render.yaml, CI workflow, README, .env.example), the generated <code>.github/workflows/ci.yml</code> and <code>render.yaml</code>.",
  lessons: [
    {
      t: "Configuration and secrets",
      sub: ["The twelve-factor app: config in the environment", ".env files for local development", ".env.example committed, .env ignored", "Generating strong secrets", "Failing fast when required config is missing"],
      body: `<p>Code is the same in every environment; <b>configuration</b> (database URL, secret key, API keys, feature limits) differs, so it comes from environment variables. Locally a <code>.env</code> file fills them in; in production the host does.</p>
<p>Never commit secrets. Commit <code>.env.example</code> with names and blank values. The generated <code>auth.py</code> refuses to start without <code>SECRET_KEY</code> rather than silently using a weak default, which is the right behaviour: fail fast and loudly.</p>`,
      lang: "python",
      code: `import os, secrets, sys
from pathlib import Path

def load_dotenv(path: Path = Path(".env")) -> None:
    """Tiny .env loader, like the one in saasforge/cli.py."""
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

def require(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        sys.exit(f"Missing required setting {name}. Copy .env.example to .env and fill it in.")
    return value

load_dotenv()
SECRET_KEY = require("SECRET_KEY")
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./data/app.db")
MAX_UPLOAD_MB = int(os.environ.get("MAX_UPLOAD_MB", "50"))

# make a strong secret:  python -c "import secrets; print(secrets.token_urlsafe(48))"
# .gitignore:   .env   data/   __pycache__/`,
      ex: "Audit your capstone repo: move every hard-coded secret or URL into environment variables, create .env.example, and check <code>git log -p</code> to be sure no secret was ever committed.",
      q: ["What should be committed to git?", [".env with real keys", ".env.example with names and blank values", "Both", "Neither"], 1, "The example documents required settings without leaking secrets."]
    },
    {
      t: "Continuous integration with GitHub Actions",
      sub: ["Workflows, jobs, steps, runners", "Triggers: push, pull_request", "Setting up Python, caching pip", "Running tests and building the Docker image", "Status badges and required checks"],
      body: `<p><b>CI</b> runs your tests automatically on every push, so a broken change is caught in minutes, not in production. Every SaaSForge app ships <code>.github/workflows/ci.yml</code>: check out the code, install Python and dependencies, run pytest, then build the Docker image to prove it still builds.</p>`,
      lang: "yaml",
      code: `# .github/workflows/ci.yml
name: CI
on:
  push: { branches: [main] }
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      SECRET_KEY: ci-only-secret
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
      - run: pip install -r requirements.txt -r requirements-dev.txt
      - run: python -m pytest -q

  docker:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build --target test -t app-test . && docker run --rm --network none app-test
      - run: docker build --target final -t app .`,
      ex: "Push your capstone project to GitHub with this workflow. Break a test on purpose, push, watch it fail in the Actions tab, then fix it.",
      q: ["What does <code>needs: test</code> do on the docker job?", ["Runs docker first", "Runs docker only after the test job succeeds", "Runs them in parallel", "Skips tests"], 1, "needs declares a dependency between jobs."]
    },
    {
      t: "Deploying: Render and managed Postgres",
      sub: ["Platform-as-a-service vs a VPS", "Infrastructure as code: render.yaml blueprints", "Managed Postgres (Neon, Render, Supabase)", "Health check paths and zero-downtime deploys", "Persistent disks for uploaded files"],
      body: `<p>A platform-as-a-service builds your Dockerfile and runs it for you. SaaSForge generates a <code>render.yaml</code> <b>blueprint</b>: the service, its Dockerfile, its health check path, its environment variables (with <code>SECRET_KEY</code> generated by Render) and the database URL.</p>
<p>Free managed Postgres from Neon gives you a connection string to put in <code>DATABASE_URL</code>. Remember that container file systems are usually wiped on each deploy: anything users upload needs a persistent disk or object storage.</p>`,
      lang: "yaml",
      code: `# render.yaml
services:
  - type: web
    name: loan-desk
    runtime: docker
    dockerfilePath: ./Dockerfile
    dockerContext: .
    plan: free
    healthCheckPath: /health
    envVars:
      - key: SECRET_KEY
        generateValue: true            # Render creates a strong random value
      - key: DATABASE_URL
        sync: false                    # paste your Neon connection string in the dashboard
      - key: DEFAULT_ROLE
        value: viewer

# Neon: create a project at neon.tech, copy the connection string:
#   postgresql://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require
# Use the psycopg driver in SQLAlchemy:
#   postgresql+psycopg://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require`,
      ex: "Deploy capstone project 3 to Render with a Neon database. Register a user on the live URL, redeploy, and confirm the user still exists.",
      q: ["Why might uploaded files vanish after a redeploy?", ["Render deletes users", "The container's file system is replaced on each deploy unless you use a persistent disk", "Postgres limits", "CI deletes them"], 1, "Containers are disposable; durable data needs a database, disk or object store."]
    },
    {
      t: "Running in production",
      sub: ["Structured logs and log levels", "Health and readiness endpoints", "Error monitoring and alerts", "Backups and restores", "Releases: versioning, changelogs, rollbacks"],
      body: `<p>Production is where you find out what you missed. Log in a structured way (JSON lines with a request id), expose <code>/health</code> for the platform to check, and use an error tracker so exceptions reach you instead of disappearing.</p>
<p>Back up the database and actually practise restoring. Tag releases so you can roll back. SaaSForge's <code>.forge/report.json</code> is a small version of this idea: a record of every build attempt and why it passed or failed.</p>`,
      lang: "python",
      code: `import json, logging, time, uuid
from fastapi import FastAPI, Request

class JsonFormatter(logging.Formatter):
    def format(self, record):
        base = {"t": round(time.time(), 3), "level": record.levelname, "msg": record.getMessage()}
        base.update(getattr(record, "extra_fields", {}))
        return json.dumps(base)

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
log = logging.getLogger("app")
log.addHandler(handler)
log.setLevel(logging.INFO)

app = FastAPI()

@app.middleware("http")
async def access_log(request: Request, call_next):
    rid, t0 = uuid.uuid4().hex[:8], time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        log.exception("unhandled", extra={"extra_fields": {"rid": rid, "path": request.url.path}})
        raise
    log.info("request", extra={"extra_fields": {"rid": rid, "method": request.method, "path": request.url.path,
             "status": response.status_code, "ms": round((time.perf_counter() - t0) * 1000, 1)}})
    response.headers["X-Request-Id"] = rid
    return response

@app.get("/health")
def health():
    return {"ok": True, "version": "1.4.0"}`,
      ex: "Add JSON logging and a request id to your deployed app. Trigger an error and find it in Render's log viewer by request id.",
      q: ["Why include a request id in logs and responses?", ["Security", "To find every log line for one user's failing request", "It is required by HTTP", "To count users"], 1, "A correlation id ties together everything that happened for one request."]
    }
  ]
});

COURSE.push({
  n: 20, id: "design", title: "Software design", level: 5,
  blurb: "The thinking that turns skills into systems: layers, boundaries, defensive code, designing for failure and planning your own platform.",
  saas: "<code>ARCHITECTURE.md</code>, then the whole package seen as layers: interface, API, agent core, brain, inputs, engine, verification, delivery.",
  lessons: [
    {
      t: "Layered architecture and boundaries",
      sub: ["Separation of concerns", "Layers and the direction of dependencies", "Interfaces at the boundaries (Interaction, LLM, Sandbox)", "Pure core, side effects at the edges", "Drawing your system before building it"],
      body: `<p>SaaSForge is eight layers, each with one job: the interface talks to people, the API moves data, the agent core orchestrates, the brain calls models, inputs parse files, the engine builds apps, verification tests them, delivery packages them. Each layer only calls the ones below it.</p>
<p>Boundaries are small interfaces: the agent only knows <code>llm.complete()</code>, <code>interact.ask()</code>, <code>Sandbox.build()</code>. That is why you can swap Gemini for Groq, the web UI for a CLI, or Docker for a fake in tests without touching the agent.</p>`,
      lang: "text",
      code: `            ┌────────────────────────────────────────────┐
 Interface  │ web/index.html (chat, plan cards) · cli.py │
            └───────────────────┬────────────────────────┘
 API        │ server.py: jobs, SSE, uploads, previews    │
            └───────────────────┬────────────────────────┘
 Agent core │ agent.py: clarify → plan → generate → verify → fix
            └──────┬────────────┬───────────────┬────────┘
 Brain      │ planner, chat, llm │  Inputs │ files, htmlslim, analyzer
            └──────┬─────────────┘         └────────┘
 Engine     │ platform/plan.py → codegen.py → runtime/*  (no LLM)
            └───────────────────┬────────────────────────┘
 Verify     │ sandbox.py: docker build → tests → boot → smoke
            └───────────────────┬────────────────────────┘
 Delivery   │ deploy.py: Dockerfile, compose, render.yaml, CI, ZIP

Rule: arrows point down. The engine never imports the server;
the LLM client never knows about Docker.`,
      ex: "Draw the layers of your capstone 7 platform on paper before writing code: boxes, one-line responsibilities and the interface each layer exposes to the one above.",
      q: ["Why does the agent depend on a small LLM interface rather than on Gemini directly?", ["Gemini is unreliable", "So providers can be swapped or faked without changing the agent", "To save tokens", "Python requires interfaces"], 1, "Depending on a narrow interface isolates change."]
    },
    {
      t: "Defensive programming",
      sub: ["Validate at every boundary", "Degrade gracefully with visible warnings", "Fail fast on programmer errors and missing config", "Limits on everything: size, time, count, attempts", "Clear error messages that say how to fix the problem"],
      body: `<p>SaaSForge assumes every input can be wrong: model output, uploaded files, user answers, the network, Docker. Each boundary validates and either repairs, drops with a warning, or fails with a clear message.</p>
<p>Notice how many numeric limits exist: <code>MAX_FILE</code>, <code>MAX_ROWS</code>, <code>MAX_IDS</code>, <code>max_fixes</code>, revision cap of 4, test timeout 240 s, formula length 200, cooldown 300 s. Every unbounded thing eventually breaks; limits make failure predictable.</p>`,
      lang: "python",
      code: `MAX_FILE = 6_000_000
MAX_TOTAL = 15_000_000
MAX_ROWS = 20_000

class FileError(ValueError):
    """A problem the user can fix: message says how."""

def check_uploads(files: list[dict]) -> list[str]:
    warnings, total = [], 0
    for f in files:
        size = len(f["raw"])
        if size > MAX_FILE:
            raise FileError(f"{f['name']} is {size / 1e6:.1f} MB; the limit is {MAX_FILE / 1e6:.0f} MB. "
                            "Upload a smaller extract or split the file.")
        total += size
        if not f["name"].lower().endswith((".csv", ".xlsx", ".pdf", ".docx", ".txt", ".html")):
            warnings.append(f"Skipped {f['name']}: unsupported type")   # degrade, don't crash
    if total > MAX_TOTAL:
        raise FileError(f"Uploads total {total / 1e6:.1f} MB; the limit is {MAX_TOTAL / 1e6:.0f} MB.")
    return warnings

# Bad error:  "Error 17"           Good error: says what happened and what to do next.`,
      ex: "List every input your capstone app accepts. For each, write down its limit, what happens when it is exceeded and the exact message the user sees. Then implement what is missing.",
      q: ["What does 'degrade gracefully' mean in SaaSForge?", ["Run slower", "Drop the broken part with a visible warning and continue", "Retry forever", "Hide all errors"], 1, "Partial success with honest warnings beats a crash."]
    },
    {
      t: "Designing for failure and reliability",
      sub: ["Everything fails: networks, models, disks, Docker", "Retries, fallbacks and cooldowns (recap)", "Idempotent operations and safe re-runs", "Cleanup in finally blocks", "Observability: events, reports, logs you can read later"],
      body: `<p>Reliable systems expect failure and plan for each kind. SaaSForge retries transient model errors, falls back across providers, stops fix loops that repeat, always cleans up Docker images in a <code>finally</code>, writes a report of every attempt, and keeps job history on disk so a restart loses nothing.</p>
<p>Ask of every step: what if it fails halfway? Can it be run again safely? Who will notice, and how will they know what happened?</p>`,
      lang: "python",
      code: `import json, time
from pathlib import Path

def build(plan: dict, out: Path, sandbox, max_fixes: int = 3) -> dict:
    report = {"started": time.time(), "attempts": [], "ok": False}
    try:
        for attempt in range(max_fixes + 1):
            stage, log = sandbox.verify(plan)
            report["attempts"].append({"n": attempt, "failed_stage": stage, "log_tail": log[-1500:] if stage else ""})
            if stage is None:
                report["ok"] = True
                break
            plan = repair(plan, stage, log)
    except Exception as e:                       # unexpected: record it, then re-raise
        report["error"] = f"{type(e).__name__}: {e}"
        raise
    finally:
        sandbox.cleanup()                         # always free containers and images
        report["seconds"] = round(time.time() - report["started"], 1)
        (out / ".forge").mkdir(parents=True, exist_ok=True)
        (out / ".forge" / "report.json").write_text(json.dumps(report, indent=2))
    return report`,
      ex: "Kill your capstone agent halfway through a build (Ctrl+C). Check what state it left behind, then change the code so a re-run cleans up and continues safely.",
      q: ["Why is sandbox.cleanup() in a finally block?", ["Style", "It must run whether the build succeeds, fails or raises", "finally is faster", "To log errors"], 1, "finally guarantees cleanup on every exit path."]
    },
    {
      t: "How to design your own platform",
      sub: ["Start from the user's job and the one hard problem", "Choose where AI is used and where code must be deterministic", "Write the plan or schema first", "Build the thinnest end-to-end slice, then deepen", "Write down decisions and honest limits (ARCHITECTURE.md)"],
      body: `<p>Every platform you build will follow the same method SaaSForge did. Name the user and the job. Find the one hard problem (for SaaSForge: free models cannot reliably write whole apps). Decide what the model does and what deterministic code does. Define the contract between them as a schema. Build one thin slice from input to deployed output, then improve each layer.</p>
<p>Finally write an architecture note: the layers, the workflow, the key decisions and why, the tech stack and what the system honestly cannot do. Writing it forces clear thinking and lets others (and future you) understand the system.</p>`,
      lang: "text",
      code: `PLATFORM DESIGN TEMPLATE

1. User and job      Who uses it? What do they want done, in one sentence?
2. Hard problem      What makes this difficult? What fails if you do it naively?
3. AI vs code        Which decisions need judgement (model)?
                     Which steps must be exact and tested (code)?
4. Contract          The schema the model must produce. Validation rules.
5. Workflow          Numbered steps from input to output. Where people approve.
6. Layers            Interface / API / core / brain / inputs / engine / verify / deliver
7. Failure plan      For each step: what can fail, retry or fallback, how it is reported
8. Limits            Sizes, timeouts, attempts, costs
9. Thin slice        The smallest end-to-end version you will build first
10. Honest limits    What it will not do (say so in the product too)

Example, SaaSForge:
1 business owner -> working internal platform   2 free models write broken apps
3 model: questions + JSON plan; code: everything else   4 PLAN_SCHEMA + normalize_plan
5 intake, clarify, plan(approve), generate, verify, fix, deliver ...`,
      ex: "Fill in this template for a platform you would like to build next (for example, an AI that turns invoices into accounting entries). Then build its thin slice using everything from this course.",
      q: ["What should you build first?", ["The full UI", "The thinnest slice that goes from real input to real output end to end", "The database schema only", "The marketing site"], 1, "A thin end-to-end slice exposes integration problems early."]
    }
  ]
});

window.PROJECTS = [
  { n: 1, title: "To-do API with sign-in", modules: [1, 2, 3, 4, 5, 6, 8],
    goal: "A FastAPI + SQLAlchemy API where users register, log in and manage only their own tasks.",
    checklist: ["Register and login with scrypt hashes and HMAC tokens", "CRUD for tasks with Pydantic In/Out models", "Each user sees only their own tasks (404 otherwise)", "Pagination, search and a status filter", "Explore and test every route from /docs"] },
  { n: 2, title: "Frontend and CSV import", modules: [7, 16],
    goal: "A no-framework single-page frontend for project 1, plus importing tasks from CSV or Excel.",
    checklist: ["Sign-in screen, list with pagination, create and edit forms", "Hash routes (#/tasks/12) with working back button", "All untrusted text rendered with textContent", "CSV/XLSX import with type inference and a per-row error report", "Dark mode and phone layout using CSS tokens"] },
  { n: 3, title: "Docker, tests and CI", modules: [10, 18, 19],
    goal: "Make project 2 production-grade: containerised, tested and deployed.",
    checklist: ["Multi-stage Dockerfile: base, test, final", "pytest suite: auth, isolation, validation, import", "Hardened test run: --network none, --read-only, limits", "GitHub Actions running tests and the Docker build", "Deployed on Render with Neon Postgres"] },
  { n: 4, title: "Reliable LLM client", modules: [11, 12],
    goal: "A small library that gets valid JSON from free models, reliably.",
    checklist: ["Providers for Gemini and Groq via one OpenAI-compatible function", "Retries with Retry-After and backoff; fail fast on 4xx", "Fallback chain with cooldowns", "extract_json that survives fences and trailing commas", "Tests with a fake HTTP layer"] },
  { n: 5, title: "Mini agent: plan, generate, test, fix", modules: [9, 13, 14, 15],
    goal: "An agent that turns a one-line brief into a JSON spec, generates a tiny app from it, tests it and repairs the spec when tests fail.",
    checklist: ["Clarifying questions and plan approval via an Interaction object", "normalize_spec with aliases, reserved names and warnings", "Generator that writes files from the spec (no model-written code)", "Verify in a hardened container; fix loop with fingerprints", "Progress streamed to a browser over SSE from a background thread"] },
  { n: 6, title: "Wrap an HTML tool", modules: [16, 17, 9],
    goal: "Take any single-file HTML tool and run it headlessly as a multi-user service.",
    checklist: ["Scan the HTML: inputs, buttons, functions, ids", "Playwright runner with a network gate and download capture", "Upload endpoint, job queue, worker subprocesses, cancel", "Golden run and a test that compares fresh output to it", "Roles: admin, reviewer, viewer, with an audit log"] },
  { n: 7, title: "Your own SaaSForge", modules: [20],
    goal: "Combine projects 1-6 into a platform that builds platforms. Then design and build something new with the same method.",
    checklist: ["Fill in the platform design template first", "Interface, API, agent core, brain, inputs, engine, verify, deliver", "Spec-driven runtime with a generic CRUD router and safe formulas", "Every generated app ships tests, Dockerfile, compose, CI and render.yaml", "ARCHITECTURE.md with decisions and honest limits"] }
];
