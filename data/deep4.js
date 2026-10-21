/* Forge Academy: deeper material for agent design and generation lessons. */
window.DEEP = window.DEEP || {};
Object.assign(DEEP, {
  "13-0": {
    more: `<p><b>A spectrum, not a binary.</b> Most useful LLM systems sit somewhere between a single call and a fully autonomous agent:</p>
<ul><li><b>Single call</b>: one prompt, one answer (summarise, classify, extract).</li>
<li><b>Workflow (chain)</b>: a fixed sequence of LLM calls and code steps you design in advance, such as extract, then validate, then generate, then check. Predictable, testable and cheap.</li>
<li><b>Routing</b>: a classifier picks which workflow to run.</li>
<li><b>Agent</b>: the model decides which step comes next, in a loop, using tools, until a goal is met.</li></ul>
<p>Start at the simplest level that solves the problem. Agents are flexible but harder to test, slower, more expensive and less predictable. Use them when the path genuinely can't be known in advance: open-ended research, debugging, multi-step tasks over unfamiliar data.</p>
<p><b>The agent loop</b>: the model receives the goal, available tools and the history of actions and observations; it chooses an action (call a tool, ask the user, or finish); your code executes it and appends the observation; repeat. Everything the agent "knows" about its progress is in that history (its <b>working memory</b>), so keep observations concise, summarise long histories and store durable facts outside the context (files, a scratchpad, a database).</p>
<p><b>Stopping conditions</b> are a design requirement, not an afterthought: the goal is reached (verified by a check, not just the model's claim); a step, time or token <b>budget</b> is exhausted; repeated failure is detected (the same error twice); or a human decision is needed. When stopping early, return what was achieved and why it stopped.</p>
<p><b>Common architectures</b>: ReAct (reason, then act, then observe, in a loop); plan-and-execute (make a plan first, then execute steps, re-planning when needed); orchestrator-workers (a lead agent delegates subtasks to specialised sub-agents); and evaluator-optimiser (one call generates, another critiques, iterate).</p>`,
    example: {
      t: "A minimal, budgeted agent loop with a verification-based stop",
      intro: "A research-style agent with two tools. Notice the explicit budgets, the loop detector and that \"done\" must pass a check rather than being taken on the model's word.",
      lang: "python",
      code: `import json, time

TOOLS = {
    "search_docs": lambda q: search_index(q, k=3),          # returns short snippets with ids
    "read_doc":    lambda doc_id: read_section(doc_id)[:2000],
}

SYSTEM = """You answer engineering questions using the tools.
Each turn, reply with JSON only:
{"thought": "...", "action": "search_docs" | "read_doc" | "finish", "input": "...", "answer": "... (only when finishing, cite doc ids)"}"""

def run_agent(goal: str, call, max_steps=8, max_seconds=60, max_tokens_total=40_000):
    history = [{"role": "user", "content": f"Goal: {goal}"}]
    started, tokens, seen_actions = time.time(), 0, set()
    for step in range(1, max_steps + 1):
        if time.time() - started > max_seconds:
            return {"status": "stopped", "reason": "time budget", "steps": step - 1}
        reply, used = call(SYSTEM, history)                  # returns (text, tokens used)
        tokens += used
        if tokens > max_tokens_total:
            return {"status": "stopped", "reason": "token budget", "steps": step}
        try:
            move = json.loads(reply)
        except json.JSONDecodeError:
            history += [{"role": "assistant", "content": reply},
                        {"role": "user", "content": "Reply with valid JSON only."}]
            continue
        history.append({"role": "assistant", "content": reply})
        if move["action"] == "finish":
            if "[" not in move.get("answer", ""):           # verification: answers must cite sources
                history.append({"role": "user", "content": "Your answer must cite doc ids like [doc-12]. Continue."})
                continue
            return {"status": "done", "answer": move["answer"], "steps": step, "tokens": tokens}
        key = (move["action"], move.get("input"))
        if key in seen_actions:                               # loop detection
            history.append({"role": "user", "content": "You already did exactly that. Try something different or finish."})
            continue
        seen_actions.add(key)
        tool = TOOLS.get(move["action"])
        observation = tool(move["input"]) if tool else f"Unknown action {move['action']}"
        history.append({"role": "user", "content": f"Observation: {str(observation)[:1500]}"})
    return {"status": "stopped", "reason": "step budget", "steps": max_steps}`,
      after: "Every way out of this loop is explicit and reported. In production you'd also log each step (thought, action, observation, tokens) so a failed run can be replayed and understood."
    },
    mistakes: [
      "Building an autonomous agent when a fixed workflow would be simpler, cheaper and more reliable.",
      "No step, time or token budgets, so agents loop expensively when confused.",
      "Accepting the model's claim that it's done without an objective check.",
      "Letting the history grow unbounded with huge tool outputs until the context overflows.",
      "No logging of intermediate steps, making failures impossible to debug."
    ],
    practice: [
      ["Classify each as single call, workflow or agent: (a) translate a paragraph; (b) extract invoice fields, validate them, then create an accounting entry; (c) investigate why yesterday's sales report numbers look wrong.", "(a) Single call. (b) Workflow: the steps are known in advance. (c) Agent: the investigation path depends on what each query reveals."],
      ["An agent repeats the same failing tool call five times. Give two mechanisms that prevent this.", "Detect repeated (action, input) pairs and tell the agent to change approach or stop; include the error in the observation clearly; and cap retries per tool and total steps."],
      ["Why should an agent's final answer be verified by code where possible?", "Models can claim success incorrectly (\"tests pass\") or produce unsupported answers. Objective checks (tests actually pass, citations exist, output validates against a schema) make completion trustworthy."]
    ]
  },

  "13-1": {
    more: `<p><b>Where humans add the most value</b>: at points of <b>ambiguity</b> (the request can reasonably mean different things), <b>irreversibility</b> (deleting data, sending messages, spending money, deploying) and <b>accountability</b> (decisions with legal, financial or reputational impact). Everywhere else, interruptions slow users down. A good agent asks rarely, at the right moments, and makes answering easy.</p>
<p><b>Clarifying questions</b> work best when they're few (one to four), specific, and offer <b>options</b> with a recommended default, so the user can answer with a click. Ask them early, before expensive work; batch them instead of drip-feeding; and accept free-text answers, mapping them back to the structured options (often with a small LLM call or fuzzy matching).</p>
<p><b>Approval gates</b>: show the user a concise, human-readable summary of what will happen (a plan, a diff, the email draft, the exact SQL that will run), then wait for approve, edit or reject. On "edit", incorporate the feedback, show what changed, and ask again. Track the number of revision rounds and offer a way out.</p>
<p><b>Separate the agent from the interface.</b> Define an interaction interface (for example <code>ask(questions)</code> and <code>approve(plan)</code>) that the agent calls, with different implementations for the command line, a web app (asynchronous, possibly hours later), Slack, or automated tests (scripted answers). The agent's logic stays the same everywhere, and tests can run without a human.</p>
<p><b>Asynchronous approvals</b>: in web apps, a human may answer much later. Persist the agent's state (step, plan, pending question) in a database so the run can resume after the answer arrives, even if servers restarted in between. Time out stale requests and notify the user.</p>`,
    example: {
      t: "An interaction protocol with CLI, scripted-test and web implementations",
      intro: "The agent depends on an abstract interface. Swapping the implementation moves the same agent between a terminal, automated tests and an asynchronous web flow.",
      lang: "python",
      code: `from dataclasses import dataclass, field
from typing import Protocol

@dataclass
class Question:
    id: str
    text: str
    options: list[str]
    recommended: int = 0

class Interaction(Protocol):
    def ask(self, questions: list[Question]) -> dict[str, str]: ...
    def approve(self, summary: str) -> tuple[bool, str]: ...      # (approved, feedback)

class CLI:
    def ask(self, questions):
        answers = {}
        for q in questions:
            print(f"\\n{q.text}")
            for i, opt in enumerate(q.options, 1):
                print(f"  {i}. {opt}{'  (recommended)' if i - 1 == q.recommended else ''}")
            raw = input("Choose a number or type your own answer: ").strip()
            answers[q.id] = q.options[int(raw) - 1] if raw.isdigit() and 1 <= int(raw) <= len(q.options) \\
                else (raw or q.options[q.recommended])
        return answers
    def approve(self, summary):
        print("\\n" + summary)
        raw = input("Approve? [y / or describe changes]: ").strip()
        return (raw.lower() in ("y", "yes", ""), "" if raw.lower() in ("y", "yes", "") else raw)

@dataclass
class Scripted:                                   # for automated tests: no human needed
    answers: dict[str, str]
    approvals: list = field(default_factory=lambda: [(True, "")])
    def ask(self, questions): return {q.id: self.answers.get(q.id, q.options[q.recommended]) for q in questions}
    def approve(self, summary): return self.approvals.pop(0)

def build_report_agent(request: str, ui: Interaction, plan_fn, revise_fn, max_rounds=3):
    answers = ui.ask([
        Question("period", "Which period should the report cover?", ["Last 7 days", "Last 30 days", "This quarter"], 1),
        Question("audience", "Who is it for?", ["Leadership (summary)", "Team (detailed)"], 0),
    ])
    plan = plan_fn(request, answers)
    for _ in range(max_rounds):
        ok, feedback = ui.approve(f"Planned report:\\n{plan}")
        if ok:
            return plan                           # only now do the expensive or irreversible work
        plan = revise_fn(plan, feedback)
    raise RuntimeError("No approval after several revisions; stopping.")

# Test without a human:
# plan = build_report_agent("weekly sales", Scripted({"period": "Last 7 days"}), my_plan, my_revise)
# Web version: ask() stores the questions in the DB and raises Pending; the run resumes when answers arrive.`,
      after: "Because tests use <code>Scripted</code>, the full agent flow, including revision rounds, runs in CI in milliseconds without anyone pressing keys."
    },
    mistakes: [
      "Asking permission for every small step, training users to click approve without reading.",
      "Never asking at all, then taking an irreversible action based on a wrong guess.",
      "Open-ended questions (\"What do you want?\") instead of specific questions with options and a recommended default.",
      "Agent logic tangled with <code>input()</code> calls or web request handlers, making it untestable and impossible to reuse.",
      "Keeping pending approvals only in memory, so a server restart loses the run."
    ],
    practice: [
      ["An agent will email 2,000 customers about a price change. Where should human checkpoints be?", "Approve the audience (segment definition and count), approve the message (rendered preview), and confirm the send (with a test send to an internal address first). Everything else (drafting, segmentation queries) can be automated."],
      ["Rewrite \"What should the dashboard show?\" as a better clarifying question.", "\"Which metric matters most on this dashboard? 1. Revenue and orders (recommended), 2. Customer retention, 3. Delivery times, or type your own.\""],
      ["Why does an Interaction interface make agents easier to test?", "Tests can inject a scripted implementation that answers questions and approvals deterministically, so the agent's full logic runs automatically without a person or UI."]
    ]
  },

  "13-2": {
    more: `<p><b>Constrain what the model produces.</b> Models are strong at understanding requirements and making judgement calls, and weaker at producing large amounts of exactly-correct detailed output in one go. A powerful pattern is to have the model produce a <b>small, structured plan</b> (a JSON spec of entities, steps or changes) that deterministic, tested code then executes or expands. The plan is easy to validate, show to a human, diff and revise; the code that executes it is reliable because it's ordinary software with tests.</p>
<p><b>The plan as a contract.</b> Define the plan's schema carefully: what fields exist, which values are allowed, what references must resolve. Validate and normalise every plan before use. Everything downstream depends only on the plan, so you can swap models, re-run generation, or have a human edit the plan directly.</p>
<p><b>Diffing plans</b>: when a user asks for changes, generate a revised plan and show a human-readable diff ("Added field: due_date on Invoice. Removed role: auditor. Changed stage order."). Users review changes much faster than whole documents, and diffs make unintended side effects visible.</p>
<p><b>When should the model write code directly?</b> When outputs are small and self-contained (a function, a SQL query, a test), when they can be verified automatically (compile, run tests, execute the query safely), and when a template can't express the variety needed. Hybrid approaches work well: a template provides the structure and the model fills in small, checked pieces.</p>
<p><b>Re-planning</b>: execution can reveal that a plan won't work (a tool fails, data is missing). Feed the specific failure back and ask for a revised plan, keeping a history of attempts so the model doesn't propose the same thing twice.</p>`,
    example: {
      t: "Plan, validate, diff and execute: a database schema assistant",
      intro: "The model proposes a compact JSON plan; code validates it, shows a readable diff against the previous version, and deterministic code turns it into SQL.",
      lang: "python",
      code: `import json

ALLOWED_TYPES = {"text", "int", "decimal", "bool", "date", "timestamp"}

def validate(plan: dict) -> list[str]:
    errors, names = [], {t["name"] for t in plan.get("tables", [])}
    for t in plan.get("tables", []):
        if not t["name"].isidentifier():
            errors.append(f"bad table name {t['name']!r}")
        for f in t.get("fields", []):
            if f["type"] not in ALLOWED_TYPES and not f["type"].startswith("ref:"):
                errors.append(f"{t['name']}.{f['name']}: unknown type {f['type']}")
            if f["type"].startswith("ref:") and f["type"][4:] not in names:
                errors.append(f"{t['name']}.{f['name']}: references missing table {f['type'][4:]}")
    return errors

def diff(old: dict, new: dict) -> list[str]:
    def index(p): return {(t["name"], f["name"]): f["type"] for t in p.get("tables", []) for f in t["fields"]}
    o, n = index(old), index(new)
    out = [f"+ {t}.{f} ({n[(t, f)]})" for t, f in n.keys() - o.keys()]
    out += [f"- {t}.{f}" for t, f in o.keys() - n.keys()]
    out += [f"~ {t}.{f}: {o[(t, f)]} -> {n[(t, f)]}" for t, f in n.keys() & o.keys() if o[(t, f)] != n[(t, f)]]
    return sorted(out)

SQL_TYPES = {"text": "text", "int": "integer", "decimal": "numeric(12,2)", "bool": "boolean",
             "date": "date", "timestamp": "timestamptz"}

def to_sql(plan: dict) -> str:                    # deterministic, tested code does the detailed work
    stmts = []
    for t in plan["tables"]:
        cols = ["id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY"]
        for f in t["fields"]:
            if f["type"].startswith("ref:"):
                cols.append(f"{f['name']} bigint REFERENCES {f['type'][4:]}(id)")
            else:
                cols.append(f"{f['name']} {SQL_TYPES[f['type']]}{' NOT NULL' if f.get('required') else ''}")
        stmts.append(f"CREATE TABLE {t['name']} (\\n  " + ",\\n  ".join(cols) + "\\n);")
    return "\\n\\n".join(stmts)

v1 = {"tables": [{"name": "customer", "fields": [{"name": "name", "type": "text", "required": True}]},
                 {"name": "invoice", "fields": [{"name": "customer_id", "type": "ref:customer"},
                                                {"name": "amount", "type": "int"}]}]}
v2 = json.loads(json.dumps(v1))                   # imagine this came from the model after "amounts need paise precision, add due date"
v2["tables"][1]["fields"][1]["type"] = "decimal"
v2["tables"][1]["fields"].append({"name": "due_date", "type": "date"})

assert not validate(v2), validate(v2)
print("\\n".join(diff(v1, v2)))                   # + invoice.due_date (date) / ~ invoice.amount: int -> decimal
print(to_sql(v2))`,
      after: "The model's job shrank to a small JSON document a person can review in seconds. The fiddly, error-prone part, writing correct SQL, is done by ten lines of deterministic code that you test once."
    },
    mistakes: [
      "Asking a model to generate dozens of interdependent files in one shot, then hoping they're all consistent.",
      "Executing model plans without validating references, types and allowed values first.",
      "Showing users the whole regenerated output after each change instead of a clear diff.",
      "Re-planning without telling the model what failed, so it proposes the same broken plan again.",
      "Plans with free-form fields that downstream code can't interpret reliably."
    ],
    practice: [
      ["Design a minimal plan schema for an agent that builds a weekly report from a database.", "For example: <code>{\"metrics\": [{\"name\", \"sql\", \"format\"}], \"charts\": [{\"metric\", \"type\": \"line|bar\"}], \"period\": \"last_7_days|last_30_days\", \"recipients\": [emails]}</code>. Validate SQL as read-only, chart types as enums, and recipients against an allow-list."],
      ["Why is a plan diff better for user review than showing the full new plan?", "Reviewers can focus only on what changed, spot unintended changes quickly, and approve in seconds instead of re-reading everything."],
      ["When is it reasonable for the model to write code directly instead of a plan?", "When the code is small and self-contained, can be verified automatically (tests, compilation, safe execution), and the variety needed can't reasonably be captured by templates."]
    ]
  },

  "13-3": {
    more: `<p><b>Generate, verify, repair.</b> Self-correction works when there's an <b>objective check</b>: code compiles, tests pass, JSON validates, a query runs and returns the expected shape, a page renders without console errors. Without a reliable check, asking a model to "review and improve its own answer" often changes little, or makes things worse.</p>
<p><b>Feed back precise failure information.</b> Give the stage that failed, the exact error, the relevant excerpt of logs (the last 50–100 lines, not 10,000) and the relevant code or plan section. Precise feedback produces precise fixes. Strip noise like progress bars and repeated warnings.</p>
<p><b>Budgets and fingerprints.</b> Limit repair attempts (3–5). Compute a <b>fingerprint</b> of each failure (normalised error type and message, without timestamps or random IDs); if the same fingerprint appears again after a fix, the agent is going in circles, so stop or change strategy (escalate to a stronger model, try an alternative approach, or ask a human).</p>
<p><b>Not every failure is the model's fault.</b> Infrastructure problems (network timeouts, rate limits, a full disk, a flaky test, Docker not running) shouldn't be "fixed" by changing the code or plan. Classify failures first: retry infrastructure errors, quarantine flaky checks, and send only genuine logic failures back to the model.</p>
<p><b>Keep the best attempt.</b> Track every attempt's result and score (how many tests passed); if the budget runs out, return the best attempt with a clear report of what still fails, rather than the last one.</p>`,
    example: {
      t: "A repair loop for generated code with failure classification and fingerprints",
      intro: "The model writes a function; tests verify it; failures are classified, fingerprinted and fed back precisely; and the best attempt is kept.",
      lang: "python",
      code: `import hashlib, re, subprocess, tempfile, pathlib

INFRA_PATTERNS = [r"ConnectionError", r"Timeout", r"No space left", r"Cannot connect to the Docker daemon"]

def run_tests(code: str, tests: str) -> tuple[int, int, str]:
    d = pathlib.Path(tempfile.mkdtemp())
    (d / "solution.py").write_text(code); (d / "test_solution.py").write_text(tests)
    p = subprocess.run(["python", "-m", "pytest", "-q", "--tb=short"], cwd=d,
                       capture_output=True, text=True, timeout=60)
    out = p.stdout + p.stderr
    passed = int(m.group(1)) if (m := re.search(r"(\\d+) passed", out)) else 0
    failed = int(m.group(1)) if (m := re.search(r"(\\d+) failed", out)) else 0
    return passed, failed, out

def fingerprint(log: str) -> str:
    errors = re.findall(r"^E\\s+(.+)$", log, re.M)[:3]               # pytest error lines
    norm = [re.sub(r"0x[0-9a-f]+|\\d+", "N", e) for e in errors]     # drop addresses and numbers
    return hashlib.sha1("|".join(norm).encode()).hexdigest()[:10]

def generate_with_repair(spec: str, tests: str, call, max_attempts=4) -> dict:
    prompt = f"Write a Python module solution.py.\\n<spec>{spec}</spec>\\nReturn only code."
    best, seen = {"passed": -1}, set()
    for attempt in range(1, max_attempts + 1):
        code = call(prompt)
        passed, failed, log = run_tests(code, tests)
        if any(re.search(p, log) for p in INFRA_PATTERNS):
            continue                                                 # infrastructure problem: retry, don't 'fix' code
        if passed > best["passed"]:
            best = {"code": code, "passed": passed, "failed": failed, "attempt": attempt}
        if failed == 0 and passed > 0:
            return {"status": "ok", **best}
        fp = fingerprint(log)
        if fp in seen:
            return {"status": "stuck", "reason": f"same failure repeated ({fp})", **best}
        seen.add(fp)
        tail = "\\n".join(log.splitlines()[-60:])                     # precise, short feedback
        prompt = (f"Your solution.py failed {failed} test(s).\\n<code>{code}</code>\\n"
                  f"<test_output>{tail}</test_output>\\nFix the code. Return only the full corrected module.")
    return {"status": "budget_exhausted", **best}`,
      after: "The fingerprint check catches a very common agent failure: \"fixing\" the same bug the same wrong way over and over. Stopping early saves money and returns the best attempt with an honest status."
    },
    mistakes: [
      "Asking the model to self-review without any objective check, which mostly produces cosmetic changes.",
      "Sending the entire 10,000-line log back to the model instead of the relevant excerpt.",
      "Treating infrastructure errors (timeouts, Docker not running) as code bugs to be fixed.",
      "Unlimited repair loops, or returning the last attempt instead of the best one.",
      "Running generated code without sandboxing (see the hardening lesson)."
    ],
    practice: [
      ["Two failures read \"AssertionError: expected 42 got 41 at 0x7f3a\" and \"AssertionError: expected 17 got 16 at 0x7f9c\". Should they get the same fingerprint, and why?", "With the normalisation above (numbers and addresses replaced), yes: both are the same off-by-one pattern, so seeing it again after a fix means the repair didn't address the root cause."],
      ["List three checks that make self-correction effective for an agent that writes SQL queries.", "The query parses (EXPLAIN without running); it executes read-only against a sample database within a time limit; and results match expected columns, types and row-count sanity checks (or known answers for test questions)."],
      ["Why keep the best attempt rather than the last one?", "A later repair can break something that previously worked. Scoring attempts (tests passed) and returning the best gives the most useful result when the budget runs out."]
    ]
  },

  "14-0": {
    more: `<p><b>Generating files from data</b> is everywhere: project scaffolds, config files, emails, reports, infrastructure code, and in AI systems, apps generated from plans. Represent the output as a mapping of path to content (<code>dict[str, str]</code>) before writing anything: it's easy to test (assert on file contents in memory), diff against a previous generation, validate and write atomically.</p>
<p><b>Choosing a templating approach</b>:</p>
<ul><li><b>f-strings</b> for short, simple strings in code.</li>
<li><b><code>string.Template</code></b> (<code>$name</code> placeholders) for simple user-editable templates; it can't run code, which makes it safer.</li>
<li><b>Jinja2</b> for real templates: loops, conditionals, filters, inheritance and macros, kept in separate <code>.j2</code> files. Turn on <code>StrictUndefined</code> so missing variables fail loudly instead of silently rendering empty strings. Turn on autoescaping for HTML.</li></ul>
<p><b>Escaping is the core safety issue.</b> When you insert data into generated code or markup, escape for that target language: <code>html.escape</code> for HTML, <code>json.dumps</code> for JSON and JavaScript string literals, <code>repr()</code> or careful validation for Python identifiers and literals, <code>shlex.quote</code> for shell commands, and parameterised queries for SQL. A business name like <code>O'Brien &amp; Sons "Best"</code> must not break or inject code. Better still, validate identifiers strictly (only letters, digits, underscores) before they ever reach a template.</p>
<p><b>Fixed scaffold vs generated files.</b> Keep as much as possible as fixed, hand-written, tested files (shared runtime, auth, database setup) and generate only what must vary (configuration, models, a spec file). The less code you generate, the less can go wrong, and the generated parts are easier to review.</p>
<p><b>Writing safely</b>: write to a temporary directory first, verify, then move it into place; refuse paths outside the target directory; and never overwrite protected files.</p>`,
    example: {
      t: "Generating a small project with Jinja2, strict escaping and an in-memory file tree",
      intro: "Templates render into a dict of path to content, user-provided names are validated, values are escaped for each target language, and the tree is written atomically.",
      lang: "python",
      code: `import html, json, re, shutil, tempfile
from pathlib import Path
from jinja2 import Environment, StrictUndefined

env = Environment(undefined=StrictUndefined, autoescape=False, trim_blocks=True, lstrip_blocks=True)
env.filters["js"] = json.dumps                    # safe JS/JSON string literal
env.filters["html"] = html.escape

MODEL_TEMPLATE = env.from_string('''from dataclasses import dataclass

@dataclass
class {{ entity.class_name }}:
{% for f in entity.fields %}
    {{ f.name }}: {{ f.py_type }}{% if not f.required %} | None = None{% endif %}

{% endfor %}
''')

PAGE_TEMPLATE = env.from_string('''<!doctype html>
<title>{{ app_name | html }}</title>
<h1>{{ app_name | html }}</h1>
<script>const APP = { name: {{ app_name | js }}, entities: {{ entity_names | js }} };</script>
''')

IDENT = re.compile(r"^[a-z][a-z0-9_]{0,40}$")
PY_TYPES = {"text": "str", "int": "int", "decimal": "float", "bool": "bool", "date": "str"}

def generate(spec: dict) -> dict[str, str]:
    files = {}
    for e in spec["entities"]:
        if not IDENT.match(e["name"]) or any(not IDENT.match(f["name"]) for f in e["fields"]):
            raise ValueError(f"invalid identifier in entity {e['name']!r}")      # validate BEFORE templating
        entity = {"class_name": e["name"].title().replace("_", ""),
                  "fields": [{**f, "py_type": PY_TYPES[f["type"]]} for f in e["fields"]]}
        files[f"app/models/{e['name']}.py"] = MODEL_TEMPLATE.render(entity=entity)
    files["static/index.html"] = PAGE_TEMPLATE.render(app_name=spec["app_name"],
                                                      entity_names=[e["name"] for e in spec["entities"]])
    return files

def write_tree(files: dict[str, str], dest: str) -> None:
    tmp = Path(tempfile.mkdtemp())
    for rel, content in files.items():
        p = (tmp / rel).resolve()
        if not p.is_relative_to(tmp):
            raise ValueError(f"unsafe path {rel}")
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
    shutil.rmtree(dest, ignore_errors=True)
    shutil.move(str(tmp), dest)                    # swap in only after everything rendered

spec = {"app_name": 'O\\'Brien & Sons "Best" Tools </script>',
        "entities": [{"name": "invoice", "fields": [{"name": "amount", "type": "decimal", "required": True},
                                                    {"name": "note", "type": "text", "required": False}]}]}
files = generate(spec)
print(files["static/index.html"])                 # the hostile name is escaped in both HTML and JS contexts
print(files["app/models/invoice.py"])`,
      after: "Notice the hostile app name containing quotes, an ampersand and a closing script tag: it's escaped differently for the HTML title and the JavaScript literal, because each context has its own escaping rules."
    },
    mistakes: [
      "Inserting user or model data into generated code with plain string formatting and no escaping.",
      "Jinja2 without <code>StrictUndefined</code>, so typos in variable names silently render as empty strings.",
      "Generating large amounts of logic that could live in a fixed, tested runtime instead.",
      "Writing files one by one into the live directory, leaving a half-generated project if something fails.",
      "Escaping for the wrong context, such as HTML-escaping a value placed inside a JavaScript string."
    ],
    practice: [
      ["Which escaping function suits each target: an HTML paragraph, a JavaScript string literal, a shell argument, a SQL value?", "<code>html.escape</code>; <code>json.dumps</code>; <code>shlex.quote</code>; a parameterised query (placeholders), never string escaping."],
      ["Why validate identifiers with a strict regex instead of escaping them?", "Identifiers (class, field, table names) can't be quoted in most code contexts, so escaping isn't an option. A strict allow-list pattern guarantees they're safe and valid in every target language."],
      ["What's the benefit of generating into <code>dict[str, str]</code> before writing to disk?", "You can test output in memory, validate everything (paths, syntax) before touching disk, diff against previous output, and write atomically."]
    ]
  },

  "14-1": {
    more: `<p><b>Generate data, not logic.</b> Instead of generating a new program for every app, write one generic, well-tested <b>runtime</b> that reads a specification (a JSON or YAML spec) and behaves accordingly. Each "generated app" is then just a spec plus the shared runtime. This is how many low-code platforms, form builders, workflow engines and admin panel generators work.</p>
<p><b>Why it's so reliable</b>: the runtime is ordinary code with tests, code review and gradual improvement, so every app benefits from every fix. The spec is small, easy to validate against a schema, diff, version and migrate. A bug in a generated app is almost always either a spec problem (caught by validation) or a runtime bug (fixed once for everyone).</p>
<p><b>Designing a runtime</b>: generic routes (<code>/api/{entity}</code>, <code>/api/{entity}/{id}</code>) look up the entity in the spec, validate requests against the spec's fields and types, enforce permissions declared in the spec (which roles can read or write which entities), and run declared workflows (status transitions) and computed fields through a safe expression evaluator rather than generated code. The front end can be spec-driven too: forms and tables rendered from field definitions.</p>
<p><b>Escape hatches.</b> Some needs won't fit the spec language. Provide narrow, controlled extension points (custom validation hooks, computed fields in a safe expression language, plug-in functions from an allow-list) rather than arbitrary generated code. Keep a spec version number and write migrations for spec format changes.</p>
<p><b>Trade-offs</b>: less flexibility per app, and the runtime must be designed carefully (performance, security, clear errors). For AI systems, though, it dramatically shrinks what the model must get right.</p>`,
    example: {
      t: "A tiny spec-driven API runtime with FastAPI",
      intro: "One generic set of routes serves any entity declared in a spec file, with field validation and role-based permissions coming from the spec.",
      lang: "python",
      code: `# spec.json (could be written by a human or produced and validated from an LLM plan)
SPEC = {
  "entities": {
    "lead":    {"fields": {"name": "str", "phone": "str", "budget": "int", "status": "str"},
                "required": ["name", "phone"], "read": ["sales", "admin"], "write": ["sales", "admin"],
                "status_flow": {"new": ["contacted"], "contacted": ["won", "lost"], "won": [], "lost": []}},
    "invoice": {"fields": {"lead_id": "int", "amount": "int"}, "required": ["lead_id", "amount"],
                "read": ["admin", "finance"], "write": ["finance"]}
  }
}

from fastapi import FastAPI, HTTPException, Header
app = FastAPI()
DB: dict[str, dict[int, dict]] = {name: {} for name in SPEC["entities"]}
TYPES = {"str": str, "int": int}

def entity_or_404(name: str) -> dict:
    if name not in SPEC["entities"]:
        raise HTTPException(404, f"unknown entity {name}")
    return SPEC["entities"][name]

def check_role(ent: dict, role: str, action: str):
    if role not in ent[action]:
        raise HTTPException(403, f"role {role} cannot {action}")

def validate(ent: dict, body: dict, partial=False) -> dict:
    unknown = set(body) - set(ent["fields"])
    if unknown: raise HTTPException(422, f"unknown fields {sorted(unknown)}")
    for f, t in ent["fields"].items():
        if f in body and not isinstance(body[f], TYPES[t]): raise HTTPException(422, f"{f} must be {t}")
    if not partial:
        missing = [f for f in ent["required"] if f not in body]
        if missing: raise HTTPException(422, f"missing {missing}")
    return body

@app.get("/api/{name}")
def list_items(name: str, x_role: str = Header()):
    ent = entity_or_404(name); check_role(ent, x_role, "read")
    return list(DB[name].values())

@app.post("/api/{name}", status_code=201)
def create(name: str, body: dict, x_role: str = Header()):
    ent = entity_or_404(name); check_role(ent, x_role, "write")
    item = {"id": len(DB[name]) + 1, **validate(ent, body)}
    if "status_flow" in ent: item.setdefault("status", next(iter(ent["status_flow"])))
    DB[name][item["id"]] = item
    return item

@app.patch("/api/{name}/{item_id}")
def update(name: str, item_id: int, body: dict, x_role: str = Header()):
    ent = entity_or_404(name); check_role(ent, x_role, "write")
    item = DB[name].get(item_id)
    if not item:
        raise HTTPException(404, "not found")
    validate(ent, body, partial=True)
    if "status" in body and "status_flow" in ent:
        if body["status"] not in ent["status_flow"][item["status"]]:
            raise HTTPException(409, f"cannot move from {item['status']} to {body['status']}")
    item.update(body)
    return item
# (In a real app the X-Role header would come from authentication, never from the client.)`,
      after: "Adding a new entity, field, permission or workflow is a spec change, and the same tested routes handle it. That's why generated apps built this way are as reliable as the runtime itself."
    },
    mistakes: [
      "Generating separate route code per entity when one generic, tested implementation could serve all of them.",
      "Letting the spec contain arbitrary code snippets that the runtime executes.",
      "No schema validation for the spec itself, so typos surface as confusing runtime errors.",
      "Changing the spec format without a version number and migration path for existing specs.",
      "Trusting role information supplied by the client (as in this simplified demo) instead of the authenticated session."
    ],
    practice: [
      ["Add a 'computed' field to the spec format, such as <code>total_with_gst = amount * 1.18</code>. How would the runtime evaluate it safely?", "Store the expression as a string in the spec, validate it once with a whitelist-based safe expression evaluator (only known fields, arithmetic operators and approved functions), and evaluate it per record with the same evaluator. Never use <code>eval</code>."],
      ["What two kinds of problems remain possible in a spec-driven system, and where is each fixed?", "Spec problems (wrong fields, invalid references), caught and fixed by spec validation or by editing the spec; and runtime bugs, fixed once in the shared runtime, which repairs every app at the same time."],
      ["When is generating custom code better than a spec-driven runtime?", "When each output genuinely needs unique logic the spec language can't express, when performance requires specialised code, or when the output must be handed over as standalone, readable source code."]
    ]
  },

  "14-2": {
    more: `<p><b>Treat model output like user input from the internet</b>: it can be malformed, incomplete, inconsistent or adversarial (via prompt injection). A normalisation layer between the model and your engine turns "whatever came back" into something guaranteed valid, or a clear error.</p>
<p><b>A normalisation pipeline</b>, in order:</p>
<ol><li><b>Parse</b> tolerantly (strip code fences, find the JSON object).</li>
<li><b>Shape</b>: ensure required keys exist with the right container types; default missing optional keys.</li>
<li><b>Canonicalise</b>: map synonyms to canonical values through alias tables (<code>"string"</code>, <code>"varchar"</code> and <code>"text"</code> to <code>text</code>; <code>"number"</code> to <code>decimal</code>); normalise names (snake_case, strip punctuation, deduplicate); trim lengths.</li>
<li><b>Validate references and rules</b>: references point to existing items, names don't clash with reserved words or keywords, no cycles where they're not allowed, values in allowed ranges.</li>
<li><b>Repair or drop</b>: fix what's unambiguous (rename a clashing field <code>id</code> to <code>external_id</code>), drop what can't be fixed, and <b>record a warning</b> for each change so users and developers can see what happened.</li></ol>
<p><b>Heuristics</b> fill gaps sensibly: infer a status field's terminal states from words like "rejected", "cancelled" and "closed"; detect manager-like roles from names; guess field types from names (<code>*_date</code>, <code>*_email</code>, <code>is_*</code>). Keep heuristics simple, documented and tested, and prefer asking the model to be explicit over clever guessing.</p>
<p><b>Test the normaliser</b> with a corpus of real, messy model outputs collected from logs: it's one of the most valuable test suites in an AI system, because it encodes everything the models have ever done wrong.</p>`,
    example: {
      t: "A plan normaliser with aliases, reserved words, reference checks and warnings",
      intro: "Messy model output goes in; a valid plan and a list of human-readable warnings come out.",
      lang: "python",
      code: `import keyword, re

TYPE_ALIASES = {"string": "text", "varchar": "text", "str": "text", "integer": "int", "number": "decimal",
                "float": "decimal", "money": "decimal", "boolean": "bool", "datetime": "timestamp"}
VALID_TYPES = {"text", "int", "decimal", "bool", "date", "timestamp", "email"}
RESERVED = {"id", "password", "created_at", "updated_at", "user", "order", "group"} | set(keyword.kwlist)

def snake(name: str) -> str:
    s = re.sub(r"[^0-9a-zA-Z]+", "_", re.sub(r"([a-z0-9])([A-Z])", r"\\1_\\2", name.strip())).strip("_").lower()
    return ("f_" + s) if s[:1].isdigit() else s[:40]

def normalise(raw: dict) -> tuple[dict, list[str]]:
    warnings, entities = [], []
    for e in raw.get("entities") or []:
        name = snake(str(e.get("name", "")))
        if not name:
            warnings.append("dropped an entity with no name"); continue
        if name in RESERVED:
            warnings.append(f"entity {name!r} renamed to {name}_record (reserved word)"); name += "_record"
        fields, seen = [], set()
        for f in e.get("fields") or []:
            fname = snake(str(f.get("name", "")))
            ftype = str(f.get("type", "text")).lower().strip()
            ftype = TYPE_ALIASES.get(ftype, ftype)
            if fname.endswith("_email"): ftype = "email"                       # simple, documented heuristic
            if fname in RESERVED:
                warnings.append(f"{name}.{fname} renamed to {fname}_value"); fname += "_value"
            if fname in seen:
                warnings.append(f"duplicate field {name}.{fname} dropped"); continue
            if ftype not in VALID_TYPES and not ftype.startswith("ref:"):
                warnings.append(f"{name}.{fname}: unknown type {ftype!r}, using text"); ftype = "text"
            seen.add(fname)
            fields.append({"name": fname, "type": ftype, "required": bool(f.get("required", False))})
        entities.append({"name": name, "fields": fields})
    names = {e["name"] for e in entities}
    for e in entities:
        for f in e["fields"]:
            if f["type"].startswith("ref:") and snake(f["type"][4:]) not in names:
                warnings.append(f"{e['name']}.{f['name']} referenced missing {f['type'][4:]!r}; changed to int")
                f["type"] = "int"
            elif f["type"].startswith("ref:"):
                f["type"] = "ref:" + snake(f["type"][4:])
    return {"entities": entities}, warnings

messy = {"entities": [{"name": "Order", "fields": [{"name": "ID", "type": "integer"},
          {"name": "Customer Email", "type": "string"}, {"name": "amount", "type": "money"},
          {"name": "amount", "type": "float"}, {"name": "class", "type": "varchar"},
          {"name": "assignedTo", "type": "ref:Staff Member"}]}]}
plan, warns = normalise(messy)
print(plan); print(*warns, sep="\\n")`,
      after: "Every repair produces a warning. Show warnings to the user (\"we renamed 'class' to 'class_value' because it's a reserved word\") and log them, since frequent warnings tell you which prompt instructions models struggle with."
    },
    mistakes: [
      "Passing model output straight to execution or code generation without normalisation.",
      "Silently fixing problems without recording warnings, making behaviour mysterious to users and developers.",
      "Over-clever heuristics that guess wrong more often than they help, with no tests.",
      "Not checking names against reserved words in every target language (SQL, Python, JavaScript).",
      "Never building a regression corpus of real messy outputs to test the normaliser against."
    ],
    practice: [
      ["What should the normaliser do with a field typed \"currency (INR)\"?", "Not in the alias table, so either add an alias (<code>currency</code> to <code>decimal</code>) after checking how often models use it, or fall back to a safe default with a warning. Logging unknown types tells you which aliases to add."],
      ["Why rename reserved names instead of rejecting the whole plan?", "The intent is clear and the fix is unambiguous, so repairing keeps the user moving. Rejecting would force another expensive model call for a trivial issue."],
      ["How would you build a regression test suite for the normaliser?", "Save real model outputs (especially ones that caused bugs) as fixture files, with expected normalised plans and warnings, and run them all in CI whenever normaliser code or prompts change."]
    ]
  },

  "14-3": {
    more: `<p><b>When models write code, check it before it touches anything.</b> Layers of checks, cheapest first:</p>
<ol><li><b>Path policy</b>: only accept files whose paths match an allow-list pattern (<code>app/*.py</code>, <code>tests/test_*.py</code>), resolved within the project directory, and never overwrite protected files (auth, configuration, the runtime, CI files).</li>
<li><b>Syntax</b>: parse each file without running it, using <code>ast.parse</code> for Python, a JavaScript parser (esprima, acorn, or <code>node --check</code>) for JS, or <code>json.loads</code> for JSON.</li>
<li><b>Static policy</b>: walk the syntax tree to forbid dangerous constructs: imports outside an allow-list (<code>os</code>, <code>subprocess</code>, <code>socket</code>), <code>eval</code>/<code>exec</code>, file and network access where not expected, and very large files.</li>
<li><b>Linters and type checkers</b> (ruff, mypy, eslint) to catch common bugs.</li>
<li><b>Dependencies</b>: validate any requested packages against an allow-list and pin versions; models sometimes invent package names (and attackers register them: "slopsquatting").</li>
<li><b>Execute tests in a sandbox</b> (next lesson's hardening techniques).</li></ol>
<p><b>Parsing multi-file replies</b>: ask for a strict delimiter format (<code>=== FILE: path ===</code> followed by content), parse it with a precise regex, and reject replies with unexpected structure. Alternatively, use tool calls where each call writes one file with a path and content argument, so structure is guaranteed.</p>
<p>Static checks never make code "safe"; they reduce risk and catch accidents. The real protection comes from running generated code with minimal privileges in an isolated environment.</p>`,
    example: {
      t: "Validating a model's multi-file reply with path policy and AST checks",
      intro: "Parses delimited files from a reply, enforces path rules, protected files, syntax and a static policy on imports and dangerous calls.",
      lang: "python",
      code: `import ast, re
from pathlib import PurePosixPath

ALLOWED_PATHS = [re.compile(p) for p in (r"^app/[a-z_]+\\.py$", r"^tests/test_[a-z_]+\\.py$", r"^static/[a-z_]+\\.(js|css)$")]
PROTECTED = {"app/auth.py", "app/db.py", "app/runtime.py"}
ALLOWED_IMPORTS = {"datetime", "decimal", "json", "math", "re", "typing", "dataclasses", "fastapi", "pydantic", "pytest", "app"}
FORBIDDEN_CALLS = {"eval", "exec", "compile", "__import__", "open"}
FILE_RE = re.compile(r"^=== FILE: (?P<path>\\S+) ===\\n(?P<body>.*?)(?=^=== FILE: |\\Z)", re.M | re.S)

def parse_files(reply: str) -> dict[str, str]:
    files = {m["path"]: m["body"].rstrip() + "\\n" for m in FILE_RE.finditer(reply)}
    if not files:
        raise ValueError("no files found; expected '=== FILE: path ===' blocks")
    return files

def check_python(path: str, src: str) -> list[str]:
    problems = []
    try:
        tree = ast.parse(src, filename=path)
    except SyntaxError as e:
        return [f"{path}:{e.lineno}: syntax error: {e.msg}"]
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            mods = [a.name for a in node.names] if isinstance(node, ast.Import) else [node.module or ""]
            for m in mods:
                if m.split(".")[0] not in ALLOWED_IMPORTS:
                    problems.append(f"{path}:{node.lineno}: import of {m!r} not allowed")
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in FORBIDDEN_CALLS:
            problems.append(f"{path}:{node.lineno}: call to {node.func.id}() not allowed")
        if isinstance(node, ast.Attribute) and node.attr.startswith("__") and node.attr.endswith("__"):
            problems.append(f"{path}:{node.lineno}: dunder attribute access {node.attr!r}")
    return problems

def accept_files(reply: str) -> tuple[dict[str, str], list[str]]:
    accepted, problems = {}, []
    for path, body in parse_files(reply).items():
        norm = str(PurePosixPath(path))
        if ".." in PurePosixPath(norm).parts or norm in PROTECTED or not any(p.match(norm) for p in ALLOWED_PATHS):
            problems.append(f"{path}: path not allowed"); continue
        if len(body) > 50_000:
            problems.append(f"{path}: file too large"); continue
        if norm.endswith(".py"):
            issues = check_python(norm, body)
            if issues:
                problems += issues; continue
        accepted[norm] = body
    return accepted, problems                      # send problems back to the model for a repair attempt

reply = """=== FILE: app/report.py ===
import json, subprocess
def total(rows): return sum(r["amount"] for r in rows)
=== FILE: app/auth.py ===
ALLOW_ALL = True
"""
print(accept_files(reply))`,
      after: "The example reply tries two things it shouldn't: importing <code>subprocess</code> and overwriting the protected auth module. Both are rejected with specific messages that can go back to the model for repair."
    },
    mistakes: [
      "Writing model-generated files to disk before checking paths, letting a reply overwrite configuration or authentication code.",
      "Treating static checks as proof of safety instead of one layer before sandboxed execution.",
      "Loose reply formats that are hard to parse reliably; use strict delimiters or tool calls.",
      "Installing whatever packages generated code requests, including invented or malicious names.",
      "Vague rejection messages, so repair attempts don't know what to fix."
    ],
    practice: [
      ["Why check for dunder attribute access like <code>__class__</code> or <code>__subclasses__</code> in generated code?", "Attribute chains through dunder attributes are a classic way to reach dangerous objects (for example from <code>().__class__</code> to <code>subprocess</code>), bypassing simple import and name checks."],
      ["A model requests the package <code>fastapi-auth-helperz</code>. What's your policy?", "Reject packages not on an allow-list. Invented names may not exist, or may have been registered by attackers anticipating hallucinated names. If a new package is genuinely needed, a human reviews and adds it."],
      ["What advantage do tool calls (write_file(path, content)) have over a delimited text format for multi-file output?", "Structure is guaranteed by the API (separate path and content arguments), so there's no fragile parsing, and each call can be validated and rejected individually."]
    ]
  }
});
