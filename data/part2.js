/* Forge Academy course data, modules 5-8 */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 5, id: "sql", title: "SQL and databases", level: 2,
  blurb: "Where every SaaS keeps its data: tables, keys, queries, joins, aggregates, transactions, indexes and migrations.",
  saas: "Generated <code>app/db.py</code> (SQLite or Postgres), <code>platform/runtime/migrate.py</code> (additive migrations), the dashboard stats in <code>crud.py</code>.",
  lessons: [
    {
      t: "Tables, columns and keys",
      sub: ["Tables, rows, columns and column types", "Primary keys and auto-increment ids", "Foreign keys and relationships (one-to-many)", "NOT NULL, UNIQUE, DEFAULT, CHECK", "SQLite vs PostgreSQL: when to use each"],
      body: `<p>A relational database stores data in <b>tables</b>. Each row has a <b>primary key</b>; a <b>foreign key</b> column points at a row in another table, which is how a loan belongs to a borrower.</p>
<p>Constraints let the database protect your data even when the app has a bug: <code>NOT NULL</code>, <code>UNIQUE</code> (one account per email), <code>CHECK (amount &gt; 0)</code>.</p>
<p>SQLite is a single file with no server, perfect for development and tests. PostgreSQL is a real server for production with many users. SaaSForge apps use SQLite by default and switch to Postgres when <code>DATABASE_URL</code> is set.</p>`,
      lang: "sql",
      code: `CREATE TABLE users (
  id            INTEGER PRIMARY KEY,          -- SERIAL / IDENTITY in Postgres
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE borrowers (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  phone    TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id)
);

CREATE TABLE loans (
  id          INTEGER PRIMARY KEY,
  borrower_id INTEGER NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  amount      REAL NOT NULL CHECK (amount > 0),
  rate        REAL NOT NULL,
  months      INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new',
  owner_id    INTEGER NOT NULL REFERENCES users(id)
);
-- try it:  sqlite3 demo.db   then paste the statements`,
      ex: "Design tables for a clinic: patients, doctors and appointments (an appointment links one patient and one doctor). Add sensible constraints and create them in sqlite3.",
      q: ["What does a foreign key enforce?", ["The value is unique", "The value refers to an existing row in another table", "The value is never null", "The value is indexed"], 1, "A foreign key guarantees the referenced row exists."]
    },
    {
      t: "Reading and writing data",
      sub: ["INSERT, SELECT, UPDATE, DELETE", "WHERE with AND, OR, IN, LIKE, IS NULL", "ORDER BY, LIMIT, OFFSET (pagination)", "Parameterised queries and SQL injection", "Python's sqlite3 module"],
      body: `<p>The four statements map to CRUD. <code>LIMIT</code> and <code>OFFSET</code> give you pagination: page 3 with size 10 is <code>LIMIT 10 OFFSET 20</code>.</p>
<p><b>Never</b> build SQL by pasting user input into a string. Use parameters (<code>?</code> in sqlite3, <code>%s</code> in psycopg, or an ORM) so the database treats input as data, never as code. That one habit prevents SQL injection, one of the most common real-world vulnerabilities.</p>`,
      lang: "python",
      code: `import sqlite3

con = sqlite3.connect(":memory:")
con.row_factory = sqlite3.Row
con.execute("CREATE TABLE loans (id INTEGER PRIMARY KEY, name TEXT, amount REAL, status TEXT)")

rows = [("Aarav", 500000, "new"), ("Priya", 120000, "approved"), ("Rohit", 80000, "rejected")]
con.executemany("INSERT INTO loans (name, amount, status) VALUES (?, ?, ?)", rows)

search = "pri"                                     # user input
cur = con.execute(
    "SELECT * FROM loans WHERE name LIKE ? AND amount > ? ORDER BY amount DESC LIMIT ? OFFSET ?",
    (f"%{search}%", 50000, 10, 0),
)
print([dict(r) for r in cur])

con.execute("UPDATE loans SET status = ? WHERE id = ?", ("approved", 1))
con.execute("DELETE FROM loans WHERE status = ?", ("rejected",))
print(con.execute("SELECT COUNT(*) FROM loans").fetchone()[0])

# DANGEROUS, never do this:
# con.execute(f"SELECT * FROM loans WHERE name = '{search}'")
# search = "x' OR '1'='1"  would return every row`,
      ex: "Load a CSV of your choice into SQLite with executemany, then write five queries: a search, a filter, a sort, page 2 of results and a delete.",
      q: ["What is page 4 with page size 25?", ["LIMIT 25 OFFSET 100", "LIMIT 25 OFFSET 75", "LIMIT 100 OFFSET 25", "LIMIT 4 OFFSET 25"], 1, "Offset is (page - 1) * size = 3 * 25 = 75."]
    },
    {
      t: "Joins and aggregates",
      sub: ["INNER JOIN and LEFT JOIN", "COUNT, SUM, AVG, MIN, MAX", "GROUP BY and HAVING", "Subqueries", "Building dashboard numbers with SQL"],
      body: `<p>A <b>join</b> combines rows from two tables using a key: each loan with its borrower's name. <code>LEFT JOIN</code> keeps rows that have no match (borrowers without loans).</p>
<p><b>Aggregates</b> turn many rows into one number. The dashboard tiles in every generated app ("Total amount", "Approved loans") are aggregate queries, built in <code>crud.py</code>'s <code>stats()</code> with SQLAlchemy's <code>func.count</code> and <code>func.sum</code>.</p>`,
      lang: "sql",
      code: `-- each loan with its borrower
SELECT l.id, b.name, l.amount, l.status
FROM loans l
JOIN borrowers b ON b.id = l.borrower_id;

-- borrowers and how many loans each has (including zero)
SELECT b.name, COUNT(l.id) AS loans, COALESCE(SUM(l.amount), 0) AS total
FROM borrowers b
LEFT JOIN loans l ON l.borrower_id = b.id
GROUP BY b.id, b.name
ORDER BY total DESC;

-- dashboard tiles
SELECT status, COUNT(*) AS n, SUM(amount) AS amount
FROM loans
GROUP BY status
HAVING COUNT(*) > 0;

-- loans above the average amount
SELECT * FROM loans WHERE amount > (SELECT AVG(amount) FROM loans);`,
      ex: "With your clinic tables, write a query listing each doctor with their number of appointments this month, including doctors with none.",
      q: ["Which join keeps borrowers who have no loans?", ["INNER JOIN", "LEFT JOIN from borrowers", "CROSS JOIN", "A WHERE clause"], 1, "LEFT JOIN keeps every row from the left table, filling missing matches with NULL."]
    },
    {
      t: "Transactions, indexes and migrations",
      sub: ["ACID and why transactions matter", "BEGIN, COMMIT, ROLLBACK", "Indexes: faster reads, slower writes", "EXPLAIN QUERY PLAN", "Migrations: changing schema safely; additive vs destructive"],
      body: `<p>A <b>transaction</b> groups statements so they all succeed or none do. Moving money between two accounts must be one transaction.</p>
<p>An <b>index</b> is a lookup structure that makes filtering on a column fast. Index columns you search and join on (foreign keys, emails, status).</p>
<p>A <b>migration</b> changes the schema of a live database. SaaSForge's <code>migrate.py</code> only does <b>additive</b> migrations: it adds new tables and columns and never drops or renames anything, so a v2 rebuild cannot destroy v1 data. Tools like Alembic handle full migrations.</p>`,
      lang: "python",
      code: `import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance REAL NOT NULL CHECK (balance >= 0))")
con.executemany("INSERT INTO accounts (balance) VALUES (?)", [(100,), (50,)])
con.commit()

def transfer(src: int, dst: int, amount: float) -> bool:
    try:
        with con:                                   # BEGIN ... COMMIT, or ROLLBACK on error
            con.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, dst))
            con.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, src))
        return True
    except sqlite3.IntegrityError:                  # CHECK failed: nothing was changed
        return False

print(transfer(1, 2, 500), con.execute("SELECT balance FROM accounts").fetchall())

con.execute("CREATE INDEX ix_accounts_balance ON accounts(balance)")
print(con.execute("EXPLAIN QUERY PLAN SELECT * FROM accounts WHERE balance > 10").fetchall())

def add_column_if_missing(table: str, col: str, decl: str) -> None:   # additive migration
    cols = {r[1] for r in con.execute(f"PRAGMA table_info({table})")}
    if col not in cols:
        con.execute(f"ALTER TABLE {table} ADD COLUMN {col} {decl}")

add_column_if_missing("accounts", "currency", "TEXT DEFAULT 'INR'")`,
      ex: "Read <code>saasforge/platform/runtime/migrate.py</code>. Then write your own <code>upgrade()</code> that compares a dict of expected tables and columns with the live database and adds what is missing.",
      q: ["Why does SaaSForge only do additive migrations?", ["SQLite cannot drop columns", "So rebuilding an app can never delete existing data", "It is faster", "Postgres requires it"], 1, "Adding is always safe for existing rows; dropping or renaming risks data loss."]
    }
  ]
});

COURSE.push({
  n: 6, id: "sqlalchemy", title: "SQLAlchemy ORM", level: 2,
  blurb: "Work with database rows as Python objects, the modern SQLAlchemy 2.0 way, wired into FastAPI.",
  saas: "Generated <code>app/db.py</code> and <code>app/models.py</code>, <code>platform/codegen.py</code> (writes model classes), <code>platform/runtime/crud.py</code> (all queries).",
  lessons: [
    {
      t: "Engine, sessions and the declarative base",
      sub: ["What an ORM does and does not do", "create_engine and database URLs", "sessionmaker and the session lifecycle", "DeclarativeBase", "Base.metadata.create_all"],
      body: `<p>An ORM (object-relational mapper) maps classes to tables and objects to rows, and writes SQL for you. You still need to understand SQL: the ORM just removes repetition.</p>
<p>The <b>engine</b> knows how to connect. A <b>session</b> is a unit of work: you add and change objects, then <code>commit()</code> writes them in one transaction. In a web app you open one session per request and close it afterwards.</p>`,
      lang: "python",
      code: `import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

def database_url() -> str:
    url = os.environ.get("DATABASE_URL", "sqlite:///./data/app.db")
    if url.startswith("postgres://"):              # some hosts use the old scheme
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    return url

URL = database_url()
engine = create_engine(
    URL,
    connect_args={"check_same_thread": False} if URL.startswith("sqlite") else {},
    pool_pre_ping=True,                             # drop dead connections
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

def get_db():                                      # FastAPI dependency
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# after defining models:  Base.metadata.create_all(engine)`,
      ex: "Compare this with the <code>app/db.py</code> string inside <code>saasforge/scaffold.py</code>. List every difference and explain why each exists.",
      q: ["What is a session?", ["A database server", "A unit of work that tracks objects and commits them together", "A user's login", "A table"], 1, "The session collects changes and flushes them in a transaction on commit."]
    },
    {
      t: "Models with Mapped and mapped_column",
      sub: ["Mapped[type] annotations", "mapped_column: primary_key, nullable, unique, index, default", "Server defaults: func.now()", "ForeignKey and relationship()", "Generating models from a spec"],
      body: `<p>SQLAlchemy 2.0 models use type hints: <code>amount: Mapped[float]</code> means a NOT NULL float column, <code>Mapped[str | None]</code> means nullable. <code>mapped_column()</code> adds the details.</p>
<p><code>platform/codegen.py</code> generates exactly these classes from a JSON plan: it loops over entities and fields and writes one <code>mapped_column</code> line per field, using a type map (<code>COLTYPE</code>). Seeing models as data that becomes code is the key idea behind the whole engine.</p>`,
      lang: "python",
      code: `from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Borrower(Base):
    __tablename__ = "borrowers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    phone: Mapped[str | None] = mapped_column(String(20))
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    loans: Mapped[list["Loan"]] = relationship(back_populates="borrower", cascade="all, delete-orphan")

class Loan(Base):
    __tablename__ = "loans"
    id: Mapped[int] = mapped_column(primary_key=True)
    borrower_id: Mapped[int] = mapped_column(ForeignKey("borrowers.id"), index=True)
    amount: Mapped[float] = mapped_column(Float)
    months: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(40), default="new", index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    borrower: Mapped[Borrower] = relationship(back_populates="loans")

# Generating code from data, the codegen.py idea:
COLTYPE = {"str": "String(255)", "int": "Integer", "float": "Float", "text": "Text"}
def column_line(f: dict) -> str:
    opt = "" if f.get("required") else " | None"
    py = {"int": "int", "float": "float"}.get(f["type"], "str")
    return f'    {f["name"]}: Mapped[{py}{opt}] = mapped_column({COLTYPE[f["type"]]})'
print(column_line({"name": "rate", "type": "float", "required": True}))`,
      ex: "Write a function that takes <code>{\"name\": \"invoice\", \"fields\": [...]}</code> and returns the full source of a model class as a string. Exec it into a fresh Base and call create_all to prove it works.",
      q: ["What does <code>Mapped[str | None]</code> mean?", ["A required string column", "A nullable string column", "A string primary key", "A text index"], 1, "The | None makes the column nullable."]
    },
    {
      t: "Querying with select()",
      sub: ["select(Model).where(...)", "db.scalars(), db.scalar(), db.get()", "Filtering, ordering, pagination", "or_, func.count, func.sum, cast", "Building queries step by step"],
      body: `<p>In SQLAlchemy 2.0 you build a <code>select()</code> statement and execute it with the session. Statements are immutable and composable: each <code>.where()</code> returns a new statement, so you can add filters conditionally.</p>
<p><code>crud.py</code>'s <code>_filtered()</code> builds the list query this way: start with <code>select(model)</code>, add an owner filter if the role only sees its own records, add a search across text columns with <code>or_</code>, add each field filter from the query string, then paginate.</p>`,
      lang: "python",
      code: `from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session

def list_loans(db: Session, user_id: int, own_only: bool, q: str = "",
               status: str = "", page: int = 1, size: int = 10) -> dict:
    stmt = select(Loan)
    if own_only:
        stmt = stmt.where(Loan.owner_id == user_id)          # row-level scope
    if status:
        stmt = stmt.where(Loan.status == status)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(or_(func.lower(Loan.notes).like(like),
                              cast(Loan.amount, String).like(like)))
    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = db.scalars(stmt.order_by(Loan.id.desc()).offset((page - 1) * size).limit(size)).all()
    return {"items": rows, "total": total, "page": page}

def totals_by_status(db: Session) -> dict[str, float]:
    stmt = select(Loan.status, func.coalesce(func.sum(Loan.amount), 0)).group_by(Loan.status)
    return {status: amount for status, amount in db.execute(stmt)}

def get_or_none(db: Session, loan_id: int) -> Loan | None:
    return db.get(Loan, loan_id)`,
      ex: "Add a date-range filter (<code>created_from</code>, <code>created_to</code>) and a sort parameter that only accepts whitelisted column names.",
      q: ["Why whitelist sort column names instead of using the raw query parameter?", ["Speed", "A raw name could reference columns you never meant to expose or break the query", "SQLAlchemy needs strings", "It is required for pagination"], 1, "Treat every client value as untrusted; only allow known columns."]
    },
    {
      t: "Writes, integrity errors and FastAPI wiring",
      sub: ["db.add, db.commit, db.refresh, db.delete", "Handling IntegrityError (duplicates)", "Partial updates", "Ownership checks before update and delete", "Response models from ORM objects"],
      body: `<p>Writes follow one pattern: load or create the object, change it, <code>commit()</code>, <code>refresh()</code> to reload server-set values. If a unique constraint fails, catch <code>IntegrityError</code>, <code>rollback()</code> and return a clean 409 instead of a 500.</p>
<p>Always check ownership before changing a row. The generated apps load records through a helper that applies the role's scope and returns 404 for records the user may not see, so attackers cannot even confirm the record exists.</p>`,
      lang: "python",
      code: `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/borrowers")

def load_owned(db: Session, rec_id: int, user) -> Borrower:
    obj = db.get(Borrower, rec_id)
    if obj is None or (user.role != "admin" and obj.owner_id != user.id):
        raise HTTPException(404, "Not found")            # same answer either way
    return obj

@router.post("", status_code=201)
def create(body: BorrowerIn, db: Session = Depends(get_db), user=Depends(current_user)):
    obj = Borrower(**body.model_dump(), owner_id=user.id)
    db.add(obj)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "A borrower with these details already exists")
    db.refresh(obj)
    return obj

@router.patch("/{rec_id}")
def update(rec_id: int, body: dict, db: Session = Depends(get_db), user=Depends(current_user)):
    obj = load_owned(db, rec_id, user)
    for key in ("name", "phone"):                         # only allowed fields
        if key in body:
            setattr(obj, key, body[key])
    db.commit()
    return obj

@router.delete("/{rec_id}", status_code=204)
def delete(rec_id: int, db: Session = Depends(get_db), user=Depends(current_user)):
    db.delete(load_owned(db, rec_id, user))
    db.commit()`,
      ex: "Build full CRUD for one table with SQLAlchemy and FastAPI, including a 409 on duplicate email and ownership checks. This is the core of capstone project 1.",
      q: ["Why return 404 instead of 403 for another user's record?", ["404 is shorter", "It avoids revealing that the record exists", "403 is deprecated", "FastAPI requires it"], 1, "Returning the same response hides which ids exist."]
    }
  ]
});

COURSE.push({
  n: 7, id: "frontend", title: "Frontend: HTML, CSS, JavaScript", level: 2,
  blurb: "Build interfaces without a framework: semantic HTML, modern CSS layout, async JavaScript, the DOM, fetch and live updates.",
  saas: "<code>saasforge/web/index.html</code> (the agent's chat UI, about 800 lines), <code>platform/runtime/static/app.js</code> (the generated apps' single-page frontend).",
  lessons: [
    {
      t: "Semantic HTML and forms",
      sub: ["Document structure: header, main, nav, section", "Forms: input types, labels, required, pattern", "Buttons vs links", "Accessibility basics: labels, alt text, focus", "data- attributes for scripting"],
      body: `<p>HTML describes what things are. Use the right element (<code>button</code> for actions, <code>a</code> for navigation, <code>label</code> tied to every input) and the browser gives you keyboard support and accessibility for free.</p>
<p>Native form validation (<code>required</code>, <code>type="email"</code>, <code>min</code>, <code>pattern</code>) catches mistakes before any JavaScript runs, but always validate again on the server.</p>`,
      lang: "html",
      code: `<header class="top">
  <h1>Loan desk</h1>
  <nav><a href="#loans">Loans</a> <a href="#borrowers">Borrowers</a></nav>
</header>

<main>
  <section id="new-loan">
    <h2>New loan</h2>
    <form id="loan-form">
      <label for="amount">Amount (₹)</label>
      <input id="amount" name="amount" type="number" min="1000" step="500" required>

      <label for="months">Tenure (months)</label>
      <input id="months" name="months" type="number" min="1" max="360" required>

      <label for="email">Borrower email</label>
      <input id="email" name="email" type="email" required>

      <label for="status">Status</label>
      <select id="status" name="status">
        <option value="new">New</option>
        <option value="approved">Approved</option>
      </select>

      <button type="submit">Create loan</button>
      <p id="form-error" role="alert" hidden></p>
    </form>
  </section>

  <table id="loans" data-table="loans"><thead></thead><tbody></tbody></table>
</main>`,
      ex: "Write the HTML for a sign-in page and a records table page for your capstone app. No CSS or JavaScript yet; check it works with the keyboard alone.",
      q: ["Which element should trigger an action that does not navigate?", ["a", "div with onclick", "button", "span"], 2, "Buttons are focusable, keyboard-operable and announced correctly by screen readers."]
    },
    {
      t: "CSS layout and design tokens",
      sub: ["The box model and box-sizing", "Flexbox for rows, Grid for layouts", "CSS custom properties (variables) as design tokens", "Responsive design with media queries", "Dark mode with prefers-color-scheme"],
      body: `<p>Modern layout is two tools: <b>Flexbox</b> for one-dimensional rows or columns and <b>Grid</b> for two-dimensional page layouts. Use <code>gap</code> instead of margins between siblings.</p>
<p>Define colours, spacing and fonts once as <b>custom properties</b> on <code>:root</code> and use them everywhere. Changing a theme, or supporting dark mode, then means redefining a handful of variables.</p>`,
      lang: "css",
      code: `:root {
  --bg: #f6f7f9; --surface: #ffffff; --text: #1d2330; --muted: #5b6475;
  --accent: #2357d9; --danger: #c2362b; --radius: 8px; --gap: 16px;
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #11141a; --surface: #1a1f28; --text: #e7eaf0; --muted: #98a1b3; --accent: #7aa2ff; }
}
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.5 system-ui, sans-serif; }

.app { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
.sidebar { background: var(--surface); padding: var(--gap); }
.toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.toolbar .spacer { flex: 1; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--gap); }
.btn { background: var(--accent); color: white; border: 0; border-radius: var(--radius); padding: 8px 14px; }
.btn:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 40%, transparent); }

@media (max-width: 720px) {
  .app { grid-template-columns: 1fr; }
  .sidebar { order: 2; }
}`,
      ex: "Style your sign-in and table pages with tokens only (no literal colours in component rules), add dark mode, and make the layout stack on a phone-width window.",
      q: ["What is the main benefit of CSS custom properties for themes?", ["They are faster", "Change a few variables and every component follows", "They work without a browser", "They replace media queries"], 1, "Components reference tokens, so redefining tokens re-themes everything."]
    },
    {
      t: "Modern JavaScript and fetch",
      sub: ["const / let, arrow functions, template literals", "Objects, arrays, destructuring, spread", "Promises and async / await", "fetch(): GET, POST JSON, headers, errors", "Storing a token and calling an authenticated API"],
      body: `<p>JavaScript in the browser is asynchronous: network calls return <b>Promises</b>. <code>async/await</code> lets you write them like normal sequential code.</p>
<p><code>fetch()</code> does not throw on 4xx or 5xx responses; you must check <code>res.ok</code>. Wrap it once in a helper (the generated <code>app.js</code> has an <code>api()</code> function) that adds the auth header, parses JSON and turns errors into exceptions.</p>`,
      lang: "javascript",
      code: `const state = { token: localStorage.getItem("token") || "", user: null };

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: \`Bearer \${state.token}\` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { state.token = ""; throw new Error("Please sign in again"); }
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new Error(typeof data?.detail === "string" ? data.detail : "Request failed");
  return data;
}

async function signIn(email, password) {
  const { token, user } = await api("/api/auth/login", { method: "POST", body: { email, password } });
  state.token = token; state.user = user;
  localStorage.setItem("token", token);
}

async function loadLoans(page = 1) {
  const { items, total } = await api(\`/api/loans?page=\${page}&size=10\`);
  const [first, ...rest] = items;                 // destructuring
  console.log(total, first, rest.length);
  return items.map(({ id, amount, status }) => ({ id, amount, status }));
}`,
      ex: "Write <code>api()</code> yourself without looking, then use it to sign in and load a page of records from the FastAPI app you built in Module 6.",
      q: ["Does fetch() reject the promise on a 404 response?", ["Yes", "No, you must check res.ok", "Only for POST", "Only in Chrome"], 1, "fetch only rejects on network failure; HTTP error codes resolve normally."]
    },
    {
      t: "DOM rendering, events and live updates",
      sub: ["querySelector, createElement, textContent", "Rendering a table from data", "Event listeners and event delegation", "Escaping: textContent vs innerHTML (XSS)", "EventSource for server-sent events; a tiny SPA router with location.hash"],
      body: `<p>Without a framework you render by turning data into DOM nodes. Use <code>textContent</code> for anything that came from a user or a server: <code>innerHTML</code> with untrusted text is a cross-site scripting (XSS) hole.</p>
<p><b>Event delegation</b> attaches one listener to a container and checks <code>event.target</code>, so rows you add later work automatically. A hash router (<code>#/loans/42</code>) gives you a single-page app with working back buttons and no build step, which is how SaaSForge's generated frontends work.</p>`,
      lang: "javascript",
      code: `const $ = (sel, root = document) => root.querySelector(sel);

function renderTable(table, rows, columns) {
  const thead = $("thead", table), tbody = $("tbody", table);
  thead.replaceChildren(el("tr", {}, ...columns.map(c => el("th", {}, c.label))));
  tbody.replaceChildren(...rows.map(r =>
    el("tr", { "data-id": r.id }, ...columns.map(c => el("td", {}, String(r[c.key] ?? ""))))));
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const ch of children) node.append(ch);   // strings become text nodes: safe
  return node;
}

$("#loans").addEventListener("click", (e) => {    // delegation
  const row = e.target.closest("tr[data-id]");
  if (row) location.hash = \`#/loans/\${row.dataset.id}\`;
});

window.addEventListener("hashchange", route);
function route() {
  const [, page, id] = location.hash.split("/");  // "#/loans/42"
  console.log("show", page || "home", id || "");
}

const es = new EventSource("/api/jobs/abc/stream");
es.onmessage = (m) => {
  const ev = JSON.parse(m.data);
  $("#log").append(el("li", {}, \`\${ev.id}: \${ev.status}\`));
  if (ev.type === "done") es.close();
};`,
      ex: "Finish the frontend of capstone project 2: sign in, list with pagination, create form, edit view via hash routes, and delete. No frameworks.",
      q: ["Why is <code>row.innerHTML = user.name</code> dangerous?", ["It is slow", "A name containing HTML or a script runs in your page (XSS)", "It breaks CSS", "innerHTML is deprecated"], 1, "innerHTML parses text as HTML; use textContent for untrusted data."]
    }
  ]
});

COURSE.push({
  n: 8, id: "security", title: "Authentication and security", level: 3,
  blurb: "Sign-in, passwords, tokens, roles, per-record access and the attacks every SaaS must withstand.",
  saas: "The <code>app/auth.py</code> string in <code>scaffold.py</code> (scrypt, HMAC tokens, throttling), <code>crud.py</code> (roles, scopes, last-admin guard), <code>convert/runtime/hooks.py</code> (CSP), <code>files.py</code> (zip-bomb guard), <code>safe_expr.py</code> (no eval).",
  lessons: [
    {
      t: "Hashing passwords properly",
      sub: ["Why you never store passwords", "Hash vs encryption", "Salts and slow hashes: scrypt, bcrypt, argon2", "Constant-time comparison with hmac.compare_digest", "Storing algorithm parameters with the hash"],
      body: `<p>Store a <b>hash</b> of the password, never the password or an encrypted copy. A fast hash like SHA-256 is wrong: attackers can try billions per second. Use a deliberately slow, salted hash: scrypt, bcrypt or argon2.</p>
<p>A <b>salt</b> is random bytes stored next to the hash so identical passwords get different hashes. Compare with <code>hmac.compare_digest</code>, which takes the same time whether the first or last character differs, so timing reveals nothing. SaaSForge does this with the standard library only.</p>`,
      lang: "python",
      code: `import hashlib, hmac, secrets

N, R, P = 2**14, 8, 1                                 # scrypt cost parameters

def hash_password(pw: str) -> str:
    salt = secrets.token_bytes(16)
    h = hashlib.scrypt(pw.encode(), salt=salt, n=N, r=R, p=P)
    return f"scrypt\${salt.hex()}\${h.hex()}"

def verify_password(pw: str, stored: str) -> bool:
    try:
        algo, salt_hex, h_hex = stored.split("$")
    except ValueError:
        return False
    if algo != "scrypt":
        return False
    h = hashlib.scrypt(pw.encode(), salt=bytes.fromhex(salt_hex), n=N, r=R, p=P)
    return hmac.compare_digest(h.hex(), h_hex)

stored = hash_password("correct horse battery staple")
print(stored[:40], "...")
print(verify_password("correct horse battery staple", stored), verify_password("guess", stored))`,
      ex: "Time <code>hash_password</code> with n=2**14 and n=2**16. Explain why a slower hash is a feature here, and what the trade-off is for your login endpoint.",
      q: ["What does a salt protect against?", ["Network sniffing", "Precomputed tables and spotting users with the same password", "SQL injection", "Brute force on one account"], 1, "Unique salts make each hash unique, defeating rainbow tables and duplicate detection."]
    },
    {
      t: "Signed, expiring tokens",
      sub: ["Sessions vs tokens", "HMAC signatures: proving a value was issued by you", "Building a token: payload.signature, base64url", "Expiry (TTL) and the SECRET_KEY", "JWT: the standard version of the same idea"],
      body: `<p>After login the server gives the client a <b>token</b>, sent back on every request as <code>Authorization: Bearer ...</code>. The token must be impossible to forge, so the server signs it with <b>HMAC-SHA256</b> and a secret key only it knows.</p>
<p>SaaSForge's generated <code>auth.py</code> builds a minimal JWT by hand: a base64 payload with the user id and expiry, a dot, and the signature. Verification recomputes the signature and checks the expiry. In production you may use a library (PyJWT), but now you know exactly what it does.</p>`,
      lang: "python",
      code: `import base64, hashlib, hmac, json, os, time

SECRET = os.environ.get("SECRET_KEY", "dev-only-change-me").encode()
TTL = 60 * 60 * 24 * 7                                  # one week

def b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode().rstrip("=")

def unb64(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))

def make_token(user_id: int) -> str:
    payload = b64(json.dumps({"uid": user_id, "exp": int(time.time()) + TTL}).encode())
    sig = b64(hmac.new(SECRET, payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{sig}"

def read_token(token: str) -> int | None:
    try:
        payload, sig = token.split(".")
    except ValueError:
        return None
    good = b64(hmac.new(SECRET, payload.encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(sig, good):
        return None                                     # forged or tampered
    data = json.loads(unb64(payload))
    if data["exp"] < time.time():
        return None                                     # expired
    return data["uid"]

t = make_token(7)
print(t, read_token(t), read_token(t[:-2] + "xx"))`,
      ex: "Change one character of the payload part of a token and confirm read_token rejects it. Then explain why the payload is readable by anyone but still safe.",
      q: ["Can a user read the contents of this token?", ["No, it is encrypted", "Yes, it is only base64; the signature stops them changing it", "Only admins can", "Only with the secret key"], 1, "Signing gives integrity, not secrecy. Never put secrets in a token payload."]
    },
    {
      t: "Roles, permissions and row-level access",
      sub: ["Authentication vs authorisation", "RBAC: roles mapped to allowed actions", "Scope: own records vs all records", "Enforcing on the server, never only in the UI", "Guards: the last admin, self-demotion"],
      body: `<p><b>Authentication</b> answers "who are you?"; <b>authorisation</b> answers "may you do this?". SaaSForge plans contain a permission matrix: for each role and entity, which of create, read, update and delete are allowed, and whether the role sees <b>own</b> records or <b>all</b>.</p>
<p><code>crud.py</code> enforces this on the server for every request (<code>require()</code> and <code>scoped()</code>). Hiding a button in the UI is a convenience, not security. The generated tests check that every role is blocked where the plan says so.</p>`,
      lang: "python",
      code: `from fastapi import HTTPException

PLAN_PERMS = {
    "officer": {"loan": {"actions": {"create", "read", "update"}, "scope": "own"}},
    "manager": {"loan": {"actions": {"create", "read", "update", "delete"}, "scope": "all"}},
    "viewer":  {"loan": {"actions": {"read"}, "scope": "all"}},
}

def require(user, entity: str, action: str) -> str:
    if user.role == "admin":
        return "all"
    rule = PLAN_PERMS.get(user.role, {}).get(entity)
    if not rule or action not in rule["actions"]:
        raise HTTPException(403, f"Your role cannot {action} {entity} records")
    return rule["scope"]

def scoped(stmt, model, user, scope: str):
    return stmt.where(model.owner_id == user.id) if scope == "own" else stmt

def set_role(db, admin, target, new_role: str):
    if target.role == "admin" and new_role != "admin":
        admins = db.query(User).filter(User.role == "admin").count()
        if admins <= 1:
            raise HTTPException(400, "Keep at least one admin")
    target.role = new_role

# in an endpoint:
# scope = require(user, "loan", "read")
# stmt = scoped(select(Loan), Loan, user, scope)`,
      ex: "Write a pytest test that loops over every role and action and asserts the API returns 403 exactly where your permission matrix says it should.",
      q: ["Where must permissions be enforced?", ["In the UI", "On the server for every request", "In the database only", "In the browser's localStorage"], 1, "Anyone can call your API directly; the UI is not a security boundary."]
    },
    {
      t: "Common attacks and defences",
      sub: ["SQL injection and XSS (recap)", "Path traversal in file downloads", "Upload validation: size limits, magic bytes, zip bombs", "Brute force: throttling login", "Security headers: CSP, nosniff, frame-ancestors; secrets in env vars"],
      body: `<p>The OWASP Top 10 lists the most common web vulnerabilities. SaaSForge defends against several: it resolves download paths and checks they stay inside the case folder, checks an upload's first bytes match its extension, refuses zip files that would expand to absurd sizes, throttles repeated failed logins and sends a strict Content-Security-Policy.</p>
<p>Keep secrets (API keys, <code>SECRET_KEY</code>, database passwords) in environment variables, never in code or git. Commit a <code>.env.example</code> with blank values instead.</p>`,
      lang: "python",
      code: `import time, zipfile, io
from collections import defaultdict
from pathlib import Path
from fastapi import HTTPException

def safe_child(base: Path, name: str) -> Path:
    target = (base / name).resolve()
    if not target.is_relative_to(base.resolve()):          # blocks ../../etc/passwd
        raise HTTPException(400, "Bad file name")
    return target

MAGIC = {".pdf": b"%PDF", ".zip": b"PK\\x03\\x04", ".xlsx": b"PK\\x03\\x04", ".png": b"\\x89PNG"}
def check_upload(name: str, head: bytes, size: int, max_mb: int = 50) -> None:
    if size > max_mb * 1024 * 1024:
        raise HTTPException(413, "File too large")
    ext = Path(name).suffix.lower()
    if ext in MAGIC and not head.startswith(MAGIC[ext]):
        raise HTTPException(400, f"This is not a real {ext} file")

def zip_guard(raw: bytes, limit: int = 200_000_000) -> None:
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        if sum(i.file_size for i in z.infolist()) > limit:
            raise HTTPException(400, "Archive expands too much")

FAILS: dict[str, list[float]] = defaultdict(list)
def throttle(key: str, limit: int = 5, window: int = 300) -> None:
    now = time.time()
    FAILS[key] = [t for t in FAILS[key] if now - t < window]
    if len(FAILS[key]) >= limit:
        raise HTTPException(429, "Too many attempts, try again in a few minutes")
    FAILS[key].append(now)

CSP = "default-src 'self'; script-src 'self'; img-src 'self' data:; frame-ancestors 'none'"`,
      ex: "Try to break your own capstone app: request <code>/download?name=../../app/auth.py</code>, upload a .txt renamed to .pdf, and log in wrongly ten times. Fix whatever gets through.",
      q: ["What does path traversal exploit?", ["Weak passwords", "File paths built from user input that escape the intended folder", "Slow queries", "Cookies"], 1, "Names like ../../secret walk out of the folder unless you resolve and check the path."]
    }
  ]
});
