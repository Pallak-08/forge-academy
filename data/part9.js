/* Forge Academy course data, module 27: data analysis */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 27, id: "data-analysis", title: "Data analysis: from spreadsheet to decision", level: 2,
  blurb: "The data analyst's toolkit: spreadsheets, statistics, analytical SQL, pandas, cleaning, visualisation and turning numbers into recommendations.",
  saas: "SaaSForge infers column types and builds dashboard tiles from uploaded spreadsheets: the same cleaning, typing and aggregation an analyst does by hand.",
  lessons: [
    {
      t: "Spreadsheet formulas, lookups and pivot tables",
      sub: ["Cleaning: TRIM, PROPER, SPLIT / Text to Columns, removing duplicates", "Conditional formulas: IF, IFS, SUMIFS, COUNTIFS, AVERAGEIFS", "Lookups: XLOOKUP (and VLOOKUP)", "Dates: EOMONTH, TEXT, NETWORKDAYS", "Pivot tables and calculated fields", "Charts and conditional formatting"],
      body: `<p>Most business data starts life in Excel or Google Sheets, and analysts are expected to be fast with it. The core skills are cleaning messy columns, summarising with conditional formulas, combining tables with lookups, and exploring with <b>pivot tables</b>.</p>
<p>Keep raw data on one sheet and never edit it by hand; do cleaning in helper columns and summaries on separate sheets. That way you can paste in next month's data and everything updates.</p>`,
      lang: "text",
      code: `Sheet "orders": A=order_id  B=date  C=customer  D=region  E=product  F=qty  G=unit_price

Clean and derive (row 2, fill down)
  H2  revenue        =F2*G2
  I2  month          =TEXT(B2,"yyyy-mm")
  J2  customer_clean =PROPER(TRIM(C2))
  K2  size           =IFS(H2>=50000,"Large",H2>=10000,"Medium",TRUE,"Small")

Lookup the product category from sheet "products" (A=product, B=category)
  L2  category       =XLOOKUP(E2, products!A:A, products!B:B, "Unknown")

Summary sheet
  Revenue in North, March 2026:
    =SUMIFS(orders!H:H, orders!D:D, "North", orders!I:I, "2026-03")
  Orders above ₹10,000:
    =COUNTIFS(orders!H:H, ">=10000")
  Average order value by region (B2 = region name):
    =AVERAGEIFS(orders!H:H, orders!D:D, B2)
  Month-over-month growth (C3 = this month, C2 = last month):
    =IFERROR(C3/C2-1, "")

Pivot table
  Rows: month     Columns: region     Values: SUM of revenue
  Filter: category
  Then: conditional formatting > colour scale on the values`,
      ex: "Create (or download) 500 rows of sales data. Build helper columns for revenue, month and category, a summary sheet with SUMIFS and growth formulas, a pivot of revenue by month and region, and one chart. Paste in 100 new rows and confirm everything updates.",
      q: ["Why keep raw data untouched on its own sheet?", ["Spreadsheets require it", "So you can refresh with new data and every formula and pivot updates without manual edits", "To save file size", "To hide it from managers"], 1, "Separating raw data from calculations makes the analysis repeatable."]
    },
    {
      t: "Statistics for analysts",
      sub: ["Mean, median, mode; why medians resist outliers", "Spread: standard deviation, percentiles, IQR", "Distributions and outliers", "Sampling, bias and margin of error", "Correlation is not causation", "A/B tests: significance and confidence intervals"],
      body: `<p>Statistics tells you how much to trust a number. Averages hide a lot: one huge order can drag the mean far from the typical value, which is why <b>medians</b> and <b>percentiles</b> are often more honest.</p>
<p>When comparing groups, such as two versions of a web page, ask whether the difference could be random noise. A <b>hypothesis test</b> gives a p-value; a <b>confidence interval</b> gives a range for the true difference, which is usually more useful to a decision-maker. And remember: two things moving together does not mean one causes the other.</p>`,
      lang: "python",
      code: `# pip install numpy scipy
import numpy as np
from scipy import stats

orders = np.array([420, 380, 510, 450, 395, 470, 12000, 430, 405, 460])   # one huge order
print("mean", orders.mean().round(1), "median", np.median(orders))          # mean misleads
print("p90", np.percentile(orders, 90), "IQR", np.subtract(*np.percentile(orders, [75, 25])))

# A/B test: did the new checkout page convert better?
a_visitors, a_conversions = 5000, 400      # 8.0%
b_visitors, b_conversions = 5000, 460      # 9.2%
p_a, p_b = a_conversions / a_visitors, b_conversions / b_visitors
diff = p_b - p_a

pooled = (a_conversions + b_conversions) / (a_visitors + b_visitors)
se_pooled = np.sqrt(pooled * (1 - pooled) * (1 / a_visitors + 1 / b_visitors))
z = diff / se_pooled
p_value = 2 * (1 - stats.norm.cdf(abs(z)))

se = np.sqrt(p_a * (1 - p_a) / a_visitors + p_b * (1 - p_b) / b_visitors)
ci = (diff - 1.96 * se, diff + 1.96 * se)

print(f"lift {diff:.2%}, z={z:.2f}, p={p_value:.3f}")
print(f"95% CI for the lift: {ci[0]:.2%} to {ci[1]:.2%}")
# Report: "B converted 1.2 points better (95% CI 0.1 to 2.3 points); unlikely to be noise."`,
      ex: "Simulate an A/B test where B is truly 0.5 points better, with 1,000 visitors per group, and run it 200 times. How often do you detect the difference? Repeat with 10,000 visitors and explain what changed.",
      q: ["A company's average salary is far above its median. What does that suggest?", ["Most people earn the average", "A few very high salaries are pulling the mean up", "The data is wrong", "Salaries are evenly spread"], 1, "Means are sensitive to outliers; medians show the typical value."]
    },
    {
      t: "SQL for analytics: CTEs and window functions",
      sub: ["CTEs (WITH) to break a question into steps", "Window functions: ROW_NUMBER, RANK, LAG, LEAD", "Running totals and moving averages", "Month-over-month growth", "Cohort retention", "Classic interview patterns: top N per group, nth event"],
      body: `<p>Analysts answer most questions with SQL straight against the company database or warehouse. Two features make complex questions readable: <b>CTEs</b> let you name intermediate results step by step, and <b>window functions</b> compute values across related rows (ranks, previous month, running totals) without collapsing them like GROUP BY does.</p>
<p>Top-N-per-group, month-over-month growth and cohort retention appear in almost every analyst interview.</p>`,
      lang: "sql",
      code: `-- Monthly revenue with month-over-month growth
WITH monthly AS (
  SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue   -- DATE_TRUNC in Postgres
  FROM orders
  GROUP BY 1
)
SELECT month, revenue,
       LAG(revenue) OVER (ORDER BY month) AS prev,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
             / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct,
       SUM(revenue) OVER (ORDER BY month) AS running_total
FROM monthly;

-- Top 3 customers per region
WITH ranked AS (
  SELECT region, customer_id, SUM(amount) AS spend,
         RANK() OVER (PARTITION BY region ORDER BY SUM(amount) DESC) AS rnk
  FROM orders GROUP BY region, customer_id
)
SELECT * FROM ranked WHERE rnk <= 3;

-- Each customer's second purchase date
SELECT customer_id, order_date
FROM (SELECT customer_id, order_date,
             ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS n
      FROM orders) t
WHERE n = 2;

-- Retention: share of each signup-month cohort that ordered N months later
WITH first AS (
  SELECT customer_id, MIN(strftime('%Y-%m', order_date)) AS cohort FROM orders GROUP BY 1
), activity AS (
  SELECT DISTINCT o.customer_id, f.cohort,
         (CAST(strftime('%Y', o.order_date) AS INT) * 12 + CAST(strftime('%m', o.order_date) AS INT))
       - (CAST(substr(f.cohort, 1, 4) AS INT) * 12 + CAST(substr(f.cohort, 6, 2) AS INT)) AS months_after
  FROM orders o JOIN first f USING (customer_id)
)
SELECT cohort, months_after, COUNT(*) AS active
FROM activity GROUP BY 1, 2 ORDER BY 1, 2;`,
      ex: "Load a sample e-commerce dataset into SQLite or DuckDB. Write queries for: top 5 products per category, 3-month moving average of revenue, customers whose spend dropped month over month, and a cohort retention table.",
      q: ["How does a window function differ from GROUP BY?", ["It is faster", "It computes across related rows while keeping every row in the result", "It only works on dates", "It cannot sort"], 1, "GROUP BY collapses rows; window functions add a computed column per row."]
    },
    {
      t: "pandas essentials",
      sub: ["DataFrames and Series", "Reading CSV, Excel and SQL", "Selecting and filtering: loc, boolean masks, query", "groupby and aggregation", "Merging tables", "Pivot tables and reshaping"],
      body: `<p><b>pandas</b> is a spreadsheet in code: a DataFrame is a table of typed columns you can filter, group, join and reshape. Unlike a spreadsheet, every step is written down, so the analysis is repeatable and reviewable.</p>
<p>Work in a Jupyter notebook: load, look (<code>head</code>, <code>info</code>, <code>describe</code>), then answer one question per cell. The same groupby, merge and pivot ideas you know from SQL and pivot tables apply directly.</p>`,
      lang: "python",
      code: `# pip install pandas openpyxl
import pandas as pd

orders = pd.DataFrame({
    "order_id": [1, 2, 3, 4, 5, 6],
    "date": pd.to_datetime(["2026-01-05", "2026-01-20", "2026-02-02", "2026-02-15", "2026-03-01", "2026-03-09"]),
    "customer": ["Aarav", "Priya", "Aarav", "Rohit", "Priya", "Sneha"],
    "region": ["North", "South", "North", "West", "South", "North"],
    "amount": [12000, 4500, 8000, 15000, 6200, 3000],
})
customers = pd.DataFrame({"customer": ["Aarav", "Priya", "Rohit", "Sneha"],
                          "segment": ["SMB", "Enterprise", "SMB", "Startup"]})

orders.info()                                          # types and missing values
big_north = orders[(orders.region == "North") & (orders.amount > 5000)]

orders["month"] = orders.date.dt.to_period("M").astype(str)
by_region = (orders.groupby("region")
                   .agg(orders=("order_id", "count"), revenue=("amount", "sum"), avg=("amount", "mean"))
                   .sort_values("revenue", ascending=False))

df = orders.merge(customers, on="customer", how="left")          # like a SQL LEFT JOIN
pivot = df.pivot_table(index="month", columns="segment", values="amount", aggfunc="sum", fill_value=0)

print(big_north, by_region, pivot, sep="\\n\\n")
# df.to_excel("summary.xlsx", index=False)     # hand results to people who live in Excel`,
      ex: "Load a public dataset (for example Kaggle's Superstore sales) in a notebook and answer: best and worst months, revenue by segment and region, top 10 customers, and average discount by category. Export a summary to Excel.",
      q: ["Which pandas operation matches SQL's LEFT JOIN?", ["concat", "merge(..., how='left')", "groupby", "pivot_table"], 1, "merge with how='left' keeps every row from the left table."]
    },
    {
      t: "Data cleaning in practice",
      sub: ["Fixing types: numbers stored as text, dates", "Missing values: drop, fill or flag", "Duplicates", "Inconsistent categories and typos", "Outliers: investigate before removing", "Validation checks and a cleaning log"],
      body: `<p>Real datasets arrive with numbers stored as text ("₹5,00,000"), dates in several formats, blank cells, duplicate rows and categories spelled five ways ("Bangalore", "Bengaluru", "BLR"). Analysts often spend most of their time here.</p>
<p>Clean in code, never by hand, and record every decision (why you filled or dropped values). End with <b>validation checks</b> that fail loudly if bad data slips through, so next month's file cannot silently corrupt the report.</p>`,
      lang: "python",
      code: `import pandas as pd

raw = pd.DataFrame({
    "order_id": [101, 102, 102, 103, 104, 105],
    "city": ["Bangalore", "bengaluru ", "bengaluru ", "BLR", "Mumbai", None],
    "amount": ["₹5,00,000", "4500", "4500", "", "12,000", "3000"],
    "date": ["2026-03-01", "01/03/2026", "01/03/2026", "2026-03-04", "5 Mar 2026", "2026-03-06"],
})
log = []

df = raw.drop_duplicates()
log.append(f"removed {len(raw) - len(df)} duplicate rows")

df["amount"] = pd.to_numeric(df["amount"].str.replace(r"[₹,\\s]", "", regex=True), errors="coerce")
log.append(f"{df.amount.isna().sum()} amounts missing or unparseable; kept as NaN and flagged")
df["amount_missing"] = df.amount.isna()

CITY = {"bangalore": "Bengaluru", "bengaluru": "Bengaluru", "blr": "Bengaluru", "mumbai": "Mumbai"}
df["city"] = df.city.str.strip().str.lower().map(CITY).fillna("Unknown")

iso = pd.to_datetime(df["date"], format="%Y-%m-%d", errors="coerce")       # 2026-03-01
other = pd.to_datetime(df["date"], format="mixed", dayfirst=True, errors="coerce")  # 01/03/2026, 5 Mar 2026
df["date"] = iso.fillna(other)                         # ISO first, so it is never read day-first

q1, q3 = df.amount.quantile([0.25, 0.75])
df["outlier"] = df.amount > q3 + 3 * (q3 - q1)          # flag, investigate, don't silently delete

assert df.order_id.is_unique, "duplicate order ids"
assert df.city.isin(["Bengaluru", "Mumbai", "Unknown"]).all(), "unexpected city"
assert (df.amount.dropna() > 0).all(), "non-positive amount"
print(df, *log, sep="\\n")`,
      ex: "Take a messy public dataset, write a cleaning script with a written log of every change and at least five assert checks, then deliberately break the input file and confirm a check catches it.",
      q: ["What should you usually do with an outlier first?", ["Delete it", "Investigate it: it may be an error or the most important data point", "Replace it with the mean", "Ignore it"], 1, "Outliers can be typos or real, important events; check before deciding."]
    },
    {
      t: "Data visualisation",
      sub: ["Choosing a chart: comparison, trend, distribution, relationship, part-to-whole", "matplotlib and seaborn basics", "Titles that state the takeaway", "Removing clutter and using colour on purpose", "Misleading charts: truncated axes, 3D, dual axes", "Small multiples"],
      body: `<p>A good chart makes one point obvious. Pick the form by the question: <b>bar</b> for comparing categories, <b>line</b> for trends over time, <b>histogram</b> for distributions, <b>scatter</b> for relationships. Pie charts work only for two or three parts.</p>
<p>Write the title as the takeaway ("South region drove 60% of Q1 growth"), not a label ("Revenue by region"). Remove gridlines and borders you don't need, use one highlight colour for what matters and grey for the rest, and start bar axes at zero.</p>`,
      lang: "python",
      code: `# pip install matplotlib pandas
import matplotlib.pyplot as plt
import pandas as pd

monthly = pd.DataFrame({
    "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "North": [120, 125, 130, 128, 135, 140],
    "South": [100, 115, 135, 160, 185, 210],
    "West": [90, 92, 95, 94, 97, 99],
})

fig, ax = plt.subplots(figsize=(8, 4.5))
for region, colour, width in [("North", "#9aa5a0", 1.5), ("West", "#9aa5a0", 1.5), ("South", "#0e7563", 3)]:
    ax.plot(monthly["month"], monthly[region], color=colour, linewidth=width)
    ax.annotate(region, (5, monthly[region].iloc[-1]), xytext=(6, 0), textcoords="offset points",
                va="center", color=colour, fontweight="bold" if region == "South" else "normal")

ax.set_title("South more than doubled since January while other regions stayed flat", loc="left", fontsize=12)
ax.set_ylabel("Revenue (₹ lakh)")
ax.spines[["top", "right"]].set_visible(False)        # remove clutter
ax.set_ylim(0, 230)                                    # honest baseline
plt.tight_layout()
plt.savefig("south_growth.png", dpi=150)`,
      ex: "Take one dataset and make the same point three ways (bar, line, table). Pick the clearest, rewrite its title as a takeaway, remove clutter and highlight only the key series. Then find a misleading chart online and redraw it honestly.",
      q: ["Which chart best shows how revenue changed month by month?", ["Pie chart", "Line chart", "Scatter plot", "Histogram"], 1, "Line charts show trends over an ordered time axis."]
    },
    {
      t: "Dashboards, KPIs and storytelling",
      sub: ["Defining KPIs precisely (numerator, denominator, filters)", "Dashboard layout: summary first, detail on demand", "BI tools: Power BI (DAX), Tableau, Looker Studio", "Funnels and retention metrics", "Structuring a findings presentation", "Making a recommendation"],
      body: `<p>An analyst's job is to change a decision. Start by defining each metric exactly: "conversion rate = orders ÷ sessions, excluding internal traffic, per calendar week". Ambiguous metrics cause most arguments in meetings.</p>
<p>Dashboards put the few numbers that matter at the top, trends in the middle and filters for detail. When you present, follow a simple story: the question, what you found, why it matters, what you recommend and what you would check next.</p>`,
      lang: "text",
      code: `KPI DEFINITIONS (write these before building anything)
  Revenue          = SUM(order_amount) where status = 'paid', by order date (IST)
  Conversion rate  = paid orders / unique sessions, excluding staff IPs, weekly
  Repeat rate      = customers with ≥2 orders in 90 days / customers with ≥1 order
  Average order    = revenue / paid orders

POWER BI MEASURES (DAX)
  Revenue        = CALCULATE(SUM(Orders[Amount]), Orders[Status] = "paid")
  Revenue LY     = CALCULATE([Revenue], SAMEPERIODLASTYEAR('Date'[Date]))
  YoY Growth %   = DIVIDE([Revenue] - [Revenue LY], [Revenue LY])
  Conversion %   = DIVIDE(COUNTROWS(FILTER(Orders, Orders[Status] = "paid")),
                          DISTINCTCOUNT(Sessions[SessionId]))

DASHBOARD LAYOUT
  Row 1  four KPI tiles: Revenue, YoY growth, Conversion, Repeat rate (each vs last period)
  Row 2  revenue trend (line) | funnel: visit → cart → checkout → paid
  Row 3  revenue by region and category (bars) | top products table
  Filters: date range, region, channel

FINDINGS DECK (5 slides)
  1 Question   "Why did revenue fall 8% in September?"
  2 Answer     "Mobile checkout conversion dropped from 3.1% to 2.2% after the 2 Sep release."
  3 Evidence   funnel by device before/after; desktop unchanged
  4 Impact     "≈ ₹14 lakh lost per month if not fixed"
  5 Recommend  roll back the payment step on mobile; A/B test the new design; track daily`,
      ex: "Pick a dataset, write precise definitions for four KPIs, build a one-page dashboard in Power BI, Tableau Public or Looker Studio, and present a 5-slide findings story to a friend in five minutes. Ask them to repeat your recommendation back.",
      q: ["What should come first on an executive dashboard?", ["Raw data tables", "A few headline KPIs with comparison to the previous period", "Every chart you made", "Filters"], 1, "Summary first, detail on demand; leaders scan the top row."]
    }
  ]
});
