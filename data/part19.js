/* Forge Academy lessons: debugging and learning, HTML in depth, CSS in depth */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 54, id: "debugging-lessons", fills: "debugging", title: "Debugging and problem solving", level: 1,
  blurb: "Tools for finding bugs and habits for learning fast.",
  lessons: [
    {
      t: "Debugging tools",
      sub: ["Breakpoints in VS Code", "Browser DevTools debugger", "Logging levels", "Reading network traces"],
      body: `<p>Adding <code>print</code> statements works, but a <b>debugger</b> lets you pause a running program and look around: every variable's value, the call stack that led here, and the ability to step through line by line.</p>
<p>In <b>VS Code</b>, click left of a line number to set a <b>breakpoint</b> and start debugging (F5) with a launch configuration. When execution pauses: <b>Step Over</b> (F10) runs the current line; <b>Step Into</b> (F11) enters a function call; <b>Step Out</b> finishes the current function; <b>Continue</b> runs to the next breakpoint. Right-click a breakpoint to make it <b>conditional</b> (only pause when <code>user_id == 42</code>) or a <b>logpoint</b> (print a message without stopping or editing code). The Watch panel evaluates expressions; the Debug Console runs code in the paused context.</p>
<p>The browser's <b>DevTools</b> Sources panel does the same for front-end JavaScript: breakpoints, stepping, scope variables, plus <b>DOM breakpoints</b> (pause when an element changes), <b>XHR/fetch breakpoints</b> (pause when a URL is requested) and "pause on exceptions". Writing <code>debugger;</code> in code also pauses there when DevTools is open.</p>
<p><b>Logging levels</b> let you keep useful logs in code permanently: DEBUG (detailed, off in production), INFO (normal events), WARNING (unexpected but handled), ERROR (something failed), CRITICAL. Configure the level per environment instead of deleting log lines.</p>
<p>The DevTools <b>Network</b> panel answers most "it doesn't work" questions in web apps: was the request sent, to which URL, with which headers and body; what status came back and what's in the response? A 401 means authentication, 403 permissions, 404 a wrong URL, 422 invalid input, 500 a server bug (check server logs), and a CORS error in the console means the server didn't allow your origin.</p>`,
      lang: "json",
      code: `// .vscode/launch.json : debug a FastAPI app and a Node script
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI (uvicorn)",
      "type": "debugpy",
      "request": "launch",
      "module": "uvicorn",
      "args": ["main:app", "--reload", "--port", "8000"],
      "env": { "APP_ENV": "development" },
      "justMyCode": true
    },
    {
      "name": "Node: current file",
      "type": "node",
      "request": "launch",
      "program": "\${file}",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}

// Python logging configured once, used everywhere
// import logging
// logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"),
//                     format="%(asctime)s %(levelname)s %(name)s %(message)s")
// log = logging.getLogger(__name__)
// log.debug("cart=%s", cart)            # hidden unless LOG_LEVEL=DEBUG
// log.warning("payment retry %d", n)
// log.exception("checkout failed")      # ERROR level + full traceback

// Browser: pause right before a request to /api/orders is sent
// DevTools > Sources > XHR/fetch Breakpoints > + "api/orders"`,
      ex: "Take a small buggy program (write one with an off-by-one error in a loop and a wrong dictionary key). Find both bugs using only the VS Code debugger: breakpoints, a conditional breakpoint and the Watch panel. Then in a web app, use the Network panel to diagnose a failing request and an XHR breakpoint to see the code that sent it.",
      q: ["A fetch request shows a CORS error in the browser console. Where is the fix most likely needed?", ["In the HTML", "On the server: it must send Access-Control-Allow-Origin (and related headers) allowing your front end's origin", "In the user's browser settings", "In the CSS"], 1, "CORS is enforced by the browser but controlled by the server's response headers. The server must explicitly allow the requesting origin."]
    },
    {
      t: "Learning effectively as an engineer",
      sub: ["Reading official documentation", "Minimal reproductions", "Asking good questions", "Using AI assistants without losing understanding"],
      body: `<p>Technologies change constantly, so the most valuable engineering skill is learning quickly and independently.</p>
<p><b>Read official documentation first.</b> Tutorials and videos go out of date; official docs are maintained by the people who build the tool. Learn how docs are organised: a <b>getting started</b> guide, <b>concept</b> explanations, <b>how-to</b> recipes and the <b>API reference</b>. Read the concepts once properly, then use the reference as needed. Check that the docs match your version.</p>
<p><b>Minimal reproductions</b> are the fastest way to understand a bug: strip the problem down until removing anything else makes it disappear. Often you'll find the cause while doing this. If not, you now have something small enough to share in an issue or question.</p>
<p><b>Ask good questions.</b> First search error messages (in quotes), the docs and the project's issues. When you ask, include: what you're trying to achieve, what you tried, the exact error message and the minimal code, your versions and environment, and what you expected versus what happened. Format code as text, not screenshots. Good questions get fast answers, and people remember you as someone who did the work.</p>
<p><b>AI assistants</b> are excellent tutors and accelerators if you stay in control. Use them to explain concepts and errors, suggest approaches, review your code and generate test cases. Avoid pasting code you don't understand: ask the assistant to explain it line by line, then rewrite it yourself or at least predict what it does before running it. Verify claims against docs, since assistants can be confidently wrong about APIs and versions. A good test: could you explain and modify this code tomorrow without the assistant?</p>`,
      lang: "markdown",
      code: `## A good question (GitHub issue, forum or team chat)

**Goal:** Upload a CSV from a Next.js form to my FastAPI endpoint.

**Problem:** FastAPI returns 422 "field required: file" although I select a file.

**Minimal reproduction**
\`\`\`python
# main.py  (fastapi 0.115, python-multipart 0.0.12)
from fastapi import FastAPI, UploadFile
app = FastAPI()
@app.post("/upload")
async def upload(file: UploadFile):
    return {"name": file.filename}
\`\`\`
\`\`\`js
// client (Chrome 129)
const body = new FormData();
body.append("csv", input.files[0]);          // <- field name
await fetch("http://localhost:8000/upload", { method: "POST", body });
\`\`\`

**Expected:** {"name": "data.csv"}   **Actual:** 422 {"detail":[{"loc":["body","file"],...}]}

**Tried:** setting Content-Type manually (made it worse), checking python-multipart is installed.

---
(While writing this I noticed: the form field is "csv" but the parameter is "file".
 Writing a minimal reproduction often answers the question.)

## Using an AI assistant well
- "Explain what this regex does, piece by piece" (then test it yourself)
- "Here is my function and the failing test. Don't fix it; give me a hint."
- "Review this code for bugs and edge cases I missed."
- Before running suggested code: predict the output. After: check the official docs for each API it used.`,
      ex: "Pick a library you use but haven't read the docs for. Read its concepts section and write a one-page summary in your own words. Then take a recent bug or error you hit, create a minimal reproduction in a fresh folder and write it up as a well-formed question using the template, even if you then solve it yourself.",
      q: ["What's the main benefit of creating a minimal reproduction of a bug?", ["It makes the bug go away", "It isolates the cause, often revealing the fix, and makes it easy for others to help", "It's required to file a bug report", "It speeds up your computer"], 1, "Stripping away everything unrelated narrows the problem down to its cause and gives helpers something they can run quickly."]
    }
  ]
});

COURSE.push({
  n: 55, id: "html-lessons", fills: "html", title: "HTML and semantic markup", level: 1,
  blurb: "Forms, media, tables and the HTML side of SEO.",
  lessons: [
    {
      t: "Forms in depth",
      sub: ["Input types and attributes", "Labels, fieldsets and legends", "Native validation", "Accessible error messages"],
      body: `<p>Forms are where users give you data, so getting them right matters for usability, accessibility and conversion.</p>
<p><b>Input types</b> give better keyboards and built-in behaviour for free: <code>email</code>, <code>tel</code>, <code>url</code>, <code>number</code>, <code>date</code>, <code>password</code>, <code>search</code>, <code>checkbox</code>, <code>radio</code>, <code>file</code>. Useful attributes: <code>name</code> (the key sent to the server), <code>required</code>, <code>minlength</code>/<code>maxlength</code>, <code>min</code>/<code>max</code>, <code>pattern</code>, <code>placeholder</code> (a hint, never a replacement for a label), and <b><code>autocomplete</code></b> (<code>email</code>, <code>name</code>, <code>new-password</code>, <code>one-time-code</code>), which lets browsers and password managers fill forms correctly.</p>
<p>Every input needs a <b>label</b>, linked with <code>for</code> and <code>id</code> (or by wrapping the input). Labels are read by screen readers, and clicking them focuses the input, making small checkboxes easier to tap. Group related controls, especially radio buttons, in a <b><code>fieldset</code></b> with a <b><code>legend</code></b> describing the group.</p>
<p><b>Native validation</b> checks <code>required</code>, types and patterns before submitting, styled with <code>:invalid</code> and <code>:user-invalid</code> (only after the user interacts). It's a convenience; the server must always validate again, because anyone can bypass the browser.</p>
<p><b>Accessible errors</b>: show errors as text next to the field (not only red borders), connect them with <code>aria-describedby</code>, mark the field <code>aria-invalid="true"</code>, and for a failed submit, show a summary at the top and move focus to it or to the first invalid field. Use a <code>button type="submit"</code>, so pressing Enter submits.</p>`,
      lang: "html",
      code: `<form action="/signup" method="post" novalidate id="signup">
  <div id="error-summary" role="alert" tabindex="-1" hidden></div>

  <label for="name">Full name</label>
  <input id="name" name="name" autocomplete="name" required maxlength="80">

  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" required
         aria-describedby="email-hint email-error">
  <p id="email-hint" class="hint">We'll send your receipt here.</p>
  <p id="email-error" class="error" hidden></p>

  <label for="password">Password</label>
  <input id="password" name="password" type="password" autocomplete="new-password"
         required minlength="12" aria-describedby="pw-hint">
  <p id="pw-hint" class="hint">At least 12 characters.</p>

  <fieldset>
    <legend>Plan</legend>
    <label><input type="radio" name="plan" value="free" checked> Free</label>
    <label><input type="radio" name="plan" value="pro"> Pro</label>
  </fieldset>

  <label><input type="checkbox" name="terms" required> I accept the terms</label>
  <button type="submit">Create account</button>
</form>

<script>
  // Use native validity, but show our own accessible messages
  document.getElementById("signup").addEventListener("submit", (e) => {
    const form = e.target, invalid = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
    if (!invalid.length) return;               // valid: let it submit (the server validates again)
    e.preventDefault();
    for (const el of invalid) el.setAttribute("aria-invalid", "true");
    const email = form.email, err = document.getElementById("email-error");
    err.hidden = email.validity.valid;
    err.textContent = email.validity.valueMissing ? "Enter your email" : "Enter an email like name@example.com";
    const summary = document.getElementById("error-summary");
    summary.hidden = false;
    summary.textContent = invalid.length + " field(s) need attention.";
    summary.focus();
  });
</script>`,
      ex: "Build a sign-up form with name, email, phone, password, date of birth, a plan choice and terms checkbox using the right input types and autocomplete values. Make every field labelled, show accessible error messages, and test it with only the keyboard and with a screen reader (VoiceOver or NVDA). Then try submitting invalid data with DevTools to remove 'required' and confirm your server rejects it.",
      q: ["Why isn't a placeholder a substitute for a label?", ["Placeholders are not valid HTML", "It disappears when the user types, has low contrast and isn't reliably announced as the field's name by assistive technology", "Placeholders slow down forms", "Browsers don't show placeholders on mobile"], 1, "Users lose the hint as soon as they type. A visible label linked to the input stays and is read by screen readers."]
    },
    {
      t: "Media, tables and embeds",
      sub: ["Images, srcset and alt text", "Video and audio", "Data tables done right", "iframes and their risks"],
      body: `<p><b>Images</b>: always set <code>width</code> and <code>height</code> (or an aspect ratio in CSS) so the layout doesn't jump while images load. Use <code>loading="lazy"</code> for images below the fold, and modern formats (AVIF, WebP) via <code>&lt;picture&gt;</code>. <b><code>srcset</code></b> and <b><code>sizes</code></b> let the browser pick the right file size for the screen, saving lots of data on phones.</p>
<p><b>Alt text</b> describes the image's purpose for people who can't see it: for a product photo, what the product is; for an icon button, what the button does. Decorative images get <code>alt=""</code> so screen readers skip them. Don't start with "image of".</p>
<p><b>Video and audio</b> use <code>&lt;video&gt;</code> and <code>&lt;audio&gt;</code> with <code>controls</code>. Provide captions with <code>&lt;track kind="captions"&gt;</code> (required for accessibility), a <code>poster</code> image, and avoid autoplay with sound. Background videos should be muted, short and respect reduced-motion preferences. For large libraries, use a video platform or streaming service.</p>
<p><b>Tables</b> are for tabular data, never for layout. Use <code>&lt;caption&gt;</code> (the table's title), <code>&lt;thead&gt;</code>/<code>&lt;tbody&gt;</code>, and <code>&lt;th scope="col"&gt;</code> or <code>scope="row"</code> so screen readers announce headers with each cell. On small screens, let wide tables scroll horizontally inside a container.</p>
<p><b>iframes</b> embed other pages (maps, videos, payment widgets). Risks: the embedded page could be malicious or track users. Use the <code>sandbox</code> attribute to restrict what it can do, <code>allow</code> to grant only needed features, <code>loading="lazy"</code>, and a <code>title</code>. In the other direction, protect your own site from being framed by others (clickjacking) with the <code>frame-ancestors</code> CSP directive.</p>`,
      lang: "html",
      code: `<!-- Responsive, lazy, well-described image -->
<picture>
  <source type="image/avif" srcset="/img/laptop-480.avif 480w, /img/laptop-960.avif 960w, /img/laptop-1600.avif 1600w"
          sizes="(max-width: 700px) 100vw, 50vw">
  <img src="/img/laptop-960.jpg"
       srcset="/img/laptop-480.jpg 480w, /img/laptop-960.jpg 960w, /img/laptop-1600.jpg 1600w"
       sizes="(max-width: 700px) 100vw, 50vw"
       width="960" height="640" loading="lazy" decoding="async"
       alt="Silver 14-inch laptop, open, showing the analytics dashboard">
</picture>
<img src="/img/divider.svg" alt="" width="200" height="8">   <!-- decorative -->

<!-- Video with captions -->
<video controls preload="metadata" poster="/video/demo-poster.jpg" width="1280" height="720">
  <source src="/video/demo.mp4" type="video/mp4">
  <track kind="captions" src="/video/demo.en.vtt" srclang="en" label="English" default>
</video>

<!-- Accessible data table -->
<div class="table-scroll" tabindex="0" role="region" aria-label="Monthly revenue">
  <table>
    <caption>Revenue by region, Q3 2026 (Rs lakh)</caption>
    <thead>
      <tr><th scope="col">Region</th><th scope="col">July</th><th scope="col">August</th><th scope="col">September</th></tr>
    </thead>
    <tbody>
      <tr><th scope="row">North</th><td>42.1</td><td>45.8</td><td>51.0</td></tr>
      <tr><th scope="row">South</th><td>38.4</td><td>40.2</td><td>39.7</td></tr>
    </tbody>
  </table>
</div>

<!-- Sandboxed third-party embed -->
<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="Product walkthrough video"
        width="560" height="315" loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        allow="encrypted-media; picture-in-picture"></iframe>`,
      ex: "Build a product page with a responsive hero image (srcset with three sizes, AVIF plus JPEG fallback), a demo video with a captions file you write yourself (WebVTT), a specification table with proper headers and caption, and an embedded map in a sandboxed iframe. Check it with Lighthouse and with a screen reader.",
      q: ["What alt text should a purely decorative divider image have?", ["alt=\"divider\"", "alt=\"image\"", "An empty alt attribute: alt=\"\"", "No alt attribute at all"], 2, "Empty alt tells screen readers to skip the image. Omitting alt entirely makes many screen readers read the file name instead."]
    },
    {
      t: "SEO basics for developers",
      sub: ["Titles and meta descriptions", "Headings and structure", "Open Graph tags", "Sitemaps and robots.txt"],
      body: `<p>Search engine optimisation is partly content and marketing, but developers control the technical foundations.</p>
<p>The <b><code>&lt;title&gt;</code></b> is the most important on-page signal and the headline in search results: unique per page, descriptive, main keyword first, around 50–60 characters (<code>React Hooks Tutorial: useState and useEffect | Forge Academy</code>). The <b>meta description</b> (around 150 characters) doesn't affect ranking directly but is often shown as the snippet, so write it to earn the click. Add a <b>canonical</b> link to tell search engines the preferred URL when the same content is reachable at several URLs.</p>
<p><b>Headings and structure</b>: one <code>&lt;h1&gt;</code> describing the page, then <code>h2</code>/<code>h3</code> in order. Use semantic elements (<code>main</code>, <code>article</code>, <code>nav</code>), descriptive link text ("read the pricing guide", not "click here"), and readable URLs (<code>/courses/react-hooks</code>). Content must be in the HTML: pages that render only in the browser after JavaScript runs can be indexed late or poorly, which is one reason for server-side rendering or static generation.</p>
<p><b>Open Graph</b> (and Twitter/X card) tags control how links look when shared on LinkedIn, WhatsApp, Slack and others: title, description and a 1200×630 image. <b>Structured data</b> (JSON-LD with schema.org types like Article, Product, FAQ, Course) can earn rich results.</p>
<p><b>robots.txt</b> tells crawlers which paths not to crawl (it isn't security: it's public and advisory). A <b>sitemap.xml</b> lists your important URLs; submit it in Google Search Console, which also shows indexing problems. Finally, performance (Core Web Vitals), mobile-friendliness and HTTPS also affect rankings.</p>`,
      lang: "html",
      code: `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>React Hooks Tutorial: useState and useEffect | Forge Academy</title>
  <meta name="description" content="Learn React hooks with runnable examples: state, effects, custom hooks and common mistakes. Free lesson with exercises and a quiz.">
  <link rel="canonical" href="https://forge-academy-learn.vercel.app/react/hooks">

  <!-- Open Graph / social previews -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="React Hooks Tutorial: useState and useEffect">
  <meta property="og:description" content="Runnable examples, an exercise and a quiz.">
  <meta property="og:image" content="https://forge-academy-learn.vercel.app/og/react-hooks.png"> <!-- 1200x630 -->
  <meta property="og:url" content="https://forge-academy-learn.vercel.app/react/hooks">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Structured data -->
  <script type="application/ld+json">
  { "@context": "https://schema.org", "@type": "Course",
    "name": "React Hooks", "description": "State, effects and custom hooks with exercises.",
    "provider": { "@type": "Organization", "name": "Forge Academy" } }
  </script>
</head>

<!-- /robots.txt -->
<!--
User-agent: *
Disallow: /admin/
Disallow: /api/
Sitemap: https://forge-academy-learn.vercel.app/sitemap.xml
-->

<!-- /sitemap.xml -->
<!--
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://forge-academy-learn.vercel.app/</loc><lastmod>2026-10-18</lastmod></url>
  <url><loc>https://forge-academy-learn.vercel.app/react/hooks</loc><lastmod>2026-10-18</lastmod></url>
</urlset>
-->`,
      ex: "Audit your portfolio or a project site: give every page a unique title and description, one h1, a canonical URL, Open Graph tags with a 1200×630 image, JSON-LD for the main page type, a robots.txt and a sitemap. Test social previews with a link-preview tool and the page in Lighthouse's SEO audit, and fix everything it flags.",
      q: ["Does adding a path to robots.txt keep it private?", ["Yes, crawlers and people can't access it", "No: robots.txt is public and only asks well-behaved crawlers not to crawl; protect private pages with authentication", "Yes, if the site uses HTTPS", "Only on Google"], 1, "robots.txt is advisory and publicly readable. It can even reveal the paths you'd rather hide."]
    }
  ]
});

COURSE.push({
  n: 56, id: "css-lessons", fills: "css", title: "CSS and responsive layout", level: 1,
  blurb: "The cascade, modern layout, responsive design and motion.",
  lessons: [
    {
      t: "Selectors, specificity and the cascade",
      sub: ["Selector types", "Specificity and inheritance", "The box model", "Units: px, rem, %, vw"],
      body: `<p><b>Selectors</b> choose which elements a rule applies to: type (<code>p</code>), class (<code>.card</code>), ID (<code>#main</code>), attribute (<code>[type="email"]</code>), pseudo-classes for state (<code>:hover</code>, <code>:focus-visible</code>, <code>:first-child</code>, <code>:not()</code>), pseudo-elements (<code>::before</code>, <code>::placeholder</code>) and combinators (<code>.nav a</code> descendant, <code>.list &gt; li</code> child, <code>h2 + p</code> adjacent sibling).</p>
<p>When several rules set the same property, the <b>cascade</b> decides the winner: first by origin and importance (<code>!important</code>, best avoided), then by <b>specificity</b>, then by order (later wins). Specificity is compared as three numbers: (IDs, classes/attributes/pseudo-classes, elements). <code>#nav .link</code> = (1,1,0) beats <code>.nav .link:hover</code> = (0,3,0). Keep specificity low and flat (mostly single classes) so styles are easy to override. <code>:where()</code> has zero specificity, handy for defaults.</p>
<p><b>Inheritance</b>: text properties (<code>color</code>, <code>font</code>, <code>line-height</code>) pass from parents to children; box properties (margins, borders) don't. Set typography once on <code>body</code>.</p>
<p>The <b>box model</b>: every element is content + padding + border + margin. By default <code>width</code> sets only the content, so padding and borders make boxes bigger than expected; <code>box-sizing: border-box</code> includes them, which almost every project sets globally. Vertical margins between blocks can collapse into one.</p>
<p><b>Units</b>: <code>px</code> for borders and fine details; <b><code>rem</code></b> (relative to the root font size) for font sizes and spacing, so everything scales when users change their browser font size; <code>em</code> relative to the current element's font size; <code>%</code> relative to the parent; <code>vw</code>/<code>vh</code> relative to the viewport (use <code>dvh</code> on mobile, which accounts for browser toolbars); <code>ch</code> for line lengths (<code>max-width: 65ch</code>).</p>`,
      lang: "css",
      code: `/* Sensible global base */
*, *::before, *::after { box-sizing: border-box; }
html { font-size: 100%; }                 /* respects the user's browser setting (usually 16px) */
body { margin: 0; font: 1rem/1.6 system-ui, sans-serif; color: #1d2433; }

/* Specificity in practice */
.button { background: #2a6df4; color: white; }            /* (0,1,0) */
.card .button { background: #1a4fc0; }                    /* (0,2,0) wins inside cards */
#hero .button { background: black; }                      /* (1,1,0) hard to override: avoid IDs */
:where(.prose) a { color: inherit; }                      /* (0,0,1): easy to override */

/* State selectors */
.button:hover { filter: brightness(1.1); }
.button:focus-visible { outline: 3px solid #f2cf4e; outline-offset: 2px; }  /* keyboard focus */
.input:user-invalid { border-color: #c62828; }
li:not(:last-child) { border-bottom: 1px solid #e3e6ec; }

/* The box model */
.card {
  width: 320px;           /* with border-box: the total width really is 320px */
  padding: 1.5rem;        /* 24px at default size, scales with user settings */
  border: 1px solid #e3e6ec;
  margin-block: 1rem;
}

/* Units */
.prose { max-width: 65ch; }               /* comfortable line length */
.hero { min-height: 100dvh; }             /* full screen, mobile-toolbar aware */
h1 { font-size: 2.5rem; }
.icon { width: 1em; height: 1em; }        /* scales with the surrounding text */`,
      ex: "Write ten CSS rules that target the same button in different ways, predict which wins for each pair using specificity, then check in DevTools (the Styles panel shows overridden rules struck through). Then build a card component using rem for spacing and type and border-box sizing, and test it with the browser's font size set to 'very large'.",
      q: ["Which selector has the highest specificity?", ["div p span", ".menu .item", "#sidebar a", "a:hover"], 2, "One ID (1,0,0) outweighs any number of classes and elements. #sidebar a is (1,0,1)."]
    },
    {
      t: "Flexbox and Grid in depth",
      sub: ["Flex direction, wrap, grow, shrink", "Grid templates and areas", "Alignment", "When to use which"],
      body: `<p><b>Flexbox</b> lays items out in one dimension, a row or a column. On the container: <code>display: flex</code>, <code>flex-direction</code> (row or column), <code>flex-wrap: wrap</code> (let items move to new lines), <code>gap</code>. On items, <code>flex: grow shrink basis</code>: <code>flex: 1</code> means "share the free space equally"; <code>flex: 0 0 200px</code> means "exactly 200px"; <code>flex: 1 1 250px</code> with wrapping gives cards that are at least 250px and fill the row. Set <code>min-width: 0</code> on flex children holding long text so they can shrink instead of overflowing.</p>
<p><b>Grid</b> lays out in two dimensions, rows and columns together. <code>grid-template-columns: 240px 1fr</code> creates a sidebar and a flexible main area (<code>fr</code> = a fraction of free space). <code>repeat(auto-fill, minmax(220px, 1fr))</code> makes a responsive card grid with no media queries. <b>Named areas</b> (<code>grid-template-areas</code>) make page layouts readable and easy to rearrange at breakpoints. Items can span with <code>grid-column: span 2</code>. <b>Subgrid</b> lets nested elements align to the parent grid's tracks.</p>
<p><b>Alignment</b> works the same in both: <code>justify-content</code> distributes along the main axis (flex) or inline axis (grid); <code>align-items</code> aligns on the cross axis; <code>place-items: center</code> centres in both directions in grid. <code>margin-left: auto</code> on a flex item pushes it (and everything after) to the end, the classic way to right-align a header's login button.</p>
<p><b>Which?</b> Flexbox when content decides the size and items flow in a line (navbars, button groups, centring, tags). Grid when you design the layout first and place content into it (page structure, card galleries, forms, dashboards). Most pages use both: grid for the skeleton, flex inside components.</p>`,
      lang: "css",
      code: `/* Header: flexbox, logo left, nav middle, button pushed right */
.header { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; }
.header .login { margin-left: auto; }

/* Wrapping chips that fill rows */
.tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tags > * { flex: 0 0 auto; }

/* Media object: image fixed, text flexible and allowed to shrink */
.media { display: flex; gap: 1rem; align-items: flex-start; }
.media img { flex: 0 0 64px; }
.media .body { flex: 1; min-width: 0; }       /* lets long words/URLs wrap instead of overflow */

/* Responsive card grid: no media queries needed */
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }

/* Page layout with named areas, rearranged on small screens */
.page {
  display: grid;
  min-height: 100dvh;
  grid-template-columns: 260px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}
.page > header { grid-area: header; }
.page > aside  { grid-area: sidebar; }
.page > main   { grid-area: main; min-width: 0; }
.page > footer { grid-area: footer; }
@media (max-width: 760px) {
  .page { grid-template-columns: 1fr; grid-template-areas: "header" "main" "sidebar" "footer"; }
}

/* Perfect centring */
.center { display: grid; place-items: center; min-height: 50vh; }

/* Dashboard tile spanning two columns */
.tile.wide { grid-column: span 2; }`,
      ex: "Build a dashboard page with Grid named areas (header, sidebar, main, footer) that becomes a single column on phones, a responsive card grid using auto-fill and minmax, a flexbox header with the account button pushed right, and a list of media objects with long text that doesn't overflow. Inspect it with the DevTools grid and flex overlays.",
      q: ["Which CSS creates a card grid that automatically fits as many 220px-minimum columns as the width allows?", ["display: flex; flex-direction: column", "grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))", "float: left; width: 220px", "grid-template-columns: 220px"], 1, "auto-fill with minmax creates as many columns as fit, each at least 220px, stretching to share leftover space."]
    },
    {
      t: "Responsive design",
      sub: ["Mobile first", "Media and container queries", "Fluid type with clamp()", "Responsive images"],
      body: `<p>Most users browse on phones, so design and code <b>mobile first</b>: write base styles for small screens (single column, larger tap targets, readable text), then add complexity for wider screens with <code>min-width</code> media queries. Mobile-first CSS is usually simpler, because layouts get more complex as space grows rather than having to be undone. Always include the viewport meta tag, and test on real phones as well as DevTools device mode.</p>
<p><b>Media queries</b> respond to the viewport: <code>@media (min-width: 48rem)</code>. Choose breakpoints where <i>your content</i> breaks, not by device names. They also respond to user preferences: <code>prefers-color-scheme</code> (dark mode), <code>prefers-reduced-motion</code>, <code>hover</code> and <code>pointer</code> (touch versus mouse).</p>
<p><b>Container queries</b> respond to the size of a component's container instead of the screen, so the same card can be compact in a narrow sidebar and wide in the main area. Mark the parent with <code>container-type: inline-size</code>, then use <code>@container (min-width: 30rem)</code>. They make components truly reusable.</p>
<p><b>Fluid typography</b> with <code>clamp(min, preferred, max)</code> scales smoothly between sizes without breakpoints: <code>font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem)</code>. Mixing <code>rem</code> into the preferred value keeps it responsive to user zoom.</p>
<p><b>Responsive images</b>: <code>max-width: 100%; height: auto</code> stops images overflowing; <code>srcset</code>/<code>sizes</code> serve smaller files to small screens; <code>&lt;picture&gt;</code> with media can swap to a differently cropped image (art direction); <code>object-fit: cover</code> crops images neatly inside fixed boxes.</p>`,
      lang: "css",
      code: `/* Mobile-first base */
.layout { display: grid; gap: 1rem; padding: 1rem; }
.nav-links { display: none; }                      /* phone: menu button instead */
button, .tap { min-height: 44px; }                 /* comfortable touch targets */

/* Wider screens add complexity */
@media (min-width: 48rem) {                        /* ~768px, where this layout needs it */
  .layout { grid-template-columns: 220px 1fr; padding: 2rem; }
  .nav-links { display: flex; gap: 1.5rem; }
  .menu-button { display: none; }
}
@media (min-width: 75rem) {
  .layout { grid-template-columns: 260px 1fr 300px; }
}

/* Fluid type: no breakpoints */
h1 { font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem); line-height: 1.15; }
.section { padding-block: clamp(2rem, 5vw, 5rem); }

/* Container queries: the card adapts to where it is placed */
.card-slot { container-type: inline-size; }
.card { display: grid; gap: 0.75rem; }
@container (min-width: 30rem) {
  .card { grid-template-columns: 160px 1fr; align-items: start; }
}

/* Images */
img { max-width: 100%; height: auto; }
.avatar { width: 48px; aspect-ratio: 1; object-fit: cover; border-radius: 50%; }

/* Respect user preferences */
@media (prefers-color-scheme: dark) {
  :root { --bg: #0f1218; --text: #e7eaf0; }
}
@media (hover: hover) {
  .card:hover { transform: translateY(-2px); }     /* hover effects only where hover exists */
}`,
      ex: "Rebuild a landing page mobile-first: base styles for 360px, then two breakpoints chosen where the layout breaks. Use clamp() for headings and section spacing, a card component that uses container queries to switch layouts in a sidebar versus the main area, and responsive images with srcset. Test at 320px, 768px and 1440px, and on a real phone.",
      q: ["What's the main advantage of container queries over media queries for components?", ["They are faster", "A component adapts to the space its container gives it, so it works anywhere on the page regardless of screen size", "They replace flexbox", "They work without CSS"], 1, "Media queries only know the viewport. A card in a narrow sidebar on a wide screen needs to respond to its container."]
    },
    {
      t: "Animations and modern CSS",
      sub: ["Transitions and keyframes", "Transforms", "prefers-reduced-motion", ":has(), nesting and layers"],
      body: `<p><b>Transitions</b> animate between two states when a property changes (on hover, focus, or a class toggle): <code>transition: transform 200ms ease-out</code>. <b>Keyframe animations</b> run multi-step sequences, loop or start automatically (<code>@keyframes</code> plus <code>animation</code>). Keep UI animations short (150–300 ms) and purposeful: showing cause and effect, guiding attention, softening changes.</p>
<p><b>Transforms</b> (<code>translate</code>, <code>scale</code>, <code>rotate</code>) and <code>opacity</code> are the properties to animate, because the browser can animate them on the GPU without recalculating layout. Animating <code>width</code>, <code>height</code>, <code>top</code> or <code>margin</code> triggers layout every frame and looks janky on slower phones.</p>
<p><b>prefers-reduced-motion</b>: some people get dizzy or nauseous from motion (vestibular disorders). Respect the operating system setting by reducing or removing non-essential animation, especially large movements, parallax and auto-playing effects.</p>
<p>Modern CSS has removed the need for much JavaScript and preprocessor code:</p>
<ul><li><b><code>:has()</code></b>, the "parent selector": style an element based on what it contains, such as a card with an image, a form group with an invalid input, or the page when a modal is open.</li>
<li><b>Nesting</b> is now native: write <code>.card { &amp;:hover {} .title {} }</code> without Sass.</li>
<li><b>Cascade layers</b> (<code>@layer reset, base, components, utilities;</code>) control which groups of styles win regardless of specificity, making it easy to combine resets, libraries and your own code.</li>
<li><b>Custom properties</b> (CSS variables) for theming, and <code>color-mix()</code> for colour variations.</li></ul>`,
      lang: "css",
      code: `@layer reset, base, components, utilities;      /* later layers win, whatever the specificity */

@layer components {
  .card {
    --lift: -4px;
    border-radius: 12px;
    background: var(--surface);
    transition: transform 200ms ease-out, box-shadow 200ms ease-out;

    &:hover { transform: translateY(var(--lift)); box-shadow: 0 8px 24px rgb(0 0 0 / 0.12); }
    & .title { font-weight: 600; }

    /* :has(): different layout when the card contains an image */
    &:has(img) { display: grid; grid-template-columns: 120px 1fr; gap: 1rem; }
  }

  /* Highlight a form group containing an invalid field */
  .field:has(input:user-invalid) label { color: #c62828; }

  /* Lock page scroll while a dialog is open, no JavaScript class needed */
  body:has(dialog[open]) { overflow: hidden; }

  .toast { animation: slide-in 250ms ease-out both; }
  .spinner { animation: spin 0.8s linear infinite; }
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(1turn); } }

/* Respect reduced-motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@layer utilities {
  .muted { color: color-mix(in srgb, var(--text) 60%, transparent); }
}`,
      ex: "Add motion to a project: a hover lift on cards, a slide-in toast with keyframes, a loading spinner and a smooth dialog open animation, all using only transform and opacity. Record a Performance profile in DevTools to confirm no layout work happens during the animations, turn on reduced motion in your OS and check it's respected, and refactor one component to use native nesting and :has().",
      q: ["Why animate transform instead of top/left to move an element?", ["top/left can't be animated", "Transform can be animated by the compositor without recalculating layout each frame, giving smoother motion", "Transform works only in Chrome", "top/left are deprecated"], 1, "Layout recalculation every frame is expensive. Transform and opacity changes skip layout and paint, so animations stay at 60fps."]
    }
  ]
});
