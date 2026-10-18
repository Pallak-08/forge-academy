/* Forge Academy lessons: advanced spreadsheets, probability, inference and regression,
   analytics SQL patterns, the analysis workflow, real data sources, Power BI, Tableau and Looker Studio */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 79, id: "spreadsheets-lessons", fills: "spreadsheets", title: "Excel and Google Sheets", level: 1,
  blurb: "Dynamic arrays, Power Query, validation and automation.",
  lessons: [
    {
      t: "Advanced spreadsheet skills",
      sub: ["Dynamic arrays: FILTER, SORT, UNIQUE", "Power Query for cleaning and joining", "Data validation and protected ranges", "Macros and Apps Script basics"],
      body: `<p><b>Dynamic array formulas</b> (Excel 365 and Google Sheets) return whole ranges that "spill" into neighbouring cells, replacing many complex older formulas: <code>FILTER(data, condition)</code> returns matching rows; <code>SORT</code> and <code>SORTBY</code> order them; <code>UNIQUE</code> lists distinct values; <code>XLOOKUP</code> replaces VLOOKUP; <code>LET</code> names intermediate results; <code>TEXTSPLIT</code> splits text. Combine them for live reports that update when data changes, such as the top 10 customers in a region.</p>
<p><b>Power Query</b> (Excel's Get &amp; Transform, also in Power BI) is a repeatable data-cleaning tool. You connect to sources (CSV folders, Excel files, databases, web pages), then record transformation steps: remove columns, fix types, split columns, trim text, unpivot, filter, group, and merge (join) or append (union) tables. Next month you just click Refresh and every step re-runs on the new data, which replaces hours of manual cleaning. In Google Sheets, <code>QUERY</code>, <code>IMPORTRANGE</code> and connected sheets cover some of this.</p>
<p><b>Data validation</b> keeps data entry clean: dropdown lists, number and date ranges, custom rules, and clear input messages. <b>Protected ranges and sheets</b> stop people from accidentally overwriting formulas or reference data, while leaving input cells editable. Structure workbooks as raw data, lookups, calculations and outputs, and convert ranges to <b>Tables</b> (Ctrl+T) so formulas and pivots grow automatically.</p>
<p><b>Automation</b>: Excel <b>macros</b> (recorded or written in VBA, or the newer Office Scripts in TypeScript) and Google <b>Apps Script</b> (JavaScript) automate repetitive work: formatting reports, emailing summaries, pulling data from APIs, creating files. Apps Script can run on time-based triggers, which makes small automated pipelines possible inside Google Sheets.</p>`,
      lang: "javascript",
      code: `/* --- Dynamic array formulas (Excel 365 / Google Sheets) ---
   Sheet "sales": A=date  B=region  C=customer  D=product  E=revenue   (formatted as a Table named Sales)

   Unique regions, sorted:            =SORT(UNIQUE(Sales[region]))
   North rows over Rs 50,000:         =FILTER(Sales, (Sales[region]="North")*(Sales[revenue]>50000), "none")
   Top 10 customers by revenue:
     =LET(c, UNIQUE(Sales[customer]),
          r, SUMIFS(Sales[revenue], Sales[customer], c),
          TAKE(SORTBY(HSTACK(c, r), r, -1), 10))
   Lookup with a fallback:            =XLOOKUP(H2, Products[sku], Products[category], "Unknown")
   Google Sheets QUERY:               =QUERY(sales!A:E, "select B, sum(E) where A >= date '2026-10-01' group by B order by sum(E) desc", 1)

   --- Power Query (M) steps, generated as you click ---
   Source = Folder.Files("C:\\Reports\\Monthly"),            // every CSV in the folder
   Combined = Table.Combine(...),
   Typed = Table.TransformColumnTypes(Combined, {{"date", type date}, {"revenue", type number}}),
   Trimmed = Table.TransformColumns(Typed, {{"customer", Text.Trim}}),
   Merged = Table.NestedJoin(Trimmed, {"sku"}, Products, {"sku"}, "p", JoinKind.LeftOuter)
*/

// --- Google Apps Script: email a weekly summary every Monday 9 am ---
function weeklySummary() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("summary");
  const [[revenue, orders, aov]] = sheet.getRange("B2:D2").getValues();
  const body = \`Last week: Rs \${revenue.toLocaleString("en-IN")} revenue, \${orders} orders, AOV Rs \${Math.round(aov)}.\`;
  MailApp.sendEmail({ to: "team@example.com", subject: "Weekly sales summary", body });
}
function createTrigger() {                       // run once to schedule it
  ScriptApp.newTrigger("weeklySummary").timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(9).create();
}

// --- Pull data from an API into a sheet ---
function importRates() {
  const data = JSON.parse(UrlFetchApp.fetch("https://api.example.com/rates?base=INR").getContentText());
  const rows = Object.entries(data.rates).map(([cur, rate]) => [new Date(), cur, rate]);
  SpreadsheetApp.getActive().getSheetByName("rates").getRange(2, 1, rows.length, 3).setValues(rows);
}`,
      ex: "Build a monthly sales workbook: a Power Query (or Sheets QUERY/IMPORTRANGE) step that combines three months of CSV files, cleans them and joins a product table; a dashboard sheet using dynamic arrays (top customers, region totals, a FILTER-based drill-down); dropdown validation on input cells with protected formula ranges; and an Apps Script or Office Script that emails a summary on a schedule.",
      q: ["What's the main benefit of cleaning data with Power Query rather than by hand?", ["It uses less disk space", "The cleaning steps are recorded and re-run with one click on next month's data, so the work is repeatable and consistent", "It makes charts prettier", "It removes the need for formulas"], 1, "Manual cleaning must be redone every time and invites mistakes. Power Query turns it into a refreshable pipeline."]
    }
  ]
});

COURSE.push({
  n: 80, id: "statistics-lessons", fills: "statistics", title: "Statistics and probability", level: 2,
  blurb: "Probability foundations, statistical inference and regression.",
  lessons: [
    {
      t: "Probability foundations",
      sub: ["Random variables", "Common distributions", "Expected value and variance", "Bayes' rule"],
      body: `<p>A <b>random variable</b> assigns a number to an uncertain outcome: the number of orders in an hour, a customer's spend, whether a user churns (1 or 0). <b>Discrete</b> variables take countable values; <b>continuous</b> ones take any value in a range (time on page, height).</p>
<p><b>Common distributions</b> model recurring patterns:</p>
<ul><li><b>Bernoulli / binomial</b>: yes-or-no outcomes; the number of conversions out of n visitors with probability p.</li>
<li><b>Poisson</b>: counts of events in a fixed interval (support tickets per hour, website errors per day).</li>
<li><b>Normal</b> (Gaussian): the bell curve; many measurements and, crucially, averages of samples (central limit theorem). About 68% of values lie within 1 standard deviation of the mean and 95% within 2.</li>
<li><b>Exponential</b>: time between events. <b>Log-normal</b> and other <b>skewed</b> distributions describe incomes, order values and session lengths, where a few huge values pull the mean far above the median.</li></ul>
<p>The <b>expected value</b> is the long-run average; <b>variance</b> and its square root, the <b>standard deviation</b>, measure spread. Use the <b>median</b> rather than the mean for skewed data like revenue per user, and always look at the distribution (histogram) before summarising it with one number.</p>
<p><b>Bayes' rule</b> updates a probability with evidence: P(A|B) = P(B|A) × P(A) / P(B). Its key lesson is that <b>base rates</b> matter. A fraud model that's 99% accurate, applied where only 1 in 1,000 transactions is fraud, will still flag mostly legitimate transactions, because there are so many more of them.</p>`,
      lang: "python",
      code: `import numpy as np
from scipy import stats
rng = np.random.default_rng(42)

# Binomial: 1,000 visitors, 3% conversion -> how many sign-ups?
signups = rng.binomial(n=1000, p=0.03, size=10_000)
print("mean", signups.mean(), "P(>= 40 signups):", (signups >= 40).mean())

# Poisson: support tickets average 12/hour; chance of 20+ in an hour?
print("P(X>=20) =", 1 - stats.poisson.cdf(19, mu=12))      # ~0.021

# Skewed data: mean vs median
order_values = rng.lognormal(mean=6.5, sigma=0.9, size=50_000)   # rupees
print(f"mean Rs {order_values.mean():.0f}  median Rs {np.median(order_values):.0f}")   # mean >> median

# Normal: 68-95 rule
x = rng.normal(loc=170, scale=8, size=100_000)              # heights in cm
print(((x > 162) & (x < 178)).mean())                       # ~0.68

# Expected value of a decision: offer a Rs 200 coupon to likely churners?
p_stay_with_coupon, p_stay_without, value_if_stay = 0.40, 0.25, 3000
ev_gain = (p_stay_with_coupon - p_stay_without) * value_if_stay - 200 * p_stay_with_coupon
print("expected gain per customer: Rs", ev_gain)            # positive -> worth it

# Bayes and base rates: fraud model, 99% sensitivity, 98% specificity, 0.1% fraud rate
p_fraud, sens, spec = 0.001, 0.99, 0.98
p_flag = sens * p_fraud + (1 - spec) * (1 - p_fraud)
print("P(fraud | flagged) =", round(sens * p_fraud / p_flag, 3))   # ~0.047: most flags are false alarms`,
      ex: "With simulation in NumPy: estimate the probability of at least 50 sign-ups from 1,200 visitors at 3.5% conversion; simulate daily order values from a skewed distribution and compare mean and median; and work through a Bayes problem for a medical or spam test with different base rates, explaining in plain words why the answer changes so much.",
      q: ["A customer-spend distribution is heavily right-skewed. Which summary best represents a typical customer?", ["The mean", "The median", "The maximum", "The variance"], 1, "A few very large spenders pull the mean up. The median is the middle customer and isn't distorted by extremes."]
    },
    {
      t: "Inference and regression",
      sub: ["Sampling distributions", "t-tests and chi-square tests", "Linear regression and interpreting coefficients", "Correlation vs causation"],
      body: `<p>We usually measure a <b>sample</b> and want to say something about the whole <b>population</b>. A statistic like a sample mean varies from sample to sample; its <b>sampling distribution</b> describes that variation. The <b>central limit theorem</b> says sample means are approximately normal for reasonable sample sizes, with a spread (the <b>standard error</b>) shrinking as the sample grows. A <b>95% confidence interval</b> gives a range of plausible values for the true value; report it alongside every estimate.</p>
<p><b>Hypothesis tests</b> ask whether an observed difference could plausibly be chance. You assume no difference (the null hypothesis) and compute a <b>p-value</b>: the probability of seeing data at least this extreme if the null were true. Common tests: a <b>t-test</b> compares means of two groups (average order value in variant A versus B); a <b>chi-square test</b> compares proportions or counts across categories (conversion rate by variant, or whether churn differs by plan). A small p-value (below a threshold like 0.05 chosen <i>in advance</i>) suggests a real difference, but it says nothing about how <i>big</i> or important it is: always report the effect size and its confidence interval. Avoid peeking repeatedly and testing many metrics without correction.</p>
<p><b>Linear regression</b> models an outcome as a weighted sum of inputs: <code>revenue = b0 + b1 × ad_spend + b2 × is_festival + ...</code>. Each coefficient is the expected change in the outcome for a one-unit change in that input, <i>holding the others constant</i>. Check R², residual plots and confidence intervals on coefficients, and watch for multicollinearity (correlated inputs).</p>
<p><b>Correlation is not causation.</b> Ice cream sales and drownings both rise in summer (a confounder, temperature, drives both). To claim cause and effect, use randomised experiments (A/B tests) where possible; with observational data, control for confounders and be explicit about assumptions.</p>`,
      lang: "python",
      code: `import numpy as np, pandas as pd
from scipy import stats
import statsmodels.formula.api as smf

rng = np.random.default_rng(7)

# A/B test on average order value (t-test) with a confidence interval for the difference
a = rng.lognormal(6.4, 0.6, 4000); b = rng.lognormal(6.45, 0.6, 4000)
t, p = stats.ttest_ind(b, a, equal_var=False)                 # Welch's t-test
diff = b.mean() - a.mean()
se = np.sqrt(a.var(ddof=1) / len(a) + b.var(ddof=1) / len(b))
print(f"diff Rs {diff:.0f}, 95% CI [{diff - 1.96*se:.0f}, {diff + 1.96*se:.0f}], p={p:.4f}")

# Conversion rates by variant (chi-square on a contingency table)
table = np.array([[420, 9580],      # A: converted, not converted
                  [495, 9505]])     # B
chi2, p, dof, _ = stats.chi2_contingency(table)
print(f"A {420/10000:.2%} vs B {495/10000:.2%}, p={p:.4f}")

# Linear regression: what drives weekly revenue?
n = 150
df = pd.DataFrame({"ad_spend": rng.uniform(10, 100, n),          # thousands of rupees
                   "festival": rng.integers(0, 2, n),
                   "price_cut": rng.integers(0, 2, n)})
df["revenue"] = 200 + 3.1*df.ad_spend + 85*df.festival + 40*df.price_cut + rng.normal(0, 30, n)
model = smf.ols("revenue ~ ad_spend + festival + price_cut", data=df).fit()
print(model.summary().tables[1])
# ad_spend coef ~3.1 -> each extra Rs 1,000 of ads is associated with ~Rs 3,100 more revenue,
# holding festival and price cuts constant (association, unless spend was randomised)
print("R-squared:", round(model.rsquared, 3))`,
      ex: "Using a public dataset (for example a Kaggle e-commerce or A/B test dataset), run a t-test and a chi-square test on a real comparison and report effect sizes with 95% confidence intervals, not just p-values. Fit a multiple linear regression for an outcome, interpret each coefficient in plain language, check the residuals, and name one plausible confounder that could mislead a causal interpretation.",
      q: ["An A/B test gives p = 0.001 for a conversion lift of 0.02 percentage points. What should you conclude?", ["The change is hugely important", "The difference is unlikely to be chance, but the effect may be too small to matter; judge practical significance from the effect size and its interval", "The test is invalid", "p-values above 0.05 are better"], 1, "With huge samples, tiny effects become statistically significant. Business decisions depend on how big the effect is."]
    }
  ]
});

COURSE.push({
  n: 81, id: "sql-analytics-lessons", fills: "sql-analytics", title: "SQL for analytics", level: 2,
  blurb: "Reusable SQL patterns analysts use every week.",
  lessons: [
    {
      t: "Analytics SQL patterns",
      sub: ["Funnels in SQL", "Sessionisation", "Pivoting with CASE", "Date spines and gaps"],
      body: `<p>A handful of patterns answer most product and business questions in SQL.</p>
<p><b>Funnels</b> measure how many users reach each step of a journey (visited → signed up → added to cart → paid) and where they drop off. Compute, per user, the first time they hit each step (with conditional aggregation), then count users who reached each step <i>in order</i> and within a time window. Express each step as a percentage of the first step and of the previous step.</p>
<p><b>Sessionisation</b> groups a user's raw events into sessions: a new session starts when the gap since their previous event exceeds a threshold, often 30 minutes. Use <code>LAG()</code> to get the previous event's time, flag gaps larger than the threshold, then a running <code>SUM()</code> of those flags gives a session number. From sessions you get session counts, durations and pages per session.</p>
<p><b>Pivoting with CASE</b> turns rows into columns: <code>SUM(CASE WHEN region = 'North' THEN revenue END) AS north</code>, one expression per column. It works in every SQL dialect and is how most report tables are built (some databases also have <code>PIVOT</code> or <code>FILTER (WHERE ...)</code> syntax).</p>
<p><b>Date spines</b>: if no orders happened on a day, a simple <code>GROUP BY date</code> skips that day entirely, so charts silently join the points around the gap and averages come out wrong. Generate a complete series of dates (<code>generate_series</code> in Postgres, <code>GENERATE_DATE_ARRAY</code> in BigQuery, or a calendar table) and LEFT JOIN your data onto it, filling missing values with 0. The same idea finds gaps, such as days a sensor sent no data.</p>`,
      lang: "sql",
      code: `-- 1) FUNNEL: visited -> signed_up -> added_to_cart -> paid, within 7 days of first visit
WITH firsts AS (
  SELECT user_id,
         MIN(CASE WHEN event = 'visit'       THEN ts END) AS t_visit,
         MIN(CASE WHEN event = 'signup'      THEN ts END) AS t_signup,
         MIN(CASE WHEN event = 'add_to_cart' THEN ts END) AS t_cart,
         MIN(CASE WHEN event = 'purchase'    THEN ts END) AS t_paid
  FROM events WHERE ts >= DATE '2026-09-01' GROUP BY user_id
)
SELECT COUNT(t_visit)                                                     AS visited,
       COUNT(*) FILTER (WHERE t_signup > t_visit AND t_signup < t_visit + INTERVAL '7 days') AS signed_up,
       COUNT(*) FILTER (WHERE t_cart > t_signup AND t_cart < t_visit + INTERVAL '7 days')    AS carted,
       COUNT(*) FILTER (WHERE t_paid > t_cart AND t_paid < t_visit + INTERVAL '7 days')      AS paid
FROM firsts;

-- 2) SESSIONISATION: new session after 30 minutes of inactivity
WITH flagged AS (
  SELECT user_id, ts, page,
         CASE WHEN ts - LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) > INTERVAL '30 minutes'
                OR LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) IS NULL THEN 1 ELSE 0 END AS new_session
  FROM pageviews
), numbered AS (
  SELECT *, SUM(new_session) OVER (PARTITION BY user_id ORDER BY ts) AS session_no FROM flagged
)
SELECT user_id, session_no, MIN(ts) AS started, MAX(ts) - MIN(ts) AS duration, COUNT(*) AS pages
FROM numbered GROUP BY user_id, session_no;

-- 3) PIVOT with CASE: monthly revenue by region as columns
SELECT date_trunc('month', created_at)::date AS month,
       SUM(CASE WHEN region = 'North' THEN total END) AS north,
       SUM(CASE WHEN region = 'South' THEN total END) AS south,
       SUM(CASE WHEN region = 'West'  THEN total END) AS west,
       SUM(total)                                     AS all_regions
FROM orders GROUP BY 1 ORDER BY 1;

-- 4) DATE SPINE: every day appears, even days with zero orders
SELECT d::date AS day, COALESCE(COUNT(o.id), 0) AS orders, COALESCE(SUM(o.total), 0) AS revenue
FROM generate_series(DATE '2026-10-01', DATE '2026-10-31', INTERVAL '1 day') AS d
LEFT JOIN orders o ON o.created_at::date = d::date
GROUP BY 1 ORDER BY 1;`,
      ex: "Load a sample events dataset (for example a Google Analytics sample or generated events) into Postgres, DuckDB or BigQuery. Build a 4-step funnel with step-to-step conversion rates, sessionise page views with a 30-minute rule and report average session length, create a pivoted monthly report by category, and produce a daily series with a date spine, then chart it with and without the spine to see the difference.",
      q: ["Why join daily metrics onto a date spine?", ["To make queries faster", "So days with no activity appear as zero instead of disappearing, keeping charts and averages correct", "To remove duplicates", "Because GROUP BY doesn't work on dates"], 1, "GROUP BY only returns days that have rows. Missing days silently distort trends and averages unless you fill them in."]
    }
  ]
});

COURSE.push({
  n: 82, id: "python-data-lessons", fills: "python-data", title: "Python for data analysis", level: 2,
  blurb: "A reproducible analysis workflow and working with real-world data sources.",
  lessons: [
    {
      t: "Jupyter and the analysis workflow",
      sub: ["Notebooks vs scripts", "Exploratory data analysis steps", "Reproducibility", "Sharing notebooks"],
      body: `<p><b>Jupyter notebooks</b> (JupyterLab, VS Code, Google Colab) mix code, output, charts and notes, which makes them ideal for <b>exploration</b> and for explaining an analysis. <b>Scripts and modules</b> are better for anything that runs repeatedly or in production: they're easier to test, review in Git and schedule. A common pattern: explore in a notebook, move reusable functions (loading, cleaning) into a <code>.py</code> module the notebook imports, and turn recurring analyses into scheduled scripts.</p>
<p>A practical <b>exploratory data analysis</b> (EDA) sequence:</p>
<ol><li>Write down the <b>question</b> and how the answer will be used.</li>
<li><b>Load and inspect</b>: shape, columns, types (<code>df.info()</code>), a sample of rows.</li>
<li><b>Data quality</b>: missing values, duplicates, impossible values (negative ages, future dates), inconsistent categories ("Bengaluru" versus "Bangalore").</li>
<li><b>Univariate</b>: distributions of key columns (histograms, value counts, summary statistics).</li>
<li><b>Bivariate and segments</b>: relationships and comparisons (by region, plan, time).</li>
<li><b>Answer and caveats</b>: findings, their limits and the recommended action.</li></ol>
<p><b>Reproducibility</b>: notebooks run out of order hide bugs. Before sharing, <b>restart the kernel and run all</b>. Pin package versions (requirements.txt or uv), keep raw data read-only and do all cleaning in code, set random seeds, avoid hard-coded local paths, and store notebooks in Git (tools like Jupytext or nbstripout make diffs readable).</p>
<p><b>Sharing</b>: decision-makers want conclusions, not code. Put a summary at the top, hide or collapse code, and export to HTML or PDF, publish with Quarto, or turn it into a simple app (Streamlit) or a dashboard when people need to explore themselves.</p>`,
      lang: "python",
      code: `# analysis/cleaning.py : reusable functions, imported by the notebook (and testable)
import pandas as pd

CITY_FIX = {"bangalore": "Bengaluru", "bengaluru": "Bengaluru", "bombay": "Mumbai", "mumbai": "Mumbai"}

def load_orders(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["order_date"], dtype={"pincode": "string"})
    df["city"] = df["city"].str.strip().str.lower().map(CITY_FIX).fillna(df["city"].str.title())
    df = df.drop_duplicates(subset="order_id")
    df = df[df["amount"] > 0]                                  # impossible values removed, logged below
    return df

def quality_report(df: pd.DataFrame) -> pd.DataFrame:
    return pd.DataFrame({"dtype": df.dtypes.astype(str),
                         "missing_%": (df.isna().mean() * 100).round(1),
                         "unique": df.nunique()})

# notebook.ipynb (cells)
# ## Question: Which cities drove the September revenue dip, and why?
import matplotlib.pyplot as plt
from analysis.cleaning import load_orders, quality_report

raw = pd.read_csv("data/raw/orders_2026_q3.csv")              # raw data is never edited by hand
df = load_orders("data/raw/orders_2026_q3.csv")
print(f"{len(raw) - len(df)} rows removed (duplicates or non-positive amounts)")
quality_report(df)

df["amount"].describe()                                       # univariate
df["amount"].plot.hist(bins=50, log=True); plt.title("Order value distribution")

monthly = (df.assign(month=df.order_date.dt.to_period("M"))
             .pivot_table(index="city", columns="month", values="amount", aggfunc="sum"))
monthly["change_%"] = (monthly.iloc[:, -1] / monthly.iloc[:, -2] - 1) * 100
monthly.sort_values("change_%").head(5)                       # biggest drops by city

# Before sharing: Kernel > Restart & Run All, then
#   jupyter nbconvert --to html --no-input notebook.ipynb     (conclusions without code)`,
      ex: "Pick a messy public dataset and do a full EDA following the six steps, with reusable loading and cleaning functions in a separate module. Make it reproducible (pinned requirements, relative paths, restart-and-run-all clean), write a summary cell with three findings and caveats at the top, and export a no-code HTML version for a non-technical reader.",
      q: ["Why 'Restart kernel and run all' before sharing a notebook?", ["It makes the notebook smaller", "Cells run out of order or deleted cells can leave hidden state; a clean run proves the results are reproducible from top to bottom", "It updates Python", "It is required to export"], 1, "Notebook state can depend on cells that no longer exist or ran in a different order. A full fresh run exposes that."]
    },
    {
      t: "Working with real data sources",
      sub: ["Reading from databases and APIs", "Excel files with many sheets", "Large files in chunks", "Parquet"],
      body: `<p>Real analysis data rarely comes as one clean CSV.</p>
<p><b>Databases</b>: query with SQL and load results into pandas with <code>pd.read_sql</code> through a SQLAlchemy engine. Push filtering and aggregation into SQL (let the database do the heavy lifting) and pull only what you need. Keep credentials in environment variables, and use read-only users and replicas for analytics.</p>
<p><b>APIs</b>: use <code>requests</code> or <code>httpx</code>, handle authentication, <b>pagination</b> (loop until there's no next page or cursor), <b>rate limits</b> (respect <code>Retry-After</code>, back off on HTTP 429) and errors. <code>pd.json_normalize</code> flattens nested JSON into columns. Save raw responses to disk so you don't re-download everything each time you rerun.</p>
<p><b>Excel files</b>: <code>pd.read_excel(path, sheet_name=None)</code> returns a dict of every sheet. Real-world workbooks need <code>skiprows</code>, <code>header</code>, <code>usecols</code> and <code>nrows</code> to skip titles and notes, and careful handling of merged cells, multi-row headers and dates stored as numbers.</p>
<p><b>Large files</b> that don't fit comfortably in memory: read only the needed columns with efficient types (<code>usecols</code>, <code>dtype</code>, <code>category</code> for repeated strings), or process in <b>chunks</b> (<code>chunksize=</code>) and aggregate as you go. Often simpler: query the file directly with <b>DuckDB</b> or use <b>Polars</b>, which handle large data quickly with low memory.</p>
<p><b>Parquet</b> is a compressed, columnar file format that stores types. Compared with CSV it's typically several times smaller, much faster to read, and lets tools read only the columns you need. Convert raw CSVs to Parquet once and work from those.</p>`,
      lang: "python",
      code: `import os, time, httpx, duckdb, pandas as pd
from sqlalchemy import create_engine

# --- Database: let SQL aggregate, pull only the result ---
engine = create_engine(os.environ["ANALYTICS_DB_URL"])          # read-only user / replica
daily = pd.read_sql("""
    SELECT created_at::date AS day, region, SUM(total) AS revenue, COUNT(*) AS orders
    FROM orders WHERE created_at >= NOW() - INTERVAL '90 days'
    GROUP BY 1, 2
""", engine)

# --- API with cursor pagination and rate-limit handling ---
def fetch_all(url, token):
    rows, cursor = [], None
    with httpx.Client(headers={"Authorization": f"Bearer {token}"}, timeout=30) as client:
        while True:
            r = client.get(url, params={"limit": 100, "after": cursor})
            if r.status_code == 429:                            # rate limited
                time.sleep(int(r.headers.get("Retry-After", 5))); continue
            r.raise_for_status()
            page = r.json()
            rows.extend(page["data"])
            cursor = page.get("next_cursor")
            if not cursor: return pd.json_normalize(rows)       # nested JSON -> flat columns

# --- Excel with many messy sheets ---
sheets = pd.read_excel("data/raw/branch_reports.xlsx", sheet_name=None, skiprows=3, usecols="A:F")
combined = pd.concat([df.assign(branch=name) for name, df in sheets.items()], ignore_index=True)

# --- Large CSV: chunked aggregation with efficient types ---
totals = None
for chunk in pd.read_csv("data/raw/events_40GB.csv", usecols=["user_id", "event", "country"],
                         dtype={"event": "category", "country": "category"}, chunksize=2_000_000):
    part = chunk.groupby("country", observed=True).size()
    totals = part if totals is None else totals.add(part, fill_value=0)

# --- Or skip pandas memory limits entirely: DuckDB queries files directly ---
duckdb.sql("COPY (SELECT * FROM 'data/raw/events_*.csv') TO 'data/events.parquet' (FORMAT parquet)")
top = duckdb.sql("""
    SELECT country, COUNT(*) AS events, COUNT(DISTINCT user_id) AS users
    FROM 'data/events.parquet' GROUP BY country ORDER BY events DESC LIMIT 10
""").df()`,
      ex: "Build a small data-collection notebook that: pulls 90 days of aggregates from a database (a local Postgres with sample data is fine), downloads all pages from a public paginated API with rate-limit handling, combines a multi-sheet Excel workbook with header rows to skip, and converts a large CSV (generate 5 million rows) to Parquet, comparing file size and query time in pandas versus DuckDB.",
      q: ["Why convert large CSV files to Parquet for analysis?", ["Parquet files are human-readable", "Parquet is compressed and columnar with stored types, so files are smaller and tools can read only the columns needed, much faster", "CSV can't store numbers", "Parquet is required by pandas"], 1, "Columnar compression and column pruning make Parquet far faster and smaller than CSV for analytical queries."]
    }
  ]
});

COURSE.push({
  n: 83, id: "data-viz-lessons", fills: "data-viz", title: "Data visualisation and BI", level: 2,
  blurb: "Power BI in depth, and Tableau and Looker Studio.",
  lessons: [
    {
      t: "Power BI in depth",
      sub: ["Power Query", "Data modelling and relationships", "DAX measures", "Publishing and sharing"],
      body: `<p><b>Power BI</b> is among the most requested BI tools in analyst job listings. Work flows through four stages.</p>
<p><b>Power Query</b> (Transform data) connects to sources (Excel, CSV folders, SQL Server, Postgres, SharePoint, web APIs) and records cleaning steps: fixing types, removing columns, splitting, unpivoting, merging and appending. Do as much shaping here (or upstream in the database) as possible, so the model receives clean tables.</p>
<p><b>Data modelling</b>: build a <b>star schema</b>, with fact tables (sales, orders: numeric events with keys) surrounded by dimension tables (date, product, customer, store: descriptive attributes). Create one-to-many <b>relationships</b> from dimensions to facts, with single-direction filtering by default. Always add a proper <b>date table</b> marked as a date table, so time intelligence works. Avoid one giant flat table and many-to-many relationships where you can.</p>
<p><b>DAX measures</b> are calculations evaluated in the current <b>filter context</b> (whatever slicers, rows and columns apply to a visual). Prefer explicit measures (<code>Total Revenue = SUM(Sales[Revenue])</code>) over implicit column aggregations. <code>CALCULATE</code> is the key function: it evaluates an expression with modified filters, which is how you compute year-to-date, previous period, share of total and comparisons. Calculated columns are computed row by row at refresh time; use them sparingly.</p>
<p><b>Publishing</b>: publish from Power BI Desktop to the Power BI Service, organise reports in workspaces, share through apps, schedule refreshes (with a gateway for on-premises data), and apply <b>row-level security</b> so each regional manager sees only their region. Design report pages around questions, with the key numbers at the top and drill-downs below.</p>`,
      lang: "text",
      code: `STAR SCHEMA
   DimDate (Date, Month, Quarter, Year, IsFestival)  --1:*-->  FactSales
   DimProduct (ProductKey, Name, Category, Brand)     --1:*-->  FactSales (DateKey, ProductKey, StoreKey,
   DimStore (StoreKey, City, Region)                  --1:*-->             Qty, Revenue, Cost)

DAX MEASURES
Total Revenue = SUM ( FactSales[Revenue] )
Total Cost    = SUM ( FactSales[Cost] )
Gross Margin %  = DIVIDE ( [Total Revenue] - [Total Cost], [Total Revenue] )      -- DIVIDE avoids /0 errors

Revenue YTD = TOTALYTD ( [Total Revenue], DimDate[Date] )
Revenue PY  = CALCULATE ( [Total Revenue], SAMEPERIODLASTYEAR ( DimDate[Date] ) )
Revenue YoY % = DIVIDE ( [Total Revenue] - [Revenue PY], [Revenue PY] )

-- Share of the region total, whatever product is selected in the visual
Share of Region =
DIVIDE ( [Total Revenue],
         CALCULATE ( [Total Revenue], REMOVEFILTERS ( DimProduct ) ) )

-- Revenue from festival days only
Festival Revenue = CALCULATE ( [Total Revenue], DimDate[IsFestival] = TRUE () )

-- Top 5 products by revenue (for a ranking visual)
Product Rank = RANKX ( ALL ( DimProduct[Name] ), [Total Revenue] )

ROW-LEVEL SECURITY (role "Regional manager", table DimStore)
[Region] = LOOKUPVALUE ( Managers[Region], Managers[Email], USERPRINCIPALNAME () )

REPORT PAGE LAYOUT
  Row 1: KPI cards  - Revenue, YoY %, Gross Margin %, Orders
  Row 2: Revenue by month (line, with PY)  |  Revenue by region (bar)
  Row 3: Product table with Share of Region and rank, drill-through to product detail`,
      ex: "Using a sample retail dataset (the Microsoft Contoso or AdventureWorks samples, or your own), build a Power BI report: clean the data in Power Query, model a star schema with a marked date table, write at least eight DAX measures (including YTD, previous year, YoY % and share of total), design a two-page report with slicers and drill-through, and set up a row-level security role. Publish it if you have access to the Power BI Service (the free tier supports personal publishing).",
      q: ["What does CALCULATE do in DAX?", ["It adds two numbers", "It evaluates an expression with a modified filter context, which enables comparisons like previous year or share of total", "It creates relationships", "It refreshes the data"], 1, "Most advanced DAX is about changing filter context. CALCULATE is the function that does it."]
    },
    {
      t: "Tableau and Looker Studio",
      sub: ["Connecting data", "Calculated fields", "Interactive dashboards", "Choosing a BI tool"],
      body: `<p><b>Tableau</b> is a leading visual analytics tool known for fast, flexible exploration: you drag fields onto rows, columns and the "marks" card (colour, size, label, detail), and Tableau builds the chart. Tableau Public is free (your workbooks are public), which makes it a great place to build a visible portfolio. <b>Looker Studio</b> (formerly Google Data Studio) is free, browser-based and integrates natively with Google sources (Sheets, BigQuery, GA4, Search Console), making it popular for marketing and small-business reporting.</p>
<p><b>Connecting data</b>: both connect to files, Google Sheets, databases and warehouses. Tableau offers <b>live</b> connections (query the source each time) or <b>extracts</b> (a fast local snapshot, refreshed on a schedule), and can relate or join multiple tables. In Looker Studio each chart uses a data source; <b>blending</b> combines sources on a shared key, though complex joins are better done in SQL or BigQuery first.</p>
<p><b>Calculated fields</b> add logic: ratios (<code>SUM([Profit]) / SUM([Sales])</code>), categorisation with IF or CASE, date functions, and in Tableau, <b>level of detail</b> (LOD) expressions such as <code>{FIXED [Customer] : MIN([Order Date])}</code> for each customer's first order date, plus table calculations (running totals, percent of total, rank).</p>
<p><b>Interactive dashboards</b>: combine several views with filters, parameters (user-chosen values, such as picking the metric to show), dashboard actions (clicking a bar filters the other charts) and tooltips. Keep them focused on a few questions, put headline numbers first, and design for the audience's real decisions.</p>
<p><b>Choosing a tool</b>: Power BI fits Microsoft-centric organisations and has a low per-user cost; Tableau excels at visual exploration and is common in larger enterprises; Looker Studio is free and great with Google data; Looker (the separate enterprise product) centres on a governed semantic model; Metabase and Apache Superset are open-source options. Concepts transfer between tools, so learn one deeply and the others quickly.</p>`,
      lang: "text",
      code: `TABLEAU CALCULATED FIELDS

Profit Ratio            SUM([Profit]) / SUM([Sales])

Order Size              IF SUM([Sales]) >= 50000 THEN "Large"
                        ELSEIF SUM([Sales]) >= 10000 THEN "Medium"
                        ELSE "Small" END

First Order Date (LOD)  { FIXED [Customer ID] : MIN([Order Date]) }
Cohort Month            DATETRUNC('month', [First Order Date])
Months Since First      DATEDIFF('month', [First Order Date], [Order Date])
  -> cohort retention heatmap: Rows = Cohort Month, Columns = Months Since First,
     Colour = COUNTD([Customer ID]) as % of the cohort's month-0 customers

Running Total (table calc)   RUNNING_SUM(SUM([Sales]))
Selected Metric (parameter)  CASE [Metric Param] WHEN "Revenue" THEN SUM([Sales])
                                                 WHEN "Profit"  THEN SUM([Profit]) END

LOOKER STUDIO CALCULATED FIELDS
Conversion rate      SUM(purchases) / SUM(sessions)
Channel group        CASE WHEN REGEXP_MATCH(source, "google|bing") AND medium = "cpc" THEN "Paid search"
                          WHEN medium = "organic" THEN "Organic"
                          WHEN REGEXP_MATCH(source, "instagram|facebook|linkedin") THEN "Social"
                          ELSE "Other" END

DASHBOARD CHECKLIST
 [ ] 3-5 questions this dashboard answers, written at the top
 [ ] KPIs first, then trends, then breakdowns and detail
 [ ] filters/parameters the audience actually needs (date range, region)
 [ ] click-to-filter actions between charts; helpful tooltips
 [ ] consistent colours (one highlight colour), labelled axes, no 3D or pie overload
 [ ] tested on the screen size people will use`,
      ex: "Build the same sales dashboard in Tableau Public and Looker Studio from one dataset: KPIs, a trend with a previous-period comparison, a regional breakdown with click-to-filter, a customer cohort retention view (Tableau LOD) and a metric-selector parameter. Publish both and write a short comparison of the tools from the perspective of a small company choosing one.",
      q: ["What does the Tableau LOD expression { FIXED [Customer ID] : MIN([Order Date]) } compute?", ["The earliest order date in the whole dataset", "Each customer's first order date, regardless of the filters and dimensions in the view", "The number of customers", "The minimum sales per order"], 1, "FIXED computes the aggregate at the specified level (per customer), which enables cohort analysis."]
    }
  ]
});
