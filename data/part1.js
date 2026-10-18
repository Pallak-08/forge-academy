/* Forge Academy course data, modules 1-4 */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 1, id: "python-basics", title: "Python basics", level: 1,
  blurb: "The language every other module is written in. Values, control flow, functions, collections, classes and errors.",
  saas: "Every file in SaaSForge. Read <code>saasforge/cli.py</code> first: it is short and uses almost everything in this module.",
  lessons: [
    {
      t: "Values, types and variables",
      sub: ["int, float, str, bool, None", "Variables are names pointing at objects", "f-strings and string methods", "Type conversion: int(), str(), float()", "Truthiness: what counts as False"],
      body: `<p>A Python program manipulates <b>values</b>. Every value has a <b>type</b> that decides what you can do with it. A variable is only a name that points at a value, so the same name can later point at something else.</p>
<p>Strings are the type you will touch most in an AI agent: prompts, file contents and model replies are all strings. Learn slicing, <code>.strip()</code>, <code>.split()</code>, <code>.join()</code>, <code>.lower()</code> and f-strings until they are automatic.</p>
<p><b>Truthiness</b> matters everywhere: empty strings, <code>0</code>, <code>None</code>, empty lists and empty dicts are all treated as False in an <code>if</code>.</p>`,
      lang: "python",
      code: `name = "SaaSForge"
version = 3
ratio = 0.85
ready = True
nothing = None

print(type(name), type(version), type(ratio))
print(f"{name} v{version} is {ratio:.0%} done")   # SaaSForge v3 is 85% done

brief = "  Build a loan tracker for my team  "
clean = brief.strip()
words = clean.lower().split()          # ['build', 'a', 'loan', 'tracker', ...]
slug = "-".join(words[-3:])            # 'tracker-for-my' -> last three words
print(clean[:5], len(clean), slug)

print(int("42") + 1, str(7) + "7", float("3.5"))

for v in ["", "x", 0, 12, None, [], [0], {}]:
    print(repr(v), "->", bool(v))`,
      ex: "Write a function <code>slugify(text)</code> that lowercases a string, keeps only letters, digits and spaces, and joins the words with hyphens. <code>slugify('Loan Tracker v2!')</code> should return <code>'loan-tracker-v2'</code>.",
      q: ["Which of these values is truthy?", ["0", "\"\"", "[0]", "None"], 2, "A list with one element is not empty, so it is truthy even though the element itself is 0."]
    },
    {
      t: "Control flow and functions",
      sub: ["if / elif / else", "for loops, range(), enumerate(), zip()", "while, break, continue", "Defining functions, return values", "Default, keyword, *args and **kwargs parameters"],
      body: `<p>Control flow decides which lines run. Functions package lines under a name so you can reuse and test them. Almost every SaaSForge file is a set of small functions that each do one job.</p>
<p>Pay attention to <b>parameters</b>. Defaults (<code>max_fixes=4</code>) make a function easy to call; keyword arguments (<code>build_app(html, req, sandbox=False)</code>) make calls readable; <code>*args</code> and <code>**kwargs</code> collect extra positional and keyword arguments.</p>
<p>Never use a mutable value such as <code>[]</code> as a default. Use <code>None</code> and create the list inside the function, which is exactly what <code>attachments = attachments or []</code> does in <code>agent.py</code>.</p>`,
      lang: "python",
      code: `def retry_wait(attempt: int, base: float = 15, cap: float = 60) -> float:
    """Seconds to wait before retry number \`attempt\` (1-based)."""
    return min(base * attempt, cap)

for attempt in range(1, 6):
    print(attempt, retry_wait(attempt))      # 15, 30, 45, 60, 60

def classify(status: int) -> str:
    if status == 200:
        return "ok"
    elif status in (429, 500, 502, 503, 504):
        return "retry"
    else:
        return "fail"

for i, code in enumerate([200, 429, 404]):
    print(i, code, classify(code))

def log(*parts, sep=" ", **extra):
    line = sep.join(str(p) for p in parts)
    if extra:
        line += "  " + str(extra)
    print(line)

log("step", "plan", "done", attempt=2)      # step plan done  {'attempt': 2}

def add_item(item, bucket=None):            # never bucket=[]
    bucket = bucket if bucket is not None else []
    bucket.append(item)
    return bucket`,
      ex: "Write <code>should_retry(status, attempt, max_attempts=4)</code> that returns True only when the status is retryable (429 or 5xx) and <code>attempt &lt; max_attempts</code>. Test it with a loop over a few status codes.",
      q: ["Why is <code>def f(x, items=[])</code> a bug?", ["Lists cannot be defaults", "The same list is shared across every call", "It makes the function slower", "Python forbids it"], 1, "Default values are created once, when the function is defined, so every call that relies on the default mutates the same list."]
    },
    {
      t: "Collections and comprehensions",
      sub: ["list: ordered, changeable", "dict: key to value lookups", "set: unique items, fast membership", "tuple: fixed records, multiple return values", "List, dict and set comprehensions", "Unpacking and merging: a, b = ..., {**a, **b}"],
      body: `<p>Data in an agent is mostly lists of dicts: a JSON plan, rows from a CSV, a list of HTTP endpoints. Being fluent with these four collection types is the biggest single jump in productivity you can make.</p>
<p>A <b>comprehension</b> builds a collection from a loop in one expression. <code>{e["name"]: e for e in plan["entities"]}</code> builds a lookup table, which <code>crud.py</code> does at line 30.</p>
<p><code>{**a, **b}</code> merges two dicts (keys in <code>b</code> win). SaaSForge uses it to combine scaffold files with generated files: <code>{**scaffold_files(), **platform_files(plan)}</code>.</p>`,
      lang: "python",
      code: `plan = {
    "entities": [
        {"name": "loan", "fields": ["amount", "rate", "months"]},
        {"name": "borrower", "fields": ["name", "phone"]},
    ],
    "roles": ["admin", "officer", "viewer"],
}

names = [e["name"] for e in plan["entities"]]             # ['loan', 'borrower']
by_name = {e["name"]: e for e in plan["entities"]}        # lookup table
field_count = {e["name"]: len(e["fields"]) for e in plan["entities"]}
all_fields = {f for e in plan["entities"] for f in e["fields"]}   # a set

print(by_name["loan"]["fields"], field_count, "rate" in all_fields)

defaults = {"theme": "light", "page_size": 10}
user_prefs = {"page_size": 25}
settings = {**defaults, **user_prefs}      # {'theme': 'light', 'page_size': 25}

def min_max(xs):
    return min(xs), max(xs)                # returns a tuple

lo, hi = min_max([4, 9, 1])
first, *rest = plan["roles"]               # 'admin', ['officer', 'viewer']
print(settings, lo, hi, first, rest)`,
      ex: "Given a list of CSV-like rows (dicts with 'status' and 'amount'), build a dict mapping each status to the total amount, using a loop and then again using a comprehension over a set of statuses.",
      q: ["What does <code>{**a, **b}</code> do when both dicts have the key 'x'?", ["Raises an error", "Keeps a's value", "Keeps b's value", "Makes a list of both"], 2, "Later unpacked dicts override earlier ones, so b's value wins."]
    },
    {
      t: "Classes, exceptions and modules",
      sub: ["class, __init__, self, methods", "Inheritance and super()", "try / except / else / finally", "Raising and defining custom exceptions", "Modules, packages, imports, __name__ == '__main__'"],
      body: `<p>A <b>class</b> bundles data with the functions that act on it. SaaSForge uses classes for things that hold state over time: <code>LLM</code> (remembers cooldowns), <code>Sandbox</code> (remembers its image tag), <code>Job</code> (remembers its events).</p>
<p><b>Exceptions</b> are how code reports failure. Define your own (<code>class LLMError(RuntimeError)</code>) so callers can catch exactly the failures they know how to handle and let the rest crash loudly.</p>
<p>A <b>module</b> is a .py file; a <b>package</b> is a folder of modules. <code>from .llm import LLM</code> is a relative import inside the package. A <code>__main__.py</code> file lets you run the package with <code>python -m saasforge</code>.</p>`,
      lang: "python",
      code: `class PlanError(ValueError):
    """Raised when a plan cannot be repaired."""
    def __init__(self, problems: list[str]):
        super().__init__("; ".join(problems))
        self.problems = problems

class Counter:
    def __init__(self, name: str):
        self.name = name
        self.calls = 0

    def hit(self) -> int:
        self.calls += 1
        return self.calls

    def __repr__(self) -> str:
        return f"Counter({self.name!r}, calls={self.calls})"

c = Counter("llm")
c.hit(); c.hit()
print(c)                                   # Counter('llm', calls=2)

def validate(plan: dict) -> dict:
    problems = []
    if not plan.get("entities"):
        problems.append("no entities")
    if "admin" not in plan.get("roles", []):
        problems.append("missing admin role")
    if problems:
        raise PlanError(problems)
    return plan

try:
    validate({"roles": ["viewer"]})
except PlanError as e:
    print("bad plan:", e.problems)
else:
    print("plan ok")
finally:
    print("validation finished")

if __name__ == "__main__":                 # runs only when executed directly
    print("running as a script")`,
      ex: "Create a <code>BankAccount</code> class with <code>deposit</code> and <code>withdraw</code>. Raise a custom <code>InsufficientFunds</code> exception when a withdrawal is too large, and catch it in a <code>try/except</code>.",
      q: ["When does the <code>else</code> block of a try statement run?", ["Always", "Only if an exception was raised", "Only if no exception was raised", "Only after finally"], 2, "else runs when the try block finished without raising; finally runs in every case."]
    }
  ]
});

COURSE.push({
  n: 2, id: "advanced-python", title: "Advanced Python", level: 1,
  blurb: "The features professional Python code leans on: type hints, dataclasses, closures, decorators, generators, regex and the standard library.",
  saas: "<code>llm.py</code> (frozen dataclass, properties), <code>agent.py</code> (closures), <code>htmlslim.py</code> (generators), <code>platform/plan.py</code> (regex everywhere).",
  lessons: [
    {
      t: "Type hints",
      sub: ["Annotating variables, parameters and returns", "list[str], dict[str, int], tuple[int, str]", "Optional values: X | None", "from __future__ import annotations", "Checking types with mypy or pyright"],
      body: `<p>Type hints document what a function expects and returns. Python does not enforce them at run time, but editors and checkers such as <b>mypy</b> use them to catch bugs before you run the code.</p>
<p>Every SaaSForge module starts with <code>from __future__ import annotations</code>, which makes annotations lazy strings. That lets you use modern syntax like <code>X | None</code> everywhere and refer to classes before they are defined.</p>
<p>FastAPI and Pydantic read type hints at run time to validate requests, so in web code hints are not optional decoration; they change behaviour.</p>`,
      lang: "python",
      code: `from __future__ import annotations
from typing import Callable, Iterator

def summarize(rows: list[dict[str, str]], limit: int = 5) -> str:
    return "\\n".join(r.get("name", "?") for r in rows[:limit])

def find_role(roles: list[str], wanted: str) -> str | None:
    return wanted if wanted in roles else None

def min_max(xs: list[float]) -> tuple[float, float]:
    return min(xs), max(xs)

Logger = Callable[[str], None]          # a type alias for "function taking str"

def run(step: str, log: Logger = print) -> None:
    log(f"running {step}")

def numbers(n: int) -> Iterator[int]:
    yield from range(n)

role = find_role(["admin", "viewer"], "editor")
if role is not None:                    # the checker now knows role is str
    print(role.upper())

# Run a checker:  pip install mypy  ->  mypy your_file.py`,
      ex: "Add full type hints to three functions you wrote in Module 1, then install mypy and run it. Deliberately pass a wrong type and read the error it reports.",
      q: ["What does Python do at run time if you pass an int to a parameter annotated <code>str</code>?", ["Raises TypeError", "Converts it", "Nothing, hints are not enforced", "Prints a warning"], 2, "Plain Python ignores annotations at run time. Tools like mypy, or libraries like Pydantic, are what act on them."]
    },
    {
      t: "Dataclasses and properties",
      sub: ["@dataclass removes __init__ boilerplate", "field(default_factory=list)", "frozen=True for immutable config", "@property for computed attributes", "@staticmethod and @classmethod"],
      body: `<p>A <b>dataclass</b> is a class mostly made of data. The decorator writes <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> for you. Use <code>field(default_factory=list)</code> for mutable defaults.</p>
<p>In <code>llm.py</code>, <code>Provider</code> is a <code>@dataclass(frozen=True)</code>: once created it cannot be changed, which is right for configuration. Its <code>key</code> and <code>model</code> are <b>properties</b>: they look like attributes but run code, reading environment variables each time so a key set later is picked up.</p>`,
      lang: "python",
      code: `import os
from dataclasses import dataclass, field

@dataclass(frozen=True)
class Provider:
    name: str
    base_url: str
    key_env: str
    default_model: str

    @property
    def key(self) -> str | None:
        return os.environ.get(self.key_env) or None

    @property
    def ready(self) -> bool:
        return self.key is not None

@dataclass
class Result:
    ok: bool
    out_dir: str
    iterations: list[dict] = field(default_factory=list)   # fresh list per Result
    error: str = ""

    @classmethod
    def failed(cls, out_dir: str, why: str) -> "Result":
        return cls(False, out_dir, error=why)

gemini = Provider("gemini", "https://example/v1", "GEMINI_API_KEY", "gemini-2.5-flash")
print(gemini, gemini.ready)
r = Result.failed("out/app", "docker not running")
r.iterations.append({"attempt": 0})
print(r)
# gemini.name = "x"  -> dataclasses.FrozenInstanceError`,
      ex: "Write a frozen dataclass <code>Field(name, type, required=True)</code> and a normal dataclass <code>Entity(name, fields=[])</code> using default_factory. Add a property <code>Entity.required_fields</code> returning the names of required fields.",
      q: ["Why use <code>field(default_factory=list)</code> instead of <code>= []</code>?", ["It is faster", "Each instance gets its own new list", "Dataclasses forbid lists", "It makes the field required"], 1, "Same problem as mutable function defaults: default_factory calls list() per instance."]
    },
    {
      t: "Closures, decorators, generators and context managers",
      sub: ["Functions are values; inner functions capture variables", "Writing a decorator (timing, retry)", "Generators with yield; lazy iteration", "with statements and context managers", "contextlib.contextmanager"],
      body: `<p>A <b>closure</b> is an inner function that remembers variables from the function that created it. <code>build_app</code> in <code>agent.py</code> defines <code>step()</code> inside itself so every call can use the outer <code>emit</code> without passing it around.</p>
<p>A <b>decorator</b> wraps a function to add behaviour (timing, retries, auth checks). FastAPI's <code>@app.get("/")</code> is a decorator that registers your function as a route.</p>
<p>A <b>generator</b> produces values one at a time with <code>yield</code>, so you can process a 1 GB file without loading it, which is exactly how <code>htmlslim._read_chunks</code> works. A <b>context manager</b> guarantees cleanup with <code>with</code>.</p>`,
      lang: "python",
      code: `import time
from contextlib import contextmanager
from functools import wraps

def make_step(emit):
    def step(id, status):                   # closure: remembers emit
        emit({"id": id, "status": status})
    return step

step = make_step(print)
step("plan", "running")

def retry(times: int):
    def decorate(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except ConnectionError as e:
                    print(f"attempt {attempt} failed: {e}")
            raise RuntimeError(f"{fn.__name__} failed {times} times")
        return wrapper
    return decorate

@retry(times=3)
def flaky():
    raise ConnectionError("network down")

def read_chunks(path: str, size: int = 8 * 1024 * 1024):
    with open(path, encoding="utf-8", errors="replace") as f:
        while chunk := f.read(size):
            yield chunk                     # one chunk in memory at a time

@contextmanager
def timer(label: str):
    t0 = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {time.perf_counter() - t0:.3f}s")

with timer("work"):
    sum(range(1_000_000))`,
      ex: "Write a decorator <code>@log_calls</code> that prints the function name, its arguments and how long it took. Then write a generator <code>batched(items, n)</code> that yields lists of n items.",
      q: ["What is the main benefit of a generator over returning a list?", ["It is always faster", "Values are produced lazily, so memory stays small", "It can be indexed", "It sorts the values"], 1, "A generator yields one value at a time instead of building everything in memory first."]
    },
    {
      t: "Regex, pathlib and the standard library",
      sub: ["re.search, re.findall, re.sub, re.compile", "Groups, named groups, flags (re.I, re.S, re.M)", "pathlib.Path: joining, reading, writing, globbing", "json.loads / json.dumps", "os.environ, secrets, hashlib, uuid, datetime"],
      body: `<p><b>Regular expressions</b> find patterns in text. SaaSForge uses them to snake_case names, to spot "negative" workflow stages (<code>reject|cancel|lost</code>), to find function names inside a JavaScript file and to parse file blocks out of a model's reply.</p>
<p><b>pathlib</b> treats paths as objects: <code>out / plan["slug"] / ".forge"</code> builds a path with the <code>/</code> operator, and <code>.read_text()</code> / <code>.write_text()</code> replace open/close boilerplate.</p>
<p>The standard library covers most needs before you install anything: <code>json</code>, <code>csv</code>, <code>zipfile</code>, <code>hashlib</code>, <code>hmac</code>, <code>secrets</code>, <code>uuid</code>, <code>subprocess</code>, <code>threading</code>.</p>`,
      lang: "python",
      code: `import json, os, re, secrets, uuid
from pathlib import Path

def snake(s: str) -> str:
    s = re.sub(r"([a-z0-9])([A-Z])", r"\\1_\\2", s)      # loanAmount -> loan_Amount
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")

print(snake("Loan Amount"), snake("loanAmount"), snake("EMI (monthly)"))

NEGATIVE = re.compile(r"reject|cancel|lost|declin|fail", re.I)
print([s for s in ["New", "Approved", "Rejected", "Declined"] if NEGATIVE.search(s)])

BLOCK = re.compile(r"^=== FILE: (?P<path>\\S+) ===\\n(?P<body>.*?)\\n=== END FILE ===", re.S | re.M)
reply = "=== FILE: app/api.py ===\\nprint('hi')\\n=== END FILE ==="
for m in BLOCK.finditer(reply):
    print(m.group("path"), "->", m.group("body"))

out = Path("out") / "demo-app" / ".forge"
out.mkdir(parents=True, exist_ok=True)
(out / "spec.json").write_text(json.dumps({"slug": "demo-app"}, indent=2))
spec = json.loads((out / "spec.json").read_text())
print(spec["slug"], [p.name for p in out.parent.glob("**/*.json")])

print(os.environ.get("GEMINI_API_KEY", "not set"))
print(secrets.token_urlsafe(32), uuid.uuid4().hex[:8])`,
      ex: "Write a regex that pulls every <code>id=\"...\"</code> value out of an HTML string, and a function that saves the results to <code>ids.json</code> with pathlib. Test it on a small HTML snippet.",
      q: ["What does the <code>re.S</code> flag change?", ["Case-insensitive matching", "^ and $ match at every line", "The dot also matches newlines", "Searches from the end"], 2, "re.S (DOTALL) lets . match newline characters, needed to capture multi-line blocks."]
    }
  ]
});

COURSE.push({
  n: 3, id: "http-rest", title: "HTTP and REST APIs", level: 2,
  blurb: "How programs talk over the web: requests, responses, status codes, JSON, REST design and streaming.",
  saas: "<code>llm.py</code> is an HTTP client; <code>server.py</code> and <code>platform/runtime/crud.py</code> are HTTP servers; the live progress feed is Server-Sent Events.",
  lessons: [
    {
      t: "Anatomy of a request and response",
      sub: ["URL parts: scheme, host, path, query", "Methods: GET, POST, PUT, PATCH, DELETE", "Headers: Content-Type, Authorization, Accept", "Bodies: JSON, form data, files", "Making requests with httpx and curl"],
      body: `<p>Every web interaction is a <b>request</b> (method, URL, headers, optional body) followed by a <b>response</b> (status code, headers, body). Your browser does this for every page; your agent does it for every AI call.</p>
<p>Headers carry metadata. <code>Authorization: Bearer &lt;key&gt;</code> proves who you are; <code>Content-Type: application/json</code> says the body is JSON.</p>
<p>Learn to make requests from the terminal with <b>curl</b> and from Python with <b>httpx</b> (sync and async, used by SaaSForge) or requests.</p>`,
      lang: "python",
      code: `import httpx

# GET with query parameters: https://httpbin.org/get?page=2&size=10
r = httpx.get("https://httpbin.org/get", params={"page": 2, "size": 10}, timeout=20)
print(r.status_code, r.headers["content-type"])
print(r.json()["args"])

# POST a JSON body with an auth header
r = httpx.post(
    "https://httpbin.org/post",
    json={"model": "demo", "messages": [{"role": "user", "content": "hi"}]},
    headers={"Authorization": "Bearer sk-test-123"},
    timeout=20,
)
data = r.json()
print(data["json"]["model"], data["headers"]["Authorization"])

# The same POST from a terminal:
# curl -X POST https://httpbin.org/post \\
#   -H "Authorization: Bearer sk-test-123" \\
#   -H "Content-Type: application/json" \\
#   -d '{"model": "demo"}'`,
      ex: "Use httpx to call a public API (for example https://api.github.com/repos/python/cpython) and print three fields from the JSON. Then make the same call with curl and add <code>-i</code> to see the response headers.",
      q: ["Which header normally carries an API key?", ["Accept", "Content-Type", "Authorization", "Host"], 2, "APIs usually expect Authorization: Bearer <token>."]
    },
    {
      t: "Status codes and what to do about them",
      sub: ["2xx success: 200, 201, 204", "4xx client errors: 400, 401, 403, 404, 409, 422, 429", "5xx server errors: 500, 502, 503, 504", "Which errors to retry, which to fail fast", "Timeouts and network errors"],
      body: `<p>The status code tells the client what happened, and good clients act on it. <code>llm.py</code> is a textbook example: 200 means read the answer; 429 and 5xx mean wait and retry; 400, 401, 403 and 404 mean retrying will not help, so fail immediately.</p>
<p>On the server side, return precise codes: 401 when not signed in, 403 when signed in but not allowed, 404 when missing, 422 when the body fails validation, 409 for conflicts such as a duplicate email.</p>`,
      lang: "python",
      code: `RETRYABLE = {429, 500, 502, 503, 504}

def decide(status: int) -> str:
    if 200 <= status < 300:
        return "success"
    if status in RETRYABLE:
        return "retry later"
    if status == 401:
        return "fix credentials"
    if status == 403:
        return "you are not allowed"
    if status == 404:
        return "wrong URL or missing resource"
    if status == 422:
        return "request body failed validation"
    return "fail now"

for s in [200, 201, 400, 401, 403, 404, 409, 422, 429, 500, 503]:
    print(s, decide(s))

# 401 = who are you?   403 = I know who you are, and the answer is no.`,
      ex: "Write a table (in comments or a dict) of every status code SaaSForge's generated CRUD API can return, and when. Hint: search <code>crud.py</code> for HTTPException.",
      q: ["A signed-in viewer tries to delete a record they may not delete. Which code fits?", ["401", "403", "404", "500"], 1, "They are authenticated (not 401) but not authorised, which is 403."]
    },
    {
      t: "REST design and JSON",
      sub: ["Resources and URLs: /api/loans, /api/loans/42", "Mapping CRUD onto methods", "Pagination, filtering, search via query params", "JSON shapes for lists, items and errors", "Idempotency: which methods are safe to repeat"],
      body: `<p>REST organises an API around <b>resources</b>. A collection lives at <code>/api/loans</code> and one item at <code>/api/loans/42</code>. The method says what to do: GET reads, POST creates, PUT/PATCH update, DELETE removes.</p>
<p>The generated CRUD runtime uses one route set for every table: <code>GET /api/{table}</code> with <code>page</code>, <code>size</code> and filter query parameters, <code>POST /api/{table}</code>, <code>GET/PUT/DELETE /api/{table}/{id}</code>, plus action routes such as <code>/advance</code> for workflow stages.</p>
<p>GET, PUT and DELETE are <b>idempotent</b>: repeating them leaves the same state. POST is not, so a retried POST can create duplicates.</p>`,
      lang: "text",
      code: `GET    /api/loans?page=2&size=10&status=approved&q=mehta   list, filtered
POST   /api/loans                    body: {"amount": 500000, ...}   create -> 201
GET    /api/loans/42                 read one -> 200 or 404
PUT    /api/loans/42                 body: full or partial update -> 200
DELETE /api/loans/42                 -> 204
POST   /api/loans/42/advance         body: {"to": "approved"}   workflow action
GET    /api/loans/export.csv         download

List response:
{
  "items": [{"id": 42, "amount": 500000, "status": "approved"}],
  "total": 37, "page": 2, "size": 10
}

Error response (422):
{
  "detail": {"amount": "must be a positive number", "months": "required"}
}`,
      ex: "Design the REST API for a library app (books, members, loans of books). Write every route, method, request body and response shape before writing any code.",
      q: ["Which method is NOT idempotent?", ["GET", "PUT", "DELETE", "POST"], 3, "Repeating a POST usually creates another resource."]
    },
    {
      t: "Streaming and Server-Sent Events",
      sub: ["Why long jobs need streaming", "SSE format: data: lines, blank line", "EventSource in the browser", "Polling vs SSE vs WebSockets", "Streaming uploads and downloads"],
      body: `<p>A SaaSForge build takes minutes. Instead of making the browser wait, <code>server.py</code> streams progress with <b>Server-Sent Events</b>: one long HTTP response where the server writes a line like <code>data: {...}</code> followed by a blank line whenever something happens.</p>
<p>The browser listens with <code>new EventSource(url)</code>. SSE is one-way (server to client) and plain HTTP, which makes it simpler than WebSockets for progress feeds and token streaming from LLMs.</p>`,
      lang: "python",
      code: `# server side (FastAPI)
import asyncio, json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.get("/api/jobs/{jid}/stream")
async def stream(jid: str):
    async def gen():
        for i, step in enumerate(["clarify", "plan", "generate", "verify"]):
            event = {"type": "step", "id": step, "status": "done", "n": i}
            yield f"data: {json.dumps(event)}\\n\\n"     # one SSE message
            await asyncio.sleep(1)
        yield 'data: {"type": "done"}\\n\\n'
    return StreamingResponse(gen(), media_type="text/event-stream")

# browser side (JavaScript)
# const es = new EventSource("/api/jobs/abc/stream");
# es.onmessage = (m) => {
#   const ev = JSON.parse(m.data);
#   if (ev.type === "done") es.close(); else render(ev);
# };`,
      ex: "Run this server with <code>uvicorn file:app --reload</code>, open the stream URL in a browser to see raw events, then write a small HTML page that shows each step as it arrives.",
      q: ["What separates two SSE messages?", ["A comma", "A blank line", "A semicolon", "A new HTTP request"], 1, "Each message ends with a blank line (\\n\\n)."]
    }
  ]
});

COURSE.push({
  n: 4, id: "fastapi", title: "FastAPI", level: 2,
  blurb: "The Python web framework used by both SaaSForge and every app it generates.",
  saas: "<code>server.py</code> (the agent's API), <code>scaffold.py</code> (auth routes, main app), <code>platform/runtime/crud.py</code> (generic CRUD router), <code>convert/runtime/hooks.py</code> (middleware).",
  lessons: [
    {
      t: "Routes, path and query parameters",
      sub: ["Creating an app and running it with uvicorn", "@app.get / post / put / delete", "Path parameters with types", "Query parameters, defaults and validation (Query)", "Automatic docs at /docs"],
      body: `<p>FastAPI turns a typed Python function into an HTTP endpoint. Type hints on parameters decide where values come from and how they are validated: a parameter in the path string is a path parameter, a simple typed parameter otherwise is a query parameter, and a Pydantic model is the JSON body.</p>
<p>Run with <code>uvicorn main:app --reload</code> and open <code>/docs</code>: FastAPI generates interactive OpenAPI documentation from your code.</p>`,
      lang: "python",
      code: `from fastapi import FastAPI, HTTPException, Query

app = FastAPI(title="Loans")

LOANS = {1: {"id": 1, "amount": 500000, "status": "new"},
         2: {"id": 2, "amount": 120000, "status": "approved"}}

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/api/loans")
def list_loans(status: str = "", page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100)):
    rows = [l for l in LOANS.values() if not status or l["status"] == status]
    start = (page - 1) * size
    return {"items": rows[start:start + size], "total": len(rows), "page": page}

@app.get("/api/loans/{loan_id}")
def get_loan(loan_id: int):              # "abc" -> automatic 422
    if loan_id not in LOANS:
        raise HTTPException(404, "Loan not found")
    return LOANS[loan_id]

# pip install fastapi uvicorn
# uvicorn main:app --reload    then open http://127.0.0.1:8000/docs`,
      ex: "Build a tiny notes API with list, get-by-id and a search query parameter. Open /docs and call every endpoint from the browser.",
      q: ["In <code>def get(item_id: int, q: str = '')</code> on route <code>/items/{item_id}</code>, what is q?", ["A path parameter", "A query parameter", "The request body", "A header"], 1, "It is not in the path and is a simple type, so FastAPI reads it from the query string."]
    },
    {
      t: "Request bodies with Pydantic",
      sub: ["BaseModel classes describe JSON", "Field(...) constraints: min_length, gt, max_length", "Separate In and Out models", "response_model and status_code", "Automatic 422 errors"],
      body: `<p><b>Pydantic</b> models describe the shape of JSON. FastAPI validates the incoming body against the model and returns a 422 with details if it does not match, before your code runs.</p>
<p>Use separate models for input and output (<code>NoteIn</code> / <code>NoteOut</code> in <code>generator.py</code>'s style example) so clients cannot set fields like <code>id</code> or <code>owner_id</code>, and so you never accidentally return a password hash.</p>`,
      lang: "python",
      code: `from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, EmailStr, Field

app = FastAPI()

class BorrowerIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr                       # pip install "pydantic[email]"
    income: float = Field(gt=0)
    notes: str = ""

class BorrowerOut(BorrowerIn):
    model_config = ConfigDict(from_attributes=True)   # can read ORM objects
    id: int
    created_at: datetime

DB: list[BorrowerOut] = []

@app.post("/api/borrowers", response_model=BorrowerOut, status_code=201)
def create(body: BorrowerIn):
    row = BorrowerOut(id=len(DB) + 1, created_at=datetime.now(), **body.model_dump())
    DB.append(row)
    return row

# POST {"name": "A", "email": "nope", "income": -5}  ->  422 with three errors`,
      ex: "Add a <code>LoanIn</code> model with amount (positive), rate (0 to 40) and months (1 to 360). Post invalid bodies and read the 422 responses.",
      q: ["Why keep separate In and Out models?", ["Pydantic requires it", "To control what clients may send and what you reveal", "It is faster", "For automatic docs only"], 1, "Input models stop clients setting server-owned fields; output models stop internal fields leaking."]
    },
    {
      t: "Dependency injection with Depends",
      sub: ["What a dependency is", "get_db: a session per request with cleanup", "current_user: auth as a dependency", "Dependencies that depend on dependencies", "Overriding dependencies in tests"],
      body: `<p><code>Depends()</code> tells FastAPI to call a function before your endpoint and pass in its result. It is how every generated SaaSForge app gets a database session (<code>db: Session = Depends(get_db)</code>) and the signed-in user (<code>user: User = Depends(current_user)</code>) without repeating code.</p>
<p>A dependency written with <code>yield</code> runs cleanup after the response, which is how sessions are always closed. Dependencies can depend on other dependencies: <code>admin_only</code> depends on <code>current_user</code>.</p>`,
      lang: "python",
      code: `from fastapi import Depends, FastAPI, Header, HTTPException

app = FastAPI()

class FakeSession:
    def close(self): print("session closed")

def get_db():
    db = FakeSession()
    try:
        yield db                          # endpoint runs here
    finally:
        db.close()                        # always runs afterwards

TOKENS = {"t-admin": {"id": 1, "role": "admin"}, "t-view": {"id": 2, "role": "viewer"}}

def current_user(authorization: str | None = Header(default=None)) -> dict:
    token = (authorization or "").removeprefix("Bearer ")
    user = TOKENS.get(token)
    if not user:
        raise HTTPException(401, "Sign in first")
    return user

def admin_only(user: dict = Depends(current_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(403, "Admins only")
    return user

@app.get("/api/me")
def me(user: dict = Depends(current_user), db=Depends(get_db)):
    return user

@app.get("/api/admin/users")
def users(_: dict = Depends(admin_only)):
    return list(TOKENS.values())`,
      ex: "Add a <code>require_role(*roles)</code> dependency factory that returns a dependency allowing only the given roles. Use it on two endpoints.",
      q: ["What runs the code after <code>yield</code> in a dependency?", ["Nothing", "FastAPI, after the response is produced", "The client", "A background thread"], 1, "FastAPI resumes the generator after the endpoint finishes, so cleanup always happens."]
    },
    {
      t: "Middleware, static files, routers and lifespan",
      sub: ["APIRouter to split routes across files", "Middleware: security headers, GZip, timing", "Serving a frontend with StaticFiles", "lifespan: startup and shutdown work", "Running in production with uvicorn workers"],
      body: `<p>Real apps split routes into <b>routers</b> (<code>auth.router</code>, <code>api.router</code>) and include them in one app. <b>Middleware</b> wraps every request: <code>hooks.py</code> adds a Content-Security-Policy and other security headers to every response.</p>
<p>The <b>lifespan</b> function runs at startup (create tables, run migrations, seed demo data) and shutdown. <code>StaticFiles</code> serves the vanilla JS frontend from the same server, so one container serves both API and UI.</p>`,
      lang: "python",
      code: `import time
from contextlib import asynccontextmanager
from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

router = APIRouter(prefix="/api/notes", tags=["notes"])

@router.get("")
def list_notes():
    return []

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("startup: create tables, run migrations")
    yield
    print("shutdown: close connections")

app = FastAPI(lifespan=lifespan)
app.include_router(router)
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.middleware("http")
async def security_headers(request: Request, call_next):
    t0 = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Server-Timing"] = f"app;dur={(time.perf_counter() - t0) * 1000:.1f}"
    return response

app.mount("/", StaticFiles(directory="static", html=True), name="static")  # mount last`,
      ex: "Restructure your notes API into <code>main.py</code>, <code>auth.py</code> and <code>notes.py</code> routers, add a timing middleware and serve a static index.html.",
      q: ["Why mount StaticFiles at '/' last?", ["It is faster", "A catch-all mount registered first would shadow the API routes", "Static files must be last alphabetically", "It is required by uvicorn"], 1, "Routes are matched in order, so a mount at / registered first would capture /api requests."]
    }
  ]
});
