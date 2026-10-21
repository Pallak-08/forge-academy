/* Forge Academy: deeper material for Python lessons.
   Keyed by lesson reference ("module-index"). Each entry: more (HTML), example {t, intro, lang, code, after},
   mistakes [HTML], practice [[question, answer]]. */
window.DEEP = window.DEEP || {};
Object.assign(DEEP, {
  "1-0": {
    more: `<p><b>Everything is an object, and variables are labels.</b> When you write <code>score = 90</code>, Python creates an integer object 90 somewhere in memory and attaches the label <code>score</code> to it. Writing <code>other = score</code> doesn't copy anything: it attaches a second label to the same object. For numbers and strings this never surprises you, because they are <b>immutable</b>: "changing" them actually creates a new object. For lists and dicts (mutable), two labels on one object means a change through one label is visible through the other. Keep this picture in mind; it explains a whole family of bugs you'll meet later.</p>
<p><b>Numbers.</b> <code>int</code> has unlimited precision (Python happily computes <code>2 ** 200</code>). <code>float</code> is a 64-bit binary floating-point number, so <code>0.1 + 0.2</code> is <code>0.30000000000000004</code>. For money, store whole paise as ints, or use <code>decimal.Decimal</code>. <code>/</code> always returns a float (<code>7 / 2 == 3.5</code>); <code>//</code> is floor division (<code>7 // 2 == 3</code>) and <code>%</code> is the remainder. <code>round()</code> uses banker's rounding: <code>round(2.5) == 2</code>.</p>
<p><b>Strings</b> are immutable sequences of Unicode characters. You'll use these methods constantly: <code>strip()</code>, <code>lower()</code>, <code>split()</code>, <code>join()</code>, <code>replace()</code>, <code>startswith()</code>, <code>find()</code>, and slicing <code>s[start:stop:step]</code> (<code>s[::-1]</code> reverses). Build strings with <b>f-strings</b>, which also format numbers: <code>f"{price:,.2f}"</code> gives <code>1,499.00</code>, <code>f"{ratio:.1%}"</code> gives <code>42.5%</code>, and <code>f"{name=}"</code> prints both the name and the value, which is handy for debugging.</p>
<p><b>None and truthiness.</b> <code>None</code> means "no value". Compare it with <code>is None</code>, not <code>== None</code>. In conditions, <code>0</code>, <code>0.0</code>, <code>""</code>, <code>[]</code>, <code>{}</code> and <code>None</code> are falsy. That's convenient (<code>if items:</code>) but dangerous when 0 is a valid value: <code>if discount:</code> skips a real discount of 0. Write <code>if discount is not None:</code> when zero matters.</p>
<p><b>Conversions fail loudly, which is good.</b> <code>int("42")</code> works; <code>int("4.2")</code> and <code>int("abc")</code> raise <code>ValueError</code>. Input from users, files and APIs always arrives as strings, so convert at the boundary, handle errors there, and work with proper types everywhere else.</p>`,
    example: {
      t: "Cleaning messy form input",
      intro: "Real input is messy: extra spaces, inconsistent case, numbers with commas or currency symbols. This function turns a raw signup row into clean, typed values and reports problems instead of crashing.",
      lang: "python",
      code: `def clean_signup(raw: dict) -> tuple[dict, list[str]]:
    errors = []
    name = " ".join(raw.get("name", "").split()).title()       # collapse inner spaces, Title Case
    email = raw.get("email", "").strip().lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        errors.append(f"invalid email: {email!r}")

    age = None
    age_text = raw.get("age", "").strip()
    if age_text:
        try:
            age = int(age_text)
            if not 13 <= age <= 120:
                errors.append(f"age out of range: {age}")
        except ValueError:
            errors.append(f"age is not a whole number: {age_text!r}")

    budget_text = raw.get("budget", "0").replace("Rs", "").replace("₹", "").replace(",", "").strip()
    try:
        budget_paise = round(float(budget_text) * 100)          # store money as whole paise
    except ValueError:
        budget_paise = 0
        errors.append(f"budget is not a number: {raw.get('budget')!r}")

    return {"name": name, "email": email, "age": age, "budget_paise": budget_paise}, errors

row, problems = clean_signup({"name": "  asha   SHARMA ", "email": " Asha@Example.COM ",
                              "age": "21", "budget": "₹ 1,499.50"})
print(row)       # {'name': 'Asha Sharma', 'email': 'asha@example.com', 'age': 21, 'budget_paise': 149950}
print(problems)  # []
print(clean_signup({"name": "x", "email": "bad", "age": "twenty", "budget": "lots"})[1])`,
      after: "Notice the pattern: convert and validate once at the edge, collect errors with clear messages using <code>!r</code> (which shows quotes, so empty strings and stray spaces become visible), and return clean typed data."
    },
    mistakes: [
      "Comparing floats with <code>==</code>: <code>0.1 + 0.2 == 0.3</code> is False. Use <code>math.isclose()</code>, or integers for money.",
      "Using <code>if value:</code> when 0 or an empty string is a valid value. Use <code>if value is not None:</code>.",
      "Concatenating strings and numbers: <code>\"Total: \" + 5</code> raises TypeError. Use an f-string.",
      "Assuming <code>input()</code> or CSV values are numbers. They're always strings until you convert them.",
      "Calling a variable <code>list</code>, <code>str</code>, <code>id</code> or <code>type</code>, which hides the built-in and causes confusing errors later."
    ],
    practice: [
      ["What do <code>7 / 2</code>, <code>7 // 2</code>, <code>-7 // 2</code> and <code>7 % 3</code> evaluate to?", "<code>3.5</code>, <code>3</code>, <code>-4</code> (floor division rounds down, towards negative infinity) and <code>1</code>."],
      ["Write an f-string that prints a price of 1234567.891 rupees as <code>Rs 1,234,567.89</code>.", "<code>f\"Rs {price:,.2f}\"</code>. The comma adds thousands separators and <code>.2f</code> gives two decimals. For Indian lakh/crore grouping, use the <code>babel</code> library's number formatting."],
      ["Why does <code>b = a; b.append(4)</code> change <code>a</code> when <code>a</code> is a list, but <code>y = x; y += 1</code> doesn't change <code>x</code> when <code>x</code> is an int?", "Both assignments make two names point at the same object. Lists are mutable, so <code>append</code> modifies the shared object. Ints are immutable, so <code>y += 1</code> creates a new int and rebinds only <code>y</code>."]
    ]
  },

  "1-1": {
    more: `<p><b>Loops in Python iterate over things, not indexes.</b> Write <code>for order in orders:</code>, not <code>for i in range(len(orders)):</code>. When you also need the position, use <code>enumerate(orders, start=1)</code>. To walk two sequences together, use <code>zip(names, scores)</code>. Add <code>strict=True</code> in Python 3.10+ so mismatched lengths raise an error instead of silently truncating. To loop over a dict, use <code>for key, value in d.items():</code>.</p>
<p><b>while loops</b> are for "repeat until a condition changes": retrying a request, reading until the end of input, game loops. Every while loop needs a guaranteed way out. Bound retries with a counter, and use <code>break</code> to leave early. Python also has an unusual <code>for ... else</code>: the <code>else</code> block runs only if the loop finished <i>without</i> <code>break</code>, which is neat for "search, and if not found...".</p>
<p><b>Functions are the unit of good code.</b> A good function does one thing, has a name that says what it returns or does (<code>calculate_gst</code>, <code>send_reminder</code>), takes inputs as parameters instead of reading global variables, and returns a value rather than printing it. Functions that only compute from their inputs are called pure; they're easy to test and reuse.</p>
<p><b>Parameters</b>: positional, keyword (<code>discount=10</code>), defaults, <code>*args</code> (extra positional values as a tuple) and <code>**kwargs</code> (extra keyword values as a dict). You can force callers to name arguments by putting them after a bare <code>*</code>: <code>def transfer(amount, *, to_account, dry_run=False)</code>. That makes call sites self-documenting and prevents swapped arguments. One famous trap: default values are evaluated <b>once</b>, when the function is defined, so <code>def add(item, bucket=[])</code> shares one list across every call. Use <code>None</code> as the default and create the list inside the function.</p>
<p><b>Early returns</b> (guard clauses) keep code flat: check the invalid cases first and return, so the main logic isn't nested five levels deep inside if statements.</p>`,
    example: {
      t: "A GST invoice calculator with guard clauses and keyword-only options",
      intro: "This combines loops, enumerate, zip, guard clauses and keyword-only parameters into a small but realistic function.",
      lang: "python",
      code: `GST_RATES = {"books": 0.0, "food": 0.05, "electronics": 0.18, "services": 0.18}

def invoice_total(items: list[dict], *, coupon_pct: float = 0.0, round_to_rupee: bool = True) -> dict:
    if not items:                                     # guard clause: nothing to do
        return {"subtotal": 0, "gst": 0, "total": 0, "lines": []}
    if not 0 <= coupon_pct <= 50:
        raise ValueError("coupon_pct must be between 0 and 50")

    lines, subtotal, gst = [], 0.0, 0.0
    for n, item in enumerate(items, start=1):
        rate = GST_RATES.get(item["category"])
        if rate is None:
            raise ValueError(f"line {n}: unknown category {item['category']!r}")
        amount = item["price"] * item["qty"] * (1 - coupon_pct / 100)
        tax = amount * rate
        lines.append(f"{n}. {item['name']:<14} {item['qty']:>2} x {item['price']:>7.2f}  GST {rate:.0%}")
        subtotal += amount
        gst += tax

    total = subtotal + gst
    if round_to_rupee:
        total = round(total)
    return {"subtotal": round(subtotal, 2), "gst": round(gst, 2), "total": total, "lines": lines}

cart = [{"name": "Python book", "category": "books", "price": 499, "qty": 1},
        {"name": "Headphones", "category": "electronics", "price": 1999, "qty": 1},
        {"name": "Snacks", "category": "food", "price": 120, "qty": 3}]
result = invoice_total(cart, coupon_pct=10)          # keyword-only: clearer call site
print("\\n".join(result["lines"]))
print(result["subtotal"], result["gst"], result["total"])

# zip with strict: catches mismatched data early (Python 3.10+)
names, scores = ["Asha", "Ravi"], [91, 78]
for name, score in zip(names, scores, strict=True):
    print(f"{name}: {score}")`,
      after: "Keyword-only parameters (after <code>*</code>) mean nobody can accidentally write <code>invoice_total(cart, True)</code> and have it treated as a 1% coupon."
    },
    mistakes: [
      "Mutable default arguments: <code>def f(x, seen=[])</code> shares one list between all calls. Use <code>seen=None</code>, then <code>seen = [] if seen is None else seen</code>.",
      "<code>for i in range(len(items))</code> when you only need the items. Iterate directly, or use <code>enumerate</code>.",
      "Modifying a list while looping over it, which skips elements. Build a new list (comprehension) instead.",
      "Functions that <code>print</code> results instead of <code>return</code>ing them, so the result can't be reused or tested.",
      "While loops without a guaranteed exit, such as retrying forever when a server is down."
    ],
    practice: [
      ["Write <code>first_index(items, predicate)</code> that returns the index of the first item where <code>predicate(item)</code> is true, or <code>-1</code>, using <code>for ... else</code>.", "<pre>def first_index(items, predicate):\n    for i, item in enumerate(items):\n        if predicate(item):\n            break\n    else:\n        return -1\n    return i</pre>A plain <code>return i</code> inside the loop is equally fine; the point is to see how <code>else</code> runs only when no <code>break</code> happened."],
      ["What does <code>def f(*args, **kwargs): return args, kwargs</code> return for <code>f(1, 2, a=3)</code>?", "<code>((1, 2), {'a': 3})</code>: extra positional arguments become a tuple and keyword arguments a dict."],
      ["Rewrite this with guard clauses: <code>def ship(order):\\n if order: \\n  if order.paid:\\n   if order.address: return dispatch(order)\\n return None</code>", "<pre>def ship(order):\n    if not order or not order.paid or not order.address:\n        return None\n    return dispatch(order)</pre>"]
    ]
  },

  "1-2": {
    more: `<p><b>Choosing the right collection</b> is a design decision:</p>
<ul><li><b>list</b>: ordered items you add to and loop over. Indexing is O(1), but checking <code>x in my_list</code> scans the whole list, O(n).</li>
<li><b>dict</b>: lookup by key in O(1) on average. Keys must be hashable (strings, numbers, tuples). Since Python 3.7, dicts keep insertion order. Use <code>d.get(key, default)</code> for optional keys and <code>d.setdefault(key, [])</code> to group items.</li>
<li><b>set</b>: unique items with O(1) membership tests, plus set algebra: <code>a | b</code> (union), <code>a &amp; b</code> (intersection), <code>a - b</code> (difference). Turn a list into a set when you check membership many times.</li>
<li><b>tuple</b>: a fixed-size record, immutable and hashable, so it can be a dict key: <code>distances[(city_a, city_b)]</code>. Named tuples and dataclasses give fields names.</li></ul>
<p><b>The <code>collections</code> module</b> saves a lot of code: <code>Counter</code> counts things (<code>Counter(words).most_common(5)</code>), <code>defaultdict(list)</code> groups items without key checks, and <code>deque</code> gives fast appends and pops from both ends (queues, sliding windows).</p>
<p><b>Comprehensions</b> build collections declaratively: <code>[f(x) for x in xs if cond(x)]</code>, <code>{k: v for k, v in pairs}</code>, <code>{x.lower() for x in tags}</code>. Keep them to one transformation and one filter; if you need nested loops plus conditions, a plain loop is clearer. A <b>generator expression</b>, written with parentheses as in <code>sum(x.price for x in cart)</code>, computes values lazily without building a list, which saves memory on large data.</p>
<p><b>Copies</b>: <code>new = old</code> is not a copy. <code>list(old)</code>, <code>old.copy()</code>, <code>old[:]</code> and <code>{**old}</code> are <b>shallow</b> copies: the outer container is new, but nested lists and dicts inside are still shared. Use <code>copy.deepcopy</code> when you need fully independent nested data.</p>
<p><b>Sorting</b>: <code>sorted(items, key=lambda o: (o["city"], -o["total"]))</code> sorts by city, then by total descending. The key function returns what to compare; tuples compare element by element.</p>`,
    example: {
      t: "Analysing orders with Counter, defaultdict and sorting",
      intro: "Most data you meet in agents and APIs is a list of dicts. Here's a small analysis pipeline built only from the standard library.",
      lang: "python",
      code: `from collections import Counter, defaultdict

orders = [
    {"id": 1, "city": "Pune",   "items": ["book", "pen"],          "total": 640},
    {"id": 2, "city": "Delhi",  "items": ["laptop"],               "total": 58000},
    {"id": 3, "city": "Pune",   "items": ["pen", "pen", "ink"],    "total": 210},
    {"id": 4, "city": "Mumbai", "items": ["book"],                 "total": 499},
    {"id": 5, "city": "Delhi",  "items": ["mouse", "book"],        "total": 1299},
]

# 1. Most popular items across all orders
item_counts = Counter(item for o in orders for item in o["items"])
print(item_counts.most_common(3))            # [('book', 3), ('pen', 3), ...]

# 2. Group order ids by city
by_city = defaultdict(list)
for o in orders:
    by_city[o["city"]].append(o["id"])
print(dict(by_city))                         # {'Pune': [1, 3], 'Delhi': [2, 5], 'Mumbai': [4]}

# 3. Revenue per city, sorted descending
revenue = defaultdict(int)
for o in orders:
    revenue[o["city"]] += o["total"]
for city, amount in sorted(revenue.items(), key=lambda kv: kv[1], reverse=True):
    print(f"{city:<8} Rs {amount:>8,}")

# 4. Set algebra: which cities bought books but not laptops?
book_cities = {o["city"] for o in orders if "book" in o["items"]}
laptop_cities = {o["city"] for o in orders if "laptop" in o["items"]}
print(book_cities - laptop_cities)           # {'Pune', 'Mumbai'}

# 5. Fast lookup: index orders by id once, then O(1) access
by_id = {o["id"]: o for o in orders}
print(by_id[4]["city"])

# 6. Sort by city, then by total (highest first)
for o in sorted(orders, key=lambda o: (o["city"], -o["total"])):
    print(o["city"], o["total"])`,
      after: "Indexing a list into a dict (step 5) is one of the most useful habits in Python: it turns repeated O(n) searches into O(1) lookups."
    },
    mistakes: [
      "Checking membership in a large list inside a loop (<code>if x in big_list</code>), which is O(n×m). Convert to a set first.",
      "Assuming <code>b = a</code> or <code>a.copy()</code> gives independent nested data. Nested objects are still shared; use <code>copy.deepcopy</code>.",
      "Using <code>d[key]</code> for keys that may be missing. Use <code>d.get(key)</code>, <code>defaultdict</code> or <code>in</code> checks.",
      "Over-clever nested comprehensions that nobody can read. Use a loop when there's more than one condition or loop level.",
      "Using a list as a queue with <code>pop(0)</code>, which is O(n) per pop. Use <code>collections.deque</code> and <code>popleft()</code>."
    ],
    practice: [
      ["Given a list of words, return the 3 most common words ignoring case and punctuation.", "<pre>import re\nfrom collections import Counter\ndef top3(text):\n    words = re.findall(r\"[a-z']+\", text.lower())\n    return Counter(words).most_common(3)</pre>"],
      ["Invert a dict mapping student to house, <code>{'asha': 'red', 'ravi': 'blue', 'mira': 'red'}</code>, into house to list of students.", "<pre>from collections import defaultdict\ninv = defaultdict(list)\nfor student, house in d.items():\n    inv[house].append(student)\n# {'red': ['asha', 'mira'], 'blue': ['ravi']}</pre>"],
      ["Why can a tuple be a dict key but a list can't?", "Dict keys must be hashable, meaning their hash can never change. Tuples are immutable (if their contents are), so their hash is stable. Lists can change, so Python refuses to hash them."]
    ]
  },

  "1-3": {
    more: `<p><b>When to write a class.</b> Use a class when data and the behaviour that operates on it belong together and live over time: a shopping cart with items and totals, an API client holding a session and retry settings, a game character. If you just need a bag of fields, use a dataclass (next lessons). If you just need behaviour, a plain function is simpler. Over-engineering with deep class hierarchies is a common beginner trap.</p>
<p><b>Special ("dunder") methods</b> let your objects work with Python's built-in syntax: <code>__repr__</code> (how the object shows in the console and logs, so always write one), <code>__eq__</code> (equality), <code>__len__</code>, <code>__iter__</code> (for loops), <code>__contains__</code> (<code>in</code>), <code>__enter__</code>/<code>__exit__</code> (with statements). Prefer <b>composition</b> (a class that holds other objects) over inheritance; inherit only for genuine "is a" relationships, and call <code>super().__init__()</code> when you do.</p>
<p><b>Exceptions: catch narrowly, handle meaningfully.</b> Catch the specific exceptions you expect (<code>except FileNotFoundError</code>, <code>except httpx.TimeoutException</code>), never a bare <code>except:</code> (which even catches Ctrl+C). <code>else</code> runs only if no exception occurred, which keeps the try block small; <code>finally</code> always runs, for cleanup. Use <code>raise NewError(...) from err</code> to wrap a low-level error in a meaningful one while keeping the original traceback. Define a small hierarchy of custom exceptions for your app (<code>AppError</code>, then <code>ValidationError</code>, <code>NotFoundError</code>) so callers can catch a whole family at once.</p>
<p><b>Modules and packages.</b> Every <code>.py</code> file is a module; a folder with an <code>__init__.py</code> is a package. Import what you need (<code>from pricing import calculate_gst</code>), keep modules focused, and avoid circular imports by moving shared code into a third module. The <code>if __name__ == "__main__":</code> block runs only when the file is executed directly, not when imported, which is where command-line entry points and quick manual tests go.</p>`,
    example: {
      t: "A wallet class with custom exceptions and dunder methods",
      intro: "A realistic class: validated state, meaningful custom errors, and special methods so it behaves naturally in Python.",
      lang: "python",
      code: `class WalletError(Exception):
    """Base class for wallet problems, so callers can catch them all at once."""

class InsufficientFunds(WalletError):
    def __init__(self, needed: int, available: int):
        super().__init__(f"need Rs {needed / 100:.2f}, have Rs {available / 100:.2f}")
        self.needed, self.available = needed, available

class Wallet:
    def __init__(self, owner: str, balance_paise: int = 0):
        if balance_paise < 0:
            raise ValueError("balance cannot be negative")
        self.owner = owner
        self._balance = balance_paise            # leading underscore: internal by convention
        self._history: list[tuple[str, int]] = []

    def deposit(self, paise: int) -> "Wallet":
        if paise <= 0:
            raise ValueError("deposit must be positive")
        self._balance += paise
        self._history.append(("deposit", paise))
        return self                              # allows chaining: w.deposit(..).deposit(..)

    def pay(self, paise: int, to: str) -> None:
        if paise > self._balance:
            raise InsufficientFunds(paise, self._balance)
        self._balance -= paise
        self._history.append((f"pay:{to}", -paise))

    @property
    def balance(self) -> int:                    # read-only from outside
        return self._balance

    def __len__(self): return len(self._history)
    def __iter__(self): return iter(self._history)
    def __repr__(self): return f"Wallet(owner={self.owner!r}, balance=Rs {self._balance / 100:.2f})"

w = Wallet("Asha").deposit(50_000).deposit(25_000)
try:
    w.pay(100_000, to="laptop-shop")
except InsufficientFunds as e:
    print("Payment failed:", e, "| short by", e.needed - e.available)
else:
    print("paid")
finally:
    print(w, "| transactions:", len(w))

for kind, amount in w:
    print(kind, amount)

if __name__ == "__main__":
    # runs only when executed directly: python wallet.py
    assert Wallet("x", 100).balance == 100`,
      after: "Callers can write <code>except WalletError</code> to handle every wallet problem, or <code>except InsufficientFunds</code> to handle one case specifically and read its extra fields."
    },
    mistakes: [
      "A bare <code>except:</code> or <code>except Exception: pass</code>, which hides real bugs. Catch specific exceptions and handle or re-raise them.",
      "Forgetting <code>self</code> as the first method parameter, or forgetting to prefix attributes with <code>self.</code> inside methods.",
      "Deep inheritance trees for code reuse. Prefer composition and small functions.",
      "Putting a huge amount of code in the <code>try</code> block, so you can't tell which line raised. Keep try blocks small and use <code>else</code>.",
      "Running module-level code with side effects (network calls, prints) on import instead of under <code>if __name__ == \"__main__\":</code>."
    ],
    practice: [
      ["Add a <code>transfer(self, other: Wallet, paise: int)</code> method that pays another wallet and leaves both unchanged if it fails.", "<pre>def transfer(self, other, paise):\n    self.pay(paise, to=other.owner)   # raises before any change if funds are short\n    other.deposit(paise)</pre>Because <code>pay</code> checks first and raises before modifying anything, a failure leaves both wallets untouched."],
      ["What's the difference between <code>raise ConfigError('bad config')</code> and <code>raise ConfigError('bad config') from err</code> inside an except block?", "Both raise ConfigError. <code>from err</code> explicitly chains the original exception as the cause, so the traceback shows \"The above exception was the direct cause of...\", making debugging much easier."],
      ["Why write a <code>__repr__</code> for every class you create?", "So objects show useful information when printed in the console, logs, debuggers and error messages, instead of <code>&lt;Wallet object at 0x7f...&gt;</code>."]
    ]
  },

  "2-0": {
    more: `<p><b>Why type hints are worth it.</b> They're documentation that can't go stale, because a type checker verifies them. Your editor uses them for autocomplete and to warn about mistakes as you type: passing a string where an int is expected, forgetting that a function can return <code>None</code>, misspelling an attribute. On teams and in large codebases, they make refactoring safe.</p>
<p><b>The essentials</b>: built-in generics (<code>list[str]</code>, <code>dict[str, int]</code>, <code>tuple[int, str]</code>, <code>set[int]</code>); unions with <code>|</code> (<code>int | str</code>); optional values (<code>User | None</code>); <code>Literal["asc", "desc"]</code> for a fixed set of allowed strings; <code>Callable[[int], str]</code> for functions; and abstract types like <code>Iterable[str]</code> or <code>Sequence[float]</code> for parameters, so callers can pass a list, tuple or generator. Return the concrete type you actually build.</p>
<p><b>TypedDict and Protocol.</b> <code>TypedDict</code> types dictionaries with known keys, which is ideal for JSON from APIs. <code>Protocol</code> describes "anything with these methods" (structural typing), so a function can accept any object with a <code>.send()</code> method without inheritance. That's very useful for injecting fakes in tests.</p>
<p><b>Running a checker.</b> Hints do nothing at runtime; you need <b>mypy</b> or <b>pyright</b> (VS Code's Pylance uses pyright). Run it in CI and start with basic settings, then tighten (<code>--strict</code>) as the codebase matures. When the checker complains, it's usually right: you forgot a <code>None</code> case.</p>
<p><b>Runtime validation is separate.</b> Type hints don't stop bad data arriving from users or APIs. Libraries like <b>Pydantic</b> read your type hints and validate and convert data at runtime, which is why FastAPI uses them for request bodies.</p>`,
    example: {
      t: "Catching a real bug with a type checker",
      intro: "This code looks fine and even runs fine in quick tests. mypy finds the bug before production does.",
      lang: "python",
      code: `from typing import Literal, Protocol, TypedDict, Iterable

class UserJSON(TypedDict):            # shape of JSON from an API
    id: int
    name: str
    email: str | None                 # some users have no email

def find_user(users: Iterable[UserJSON], user_id: int) -> UserJSON | None:
    for u in users:
        if u["id"] == user_id:
            return u
    return None

def email_domain(users: list[UserJSON], user_id: int) -> str:
    user = find_user(users, user_id)
    return user["email"].split("@")[1]
    # mypy: error: Value of type "UserJSON | None" is not indexable
    # mypy: error: Item "None" of "str | None" has no attribute "split"

# Fixed version: handle both None cases explicitly
def email_domain_safe(users: list[UserJSON], user_id: int) -> str | None:
    user = find_user(users, user_id)
    if user is None or user["email"] is None:
        return None
    return user["email"].split("@")[1]        # mypy now knows both are not None

SortOrder = Literal["asc", "desc"]
def sort_users(users: list[UserJSON], order: SortOrder = "asc") -> list[UserJSON]:
    return sorted(users, key=lambda u: u["name"], reverse=(order == "desc"))
# sort_users(users, "descending")  -> mypy error: not a valid Literal

class Notifier(Protocol):                       # anything with a send(str, str) method
    def send(self, to: str, message: str) -> None: ...

def welcome(n: Notifier, email: str) -> None:
    n.send(email, "Welcome to Forge Academy!")

class FakeNotifier:                             # no inheritance needed: matches the Protocol
    def __init__(self) -> None: self.sent: list[tuple[str, str]] = []
    def send(self, to: str, message: str) -> None: self.sent.append((to, message))

# Run:  pip install mypy && mypy app.py`,
      after: "The bug in <code>email_domain</code> would crash only for users without an email or for unknown IDs, exactly the cases quick manual tests miss."
    },
    mistakes: [
      "Annotating everything as <code>Any</code> or <code>dict</code>, which turns the checker off. Use TypedDict, dataclasses or Pydantic models.",
      "Ignoring <code>None</code> in return types: if a function can return None, say <code>X | None</code> and handle it at every call site.",
      "Thinking hints validate data at runtime. They don't; use Pydantic or explicit checks at the boundaries.",
      "Using concrete <code>list[str]</code> for parameters that only need to be iterated. <code>Iterable[str]</code> accepts more inputs.",
      "Adding hints but never running mypy or pyright, so wrong hints accumulate and mislead readers."
    ],
    practice: [
      ["Annotate: a function taking a dict of product name to price in paise and an optional coupon code, returning the total in paise.", "<pre>def total(prices: dict[str, int], coupon: str | None = None) -> int: ...</pre>"],
      ["What's the difference between <code>list[str]</code> and <code>Sequence[str]</code> as a parameter type?", "<code>Sequence[str]</code> accepts any read-only indexable sequence (list, tuple, string...), and signals that the function won't modify it. <code>list[str]</code> only accepts lists."],
      ["Write a Protocol for anything with a <code>read() -> bytes</code> method, and a function that accepts it.", "<pre>class Readable(Protocol):\n    def read(self) -> bytes: ...\n\ndef checksum(src: Readable) -> str:\n    import hashlib\n    return hashlib.sha256(src.read()).hexdigest()</pre>Files opened in binary mode and <code>io.BytesIO</code> both satisfy it automatically."]
    ]
  },

  "2-1": {
    more: `<p><b>Dataclasses</b> generate <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> from annotated fields, so a record type takes a few lines. Useful options:</p>
<ul><li><code>frozen=True</code>: instances are immutable (assigning raises an error) and hashable, which is ideal for configuration, value objects and dict keys.</li>
<li><code>slots=True</code> (3.10+): less memory and faster attribute access, and typos in attribute names raise errors.</li>
<li><code>kw_only=True</code>: fields must be passed by name, which prevents mix-ups with many fields.</li>
<li><code>field(default_factory=list)</code> for mutable defaults; <code>field(repr=False)</code> to hide secrets from logs.</li>
<li><code>__post_init__</code> runs after the generated <code>__init__</code>, the place for validation and derived fields.</li>
<li><code>dataclasses.replace(obj, field=new)</code> creates a modified copy of a frozen instance; <code>asdict(obj)</code> converts to a dict (for JSON).</li></ul>
<p><b>Dataclass vs Pydantic.</b> Dataclasses don't validate or convert types: <code>Point(x="3")</code> happily stores a string. Use dataclasses for internal data you construct yourself, and Pydantic models for data crossing a boundary (API requests, config files, LLM JSON output), where validation and coercion matter.</p>
<p><b>Properties</b> (<code>@property</code>) expose computed values as attributes (<code>order.total</code>) and let you add validation through a setter without changing how callers use the attribute. Keep them cheap: a property that runs a database query surprises people.</p>
<p><b><code>@classmethod</code></b> receives the class as <code>cls</code> and is the idiomatic way to write alternative constructors (<code>Order.from_json(data)</code>, <code>Config.from_env()</code>). <b><code>@staticmethod</code></b> is a plain function namespaced in the class; often a module-level function is simpler.</p>`,
    example: {
      t: "Typed configuration and value objects",
      intro: "A frozen config loaded from environment variables with an alternative constructor, plus an order with computed properties and validation.",
      lang: "python",
      code: `import os
from dataclasses import dataclass, field, replace, asdict

@dataclass(frozen=True, slots=True, kw_only=True)
class Settings:
    env: str = "development"
    database_url: str
    api_key: str = field(repr=False)            # never printed in logs
    max_retries: int = 3

    @classmethod
    def from_env(cls) -> "Settings":            # alternative constructor
        return cls(env=os.getenv("APP_ENV", "development"),
                   database_url=os.environ["DATABASE_URL"],
                   api_key=os.environ["API_KEY"],
                   max_retries=int(os.getenv("MAX_RETRIES", "3")))

@dataclass(slots=True)
class LineItem:
    sku: str
    price_paise: int
    qty: int = 1

    def __post_init__(self):
        if self.qty < 1 or self.price_paise < 0:
            raise ValueError(f"bad line item: {self}")

@dataclass
class Order:
    id: str
    items: list[LineItem] = field(default_factory=list)   # a NEW list per order
    coupon_pct: int = 0

    @property
    def subtotal(self) -> int:
        return sum(i.price_paise * i.qty for i in self.items)

    @property
    def total(self) -> int:
        return round(self.subtotal * (100 - self.coupon_pct) / 100)

os.environ.update(DATABASE_URL="postgresql://localhost/app", API_KEY="sk-test-123")
s = Settings.from_env()
print(s)                                     # api_key hidden thanks to repr=False
test_settings = replace(s, env="test")       # modified copy of a frozen object
# s.env = "prod"  -> FrozenInstanceError

o = Order("ord_1", [LineItem("BOOK", 49900, 2), LineItem("PEN", 2000)], coupon_pct=10)
print(o.subtotal, o.total)                   # 101800 91620
print(asdict(o))                             # nested dicts, ready for json.dumps`,
      after: "<code>frozen=True</code> on settings means no code can change configuration at runtime by accident, a surprisingly common source of bugs in tests that leak changes into each other."
    },
    mistakes: [
      "Mutable defaults in dataclasses (<code>items: list = []</code>), which Python rejects. Use <code>field(default_factory=list)</code>.",
      "Expecting dataclasses to validate types. They don't; validate in <code>__post_init__</code> or use Pydantic.",
      "Putting slow work (database calls, HTTP requests) inside a <code>@property</code>.",
      "Printing objects that contain secrets. Mark secret fields <code>repr=False</code>.",
      "Using <code>@staticmethod</code> for everything. If a method doesn't need the instance or the class, a module-level function is usually clearer."
    ],
    practice: [
      ["Make a frozen <code>Money</code> dataclass with <code>paise: int</code> and <code>currency: str = 'INR'</code>, and an <code>__add__</code> that refuses to add different currencies.", "<pre>@dataclass(frozen=True)\nclass Money:\n    paise: int\n    currency: str = \"INR\"\n    def __add__(self, other: \"Money\") -> \"Money\":\n        if self.currency != other.currency:\n            raise ValueError(\"currency mismatch\")\n        return Money(self.paise + other.paise, self.currency)</pre>"],
      ["Why is a frozen dataclass usable as a dict key while a regular one isn't?", "Frozen dataclasses get a generated <code>__hash__</code> based on their fields, which is safe because the fields can't change. A regular (mutable) dataclass sets <code>__hash__</code> to None, because its hash could change after insertion."],
      ["When would you choose Pydantic over a dataclass?", "When data comes from outside your code (HTTP requests, config files, LLM output, CSV rows) and needs validation and type conversion, with clear error messages."]
    ]
  },

  "2-2": {
    more: `<p><b>Closures</b> capture variables from an enclosing function, which is how you build configurable functions: <code>make_multiplier(3)</code> returns a function that remembers 3. To <i>reassign</i> a captured variable inside the inner function, declare it <code>nonlocal</code>. A classic trap: closures created in a loop capture the variable, not its value at that moment, so <code>[lambda: i for i in range(3)]</code> all return 2. Bind the value with a default argument (<code>lambda i=i: i</code>).</p>
<p><b>Decorators</b> are functions that take a function and return a new function, applied with <code>@</code>. They add cross-cutting behaviour without touching the function body: timing, logging, retries, caching, authentication checks, registering routes (that's what <code>@app.get</code> in FastAPI does). Always use <code>functools.wraps</code> so the wrapped function keeps its name and docstring. A decorator that takes arguments (<code>@retry(times=3)</code>) is a function that returns a decorator, which means one more level of nesting. The standard library includes useful ones: <code>@functools.cache</code> and <code>@lru_cache</code> (memoisation), <code>@property</code>, <code>@dataclass</code> and <code>@contextmanager</code>.</p>
<p><b>Generators</b> use <code>yield</code> to produce values one at a time, pausing between them. They're lazy: a generator reading a 10 GB log file line by line uses almost no memory. You can chain them into pipelines (read, then filter, then parse, then aggregate) where each item flows through all stages before the next is read. A generator can be consumed only once. <code>yield from</code> delegates to another iterable.</p>
<p><b>Context managers</b> guarantee setup and teardown around a block: files are closed, locks released, transactions committed or rolled back, temporary directories deleted, even if an exception occurs. Write your own with <code>@contextlib.contextmanager</code> (code before <code>yield</code> is setup, after it is teardown, inside try/finally) or a class with <code>__enter__</code> and <code>__exit__</code>.</p>`,
    example: {
      t: "A retry decorator, a streaming log pipeline and a timing context manager",
      intro: "Three tools you'll use in real AI and backend code: retrying flaky API calls, processing huge files lazily, and measuring how long blocks take.",
      lang: "python",
      code: `import functools, random, time
from contextlib import contextmanager

# 1. Decorator with arguments: retry with exponential backoff
def retry(times: int = 3, base_delay: float = 0.5, exceptions=(ConnectionError, TimeoutError)):
    def decorator(fn):
        @functools.wraps(fn)                         # keep fn.__name__ and docstring
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except exceptions as e:
                    if attempt == times:
                        raise
                    delay = base_delay * 2 ** (attempt - 1) * random.uniform(0.8, 1.2)
                    print(f"{fn.__name__} failed ({e}); retry {attempt}/{times - 1} in {delay:.2f}s")
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(times=4, base_delay=0.1)
def call_model(prompt: str) -> str:
    if random.random() < 0.6:
        raise ConnectionError("upstream timeout")
    return f"answer to {prompt!r}"

# 2. Generator pipeline: constant memory, however big the file
def read_lines(path):
    with open(path, encoding="utf-8") as f:
        yield from f

def errors_only(lines):
    return (line for line in lines if " ERROR " in line)

def parse(lines):
    for line in lines:
        date, time_, level, *msg = line.split(" ", 3)
        yield {"ts": f"{date} {time_}", "msg": " ".join(msg).strip()}

# 3. Context manager: time any block, even if it raises
@contextmanager
def timed(label: str):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label} took {time.perf_counter() - start:.3f}s")

with open("app.log", "w") as f:                      # create a sample log
    for i in range(10_000):
        f.write(f"2026-10-21 10:{i % 60:02d}:00 {'ERROR' if i % 500 == 0 else 'INFO'} event {i}\\n")

with timed("error scan"):
    first_three = [e for _, e in zip(range(3), parse(errors_only(read_lines("app.log"))))]
print(first_three)
print(call_model("hello"))`,
      after: "In the pipeline, only three error lines are ever parsed: generators stop pulling data as soon as the consumer stops asking, which is why they scale to files far bigger than memory."
    },
    mistakes: [
      "Forgetting <code>functools.wraps</code> in decorators, which breaks logging, debugging and frameworks that read function names.",
      "Iterating a generator twice and getting nothing the second time. Convert to a list if you need multiple passes.",
      "Closures in loops capturing the loop variable instead of its value. Bind it with a default argument.",
      "Opening files or connections without <code>with</code>, leaking them when an exception occurs.",
      "Retrying non-transient errors (like 400 Bad Request or validation errors) in a retry decorator. Retry only timeouts, connection errors and 429/5xx."
    ],
    practice: [
      ["Write a decorator <code>@log_calls</code> that prints the function name, arguments and return value.", "<pre>def log_calls(fn):\n    @functools.wraps(fn)\n    def wrapper(*a, **kw):\n        result = fn(*a, **kw)\n        print(f\"{fn.__name__}{a}{kw} -> {result!r}\")\n        return result\n    return wrapper</pre>"],
      ["Write a generator <code>chunks(items, size)</code> that yields lists of at most <code>size</code> items (useful for batching API calls).", "<pre>def chunks(items, size):\n    batch = []\n    for item in items:\n        batch.append(item)\n        if len(batch) == size:\n            yield batch\n            batch = []\n    if batch:\n        yield batch</pre>In Python 3.12+, <code>itertools.batched</code> does this for you."],
      ["What does <code>[f() for f in [lambda: i for i in range(3)]]</code> return, and how do you fix it to return <code>[0, 1, 2]</code>?", "<code>[2, 2, 2]</code>, because each lambda looks up <code>i</code> when called, after the loop finished. Fix: <code>[lambda i=i: i for i in range(3)]</code>."]
    ]
  },

  "2-3": {
    more: `<p><b>Regular expressions</b> are a small language for text patterns. The building blocks: <code>\\d</code> digit, <code>\\w</code> word character, <code>\\s</code> whitespace, <code>.</code> any character, character classes <code>[A-Z]</code>, anchors <code>^</code> and <code>$</code>, word boundaries <code>\\b</code>, and quantifiers <code>*</code> (0+), <code>+</code> (1+), <code>?</code> (0 or 1), <code>{2,4}</code>. Quantifiers are <b>greedy</b> by default (match as much as possible); add <code>?</code> to make them lazy: <code>&lt;.+?&gt;</code> matches one tag rather than everything between the first and last angle bracket. Always write patterns as raw strings (<code>r"\\d+"</code>) so backslashes aren't interpreted by Python first.</p>
<p>Know the functions: <code>re.search</code> (first match anywhere), <code>re.match</code> (only at the start), <code>re.fullmatch</code> (whole string, ideal for validation), <code>re.findall</code>/<code>finditer</code> (all matches), <code>re.sub</code> (replace, optionally with a function), <code>re.split</code>. Named groups <code>(?P&lt;year&gt;\\d{4})</code> make extraction readable. <code>re.VERBOSE</code> lets you write complex patterns over several lines with comments. Don't use regex for HTML, JSON or full email validation; use parsers and libraries.</p>
<p><b>pathlib</b> replaces string path juggling: <code>Path("data") / "raw" / "orders.csv"</code> joins correctly on every OS; <code>.exists()</code>, <code>.read_text()</code>, <code>.write_text()</code>, <code>.mkdir(parents=True, exist_ok=True)</code>, <code>.glob("**/*.csv")</code>, <code>.stem</code>, <code>.suffix</code>, <code>.with_suffix(".parquet")</code>. Anchor paths to your script (<code>Path(__file__).parent</code>) so it works whatever the current directory is.</p>
<p><b>Standard library highlights</b>: <code>json</code> (<code>indent=2</code> for readable output, <code>ensure_ascii=False</code> to keep Hindi and other scripts readable); <code>datetime</code> with time zones (<code>datetime.now(timezone.utc)</code>; store UTC, convert for display with <code>zoneinfo.ZoneInfo("Asia/Kolkata")</code>); <code>secrets</code> for tokens and passwords (never <code>random</code>); <code>hashlib</code> for checksums; <code>uuid4</code> for unique IDs; <code>csv</code>, <code>itertools</code>, <code>collections</code>, <code>logging</code> and <code>argparse</code> for command-line tools.</p>`,
    example: {
      t: "Extracting structured data from messy text",
      intro: "A common task in data and AI work: pull structured fields out of semi-structured text such as bank SMS alerts, then save them as JSON.",
      lang: "python",
      code: `import json, re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

SMS = """
Rs.1,250.00 debited from A/c XX1234 on 18-10-26 to VPA zomato@icici. Ref 629183746512.
INR 45,000 credited to A/c XX1234 on 19-10-26 by NEFT from ACME PVT LTD. Avl Bal Rs 1,02,340.55
Rs 899 debited from a/c xx1234 on 20-10-26 for Amazon Pay. Not you? Call 1800...
"""

PATTERN = re.compile(r"""
    (?:Rs\\.?|INR)\\s*(?P<amount>[\\d,]+(?:\\.\\d{1,2})?)   # amount with Indian comma grouping
    \\s+(?P<kind>debited|credited)                        # direction
    .*?on\\s+(?P<date>\\d{2}-\\d{2}-\\d{2})                   # dd-mm-yy, lazy .*? stops at first 'on'
    \\s+(?:to|by|for)\\s+(?P<party>.+?)(?:\\.\\s|$)            # counterparty, up to '. ' or line end
""", re.IGNORECASE | re.VERBOSE)

transactions = []
for line in SMS.strip().splitlines():
    m = PATTERN.search(line)
    if not m:
        print("no match:", line[:40]); continue
    amount = float(m["amount"].replace(",", ""))
    sign = -1 if m["kind"].lower() == "debited" else 1
    day = datetime.strptime(m["date"], "%d-%m-%y").replace(tzinfo=ZoneInfo("Asia/Kolkata"))
    transactions.append({"date": day.date().isoformat(), "amount": sign * amount,
                         "party": re.sub(r"^(VPA|NEFT from)\\s+", "", m["party"].strip(), flags=re.I)})

out = Path(__file__).parent / "output" / "transactions.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(transactions, indent=2, ensure_ascii=False), encoding="utf-8")
print(json.dumps(transactions, indent=2))
print("net:", sum(t["amount"] for t in transactions))`,
      after: "Named groups, <code>re.VERBOSE</code> with comments, and lazy <code>.*?</code> make a pattern like this maintainable. Without them it would be an unreadable one-liner nobody dares to touch."
    },
    mistakes: [
      "Writing regex patterns without the <code>r</code> prefix, so <code>\"\\b\"</code> becomes a backspace character instead of a word boundary.",
      "Greedy <code>.*</code> swallowing far more than intended. Use lazy <code>.*?</code> or a negated class like <code>[^,]*</code>.",
      "Using <code>re.match</code> when you meant <code>re.search</code> (match only checks the start of the string).",
      "Building paths with string concatenation (<code>'data/' + name</code>), which breaks on Windows and with stray slashes. Use pathlib.",
      "Storing naive local datetimes. Store timezone-aware UTC and convert to <code>Asia/Kolkata</code> only for display."
    ],
    practice: [
      ["Write a regex that validates an Indian PIN code: 6 digits, first digit 1–9.", "<code>re.fullmatch(r\"[1-9]\\d{5}\", pin)</code>. <code>fullmatch</code> ensures nothing extra appears before or after."],
      ["Using pathlib, find all <code>.csv</code> files under <code>data/</code> (including subfolders) larger than 1 MB.", "<pre>from pathlib import Path\nbig = [p for p in Path(\"data\").rglob(\"*.csv\") if p.stat().st_size > 1_000_000]</pre>"],
      ["Generate a URL-safe random token for a password reset link. Which module, and why not <code>random</code>?", "<code>secrets.token_urlsafe(32)</code>. The <code>random</code> module is predictable (designed for simulations), so its tokens can be guessed; <code>secrets</code> uses the operating system's cryptographically secure generator."]
    ]
  },

  "35-0": {
    more: `<p><b>What a virtual environment really is.</b> A folder (usually <code>.venv</code>) containing a link to a Python interpreter plus its own <code>site-packages</code> directory. "Activating" it just puts <code>.venv/bin</code> first on your PATH, so <code>python</code> and <code>pip</code> refer to the environment's copies. You can skip activation and call <code>.venv/bin/python</code> directly, which is handy in scripts and cron jobs. Environments aren't portable: don't copy or commit them; recreate them from your dependency files.</p>
<p><b>Specifying dependencies well.</b> For an <b>application</b>, list direct dependencies with sensible ranges in <code>pyproject.toml</code>, and commit a <b>lock file</b> with exact versions and hashes of everything, including transitive dependencies (<code>uv.lock</code>, <code>poetry.lock</code>, or <code>pip-compile</code> output). For a <b>library</b>, specify compatible ranges only (<code>httpx&gt;=0.27,&lt;1</code>), because over-tight pins in libraries cause conflicts for their users. Keep development tools (pytest, ruff, mypy) in a separate dev group so production images stay small.</p>
<p><b>uv</b> has quickly become the default modern tool: it installs Python versions (<code>uv python install 3.12</code>), creates environments, resolves and locks dependencies very fast, runs commands in the project environment (<code>uv run pytest</code>) and installs CLI tools in isolation (<code>uv tool install ruff</code>). <b>pipx</b> also installs command-line tools in isolated environments. Conda remains common in data science when you need non-Python dependencies (CUDA, GDAL).</p>
<p><b>Project layout.</b> The <b>src layout</b> (<code>src/mypackage/</code>) prevents accidentally importing your code from the project folder instead of the installed package, catching packaging mistakes early. Expose command-line entry points through <code>[project.scripts]</code> in pyproject.toml.</p>
<p><b>Publishing</b>: build a wheel and source distribution, upload to TestPyPI first, then PyPI using <b>trusted publishing</b> from GitHub Actions (no long-lived API tokens). Version with semantic versioning and keep a changelog.</p>`,
    example: {
      t: "A complete modern project setup with uv",
      intro: "From an empty folder to a tested, linted CLI tool with locked dependencies, the same way professional Python projects are set up in 2026.",
      lang: "bash",
      code: `# 1. Create a packaged project with the src layout
uv init --package invoicer && cd invoicer
uv python pin 3.12                         # writes .python-version

# 2. Dependencies: runtime vs development
uv add httpx "pydantic>=2.7"               # updates pyproject.toml and uv.lock
uv add --dev pytest ruff mypy

# 3. A CLI entry point in pyproject.toml:
#   [project.scripts]
#   invoicer = "invoicer.cli:main"
mkdir -p tests
cat > src/invoicer/cli.py <<'EOF'
import argparse
def total(prices: list[int], gst: float = 0.18) -> int:
    return round(sum(prices) * (1 + gst))
def main() -> None:
    p = argparse.ArgumentParser(description="Total with GST")
    p.add_argument("prices", nargs="+", type=int)
    p.add_argument("--gst", type=float, default=0.18)
    a = p.parse_args()
    print(total(a.prices, a.gst))
EOF
cat > tests/test_cli.py <<'EOF'
from invoicer.cli import total
def test_total(): assert total([100, 200]) == 354
EOF

# 4. Run everything inside the locked environment
uv run invoicer 499 1999 --gst 0.18        # -> 2947
uv run pytest -q
uv run ruff check . && uv run mypy src

# 5. Reproduce exactly on another machine or in CI
uv sync --frozen                           # fails if uv.lock is out of date

# 6. Build and publish (TestPyPI first)
uv build                                   # dist/*.whl and dist/*.tar.gz
uv publish --publish-url https://test.pypi.org/legacy/

# Docker: install from the lock file for reproducible images
#   COPY pyproject.toml uv.lock ./
#   RUN uv sync --frozen --no-dev`,
      after: "<code>uv sync --frozen</code> in CI and Docker guarantees that the exact versions you tested are the ones that run, and fails loudly if someone changed dependencies without updating the lock file."
    },
    mistakes: [
      "Installing packages globally with <code>sudo pip install</code>, which can break operating system tools. Always use a virtual environment.",
      "Committing the <code>.venv</code> folder. Commit <code>pyproject.toml</code> and the lock file, and add <code>.venv/</code> to .gitignore.",
      "Running <code>pip freeze</code> in a polluted environment, which pins packages your project doesn't use.",
      "Exact pins (<code>==</code>) in a library's dependencies, which cause unsolvable conflicts for users. Use ranges in libraries and lock files in applications.",
      "Forgetting to activate the environment, then wondering why an installed package \"isn't found\". Check with <code>which python</code>."
    ],
    practice: [
      ["You run <code>pip install requests</code> successfully, but <code>import requests</code> fails in VS Code. What's the likely cause and fix?", "VS Code is using a different interpreter than the one pip installed into. Select the project's <code>.venv</code> interpreter (Python: Select Interpreter), or run <code>python -m pip install</code> with the same Python VS Code uses."],
      ["What's the difference between <code>pyproject.toml</code> dependencies and a lock file?", "pyproject.toml lists your direct dependencies with acceptable version ranges (intent). The lock file records the exact resolved versions and hashes of every package, including transitive ones (a reproducible snapshot)."],
      ["Why use the src layout for packages?", "Without it, tests can import your package directly from the project folder even if packaging is broken. With <code>src/</code>, code must be installed to be imported, so packaging mistakes surface in development, not after publishing."]
    ]
  }
});
