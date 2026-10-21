/* Forge Academy: deeper material for SQL fundamentals and HTTP/API lessons. */
window.DEEP = window.DEEP || {};
Object.assign(DEEP, {
  "5-0": {
    more: `<p><b>A relational database stores data as tables</b>: rows (records) and columns (fields), where every column has a <b>type</b> the database enforces. Choosing good types matters: <code>integer</code> and <code>bigint</code> for whole numbers and IDs, <code>numeric(12,2)</code> for money (never <code>float</code>, which has rounding errors), <code>text</code> for strings, <code>boolean</code>, <code>date</code>, <code>timestamptz</code> (timestamp with time zone; store UTC), and <code>uuid</code> or <code>jsonb</code> in Postgres. The type is your first line of data validation.</p>
<p><b>Keys give rows identity and connect tables.</b> A <b>primary key</b> uniquely identifies each row and should be stable and meaningless (a surrogate key: an auto-incrementing <code>bigint</code> or a UUID), not something that can change like an email or phone number. A <b>foreign key</b> stores another table's primary key to create a relationship, and the database enforces that the referenced row exists (referential integrity), so you can't have an order pointing at a customer who doesn't exist.</p>
<p><b>Relationships</b>: one-to-many is the most common (one customer, many orders), modelled by putting the foreign key on the "many" side (<code>orders.customer_id</code>). Many-to-many (students and courses) needs a junction table. Define <code>ON DELETE</code> behaviour deliberately: <code>CASCADE</code> (delete children with the parent), <code>RESTRICT</code> (prevent deleting a parent that still has children), or <code>SET NULL</code>.</p>
<p><b>Constraints</b> enforce rules in the database itself, so they hold no matter which application or script writes data: <code>NOT NULL</code>, <code>UNIQUE</code>, <code>DEFAULT</code>, and <code>CHECK</code> (for example <code>CHECK (amount &gt;= 0)</code>). Constraints are more reliable than application-level validation because nothing can bypass them.</p>
<p><b>SQLite vs PostgreSQL</b>: SQLite is a single file with no server, perfect for learning, local development, tests and small embedded apps. PostgreSQL is a full server built for concurrency, large data and production, with rich types (JSONB, arrays, full-text search), strong constraints and extensions. Learn standard SQL on SQLite, deploy real apps on Postgres.</p>`,
    example: {
      t: "A well-designed schema with keys, relationships and constraints",
      intro: "A small e-commerce schema in PostgreSQL showing surrogate keys, foreign keys with deliberate delete behaviour, and constraints that enforce business rules.",
      lang: "sql",
      code: `CREATE TABLE customers (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- surrogate key: stable, meaningless
    email       text NOT NULL UNIQUE,                               -- natural key, but things change, so not the PK
    full_name   text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        text NOT NULL,
    price_paise integer NOT NULL CHECK (price_paise >= 0),          -- money as integer paise, never float
    stock       integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
    active      boolean NOT NULL DEFAULT true
);

CREATE TABLE orders (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id bigint NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,  -- keep order history
    status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')), -- enum via CHECK
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- one order has many items; (order_id, product_id) is unique together
CREATE TABLE order_items (
    order_id    bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,      -- items die with the order
    product_id  bigint NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity    integer NOT NULL CHECK (quantity > 0),
    price_paise integer NOT NULL,                                             -- snapshot at purchase time
    PRIMARY KEY (order_id, product_id)                                        -- composite primary key
);

-- The database now refuses: negative prices, unknown statuses, orders for missing customers,
-- deleting a customer who has orders, and duplicate products on one order.
-- None of this depends on the application getting it right.`,
      after: "Notice <code>ON DELETE RESTRICT</code> on the customer (you don't silently erase order history) versus <code>CASCADE</code> on order items (they genuinely belong to the order). These are design decisions, not defaults to ignore."
    },
    mistakes: [
      "Using a natural key (email, phone) as the primary key; when it changes, every reference breaks.",
      "Storing money as float or real, causing rounding errors. Use integer minor units or numeric.",
      "Storing timestamps without time zone, then guessing what zone old data was in. Use timestamptz and store UTC.",
      "Relying only on application validation instead of NOT NULL, CHECK and UNIQUE constraints in the database.",
      "Not thinking about ON DELETE behaviour, so deletes either fail unexpectedly or silently remove related data."
    ],
    practice: [
      ["Why is an auto-generated id a better primary key than a customer's email?", "Primary keys should be stable and unique forever. Emails change and can be reassigned, which would break every foreign key referencing the customer. A surrogate id never changes."],
      ["Write a CHECK constraint ensuring a discount percentage column is between 0 and 100.", "<code>discount_pct integer NOT NULL DEFAULT 0 CHECK (discount_pct BETWEEN 0 AND 100)</code>."],
      ["You try to delete a product that appears in past orders and get a foreign-key error. What are two reasonable designs?", "Either keep the constraint and \"soft delete\" (set <code>active = false</code> so it stays for history but can't be ordered), which is usually best; or use <code>ON DELETE RESTRICT</code> and require archiving. Avoid CASCADE here, since it would erase order history."]
    ]
  },

  "5-1": {
    more: `<p><b>The four operations</b> (CRUD): <code>INSERT</code> adds rows, <code>SELECT</code> reads, <code>UPDATE</code> changes, <code>DELETE</code> removes. The two that cause disasters are <code>UPDATE</code> and <code>DELETE</code> <b>without a WHERE clause</b>, which change every row. Always write and test the <code>WHERE</code> first (as a SELECT) before turning it into an UPDATE or DELETE, and wrap risky changes in a transaction you can roll back.</p>
<p><b>Filtering with WHERE</b>: combine conditions with <code>AND</code>/<code>OR</code> (use parentheses to be explicit); <code>IN (...)</code> for a set; <code>BETWEEN</code> for ranges; <code>LIKE</code> for pattern matching (<code>'%son'</code> ends with, <code>'a%'</code> starts with, <code>ILIKE</code> for case-insensitive in Postgres). <b>NULL is special</b>: it means "unknown", so <code>= NULL</code> is never true; use <code>IS NULL</code> and <code>IS NOT NULL</code>. Comparisons with NULL yield NULL (not false), which surprises people.</p>
<p><b>Sorting and paging</b>: <code>ORDER BY column DESC</code>, then <code>LIMIT n OFFSET m</code> for pages. Beware: large <code>OFFSET</code> values are slow (the database still scans the skipped rows) and can skip or repeat rows when data changes between pages; keyset pagination (<code>WHERE id &lt; last_seen_id ORDER BY id DESC LIMIT 20</code>) is faster and stable for feeds.</p>
<p><b>Parameterised queries are non-negotiable.</b> Never build SQL by concatenating or formatting user input into the string. Use placeholders (<code>?</code> in SQLite, <code>%s</code> or <code>$1</code> depending on the driver) and pass values separately, so the database treats them as data, never as SQL. This is the only correct defence against <b>SQL injection</b>, where input like <code>' OR '1'='1</code> would otherwise change the query's meaning, exposing or destroying data.</p>`,
    example: {
      t: "Safe queries, NULL handling and keyset pagination in Python",
      intro: "Common read and write patterns done safely, including the parameterisation that prevents SQL injection and pagination that scales.",
      lang: "python",
      code: `import sqlite3
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, city TEXT, last_login TEXT)")
conn.executemany("INSERT INTO users (email, city, last_login) VALUES (?, ?, ?)",
                 [("asha@x.in", "Pune", "2026-10-20"), ("ravi@x.in", "Delhi", None),
                  ("mira@x.in", "Pune", "2026-10-18")])
conn.commit()

# SAFE: value passed separately, never formatted into the SQL string
def find_by_city(city: str):
    return conn.execute("SELECT id, email FROM users WHERE city = ?", (city,)).fetchall()

# UNSAFE (shown only to recognise and avoid): input could change the query's meaning
#   conn.execute(f"SELECT * FROM users WHERE city = '{city}'")   # NEVER do this

# NULL is 'unknown': use IS NULL, not = NULL
never_logged_in = conn.execute("SELECT email FROM users WHERE last_login IS NULL").fetchall()
print("never logged in:", never_logged_in)             # ravi; '= NULL' would return nothing

# Pattern match, case-insensitive-ish, with a parameter
conn.execute("SELECT email FROM users WHERE email LIKE ?", ("%@x.in",)).fetchall()

# Keyset (seek) pagination: stable and fast even for deep pages
def page(after_id: int = 0, size: int = 2):
    return conn.execute(
        "SELECT id, email FROM users WHERE id > ? ORDER BY id LIMIT ?", (after_id, size)).fetchall()
first = page(); last_id = first[-1][0]
print("page 1:", first, "| page 2:", page(after_id=last_id))

# An UPDATE: test the WHERE as a SELECT first, then run inside a transaction
with conn:                                              # commits on success, rolls back on exception
    conn.execute("UPDATE users SET city = ? WHERE city = ?", ("Pune City", "Pune"))`,
      after: "The single most important habit: user input always travels as a parameter (the <code>(city,)</code> tuple), never inside the SQL text. Get this right everywhere and SQL injection simply can't happen."
    },
    mistakes: [
      "Building SQL with f-strings or concatenation from user input: the classic SQL injection hole. Always parameterise.",
      "Running UPDATE or DELETE without a WHERE, changing every row. Test the WHERE as a SELECT first.",
      "Using <code>= NULL</code> instead of <code>IS NULL</code>, which silently matches nothing.",
      "Deep OFFSET pagination on large tables, which gets slower per page and can skip or duplicate rows.",
      "Forgetting to commit (or to use a transaction), so changes are lost or left half-applied."
    ],
    practice: [
      ["Why does <code>WHERE discount = NULL</code> return no rows even when discount is null?", "NULL means \"unknown\", so any comparison with it (including = NULL) yields NULL, which is not true. Use <code>IS NULL</code> to match null values."],
      ["Rewrite this safely: <code>db.execute(\"DELETE FROM sessions WHERE token = '\" + token + \"'\")</code>.", "<code>db.execute(\"DELETE FROM sessions WHERE token = ?\", (token,))</code> (or <code>%s</code>/<code>$1</code> depending on the driver), passing the value separately."],
      ["Why is keyset pagination (WHERE id > last_id) better than OFFSET for an infinite-scroll feed?", "OFFSET still scans and discards all skipped rows, so later pages get slower, and inserts or deletes between pages shift rows, causing skips or duplicates. Keyset seeks directly to the position using the index and is stable."]
    ]
  },

  "5-2": {
    more: `<p><b>Joins combine rows from several tables</b> using a matching condition, usually a foreign key equals a primary key. <b>INNER JOIN</b> returns only rows that match in both tables. <b>LEFT JOIN</b> returns every row from the left table, with NULLs where the right table has no match, which is how you find "customers with no orders" (left join, then <code>WHERE orders.id IS NULL</code>). RIGHT and FULL joins exist but are less common. Always qualify columns with table names or aliases (<code>o.id</code>, <code>c.name</code>) once more than one table is involved.</p>
<p><b>Aggregates</b> compute a single value over many rows: <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>. On their own they collapse everything to one row. <b><code>GROUP BY</code></b> computes one aggregate per group (revenue per city, orders per customer). The rule: every column in the <code>SELECT</code> must either be in the <code>GROUP BY</code> or inside an aggregate function. Use <b><code>HAVING</code></b> to filter on aggregate results (<code>HAVING COUNT(*) &gt; 5</code>), which runs after grouping, whereas <code>WHERE</code> filters individual rows before grouping. A subtlety: <code>COUNT(*)</code> counts rows, but <code>COUNT(column)</code> ignores NULLs, and <code>LEFT JOIN</code> + <code>COUNT(right.id)</code> correctly counts zero for unmatched rows.</p>
<p><b>Subqueries</b> nest one query inside another: in <code>WHERE</code> (<code>WHERE id IN (SELECT ...)</code>), in <code>FROM</code> (a derived table), or as a scalar value in <code>SELECT</code>. Common table expressions (<code>WITH name AS (...)</code>) are subqueries given a name at the top, which makes complex queries readable and lets you build them step by step. <b>Window functions</b> (<code>SUM(...) OVER (PARTITION BY ... ORDER BY ...)</code>) compute across rows without collapsing them, for running totals, rankings and row numbers.</p>
<p>Most "dashboard numbers" are a join plus a <code>GROUP BY</code>: build them incrementally, checking the row count at each step, so you catch accidental fan-out (a join multiplying rows) before it corrupts your totals.</p>`,
    example: {
      t: "Dashboard queries: joins, grouping, and finding what's missing",
      intro: "The queries behind a typical sales dashboard, including the LEFT JOIN trick for \"customers who never ordered\" and a window function for running totals.",
      lang: "sql",
      code: `-- Revenue and order count per city (join orders -> customers, then group)
SELECT c.city,
       COUNT(DISTINCT o.id)        AS orders,
       SUM(oi.quantity * oi.price_paise) / 100.0 AS revenue_rupees
FROM customers c
JOIN orders o       ON o.customer_id = c.id AND o.status = 'paid'
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.city
HAVING SUM(oi.quantity * oi.price_paise) > 100000     -- only cities over Rs 1000, filtered AFTER grouping
ORDER BY revenue_rupees DESC;

-- Customers who have never placed an order (LEFT JOIN + IS NULL)
SELECT c.id, c.full_name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;

-- Top product per city using a window function (no collapsing of rows)
WITH product_sales AS (
    SELECT c.city, p.name,
           SUM(oi.quantity) AS units,
           RANK() OVER (PARTITION BY c.city ORDER BY SUM(oi.quantity) DESC) AS rnk
    FROM order_items oi
    JOIN orders o   ON o.id = oi.order_id
    JOIN customers c ON c.id = o.customer_id
    JOIN products p  ON p.id = oi.product_id
    GROUP BY c.city, p.name
)
SELECT city, name, units FROM product_sales WHERE rnk = 1;

-- Running total of daily revenue (window function over ordered rows)
SELECT day, revenue,
       SUM(revenue) OVER (ORDER BY day) AS running_total
FROM (SELECT created_at::date AS day, SUM(total_paise)/100.0 AS revenue
      FROM orders WHERE status = 'paid' GROUP BY 1) daily
ORDER BY day;`,
      after: "The \"customers who never ordered\" pattern (LEFT JOIN then filter for NULL on the right side) comes up constantly: find the things in A that have no match in B."
    },
    mistakes: [
      "Using WHERE to filter on an aggregate (<code>WHERE COUNT(*) &gt; 5</code>); that needs HAVING, which runs after grouping.",
      "A SELECT column that isn't grouped or aggregated, which is an error or gives arbitrary results.",
      "Joining tables that fan out (one-to-many on both sides) and then SUMming, which multiplies totals. Check row counts.",
      "Using INNER JOIN when you need to see rows with no match; those rows silently disappear.",
      "<code>COUNT(column)</code> when you meant <code>COUNT(*)</code>, since the former skips NULLs and can undercount."
    ],
    practice: [
      ["What's the difference between WHERE and HAVING?", "WHERE filters individual rows before grouping; HAVING filters groups after aggregation. Use WHERE to restrict which rows are counted, HAVING to restrict which groups appear (like groups with more than 5 members)."],
      ["Write a query to find products that have never been ordered.", "<pre>SELECT p.id, p.name\nFROM products p\nLEFT JOIN order_items oi ON oi.product_id = p.id\nWHERE oi.product_id IS NULL;</pre>"],
      ["A query joins orders to order_items and sums order totals, but the totals are too high. What likely happened?", "The join fanned out: each order has several items, so the order's total_paise is repeated once per item and summed multiple times. Either sum the item amounts instead, or aggregate items in a subquery before joining."]
    ]
  },

  "5-3": {
    more: `<p><b>Transactions make several changes atomic.</b> A transaction is a group of statements that either all succeed or all fail together. The classic example: transferring money must debit one account and credit another; doing one without the other corrupts data. <b>ACID</b> summarises the guarantees: <b>Atomicity</b> (all or nothing), <b>Consistency</b> (constraints hold before and after), <b>Isolation</b> (concurrent transactions don't see each other's half-finished work), and <b>Durability</b> (once committed, it survives crashes). You wrap work in <code>BEGIN ... COMMIT</code>, and <code>ROLLBACK</code> undoes everything on error.</p>
<p><b>Isolation and concurrency</b>: when many transactions run at once, isolation levels control what they can see. Watch for the <b>lost update</b> problem: two sessions read the same stock count, both subtract, and one update overwrites the other. Fix it with a conditional update (<code>UPDATE ... SET stock = stock - 1 WHERE id = ? AND stock &gt;= 1</code>, checking rows affected), row locking (<code>SELECT ... FOR UPDATE</code>), or a higher isolation level. Keep transactions short and never do slow work (API calls, user prompts) while holding locks.</p>
<p><b>Indexes</b> speed up reads by letting the database find rows without scanning the whole table, like a book's index. Create them on columns you filter, join or sort by frequently (foreign keys, <code>email</code>, <code>created_at</code>). The trade-off: every index must be updated on inserts, updates and deletes, so indexes make writes slower and use space. Don't index everything; index what queries actually need. Composite indexes (<code>(customer_id, created_at)</code>) serve queries that filter on the first column and sort on the second.</p>
<p><b>Reading query plans</b>: <code>EXPLAIN</code> (SQLite's <code>EXPLAIN QUERY PLAN</code>, Postgres's <code>EXPLAIN ANALYZE</code>) shows whether a query uses an index or scans the whole table. A "Seq Scan" or "SCAN TABLE" on a big table in a frequent query is the signal to add an index.</p>
<p><b>Migrations</b> change the schema safely over time, as versioned, reviewed scripts (never by editing production by hand). <b>Additive</b> changes (new nullable column, new table, new index) are safe and backward-compatible. <b>Destructive</b> changes (dropping or renaming a column, changing a type, adding a NOT NULL column to a big table) need the expand-and-contract approach across several releases so the running application never breaks.</p>`,
    example: {
      t: "A safe money transfer, a race-free stock decrement, and reading a query plan",
      intro: "Transactions for atomicity, a conditional update to prevent lost updates under concurrency, and using EXPLAIN to justify an index.",
      lang: "python",
      code: `import sqlite3
conn = sqlite3.connect(":memory:")
conn.executescript("""
CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance_paise INTEGER CHECK (balance_paise >= 0));
INSERT INTO accounts (name, balance_paise) VALUES ('Asha', 100000), ('Ravi', 0);
CREATE TABLE products (id INTEGER PRIMARY KEY, stock INTEGER);
INSERT INTO products (id, stock) VALUES (1, 1);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, created_at TEXT);
""")

# Atomic transfer: both updates commit together, or neither does
def transfer(frm: int, to: int, paise: int):
    try:
        with conn:                                          # BEGIN; COMMIT on success, ROLLBACK on error
            conn.execute("UPDATE accounts SET balance_paise = balance_paise - ? WHERE id = ?", (paise, frm))
            conn.execute("UPDATE accounts SET balance_paise = balance_paise + ? WHERE id = ?", (paise, to))
            # the CHECK (balance_paise >= 0) raises if 'frm' goes negative, rolling BOTH updates back
    except sqlite3.IntegrityError:
        return "insufficient funds"
    return "ok"
print(transfer(1, 2, 150000))        # insufficient funds: nothing changed
print(transfer(1, 2, 40000))         # ok

# Race-free stock decrement: the WHERE clause does the check atomically
def buy_last_unit(product_id: int) -> bool:
    with conn:
        cur = conn.execute("UPDATE products SET stock = stock - 1 WHERE id = ? AND stock >= 1", (product_id,))
        return cur.rowcount == 1       # 1 if we got it, 0 if another transaction took it first

print(buy_last_unit(1), buy_last_unit(1))   # True False: no overselling, even under concurrency

# Indexes and plans
conn.executemany("INSERT INTO orders (customer_id, created_at) VALUES (?, ?)",
                 [(i % 100, "2026-10-20") for i in range(5000)])
print(conn.execute("EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 7").fetchall())
# -> SCAN TABLE orders  (slow: reads every row)
conn.execute("CREATE INDEX idx_orders_customer ON orders(customer_id)")
print(conn.execute("EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 7").fetchall())
# -> SEARCH TABLE orders USING INDEX idx_orders_customer  (fast)`,
      after: "The conditional <code>UPDATE ... WHERE stock >= 1</code> returning rowcount is a clean, database-level way to prevent overselling: the check and the decrement happen as one atomic operation, so two buyers can't both get the last unit."
    },
    mistakes: [
      "Doing multi-step changes (transfer, order placement) without a transaction, risking half-applied state on error.",
      "Read-then-write without protection (read stock, then subtract), causing lost updates under concurrency.",
      "Indexing every column, which slows writes and wastes space; index what queries filter, join or sort on.",
      "Assuming a query uses an index without checking EXPLAIN; a sequential scan on a big hot table is a red flag.",
      "Running destructive migrations (drop or rename a column) in the same release as the code change, breaking the running app."
    ],
    practice: [
      ["Two users buy the last concert ticket at the same time. How do you ensure only one succeeds?", "Use an atomic conditional update: <code>UPDATE tickets SET sold = sold + 1 WHERE id = ? AND sold &lt; capacity</code> and check that exactly one row was affected, or lock the row with <code>SELECT ... FOR UPDATE</code> inside a transaction. The database serialises the two attempts so only one wins."],
      ["Why does adding an index speed up reads but slow down writes?", "An index is a sorted structure the database searches instead of scanning the table, so lookups are fast. But every insert, update or delete must also update each index on that table, which is extra work and storage."],
      ["Which of these migrations are safe to deploy with the old app still running: (a) add a nullable column, (b) drop a column the app still reads, (c) add a new index, (d) rename a column?", "(a) and (c) are safe (additive, backward-compatible). (b) and (d) break the running app; do them with expand-and-contract across releases: add the new form, migrate reads and writes, then remove the old form once nothing uses it."]
    ]
  },

  "3-1": {
    more: `<p><b>Status codes are the API's vocabulary for what happened.</b> Reading them correctly is the difference between a robust client and one that retries the wrong things or hides real errors. The families: <b>1xx</b> informational (rare), <b>2xx</b> success, <b>3xx</b> redirection, <b>4xx</b> the client's fault, <b>5xx</b> the server's fault.</p>
<p><b>Success (2xx)</b>: <code>200 OK</code> (here's the result), <code>201 Created</code> (a new resource was made; often returns it and a <code>Location</code> header), <code>204 No Content</code> (success, nothing to return, common for DELETE).</p>
<p><b>Client errors (4xx)</b> mean the request was wrong and retrying it unchanged won't help: <code>400 Bad Request</code> (malformed), <code>401 Unauthorized</code> (not authenticated; log in), <code>403 Forbidden</code> (authenticated but not allowed), <code>404 Not Found</code>, <code>409 Conflict</code> (e.g. duplicate, or a version clash), <code>422 Unprocessable Entity</code> (well-formed but failed validation), <code>429 Too Many Requests</code> (rate limited; the one 4xx you <i>should</i> retry, after the <code>Retry-After</code> delay).</p>
<p><b>Server errors (5xx)</b> mean the server failed and the same request might succeed later: <code>500 Internal Server Error</code> (a bug or unhandled exception), <code>502 Bad Gateway</code> and <code>503 Service Unavailable</code> and <code>504 Gateway Timeout</code> (an upstream or the server is down or overloaded). These are generally safe to retry with backoff.</p>
<p><b>Retry policy</b>: retry 429, 502, 503, 504 and network-level failures (connection refused, timeout) with exponential backoff and jitter; do not retry 400, 401, 403, 404, 422 (fix the request instead); be careful retrying non-idempotent requests (a POST that creates or charges) unless you use an idempotency key. Set <b>timeouts</b> on every request so a hung server doesn't block your client forever, and distinguish a connect timeout (couldn't reach the server) from a read timeout (reached it, no reply in time).</p>`,
    example: {
      t: "A robust API client: status handling, retries and timeouts",
      intro: "A small wrapper that classifies responses correctly, retries only what should be retried, honours Retry-After, and always sets timeouts.",
      lang: "python",
      code: `import time, random
import httpx

RETRYABLE_STATUS = {429, 502, 503, 504}

class ApiError(Exception):
    def __init__(self, status, body): super().__init__(f"HTTP {status}: {body[:200]}"); self.status = status

def request(client: httpx.Client, method: str, url: str, *, attempts=4, **kwargs):
    for attempt in range(attempts):
        try:
            r = client.request(method, url, timeout=httpx.Timeout(connect=5, read=20, write=10, pool=5), **kwargs)
        except (httpx.ConnectError, httpx.ReadTimeout, httpx.WriteTimeout) as e:
            if attempt == attempts - 1: raise
            time.sleep(_backoff(attempt)); continue                 # network failure: retry

        if r.status_code < 400:
            return r                                                # 2xx/3xx success
        if r.status_code in RETRYABLE_STATUS and attempt < attempts - 1:
            wait = float(r.headers.get("retry-after", _backoff(attempt)))   # honour Retry-After on 429/503
            time.sleep(wait); continue
        raise ApiError(r.status_code, r.text)                       # 4xx (except 429) or final failure: don't retry

def _backoff(attempt: int) -> float:
    return min(20.0, (2 ** attempt)) * random.uniform(0.5, 1.0)     # exponential + jitter

with httpx.Client(base_url="https://api.example.com") as client:
    try:
        r = request(client, "GET", "/orders/42")
        print(r.json())
    except ApiError as e:
        if e.status == 404:
            print("order not found")          # a client error: fix the request, don't retry
        elif e.status == 401:
            print("need to re-authenticate")
        else:
            print("gave up:", e)

# Idempotency for a non-idempotent POST that you must be able to retry safely:
#   request(client, "POST", "/payments", headers={"Idempotency-Key": "pay_7f3a9c"}, json=payload)`,
      after: "The classification is the whole point: a 404 is a bug in your request (don't retry), a 503 is the server having a bad moment (do retry), and a POST should only be retried with an idempotency key so you don't charge a card twice."
    },
    mistakes: [
      "Retrying 4xx errors like 400 or 422, which will fail the same way until the request is fixed.",
      "Not retrying 429/503 or network errors, so transient blips become user-visible failures.",
      "Blindly retrying POSTs that create or charge, causing duplicates. Use an idempotency key.",
      "No timeout, so one hung upstream request ties up a worker (or the user) indefinitely.",
      "Treating any non-200 as a generic error, losing the information needed to react correctly (re-auth on 401, back off on 429)."
    ],
    practice: [
      ["Classify as retry or don't-retry: 500, 404, 429, 403, a connection timeout, 201.", "Retry: 500 (often), 429 (after Retry-After), connection timeout. Don't retry: 404 and 403 (fix the request or permissions). 201 is success, nothing to do."],
      ["What's the difference between 401 and 403?", "401 Unauthorized means you aren't authenticated (no valid credentials; log in). 403 Forbidden means you are authenticated but not permitted to do this action or see this resource."],
      ["Why is an idempotency key important when retrying a POST /payments?", "A POST isn't naturally safe to repeat: the first request might have succeeded even though the response was lost. An idempotency key lets the server recognise the retry and return the original result instead of charging again."]
    ]
  },

  "3-2": {
    more: `<p><b>REST models your API as resources</b> (nouns) addressed by URLs, acted on with HTTP methods (verbs). A resource is a thing: a loan, a user, an order. Collections are plural nouns (<code>/loans</code>), individual items add an ID (<code>/loans/42</code>), and sub-resources nest (<code>/loans/42/payments</code>). Keep verbs out of URLs: it's <code>POST /loans</code>, not <code>/createLoan</code>.</p>
<p><b>Methods map to CRUD</b>: <code>GET</code> reads (never changes anything), <code>POST</code> creates (on a collection), <code>PUT</code> replaces an item wholesale, <code>PATCH</code> updates part of an item, <code>DELETE</code> removes it. Two important properties: <b>safe</b> methods (GET) don't modify state; <b>idempotent</b> methods (GET, PUT, DELETE) produce the same result if repeated. POST is neither, which is why retrying it needs care. This matters because networks drop responses, and clients, proxies and crawlers may repeat requests.</p>
<p><b>Query parameters</b> handle variation on reads: filtering (<code>?status=paid</code>), searching (<code>?q=term</code>), sorting (<code>?sort=-created_at</code>), and pagination (<code>?page=2&amp;size=20</code> or a cursor <code>?after=...</code>). Keep them optional with sensible defaults, and cap page sizes.</p>
<p><b>Consistent JSON shapes</b> make clients simple. A list response wraps items in an envelope with pagination info (<code>{"data": [...], "next_cursor": "..."}</code>); an item is the object itself; and errors have a predictable shape (<code>{"error": {"code": "...", "message": "...", "fields": {...}}}</code>) so clients can handle all errors the same way. Use the right status code <i>and</i> a clear body. Be consistent about field naming (snake_case or camelCase, pick one), date formats (ISO 8601), and how you represent money (minor units as integers).</p>
<p><b>Good practices</b>: version the API (<code>/v1/</code>); don't leak internal details or stack traces in errors; validate input and return 422 with field-level messages; and document it (OpenAPI), which some frameworks generate automatically.</p>`,
    example: {
      t: "A clean REST resource with FastAPI: methods, filtering and consistent shapes",
      intro: "One resource done well: list with filtering and cursor pagination, create returning 201, update with PATCH, and a consistent error shape.",
      lang: "python",
      code: `from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

app = FastAPI()

class LoanIn(BaseModel):
    borrower: str = Field(min_length=1, max_length=80)
    amount_paise: int = Field(gt=0)
    tenure_months: int = Field(ge=1, le=360)

class Loan(LoanIn):
    id: int
    status: str = "pending"

DB: dict[int, Loan] = {}
_next = iter(range(1, 10_000))

@app.get("/v1/loans")                                    # list: filter + cursor pagination
def list_loans(status: str | None = None, after: int = 0, limit: int = Query(20, le=100)):
    items = [l for l in DB.values() if l.id > after and (status is None or l.status == status)]
    page = sorted(items, key=lambda l: l.id)[:limit]
    return {"data": page, "next_cursor": page[-1].id if len(page) == limit else None}

@app.post("/v1/loans", status_code=201)                  # create: 201 + the new resource
def create_loan(body: LoanIn):
    loan = Loan(id=next(_next), **body.model_dump())
    DB[loan.id] = loan
    return loan

@app.get("/v1/loans/{loan_id}")
def get_loan(loan_id: int):
    loan = DB.get(loan_id)
    if not loan:
        raise HTTPException(404, "loan not found")
    return loan

class LoanPatch(BaseModel):
    status: str | None = Field(None, pattern="^(pending|approved|rejected|closed)$")

@app.patch("/v1/loans/{loan_id}")                        # partial update
def update_loan(loan_id: int, body: LoanPatch):
    loan = DB.get(loan_id) or _not_found()
    if body.status:
        loan.status = body.status
    return loan

def _not_found(): raise HTTPException(404, "loan not found")

# Consistent error envelope for every error (FastAPI validation errors become 422 automatically)
@app.exception_handler(HTTPException)
def on_http_error(request, exc):
    return JSONResponse(status_code=exc.status_code,
                        content={"error": {"code": exc.status_code, "message": exc.detail}})`,
      after: "Notice the discipline: plural nouns in URLs, methods carrying the verb, 201 for creation, cursor pagination with a cap, and one error shape everywhere. A client written against one endpoint already knows how all of them behave."
    },
    mistakes: [
      "Verbs in URLs (<code>/getLoans</code>, <code>/updateLoan</code>) instead of nouns plus HTTP methods.",
      "Using GET for actions that change state, which breaks caching assumptions and lets crawlers trigger side effects.",
      "Inconsistent response shapes and error formats, forcing clients to special-case every endpoint.",
      "Unbounded list endpoints with no pagination or page-size cap, which melt under large datasets.",
      "Leaking stack traces or internal messages in error responses instead of a clean, safe error shape."
    ],
    practice: [
      ["Design the endpoints for managing blog comments on a post.", "<code>GET /v1/posts/{id}/comments</code> (list), <code>POST /v1/posts/{id}/comments</code> (create), <code>GET /v1/comments/{id}</code>, <code>PATCH /v1/comments/{id}</code> (edit), <code>DELETE /v1/comments/{id}</code>. Nouns, nesting for the relationship, methods for the verbs."],
      ["Which HTTP methods are idempotent, and why does it matter?", "GET, PUT and DELETE are idempotent: repeating them has the same effect as doing them once. It matters because networks drop responses and clients retry; idempotent methods are safe to retry, while POST is not without an idempotency key."],
      ["Should creating a resource return 200 or 201, and what else should the response include?", "201 Created. Include the created resource in the body (so the client gets its new id) and often a <code>Location</code> header pointing at the new resource's URL."]
    ]
  },

  "3-3": {
    more: `<p><b>Some responses can't wait for completion.</b> An AI model generating a long answer, a report that takes 30 seconds, or a live feed of events all benefit from sending data incrementally. Three techniques, increasing in capability:</p>
<ul><li><b>Polling</b>: the client repeatedly asks "is it done yet?". Simple and works everywhere, but wasteful and laggy. Fine for checking a job's status every few seconds. "Long polling" (the server holds the request open until there's news) reduces the waste.</li>
<li><b>Server-Sent Events (SSE)</b>: the server streams a sequence of events to the client over a single long-lived HTTP response, one direction only (server to client). The browser's <code>EventSource</code> handles it natively, including automatic reconnection and resuming from the last event ID. Ideal for streaming LLM tokens, notifications and progress.</li>
<li><b>WebSockets</b>: a full two-way, persistent connection, for when the client also sends frequent messages (chat, collaborative editing, games).</li></ul>
<p><b>The SSE wire format</b> is plain text: each event is one or more <code>data:</code> lines, optionally an <code>id:</code> and <code>event:</code> line, terminated by a <b>blank line</b>. The response has <code>Content-Type: text/event-stream</code>. On the server, you write events as they're produced and flush; on disconnect, stop producing. Send periodic comment lines (<code>: ping</code>) to keep proxies from closing idle connections.</p>
<p><b>Practical concerns</b>: disable response buffering in reverse proxies (Nginx <code>proxy_buffering off</code>), or the client sees nothing until the end; cancel the upstream work when the client disconnects (check for disconnection in the generator) so you stop computing and paying; and include an event ID so clients can resume after a dropped connection (<code>Last-Event-ID</code> header). For <b>streaming uploads and downloads</b>, stream request and response bodies in chunks rather than loading whole files into memory.</p>`,
    example: {
      t: "Streaming progress and results with SSE (FastAPI server + browser client)",
      intro: "A long job streams progress events and a final result to the browser, with reconnection support and cancellation when the client leaves.",
      lang: "python",
      code: `import asyncio, json
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.get("/v1/report/stream")
async def stream_report(request: Request):
    async def events():
        try:
            for step in range(1, 6):
                if await request.is_disconnected():          # client left: stop working (and paying)
                    return
                await asyncio.sleep(1)                        # pretend each step is slow work
                payload = {"step": step, "total": 5, "message": f"Processed section {step}"}
                yield f"id: {step}\\n"                         # id lets the client resume after a drop
                yield f"event: progress\\n"
                yield f"data: {json.dumps(payload)}\\n\\n"       # blank line terminates the event
            yield f"event: done\\n"
            yield f"data: {json.dumps({'url': '/reports/final.pdf'})}\\n\\n"
        except asyncio.CancelledError:
            return
    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})  # tell Nginx not to buffer

# --- Browser client ---
# const es = new EventSource("/v1/report/stream");
# es.addEventListener("progress", (e) => {
#   const { step, total, message } = JSON.parse(e.data);
#   bar.style.width = (step / total * 100) + "%"; status.textContent = message;
# });
# es.addEventListener("done", (e) => { es.close(); showDownload(JSON.parse(e.data).url); });
# es.onerror = () => status.textContent = "reconnecting...";   // EventSource auto-reconnects, sending Last-Event-ID

# Streaming a large download without loading it into memory:
# @app.get("/v1/export")
# def export():
#     def rows():
#         yield "id,name\\n"
#         for r in db.stream_all():  yield f"{r.id},{r.name}\\n"
#     return StreamingResponse(rows(), media_type="text/csv")`,
      after: "The blank line after each <code>data:</code> is what tells the browser an event is complete, and checking <code>is_disconnected()</code> is what stops a long job from running on after the user has closed the tab."
    },
    mistakes: [
      "Forgetting the blank line that terminates each SSE event, so the browser never fires the event.",
      "A reverse proxy buffering the response, so the client sees nothing until the stream ends; disable buffering.",
      "Not detecting client disconnection, so expensive work keeps running after the user leaves.",
      "Using WebSockets for one-directional server-to-client streaming where SSE is simpler and auto-reconnects.",
      "Loading entire large files into memory for upload or download instead of streaming them in chunks."
    ],
    practice: [
      ["When would you choose SSE over WebSockets?", "When data flows only from server to client (streaming LLM tokens, progress, notifications, live feeds). SSE is simpler, runs over plain HTTP, and reconnects automatically. WebSockets are for frequent two-way messaging like chat."],
      ["A client sees the entire streamed response arrive at once at the end, not incrementally. What's the likely cause?", "Response buffering, usually in a reverse proxy (Nginx). Disable it for the stream (<code>proxy_buffering off</code> or the <code>X-Accel-Buffering: no</code> header) and make sure the server flushes each chunk."],
      ["What does the SSE <code>id:</code> field enable?", "Resumption: the browser remembers the last event id and sends it as the <code>Last-Event-ID</code> header when it reconnects, so the server can continue from where the stream was interrupted rather than restarting."]
    ]
  }
});
