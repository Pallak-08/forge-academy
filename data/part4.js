/* Forge Academy course data, modules 13-16 */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 13, id: "agents", title: "AI agent design", level: 4,
  blurb: "What turns a model call into an agent: a goal, a loop, tools, feedback, people in the loop and safe stopping conditions.",
  saas: "<code>agent.py</code> (the orchestrator: build_app, build_platform_app, _verify), <code>server.py</code> (the Interaction channel), <code>planner.fix_plan</code>.",
  lessons: [
    {
      t: "What an agent is",
      sub: ["Chatbot vs workflow vs agent", "The loop: decide, act, observe, repeat", "Tools: the actions an agent may take", "State the agent carries between steps", "Stopping conditions and budgets"],
      body: `<p>A single model call answers once. An <b>agent</b> pursues a goal over many steps: it decides what to do, acts (calls a tool, runs code, asks a person), observes the result and decides again, until the goal is met or a limit is hit.</p>
<p>SaaSForge is a <b>structured</b> agent: the order of steps is fixed in code (clarify, plan, generate, verify, fix), and the model makes decisions only inside steps. This is more reliable than letting a model choose every step, and it is how most production agents are built.</p>`,
      lang: "python",
      code: `def run_agent(goal: str, llm, tools: dict, max_steps: int = 8) -> str:
    """A minimal free-form agent loop, for comparison with SaaSForge's fixed pipeline."""
    history = [f"Goal: {goal}"]
    tool_list = ", ".join(tools)
    for step in range(max_steps):
        decision = extract_json(llm.complete(
            f"You can use tools: {tool_list}. Reply JSON: "
            '{"tool": name, "input": "..."} or {"final": "answer"}',
            "\\n".join(history[-12:]),                 # keep context bounded
        ))
        if "final" in decision:
            return decision["final"]
        name = decision.get("tool")
        if name not in tools:
            history.append(f"Error: unknown tool {name!r}")
            continue
        try:
            result = tools[name](decision.get("input", ""))
        except Exception as e:                       # observe failures too
            result = f"Error: {e}"
        history.append(f"Step {step}: {name}({decision.get('input')!r}) -> {str(result)[:500]}")
    return "Stopped: step budget used up"

tools = {
    "calc": lambda expr: evaluate(expr, {}),         # Module 15's safe evaluator
    "word_count": lambda text: len(text.split()),
}`,
      ex: "Run this loop with two simple tools and log every step. Then list three ways it can go wrong that SaaSForge's fixed pipeline avoids.",
      q: ["What is the main reliability advantage of a fixed pipeline over a free-form agent?", ["It uses fewer tokens", "The code controls the order of steps; the model only fills in decisions", "It needs no model", "It runs faster"], 1, "Constraining the model to decisions inside known steps removes whole classes of failure."]
    },
    {
      t: "Human in the loop",
      sub: ["Where people should decide: ambiguity and irreversible steps", "Clarifying questions with options", "Approval gates and revision loops", "Mapping free-text answers back to structure", "One interface for CLI and web: the Interaction protocol"],
      body: `<p>SaaSForge stops for a person at exactly two points: the clarifying questions and the plan approval. Those are where a wrong guess is expensive and a person knows the answer.</p>
<p><code>build_app</code> takes an <code>interact</code> object with two methods, <code>ask(questions)</code> and <code>approve(plan)</code>. The web server passes an implementation that waits on a queue for the browser; the CLI passes one that reads from the terminal; tests can pass one that answers automatically. The agent does not know or care which.</p>`,
      lang: "python",
      code: `from typing import Protocol

class Interaction(Protocol):
    def ask(self, questions: list[dict]) -> list[dict]: ...
    def approve(self, plan: dict) -> tuple[str, str]: ...      # ("approve" | "revise", feedback)

class TerminalInteract:
    def ask(self, questions):
        answers = []
        for q in questions:
            print(q["text"])
            for i, opt in enumerate(q.get("options", []), 1):
                print(f"  {i}. {opt}")
            raw = input("> ").strip()
            pick = q["options"][int(raw) - 1] if raw.isdigit() and 0 < int(raw) <= len(q["options"]) else raw
            answers.append({"id": q["id"], "text": q["text"], "answer": pick})
        return answers

    def approve(self, plan):
        print(f"Plan: {len(plan['entities'])} entities, roles {[r['name'] for r in plan['roles']]}")
        fb = input("Press Enter to approve, or describe a change: ").strip()
        return ("approve", "") if not fb else ("revise", fb)

class AutoInteract:                                   # for tests and scheduled runs
    def ask(self, questions):
        return [{"id": q["id"], "text": q["text"], "answer": q["options"][0]} for q in questions]
    def approve(self, plan):
        return ("approve", "")

def plan_with_approval(llm, brief, interact: Interaction, max_revisions: int = 4):
    plan, feedback = None, ""
    for revision in range(max_revisions + 1):
        plan = make_plan(llm, brief, feedback, previous=plan)
        action, feedback = interact.approve(plan)
        if action == "approve":
            break
    return plan`,
      ex: "Implement a third Interaction that reads answers from a JSON file, so you can replay the same build twice and compare the plans.",
      q: ["Why does build_app receive an interact object instead of calling input()?", ["input() is slow", "So the same agent works in the CLI, the web UI and tests", "Python forbids input in threads", "For security"], 1, "Dependency injection of the interaction channel decouples agent logic from the interface."]
    },
    {
      t: "Plan, then execute",
      sub: ["Small, checkable model output vs large free-form output", "The plan as a contract between model and engine", "Diffing plan versions to show what changed", "Revising a plan from feedback", "When the model should write code directly (and when not)"],
      body: `<p>The central design decision of SaaSForge: <b>the model writes a JSON plan; a hand-written, tested engine builds the app</b>. Free models are unreliable at writing dozens of correct files of permission code, but they are good at a 2 KB plan, and a plan can be validated.</p>
<p><code>diff_plans</code> compares two plans and returns human-readable changes ("added field loan.collateral", "officer can now delete"), shown to the client after each revision. The older page mode in <code>generator.py</code> lets the model write code directly; compare the two to see why the plan approach builds more reliably.</p>`,
      lang: "python",
      code: `def diff_plans(old: dict | None, new: dict) -> list[str]:
    if not old:
        return []
    out = []
    old_e = {e["name"]: e for e in old["entities"]}
    new_e = {e["name"]: e for e in new["entities"]}
    for name in new_e.keys() - old_e.keys():
        out.append(f"Added {name}")
    for name in old_e.keys() - new_e.keys():
        out.append(f"Removed {name}")
    for name in new_e.keys() & old_e.keys():
        of = {f["name"]: f for f in old_e[name]["fields"]}
        nf = {f["name"]: f for f in new_e[name]["fields"]}
        out += [f"Added field {name}.{f}" for f in nf.keys() - of.keys()]
        out += [f"Removed field {name}.{f}" for f in of.keys() - nf.keys()]
        out += [f"Changed {name}.{f}: {of[f]['type']} -> {nf[f]['type']}"
                for f in nf.keys() & of.keys() if of[f]["type"] != nf[f]["type"]]
    old_r = {r["name"] for r in old["roles"]}
    new_r = {r["name"] for r in new["roles"]}
    out += [f"New role {r}" for r in new_r - old_r]
    return out

v1 = {"roles": [{"name": "officer"}], "entities": [{"name": "loan", "fields": [{"name": "amount", "type": "float"}]}]}
v2 = {"roles": [{"name": "officer"}, {"name": "manager"}],
      "entities": [{"name": "loan", "fields": [{"name": "amount", "type": "float"}, {"name": "collateral", "type": "str"}]}]}
print(diff_plans(v1, v2))`,
      ex: "Extend diff_plans to report permission changes per role and entity, and stage changes. Compare your version with <code>saasforge/platform/plan.py</code>'s diff_plans.",
      q: ["Why is a JSON plan easier to trust than generated code?", ["It is shorter, structured and can be fully validated by code", "JSON cannot have bugs", "Models write JSON faster", "Browsers can run it"], 0, "A small structured artifact can be checked exhaustively; thousands of lines of code cannot."]
    },
    {
      t: "Self-correction loops",
      sub: ["Verify every output: lint, build, test, smoke", "Feeding the failure back: stage + log excerpt", "Fix the plan, regenerate, verify again", "Attempt budgets and failure fingerprints", "Knowing when a failure is not the model's fault"],
      body: `<p>After generating, SaaSForge verifies in Docker. If a stage fails, it sends the stage name and the end of the log to <code>planner.fix_plan</code>, regenerates the app from the corrected plan and verifies again, up to <code>max_fixes</code> times.</p>
<p>The clever part is the <b>fingerprint</b>: the failing stage plus the log tail with timings and memory addresses stripped. If the same fingerprint appears twice, revising the plan did not help, so the problem is probably the engine or the environment, and the loop stops instead of burning attempts. Build failures stop at once for the same reason.</p>`,
      lang: "python",
      code: `import re

def fingerprint(stage: str, log: str) -> tuple[str, str]:
    tail = log[-600:]
    tail = re.sub(r"0x[0-9a-f]+|\\d+(\\.\\d+)?s\\b", "", tail)    # strip addresses and timings
    return stage, tail

def build_with_fixes(plan, llm, generate, verify, max_fixes: int = 4):
    last_fp = None
    for attempt in range(max_fixes + 1):
        files = generate(plan)                        # deterministic engine
        stage, log = verify(files)                    # None if everything passed
        if stage is None:
            return {"ok": True, "plan": plan, "attempts": attempt + 1}
        if stage == "build":
            return {"ok": False, "error": "Docker build failed (environment, not plan)", "log": log}
        fp = fingerprint(stage, log)
        if fp == last_fp:
            return {"ok": False, "error": f"Same {stage} failure repeated; not a plan problem", "log": log}
        if attempt == max_fixes:
            return {"ok": False, "error": f"Still failing at {stage} after {max_fixes} fixes", "log": log}
        last_fp = fp
        plan = fix_plan(llm, plan, stage, log[-4000:])  # model revises the PLAN, not the code
    return {"ok": False}`,
      ex: "Simulate verify() with a function that fails twice with different errors, then passes. Then make it fail twice with the same error and confirm the loop stops early.",
      q: ["Why strip timings and memory addresses from the fingerprint?", ["To save memory", "They change every run, so identical failures would look different", "For privacy", "Regex requires it"], 1, "Normalising noisy parts lets you detect that the same failure repeated."]
    }
  ]
});

COURSE.push({
  n: 14, id: "codegen", title: "Code generation", level: 4,
  blurb: "Programs that write programs: templates, spec-driven runtimes, validating model output and checking generated code.",
  saas: "<code>platform/plan.py</code> (normalize_plan, 380 lines), <code>platform/codegen.py</code>, <code>scaffold.py</code>, <code>generator.py</code> (parse_blocks, accept_files, lint), <code>deploy.py</code>.",
  lessons: [
    {
      t: "Template-based generation",
      sub: ["Files as strings in a dict: path to content", "f-strings vs string.Template vs Jinja2", "Escaping: html.escape, json.dumps, repr", "Writing a file tree safely", "Fixed scaffold files vs generated files"],
      body: `<p>SaaSForge represents a whole project as a <code>dict[str, str]</code>: path to file content. Scaffold files (db.py, auth.py, main.py, conftest.py) are fixed strings; a few files are generated from the plan; <code>write_tree</code> writes them all.</p>
<p>When you put data into generated code, escape it for the target language: <code>json.dumps</code> or <code>repr</code> for Python literals, <code>html.escape</code> for HTML. Otherwise a product name containing a quote breaks the generated file, or worse, injects code.</p>`,
      lang: "python",
      code: `import html, json
from pathlib import Path

SCAFFOLD = {
    "app/__init__.py": "",
    "requirements.txt": "fastapi\\nuvicorn[standard]\\nsqlalchemy>=2\\n",
}

def index_html(plan: dict) -> str:
    title = html.escape(plan["name"])                  # 'Bob\\'s <Loans>' stays safe
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><title>{title}</title>
<link rel="stylesheet" href="/styles.css"></head>
<body><div id="app" data-name="{title}"></div><script src="/app.js"></script></body></html>"""

def settings_py(plan: dict) -> str:
    return f"APP_NAME = {json.dumps(plan['name'])}\\nROLES = {json.dumps([r['name'] for r in plan['roles']])}\\n"

def write_tree(root: Path, files: dict[str, str]) -> None:
    root = root.resolve()
    for rel, content in files.items():
        target = (root / rel).resolve()
        if not target.is_relative_to(root):
            raise ValueError(f"refusing to write outside the project: {rel}")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")

plan = {"name": "Bob's <Loans>", "roles": [{"name": "officer"}]}
files = {**SCAFFOLD, "static/index.html": index_html(plan), "app/settings.py": settings_py(plan)}
write_tree(Path("out/demo"), files)`,
      ex: "Generate a complete FastAPI hello-world project (main.py, requirements.txt, Dockerfile, README) from a dict with name and port, then build and run it with Docker.",
      q: ["Why use json.dumps to put a name into generated Python code?", ["It is shorter", "It produces a correctly quoted and escaped literal", "Python requires JSON", "It is faster"], 1, "JSON string literals are valid Python string literals, with quotes and escapes handled."]
    },
    {
      t: "Spec-driven runtimes",
      sub: ["Generate data, not logic", "One generic, tested runtime reads spec.json", "Generic routes: /api/{table}", "Why this makes every app as reliable as the runtime", "Where to put per-app code anyway (models)"],
      body: `<p>SaaSForge barely generates logic at all. It copies a generic runtime (<code>crud.py</code>, <code>safe_expr.py</code>, <code>demo.py</code>, <code>migrate.py</code>, <code>app.js</code>) and writes the plan next to it as <code>spec.json</code>. At start-up the runtime reads the spec and serves the right tables, fields, roles, stages and formulas.</p>
<p>This is the <b>interpreter</b> approach as opposed to the <b>compiler</b> approach. Its huge advantage: you test the runtime once, deeply, and every generated app inherits that quality. Only the SQLAlchemy models are generated as code, because the ORM needs real classes.</p>`,
      lang: "python",
      code: `import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException

SPEC = json.loads((Path(__file__).parent / "spec.json").read_text())
ENT = {e["table"]: e for e in SPEC["entities"]}
router = APIRouter(prefix="/api")

def entity_for(table: str) -> dict:
    if table not in ENT:
        raise HTTPException(404, "Unknown table")
    return ENT[table]

def clean(ent: dict, body: dict) -> dict:
    values, errors = {}, {}
    for f in ent["fields"]:
        v = body.get(f["name"])
        if v in (None, "") and f.get("required"):
            errors[f["name"]] = "required"
        elif f["type"] == "enum" and v not in f["options"]:
            errors[f["name"]] = f"must be one of {f['options']}"
        elif f["type"] in ("int", "float") and v not in (None, ""):
            try:
                values[f["name"]] = int(v) if f["type"] == "int" else float(v)
            except (TypeError, ValueError):
                errors[f["name"]] = "must be a number"
        else:
            values[f["name"]] = v
    if errors:
        raise HTTPException(422, errors)
    return values

@router.post("/{table}")
def create_row(table: str, body: dict):
    ent = entity_for(table)
    values = clean(ent, body)
    return {"table": table, "saved": values}            # the real runtime inserts via the model`,
      ex: "Write a spec.json with two entities and build a generic list and create API that serves both, with no per-entity code. Add a third entity by editing only the JSON.",
      q: ["What is the main benefit of a generic runtime driven by spec.json?", ["Smaller JSON", "Test the runtime once and every generated app gets that reliability", "No database needed", "Faster startup"], 1, "Logic lives in one well-tested place; apps differ only in data."]
    },
    {
      t: "Validating and normalising model output",
      sub: ["Never trust a plan: check every field", "Aliases: 'string' becomes 'str', 'number' becomes 'float'", "Reserved names and Python keywords", "Repair what you can, drop what you cannot, warn visibly", "Heuristics with regex: inferring manager roles, negative stages"],
      body: `<p><code>normalize_plan</code> is 180 lines that turn whatever the model returned into a plan the engine can always build. Types are mapped through aliases; names are snake_cased and checked against reserved words (<code>id</code>, <code>password</code>, Python keywords); refs to missing entities are dropped; formulas are validated by the safe evaluator; roles without permissions get sensible defaults inferred by regex.</p>
<p>The rule is <b>degrade, don't crash</b>: anything that cannot be repaired is removed and a warning is shown to the user. Only a plan with no usable entities raises <code>PlanError</code>.</p>`,
      lang: "python",
      code: `import keyword, re

TYPES = {"str", "text", "int", "float", "bool", "date", "datetime", "enum", "ref"}
ALIASES = {"string": "str", "number": "float", "decimal": "float", "integer": "int",
           "boolean": "bool", "timestamp": "datetime", "select": "enum", "foreign_key": "ref"}
RESERVED = {"id", "owner_id", "created_at", "updated_at", "password", "role"}

def snake(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", str(s).lower()).strip("_")

def norm_field(raw: dict, entities: set[str], warn: list[str], ctx: str) -> dict | None:
    name = snake(raw.get("name", ""))
    if not name or name in RESERVED or keyword.iskeyword(name) or name[0].isdigit():
        warn.append(f"{ctx}: dropped field {raw.get('name')!r} (reserved or invalid name)")
        return None
    t = str(raw.get("type", "str")).lower()
    t = ALIASES.get(t, t)
    if t not in TYPES:
        warn.append(f"{ctx}.{name}: unknown type {t!r}, using str")
        t = "str"
    f = {"name": name, "type": t, "required": bool(raw.get("required"))}
    if t == "enum":
        opts = [str(o) for o in raw.get("options") or [] if str(o).strip()]
        if len(opts) < 2:
            warn.append(f"{ctx}.{name}: enum needs 2+ options, using str")
            f["type"] = "str"
        else:
            f["options"] = opts
    if t == "ref":
        target = snake(raw.get("ref", ""))
        if target not in entities:
            warn.append(f"{ctx}.{name}: ref to unknown entity {target!r}, dropped")
            return None
        f["ref"] = target
    return f

warn: list[str] = []
print(norm_field({"name": "Loan Amount", "type": "Number", "required": True}, {"borrower"}, warn, "loan"))
print(norm_field({"name": "class", "type": "str"}, set(), warn, "loan"), warn)`,
      ex: "Write norm_entity that uses norm_field, removes duplicate field names and ensures at least one required field. Feed it ten deliberately broken entities.",
      q: ["What does SaaSForge do with a field it cannot repair?", ["Crashes the build", "Drops it and shows a warning", "Asks the model again forever", "Keeps it as is"], 1, "Degrade gracefully with a visible warning; never crash on bad model output."]
    },
    {
      t: "Checking generated code",
      sub: ["Parsing generated Python with ast.parse", "Safe path whitelists for files a model may write", "Protected files the model may not overwrite", "Parsing multi-file replies (=== FILE: ... ===)", "Validating requirements lines"],
      body: `<p>When a model does write code (page mode), every file is checked before it touches disk. <code>generator.parse_blocks</code> extracts files from the reply; <code>accept_files</code> keeps only paths that match a strict regex (<code>app/*.py</code>, <code>static/*.js</code>, <code>tests/test_*.py</code>) and refuses to overwrite scaffold files like auth.py; <code>lint</code> runs <code>ast.parse</code> on every Python file to catch syntax errors without running anything.</p>`,
      lang: "python",
      code: `import ast, re

BLOCK_RE = re.compile(r"^=== FILE: (?P<path>\\S+) ===[ \\t]*\\n(?P<body>.*?)\\n=== END FILE ===", re.S | re.M)
SAFE_PATH = re.compile(r"^(app/[a-z0-9_]+\\.py|static/[A-Za-z0-9_.-]+\\.(js|css)|tests/test_[a-z0-9_]+\\.py)$")
PROTECTED = {"app/auth.py", "app/db.py", "app/main.py", "tests/conftest.py"}

def parse_blocks(text: str) -> dict[str, str]:
    return {m.group("path"): m.group("body") for m in BLOCK_RE.finditer(text)}

def accept_files(parsed: dict[str, str]) -> tuple[dict[str, str], list[str]]:
    ok, rejected = {}, []
    for path, body in parsed.items():
        if path in PROTECTED or not SAFE_PATH.match(path):
            rejected.append(path)
        else:
            ok[path] = body
    return ok, rejected

def lint(files: dict[str, str]) -> list[str]:
    problems = []
    for path, src in files.items():
        if path.endswith(".py"):
            try:
                ast.parse(src)
            except SyntaxError as e:
                problems.append(f"{path}:{e.lineno}: {e.msg}")
    return problems

reply = """=== FILE: app/api.py ===
def f(:
    pass
=== END FILE ===
=== FILE: ../../etc/passwd ===
root
=== END FILE ==="""
files, rejected = accept_files(parse_blocks(reply))
print(rejected, lint(files))`,
      ex: "Ask a model to write a two-file FastAPI app in the === FILE === format. Run parse_blocks, accept_files and lint on the reply, then feed lint errors back to the model and ask for a fix.",
      q: ["What does ast.parse catch?", ["Logic errors", "Syntax errors, without running the code", "Security holes", "Missing imports"], 1, "It parses source into a tree; invalid syntax raises SyntaxError."]
    }
  ]
});

COURSE.push({
  n: 15, id: "ast", title: "Parsing and ASTs", level: 4,
  blurb: "How code is read by programs: tokens, syntax trees, walking them, and building a safe evaluator instead of eval().",
  saas: "<code>platform/runtime/safe_expr.py</code> (122 lines, the formula engine), <code>convert/engine.py</code> (regex-based code mapping), <code>generator.lint</code>.",
  lessons: [
    {
      t: "From text to tree",
      sub: ["Tokens, grammar and syntax trees", "Expressions vs statements", "ast.parse(mode='eval')", "Node types: BinOp, Name, Constant, Call, Compare", "ast.dump to explore"],
      body: `<p>A <b>parser</b> turns text into a tree that represents its structure. <code>amount * rate / 100</code> becomes a <code>BinOp(Div)</code> whose left side is <code>BinOp(Mult)</code> of two <code>Name</code> nodes. Every language tool you use (compilers, linters, formatters, your editor) works on trees like this.</p>
<p>Python exposes its own parser through the <code>ast</code> module, so you can analyse code or formulas without running them.</p>`,
      lang: "python",
      code: `import ast

tree = ast.parse("emi(amount, rate, months) * 1.02 if months > 12 else amount", mode="eval")
print(ast.dump(tree.body, indent=2))

for node in ast.walk(tree):
    print(type(node).__name__, getattr(node, "id", getattr(node, "value", "")))

# Count every name a formula uses
def names_in(src: str) -> set[str]:
    return {n.id for n in ast.walk(ast.parse(src, mode="eval")) if isinstance(n, ast.Name)}

print(names_in("principal * rate / 1200 + fee"))     # {'principal', 'rate', 'fee'}`,
      ex: "Use ast.walk to list every function called in one of SaaSForge's Python files (look for ast.Call nodes whose func is an ast.Name or ast.Attribute).",
      q: ["What does <code>mode='eval'</code> mean in ast.parse?", ["Run the code", "Parse a single expression rather than a module of statements", "Evaluate safely", "Enable optimisation"], 1, "eval mode accepts exactly one expression."]
    },
    {
      t: "Why eval() is dangerous",
      sub: ["eval runs arbitrary code", "Escapes through attributes: ().__class__.__bases__", "Restricting builtins is not enough", "The whitelist principle", "Safe alternatives"],
      body: `<p>Users (and models) write formulas like <code>amount * rate / 100</code>. Running them with <code>eval</code> lets anyone run any Python, including deleting files or reading secrets. Removing builtins does not save you: attackers reach dangerous objects through attribute chains.</p>
<p>The safe approach is a <b>whitelist</b>: parse the formula, allow only node types you understand (numbers, names you provide, arithmetic, comparisons, calls to functions you list) and reject everything else, especially attribute access.</p>`,
      lang: "python",
      code: `# DON'T: this is what an attacker would send as a "formula"
evil = "().__class__.__base__.__subclasses__()"
# eval(evil, {"__builtins__": {}})   -> still reaches every class in the interpreter

import ast
ALLOWED = (ast.Expression, ast.BinOp, ast.UnaryOp, ast.Constant, ast.Name, ast.Load,
           ast.Add, ast.Sub, ast.Mult, ast.Div, ast.USub, ast.Call, ast.Compare,
           ast.Gt, ast.Lt, ast.GtE, ast.LtE, ast.IfExp)

def is_safe(src: str) -> bool:
    try:
        tree = ast.parse(src, mode="eval")
    except SyntaxError:
        return False
    return all(isinstance(n, ALLOWED) for n in ast.walk(tree))

print(is_safe("amount * rate / 100"))          # True
print(is_safe(evil))                           # False: Attribute nodes are not allowed
print(is_safe("__import__('os').system('rm -rf /')"))   # parses, but see next lesson for name checks`,
      ex: "Find three different formula strings that is_safe would accept but that should still be rejected (hint: names and function calls). You will fix them in the next lesson.",
      q: ["Why is removing __builtins__ not enough to make eval safe?", ["It is enough", "Attribute chains on literals can reach dangerous objects", "eval ignores it", "Because of the GIL"], 1, "Introspection via __class__ and friends escapes the empty builtins."]
    },
    {
      t: "Building a safe expression evaluator",
      sub: ["validate(): check nodes, names and function calls", "evaluate(): walk the tree and compute", "Operator tables: ast.Add to operator.add", "Whitelisted functions (emi, pct, round, min, max)", "Length limits and clear error messages"],
      body: `<p><code>safe_expr.py</code> has two halves. <code>validate</code> runs once when the plan is normalised: only known fields may be named, only whitelisted functions may be called, the formula must be short. <code>evaluate</code> walks the tree for each record and computes the value itself, never calling eval.</p>
<p>This is a tiny <b>interpreter</b>. Writing one is the best way to understand how programming languages work.</p>`,
      lang: "python",
      code: `import ast, math, operator

def emi(principal, annual_rate_pct, months):
    r = annual_rate_pct / 1200
    if months <= 0:
        return 0
    return principal / months if r == 0 else principal * r * (1 + r) ** months / ((1 + r) ** months - 1)

FUNCS = {"emi": emi, "round": round, "min": min, "max": max, "abs": abs, "sqrt": math.sqrt}
BIN = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
       ast.Div: operator.truediv, ast.Mod: operator.mod, ast.Pow: operator.pow}
CMP = {ast.Gt: operator.gt, ast.GtE: operator.ge, ast.Lt: operator.lt,
       ast.LtE: operator.le, ast.Eq: operator.eq, ast.NotEq: operator.ne}

def ev(n, env):
    if isinstance(n, ast.Expression): return ev(n.body, env)
    if isinstance(n, ast.Constant) and isinstance(n.value, (int, float)): return n.value
    if isinstance(n, ast.Name):
        if n.id not in env: raise ValueError(f"unknown field {n.id}")
        return env[n.id] or 0
    if isinstance(n, ast.BinOp) and type(n.op) in BIN:
        if isinstance(n.op, ast.Pow) and abs(ev(n.right, env)) > 100: raise ValueError("exponent too large")
        return BIN[type(n.op)](ev(n.left, env), ev(n.right, env))
    if isinstance(n, ast.UnaryOp) and isinstance(n.op, ast.USub): return -ev(n.operand, env)
    if isinstance(n, ast.Compare) and len(n.ops) == 1 and type(n.ops[0]) in CMP:
        return CMP[type(n.ops[0])](ev(n.left, env), ev(n.comparators[0], env))
    if isinstance(n, ast.IfExp): return ev(n.body, env) if ev(n.test, env) else ev(n.orelse, env)
    if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id in FUNCS and not n.keywords:
        return FUNCS[n.func.id](*(ev(a, env) for a in n.args))
    raise ValueError(f"not allowed: {type(n).__name__}")

def evaluate(src: str, env: dict):
    if len(src) > 200: raise ValueError("formula too long")
    try:
        return ev(ast.parse(src, mode="eval"), env)
    except ZeroDivisionError:
        return None

print(round(evaluate("emi(amount, rate, months)", {"amount": 500000, "rate": 10.5, "months": 60}), 2))
print(evaluate("amount * 0.02 if amount > 100000 else 500", {"amount": 250000}))`,
      ex: "Add support for <code>and</code>/<code>or</code> (ast.BoolOp) and a <code>pct(part, whole)</code> function. Then compare your evaluator with SaaSForge's safe_expr.py line by line.",
      q: ["Why check the size of the exponent in Pow?", ["Precision", "A huge power like 9**9**9 can freeze the server (denial of service)", "Python cannot do powers", "Negative numbers"], 1, "Resource exhaustion is also an attack; limit expensive operations."]
    },
    {
      t: "Scanning code with regex and parsers",
      sub: ["When regex is enough and when you need a parser", "Finding functions, ids and banners in JavaScript", "Named groups and alternation", "Mapping a codebase automatically", "Limits: why regex cannot parse nested structures"],
      body: `<p><code>convert/engine.py</code> needs a rough map of a client's JavaScript (function names, which DOM ids each part touches, workflow stage names) without running it. It uses well-chosen regexes: <code>FUNC</code> matches both <code>function name(</code> and <code>const name = (...) =&gt;</code>, <code>DOM_ID</code> matches <code>getElementById("x")</code> and <code>$("x")</code>.</p>
<p>Regex is right for shallow, line-level patterns. For anything nested (matching braces, understanding scope) use a real parser: <code>ast</code> for Python, or a JavaScript parser library.</p>`,
      lang: "python",
      code: `import re
from collections import Counter

FUNC = re.compile(r"(?:async\\s+)?function\\s+([A-Za-z_$][\\w$]*)\\s*\\("
                  r"|(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>")
DOM_ID = re.compile(r"""getElementById\\(\\s*["']([\\w-]+)["']|\\$\\(\\s*["']([A-Za-z][\\w-]*)["']\\s*\\)""")
BANNER = re.compile(r"//\\s*={4,}\\s*([^=\\n]{3,100}?)\\s*=*\\s*(?:\\n|$)")

js = """
// ===== Upload and parse =====
async function readFile(f) { document.getElementById("drop").classList.add("busy"); }
const scoreLoan = (loan) => { $("score").textContent = loan.score; };
// ===== Report =====
function buildReport() { getElementById('report'); }
"""
funcs = [a or b for a, b in FUNC.findall(js)]
ids = [a or b for a, b in DOM_ID.findall(js)]
sections = BANNER.findall(js)
print(funcs, Counter(ids), sections)`,
      ex: "Run these regexes over a real HTML tool's script (any single-file web app you have) and produce a short JSON summary: sections, functions per section and DOM ids used.",
      q: ["Why can't regex reliably match balanced braces?", ["It is too slow", "Standard regex cannot count arbitrary nesting depth", "Braces are special characters", "It can"], 1, "Nesting needs a stack (a parser); classic regular expressions have none."]
    }
  ]
});

COURSE.push({
  n: 16, id: "files", title: "Data and document processing", level: 4,
  blurb: "Turning messy uploads into clean data: CSV, Excel, PDF, Word, HTML, type inference, huge files and hostile archives.",
  saas: "<code>files.py</code> (readers, type inference, seed matching), <code>htmlslim.py</code> (streaming a 1 GB page), <code>analyzer.summarize_html</code> (BeautifulSoup), <code>convert/engine.py</code>.",
  lessons: [
    {
      t: "CSV and type inference",
      sub: ["csv.reader / DictReader, delimiters, encodings, BOM", "Detecting numbers, dates, booleans, enums", "Many date formats", "Coercing cells and reporting bad rows", "Row limits and memory"],
      body: `<p>Spreadsheets from real businesses are messy: thousands separators, ₹ signs, dates in five formats, blank rows. <code>files.infer_type</code> looks at a column's values and decides whether it is an int, float, date, bool, an enum (few distinct values) or plain text.</p>
<p>Always decode with <code>utf-8-sig</code> to strip the byte-order mark Excel adds, sniff the delimiter, and cap the number of rows you read.</p>`,
      lang: "python",
      code: `import csv, io, re
from datetime import datetime

DATE_FORMATS = ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%d %b %Y", "%m/%d/%Y")

def as_number(v: str):
    s = re.sub(r"[₹$,\\s]", "", v)
    try:
        return int(s) if re.fullmatch(r"-?\\d+", s) else float(s)
    except ValueError:
        return None

def as_date(v: str):
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(v.strip(), fmt).date()
        except ValueError:
            pass
    return None

def infer_type(values: list[str]) -> tuple[str, list[str] | None]:
    vals = [v for v in values if v.strip()]
    if not vals:
        return "str", None
    if all(as_number(v) is not None for v in vals):
        return ("int" if all(isinstance(as_number(v), int) for v in vals) else "float"), None
    if all(as_date(v) for v in vals):
        return "date", None
    if all(v.lower() in {"yes", "no", "true", "false", "y", "n"} for v in vals):
        return "bool", None
    distinct = sorted(set(vals))
    if len(distinct) <= 8 and len(vals) >= 3 * len(distinct):
        return "enum", distinct
    return ("text" if max(map(len, vals)) > 120 else "str"), None

raw = "\\ufeffname,amount,disbursed,status\\nAarav,\\"5,00,000\\",12/03/2026,approved\\nPriya,120000,2026-04-01,new\\nRohit,80000,01-05-2026,approved\\n"
reader = csv.DictReader(io.StringIO(raw.lstrip("\\ufeff")))
rows = list(reader)
for col in reader.fieldnames:
    print(col, infer_type([r[col] for r in rows]))`,
      ex: "Download a real public CSV (for example a government open-data file) and run infer_type on every column. Fix every wrong guess by improving the rules.",
      q: ["Why decode CSV uploads with utf-8-sig?", ["It is faster", "It removes the byte-order mark Excel puts at the start", "It handles commas", "It detects dates"], 1, "Otherwise the first column name starts with an invisible \\ufeff character."]
    },
    {
      t: "Excel, PDF and Word",
      sub: ["openpyxl: workbooks, sheets, read_only mode", "pypdf: extracting text page by page", "DOCX is a zip of XML: reading document.xml", "Choosing what to send to the model", "Graceful failure per file"],
      body: `<p>Each format needs its own reader, but they all produce the same output: either a <b>table digest</b> (header, typed columns, sample rows) or a <b>text digest</b>. SaaSForge keeps one reader per format in a dict (<code>READERS</code>) and picks by extension.</p>
<p>A Word file is a zip archive; the text lives in <code>word/document.xml</code> inside <code>&lt;w:t&gt;</code> elements, so you can read it with only <code>zipfile</code> and a regex. One bad file should produce a clear error for that file, not fail the whole upload.</p>`,
      lang: "python",
      code: `import io, re, zipfile
from openpyxl import load_workbook          # pip install openpyxl pypdf
from pypdf import PdfReader

def read_xlsx(raw: bytes, max_rows: int = 20000) -> list[dict]:
    wb = load_workbook(io.BytesIO(raw), read_only=True, data_only=True)   # data_only: formula results
    tables = []
    for ws in wb.worksheets:
        rows = [list(r) for _, r in zip(range(max_rows), ws.iter_rows(values_only=True))]
        rows = [r for r in rows if any(c not in (None, "") for c in r)]
        if rows:
            tables.append({"sheet": ws.title, "header": [str(h or "") for h in rows[0]], "rows": rows[1:]})
    return tables

def read_pdf(raw: bytes, max_pages: int = 50) -> str:
    reader = PdfReader(io.BytesIO(raw))
    return "\\n".join((p.extract_text() or "") for p in reader.pages[:max_pages])

def read_docx(raw: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        xml = z.read("word/document.xml").decode("utf-8", "replace")
    paras = re.findall(r"<w:p[ >].*?</w:p>", xml, re.S)
    return "\\n".join("".join(re.findall(r"<w:t[^>]*>(.*?)</w:t>", p)) for p in paras)

READERS = {".xlsx": read_xlsx, ".pdf": read_pdf, ".docx": read_docx}

def digest(name: str, raw: bytes):
    ext = name[name.rfind("."):].lower()
    try:
        return {"name": name, "ok": True, "data": READERS[ext](raw)}
    except KeyError:
        return {"name": name, "ok": False, "error": f"{ext} is not supported"}
    except Exception as e:
        return {"name": name, "ok": False, "error": f"could not read: {e}"}`,
      ex: "Write <code>digest_files(list_of_paths)</code> that reads a folder of mixed files and prints one line per file: type, rows or characters, and any error.",
      q: ["What is inside a .docx file?", ["Plain text", "A zip archive of XML files", "A PDF", "A SQLite database"], 1, "Office Open XML formats (.docx, .xlsx, .pptx) are zip archives of XML parts."]
    },
    {
      t: "HTML with BeautifulSoup",
      sub: ["Parsing HTML into a tree", "find, find_all, select (CSS selectors)", "Getting text, attributes, labels for inputs", "Summarising a page's structure: forms, buttons, tables", "Removing scripts and styles"],
      body: `<p><b>BeautifulSoup</b> parses even broken HTML into a tree you can search with CSS selectors. <code>analyzer.summarize_html</code> uses it to produce a compact description of a page for the model: its title, headings, forms with labelled inputs, buttons, tables and element ids, capped at 150 ids.</p>
<p>Finding an input's human label is fiddly: check <code>&lt;label for=id&gt;</code>, a wrapping label, <code>aria-label</code>, then <code>placeholder</code>, then the name.</p>`,
      lang: "python",
      code: `from bs4 import BeautifulSoup               # pip install beautifulsoup4

html = """<html><head><title>Loan Calc</title><script>var x=1</script></head><body>
<h1>Loan calculator</h1>
<form id="calc"><label for="amt">Amount</label><input id="amt" type="number">
<input id="rate" placeholder="Interest %"><select id="tenure"><option>12</option><option>24</option></select>
<button id="go">Calculate EMI</button></form>
<table id="schedule"><tr><th>Month</th><th>EMI</th></tr></table></body></html>"""

soup = BeautifulSoup(html, "html.parser")
for t in soup(["script", "style"]):
    t.decompose()

def label_for(el) -> str:
    if el.get("id") and (lab := soup.find("label", attrs={"for": el["id"]})):
        return lab.get_text(strip=True)
    return el.get("aria-label") or el.get("placeholder") or el.get("name") or el.get("id", "")

summary = {
    "title": soup.title.get_text(strip=True) if soup.title else "",
    "headings": [h.get_text(strip=True) for h in soup.select("h1, h2, h3")],
    "inputs": [{"id": i.get("id"), "type": i.get("type", i.name), "label": label_for(i)}
               for i in soup.select("input, select, textarea")],
    "buttons": [b.get_text(strip=True) for b in soup.select("button")],
    "tables": [{"id": t.get("id"), "columns": [th.get_text(strip=True) for th in t.select("th")]}
               for t in soup.select("table")],
}
print(summary)`,
      ex: "Save any web page you use at work as HTML and write a summariser that prints its forms, inputs with labels, buttons and tables, like analyzer.summarize_html.",
      q: ["Which method lets you use CSS selectors in BeautifulSoup?", ["find", "select", "query", "css"], 1, "soup.select('table th') takes CSS selectors."]
    },
    {
      t: "Huge files and hostile archives",
      sub: ["Streaming: read in chunks, never the whole file", "Tokens split across chunk boundaries (carry-over)", "Skipping heavy blocks: scripts, base64 images, SVG", "Size caps everywhere: per file, total, rows", "Zip bombs and how to detect them"],
      body: `<p>Some client tools are a single 1 GB HTML file with embedded data. <code>htmlslim.slim_chunks</code> reads 8 MB at a time and copies only structural markup, skipping <code>&lt;script&gt;</code>, <code>&lt;style&gt;</code>, <code>&lt;svg&gt;</code> and base64 blobs. Because a tag like <code>&lt;script</code> can be split across two chunks, it keeps the last few characters of each chunk (<code>_CARRY = 16</code>) and prepends them to the next.</p>
<p>A <b>zip bomb</b> is a small archive that expands to gigabytes. Before extracting, sum the declared uncompressed sizes and refuse if it exceeds your limit.</p>`,
      lang: "python",
      code: `import re
from typing import Iterable, Iterator

OPEN = re.compile(r"<script\\b|<style\\b|<svg\\b", re.I)
CLOSE = {"<script": "</script>", "<style": "</style>", "<svg": "</svg>"}
CARRY = 16

def slim(chunks: Iterable[str]) -> Iterator[str]:
    """Yield the page without script/style/svg blocks, chunk by chunk."""
    buf, skipping_until = "", None
    for chunk in chunks:
        buf += chunk
        while True:
            if skipping_until:
                end = buf.lower().find(skipping_until)
                if end == -1:
                    buf = buf[-CARRY:]                  # keep a tail in case the end tag is split
                    break
                buf = buf[end + len(skipping_until):]
                skipping_until = None
            m = OPEN.search(buf)
            if not m:
                safe = max(0, len(buf) - CARRY)       # hold back a possibly split "<scri"
                yield buf[:safe]
                buf = buf[safe:]
                break
            yield buf[:m.start()]
            skipping_until = CLOSE[m.group(0).lower()]
            buf = buf[m.end():]
    if not skipping_until:
        yield buf

def chunks_of(s: str, n: int) -> Iterator[str]:
    for i in range(0, len(s), n):
        yield s[i:i + n]

page = "<h1>Hi</h1><script>var big='" + "x" * 50 + "'</script><p>Keep me</p><style>p{}</style><b>end</b>"
print("".join(slim(chunks_of(page, 7))))          # tiny chunks prove the carry-over works`,
      ex: "Generate a 300 MB HTML file with a Python script (mostly a giant script block), then slim it with 8 MB chunks while watching memory in your task manager. It should stay flat.",
      q: ["Why keep a 'carry' of characters between chunks?", ["For speed", "A tag like <script can be split across two chunks and would be missed", "To count lines", "For encoding"], 1, "Patterns that straddle a boundary only match if you join the tail to the next chunk."]
    }
  ]
});
