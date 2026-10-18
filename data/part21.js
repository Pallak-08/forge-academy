/* Forge Academy lessons: TypeScript, frontend tooling, React forms and performance, design systems, Next.js */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 59, id: "typescript-lessons", fills: "typescript", title: "TypeScript", level: 2,
  blurb: "Advanced types and TypeScript in real projects.",
  lessons: [
    {
      t: "Advanced types",
      sub: ["Utility types: Partial, Pick, Omit, Record", "Mapped and conditional types", "Type guards and assertion functions", "unknown vs any", "Declaration files"],
      body: `<p><b>Utility types</b> derive new types from existing ones, so you define your data once:</p>
<ul><li><code>Partial&lt;User&gt;</code>: every property optional (update payloads).</li>
<li><code>Pick&lt;User, "id" | "name"&gt;</code> and <code>Omit&lt;User, "password"&gt;</code>: choose or drop properties.</li>
<li><code>Record&lt;Status, string&gt;</code>: an object with known keys and one value type.</li>
<li><code>Readonly</code>, <code>Required</code>, <code>ReturnType&lt;typeof fn&gt;</code>, <code>Awaited&lt;T&gt;</code>, <code>NonNullable&lt;T&gt;</code>.</li></ul>
<p><b>Mapped types</b> loop over keys (<code>{ [K in keyof T]: ... }</code>), which is how Partial is built. <b>Conditional types</b> choose a type based on another (<code>T extends string ? "text" : "other"</code>), with <code>infer</code> to extract parts. You'll read these in library types more often than write them, but they explain how typed APIs work.</p>
<p><b>Discriminated unions</b> model states precisely: <code>{ status: "loading" } | { status: "success"; data: User } | { status: "error"; error: string }</code>. Checking <code>status</code> <b>narrows</b> the type, so you can only access <code>data</code> when it exists, and a <code>never</code> check makes the compiler warn when you forget a case.</p>
<p><b>Type guards</b> narrow types at runtime: <code>typeof</code>, <code>instanceof</code>, <code>"key" in obj</code>, and your own functions returning <code>value is User</code>. <b>Assertion functions</b> (<code>asserts value is User</code>) throw if the check fails.</p>
<p><b><code>unknown</code> vs <code>any</code></b>: <code>any</code> switches type checking off and spreads silently. <code>unknown</code> means "could be anything, check before use", which is the right type for API responses, <code>JSON.parse</code> results and caught errors.</p>
<p><b>Declaration files</b> (<code>.d.ts</code>) describe the types of JavaScript code. Most libraries ship them or have them in DefinitelyTyped (<code>@types/...</code>); you can write small ones for untyped modules or global variables.</p>`,
      lang: "typescript",
      code: `interface User { id: string; name: string; email: string; password: string; role: "admin" | "member" }

type PublicUser = Omit<User, "password">;
type UserUpdate = Partial<Pick<User, "name" | "email">>;
type RoleLabels = Record<User["role"], string>;
const labels: RoleLabels = { admin: "Administrator", member: "Member" };

// Mapped + conditional types (how library types are built)
type Nullable<T> = { [K in keyof T]: T[K] | null };
type ElementOf<T> = T extends (infer E)[] ? E : never;
type N = ElementOf<number[]>;            // number

// Discriminated union with exhaustive checking
type Request<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function describe(r: Request<PublicUser>): string {
  switch (r.status) {
    case "idle": return "Not started";
    case "loading": return "Loading...";
    case "success": return \`Hello \${r.data.name}\`;     // data only exists here
    case "error": return \`Failed: \${r.error}\`;
    default: { const never: never = r; return never; }   // compile error if a case is missing
  }
}

// unknown + a type guard for data from outside
function isPublicUser(v: unknown): v is PublicUser {
  return typeof v === "object" && v !== null && "id" in v && "email" in v;
}
const raw: unknown = JSON.parse('{"id":"1","name":"Asha","email":"a@x.in","role":"member"}');
if (isPublicUser(raw)) console.log(raw.email);         // narrowed to PublicUser

function assertDefined<T>(v: T, msg: string): asserts v is NonNullable<T> {
  if (v == null) throw new Error(msg);
}

// Declaration file for an untyped module: types/confetti.d.ts
// declare module "tiny-confetti" { export default function confetti(opts?: { count?: number }): void; }`,
      ex: "Model a checkout flow's state as a discriminated union (cart, address, payment, success, failed) with exhaustive switch handling. Derive create, update and public types for a Product interface using utility types. Write a type guard for an API response typed as unknown, and a small .d.ts for an untyped JavaScript helper in your project.",
      q: ["Why is unknown safer than any for a value from JSON.parse?", ["unknown is faster", "unknown forces you to narrow or validate the value before using it, while any silently disables type checking", "any can't hold objects", "They are identical"], 1, "With unknown the compiler blocks property access until you prove the shape; any lets mistakes through and spreads to other code."]
    },
    {
      t: "TypeScript in real projects",
      sub: ["tsconfig and strict mode", "Typing React components and hooks", "Typing Express/Node handlers", "Runtime validation with zod", "Migrating a JS project"],
      body: `<p><b>tsconfig.json</b> configures the compiler. Turn on <b><code>"strict": true</code></b> from day one: it enables null checks (catching "cannot read property of undefined" before runtime), no implicit any and more. Also worth enabling: <code>noUncheckedIndexedAccess</code> (array and record lookups may be undefined) and <code>exactOptionalPropertyTypes</code>. In projects built by a bundler, TypeScript usually only type-checks (<code>tsc --noEmit</code>) while Vite or Next.js compile.</p>
<p><b>React</b>: type props with an interface or type; children as <code>React.ReactNode</code>; events as <code>React.ChangeEvent&lt;HTMLInputElement&gt;</code>; state usually infers (<code>useState&lt;User | null&gt;(null)</code> when the initial value doesn't show the type); refs as <code>useRef&lt;HTMLInputElement&gt;(null)</code>. Extend native element props with <code>React.ComponentProps&lt;"button"&gt;</code> for wrapper components. Custom hooks return typed tuples or objects.</p>
<p><b>Node/Express</b>: type request params, body and query with generics (<code>Request&lt;Params, ResBody, ReqBody, Query&gt;</code>), and share types between front end and back end in a common package.</p>
<p>Types disappear at runtime, so data from outside (request bodies, API responses, environment variables, form input) can still be anything. <b>zod</b> validates data at runtime and <b>infers</b> the TypeScript type from the same schema (<code>z.infer&lt;typeof Schema&gt;</code>), so validation and types never drift apart.</p>
<p><b>Migrating JavaScript</b> gradually: add tsconfig with <code>allowJs</code> and <code>checkJs</code> off; rename files to .ts one at a time starting from leaf modules (utilities); install <code>@types</code> packages; use <code>unknown</code> and TODO-commented <code>any</code> sparingly to keep moving; enable strict mode once most files are converted.</p>`,
      lang: "typescript",
      code: `// tsconfig.json (excerpt)
// { "compilerOptions": { "strict": true, "noUncheckedIndexedAccess": true,
//     "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "jsx": "react-jsx", "noEmit": true } }

import { z } from "zod";
import { useState, type ComponentProps, type ReactNode } from "react";

// One schema -> runtime validation AND the static type
export const SignupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  age: z.coerce.number().int().min(13),
  plan: z.enum(["free", "pro"]).default("free"),
});
export type Signup = z.infer<typeof SignupSchema>;    // { name: string; email: string; age: number; plan: "free" | "pro" }

// React: typed props, extending native button props
type ButtonProps = ComponentProps<"button"> & { variant?: "primary" | "ghost"; icon?: ReactNode };
export function Button({ variant = "primary", icon, children, ...rest }: ButtonProps) {
  return <button className={\`btn btn-\${variant}\`} {...rest}>{icon}{children}</button>;
}

// A typed custom hook
export function useFetch<T>(url: string) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true });
  // ...fetch, then setState({ data: json as T, loading: false })
  return state;
}

// Express: validate the body, then everything after is typed
import express, { type Request, type Response } from "express";
const app = express();
app.use(express.json());
app.post("/signup", (req: Request, res: Response) => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
  const data: Signup = parsed.data;                    // fully typed and validated
  return res.status(201).json({ ok: true, plan: data.plan });
});

// Typed environment variables, validated at startup
export const env = z.object({ DATABASE_URL: z.string().url(), PORT: z.coerce.number().default(3000) })
  .parse(process.env);`,
      ex: "Convert a small JavaScript project (a React app or an Express API) to TypeScript with strict mode: install types, convert files one by one, type components, hooks and handlers, and add zod schemas for one form and one API endpoint, sharing the inferred type between front end and back end. Run <code>tsc --noEmit</code> in CI.",
      q: ["Why use zod (or similar) even in a fully typed TypeScript project?", ["TypeScript types slow down the app", "Types are erased at runtime, so data from outside (requests, APIs, forms) must be validated at runtime; zod also infers the matching type", "zod replaces the compiler", "It's required by React"], 1, "The compiler can't check data that arrives while the program runs. Runtime validation closes that gap with one source of truth."]
    }
  ]
});

COURSE.push({
  n: 60, id: "fe-tooling-lessons", fills: "fe-tooling", title: "Frontend tooling", level: 2,
  blurb: "Bundlers, build pipelines and automated code quality.",
  lessons: [
    {
      t: "Bundlers and build pipelines",
      sub: ["What a bundler does", "Vite, webpack, esbuild", "Code splitting", "Source maps"],
      body: `<p>Modern front-end code is written as hundreds of modules, in TypeScript and JSX, importing CSS and images and npm packages. Browsers need something else: few, small, compatible files. A <b>bundler</b> bridges the gap. It follows <code>import</code> statements from your entry point to build a dependency graph, transforms files (TypeScript and JSX to JavaScript, modern syntax for target browsers, CSS processing), and outputs optimised bundles: <b>minified</b>, with unused code removed (<b>tree shaking</b>) and file names containing content hashes (<code>app.3f2a91c.js</code>) so they can be cached forever.</p>
<p>Tools you'll meet:</p>
<ul><li><b>Vite</b>: the default for new projects. In development it serves native ES modules with almost instant start-up and hot module replacement; for production it bundles with Rollup (moving to Rolldown).</li>
<li><b>webpack</b>: the long-time standard, very configurable, still in many existing apps.</li>
<li><b>esbuild</b> and <b>SWC</b>: extremely fast compilers written in Go and Rust, used inside other tools. <b>Turbopack</b> powers Next.js development builds.</li></ul>
<p><b>Code splitting</b> avoids shipping the whole app on the first load. Dynamic <code>import()</code> creates separate chunks loaded on demand: per route, or for heavy components like charts, editors and maps. React's <code>lazy</code> and <code>Suspense</code> make this easy. Shared dependencies go into common chunks.</p>
<p><b>Source maps</b> map minified production code back to your original source, so stack traces and the DevTools debugger show real file names and lines. Upload them to your error tracker (Sentry) rather than serving them publicly if you don't want your source visible.</p>`,
      lang: "typescript",
      code: `// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    sourcemap: "hidden",                 // generate maps for Sentry, don't reference them publicly
    rollupOptions: {
      output: {
        manualChunks: { react: ["react", "react-dom"] },   // stable vendor chunk, cached across deploys
      },
    },
  },
  server: { port: 5173, proxy: { "/api": "http://localhost:8000" } },  // dev API proxy, no CORS pain
});

// Route-level code splitting with React.lazy
import { lazy, Suspense } from "react";
const Dashboard = lazy(() => import("./pages/Dashboard"));       // separate chunk
const Settings = lazy(() => import("./pages/Settings"));

export function App({ route }: { route: string }) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      {route === "settings" ? <Settings /> : <Dashboard />}
    </Suspense>
  );
}

// Load a heavy library only when the user needs it
async function exportPdf() {
  const { jsPDF } = await import("jspdf");                      // not in the initial bundle
  new jsPDF().text("Report", 10, 10).save("report.pdf");
}

// Inspect what's in your bundle:
//   npx vite build && npx vite-bundle-visualizer
// Output example:
//   dist/assets/index-3f2a91c.js      48 kB (gzip 16 kB)
//   dist/assets/react-a1b2c3d.js     142 kB (gzip 45 kB)
//   dist/assets/Dashboard-9e8f7a6.js  31 kB (lazy)`,
      ex: "Create a Vite + React + TypeScript app with three routes and one heavy dependency (a chart or PDF library). Build it and record bundle sizes, then add route-level lazy loading and dynamic import for the heavy library, rebuild and compare. Open the bundle visualiser, and confirm in the Network panel that chunks load only when you visit their route.",
      q: ["What does code splitting improve?", ["Type safety", "Initial load time, by loading code for routes or features only when they're needed", "Server security", "CSS specificity"], 1, "Users download only what the first screen needs. Other chunks load on demand, cutting the initial JavaScript cost."]
    },
    {
      t: "Code quality automation",
      sub: ["ESLint rules", "Prettier", "Husky and lint-staged", "Type checking in CI"],
      body: `<p>Automate everything a reviewer shouldn't have to comment on, so code review time goes to design and logic.</p>
<p><b>ESLint</b> finds problems in JavaScript and TypeScript: unused variables, missing <code>await</code>, unsafe patterns, React hooks mistakes (<code>react-hooks/rules-of-hooks</code> and <code>exhaustive-deps</code> catch real bugs), accessibility issues (<code>jsx-a11y</code>) and import problems. Start from recommended configs (<code>typescript-eslint</code>'s type-aware rules are particularly valuable), then add or relax rules deliberately. Modern ESLint uses the flat config file <code>eslint.config.js</code>.</p>
<p><b>Prettier</b> formats code automatically (spacing, quotes, line breaks), ending style debates. Let it own formatting and turn off ESLint's formatting rules. Format on save in your editor. Biome is a fast all-in-one alternative that lints and formats.</p>
<p><b>Husky</b> runs scripts on git hooks; <b>lint-staged</b> runs linters only on the files staged for commit, so the pre-commit hook stays fast. Keep hooks quick (a few seconds) or people will bypass them with <code>--no-verify</code>.</p>
<p><b>CI</b> is the real gate, because local hooks can be skipped: on every pull request run lint, <code>prettier --check</code>, <code>tsc --noEmit</code> (bundlers often skip type checking, so type errors can slip through otherwise) and tests. Make these required status checks for merging. Add an <code>.editorconfig</code> and recommended editor extensions so everyone gets the same setup.</p>`,
      lang: "javascript",
      code: `// eslint.config.js (flat config)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist", "coverage"] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,            // type-aware rules: catches floating promises etc.
  {
    languageOptions: { parserOptions: { projectService: true } },
    plugins: { react, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  prettier,                                              // last: disables rules that conflict with Prettier
);

// package.json (excerpt)
// "scripts": {
//   "lint": "eslint .",
//   "format": "prettier --write .",
//   "format:check": "prettier --check .",
//   "typecheck": "tsc --noEmit",
//   "prepare": "husky"
// },
// "lint-staged": {
//   "*.{ts,tsx,js}": ["eslint --fix", "prettier --write"],
//   "*.{css,md,json}": "prettier --write"
// }

// .husky/pre-commit
//   npx lint-staged

// CI step
//   npm ci && npm run lint && npm run format:check && npm run typecheck && npm test`,
      ex: "Set up ESLint (with typescript-eslint type-aware rules, react-hooks and jsx-a11y), Prettier, Husky with lint-staged, and a CI workflow running lint, format check, type check and tests on a React project. Fix every error, deliberately introduce a missing hook dependency and an unawaited promise to see the rules catch them, and make the CI checks required for merging.",
      q: ["Why run tsc --noEmit in CI when Vite already builds the TypeScript project?", ["It makes the build smaller", "Vite (via esbuild) strips types without checking them, so type errors would otherwise reach production", "tsc is faster than Vite", "Vite can't read TypeScript"], 1, "Bundlers transpile TypeScript for speed and skip type checking. A separate tsc step makes type errors fail the pipeline."]
    }
  ]
});

COURSE.push({
  n: 61, id: "react-lessons", fills: "react", title: "React", level: 2,
  blurb: "Forms done well and rendering performance.",
  lessons: [
    {
      t: "Forms in React",
      sub: ["Controlled vs uncontrolled inputs", "React Hook Form", "Validation with zod", "Accessible error states"],
      body: `<p>A <b>controlled</b> input stores its value in React state (<code>value={email}</code> plus <code>onChange</code>), so React is the source of truth: easy to validate as you type, format input or enable buttons conditionally. The cost is a re-render on every keystroke, which is fine for small forms. An <b>uncontrolled</b> input lets the DOM keep the value; you read it on submit through a ref or <code>FormData</code>. Fewer re-renders, simpler code for basic forms. React 19's form actions (<code>&lt;form action={fn}&gt;</code>, <code>useActionState</code>) build on the uncontrolled approach.</p>
<p>For anything beyond a few fields, use <b>React Hook Form</b>: it registers mostly uncontrolled inputs (fast), tracks errors, touched and dirty state, and submission status, and integrates with component libraries through <code>Controller</code>.</p>
<p>Validate with a <b>zod</b> schema via <code>zodResolver</code>: one schema defines rules, error messages and the TypeScript type, and the same schema can validate on the server. Validate on blur or submit rather than on every keystroke to avoid shouting at users mid-typing.</p>
<p><b>Accessible error states</b>: every input has a visible label; errors appear as text near the field, linked with <code>aria-describedby</code>, and the field gets <code>aria-invalid</code>; after a failed submit, focus moves to the first invalid field (React Hook Form does this with <code>shouldFocusError</code>). Disable the submit button while submitting (to prevent double submits) and show server errors clearly, both per field and for the whole form.</p>`,
      lang: "typescript",
      code: `import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1, "Enter your name"),
  email: z.string().email("Enter an email like name@example.com"),
  password: z.string().min(12, "Use at least 12 characters"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });
type Form = z.infer<typeof Schema>;

export function SignupForm() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(Schema), mode: "onBlur" });

  async function onSubmit(data: Form) {
    const res = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" },
                                             body: JSON.stringify(data) });
    if (res.status === 409) return setError("email", { message: "An account with this email exists" });
    if (!res.ok) return setError("root", { message: "Something went wrong. Please try again." });
  }

  const field = (name: keyof Form, label: string, type = "text") => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} type={type} {...register(name)}
             aria-invalid={errors[name] ? "true" : "false"}
             aria-describedby={errors[name] ? \`\${name}-error\` : undefined} />
      {errors[name] && <p id={\`\${name}-error\`} className="error">{errors[name]?.message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {errors.root && <p role="alert" className="error">{errors.root.message}</p>}
      {field("name", "Full name")}
      {field("email", "Email", "email")}
      {field("password", "Password", "password")}
      {field("confirm", "Confirm password", "password")}
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create account"}</button>
    </form>
  );
}`,
      ex: "Build a multi-step booking form in React (details, date and time, payment summary) with React Hook Form and a zod schema per step, showing accessible errors, preserving values between steps, preventing double submission and handling a server-side error for one field. Test it with keyboard only and with a screen reader.",
      q: ["What is the main advantage of a zod schema with React Hook Form?", ["It styles the form", "One schema defines validation rules, error messages and the TypeScript type, and can be reused on the server", "It removes the need for labels", "It makes forms controlled"], 1, "A single source of truth keeps client validation, server validation and types consistent."]
    },
    {
      t: "React performance",
      sub: ["How rendering works", "memo, useMemo, useCallback", "Lists and virtualisation", "Profiling with React DevTools"],
      body: `<p>React <b>re-renders</b> a component when its state changes, when its parent re-renders, or when a context it uses changes. Rendering means calling your component function to get new JSX; React then compares it with the previous result (reconciliation) and updates only the DOM nodes that changed. Re-renders are usually cheap; they become a problem when a render is expensive or happens across a huge tree on every keystroke.</p>
<p>Most performance wins come from structure, not memoisation: <b>keep state close</b> to where it's used (a search input's text doesn't belong in the top-level App), split big components, pass components as <code>children</code> so they don't re-render with the parent, and avoid putting fast-changing values in widely used context.</p>
<p><b>Memoisation tools</b>: <code>React.memo(Component)</code> skips re-rendering when props are shallowly equal. <code>useMemo</code> caches an expensive calculation between renders. <code>useCallback</code> caches a function identity, mainly so memoised children don't re-render because of a new callback each time. Each has a cost, so use them where profiling shows a benefit. The <b>React Compiler</b> can add memoisation automatically in supported setups.</p>
<p><b>Lists</b>: give every item a stable <code>key</code> (an ID, never the array index for lists that change order). Rendering thousands of rows is slow no matter what; <b>virtualisation</b> (TanStack Virtual, react-window) renders only the rows visible on screen. <code>useDeferredValue</code> and <code>useTransition</code> keep typing responsive while expensive results update.</p>
<p><b>Measure first</b>: the React DevTools <b>Profiler</b> records renders, showing which components rendered, how long they took and why ("props changed", "hook changed"). Turn on "highlight updates" to see re-renders live. Optimise what the profile shows, then measure again.</p>`,
      lang: "typescript",
      code: `import { memo, useCallback, useDeferredValue, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

type Product = { id: string; name: string; price: number };

// 1. Keep fast-changing state local: typing here doesn't re-render the whole page
function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState("");
  return <input value={q} onChange={(e) => { setQ(e.target.value); onSearch(e.target.value); }} aria-label="Search" />;
}

// 2. Memoised row: re-renders only when its own props change
const Row = memo(function Row({ p, onAdd }: { p: Product; onAdd: (id: string) => void }) {
  return <div className="row">{p.name} · ₹{p.price} <button onClick={() => onAdd(p.id)}>Add</button></div>;
});

export function Catalogue({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);                     // typing stays responsive

  const filtered = useMemo(                                     // expensive with 10,000 items
    () => products.filter((p) => p.name.toLowerCase().includes(deferred.toLowerCase())),
    [products, deferred]);

  const onAdd = useCallback((id: string) => addToCart(id), []); // stable identity for memo(Row)

  // 3. Virtualisation: render only the ~20 visible rows out of thousands
  const parentRef = useRef<HTMLDivElement>(null);
  const v = useVirtualizer({ count: filtered.length, getScrollElement: () => parentRef.current, estimateSize: () => 44 });

  return (
    <>
      <SearchBox onSearch={setQuery} />
      <div ref={parentRef} style={{ height: 500, overflow: "auto" }}>
        <div style={{ height: v.getTotalSize(), position: "relative" }}>
          {v.getVirtualItems().map((item) => (
            <div key={filtered[item.index].id}                  // stable key, never the index
                 style={{ position: "absolute", top: 0, transform: \`translateY(\${item.start}px)\`, width: "100%" }}>
              <Row p={filtered[item.index]} onAdd={onAdd} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}`,
      ex: "Build a product list with 10,000 generated items and a search box, and profile typing in it with the React DevTools Profiler. Then improve it step by step (move state down, memoise rows, useMemo for filtering, useDeferredValue, virtualisation), profiling after each change and recording render counts and times in a table.",
      q: ["A list of 5,000 rows makes the page slow to scroll and update. What helps most?", ["Using index as the key", "Virtualisation: rendering only the rows currently visible", "Wrapping the whole app in React.memo", "Adding more useEffect hooks"], 1, "The cost is in creating and updating thousands of DOM nodes. Virtualisation keeps only a screenful in the DOM at a time."]
    }
  ]
});

COURSE.push({
  n: 62, id: "styling-lessons", fills: "styling", title: "Design systems and styling at scale", level: 2,
  blurb: "Component libraries and working well with designers.",
  lessons: [
    {
      t: "Component libraries and headless UI",
      sub: ["shadcn/ui and Radix", "MUI and Chakra", "Theming", "Building vs adopting"],
      body: `<p>Building accessible interactive components (dialogs, dropdown menus, comboboxes, tabs, tooltips, date pickers) from scratch is surprisingly hard: focus trapping, keyboard navigation, ARIA attributes, positioning and screen reader behaviour all have to be right. Libraries solve this in two styles.</p>
<p><b>Headless libraries</b> provide behaviour and accessibility with no styling: <b>Radix UI</b>, React Aria, Headless UI, Ark UI. You style them entirely yourself, usually with Tailwind. <b>shadcn/ui</b> builds on Radix and Tailwind, but instead of installing a package you copy the component source into your project with a CLI, so you own and can change every line. This has become a very popular default for React apps.</p>
<p><b>Styled libraries</b> come with a complete look: <b>MUI</b> (Material Design, very comprehensive, strong data grid and date pickers), <b>Chakra UI</b>, Mantine, Ant Design. They're the fastest way to build internal tools and admin dashboards, but customising them deeply to match a distinctive brand can be harder.</p>
<p><b>Theming</b>: define design decisions as tokens (colours, radius, font, spacing), usually as CSS custom properties, and have components use the tokens instead of raw values. Light and dark themes are then just different token values. shadcn/ui themes through CSS variables; MUI and Chakra through a theme object.</p>
<p><b>Build or adopt?</b> Adopt a library for complex widgets and to move fast; build your own thin components (Button, Card, Badge) on top of tokens so the app looks consistent and the library can be swapped later. Large companies build full design systems once they have many teams and products to keep consistent.</p>`,
      lang: "typescript",
      code: `// shadcn/ui: components are copied into your repo, built on Radix + Tailwind
//   npx shadcn@latest init
//   npx shadcn@latest add button dialog dropdown-menu

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteProject({ name, onConfirm }: { name: string; onConfirm: () => void }) {
  return (
    <Dialog>                                         {/* focus trap, Escape to close, aria: handled by Radix */}
      <DialogTrigger asChild><Button variant="destructive">Delete</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>This removes the project and its files. You can't undo this.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* globals.css : theming with tokens (shadcn style) */
/*
:root {
  --background: 0 0% 100%;  --foreground: 222 47% 11%;
  --primary: 221 83% 53%;   --primary-foreground: 0 0% 100%;
  --radius: 0.6rem;
}
.dark {
  --background: 222 47% 7%; --foreground: 210 40% 96%;
  --primary: 217 91% 60%;
}
*/

// MUI equivalent: a theme object
// const theme = createTheme({ palette: { primary: { main: "#2a6df4" } }, shape: { borderRadius: 10 } });
// <ThemeProvider theme={theme}><Button variant="contained">Save</Button></ThemeProvider>`,
      ex: "Build the same small settings page (tabs, a form, a confirmation dialog and a dropdown menu) twice: once with shadcn/ui and once with MUI or Mantine. Add a dark theme to each through tokens or the theme object. Compare the bundle size, how easy it was to match a custom brand colour and radius, and keyboard and screen-reader behaviour, then write a recommendation.",
      q: ["What does a headless UI library like Radix provide?", ["Pre-designed colours and fonts", "Accessible behaviour (keyboard, focus, ARIA) for complex components, with styling left entirely to you", "A backend for forms", "Server-side rendering"], 1, "Headless libraries solve the hard interaction and accessibility parts while giving you full control of the look."]
    },
    {
      t: "Working with designers and Figma",
      sub: ["Reading a Figma file", "Design tokens", "Spacing and typography scales", "Handoff and review"],
      body: `<p>Front-end developers turn designs into working interfaces, usually from <b>Figma</b>. In <b>Dev Mode</b> (or the Inspect panel) you can select any layer to see its size, spacing to neighbouring elements, colours, typography and effects, and export assets as SVG or PNG. Look for <b>components</b> and <b>variants</b> in the design (Button: primary, secondary; sizes; states), which map to your code components and props, and <b>auto layout</b>, which maps closely to flexbox (direction, gap, padding, alignment).</p>
<p><b>Design tokens</b> are named design decisions shared by design and code: <code>color.primary</code>, <code>space.4</code>, <code>radius.md</code>, <code>font.heading.lg</code>. In Figma they live as variables and styles; in code as CSS custom properties or a Tailwind theme. Using tokens instead of copying raw values ("#2a6df4", "18px") keeps the product consistent and makes rebranding and dark mode a token change.</p>
<p><b>Scales</b> keep layouts harmonious: a <b>spacing scale</b> based on 4 or 8 pixels (4, 8, 12, 16, 24, 32, 48, 64), and a <b>type scale</b> with a limited set of sizes, weights and line heights. When a design uses 15px and 17px gaps inconsistently, ask whether it should snap to the scale; usually it should.</p>
<p><b>Handoff and review</b> is a conversation, not a throw over the wall. Ask early about states the design may not show: loading, empty, error, long text, very small and very large screens, keyboard focus, disabled states. Point out what's expensive to build and suggest alternatives. Share preview deployments so designers can review the real thing, and use visual regression tests or Storybook to keep components faithful over time.</p>`,
      lang: "javascript",
      code: `// tokens.json : exported from Figma variables (e.g. with Tokens Studio)
// {
//   "color": { "primary": "#2a6df4", "text": "#1d2433", "muted": "#5b6474", "surface": "#ffffff" },
//   "space": { "1": "4px", "2": "8px", "3": "12px", "4": "16px", "6": "24px", "8": "32px", "12": "48px" },
//   "radius": { "sm": "6px", "md": "10px", "lg": "16px" },
//   "font":  { "body": "16px/1.6 Inter", "h1": "40px/1.15 Inter", "h2": "28px/1.2 Inter" }
// }

// tailwind.config.js : map tokens into the framework so classes use them
import tokens from "./tokens.json" with { type: "json" };
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { primary: tokens.color.primary, text: tokens.color.text, muted: tokens.color.muted },
      spacing: tokens.space,          // p-4 = 16px, gap-6 = 24px: everything snaps to the scale
      borderRadius: tokens.radius,
    },
  },
};

// Card.tsx : built from a Figma component with auto layout
//   Figma: auto layout vertical, padding 24, gap 12, radius md, fill surface
export function Card({ title, children }) {
  return (
    <section className="flex flex-col gap-3 p-6 rounded-md bg-white">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <div className="text-muted">{children}</div>
    </section>
  );
}

// Handoff checklist to ask the designer about
// [ ] loading / empty / error states     [ ] long names and text overflow
// [ ] mobile and very wide layouts       [ ] focus and hover states, disabled
// [ ] dark mode                          [ ] which elements are reusable components`,
      ex: "Find a free community UI kit in Figma, open it in Dev Mode and implement one screen pixel-carefully: extract the colours, spacing and type into tokens, map them into CSS variables or a Tailwind theme, and build the components with the matching variants. List every state the design didn't show and implement sensible versions of them.",
      q: ["Why should code use design tokens rather than copying hex codes and pixel values from Figma?", ["Tokens load faster", "They keep design and code consistent and let you change themes or brand values in one place", "Figma requires it", "Hex codes don't work in CSS"], 1, "Named tokens make design decisions reusable and changeable. Hard-coded values drift and must be hunted down for every change."]
    }
  ]
});

COURSE.push({
  n: 63, id: "nextjs-lessons", fills: "nextjs", title: "Next.js and rendering strategies", level: 3,
  blurb: "Data fetching, caching, auth and deployment in Next.js.",
  lessons: [
    {
      t: "Data fetching and caching in Next.js",
      sub: ["Server fetching and caching", "Revalidation", "Loading and error UI", "Streaming"],
      body: `<p>In the Next.js <b>App Router</b>, components are <b>Server Components</b> by default: they run on the server, can be <code>async</code>, and can fetch data directly (from a database or API) with no client-side JavaScript and no secrets exposed. Only components marked <code>"use client"</code> run in the browser, for interactivity.</p>
<p>Whether a route is <b>static</b> (rendered at build time or on first request, then cached) or <b>dynamic</b> (rendered per request) depends on what it uses. Reading cookies, headers or search params makes it dynamic. In recent versions, <code>fetch</code> results are <b>not cached by default</b>; you opt in with <code>cache: "force-cache"</code> or <code>next: { revalidate }</code>, or with the <code>"use cache"</code> directive in newer versions. Caching behaviour has changed between major versions, so check the docs for the version you use.</p>
<p><b>Revalidation</b> refreshes cached data: <b>time-based</b> (<code>revalidate: 3600</code> rebuilds the data at most once an hour, known as ISR) or <b>on demand</b> (<code>revalidatePath("/blog")</code> or <code>revalidateTag("posts")</code> after a CMS webhook or a form submission).</p>
<p><b>Loading and error UI</b> come from special files: <code>loading.tsx</code> shows instantly while a route segment's data loads; <code>error.tsx</code> (a client component) catches errors in the segment with a retry button; <code>not-found.tsx</code> handles <code>notFound()</code>.</p>
<p><b>Streaming</b>: wrap slow parts of a page in <code>&lt;Suspense&gt;</code> so the rest is sent and shown immediately, and slow sections stream in as their data arrives. Start independent fetches in parallel rather than awaiting one after another.</p>`,
      lang: "typescript",
      code: `// app/blog/[slug]/page.tsx : a Server Component
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function getPost(slug: string) {
  const res = await fetch(\`https://cms.example.com/posts/\${slug}\`, {
    next: { revalidate: 3600, tags: ["posts"] },   // cache for an hour; can be purged by tag
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("CMS error");         // handled by error.tsx
  return res.json() as Promise<{ title: string; html: string }>;
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />  {/* trusted CMS HTML only, sanitised upstream */}
      <Suspense fallback={<p>Loading comments…</p>}>
        <Comments slug={slug} />                       {/* slow section streams in later */}
      </Suspense>
    </article>
  );
}

async function Comments({ slug }: { slug: string }) {
  const comments = await fetch(\`https://api.example.com/comments?post=\${slug}\`, { cache: "no-store" })
    .then((r) => r.json());                             // always fresh: dynamic
  return <ul>{comments.map((c: { id: string; text: string }) => <li key={c.id}>{c.text}</li>)}</ul>;
}

// app/blog/[slug]/loading.tsx  -> export default function Loading() { return <p>Loading post…</p>; }
// app/blog/[slug]/error.tsx    -> "use client"; export default function Error({ reset }) { ... <button onClick={reset}>Retry</button> }

// app/api/revalidate/route.ts : CMS webhook purges cached posts on publish
import { revalidateTag } from "next/cache";
export async function POST(req: Request) {
  if (req.headers.get("x-webhook-secret") !== process.env.CMS_WEBHOOK_SECRET) return new Response("no", { status: 401 });
  revalidateTag("posts");
  return Response.json({ revalidated: true });
}`,
      ex: "Build a small Next.js blog reading from a JSON API or a free headless CMS: post pages cached with time-based revalidation and tags, an on-demand revalidation webhook, loading and error UI per segment, a not-found page, and a slow comments section streamed with Suspense. Use the build output and response headers to confirm which routes are static and which are dynamic.",
      q: ["A page reads the user's cookies to show their name. What does this do to the route?", ["Nothing", "It makes the route dynamic: rendered per request, since the output depends on each request", "It makes the route fully static", "It disables Server Components"], 1, "Static rendering can't depend on per-request data. Using cookies, headers or search params opts the route into dynamic rendering."]
    },
    {
      t: "Auth, APIs and deployment",
      sub: ["Route handlers and server actions", "Authentication with Auth.js", "Middleware", "Deploying to Vercel"],
      body: `<p>Next.js apps can include their own backend. <b>Route handlers</b> (<code>app/api/.../route.ts</code>) export functions per HTTP method and return <code>Response</code> objects: use them for webhooks, public APIs and anything called by other clients. <b>Server actions</b> are async functions marked <code>"use server"</code> that forms and client components call directly, without writing a fetch: ideal for mutations from your own UI. Treat every server action as a public endpoint: validate input (zod), check authentication and authorisation inside it, then revalidate affected pages.</p>
<p><b>Authentication</b>: <b>Auth.js</b> (NextAuth) supports OAuth providers (Google, GitHub), email magic links and credentials, with sessions in cookies (JWT) or a database through adapters. Hosted options (Clerk, Supabase Auth, Auth0, Kinde) add ready-made UI and user management. Read the session in Server Components and actions, and always authorise on the server; hiding a button in the UI is not access control.</p>
<p><b>Middleware</b> runs before a request reaches a route: redirect unauthenticated users away from <code>/dashboard</code>, handle locales, rewrite paths, add headers. Keep it light (it runs on every matching request) and don't rely on it as the only authorisation check; check again where data is accessed.</p>
<p><b>Deploying to Vercel</b>: import the GitHub repository and every push gets a <b>preview deployment</b> with its own URL; merges to main deploy to production. Set environment variables per environment (variables prefixed <code>NEXT_PUBLIC_</code> are exposed to the browser, so never put secrets there). Add a custom domain, and check function logs and analytics. Next.js can also be self-hosted with <code>next start</code> in Docker, or on other platforms.</p>`,
      lang: "typescript",
      code: `// auth.ts (Auth.js v5)
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
export const { handlers, auth, signIn, signOut } = NextAuth({ providers: [GitHub] });
// app/api/auth/[...nextauth]/route.ts ->  export const { GET, POST } = handlers;

// app/projects/actions.ts : a server action, treated like a public endpoint
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const NewProject = z.object({ name: z.string().min(1).max(60) });

export async function createProject(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in" };            // authenticate
  const parsed = NewProject.safeParse({ name: formData.get("name") });  // validate
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.project.create({ data: { name: parsed.data.name, ownerId: session.user.id } });  // scoped to owner
  revalidatePath("/projects");
  return { ok: true };
}

// app/projects/new-project-form.tsx
// "use client";
// const [state, action, pending] = useActionState(createProject, null);
// <form action={action}><input name="name" /><button disabled={pending}>Create</button>{state?.error}</form>

// middleware.ts : redirect signed-out users away from private areas
export { auth as middleware } from "@/auth";
export const config = { matcher: ["/dashboard/:path*", "/projects/:path*"] };

// app/api/webhooks/razorpay/route.ts : a route handler for an external caller
export async function POST(req: Request) {
  const body = await req.text();
  if (!verifySignature(body, req.headers.get("x-razorpay-signature"))) return new Response("bad signature", { status: 400 });
  // ...mark the order paid (idempotently)
  return Response.json({ received: true });
}

// Vercel: Project Settings > Environment Variables
//   AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, DATABASE_URL     (server only)
//   NEXT_PUBLIC_SITE_URL                                               (exposed to the browser)`,
      ex: "Add GitHub sign-in with Auth.js to a Next.js app, protect /dashboard with middleware, and implement 'create project' as a server action that validates input with zod and checks ownership, plus a route handler for an external webhook. Deploy it to Vercel with separate preview and production environment variables, and verify that a signed-out request to the server action is rejected.",
      q: ["Why must a server action check authentication and authorisation itself, even if the button is only shown to logged-in users?", ["Server actions run in the browser", "Server actions are callable HTTP endpoints; anyone can invoke them directly, so hiding UI is not access control", "Next.js requires it for caching", "It makes the action faster"], 1, "The UI is not a security boundary. Every server-side entry point must verify who is calling and what they may do."]
    }
  ]
});
