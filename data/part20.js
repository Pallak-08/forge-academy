/* Forge Academy lessons: JavaScript, DOM and browser APIs */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 57, id: "javascript-lessons", fills: "javascript", title: "JavaScript", level: 1,
  blurb: "The language of the web, from types to the event loop.",
  lessons: [
    {
      t: "Syntax, types and operators",
      sub: ["let and const", "Primitive types and objects", "Equality: == vs ===", "Truthy and falsy", "Template literals"],
      body: `<p>Declare variables with <b><code>const</code></b> by default and <b><code>let</code></b> when the variable must be reassigned. Both are block-scoped (they exist only inside the nearest <code>{ }</code>). Avoid the old <code>var</code>, which is function-scoped and causes confusing bugs. Note that <code>const</code> prevents reassignment, not mutation: a <code>const</code> array can still be pushed to.</p>
<p>JavaScript has seven <b>primitive types</b>: <code>string</code>, <code>number</code> (one type for integers and decimals, with floating-point quirks like <code>0.1 + 0.2 !== 0.3</code>), <code>bigint</code>, <code>boolean</code>, <code>undefined</code> (declared but not assigned), <code>null</code> (deliberately empty) and <code>symbol</code>. Everything else is an <b>object</b>: plain objects, arrays, functions, dates. Primitives are copied by value; objects are passed by reference, so two variables can point to the same object.</p>
<p><b>Equality</b>: <code>===</code> compares without type conversion; <code>==</code> converts types first, producing surprises like <code>"0" == false</code> being true. Always use <code>===</code> and <code>!==</code>. Objects are equal only if they are the same object: <code>{} === {}</code> is false.</p>
<p><b>Truthy and falsy</b>: in conditions, these values count as false: <code>false</code>, <code>0</code>, <code>""</code>, <code>null</code>, <code>undefined</code>, <code>NaN</code>. Everything else is truthy, including <code>"0"</code>, <code>[]</code> and <code>{}</code>. Use <b><code>??</code></b> (nullish coalescing) for defaults when 0 or an empty string are valid values, and <b><code>?.</code></b> (optional chaining) to read nested properties safely.</p>
<p><b>Template literals</b> use backticks: they allow embedded expressions with <code>\${...}</code> and multi-line strings.</p>`,
      lang: "javascript",
      code: `const user = { name: "Asha", cart: [] };
user.cart.push("book");          // fine: mutating, not reassigning
// user = {};                    // TypeError: Assignment to constant variable
let count = 0;
count += 1;

// Types
typeof 42;          // "number"
typeof "hi";        // "string"
typeof null;        // "object"  (a famous historical bug)
typeof [];          // "object"  -> use Array.isArray([]) instead
0.1 + 0.2;          // 0.30000000000000004 -> for money, store paise as integers

// Value vs reference
let a = 5, b = a; b++;           // a is still 5
const x = { n: 1 }, y = x; y.n = 2;   // x.n is now 2: same object

// Equality
"5" == 5;           // true  (type conversion)
"5" === 5;          // false (use this)
[1] === [1];        // false: different objects

// Truthy / falsy and safer defaults
const qty = 0;
qty || 10;          // 10  (wrong if 0 is valid)
qty ?? 10;          // 0   (only null/undefined fall back)
const city = user.address?.city ?? "unknown";   // no crash if address is missing

// Template literals
const total = 1499;
const msg = \`Hi \${user.name}, your total is Rs \${(total / 100).toFixed(2)}\`;
const html = \`
  <li class="item">\${user.cart.length} item(s)</li>
\`;`,
      ex: "Predict, then check in the browser console, the result of 15 expressions mixing <code>==</code>, <code>===</code>, <code>||</code>, <code>??</code>, <code>?.</code> and typeof (include <code>null == undefined</code>, <code>[] == false</code>, <code>NaN === NaN</code>). Then write a function <code>formatPrice(paise)</code> that returns strings like 'Rs 1,499.00' using a template literal and <code>toLocaleString('en-IN')</code>.",
      q: ["A quantity can legitimately be 0. Which default expression keeps a 0 instead of replacing it?", ["qty || 1", "qty ?? 1", "qty && 1", "!qty ? 1 : qty"], 1, "?? only falls back for null or undefined, while || also replaces falsy values like 0 and the empty string."]
    },
    {
      t: "Functions, scope and closures",
      sub: ["Function declarations and arrows", "Scope and hoisting", "Closures", "this and binding", "Higher-order functions"],
      body: `<p>A <b>function</b> is a named piece of code you can run whenever you want, as many times as you want. You give it some inputs (called <b>parameters</b>), it does some work, and it hands back a result with <code>return</code>. Think of it as a recipe: written once, followed many times, with different ingredients each time.</p>

<h4>Three ways to write a function</h4>
<p>JavaScript lets you write the same function in three shapes, and it helps to know why each exists:</p>
<ul>
<li>A <b>function declaration</b> starts with the word <code>function</code> and a name: <code>function add(a, b) { return a + b; }</code>. This is the classic, readable form for a named piece of logic.</li>
<li>A <b>function expression</b> stores a function in a variable, like any other value: <code>const add = function (a, b) { return a + b; };</code>. The point here is the big idea of this lesson: in JavaScript a function is a <i>value</i> you can save in a variable, pass around, and return from other functions.</li>
<li>An <b>arrow function</b> is a shorter way to write a function expression: <code>const add = (a, b) =&gt; a + b;</code>. With one line and no braces, the result is returned automatically. Arrows are everywhere in modern code because most functions we pass to other functions (callbacks) are short.</li>
</ul>
<p>For now, use whichever reads most clearly. The one real difference that will bite you later — how arrows treat <code>this</code> — we cover below.</p>

<h4>Parameters: defaults and collecting extras</h4>
<p>A parameter can have a <b>default value</b> used when the caller leaves it out: in <code>function greet(name = "friend")</code>, calling <code>greet()</code> gives "friend" while <code>greet("Ada")</code> gives "Ada". If you want a function to accept <i>any number</i> of arguments, the <b>rest parameter</b> <code>...nums</code> gathers them into an array: <code>function total(...nums) { ... }</code> can be called with two numbers or ten, and <code>nums</code> is just a normal array inside.</p>

<h4>Scope: where a variable can be seen</h4>
<p><b>Scope</b> is the answer to "from which parts of my code can I read this variable?" Picture your code as a set of nested boxes. Every pair of curly braces <code>{ }</code> — a function body, an <code>if</code> block, a loop — makes a new box. A variable declared with <code>let</code> or <code>const</code> lives inside the box it was declared in.</p>
<p>The rule is one-directional: <b>inner boxes can see out, but outer boxes cannot see in.</b> Code inside a function can read variables from the function around it and from the top level, but code at the top level cannot read a variable that was declared inside a function. This is what keeps a helper function's temporary variables from leaking out and clashing with the rest of your program.</p>

<h4>Hoisting: why order sometimes matters and sometimes doesn't</h4>
<p>JavaScript reads your whole file before running it, and it treats the two function styles differently. A <b>function declaration</b> is "hoisted": it exists from the moment the file starts, so you can call <code>add(2, 3)</code> on line 1 even if <code>function add</code> is written on line 40. A variable declared with <code>let</code> or <code>const</code> (including an arrow function stored in one) is different: the name is reserved from the top of its box, but you are not allowed to use it until the line that declares it actually runs. That gap is called the <b>temporal dead zone</b>, and touching the variable inside it throws an error. The practical takeaway: declare things before you use them, and this never trips you up.</p>

<h4>Closures: functions that remember</h4>
<p>This is the idea that unlocks a lot of JavaScript, so go slowly. A <b>closure</b> happens when a function remembers the variables from the place where it was created — and keeps remembering them even after that outer function has already finished running.</p>
<p>Here is the intuition. When you define a function <i>inside</i> another function, the inner function can see the outer function's variables (inner box sees out). Normally, when a function finishes, its local variables are thrown away. But if the inner function is still alive out in the world — because you returned it or saved it somewhere — then the variables it needs are kept alive <i>just for it</i>, in a private little backpack only that function can open.</p>
<p>That private backpack is exactly why closures are useful. A <code>makeCounter</code> function can keep a <code>count</code> variable that nothing outside can touch, and hand back functions that read and change it. That is <b>private state</b> with no classes involved. The same mechanism powers factories that pre-fill a value, event handlers that remember which item they belong to, and React's hooks (<code>useState</code> hands you back values from a closure). Whenever you think "this function needs to remember something between calls," a closure is the tool.</p>

<h4><code>this</code>: it depends on who calls the function</h4>
<p>For a regular function, <code>this</code> is <b>not</b> decided by where the function is written — it is decided by <i>how it is called</i>, each time it is called. The rule of thumb: look at what is immediately to the left of the dot at the call site. When you call <code>user.greet()</code>, there is <code>user</code> to the left of the dot, so inside <code>greet</code>, <code>this</code> is <code>user</code>. When you call a plain <code>greet()</code> with nothing to the left, <code>this</code> is <code>undefined</code> (in modern "strict" code).</p>
<p>This causes the most common <code>this</code> bug: you pass a method somewhere as a callback, like <code>setTimeout(user.greet, 1000)</code>. Now there is no <code>user.</code> at the call site — the timer just calls the bare function — so <code>this</code> is lost and the method breaks. Two fixes: <b>arrow functions</b> do not have their own <code>this</code> at all; they borrow it from the surrounding code, which is why an arrow written inside a class method "just works". And <code>someFunction.bind(user)</code> returns a new copy of the function with <code>this</code> permanently locked to <code>user</code>, no matter how it is later called.</p>

<h4>Higher-order functions: passing behaviour around</h4>
<p>Because functions are values, a function can take another function as an input or return one as output. These are called <b>higher-order functions</b>, and you already use them: <code>array.map(fn)</code> runs your <code>fn</code> on every item, <code>array.filter(fn)</code> keeps the items your <code>fn</code> approves, <code>setTimeout(fn, 1000)</code> runs your <code>fn</code> later, and every event listener is a function you hand to the browser. The power is separation: you write <i>what</i> to do (the small function) and the higher-order function decides <i>when</i> and <i>how often</i> to run it. Combined with closures, this is how helpers like <code>debounce</code> and <code>throttle</code> are built.</p>`,
      lang: "javascript",
      code: `// Three ways to write a function
function area(w, h = w) { return w * h; }           // declaration, default parameter
const perimeter = function (w, h) { return 2 * (w + h); };
const double = (n) => n * 2;                         // arrow
const sum = (...nums) => nums.reduce((t, n) => t + n, 0);

// Closures: private state
function makeCounter() {
  let count = 0;                                     // not reachable from outside
  return { inc: () => ++count, value: () => count };
}
const c = makeCounter(); c.inc(); c.inc();
c.value();                                           // 2

// Closure as a factory
const makeGreeter = (greeting) => (name) => \`\${greeting}, \${name}!\`;
const hello = makeGreeter("Namaste");
hello("Ravi");                                       // "Namaste, Ravi!"

// this: lost when a method is passed around
const timer = {
  seconds: 0,
  startBroken() { setInterval(function () { this.seconds++; }, 1000); },  // this is not timer
  start()       { setInterval(() => { this.seconds++; }, 1000); },        // arrow keeps timer's this
};

// Higher-order function: debounce (run only after the user stops typing for 300 ms)
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);           // closure over t, fn and ms
  };
}
const search = debounce((q) => console.log("searching", q), 300);
// input.addEventListener("input", (e) => search(e.target.value));`,
      ex: "Write: (1) a <code>once(fn)</code> that lets a function run only the first time it's called; (2) a <code>memoize(fn)</code> that caches results by argument; (3) a <code>throttle(fn, ms)</code>. Use each in a small page (a 'subscribe' button with once, a slow calculation with memoize, a scroll handler with throttle) and explain which closure variables each one relies on.",
      q: ["Why does setInterval(function () { this.seconds++ }) inside an object method fail, while an arrow function works?", ["Arrow functions run faster", "A regular function called by setInterval gets its own this (not the object); an arrow function uses the this of the surrounding method", "setInterval only accepts arrows", "this doesn't exist in JavaScript"], 1, "this is set by how a regular function is called. Arrow functions don't bind their own this, so they keep the method's this."]
    },
    {
      t: "Objects, arrays and data handling",
      sub: ["Destructuring and spread", "map, filter, reduce, find", "Sets and Maps", "JSON", "Immutability habits"],
      body: `<p><b>Destructuring</b> pulls values out of objects and arrays into variables: <code>const { name, email } = user</code>, with renaming, defaults and nesting. <b>Spread</b> (<code>...</code>) copies: <code>[...list, item]</code> creates a new array with an extra item; <code>{ ...user, name: "New" }</code> creates a new object with one property changed. Spread copies are <b>shallow</b>: nested objects are still shared (use <code>structuredClone</code> for a deep copy).</p>
<p>Array methods replace most loops and read like a description of the result:</p>
<ul><li><code>map</code>: transform every item (returns a new array of the same length).</li>
<li><code>filter</code>: keep items that pass a test.</li>
<li><code>find</code> / <code>findIndex</code>: the first match; <code>some</code> / <code>every</code>: booleans.</li>
<li><code>reduce</code>: combine all items into one value (a total, an object grouped by key).</li>
<li><code>toSorted</code>, <code>toReversed</code>, <code>with</code>: new non-mutating versions of <code>sort</code>, <code>reverse</code> and index assignment.</li></ul>
<p><b>Set</b> stores unique values (fast de-duplication and membership checks). <b>Map</b> is a key-value store that accepts any key type, keeps insertion order and has a <code>size</code>; prefer it to plain objects for dynamic lookups.</p>
<p><b>JSON</b>: <code>JSON.stringify</code> turns data into a string and <code>JSON.parse</code> back. Dates become strings, and functions and <code>undefined</code> are dropped. Wrap <code>JSON.parse</code> of untrusted input in try/catch.</p>
<p><b>Immutability habits</b>: create new arrays and objects instead of changing existing ones. Frameworks like React detect changes by reference, and immutable updates make bugs from shared, silently changed data much rarer.</p>`,
      lang: "javascript",
      code: `const orders = [
  { id: 1, customer: "Asha", total: 1499, status: "paid",     items: ["book"] },
  { id: 2, customer: "Ravi", total: 899,  status: "refunded", items: ["pen", "ink"] },
  { id: 3, customer: "Asha", total: 2499, status: "paid",     items: ["lamp"] },
];

// Destructuring
const [first] = orders;
const { customer, total: amount, coupon = "NONE" } = first;     // rename + default

// map / filter / reduce / find
const paid = orders.filter((o) => o.status === "paid");
const totals = paid.map((o) => o.total);                        // [1499, 2499]
const revenue = paid.reduce((sum, o) => sum + o.total, 0);      // 3998
const big = orders.find((o) => o.total > 2000);                 // order 3
const byCustomer = orders.reduce((acc, o) => {
  (acc[o.customer] ??= []).push(o.id);
  return acc;
}, {});                                                         // { Asha: [1, 3], Ravi: [2] }
Object.groupBy(orders, (o) => o.status);                        // modern built-in grouping

// Set and Map
const allItems = new Set(orders.flatMap((o) => o.items));       // unique items
const priceCache = new Map([["book", 499]]);
priceCache.set("pen", 49); priceCache.has("pen"); priceCache.size;

// Immutable updates (what React state needs)
const updated = orders.map((o) => (o.id === 2 ? { ...o, status: "paid" } : o));
const added = [...orders, { id: 4, customer: "Mira", total: 299, status: "paid", items: [] }];
const sorted = orders.toSorted((a, b) => b.total - a.total);    // original untouched

// JSON round trip
const text = JSON.stringify({ orders: paid }, null, 2);
let data;
try { data = JSON.parse(text); } catch { data = null; }`,
      ex: "Given an array of 20 student records (name, branch, year, marks in 5 subjects), write functions using only array methods: average marks per student, the topper in each branch, the list of unique branches, students grouped by year, and an immutable update that adds 5 grace marks in one subject for one student. Log the original array afterwards to prove it didn't change.",
      q: ["const copy = { ...user }; copy.address.city = 'Pune'; What happens to user.address.city?", ["It stays unchanged", "It also becomes 'Pune', because spread makes a shallow copy and address is still the same shared object", "It throws an error", "It becomes undefined"], 1, "Spread copies only the top level. Nested objects are shared by reference; use structuredClone or copy nested levels explicitly."]
    },
    {
      t: "The event loop and asynchronous JavaScript",
      sub: ["Call stack, task queue, microtasks", "Callbacks to promises to async/await", "Promise.all and Promise.race", "Error handling in async code"],
      body: `<p>JavaScript runs on a <b>single thread</b>: one piece of code at a time. It stays responsive by handing slow work (timers, network requests, file reads) to the browser or Node, and continuing with other code. When the slow work finishes, its callback is queued.</p>
<p>The <b>event loop</b> coordinates this: run everything on the <b>call stack</b> until it's empty; then run <i>all</i> queued <b>microtasks</b> (promise callbacks, <code>await</code> continuations); then take one <b>task</b> from the task queue (timers, events, I/O), and repeat (browsers render between tasks). That's why a promise callback runs before a <code>setTimeout(..., 0)</code> callback, and why a long loop freezes the page: nothing else can run until it finishes.</p>
<p>Async code evolved from <b>callbacks</b> (nesting gets messy: "callback hell"), to <b>promises</b> (objects representing a future value, chained with <code>.then</code> and <code>.catch</code>), to <b><code>async</code>/<code>await</code></b>, which lets async code read top to bottom. An <code>async</code> function always returns a promise; <code>await</code> pauses that function (not the whole program) until the promise settles.</p>
<p>Running things <b>in parallel</b>: awaiting in a loop runs requests one after another. Start them together and use <code>Promise.all</code> (fails fast if any reject), <code>Promise.allSettled</code> (wait for all, see each result), <code>Promise.race</code> (first to settle, useful for timeouts) or <code>Promise.any</code> (first to succeed).</p>
<p><b>Errors</b>: wrap <code>await</code> in try/catch; remember <code>fetch</code> only rejects on network failure, so check <code>response.ok</code> for HTTP errors; never leave promises without error handling (unhandled rejections can crash Node).</p>`,
      lang: "javascript",
      code: `// Event loop order
console.log("1 sync");
setTimeout(() => console.log("4 task (timer)"), 0);
Promise.resolve().then(() => console.log("3 microtask (promise)"));
console.log("2 sync");
// prints 1, 2, 3, 4

// From callbacks to async/await
async function getJSON(url, { timeoutMs = 8000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(\`HTTP \${res.status} for \${url}\`);   // fetch doesn't reject on 404/500
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Sequential (slow): each waits for the previous
async function loadSlow(ids) {
  const users = [];
  for (const id of ids) users.push(await getJSON(\`/api/users/\${id}\`));
  return users;
}

// Parallel (fast): start all, then wait
async function loadFast(ids) {
  return Promise.all(ids.map((id) => getJSON(\`/api/users/\${id}\`)));
}

// Keep partial results when some fail
async function loadDashboard() {
  const [stats, news, weather] = await Promise.allSettled([
    getJSON("/api/stats"), getJSON("/api/news"), getJSON("/api/weather"),
  ]);
  return {
    stats: stats.status === "fulfilled" ? stats.value : null,
    news: news.status === "fulfilled" ? news.value : [],
    weatherError: weather.status === "rejected" ? weather.reason.message : null,
  };
}

// Error handling at the call site
try {
  const user = await getJSON("/api/me");
} catch (err) {
  console.error("Could not load profile:", err.message);
}`,
      ex: "Using a public API (for example jsonplaceholder.typicode.com), load 10 posts and their authors: first sequentially, then in parallel with Promise.all, and time both. Add a timeout with AbortController, handle a 404 properly, and use Promise.allSettled to show a page section even when one request fails. Then predict and verify the output order of a snippet mixing setTimeout, promises and await.",
      q: ["In what order do these log? console.log('A'); setTimeout(() => console.log('B')); Promise.resolve().then(() => console.log('C')); console.log('D')", ["A B C D", "A D C B", "A C D B", "A D B C"], 1, "Synchronous code runs first (A, D), then all microtasks (C), then the next task from the queue (B)."]
    },
    {
      t: "Modules, classes and error handling",
      sub: ["ES modules: import and export", "Classes and prototypes", "try / catch / finally", "Custom errors"],
      body: `<p><b>ES modules</b> split code into files with explicit dependencies. A file exports what others may use (<b>named exports</b>: <code>export function formatPrice()</code>; or one <b>default export</b>), and other files <code>import</code> it. Modules have their own scope (no accidental globals), run in strict mode and load once. In browsers, use <code>&lt;script type="module"&gt;</code>; in Node, <code>"type": "module"</code> in package.json. <code>import()</code> loads a module dynamically when needed, which bundlers use for code splitting. Prefer named exports: they're easier to search and refactor.</p>
<p><b>Classes</b> are syntax over JavaScript's <b>prototype</b> system: objects inherit methods from a prototype object. A class has a <code>constructor</code>, methods, getters, static members and <b>private fields</b> (<code>#balance</code>, truly inaccessible from outside). <code>extends</code> and <code>super</code> handle inheritance. Many modern codebases use plain functions and objects more than classes, but classes are common for errors, SDK clients and models.</p>
<p><b>try / catch / finally</b>: <code>try</code> runs code that may throw; <code>catch</code> handles the error; <code>finally</code> always runs (close connections, hide spinners). Only catch errors you can handle meaningfully; otherwise let them propagate to a top-level handler that logs them and shows a friendly message. Never swallow errors silently with an empty catch.</p>
<p><b>Custom errors</b> subclass <code>Error</code> to carry meaning and data (<code>ValidationError</code> with field names, <code>NotFoundError</code>, <code>HttpError</code> with a status), so callers can react with <code>instanceof</code>. The <code>cause</code> option wraps a lower-level error without losing it.</p>`,
      lang: "javascript",
      code: `// money.js : named exports
export function formatINR(paise) {
  return (paise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });
}
export const GST_RATE = 0.18;

// errors.js : custom errors
export class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options);           // options.cause keeps the original error
    this.name = "HttpError";
    this.status = status;
  }
}
export class ValidationError extends Error {
  constructor(fields) {
    super("Invalid input: " + Object.keys(fields).join(", "));
    this.name = "ValidationError";
    this.fields = fields;              // { email: "Enter a valid email" }
  }
}

// wallet.js : a class with private state
export class Wallet {
  #balance = 0;                        // private field
  static MAX = 100_000_00;             // static: Wallet.MAX
  get balance() { return this.#balance; }
  deposit(paise) {
    if (!Number.isInteger(paise) || paise <= 0) throw new ValidationError({ amount: "Must be a positive whole number" });
    if (this.#balance + paise > Wallet.MAX) throw new RangeError("Wallet limit exceeded");
    this.#balance += paise;
    return this;
  }
}

// app.js
import { formatINR } from "./money.js";
import { Wallet } from "./wallet.js";
import { ValidationError } from "./errors.js";

const w = new Wallet();
try {
  w.deposit(50000).deposit(-5);
} catch (err) {
  if (err instanceof ValidationError) showFieldErrors(err.fields);   // handle what we understand
  else throw err;                                                   // let others propagate
} finally {
  console.log("Balance:", formatINR(w.balance));                   // Balance: ₹500.00
}
// w.#balance   -> SyntaxError: private field

// Load heavy code only when needed
const { renderChart } = await import("./chart.js");`,
      ex: "Refactor a single-file script into ES modules: a utils module with named exports, a class with private fields and validation, and an errors module with two custom error classes. Load it in the browser with <code>type=\"module\"</code>, handle each error type differently in the UI, and lazy-load one heavy module with dynamic import when a button is clicked.",
      q: ["Why is an empty catch block (catch (e) {}) considered harmful?", ["It slows the code down", "It hides errors silently, so bugs go unnoticed and are much harder to diagnose", "It's a syntax error", "It catches only TypeErrors"], 1, "Errors carry information about what went wrong. Handle them, log them, or rethrow; never discard them silently."]
    }
  ]
});

COURSE.push({
  n: 58, id: "dom-lessons", fills: "dom", title: "DOM, events and browser APIs", level: 1,
  blurb: "Events, storage, network and observer APIs, and state-driven rendering by hand.",
  lessons: [
    {
      t: "Events in depth",
      sub: ["Bubbling and capturing", "Event delegation", "Keyboard and pointer events", "Custom events"],
      body: `<p>When you click an element, the event travels in three phases: <b>capturing</b> down from <code>window</code> to the target, the <b>target</b> phase, then <b>bubbling</b> back up through every ancestor. Listeners run during bubbling by default (pass <code>{ capture: true }</code> to run on the way down). <code>event.target</code> is the element that was actually clicked; <code>event.currentTarget</code> is the element whose listener is running. <code>stopPropagation()</code> stops the journey (use sparingly); <code>preventDefault()</code> cancels the browser's default action, such as following a link or submitting a form.</p>
<p><b>Event delegation</b> uses bubbling: attach <i>one</i> listener to a parent and check <code>event.target.closest(selector)</code> to see which child was clicked. It works for elements added later, uses less memory than hundreds of listeners, and is how you handle dynamic lists.</p>
<p><b>Keyboard events</b>: use <code>keydown</code>, and read <code>event.key</code> (<code>"Enter"</code>, <code>"Escape"</code>, <code>"ArrowDown"</code>, <code>"k"</code>) with modifier flags (<code>ctrlKey</code>, <code>metaKey</code>, <code>shiftKey</code>). Don't break normal keyboard behaviour; native buttons and links already respond to Enter and Space.</p>
<p><b>Pointer events</b> (<code>pointerdown</code>, <code>pointermove</code>, <code>pointerup</code>) unify mouse, touch and pen, which is ideal for drag, draw and swipe interactions. Use <code>setPointerCapture</code> to keep receiving moves while dragging outside the element. Mark scroll and touch listeners <code>{ passive: true }</code> when they don't call preventDefault, so scrolling stays smooth.</p>
<p><b>Custom events</b> (<code>new CustomEvent("cart:updated", { detail, bubbles: true })</code>) let components announce things without knowing who listens, a simple way to decouple parts of a page.</p>`,
      lang: "javascript",
      code: `// Event delegation: one listener handles every row, including rows added later
const list = document.querySelector("#todo-list");
list.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn || !list.contains(btn)) return;
  const id = btn.closest("li").dataset.id;
  if (btn.dataset.action === "delete") removeTodo(id);
  if (btn.dataset.action === "toggle") toggleTodo(id);
});

// preventDefault: handle the form ourselves
document.querySelector("#todo-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = new FormData(e.currentTarget).get("text").trim();
  if (text) addTodo(text);
  e.currentTarget.reset();
});

// Keyboard shortcut: Ctrl/Cmd + K opens search, Escape closes it
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
  if (e.key === "Escape") closeSearch();
});

// Pointer events: drag a card with mouse, touch or pen
const card = document.querySelector(".draggable");
card.addEventListener("pointerdown", (e) => {
  card.setPointerCapture(e.pointerId);
  const startX = e.clientX - card.offsetLeft, startY = e.clientY - card.offsetTop;
  const move = (ev) => { card.style.translate = \`\${ev.clientX - startX}px \${ev.clientY - startY}px\`; };
  card.addEventListener("pointermove", move);
  card.addEventListener("pointerup", () => card.removeEventListener("pointermove", move), { once: true });
});

// Custom events: the cart announces changes; the header badge listens
function addToCart(item) {
  cart.push(item);
  document.dispatchEvent(new CustomEvent("cart:updated", { detail: { count: cart.length } }));
}
document.addEventListener("cart:updated", (e) => {
  document.querySelector("#cart-count").textContent = e.detail.count;
});

window.addEventListener("scroll", onScroll, { passive: true });   // smooth scrolling`,
      ex: "Build a to-do list with event delegation (add, toggle, delete, edit on double-click) where items are added dynamically, keyboard shortcuts (n for new, Escape to cancel editing), and a custom event that updates a 'remaining' counter elsewhere on the page. Add a draggable sticky note using pointer events and test it with touch in DevTools device mode.",
      q: ["Why use event delegation for a list whose items are added and removed often?", ["It makes clicks faster", "One listener on the parent handles all current and future items via bubbling, with no need to attach or clean up listeners per item", "Items can't have their own listeners", "It prevents bubbling"], 1, "Delegation relies on events bubbling to the parent, so it automatically covers items created after the listener was attached."]
    },
    {
      t: "Browser storage and APIs",
      sub: ["localStorage, sessionStorage, IndexedDB", "Cookies", "Fetch, AbortController", "Intersection and Resize observers"],
      body: `<p>Browsers offer several places to keep data:</p>
<ul><li><b>localStorage</b>: simple string key-value storage (about 5 MB per origin) that persists across sessions. Good for preferences, drafts and small caches. It's synchronous and stores strings only, so use JSON, and wrap access in try/catch because it can be full or blocked in private mode.</li>
<li><b>sessionStorage</b>: the same API, but cleared when the tab closes and separate per tab.</li>
<li><b>IndexedDB</b>: an asynchronous database for larger, structured data (offline apps, cached API responses, files). Its raw API is verbose; the small <code>idb</code> library makes it pleasant.</li>
<li><b>Cookies</b>: small values sent to the server with every request. Mainly for server sessions; set them from the server with HttpOnly, Secure and SameSite.</li></ul>
<p>Never store secrets or authentication tokens in localStorage if you can avoid it: any XSS bug can read it. HttpOnly cookies are safer for sessions.</p>
<p><b>Fetch</b> makes HTTP requests: set method, headers and a JSON body; check <code>response.ok</code>; and use an <b>AbortController</b> to cancel requests, for example when the user types a new search query before the previous one returns, or on a timeout.</p>
<p><b>Observers</b> replace expensive polling and scroll handlers: <b>IntersectionObserver</b> tells you when an element enters or leaves the viewport (lazy loading, infinite scroll, reveal animations, analytics for "seen"); <b>ResizeObserver</b> tells you when an element's size changes (responsive charts and components); <b>MutationObserver</b> watches DOM changes.</p>`,
      lang: "javascript",
      code: `// Safe localStorage helpers
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* full or blocked: ignore */ }
  },
};
store.set("prefs", { theme: "dark", pageSize: 20 });
const prefs = store.get("prefs", { theme: "light", pageSize: 10 });

// Search-as-you-type: cancel the previous request when a new one starts
let controller;
async function search(q) {
  controller?.abort();
  controller = new AbortController();
  try {
    const res = await fetch(\`/api/search?q=\${encodeURIComponent(q)}\`, { signal: controller.signal });
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    renderResults(await res.json());
  } catch (err) {
    if (err.name !== "AbortError") showError(err.message);   // aborts are expected, not errors
  }
}

// POST JSON
await fetch("/api/notes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Hello", body: "..." }),
  credentials: "include",                                   // send cookies to the API
});

// Infinite scroll with IntersectionObserver
const sentinel = document.querySelector("#load-more-sentinel");
const io = new IntersectionObserver(async ([entry]) => {
  if (entry.isIntersecting) await loadNextPage();
}, { rootMargin: "400px" });                                // start loading before the user reaches the end
io.observe(sentinel);

// Redraw a chart only when its container actually changes size
const ro = new ResizeObserver(([entry]) => drawChart(entry.contentRect.width));
ro.observe(document.querySelector("#chart"));`,
      ex: "Build a notes app that saves drafts to localStorage as you type, stores saved notes in IndexedDB (using the idb library), has a search box that cancels stale requests to a mock API with AbortController, loads more notes with an IntersectionObserver as you scroll, and resizes a small chart with ResizeObserver. Test it in a private window where storage may be restricted.",
      q: ["Why is localStorage a risky place for authentication tokens?", ["It's too small", "Any JavaScript on the page, including injected scripts from an XSS bug, can read it", "It's cleared on every page load", "Servers can't read it"], 1, "localStorage has no HttpOnly equivalent. HttpOnly cookies keep session tokens away from page scripts."]
    },
    {
      t: "Rendering lists and state by hand",
      sub: ["Keeping state in one object", "Re-rendering from state", "Templates", "Safe rendering vs innerHTML"],
      body: `<p>Before reaching for a framework, it's worth building UI the way frameworks do it under the hood, because it explains why they exist.</p>
<p>The common beginner approach scatters data across the DOM: read values from elements, change elements directly from many event handlers. It quickly becomes inconsistent (the counter says 3, the list shows 4). The fix is to keep <b>state in one object</b> as the single source of truth: <code>{ todos: [...], filter: "all" }</code>.</p>
<p>Then <b>render from state</b>: one <code>render()</code> function builds the UI from the current state, and every event handler only <i>updates state</i> and calls <code>render()</code>. UI = f(state). This is exactly React's mental model; React adds efficient DOM updates (reconciliation), components and hooks.</p>
<p>For repeated markup, the <b><code>&lt;template&gt;</code></b> element holds inert HTML you clone for each item, filling in content with <code>textContent</code>. Alternatively build elements with <code>document.createElement</code>.</p>
<p><b>Safe rendering</b>: building HTML strings with user data and assigning them to <code>innerHTML</code> creates XSS vulnerabilities, since a to-do item named <code>&lt;img src=x onerror=...&gt;</code> would run code. Use <code>textContent</code> for user data, or escape it. <code>innerHTML</code> is acceptable only with static or properly escaped content. Also note that re-rendering everything with <code>innerHTML</code> loses focus and scroll position in inputs, one more reason frameworks diff the DOM instead.</p>`,
      lang: "html",
      code: `<form id="add"><input name="text" aria-label="New task" required><button>Add</button></form>
<nav id="filters">
  <button data-filter="all">All</button><button data-filter="open">Open</button><button data-filter="done">Done</button>
</nav>
<ul id="list"></ul>
<p id="summary"></p>

<template id="item-tpl">
  <li><label><input type="checkbox"> <span class="text"></span></label>
      <button class="del" aria-label="Delete">×</button></li>
</template>

<script type="module">
  // 1. Single source of truth
  const state = { todos: JSON.parse(localStorage.getItem("todos") || "[]"), filter: "all" };

  // 2. Every change goes through one function, then re-renders
  function update(change) {
    change(state);
    localStorage.setItem("todos", JSON.stringify(state.todos));
    render();
  }

  // 3. UI = f(state)
  const list = document.querySelector("#list"), tpl = document.querySelector("#item-tpl");
  function render() {
    const visible = state.todos.filter((t) =>
      state.filter === "all" ? true : state.filter === "done" ? t.done : !t.done);
    list.replaceChildren(...visible.map((t) => {
      const li = tpl.content.firstElementChild.cloneNode(true);
      li.dataset.id = t.id;
      li.querySelector(".text").textContent = t.text;        // safe: never innerHTML with user text
      li.querySelector("input").checked = t.done;
      return li;
    }));
    const open = state.todos.filter((t) => !t.done).length;
    document.querySelector("#summary").textContent = \`\${open} open of \${state.todos.length}\`;
    document.querySelectorAll("[data-filter]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.filter === state.filter)));
  }

  // 4. Handlers only update state
  document.querySelector("#add").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    update((s) => s.todos.push({ id: crypto.randomUUID(), text, done: false }));
    e.target.reset();
  });
  list.addEventListener("change", (e) => {
    const id = e.target.closest("li").dataset.id;
    update((s) => { const t = s.todos.find((x) => x.id === id); t.done = !t.done; });
  });
  list.addEventListener("click", (e) => {
    if (!e.target.matches(".del")) return;
    const id = e.target.closest("li").dataset.id;
    update((s) => { s.todos = s.todos.filter((x) => x.id !== id); });
  });
  document.querySelector("#filters").addEventListener("click", (e) => {
    if (e.target.dataset.filter) update((s) => { s.filter = e.target.dataset.filter; });
  });
  render();
</script>`,
      ex: "Build a small shopping cart page by hand with this pattern: one state object (products, cart lines, coupon), a single render function using a template element, handlers that only update state, and persistence to localStorage. Then try adding a product named <code>&lt;img src=x onerror=alert(1)&gt;</code> and confirm it shows as text. Finally write a paragraph on what was painful and how React would help.",
      q: ["In the 'UI = f(state)' pattern, what should an event handler do?", ["Directly edit several DOM elements", "Update the state object, then call the single render function", "Reload the page", "Store data in data-attributes only"], 1, "Keeping one source of truth and re-rendering from it prevents the UI and data from drifting out of sync."]
    }
  ]
});
