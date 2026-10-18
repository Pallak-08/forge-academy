/* Forge Academy lessons: accessibility, web performance, frontend security, API styles and docs,
   frontend hosting, advanced DSA and interview strategy, architecture styles and patterns */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 64, id: "fe-quality-lessons", fills: "fe-quality", title: "Frontend testing, performance and accessibility", level: 3,
  blurb: "Accessible, fast and secure front ends.",
  lessons: [
    {
      t: "Accessibility in practice",
      sub: ["WCAG levels", "Keyboard and focus management", "ARIA: when and when not", "Screen reader testing", "Colour contrast"],
      body: `<p>Around one in six people lives with a disability, and accessibility helps everyone: keyboard users, people on bright screens outdoors, people with temporary injuries. It's also increasingly a legal requirement. The <b>WCAG</b> guidelines are organised around four principles (perceivable, operable, understandable, robust) with three levels: A, <b>AA</b> (the usual target in law and contracts) and AAA.</p>
<p><b>Keyboard</b>: everything must work with Tab, Shift+Tab, Enter, Space, the arrow keys and Escape. Use real <code>&lt;button&gt;</code> and <code>&lt;a href&gt;</code> elements, which are focusable and keyboard-operable for free; a clickable <code>div</code> is not. Keep a visible focus indicator (<code>:focus-visible</code>), a logical tab order that follows the visual order (avoid positive <code>tabindex</code>), and a "skip to content" link.</p>
<p><b>Focus management</b> in dynamic UIs: when a dialog opens, move focus into it, trap it there and return it to the trigger on close (native <code>&lt;dialog&gt;</code> with <code>showModal()</code> does most of this). After client-side navigation, move focus to the new page's heading. Announce async updates (saved, errors, results count) with a live region (<code>aria-live="polite"</code>).</p>
<p><b>ARIA</b>: the first rule of ARIA is don't use ARIA if a native element does the job. ARIA changes what assistive technology announces but adds no behaviour. Use it to fill genuine gaps: <code>aria-label</code> for icon-only buttons, <code>aria-expanded</code> on disclosure buttons, <code>aria-describedby</code> for hints and errors, <code>aria-current="page"</code> in navigation. Wrong ARIA is worse than none.</p>
<p><b>Test</b> with automated tools (axe DevTools, Lighthouse, eslint-plugin-jsx-a11y), which catch roughly a third of issues, then manually with only the keyboard and with a <b>screen reader</b>: VoiceOver (macOS and iOS), NVDA (Windows, free) or TalkBack (Android). <b>Contrast</b>: AA requires 4.5:1 for normal text and 3:1 for large text and UI components; never use colour alone to convey meaning.</p>`,
      lang: "html",
      code: `<a class="skip-link" href="#main">Skip to content</a>

<nav aria-label="Main">
  <a href="/" aria-current="page">Home</a>
  <a href="/courses">Courses</a>
</nav>

<!-- Icon-only button needs an accessible name -->
<button type="button" aria-label="Close notification"><svg aria-hidden="true">...</svg></button>

<!-- Disclosure: aria-expanded tells screen readers the state -->
<button type="button" aria-expanded="false" aria-controls="faq-1" id="faq-1-btn">What does it cost?</button>
<div id="faq-1" hidden>It's free.</div>

<!-- Native dialog: focus moves in, Escape closes, focus returns to the trigger -->
<button type="button" id="open-delete">Delete project</button>
<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete this project?</h2>
  <p>This can't be undone.</p>
  <form method="dialog"><button value="cancel" autofocus>Cancel</button> <button value="delete">Delete</button></form>
</dialog>

<!-- Live region for async status -->
<p id="status" aria-live="polite" class="visually-hidden"></p>

<script>
  const btn = document.getElementById("faq-1-btn");
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    document.getElementById("faq-1").hidden = open;
  });
  const dlg = document.getElementById("confirm");
  document.getElementById("open-delete").addEventListener("click", () => dlg.showModal());
  dlg.addEventListener("close", () => {
    if (dlg.returnValue === "delete") document.getElementById("status").textContent = "Project deleted";
  });
</script>

<style>
  :focus-visible { outline: 3px solid #f2cf4e; outline-offset: 2px; }
  .skip-link { position: absolute; left: -9999px; }
  .skip-link:focus { left: 1rem; top: 1rem; }
  .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>`,
      ex: "Audit one of your projects: run axe DevTools and Lighthouse, then use it for 15 minutes with only the keyboard and 15 minutes with a screen reader (eyes closed for part of it). Log every problem with the WCAG criterion it breaks, fix them (focus styles, labels, dialog focus, contrast, live regions), and re-test.",
      q: ["What's the first rule of ARIA?", ["Add aria-label to every element", "Don't use ARIA when a native HTML element or attribute already provides the semantics and behaviour", "Use role=\"button\" on divs", "ARIA replaces the need for testing"], 1, "Native elements come with keyboard support and correct semantics. ARIA only changes announcements, and misused ARIA confuses users."]
    },
    {
      t: "Web performance",
      sub: ["Core Web Vitals", "Images and fonts", "Bundle analysis", "Caching and CDNs"],
      body: `<p>Performance affects conversions, bounce rates, SEO and users on slow phones and networks, which is most users in many markets. Google's <b>Core Web Vitals</b> measure real-user experience:</p>
<ul><li><b>LCP</b> (Largest Contentful Paint): when the main content appears. Good: under 2.5 s.</li>
<li><b>INP</b> (Interaction to Next Paint): how quickly the page responds to clicks and typing. Good: under 200 ms.</li>
<li><b>CLS</b> (Cumulative Layout Shift): how much content jumps around while loading. Good: under 0.1.</li></ul>
<p>Measure with <b>lab</b> tools (Lighthouse, WebPageTest, the DevTools Performance panel, ideally with CPU and network throttling) and <b>field</b> data from real users (the Chrome UX Report, Search Console, the <code>web-vitals</code> library sending to your analytics).</p>
<p><b>Images</b> are usually the biggest bytes: serve modern formats (AVIF, WebP), the right size via <code>srcset</code>, lazy-load below-the-fold images, and give the LCP image <code>fetchpriority="high"</code> and no lazy loading. Always set dimensions to avoid layout shift. <b>Fonts</b>: self-host or preconnect, use <code>font-display: swap</code>, subset and preload the critical font file, and use fewer weights.</p>
<p><b>JavaScript</b> hurts INP and LCP: analyse bundles (vite-bundle-visualizer, webpack-bundle-analyzer, source-map-explorer), remove or replace heavy dependencies (moment.js to date-fns or Intl), code-split routes and heavy widgets, defer third-party scripts, and break up long tasks so the main thread can respond.</p>
<p><b>Caching</b>: hashed static assets get <code>Cache-Control: public, max-age=31536000, immutable</code>; HTML gets short or no caching so deploys show up. A <b>CDN</b> serves assets from locations near users, and compression (Brotli or gzip) shrinks text files dramatically.</p>`,
      lang: "html",
      code: `<head>
  <!-- Connect early to origins needed for the first render -->
  <link rel="preconnect" href="https://cdn.example.com" crossorigin>
  <!-- Preload the one critical font file -->
  <link rel="preload" href="/fonts/inter-var-latin.woff2" as="font" type="font/woff2" crossorigin>
  <style>
    @font-face { font-family: Inter; src: url(/fonts/inter-var-latin.woff2) format("woff2");
                 font-display: swap; font-weight: 100 900; }
  </style>
  <script src="/js/app-3f2a91c.js" type="module"></script>      <!-- modules are deferred -->
  <script src="https://analytics.example.com/a.js" defer></script>
</head>
<body>
  <!-- LCP image: high priority, never lazy, dimensions set -->
  <img src="/img/hero-1200.avif" srcset="/img/hero-600.avif 600w, /img/hero-1200.avif 1200w"
       sizes="100vw" width="1200" height="600" fetchpriority="high" alt="Students learning together">

  <!-- Below the fold: lazy -->
  <img src="/img/team.avif" width="800" height="500" loading="lazy" alt="The team">
</body>

<script type="module">
  // Field data: send real users' Core Web Vitals to your analytics
  import { onLCP, onINP, onCLS } from "https://unpkg.com/web-vitals@4?module";
  const send = (m) => navigator.sendBeacon("/api/vitals", JSON.stringify({ name: m.name, value: m.value, page: location.pathname }));
  onLCP(send); onINP(send); onCLS(send);
</script>

<!-- Server headers
  /assets/*.js, *.css, *.avif  ->  Cache-Control: public, max-age=31536000, immutable
  /index.html                  ->  Cache-Control: no-cache            (revalidate each time)
  Content-Encoding: br
-->`,
      ex: "Run Lighthouse (mobile, throttled) and WebPageTest on one of your sites and record LCP, INP or TBT, CLS and total bytes. Fix the top five issues: image formats and sizes, LCP image priority, font loading, a heavy dependency found with a bundle analyser, and cache headers. Re-measure and present before/after numbers, and add web-vitals field reporting.",
      q: ["Which change most directly reduces Cumulative Layout Shift?", ["Minifying JavaScript", "Setting width and height (or aspect-ratio) on images and reserving space for embeds and ads", "Using a CDN", "Adding more fonts"], 1, "CLS happens when content moves as late-loading elements take up space. Reserving space up front keeps the layout stable."]
    },
    {
      t: "Frontend security",
      sub: ["XSS and safe rendering", "CORS", "Content Security Policy", "Storing tokens", "Dependency audits"],
      body: `<p><b>XSS</b> is the main front-end vulnerability: attacker-controlled data executed as code in your users' browsers, where it can steal data or act as the user. Frameworks escape text by default (<code>{value}</code> in React), so the danger is in escape hatches: <code>dangerouslySetInnerHTML</code>, <code>innerHTML</code>, <code>v-html</code>, building URLs from input (<code>javascript:</code> links in <code>href</code>), and <code>eval</code> or <code>new Function</code>. Sanitise any user HTML with DOMPurify, and validate URL protocols.</p>
<p><b>CORS</b> (cross-origin resource sharing) is often misunderstood. Browsers block JavaScript from reading responses from another origin unless the server allows it with <code>Access-Control-Allow-Origin</code>. CORS protects users' data on <i>other</i> sites; it is not a protection for your API (curl ignores it). Configure it on the server with an explicit allow-list of origins, and never reflect any origin while also allowing credentials.</p>
<p><b>Content Security Policy</b> is a response header that tells the browser which sources of scripts, styles, images and connections are allowed. A strict CSP (nonces or hashes for scripts, no <code>unsafe-inline</code>) blocks most injected scripts even if an XSS bug exists. Roll it out with <code>Content-Security-Policy-Report-Only</code> first to find what would break. Add <code>frame-ancestors</code> to prevent clickjacking.</p>
<p><b>Storing tokens</b>: any token readable by JavaScript (localStorage, sessionStorage, non-HttpOnly cookies) can be stolen by XSS. Prefer HttpOnly, Secure, SameSite cookies set by your server (a backend-for-frontend pattern for SPAs). If you must hold tokens in JavaScript, keep them in memory, short-lived.</p>
<p><b>Dependencies</b>: front ends pull in hundreds of npm packages. Run <code>npm audit</code> or OSV-Scanner in CI, enable Dependabot, use lock files, review new packages, and load third-party scripts with Subresource Integrity (<code>integrity</code> hashes) where possible.</p>`,
      lang: "typescript",
      code: `import DOMPurify from "dompurify";

// 1. Rendering user content safely
export function Comment({ text }: { text: string }) {
  return <p>{text}</p>;                                   // escaped by React: safe
}
export function RichBio({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: ["b", "i", "a", "p", "ul", "li"], ALLOWED_ATTR: ["href"] });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;   // only ever with sanitised HTML
}

// 2. Links built from user input: block javascript: and data: URLs
export function safeHref(url: string): string {
  try {
    const u = new URL(url, location.origin);
    return ["http:", "https:", "mailto:"].includes(u.protocol) ? u.href : "#";
  } catch { return "#"; }
}

// 3. Strict CSP with a nonce (Next.js middleware example)
import { NextResponse } from "next/server";
export function middleware() {
  const nonce = btoa(crypto.randomUUID());
  const csp = [
    "default-src 'self'",
    \`script-src 'self' 'nonce-\${nonce}' 'strict-dynamic'\`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://cdn.example.com",
    "connect-src 'self' https://api.example.com",
    "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'",
  ].join("; ");
  const res = NextResponse.next({ headers: { "x-nonce": nonce } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

// 4. CORS on the API (Express): explicit allow-list, credentials only for known origins
// app.use(cors({ origin: ["https://app.example.com"], credentials: true }));

// 5. Third-party script with Subresource Integrity
// <script src="https://cdn.jsdelivr.net/npm/lib@1.2.3/dist/lib.min.js"
//         integrity="sha384-..." crossorigin="anonymous"></script>`,
      ex: "Review a front-end project for security: search for innerHTML, dangerouslySetInnerHTML, eval and links built from input, and fix them; move any tokens out of localStorage into HttpOnly cookies; add a strict CSP (start in report-only mode and fix violations); configure CORS on its API with an allow-list; and add npm audit or OSV-Scanner to CI.",
      q: ["Does CORS protect your API from being called by scripts or tools like curl?", ["Yes, it blocks all unauthorised clients", "No: CORS is enforced only by browsers to protect users; your API still needs its own authentication and authorisation", "Only for POST requests", "Yes, if you set Access-Control-Allow-Origin to *"], 1, "Non-browser clients ignore CORS entirely. It controls which web pages may read responses in a user's browser, nothing more."]
    }
  ]
});

COURSE.push({
  n: 65, id: "http-apis-lessons", fills: "http-apis", title: "HTTP and API design", level: 2,
  blurb: "GraphQL and gRPC, documentation, versioning and API conventions.",
  lessons: [
    {
      t: "GraphQL and gRPC",
      sub: ["GraphQL schemas, queries and mutations", "When GraphQL helps and hurts", "gRPC and protocol buffers", "Choosing an API style"],
      body: `<p><b>GraphQL</b> exposes one endpoint and a typed <b>schema</b>. Clients send <b>queries</b> describing exactly the fields they need, possibly across related objects, and get back exactly that shape. <b>Mutations</b> change data; <b>subscriptions</b> push updates. On the server, <b>resolvers</b> fetch each field.</p>
<p><b>Where GraphQL helps</b>: many different clients (web, mobile, partners) needing different shapes of data; screens that would otherwise make many REST calls; and a strongly typed contract that generates client types (GraphQL Code Generator) and great tooling.</p>
<p><b>Where it hurts</b>: HTTP caching is harder (everything is a POST to one URL); the <b>N+1 problem</b>, where nested resolvers fire one database query per item, needs batching with DataLoader; clients can send very expensive queries, so you need depth and complexity limits; authorisation must happen per field or type; and it's more machinery than a simple CRUD app needs.</p>
<p><b>gRPC</b> uses <b>protocol buffers</b>: you define services and messages in a <code>.proto</code> file, and code generators create typed clients and servers in many languages. Messages are compact binary over HTTP/2, with streaming in both directions. It's fast and strongly typed, ideal for <b>service-to-service</b> communication inside a backend, but browsers can't call it directly (gRPC-Web or Connect bridges this).</p>
<p><b>Choosing</b>: REST for public APIs and most CRUD apps (simple, cacheable, universally understood); GraphQL for rich clients with varied data needs; gRPC for internal, high-throughput microservice calls; webhooks or event streams for notifying other systems. Many systems use more than one.</p>`,
      lang: "typescript",
      code: `// GraphQL schema (SDL)
const typeDefs = /* GraphQL */ \`
  type Course { id: ID!, title: String!, lessons: [Lesson!]!, author: User! }
  type Lesson { id: ID!, title: String!, minutes: Int! }
  type User   { id: ID!, name: String! }
  type Query  { course(id: ID!): Course, courses(first: Int = 20): [Course!]! }
  type Mutation { enroll(courseId: ID!): Boolean! }
\`;

// Resolvers, with DataLoader to avoid N+1 queries for authors
import DataLoader from "dataloader";
const resolvers = {
  Query: {
    courses: (_: unknown, { first }: { first: number }) => db.course.findMany({ take: Math.min(first, 50) }),
  },
  Course: {
    author: (course: { authorId: string }, _: unknown, ctx: Ctx) => ctx.userLoader.load(course.authorId),
  },
  Mutation: {
    enroll: (_: unknown, { courseId }: { courseId: string }, ctx: Ctx) => {
      if (!ctx.user) throw new Error("UNAUTHENTICATED");          // authorise in resolvers
      return enrollments.create(ctx.user.id, courseId);
    },
  },
};
// per request: userLoader = new DataLoader(ids => db.user.findMany({ where: { id: { in: ids } } }) ...)

// Client query: exactly the fields this screen needs, in one request
const query = \`{ courses(first: 10) { id title author { name } lessons { title minutes } } }\`;

// gRPC: courses.proto
/*
syntax = "proto3";
package forge.v1;
service CourseService {
  rpc GetCourse (GetCourseRequest) returns (Course);
  rpc WatchProgress (WatchRequest) returns (stream Progress);   // server streaming
}
message GetCourseRequest { string id = 1; }
message Course { string id = 1; string title = 2; repeated string lesson_ids = 3; }
*/
// buf generate  -> typed clients and servers for Go, TypeScript, Python, ...`,
      ex: "Build the same small 'courses with lessons and authors' API three ways: REST (two or three endpoints), GraphQL (Apollo Server or GraphQL Yoga, with DataLoader) and gRPC (a .proto and a generated server and client in one language). Log database queries to see the N+1 problem before adding DataLoader, then write a one-page comparison of developer experience, payload size and caching.",
      q: ["What is the N+1 problem in GraphQL?", ["Queries can return N+1 results", "Resolving a nested field per item triggers one query per item (plus the first), unless calls are batched, for example with DataLoader", "GraphQL needs N+1 servers", "Mutations run twice"], 1, "Fetching 50 courses then each author separately means 51 queries. Batching collects the IDs and loads them in one query."]
    },
    {
      t: "API documentation and versioning",
      sub: ["OpenAPI / Swagger", "Versioning strategies", "Pagination styles", "Idempotency keys", "Webhooks"],
      body: `<p><b>OpenAPI</b> (formerly Swagger) describes a REST API in a YAML or JSON document: endpoints, parameters, request and response schemas, authentication and examples. From it you get interactive docs (Swagger UI, Redoc, Scalar), generated client SDKs, mock servers and contract tests. Frameworks like FastAPI generate it from code automatically; others use a spec-first approach where the spec is written and reviewed before implementation.</p>
<p><b>Versioning</b> lets you make breaking changes without breaking existing clients. Common strategies: a version in the URL (<code>/v1/orders</code>, simple and visible, the most common), a header (<code>Accept: application/vnd.forge.v2+json</code>), or date-based versions pinned per client (the Stripe model). Better still, avoid breaking changes: adding fields and endpoints is safe; removing or renaming fields, changing types or making optional inputs required are breaking. Announce deprecations with dates and a <code>Deprecation</code>/<code>Sunset</code> header.</p>
<p><b>Pagination</b>: <b>offset</b> (<code>?page=3&amp;size=20</code>) is simple but slow for deep pages and skips or repeats items when data changes; <b>cursor</b> (keyset) pagination (<code>?after=opaque_cursor</code>) is stable and fast for feeds and large tables. Return the next cursor and cap page sizes.</p>
<p><b>Idempotency keys</b> make retries safe for non-idempotent operations like payments: the client sends a unique <code>Idempotency-Key</code> header; the server stores the result for that key and returns the same result if the request is retried, instead of charging twice.</p>
<p><b>Webhooks</b> notify other systems of events by POSTing to their URL. Sign payloads (HMAC with a shared secret plus a timestamp to prevent replays), retry with backoff on failure, include an event ID so receivers can de-duplicate, and let receivers respond quickly and process asynchronously.</p>`,
      lang: "yaml",
      code: `openapi: 3.1.0
info: { title: Forge Orders API, version: "1.4.0" }
servers: [ { url: https://api.example.com/v1 } ]
components:
  securitySchemes:
    bearer: { type: http, scheme: bearer }
  schemas:
    Order:
      type: object
      required: [id, total, status]
      properties:
        id: { type: string, example: ord_8Hx2 }
        total: { type: integer, description: Amount in paise, example: 149900 }
        status: { type: string, enum: [pending, paid, refunded] }
    OrderPage:
      type: object
      properties:
        data: { type: array, items: { $ref: "#/components/schemas/Order" } }
        next_cursor: { type: [string, "null"], description: Pass as ?after= to get the next page }
security: [ { bearer: [] } ]
paths:
  /orders:
    get:
      summary: List orders, newest first (cursor pagination)
      parameters:
        - { name: after, in: query, schema: { type: string } }
        - { name: limit, in: query, schema: { type: integer, default: 20, maximum: 100 } }
      responses:
        "200": { description: A page of orders, content: { application/json: { schema: { $ref: "#/components/schemas/OrderPage" } } } }
    post:
      summary: Create an order
      parameters:
        - name: Idempotency-Key
          in: header
          required: true
          description: Unique per logical request; retries with the same key return the original result
          schema: { type: string, format: uuid }
      requestBody:
        content: { application/json: { schema: { type: object, required: [items], properties: { items: { type: array, items: { type: string } } } } } }
      responses:
        "201": { description: Created, content: { application/json: { schema: { $ref: "#/components/schemas/Order" } } } }
        "409": { description: Same key reused with a different body }

# Webhook signature (receiver side, pseudo-code):
#   expected = HMAC_SHA256(secret, timestamp + "." + raw_body)
#   reject if timestamp older than 5 minutes or signatures don't match (constant-time compare)`,
      ex: "Write an OpenAPI spec for a small orders API (list with cursor pagination, create with an Idempotency-Key, get, refund), render it with Swagger UI or Scalar, and implement it (FastAPI or Express). Prove idempotency by sending the same create request twice, and implement a signed webhook sender and a receiver that verifies signatures and ignores duplicate event IDs.",
      q: ["A mobile client times out creating a payment and retries. How do you avoid charging twice?", ["Ask users not to retry", "Require an Idempotency-Key header; the server stores the result per key and returns it on retries instead of repeating the charge", "Use GET for payments", "Increase the timeout"], 1, "The client can't know whether the first request succeeded. An idempotency key makes retries safe by design."]
    }
  ]
});

COURSE.push({
  n: 66, id: "deploy-fe-lessons", fills: "deploy-fe", title: "Deploying frontends", level: 2,
  blurb: "Hosting platforms, environments, domains and production monitoring.",
  lessons: [
    {
      t: "Static hosting platforms",
      sub: ["Vercel, Netlify, GitHub Pages, Cloudflare Pages", "Build settings", "Environment variables", "Preview deployments"],
      body: `<p>Front ends are usually deployed to platforms that build your repository on every push and serve the result from a global CDN, with HTTPS included.</p>
<ul><li><b>Vercel</b>: made by the Next.js team; excellent for Next.js and any framework, with serverless and edge functions.</li>
<li><b>Netlify</b>: similar, with functions, forms and redirects built in.</li>
<li><b>Cloudflare Pages</b>: Cloudflare's huge network, generous free tier and Workers for server code.</li>
<li><b>GitHub Pages</b>: free static hosting straight from a repository, great for portfolios and docs (no server functions).</li></ul>
<p><b>Build settings</b>: the platform needs the install command, the <b>build command</b> (<code>npm run build</code>), the <b>output directory</b> (<code>dist</code> for Vite, <code>build</code> for Create React App, automatic for Next.js) and the Node version. Single-page apps with client-side routing need a fallback rewrite so deep links like <code>/dashboard/settings</code> serve <code>index.html</code> instead of a 404.</p>
<p><b>Environment variables</b> are set per environment (production, preview, development) in the platform's settings. Remember that front-end build tools <b>embed</b> variables with public prefixes (<code>VITE_</code>, <code>NEXT_PUBLIC_</code>) into the JavaScript at build time, so they are visible to anyone. Only public values (API base URLs, publishable keys) belong there. Changing them requires a rebuild.</p>
<p><b>Preview deployments</b> give every pull request its own live URL, so reviewers, designers and testers can try changes before merging. Point previews at a staging API, protect them with a password or the platform's access controls if needed, and run end-to-end tests against them in CI.</p>`,
      lang: "json",
      code: `// vercel.json : SPA fallback, caching and security headers (Vite build in dist/)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [ { "source": "/((?!api/).*)", "destination": "/index.html" } ],
  "headers": [
    { "source": "/assets/(.*)", "headers": [ { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" } ] },
    { "source": "/(.*)", "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" } ] }
  ]
}

// netlify.toml equivalent
// [build]
//   command = "npm run build"
//   publish = "dist"
// [[redirects]]
//   from = "/*"
//   to = "/index.html"
//   status = 200

// .env.production (public values only: these end up in the JavaScript bundle!)
// VITE_API_URL=https://api.example.com
// VITE_SENTRY_DSN=https://abc@o1.ingest.sentry.io/1

// GitHub Pages for a Vite app: .github/workflows/pages.yml uses
//   actions/upload-pages-artifact (path: dist) + actions/deploy-pages
//   and vite.config.ts: base: "/<repo-name>/"

// CI: run Playwright against the preview URL that the platform posts on the PR
//   npx playwright test --config e2e.config.ts   (BASE_URL from the deployment_status event)`,
      ex: "Deploy the same Vite single-page app to Vercel, Netlify and GitHub Pages. Configure the SPA fallback so deep links work, cache headers for hashed assets, and separate API URLs for preview and production. Open a pull request, test its preview deployment, and confirm that a VITE_ variable is visible in the built JavaScript (so you never put secrets there).",
      q: ["Is it safe to put a secret API key in a VITE_ or NEXT_PUBLIC_ environment variable?", ["Yes, environment variables are always secret", "No: these are embedded into the JavaScript bundle at build time, so anyone can read them in the browser", "Yes, if the site uses HTTPS", "Only on Vercel"], 1, "Public-prefixed variables are compiled into client code by design. Secrets must stay on a server or in serverless functions."]
    },
    {
      t: "Domains and monitoring",
      sub: ["Custom domains and HTTPS", "Redirects", "Error tracking (Sentry)", "Analytics"],
      body: `<p><b>Custom domains</b>: buy a domain from a registrar, add it in your hosting platform, and create the DNS records it asks for: usually a CNAME for subdomains (<code>www</code> or <code>app</code>) and an A record or ALIAS/flattened CNAME for the root (apex) domain. The platform then issues and renews an HTTPS certificate automatically. Pick one canonical version (with or without <code>www</code>) and redirect the other to it.</p>
<p><b>Redirects</b>: use <b>301/308</b> (permanent) when URLs change for good, so browsers and search engines update, and 302/307 for temporary moves. Keep a redirect map when restructuring a site so old links and search rankings aren't lost. Redirect HTTP to HTTPS (platforms do this by default) and add HSTS.</p>
<p><b>Error tracking</b>: without it, you only hear about front-end bugs when users complain (most never do). <b>Sentry</b> (or Bugsnag, Rollbar, LogRocket) captures JavaScript errors and unhandled promise rejections from real browsers with the stack trace (made readable with uploaded source maps), browser, device, URL, release version and the user actions leading up to it ("breadcrumbs"). Add release tracking to spot regressions after deploys, and alerts for new issues. Scrub personal data before sending.</p>
<p><b>Analytics</b> tells you how people use the product: page views, sign-up funnels, feature usage, Core Web Vitals. Options range from privacy-friendly, cookie-less tools (Plausible, Umami, Vercel Analytics) to full product analytics (PostHog, Mixpanel, Google Analytics). Track a few meaningful events rather than everything, respect consent requirements and privacy laws, and avoid sending personal data to analytics.</p>`,
      lang: "typescript",
      code: `// DNS records at your registrar (example)
//   app.example.com    CNAME   cname.vercel-dns.com.
//   example.com        A       76.76.21.21            (or ALIAS / flattened CNAME, per platform docs)
//   www.example.com    CNAME   cname.vercel-dns.com.  -> platform redirects www to the apex (308)

// main.tsx : Sentry for a React app
import * as Sentry from "@sentry/react";
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,                       // production / preview
  release: import.meta.env.VITE_RELEASE,                   // e.g. git SHA set in CI
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1,                                   // performance sampling
  sendDefaultPii: false,
  beforeSend(event) {                                      // scrub anything sensitive
    if (event.request?.url) event.request.url = event.request.url.replace(/token=[^&]+/, "token=[redacted]");
    return event;
  },
});

export const App = Sentry.withErrorBoundary(Routes, {
  fallback: <p>Something went wrong. We've been notified. <a href="/">Go home</a></p>,
});

// CI: upload source maps for this release so stack traces are readable
//   npx @sentry/cli sourcemaps upload --release=$GITHUB_SHA dist

// Privacy-friendly analytics: track a few meaningful events
declare global { interface Window { plausible?: (e: string, o?: { props: Record<string, string> }) => void } }
export const track = (event: string, props: Record<string, string> = {}) => window.plausible?.(event, { props });
// track("Signup", { plan: "pro" });  track("Lesson Completed", { module: "react" });

// Redirect map after restructuring (vercel.json "redirects")
//   { "source": "/blog/:slug", "destination": "/articles/:slug", "permanent": true }`,
      ex: "Connect a custom domain (or a free subdomain) to a deployed front end with HTTPS, choose a canonical host and redirect the other, and add a permanent redirect for one renamed page. Integrate Sentry with release tracking and source maps, throw a test error in production and read the readable stack trace, then add privacy-friendly analytics with two custom events.",
      q: ["Why upload source maps to your error tracker?", ["They make the site load faster", "They turn minified production stack traces into readable file names and line numbers from your original code", "They're required for HTTPS", "They hide errors from users"], 1, "Production code is minified and bundled. Source maps let the error tracker map each frame back to your real source."]
    }
  ]
});

COURSE.push({
  n: 67, id: "dsa-lessons", fills: "dsa", title: "Data structures and algorithms", level: 2,
  blurb: "Heaps, tries, advanced graphs and a plan for interview problem solving.",
  lessons: [
    {
      t: "Heaps, tries and advanced graphs",
      sub: ["Priority queues and heaps", "Tries for prefix search", "Dijkstra's shortest path", "Topological sort", "Union-find"],
      body: `<p>A <b>heap</b> is a tree stored in an array where every parent is smaller than its children (a min-heap). It gives O(1) access to the smallest item and O(log n) insert and remove, which makes it the standard <b>priority queue</b>: task schedulers, "top K" problems, merging sorted lists and Dijkstra's algorithm. In Python, <code>heapq</code>; in Java, <code>PriorityQueue</code>.</p>
<p>A <b>trie</b> (prefix tree) stores strings character by character, so all words sharing a prefix share a path. Lookup and prefix search take time proportional to the word length, not the number of words: autocomplete, spell checking and IP routing tables.</p>
<p><b>Dijkstra's algorithm</b> finds shortest paths from one node in a graph with <b>non-negative</b> edge weights (road distances, network latency). Repeatedly take the closest unvisited node from a min-heap and relax its neighbours' distances. With a heap it runs in O((V + E) log V). Negative weights need Bellman-Ford instead.</p>
<p><b>Topological sort</b> orders the nodes of a directed acyclic graph so that every edge goes from earlier to later: build orders, course prerequisites, task pipelines. Kahn's algorithm repeatedly removes nodes with no incoming edges; if some nodes remain, the graph has a cycle.</p>
<p><b>Union-find</b> (disjoint set union) tracks which items belong to the same group, with near-constant-time <code>union</code> and <code>find</code> using path compression and union by rank: connected components, detecting cycles in undirected graphs, Kruskal's minimum spanning tree, grouping duplicate accounts.</p>`,
      lang: "python",
      code: `import heapq
from collections import defaultdict, deque

# Top K most frequent words with a heap: O(n log k)
def top_k(words, k):
    counts = defaultdict(int)
    for w in words: counts[w] += 1
    return heapq.nlargest(k, counts.items(), key=lambda kv: kv[1])

# Trie for autocomplete
class Trie:
    def __init__(self): self.root = {}
    def insert(self, word):
        node = self.root
        for ch in word: node = node.setdefault(ch, {})
        node["$"] = True                                  # end-of-word marker
    def starts_with(self, prefix, limit=5):
        node = self.root
        for ch in prefix:
            if ch not in node: return []
            node = node[ch]
        out, stack = [], [(node, prefix)]
        while stack and len(out) < limit:
            n, s = stack.pop()
            if "$" in n: out.append(s)
            stack.extend((child, s + c) for c, child in n.items() if c != "$")
        return out

# Dijkstra: graph = {node: [(neighbour, weight), ...]}
def dijkstra(graph, start):
    dist = {start: 0}
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, float("inf")): continue        # stale entry
        for v, w in graph.get(u, []):
            nd = d + w
            if nd < dist.get(v, float("inf")):
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist

# Topological sort (Kahn): course order from prerequisites
def course_order(n, prereqs):                             # prereqs: [(course, needs)]
    graph, indeg = defaultdict(list), [0] * n
    for c, need in prereqs: graph[need].append(c); indeg[c] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft(); order.append(u)
        for v in graph[u]:
            indeg[v] -= 1
            if indeg[v] == 0: q.append(v)
    return order if len(order) == n else None             # None: a cycle exists

# Union-find with path compression
class DSU:
    def __init__(self, n): self.p = list(range(n))
    def find(self, x):
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]; x = self.p[x]
        return x
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb: return False                         # already connected: adding this edge makes a cycle
        self.p[ra] = rb; return True`,
      ex: "Solve one problem with each structure: 'K closest points to origin' (heap), 'implement autocomplete for 10,000 words' (trie), 'network delay time' (Dijkstra), 'course schedule II' (topological sort) and 'number of provinces' or 'redundant connection' (union-find). For each, state the time and space complexity and why that structure fits.",
      q: ["Which structure efficiently returns the smallest item repeatedly while new items keep arriving?", ["A sorted array", "A min-heap (priority queue)", "A trie", "A linked list"], 1, "A heap gives O(log n) insertion and removal of the minimum, versus O(n) insertion to keep an array sorted."]
    },
    {
      t: "Interview problem-solving strategy",
      sub: ["Clarify, examples, brute force, optimise", "Talking while you code", "Testing your own solution", "A 12-week practice plan"],
      body: `<p>Coding interviews test how you approach unfamiliar problems as much as whether you finish. Follow the same steps every time:</p>
<ol><li><b>Clarify</b>: restate the problem; ask about input size, value ranges, duplicates, empty input, whether input is sorted, and expected output format.</li>
<li><b>Examples</b>: work through one normal example and one edge case by hand. This often reveals the pattern.</li>
<li><b>Brute force</b>: describe the simplest correct approach and its complexity. It shows you can solve it and gives a baseline.</li>
<li><b>Optimise</b>: look for repeated work. Common moves: a hash map for lookups, sorting first, two pointers, a sliding window, prefix sums, a heap for "top K", BFS/DFS for graphs and grids, binary search on a sorted space or on the answer, dynamic programming for overlapping subproblems.</li>
<li><b>Code</b> cleanly with meaningful names and small helpers.</li>
<li><b>Test</b> by walking through your code with an example and edge cases, line by line, fixing bugs you find.</li></ol>
<p><b>Talk while you code</b>: explain what you're doing and why. Interviewers can give hints only if they understand your thinking, and communication is part of the score. If you're stuck, say what you're considering; a hint taken well is not a failure.</p>
<p><b>Practise by pattern</b>, not by memorising problems. A 12-week plan of about an hour a day works for most people: weeks 1–2 arrays, strings and hashing; 3–4 two pointers, sliding window and binary search; 5–6 linked lists, stacks, queues and trees; 7–8 graphs (BFS, DFS, topological sort, union-find) and heaps; 9–10 dynamic programming and backtracking; 11–12 mixed timed practice and mock interviews. Review problems you got wrong after a few days, and keep a log of patterns and mistakes.</p>`,
      lang: "python",
      code: `"""
Problem: given an array of integers and a target k, return the length of the
longest subarray whose sum is at most k. All numbers are positive.

1. Clarify:  positive only? (yes)  empty array? (return 0)  n up to 10^5 -> need ~O(n) or O(n log n)
2. Examples: nums=[2,1,3,1,1], k=4 -> windows with sum <= 4: [2,1], [1,3], [3,1], [1,1] -> answer 2
             edge cases: k smaller than every element -> 0; empty array -> 0
3. Brute force: every start, extend while sum <= k  -> O(n^2)
4. Optimise: positive numbers mean the window sum only grows as it extends,
             so a sliding window works -> O(n) time, O(1) space
"""

def longest_subarray_at_most_k(nums: list[int], k: int) -> int:
    best = 0
    window_sum = 0
    left = 0
    for right, value in enumerate(nums):
        window_sum += value
        while window_sum > k and left <= right:   # shrink until valid again
            window_sum -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best

# 6. Test, including edge cases (say these out loud in the interview)
assert longest_subarray_at_most_k([2, 1, 3, 1, 1], 4) == 2
assert longest_subarray_at_most_k([1, 1, 1, 1], 10) == 4   # whole array
assert longest_subarray_at_most_k([5, 6], 4) == 0          # nothing fits
assert longest_subarray_at_most_k([], 3) == 0              # empty
print("all tests pass")

# Pattern cheat sheet
#   "pair/target sum"           -> hash map or two pointers (if sorted)
#   "longest/shortest subarray" -> sliding window (positives) or prefix sums + hash map
#   "kth / top k"               -> heap
#   "shortest path, grid"       -> BFS
#   "all combinations"          -> backtracking
#   "count ways / min cost"     -> dynamic programming`,
      ex: "Start the 12-week plan: set up a log (problem, pattern, time taken, mistakes, revisit date). This week, solve 10 array and hashing problems using the six steps, speaking out loud and timing yourself (aim for 25 minutes each). Record yourself on two of them and review how clearly you explained your approach.",
      q: ["You're stuck in an interview and see no optimal solution yet. What's the best move?", ["Stay silent until you think of it", "Explain and implement a correct brute-force solution, state its complexity, then discuss how to optimise", "Ask to skip the question", "Start coding random ideas"], 1, "A working baseline shows problem-solving ability and often leads naturally to the optimisation, with the interviewer able to help."]
    }
  ]
});

COURSE.push({
  n: 68, id: "architecture-lessons", fills: "architecture", title: "System design and architecture", level: 3,
  blurb: "Architecture styles and the code-level patterns that keep backends maintainable.",
  lessons: [
    {
      t: "Architecture styles",
      sub: ["Monolith vs microservices", "Modular monolith", "Serverless", "Event-driven systems"],
      body: `<p>A <b>monolith</b> is one deployable application containing all features. It's simple to develop, test, deploy and debug, with one codebase and one database, and calls between features are plain function calls. Most successful products started as monoliths, and many large companies still run them. The problems appear at scale: a huge codebase where everything depends on everything, slow builds, and many teams stepping on each other.</p>
<p><b>Microservices</b> split the system into independently deployable services, each owning its data and a business capability (orders, payments, notifications), communicating over the network. Benefits: teams deploy independently, services scale separately and can use different technologies. Costs: distributed-systems problems (network failures, latency, eventual consistency, distributed transactions), much more operational work (deployment, monitoring, tracing), and harder debugging. They solve <i>organisational</i> scaling problems; adopting them too early slows small teams down.</p>
<p>A <b>modular monolith</b> is the pragmatic middle ground: one deployable, but organised into modules with clear boundaries and public interfaces (no reaching into another module's tables). It keeps monolith simplicity while making a later split into services straightforward if it's ever needed.</p>
<p><b>Serverless</b> runs code as functions triggered by events (HTTP, queues, schedules, file uploads) on managed platforms like AWS Lambda or Cloudflare Workers. No servers to manage, automatic scaling and pay-per-use pricing; limits include cold starts, execution time caps and vendor lock-in.</p>
<p><b>Event-driven</b> systems communicate through events ("OrderPlaced") published to a broker (Kafka, RabbitMQ, SNS/SQS). Producers don't know who consumes events, so new features subscribe without changing existing code, and slow work happens asynchronously. Trade-offs: eventual consistency, harder tracing, and the need for idempotent consumers and schema management.</p>`,
      lang: "text",
      code: `Same e-commerce app, three ways

1) MODULAR MONOLITH (recommended start)
   app/
   ├── catalog/      api.py  service.py  repo.py   <- other modules call catalog.api only
   ├── orders/       api.py  service.py  repo.py
   ├── payments/     api.py  service.py  repo.py
   └── notifications/
   One deploy, one Postgres (separate schemas per module), in-process calls.
   Rule enforced in CI: no imports of another module's internals (import-linter / ArchUnit).

2) MICROSERVICES (when many teams need independent deploys)
   [catalog-svc]  [orders-svc]  [payments-svc]  [notify-svc]
        |              |              |              |
     own DB         own DB         own DB         own DB
   Calls over HTTP/gRPC + events on Kafka. Needs: service discovery, tracing,
   retries/timeouts, per-service CI/CD, contract tests, on-call per service.

3) EVENT-DRIVEN FLOW (works inside either style)
   orders: place order -> save -> publish OrderPlaced{order_id, total, user_id}
            |
            +--> payments  consumes -> charge -> publish PaymentSucceeded / PaymentFailed
            +--> inventory consumes -> reserve stock
            +--> notify    consumes -> email "order received"
   Consumers must be idempotent (events can be delivered twice).
   Use the outbox pattern so the DB write and the event publish can't diverge.

Decision guide
   1-3 teams, finding product fit        -> modular monolith
   spiky, event-triggered workloads      -> serverless functions
   many teams, clear domain boundaries   -> extract services gradually ("strangler fig")`,
      ex: "Take an app you know (food delivery or a learning platform) and design it as a modular monolith: list the modules, their public interfaces and which data each owns. Then identify which one module you'd extract first as a service if the company grew to 10 teams, and why. Sketch the event flow for placing an order, including what happens when the payment consumer is down.",
      q: ["For a new startup with three developers, which architecture is usually the best starting point?", ["Twenty microservices", "A modular monolith with clear internal boundaries", "One serverless function per database table", "A service mesh"], 1, "A modular monolith keeps development and operations simple while preserving the option to extract services when real scaling needs appear."]
    },
    {
      t: "Design patterns for backend code",
      sub: ["Repository and service layers", "Dependency injection", "Strategy, adapter, factory", "Clean / hexagonal architecture"],
      body: `<p>As a backend grows, putting database queries, business rules and HTTP handling all in route handlers becomes hard to test and change. Layering separates concerns:</p>
<ul><li><b>Routes / controllers</b>: HTTP only, parsing input, calling a service and shaping the response.</li>
<li><b>Service layer</b>: business logic and use cases ("place order": check stock, calculate tax, charge, save), independent of HTTP.</li>
<li><b>Repository</b>: data access behind an interface (<code>orders.get(id)</code>, <code>orders.save(order)</code>), so business logic doesn't know about SQL and tests can use an in-memory fake.</li></ul>
<p><b>Dependency injection</b> means passing a component the things it depends on (a repository, a payment gateway, a clock) instead of creating them inside. It makes code testable (inject fakes) and configurable (a different email provider in development). It can be as simple as constructor parameters; frameworks like FastAPI's <code>Depends</code> or NestJS automate the wiring.</p>
<p>A few classic patterns appear constantly:</p>
<ul><li><b>Strategy</b>: interchangeable algorithms behind one interface (pricing rules, shipping calculators, retry policies).</li>
<li><b>Adapter</b>: wrap a third-party API (Razorpay, Stripe, an LLM provider) in your own interface, so swapping providers touches one class.</li>
<li><b>Factory</b>: centralise creating the right object based on configuration or input.</li></ul>
<p><b>Clean / hexagonal architecture</b> ("ports and adapters") puts the business core at the centre with no dependencies on frameworks, databases or external services. The core defines <b>ports</b> (interfaces it needs); <b>adapters</b> implement them (Postgres repository, HTTP controller, Stripe gateway). Dependencies point inward. Use it with judgement: for a simple CRUD app it's overkill; for complex domains it keeps business rules clear and testable.</p>`,
      lang: "python",
      code: `from dataclasses import dataclass
from typing import Protocol

# ----- Core (no framework or vendor imports) -----
@dataclass
class Order:
    id: str
    user_id: str
    amount: int          # paise
    status: str = "pending"

class OrderRepository(Protocol):            # port
    def get(self, order_id: str) -> Order | None: ...
    def save(self, order: Order) -> None: ...

class PaymentGateway(Protocol):             # port
    def charge(self, amount: int, reference: str) -> bool: ...

class DiscountStrategy(Protocol):           # strategy
    def apply(self, amount: int) -> int: ...

class NoDiscount:
    def apply(self, amount): return amount
class FestiveDiscount:
    def apply(self, amount): return int(amount * 0.9)

class CheckoutService:                      # service layer: business rules only
    def __init__(self, repo: OrderRepository, payments: PaymentGateway, discount: DiscountStrategy):
        self.repo, self.payments, self.discount = repo, payments, discount   # dependency injection
    def pay(self, order_id: str) -> Order:
        order = self.repo.get(order_id)
        if not order or order.status != "pending":
            raise ValueError("order not payable")
        amount = self.discount.apply(order.amount)
        order.status = "paid" if self.payments.charge(amount, order.id) else "failed"
        self.repo.save(order)
        return order

# ----- Adapters (outer layer) -----
class RazorpayGateway:                      # adapter around a vendor SDK
    def __init__(self, client): self.client = client
    def charge(self, amount, reference):
        return self.client.payment.capture(reference, amount)["status"] == "captured"

class InMemoryOrders:                       # test adapter
    def __init__(self): self.rows = {}
    def get(self, oid): return self.rows.get(oid)
    def save(self, o): self.rows[o.id] = o

# ----- A fast unit test with fakes: no database, no network -----
class AlwaysApproves:
    def charge(self, amount, reference): return True

def test_festive_checkout():
    repo = InMemoryOrders(); repo.save(Order("o1", "u1", 10000))
    svc = CheckoutService(repo, AlwaysApproves(), FestiveDiscount())
    assert svc.pay("o1").status == "paid"

# FastAPI wiring (outer layer):
# def get_checkout() -> CheckoutService:
#     return CheckoutService(PostgresOrders(session), RazorpayGateway(client), discount_for_today())
# @app.post("/orders/{oid}/pay")
# def pay(oid: str, svc: CheckoutService = Depends(get_checkout)): return svc.pay(oid)`,
      ex: "Refactor one feature of a backend you've written from 'everything in the route handler' into routes, a service and a repository with dependency injection. Wrap one third-party API in an adapter, add a strategy for one varying rule, and write unit tests for the service using in-memory fakes that run in milliseconds. Compare the test speed with your previous integration tests.",
      q: ["Why wrap a payment provider's SDK in your own adapter interface?", ["It makes payments faster", "Business code depends on your stable interface, so switching providers or faking payments in tests touches only the adapter", "Providers require it", "It removes the need for API keys"], 1, "Adapters isolate vendor-specific details. The core stays unchanged when providers change, and tests can substitute a fake."]
    }
  ]
});
