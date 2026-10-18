/* Forge Academy course data, module 26: modern frontend (TypeScript, React, Next.js) */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 26, id: "frontend-modern", title: "Modern frontend: TypeScript, React and Next.js", level: 2,
  blurb: "How professional frontends are built today: typed JavaScript, a modern toolchain, React components and state, routing and data, design systems, server rendering, testing and performance.",
  saas: "SaaSForge's generated apps deliberately use vanilla JavaScript with no build step. Most companies use the stack in this module instead; knowing both lets you choose.",
  lessons: [
    {
      t: "TypeScript essentials",
      sub: ["Why types: catching bugs before running", "Primitive types, arrays, objects, unions, literals", "type vs interface", "Generics", "Narrowing with typeof, in and discriminated unions", "Typing API responses safely"],
      body: `<p><b>TypeScript</b> is JavaScript with types. The compiler checks your code before it runs and your editor autocompletes everything, so a whole class of bugs ("undefined is not a function", a misspelled property) never reach users.</p>
<p>Describe the shape of data with <code>type</code> or <code>interface</code>. Use <b>union</b> types for values that can be one of several things, and <b>narrow</b> them with checks so TypeScript knows which case you are in. Data from an API is unknown at run time, so validate it (for example with zod) instead of just asserting a type.</p>`,
      lang: "typescript",
      code: `type Status = "todo" | "doing" | "done";          // literal union

interface Task {
  id: number;
  title: string;
  status: Status;
  dueDate?: string;                               // optional
}

function countBy<T, K extends string>(items: T[], key: (item: T) => K): Record<K, number> {
  return items.reduce((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {} as Record<K, number>);
}

const tasks: Task[] = [
  { id: 1, title: "Write tests", status: "doing" },
  { id: 2, title: "Ship v1", status: "todo", dueDate: "2026-11-01" },
];
console.log(countBy(tasks, (t) => t.status));     // { doing: 1, todo: 1 }

type Result<T> = { ok: true; data: T } | { ok: false; error: string };  // discriminated union

async function getTasks(): Promise<Result<Task[]>> {
  try {
    const res = await fetch("/api/tasks");
    if (!res.ok) return { ok: false, error: \`HTTP \${res.status}\` };
    return { ok: true, data: (await res.json()) as Task[] };
  } catch (e) {
    return { ok: false, error: "Network error" };
  }
}

const r = await getTasks();
if (r.ok) console.log(r.data.length);             // TypeScript knows data exists here
else console.error(r.error);`,
      ex: "Model a shopping cart in TypeScript: <code>Product</code>, <code>CartItem</code> and a <code>Cart</code> type, plus functions <code>addItem</code>, <code>removeItem</code> and <code>total</code>. Turn on <code>strict</code> and make it compile with no <code>any</code>.",
      q: ["What does narrowing do?", ["Makes code run faster", "Lets TypeScript know which member of a union a value is after a check", "Removes types at run time", "Shortens variable names"], 1, "After a check like if (r.ok), TypeScript narrows the union to the matching case."]
    },
    {
      t: "Modern tooling: npm, Vite, ESLint and Prettier",
      sub: ["package.json, dependencies and lock files", "npm scripts", "Vite: dev server and production builds", "Environment variables in the browser", "ESLint and Prettier", "What a bundle is"],
      body: `<p>A modern frontend project is a folder with a <b>package.json</b> that lists dependencies and scripts. <code>npm install</code> downloads dependencies into <code>node_modules</code> and the <b>lock file</b> pins exact versions so every machine installs the same thing.</p>
<p><b>Vite</b> gives you an instant dev server with hot reload, and <code>npm run build</code> bundles and minifies your code into a small <code>dist/</code> folder you can deploy anywhere. <b>ESLint</b> finds bugs and bad patterns; <b>Prettier</b> formats code so a team never argues about style. Anything in a browser bundle is public: never put secrets in frontend environment variables.</p>`,
      lang: "bash",
      code: `npm create vite@latest shop -- --template react-ts
cd shop && npm install
npm run dev                      # http://localhost:5173 with hot reload

npm install @tanstack/react-query zod
npm install -D eslint prettier vitest @testing-library/react

# package.json (excerpt)
# "scripts": {
#   "dev": "vite",
#   "build": "tsc -b && vite build",
#   "preview": "vite preview",
#   "lint": "eslint .",
#   "format": "prettier --write .",
#   "test": "vitest"
# }

echo 'VITE_API_URL=http://localhost:8000' > .env.local
# in code: import.meta.env.VITE_API_URL   (public! no secrets)

npm run build && ls -lh dist/assets   # see the bundle sizes`,
      ex: "Create a Vite + React + TypeScript project, add ESLint and Prettier, a <code>VITE_API_URL</code> variable, and a <code>check</code> script that runs lint, type-check and tests. Build it and note the size of the JavaScript bundle.",
      q: ["Why commit the lock file (package-lock.json)?", ["It speeds up the build", "So every install gets the exact same dependency versions", "npm requires it to run", "It stores secrets"], 1, "Lock files make installs reproducible across machines and CI."]
    },
    {
      t: "React fundamentals: components, props and state",
      sub: ["Components and JSX", "Props: passing data down", "State with useState", "Events and controlled inputs", "Lists and keys", "Conditional rendering and lifting state up"],
      body: `<p>React builds interfaces from <b>components</b>: functions that take <b>props</b> and return JSX describing what to show. When <b>state</b> changes (via <code>useState</code>), React re-renders the component and updates the page for you.</p>
<p>Keep each piece of state in the closest common parent of the components that need it (<b>lifting state up</b>), and pass it down as props. Give list items a stable <code>key</code> so React can track them.</p>`,
      lang: "javascript",
      code: `import { useState } from "react";

function ProductCard({ product, onAdd }) {
  return (
    <article className="card">
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button onClick={() => onAdd(product)}>Add to cart</button>
    </article>
  );
}

export default function Shop({ products }) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);              // lifted: header and list both need it

  const visible = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  const add = (p) => setCart((items) => [...items, p]);   // never mutate state directly

  return (
    <>
      <header>Cart: {cart.length} items</header>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
      {visible.length === 0 ? (
        <p>No products match "{query}".</p>
      ) : (
        <div className="grid">
          {visible.map((p) => <ProductCard key={p.id} product={p} onAdd={add} />)}
        </div>
      )}
    </>
  );
}`,
      ex: "Build a product catalogue with at least four components: search, category filter, product grid and a cart with quantity +/− buttons and a total. Keep cart state in one place.",
      q: ["Why use setCart(items => [...items, p]) instead of cart.push(p)?", ["push is slower", "React only re-renders when state is replaced with a new value; mutating does not trigger it", "push is not valid JavaScript", "To save memory"], 1, "React compares references; mutation keeps the same array, so no update happens."]
    },
    {
      t: "Effects, custom hooks and data fetching",
      sub: ["What useEffect is for (syncing with the outside world)", "Dependency arrays and cleanup", "Common effect mistakes", "Custom hooks", "Data fetching with TanStack Query: loading, errors, caching", "Mutations and refetching"],
      body: `<p><code>useEffect</code> runs code after render to sync with something outside React: a timer, a subscription, the document title. Return a cleanup function to undo it. If you are only computing a value from props or state, you do not need an effect at all.</p>
<p>For server data, use a library such as <b>TanStack Query</b>. It handles loading and error states, caching, retries and refetching, which is a lot of subtle code to write correctly yourself. Package reusable logic in <b>custom hooks</b> (functions starting with <code>use</code>).</p>`,
      lang: "javascript",
      code: `import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useDebounce(value, delay = 300) {      // custom hook
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);                       // cleanup on change/unmount
  }, [value, delay]);
  return debounced;
}

const api = (path, opts) => fetch(import.meta.env.VITE_API_URL + path, opts).then((r) => {
  if (!r.ok) throw new Error("Request failed: " + r.status);
  return r.json();
});

export function Products({ query }) {
  const q = useDebounce(query);
  const { data, isPending, error } = useQuery({
    queryKey: ["products", q],
    queryFn: () => api("/products?q=" + encodeURIComponent(q)),
    staleTime: 60_000,                                   // cache for a minute
  });
  const client = useQueryClient();
  const remove = useMutation({
    mutationFn: (id) => api("/products/" + id, { method: "DELETE" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["products"] }),
  });

  if (isPending) return <p>Loading…</p>;
  if (error) return <p role="alert">Could not load products. {error.message}</p>;
  if (!data.items.length) return <p>No products yet.</p>;
  return <ul>{data.items.map((p) => (
    <li key={p.id}>{p.name} <button onClick={() => remove.mutate(p.id)}>Delete</button></li>
  ))}</ul>;
}`,
      ex: "Connect your catalogue to a real API (your own or a public one) with TanStack Query. Add debounced search, loading and error states, and a delete mutation that refreshes the list.",
      q: ["When do you NOT need useEffect?", ["To subscribe to a WebSocket", "To compute a filtered list from props and state", "To set a timer", "To sync the page title"], 1, "Derived values can be computed during render; effects are for external systems."]
    },
    {
      t: "Routing and state management",
      sub: ["Client-side routing with React Router", "Route parameters and nested layouts", "Protected routes", "Context for app-wide values", "Zustand for global client state", "Server state vs client state"],
      body: `<p>A single-page app still needs URLs for each screen so the back button, bookmarks and sharing work. <b>React Router</b> maps paths to components, reads parameters like <code>/products/:id</code>, and supports layouts and protected routes.</p>
<p>Not all state is equal. <b>Server state</b> (products, users) belongs in TanStack Query. <b>Client state</b> shared across the app (cart, theme, the signed-in user) can live in Context or a small store like <b>Zustand</b>. Keep everything else local to components.</p>`,
      lang: "javascript",
      code: `import { createBrowserRouter, RouterProvider, Navigate, Outlet, useParams } from "react-router-dom";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCart = create(persist((set, get) => ({
  items: [],
  add: (p) => set({ items: [...get().items, p] }),
  remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  total: () => get().items.reduce((s, i) => s + i.price, 0),
}), { name: "cart" }));                                 // saved to localStorage

export const useAuth = create((set) => ({ user: null, signIn: (u) => set({ user: u }), signOut: () => set({ user: null }) }));

function Layout() {
  const count = useCart((s) => s.items.length);         // re-renders only when count changes
  return (<><header>Cart ({count})</header><main><Outlet /></main></>);
}

function RequireAuth() {
  const user = useAuth((s) => s.user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function ProductPage() {
  const { id } = useParams();
  return <h1>Product {id}</h1>;
}

const router = createBrowserRouter([{
  element: <Layout />,
  children: [
    { path: "/", element: <h1>Home</h1> },
    { path: "/products/:id", element: <ProductPage /> },
    { element: <RequireAuth />, children: [{ path: "/checkout", element: <h1>Checkout</h1> }] },
    { path: "*", element: <h1>Page not found</h1> },
  ],
}]);

export default function App() { return <RouterProvider router={router} />; }`,
      ex: "Add routes for list, detail, cart, checkout (protected) and a 404 page to your catalogue. Move the cart into a persisted Zustand store and show the count in the header.",
      q: ["Where should a list of products from the API usually live?", ["In a global Zustand store", "In a server-state cache such as TanStack Query", "In localStorage", "In a URL parameter"], 1, "Server state needs caching, refetching and invalidation, which query libraries provide."]
    },
    {
      t: "Styling at scale: Tailwind and component design",
      sub: ["Utility-first CSS with Tailwind", "Design tokens: colours, spacing, typography", "Building reusable components with variants", "Accessible primitives (Radix / shadcn/ui)", "Dark mode", "When plain CSS is better"],
      body: `<p>Teams keep interfaces consistent with a small set of <b>design tokens</b> and <b>reusable components</b>. Tailwind CSS gives you utility classes (<code>px-4 py-2 rounded-lg</code>) that map to your tokens, so you style in markup without inventing class names.</p>
<p>Build each component once with <b>variants</b> (primary, secondary, danger; small, medium) and use it everywhere. For complex widgets (dialogs, dropdowns, tabs) start from accessible primitives such as Radix, which handle keyboard and screen-reader behaviour correctly.</p>`,
      lang: "javascript",
      code: `// tailwind.config.js (excerpt): your tokens
// theme: { extend: { colors: { brand: { 500: "#0e7563", 600: "#0b5f50" } } } }, darkMode: "class"

const base = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition " +
             "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50";
const variants = {
  primary: "bg-brand-500 text-white hover:bg-brand-600",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};
const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4", lg: "h-12 px-6 text-lg" };

export function Button({ variant = "primary", size = "md", className = "", ...props }) {
  return <button className={[base, variants[variant], sizes[size], className].join(" ")} {...props} />;
}

export function Card({ title, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

// usage
// <Card title="Your cart"><Button onClick={checkout}>Checkout</Button>
//   <Button variant="secondary" size="sm">Keep shopping</Button></Card>`,
      ex: "Build Button, Input, Card and Modal components with variants and dark mode, document each on a single 'components' page, then rebuild one screen of your catalogue using only these components.",
      q: ["What is the main benefit of design tokens?", ["Smaller images", "One source of truth for colours and spacing, so the whole UI stays consistent and themeable", "Faster JavaScript", "Better SEO"], 1, "Tokens centralise visual decisions; components consume them everywhere."]
    },
    {
      t: "Next.js: routing, rendering and server code",
      sub: ["File-based routing and layouts (App Router)", "Server components vs client components", "Static generation, server rendering and revalidation", "Fetching data on the server", "Server actions and route handlers", "Metadata and SEO"],
      body: `<p><b>Next.js</b> adds what React alone lacks: file-based routing, rendering pages on the server, and backend code in the same project. In the App Router, components are <b>server components</b> by default: they run on the server, can read databases or APIs directly, and send finished HTML to the browser. Add <code>"use client"</code> only to components that need interactivity.</p>
<p>Choose a rendering strategy per page: <b>static</b> for content that rarely changes (fast and cheap), <b>revalidated</b> static for content that changes every few minutes, and <b>dynamic</b> server rendering for per-user pages.</p>`,
      lang: "javascript",
      code: `// app/layout.jsx
export const metadata = { title: "Shop", description: "Hand-picked products" };
export default function RootLayout({ children }) {
  return <html lang="en"><body><nav>Shop</nav>{children}</body></html>;
}

// app/products/page.jsx  (server component: runs on the server)
export const revalidate = 300;                          // rebuild at most every 5 minutes
export default async function ProductsPage() {
  const res = await fetch(process.env.API_URL + "/products");   // server-only env var: safe
  const { items } = await res.json();
  return <ul>{items.map((p) => <li key={p.id}><a href={"/products/" + p.id}>{p.name}</a></li>)}</ul>;
}

// app/products/[id]/page.jsx
export async function generateMetadata({ params }) {
  const p = await getProduct(params.id);
  return { title: p.name, description: p.summary };
}
export default async function ProductPage({ params }) {
  const p = await getProduct(params.id);
  return (<><h1>{p.name}</h1><AddToCart id={p.id} /></>);
}

// app/products/[id]/AddToCart.jsx  (client component: interactive)
"use client";
import { useState } from "react";
export function AddToCart({ id }) {
  const [added, setAdded] = useState(false);
  return <button onClick={() => setAdded(true)}>{added ? "Added" : "Add to cart"}</button>;
}

// app/api/health/route.js  (backend route in the same project)
export function GET() { return Response.json({ ok: true }); }`,
      ex: "Build a small Next.js blog: posts from Markdown files rendered statically, a dynamic tag page, per-post metadata for SEO, and one interactive client component (like a 'copy link' button). Deploy it on Vercel.",
      q: ["What runs by default in the Next.js App Router?", ["Client components", "Server components", "Web workers", "Static HTML only"], 1, "Components are server components unless marked with \"use client\"."]
    },
    {
      t: "Frontend testing and performance",
      sub: ["Unit tests with Vitest", "Component tests with Testing Library (test what users see)", "Mocking network requests", "End-to-end tests with Playwright", "Core Web Vitals: LCP, INP, CLS", "Code splitting, image optimisation and lazy loading"],
      body: `<p>Test frontends the way users use them. <b>Testing Library</b> finds elements by role and label, clicks and types, then checks what appears, so tests survive refactors. Mock the network so tests are fast and deterministic, and keep a few <b>end-to-end</b> Playwright tests for critical flows like sign-up and checkout.</p>
<p>Performance is measured with <b>Core Web Vitals</b>: how fast the main content appears (LCP), how quickly the page responds to input (INP), and how much the layout jumps (CLS). The biggest wins are usually smaller images, fewer and smaller scripts (code splitting) and reserving space for images and ads.</p>`,
      lang: "javascript",
      code: `// Shop.test.jsx  (vitest + @testing-library/react + user-event)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import Shop from "./Shop";

const products = [{ id: 1, name: "Desk lamp", price: 1299 }, { id: 2, name: "Notebook", price: 199 }];

test("search filters products and add-to-cart updates the count", async () => {
  const user = userEvent.setup();
  render(<Shop products={products} />);
  await user.type(screen.getByPlaceholderText("Search"), "lamp");
  expect(screen.getByText("Desk lamp")).toBeInTheDocument();
  expect(screen.queryByText("Notebook")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /add to cart/i }));
  expect(screen.getByText(/cart: 1 items/i)).toBeInTheDocument();
});

// e2e/checkout.spec.js  (Playwright)
// test("checkout flow", async ({ page }) => {
//   await page.goto("/");
//   await page.getByRole("button", { name: "Add to cart" }).first().click();
//   await page.getByRole("link", { name: /cart/i }).click();
//   await expect(page.getByText("Total")).toBeVisible();
// });

// Performance: load heavy screens only when needed
import { lazy, Suspense } from "react";
const Reports = lazy(() => import("./Reports"));        // separate bundle chunk
export function ReportsRoute() {
  return <Suspense fallback={<p>Loading reports…</p>}><Reports /></Suspense>;
}
// <img src="hero.webp" width="1200" height="600" loading="lazy" alt="..." />  // sizes prevent CLS`,
      ex: "Write component tests for search, cart and an error state of your catalogue, one Playwright test for checkout, then run Lighthouse, fix the top two performance issues and record before/after scores.",
      q: ["Why query elements by role and label in tests?", ["It is faster", "It mirrors how users find things and keeps tests stable through refactors", "CSS classes are not allowed", "It is required by Vitest"], 1, "Tests tied to user-visible behaviour break only when behaviour changes."]
    }
  ]
});
