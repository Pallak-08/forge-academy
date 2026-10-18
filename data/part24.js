/* Forge Academy lessons: QA fundamentals, test automation, LLM streaming and cost */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 76, id: "qa-fundamentals-lessons", fills: "qa-fundamentals", title: "QA and testing fundamentals", level: 1,
  blurb: "How quality is planned, designed, tested and reported.",
  lessons: [
    {
      t: "Quality in the software lifecycle",
      sub: ["SDLC and STLC", "Agile and the tester's role", "Verification vs validation", "Shift-left testing"],
      body: `<p>The <b>software development lifecycle</b> (SDLC) runs from requirements through design, development, testing, release and maintenance. The <b>software testing lifecycle</b> (STLC) runs alongside it: requirement analysis (what needs testing, what's testable), test planning (scope, approach, environments, schedule), test case design, environment setup, test execution, and test closure (reporting, lessons learned).</p>
<p>In <b>Agile</b> teams, testing isn't a phase at the end. Testers (often titled QA engineer or SDET) are part of the team from the start: they clarify <b>acceptance criteria</b> in refinement ("what exactly happens if the coupon has expired?"), design tests while features are built, test each story within the sprint, automate regression checks, and help define the team's <b>definition of done</b>. Quality is the whole team's responsibility; QA brings the testing expertise and the user's perspective.</p>
<p><b>Verification</b> asks "are we building the product right?": does it match the specification (reviews, inspections, tests against requirements). <b>Validation</b> asks "are we building the right product?": does it actually meet users' needs (user acceptance testing, usability testing, beta feedback). A feature can pass every test against a flawed spec and still fail users.</p>
<p><b>Shift-left testing</b> moves quality activities earlier, because defects found in requirements or design cost a fraction of those found in production: reviewing requirements for ambiguity, testing APIs before the UI exists, unit tests written with the code, static analysis in pull requests and quick automated checks in CI. <b>Shift-right</b> complements it with monitoring, feature flags and testing in production safely.</p>`,
      lang: "markdown",
      code: `## User story with testable acceptance criteria (Given / When / Then)

**Story:** As a shopper, I want to apply a coupon at checkout so that I pay less.

**Acceptance criteria**
1. Given a valid coupon "SAVE10" and a cart of Rs 1,000,
   when I apply it, then the total shows Rs 900 and the discount line shows -Rs 100.
2. Given an expired coupon, when I apply it,
   then I see "This coupon expired on 30 Sep" and the total is unchanged.
3. Given a coupon with a minimum order of Rs 500 and a cart of Rs 400,
   when I apply it, then I see "Add Rs 100 more to use this coupon".
4. Only one coupon can be applied; applying a second replaces the first.
5. Coupon codes are case-insensitive and surrounding spaces are ignored.

**Questions QA raised in refinement (shift left)**
- What if the discount makes the total negative? (Answer: floor at Rs 0.)
- Does the coupon apply before or after delivery charges? (Answer: before.)
- What happens to an applied coupon if items are removed below the minimum?

## Definition of done (team agreement)
- [ ] Acceptance criteria verified; edge cases tested
- [ ] Unit and API tests added and passing in CI
- [ ] Regression suite green; no open critical/high bugs
- [ ] Accessibility checked (keyboard, labels, contrast)
- [ ] Product owner accepted the story on staging`,
      ex: "Take three user stories from an app you use (or invent them) and rewrite each with five testable Given/When/Then acceptance criteria. List at least three ambiguous points per story you'd raise in refinement, and write a definition of done for a small team. Then explain, with one example each, a verification activity and a validation activity for the coupon feature.",
      q: ["A feature passes every test written against its specification, but users find it confusing and don't use it. What failed?", ["Verification", "Validation: the product doesn't meet users' real needs even though it matches the spec", "Unit testing", "Nothing"], 1, "Verification checks conformance to the spec; validation checks that the spec itself solves the user's problem."]
    },
    {
      t: "Types and levels of testing",
      sub: ["Unit, integration, system, acceptance", "Functional vs non-functional", "Smoke, sanity and regression", "Exploratory testing"],
      body: `<p><b>Levels of testing</b> differ in scope:</p>
<ul><li><b>Unit</b>: a single function or component in isolation, usually written by developers.</li>
<li><b>Integration</b>: components working together, such as an API with its database, or two services.</li>
<li><b>System</b>: the complete, integrated application tested end to end against requirements, in a production-like environment.</li>
<li><b>Acceptance</b>: confirming the system meets business needs and is ready to release, often user acceptance testing (UAT) by business users or the product owner.</li></ul>
<p><b>Functional testing</b> checks <i>what</i> the system does (features behave as specified). <b>Non-functional testing</b> checks <i>how well</i>: performance and load, security, usability, accessibility, compatibility across browsers and devices, reliability and recovery, localisation.</p>
<p>Common test types by purpose:</p>
<ul><li><b>Smoke testing</b>: a quick, broad check that a new build's critical functions work at all (app loads, login works, main page renders) before deeper testing. Often automated right after every deploy.</li>
<li><b>Sanity testing</b>: a narrow, focused check that a specific fix or change works, before running more.</li>
<li><b>Regression testing</b>: re-checking existing functionality after changes, to catch things that broke. The main candidate for automation, because it's repetitive.</li>
<li><b>Exploratory testing</b>: simultaneous learning, test design and execution, guided by the tester's curiosity and experience rather than scripts. Structure it with <b>charters</b> ("Explore the checkout with unusual payment situations to discover failures") and time-boxed sessions, taking notes. It finds the bugs scripted tests don't anticipate.</li></ul>`,
      lang: "markdown",
      code: `## Test approach for a food-ordering web app (excerpt)

| Level / type      | What                                         | Who / how              | When              |
|-------------------|----------------------------------------------|------------------------|-------------------|
| Unit              | price calc, coupon rules, validators         | devs, pytest/Jest      | every commit      |
| Integration       | API + DB, payment gateway sandbox            | devs + QA, API tests   | every PR          |
| System            | full flows on staging                        | QA, automated + manual | every release     |
| Acceptance (UAT)  | restaurant onboarding, refunds               | ops team + PO          | before release    |
| Smoke             | home loads, login, search, add to cart       | automated, 3 min       | after each deploy |
| Regression        | 180 automated end-to-end + API checks        | CI nightly + pre-release | nightly         |
| Performance       | 500 concurrent orders at dinner peak         | k6                     | before big events |
| Security          | auth, payments, OWASP checks                 | ZAP + review           | each release      |
| Accessibility     | keyboard, screen reader, contrast            | axe + manual           | each release      |
| Compatibility     | Chrome, Safari iOS, Android Chrome, 360px    | BrowserStack / devices | each release      |

## Exploratory session charter
Charter:   Explore checkout with interrupted and unusual payments
           to discover failures in order state and user messaging
Time box:  60 minutes      Tester: R. Iyer      Build: 2.14.0 (staging)
Ideas:     back button during UPI redirect, two tabs paying, network off mid-payment,
           coupon removed after payment starts, very large cart, emoji in instructions
Notes:     ...
Bugs:      BUG-412 order shows "failed" but money debited when network drops after redirect
Questions: should a pending UPI payment block a second attempt?`,
      ex: "For a web app of your choice, write a one-page test approach covering each level and the main non-functional types, with who, how and when. Then run two 45-minute exploratory sessions with written charters, taking notes, and log every issue you find with steps to reproduce.",
      q: ["A new build has just been deployed to staging. Which test should run first?", ["A full regression suite", "A smoke test: a quick check that critical functions work at all", "A week-long load test", "User acceptance testing"], 1, "Smoke tests quickly reveal broken builds, so no time is wasted running deeper tests on something fundamentally broken."]
    },
    {
      t: "Test design techniques",
      sub: ["Equivalence partitioning", "Boundary value analysis", "Decision tables", "State transition testing"],
      body: `<p>You can never test every input, so test design techniques choose a small set of tests most likely to find defects.</p>
<p><b>Equivalence partitioning</b> divides inputs into groups the system should treat the same way, then tests one value from each group. For an age field accepting 18–60: below 18 (invalid), 18–60 (valid), above 60 (invalid), plus non-numbers and empty input. If one value in a partition works, the others probably do too.</p>
<p><b>Boundary value analysis</b>: defects cluster at the edges, because developers write <code>&lt;</code> when they mean <code>&lt;=</code>. Test at and just around each boundary: 17, 18, 19 and 59, 60, 61. Combined with partitioning, this catches a large share of input-handling bugs with few tests.</p>
<p><b>Decision tables</b> handle combinations of conditions. List the conditions (is a member? order over Rs 999? has a coupon?) and the resulting actions (free delivery? discount?) in a table, one column per combination (rule). Each rule becomes a test, and the table often exposes combinations nobody specified.</p>
<p><b>State transition testing</b> suits anything with states and events: orders (placed → paid → shipped → delivered, or cancelled, refunded), user accounts, bookings. Draw the state diagram, then test every valid transition, and also invalid ones (can a delivered order be cancelled? what happens if payment confirmation arrives twice?). Invalid transitions are a rich source of bugs.</p>
<p>Other useful techniques: pairwise testing for many configuration options, error guessing from experience, and use-case or user-journey testing.</p>`,
      lang: "text",
      code: `REQUIREMENT: Delivery is free for members, or for anyone with an order >= Rs 999.
             A coupon gives 10% off but cannot be combined with member pricing.

1) EQUIVALENCE PARTITIONS + BOUNDARIES for order total (Rs)
   invalid: < 0, non-numeric, empty
   partition A: 0 .. 998   (delivery charged)     test 0, 500, 998
   partition B: >= 999     (free delivery)        test 999, 1000, 50000
   boundary tests: 998 | 999 | 1000

2) DECISION TABLE
                         R1   R2   R3   R4   R5   R6   R7   R8
   Member?               Y    Y    Y    Y    N    N    N    N
   Total >= 999?         Y    Y    N    N    Y    Y    N    N
   Coupon applied?       Y    N    Y    N    Y    N    Y    N
   ---------------------------------------------------------
   Free delivery         Y    Y    Y    Y    Y    Y    N    N
   10% coupon discount   N*   -    N*   -    Y    -    Y    -
   * coupon rejected with message "Coupons can't be combined with member pricing"
   -> R1/R3 revealed a gap: the spec didn't say what message to show. Raised with PO.

3) STATE TRANSITIONS: order
   [placed] --pay--> [paid] --ship--> [shipped] --deliver--> [delivered]
      |                |                                         |
   cancel           cancel/refund                           return (7 days)
      v                v                                         v
   [cancelled]     [refunded]                               [returned]
   valid tests:   every arrow above
   invalid tests: cancel a delivered order, ship an unpaid order,
                  "pay" event received twice (must not double-charge), refund a cancelled order`,
      ex: "For a 'student scholarship eligibility' feature (marks 0–100, family income, category, attendance percentage), apply all four techniques: list partitions and boundary values for each input, build a decision table for eligibility rules you define, draw the application's state diagram (draft, submitted, under review, approved, rejected, disbursed) and derive valid and invalid transition tests. Count how many tests you need versus testing combinations exhaustively.",
      q: ["A field accepts quantities from 1 to 10. Which set of values best applies boundary value analysis?", ["1, 5, 10", "0, 1, 2, 9, 10, 11", "3, 4, 5, 6", "-100, 100"], 1, "Testing just below, at and just above each boundary catches off-by-one mistakes like using < instead of <=."]
    },
    {
      t: "Test cases, bugs and reporting",
      sub: ["Writing clear test cases", "Bug reports that get fixed", "Severity vs priority", "Test plans and reports"],
      body: `<p>A <b>test case</b> is a repeatable check: an ID, a title stating what's verified, preconditions (logged in as a member, cart has 2 items), numbered steps, test data, and the <b>expected result</b>. Good test cases are specific enough that anyone can run them and get the same verdict, independent of other test cases, and traceable to a requirement or acceptance criterion. Organise them into suites (checkout, payments, accounts) in a test management tool (TestRail, Zephyr, Xray, or even a well-structured spreadsheet).</p>
<p>A <b>bug report</b> that gets fixed quickly has: a clear, specific title ("Total doesn't update after removing coupon on mobile Safari", not "checkout broken"); environment (build, browser and device, account type); exact <b>steps to reproduce</b>; expected versus actual results; evidence (screenshot, screen recording, console errors, network response, logs); frequency (always, or 3 times in 10); and impact. One bug per report. Reproduce it at least twice before filing, and look for the minimal steps.</p>
<p><b>Severity</b> is the technical impact (critical: crash, data loss, payment failure; high: major feature broken; medium: feature works with a workaround; low: cosmetic). <b>Priority</b> is how soon it should be fixed, decided with the product owner based on business impact. They differ: a misspelled company name on the home page is low severity but high priority; a crash in a rarely used admin export may be high severity but lower priority.</p>
<p>A <b>test plan</b> describes scope (in and out), approach, environments, entry and exit criteria, schedule, roles and risks. A <b>test summary report</b> at the end of a cycle gives: what was tested, pass/fail counts, open bugs by severity, risks, and a clear recommendation (ready to release, or not, and why).</p>`,
      lang: "markdown",
      code: `## Test case
**ID:** TC-CHK-014   **Requirement:** CHK-3 (coupons)   **Priority:** High
**Title:** Removing an applied coupon restores the original total
**Preconditions:** Logged in as a non-member; cart total Rs 1,200; coupon SAVE10 applied (total Rs 1,080)
**Steps:**
1. On the checkout page, click "Remove" next to the SAVE10 coupon.
2. Observe the order summary.
**Expected:** Discount line disappears; total shows Rs 1,200; "Apply coupon" field is empty and enabled.

## Bug report
**Title:** Total stays discounted after removing coupon (mobile Safari only)
**ID:** BUG-418   **Severity:** High (customer overcharged/undercharged risk)   **Priority:** P1 (decided with PO)
**Environment:** staging build 2.14.0 · iPhone 13, iOS 18, Safari · non-member account
**Steps to reproduce:**
1. Add items worth Rs 1,200 to cart and go to checkout.
2. Apply coupon SAVE10 -> total Rs 1,080 (correct).
3. Tap "Remove" next to the coupon.
**Expected:** Total returns to Rs 1,200.
**Actual:** Discount line disappears but total stays Rs 1,080. Paying charges Rs 1,080.
**Frequency:** 5/5 on Safari iOS; not reproducible on Chrome desktop or Android.
**Evidence:** screen recording attached; network tab shows PATCH /cart returns total 1200,
             so the UI isn't re-rendering the total (likely client-side state issue).

## Test summary report (release 2.14.0)
Executed 312 / 320 planned (8 blocked by sandbox outage) · Passed 296 · Failed 16
Open bugs: critical 0 · high 1 (BUG-418) · medium 5 · low 9
Recommendation: NOT READY until BUG-418 is fixed and retested; remaining issues acceptable per PO.`,
      ex: "Write 15 test cases for a sign-up and login feature (including password reset), using the template. Then test a real website or a demo app (such as an OWASP Juice Shop instance or a sample e-commerce demo), and file three bug reports with severity, priority, evidence and minimal steps. Finish with a one-page test summary report and a release recommendation.",
      q: ["The company's name is misspelled on the home page. How would it typically be classified?", ["High severity, low priority", "Low severity, high priority", "Critical severity, critical priority", "It's not a bug"], 1, "The technical impact is cosmetic (low severity), but the business visibility makes it urgent (high priority)."]
    }
  ]
});

COURSE.push({
  n: 77, id: "test-automation-lessons", fills: "test-automation", title: "Test automation", level: 2,
  blurb: "Frameworks, API and performance testing, and testing in CI.",
  lessons: [
    {
      t: "Automation frameworks and design",
      sub: ["Page object model", "Test data management", "Flaky tests and how to fix them", "Selenium vs Playwright vs Cypress"],
      body: `<p>Automated UI tests become a maintenance burden quickly unless they're designed like real software.</p>
<p>The <b>page object model</b> (POM) puts each page's or component's selectors and actions in one class (<code>LoginPage.login(email, password)</code>), so tests read like user journeys and a UI change means updating one place instead of fifty tests. Prefer <b>user-facing locators</b> (role and accessible name, label, visible text) or dedicated <code>data-testid</code> attributes over brittle CSS paths and XPath tied to layout.</p>
<p><b>Test data</b>: each test should create what it needs, ideally through the API or database rather than clicking through the UI (much faster), and clean up or use unique data (timestamps, UUIDs) so tests can run in parallel. Reuse logged-in sessions (saved storage state) instead of logging in through the UI in every test.</p>
<p><b>Flaky tests</b> pass and fail without code changes, and they destroy trust in the suite. Common causes and fixes: fixed sleeps (use auto-waiting and web-first assertions that retry until true); race conditions with async UI (wait for the specific element or network response); shared or leftover test data (isolate data); order dependence (make tests independent); unstable environments or third-party services (mock them). Quarantine flaky tests and fix them quickly; don't just add retries forever.</p>
<p><b>Tools</b>: <b>Selenium</b> (WebDriver) is the long-standing standard with bindings in every language and huge enterprise usage. <b>Cypress</b> runs inside the browser with an excellent interactive runner, JavaScript only. <b>Playwright</b> (Microsoft) supports Chromium, Firefox and WebKit, multiple languages, auto-waiting, parallelism, tracing and network mocking built in, and has become the most popular choice for new projects.</p>`,
      lang: "typescript",
      code: `// pages/LoginPage.ts : page object with user-facing locators
import { type Page, expect } from "@playwright/test";
export class LoginPage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto("/login"); }
  async login(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: "Sign in" }).click();
  }
  async expectError(text: string) { await expect(this.page.getByRole("alert")).toContainText(text); }
}

// pages/CartPage.ts
export class CartPage {
  constructor(private page: Page) {}
  total() { return this.page.getByTestId("cart-total"); }
  async applyCoupon(code: string) {
    await this.page.getByLabel("Coupon code").fill(code);
    await this.page.getByRole("button", { name: "Apply" }).click();
  }
}

// tests/checkout.spec.ts
import { test, expect } from "@playwright/test";
import { CartPage } from "../pages/CartPage";

test.use({ storageState: "playwright/.auth/member.json" });    // logged in once in a setup project

test("coupon gives 10% off", async ({ page, request }) => {
  // Arrange via API: fast and independent of other tests
  const cart = await (await request.post("/api/test/carts", { data: { items: [{ sku: "BOOK-1", qty: 2 }] } })).json();
  await page.goto(\`/cart/\${cart.id}\`);

  const cartPage = new CartPage(page);
  await cartPage.applyCoupon("SAVE10");
  await expect(cartPage.total()).toHaveText("₹900.00");        // web-first assertion: retries until true, no sleeps
});

test("expired coupon shows a clear error", async ({ page }) => {
  await page.route("**/api/coupons/*", (route) =>                // mock an edge case deterministically
    route.fulfill({ status: 422, json: { error: "This coupon expired on 30 Sep" } }));
  await page.goto("/cart/demo");
  await new CartPage(page).applyCoupon("OLD50");
  await expect(page.getByRole("alert")).toHaveText(/expired on 30 Sep/);
});
// Flaky pattern to avoid:  await page.waitForTimeout(3000);`,
      ex: "Automate 10 UI tests for a demo e-commerce site (or your own app) with Playwright using page objects, user-facing locators, API-based setup and a saved login state. Then deliberately write two flaky tests (a fixed sleep and shared data), run the suite 20 times with <code>--repeat-each</code> to expose the flakiness, and fix both.",
      q: ["What's the best fix for a UI test that fails intermittently because a button appears after an API call?", ["Add page.waitForTimeout(5000)", "Use auto-waiting locators and web-first assertions that wait for the button (or the specific network response)", "Retry the test 10 times", "Delete the test"], 1, "Fixed sleeps are slow and still flaky. Waiting for the exact condition is both faster and reliable."]
    },
    {
      t: "API testing",
      sub: ["Postman collections", "Contract testing", "Schema validation", "Testing auth flows"],
      body: `<p>API tests are faster, more stable and cheaper to maintain than UI tests, and most business logic is reachable through APIs, so a strong test suite leans heavily on them.</p>
<p><b>Postman</b> (or Bruno, Insomnia, Hoppscotch) lets you explore and test APIs manually, then save requests into <b>collections</b> with environments (base URLs, tokens per environment), variables passed between requests (create a user, then use its ID), and test scripts asserting status codes and response bodies. <b>Newman</b> or the Postman CLI runs collections in CI. For larger suites, code-based tests (pytest with httpx, Playwright's request fixture, REST Assured in Java, supertest in Node) are easier to review, refactor and version.</p>
<p>What to test for each endpoint: success responses (status, body, headers); input validation (missing fields, wrong types, boundaries, very long strings, special characters); error responses and their format; business rules; idempotency and duplicate submissions; pagination and filtering; and side effects (was the email queued, did the record change?).</p>
<p><b>Schema validation</b> checks the response <i>shape</i> against a JSON Schema or the OpenAPI spec, catching removed fields and changed types. Tools like Schemathesis go further, generating many inputs from the OpenAPI spec automatically (property-based testing) to find crashes.</p>
<p><b>Contract testing</b> (Pact) verifies that a provider still satisfies the expectations its consumers recorded, without running the whole system together.</p>
<p><b>Auth flows</b> deserve thorough tests: no token (401), invalid or expired token (401), valid token without permission (403), another user's resource (403 or 404), token refresh, and logout invalidating the session.</p>`,
      lang: "python",
      code: `# tests/api/test_orders_api.py  (pytest + httpx + jsonschema)
import os, uuid, httpx, pytest
from jsonschema import validate

BASE = os.environ.get("API_URL", "http://localhost:8000")
ORDER_SCHEMA = {
  "type": "object", "required": ["id", "total", "status", "items"],
  "properties": {"id": {"type": "string"}, "total": {"type": "integer", "minimum": 0},
                 "status": {"enum": ["pending", "paid", "refunded"]}, "items": {"type": "array", "minItems": 1}},
}

@pytest.fixture(scope="session")
def token_a():  return login("alice@example.test", os.environ["TEST_PASSWORD"])
@pytest.fixture(scope="session")
def token_b():  return login("bob@example.test", os.environ["TEST_PASSWORD"])

def auth(t): return {"Authorization": f"Bearer {t}"}

def test_create_order_returns_valid_schema(token_a):
    r = httpx.post(f"{BASE}/orders", json={"items": ["BOOK-1"]},
                   headers={**auth(token_a), "Idempotency-Key": str(uuid.uuid4())})
    assert r.status_code == 201
    validate(r.json(), ORDER_SCHEMA)                       # shape and types, not just status

@pytest.mark.parametrize("body,field", [({}, "items"), ({"items": []}, "items"), ({"items": ["X" * 5000]}, "items")])
def test_create_order_validation(token_a, body, field):
    r = httpx.post(f"{BASE}/orders", json=body, headers=auth(token_a))
    assert r.status_code == 422 and field in r.text

def test_idempotency_key_prevents_duplicates(token_a):
    key = str(uuid.uuid4()); h = {**auth(token_a), "Idempotency-Key": key}
    first = httpx.post(f"{BASE}/orders", json={"items": ["BOOK-1"]}, headers=h).json()
    second = httpx.post(f"{BASE}/orders", json={"items": ["BOOK-1"]}, headers=h).json()
    assert first["id"] == second["id"]

# Auth matrix
def test_no_token_is_401():
    assert httpx.get(f"{BASE}/orders").status_code == 401
def test_cannot_read_other_users_order(token_a, token_b):
    order = httpx.post(f"{BASE}/orders", json={"items": ["BOOK-1"]}, headers=auth(token_a)).json()
    assert httpx.get(f"{BASE}/orders/{order['id']}", headers=auth(token_b)).status_code in (403, 404)

# Property-based fuzzing from the OpenAPI spec:
#   schemathesis run http://localhost:8000/openapi.json --checks all`,
      ex: "Pick a public practice API (Restful Booker, the Swagger Petstore or your own) and build: a Postman collection with environments and chained requests run through Newman, and a code-based suite covering success, validation, error formats, schema validation and an auth matrix. Run Schemathesis against an OpenAPI spec and triage what it finds. Run both suites in GitHub Actions.",
      q: ["Why validate an API response against a schema instead of only checking the status code?", ["Schemas make the API faster", "A 200 response can still have missing fields or wrong types that break clients; schema validation catches structural regressions", "Status codes are unreliable", "It's required by HTTP"], 1, "Clients depend on the response shape. Schema checks catch removed fields and type changes that status codes never reveal."]
    },
    {
      t: "Performance and load testing",
      sub: ["Load, stress and soak tests", "k6 and JMeter", "Reading latency percentiles", "Finding bottlenecks"],
      body: `<p>Performance testing answers: does the system stay fast and correct under realistic and extreme traffic? Types:</p>
<ul><li><b>Load test</b>: expected peak traffic (for example 500 concurrent users at the dinner rush). Do response times and error rates meet targets?</li>
<li><b>Stress test</b>: increase load beyond expectations until it breaks. Where's the limit, and does it fail gracefully and recover?</li>
<li><b>Spike test</b>: a sudden jump (a sale starts, a push notification goes out).</li>
<li><b>Soak (endurance) test</b>: moderate load for hours to find memory leaks, connection exhaustion and slow degradation.</li></ul>
<p><b>Tools</b>: <b>k6</b> (scripts in JavaScript, developer-friendly, great in CI, thresholds that fail the run), <b>JMeter</b> (GUI-based, long-established in enterprises), Gatling, Locust (Python). Model realistic user behaviour: a mix of endpoints, think time between actions, realistic data, and ramp-up rather than instant load. Test in an environment sized like production, and never load-test systems you don't own.</p>
<p><b>Percentiles</b>: averages hide pain. <b>p50</b> (median) is the typical experience; <b>p95</b> and <b>p99</b> show the slowest 5% and 1% of requests, which with many users means many people. Set targets like "p95 under 400 ms and error rate under 1% at 500 virtual users", and watch throughput (requests per second) alongside.</p>
<p><b>Finding bottlenecks</b>: during the test, watch server metrics (CPU, memory, database connections, queue depth), database slow-query logs and traces. Typical culprits: missing indexes, N+1 queries, an exhausted connection pool, synchronous calls to slow external services, lack of caching, and undersized instances. Change one thing, re-run, compare.</p>`,
      lang: "javascript",
      code: `// load-test.js : run with  k6 run load-test.js
import http from "k6/http";
import { check, sleep, group } from "k6";

export const options = {
  scenarios: {
    dinner_rush: {
      executor: "ramping-vus",
      stages: [
        { duration: "2m", target: 100 },     // ramp up
        { duration: "5m", target: 500 },     // expected peak
        { duration: "2m", target: 0 },       // ramp down
      ],
    },
  },
  thresholds: {                              // the run FAILS if these are broken (useful in CI)
    http_req_failed: ["rate<0.01"],                          // < 1% errors
    "http_req_duration{name:menu}": ["p(95)<300"],
    "http_req_duration{name:checkout}": ["p(95)<800", "p(99)<1500"],
  },
};

const BASE = __ENV.BASE_URL || "https://staging.example.com";

export default function () {
  group("browse", () => {
    const r = http.get(\`\${BASE}/api/restaurants/42/menu\`, { tags: { name: "menu" } });
    check(r, { "menu 200": (res) => res.status === 200 });
    sleep(Math.random() * 3 + 1);            // think time: real users pause
  });
  group("order", () => {
    const r = http.post(\`\${BASE}/api/checkout\`,
      JSON.stringify({ items: [{ id: 7, qty: 2 }], payment: "test-upi" }),
      { headers: { "Content-Type": "application/json" }, tags: { name: "checkout" } });
    check(r, { "checkout 201": (res) => res.status === 201 });
    sleep(2);
  });
}

// Output to read:
//   http_req_duration{name:checkout}: avg=310ms p(90)=640ms p(95)=910ms p(99)=2.1s   <- p95 target broken
//   http_req_failed: 2.3%                                                            <- error threshold broken
// Next: check DB connections and slow queries during the run, fix, re-run.`,
      ex: "Write a k6 script with a realistic mix (browse, search, add to cart, checkout) and thresholds, and run load, spike and 30-minute soak tests against an app you own running locally or on staging. Record p50, p95, p99, throughput and error rate, identify the bottleneck using server metrics and slow-query logs, fix it, re-run and present the before/after numbers.",
      q: ["The average response time is 200 ms but p99 is 4 seconds. What does that mean?", ["Everything is fine", "Most requests are fast, but 1 in 100 takes about 4 seconds, which many users will hit; investigate the slow tail", "The test tool is broken", "The server is idle"], 1, "Averages hide tail latency. With heavy traffic, the slowest 1% affects a lot of real users and often reveals contention or slow dependencies."]
    },
    {
      t: "Testing in CI/CD",
      sub: ["Running suites on every pull request", "Parallel runs", "Reports and screenshots", "Quality gates"],
      body: `<p>Automated tests deliver value only if they run automatically and block bad changes. Arrange suites by speed and run them at the right moments:</p>
<ul><li><b>Every pull request</b>: lint, unit tests, API tests and a small set of critical end-to-end tests. Aim for under 10–15 minutes, or developers stop waiting for results.</li>
<li><b>After merge / on deploy to staging</b>: smoke tests against the deployed environment, then the broader regression suite.</li>
<li><b>Nightly or scheduled</b>: the full end-to-end regression across browsers, performance tests, security scans.</li>
<li><b>After production deploys</b>: smoke tests and synthetic monitoring of critical journeys.</li></ul>
<p><b>Parallel runs</b> keep long suites fast: run test files in parallel workers and <b>shard</b> across several CI machines (Playwright's <code>--shard=1/4</code>, pytest-xdist, CI matrix jobs). This requires tests to be independent, with isolated data.</p>
<p><b>Reports</b> make failures fast to diagnose: HTML reports (Playwright, Allure), JUnit XML for CI test summaries, and on failure screenshots, videos and traces (Playwright's trace viewer shows each step, DOM snapshots, console and network). Upload them as CI artifacts and link them in pull request comments.</p>
<p><b>Quality gates</b> are the rules a change must pass before it can merge or be released: required status checks (all tests green), no new critical issues from static analysis or dependency scans, coverage not decreasing on changed code, performance thresholds met, and for releases, a test summary with no open critical bugs. Gates must be fast and trustworthy, so fix flaky tests immediately; a gate people learn to override is worse than none.</p>`,
      lang: "yaml",
      code: `# .github/workflows/tests.yml
name: tests
on:
  pull_request:
  schedule: [ { cron: "30 20 * * *" } ]     # nightly full regression (02:00 IST)

jobs:
  unit-and-api:
    runs-on: ubuntu-latest
    services:
      postgres: { image: postgres:16, env: { POSTGRES_PASSWORD: test }, ports: ["5432:5432"],
                  options: "--health-cmd pg_isready --health-interval 5s --health-retries 5" }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12", cache: pip }
      - run: pip install -r requirements-dev.txt
      - run: pytest -n auto --junitxml=reports/junit.xml --cov=app --cov-fail-under=80
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: unit-report, path: reports/ }

  e2e:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix: { shard: [1, 2, 3, 4] }        # 4 machines in parallel
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci && npx playwright install --with-deps chromium
      - run: npx playwright test \${{ github.event_name == 'pull_request' && '--grep @critical' || '' }} --shard=\${{ matrix.shard }}/4
        env: { BASE_URL: "\${{ vars.STAGING_URL }}" }
      - uses: actions/upload-artifact@v4
        if: failure()                          # screenshots, videos, traces for debugging
        with: { name: "playwright-report-\${{ matrix.shard }}", path: playwright-report/ }

# playwright.config.ts (excerpt)
#   retries: process.env.CI ? 1 : 0,
#   reporter: [["html"], ["junit", { outputFile: "results.xml" }]],
#   use: { trace: "on-first-retry", screenshot: "only-on-failure", video: "retain-on-failure" }
#
# Branch protection (quality gate): require "unit-and-api" and "e2e" checks to pass before merging.`,
      ex: "Set up CI for a project with: unit and API tests with coverage on every pull request; critical end-to-end tests tagged @critical on pull requests and the full suite nightly, sharded across 4 machines; HTML and JUnit reports; and screenshots, videos and traces uploaded on failure. Make the checks required for merging, then break a test on purpose and diagnose it using only the uploaded trace.",
      q: ["Why run only a critical subset of end-to-end tests on pull requests and the full suite nightly?", ["Full suites can't run in CI", "Pull request feedback must be fast; the critical subset catches the most important breakages quickly, while the slower full regression still runs regularly", "Nightly runs are free", "To hide failing tests"], 1, "Fast feedback keeps developers productive. Layering suites by speed balances quick checks with thorough coverage."]
    }
  ]
});

COURSE.push({
  n: 78, id: "llm-apis-lessons", fills: "llm-apis", title: "LLM APIs", level: 2,
  blurb: "Streaming, cost control and choosing models.",
  lessons: [
    {
      t: "Streaming, cost and model choice",
      sub: ["Streaming tokens to a UI", "Token counting and cost", "Choosing a model per task", "Open vs hosted models"],
      body: `<p>LLM responses can take many seconds. <b>Streaming</b> sends tokens as they're generated, so users see text appear within a fraction of a second, which feels dramatically faster even when total time is the same. Provider SDKs expose streams of events; your backend forwards text deltas to the browser, typically with <b>Server-Sent Events</b> or a streaming HTTP response, and the UI appends them. Handle cancellation (the user navigates away or presses stop) by aborting the upstream request, which also stops paying for unused tokens.</p>
<p><b>Cost</b> is priced per million <b>input tokens</b> and <b>output tokens</b> (output usually costs several times more). A token is roughly three-quarters of an English word; other scripts, including many Indian languages, often use more tokens per word. Costs grow with long system prompts, chat history and retrieved documents sent on every call. Control them by: counting tokens before sending (SDK token-counting endpoints or tokenizers) and trimming history; setting <code>max_tokens</code>; <b>prompt caching</b> for large, repeated prefixes (system prompts, documents), which is much cheaper on cache hits; batch APIs for non-urgent bulk jobs at a discount; caching identical answers; and logging usage per feature and per user so you can see where money goes. Set budget alerts and per-user limits.</p>
<p><b>Choosing a model per task</b>: use the smallest, fastest model that meets the quality bar. Small models handle classification, extraction, routing and simple summaries cheaply and quickly; larger models handle complex reasoning, long documents, coding and agentic tasks. Decide with an <b>evaluation set</b> of real examples, comparing quality, latency and cost, rather than by benchmark headlines. Many apps route: a cheap model first, escalating to a stronger one when needed.</p>
<p><b>Hosted vs open-weight models</b>: hosted APIs give top quality, no infrastructure and fast iteration. Open-weight models (Llama, Mistral, Qwen, Gemma families) can run on your own infrastructure or with hosting providers, which helps with strict data residency, offline or on-device use, very high steady volume, or fine-tuning, at the cost of GPU operations, serving and keeping up with releases.</p>`,
      lang: "python",
      code: `# Backend: stream Claude's answer to the browser with Server-Sent Events (FastAPI + anthropic SDK)
import json, os
import anthropic
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
app = FastAPI()
SYSTEM = open("tutor_system_prompt.md").read()          # long, reused on every call -> cache it

@app.post("/api/ask")
async def ask(request: Request):
    body = await request.json()
    messages = body["messages"][-10:]                    # trim history to control input tokens

    async def events():
        async with client.messages.stream(
            model="claude-sonnet-5-5",                   # pick per task with your eval set; check the docs for current names
            max_tokens=800,                              # cap output cost
            system=[{"type": "text", "text": SYSTEM, "cache_control": {"type": "ephemeral"}}],  # prompt caching
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                if await request.is_disconnected():      # user left: stop generating (and paying)
                    break
                yield f"data: {json.dumps({'delta': text})}\\n\\n"
            final = await stream.get_final_message()
            u = final.usage
            log_usage(user=body.get("user_id"), feature="tutor", input=u.input_tokens, output=u.output_tokens,
                      cache_read=getattr(u, "cache_read_input_tokens", 0))
        yield "data: [DONE]\\n\\n"

    return StreamingResponse(events(), media_type="text/event-stream")

# Count tokens before sending (to enforce per-request limits)
# n = (await client.messages.count_tokens(model="claude-sonnet-5-5", system=SYSTEM, messages=messages)).input_tokens

# Browser: read the stream and append text as it arrives
#   const res = await fetch("/api/ask", { method: "POST", body: JSON.stringify({ messages }), signal: ctrl.signal });
#   const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
#   for (;;) { const { value, done } = await reader.read(); if (done) break;
#              for (const line of value.split("\\n")) if (line.startsWith("data: {")) out.textContent += JSON.parse(line.slice(6)).delta; }

# Cost estimate (illustrative prices, check the provider's pricing page):
#   cost = input_tokens/1e6 * price_in + output_tokens/1e6 * price_out (+ cheaper cached reads)`,
      ex: "Build a streaming chat endpoint with an LLM API and a small web UI that renders tokens as they arrive and has a Stop button that cancels generation. Log input, output and cached tokens per request, add prompt caching for a long system prompt and compare costs, and run the same 20-question evaluation set on a small and a large model, tabulating quality, latency and cost to pick one.",
      q: ["Why does streaming make an LLM feature feel faster even if total generation time is unchanged?", ["Streaming uses a faster model", "Users see the first words almost immediately instead of waiting for the whole answer", "It reduces token cost by half", "It skips the system prompt"], 1, "Time to first token drives perceived speed. Streaming shows progress right away while the rest is generated."]
    }
  ]
});
