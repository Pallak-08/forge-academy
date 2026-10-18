/* Forge Academy lessons: data modelling and warehousing, pipelines and orchestration, big data and streaming */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 84, id: "data-modeling-lessons", fills: "data-modeling", title: "Data modelling and warehousing", level: 2,
  blurb: "Analytical workloads, dimensional models and cloud warehouses.",
  lessons: [
    {
      t: "OLTP vs OLAP",
      sub: ["Transactional vs analytical workloads", "Row vs column storage", "Data warehouses, lakes and lakehouses", "Modern cloud warehouses"],
      body: `<p><b>OLTP</b> (online transaction processing) systems run the business: app databases handling many small reads and writes (create an order, update a profile) that must be fast and consistent. <b>OLAP</b> (online analytical processing) systems analyse the business: few, large queries scanning millions or billions of rows to aggregate (revenue by month by region for three years). Running heavy analytics on the production database slows the app and is awkward for history, so analytics moves to separate systems.</p>
<p><b>Row storage</b> (Postgres, MySQL) keeps each row's values together, ideal for fetching or updating whole records. <b>Column storage</b> (BigQuery, Snowflake, Redshift, ClickHouse, DuckDB, Parquet files) keeps each column's values together, so a query reading 3 of 80 columns reads only those, and similar values compress extremely well. That's why analytical queries are often 10–100× faster on columnar systems.</p>
<p>Where analytical data lives:</p>
<ul><li>A <b>data warehouse</b> stores cleaned, structured, modelled data for SQL analytics and BI.</li>
<li>A <b>data lake</b> stores raw files of any type cheaply in object storage (S3, GCS, ADLS): logs, JSON, images, exports. Flexible, but without discipline it becomes a "data swamp".</li>
<li>A <b>lakehouse</b> adds table formats (Delta Lake, Apache Iceberg, Hudi) on top of lake files, bringing warehouse features (ACID transactions, schema enforcement, time travel) to cheap open storage, queryable by many engines (Spark, Trino, Databricks, Snowflake, BigQuery).</li></ul>
<p><b>Modern cloud warehouses</b> separate storage from compute, so you store everything cheaply and scale query power up and down on demand, paying per query (BigQuery on-demand) or per compute time (Snowflake warehouses, Redshift Serverless). The typical modern stack: ingestion tools load raw data into the warehouse, dbt transforms it, and BI tools read the modelled tables.</p>`,
      lang: "sql",
      code: `-- Same question, two systems

-- OLTP (Postgres, app database): many tiny, indexed operations
INSERT INTO orders (user_id, total, status) VALUES (42, 1499, 'paid');
SELECT * FROM orders WHERE id = 98123;                          -- one row by primary key: ~1 ms

-- OLAP (BigQuery / Snowflake / DuckDB): one huge scan + aggregate over 3 years of orders
SELECT DATE_TRUNC(order_date, MONTH) AS month,
       region,
       SUM(revenue)                AS revenue,
       COUNT(DISTINCT customer_id) AS customers
FROM analytics.fct_orders                                       -- 800M rows, 60 columns
WHERE order_date >= DATE '2023-10-01'
GROUP BY 1, 2
ORDER BY 1, 2;
-- Columnar storage reads only order_date, region, revenue, customer_id (4 of 60 columns),
-- heavily compressed, in parallel across many workers -> seconds, not hours.

-- DuckDB on your laptop: the same columnar idea, directly over Parquet files in a lake
-- SELECT region, SUM(revenue) FROM 's3://company-lake/orders/*.parquet' GROUP BY region;

/* Typical modern data stack
   App DBs, SaaS tools (Razorpay, HubSpot), event streams
        |  ingestion: Fivetran / Airbyte / custom Python / CDC
        v
   Raw layer (warehouse schemas or lakehouse tables, untouched copies)
        |  transformation: dbt (SQL models, tests, docs)
        v
   Staging -> intermediate -> marts (facts and dimensions)
        |
        v
   BI (Power BI, Looker, Metabase), notebooks, ML features, reverse ETL back to tools */`,
      ex: "Load the same dataset (a few million rows; generate it or use the NYC taxi Parquet files) into Postgres and DuckDB. Time three analytical queries (monthly aggregates, distinct counts, a filtered group-by) in both and explain the difference using row versus column storage. Then draw the modern data stack for a food delivery company, naming one tool for each layer.",
      q: ["Why are columnar warehouses much faster for queries like 'total revenue by month over three years'?", ["They have bigger disks", "They read only the columns the query needs, compress them heavily and scan them in parallel", "They store data in JSON", "They cache every query in advance"], 1, "Analytical queries touch few columns across many rows, which is exactly what columnar storage and compression optimise."]
    },
    {
      t: "Dimensional modelling",
      sub: ["Facts and dimensions", "Star and snowflake schemas", "Slowly changing dimensions", "Grain"],
      body: `<p><b>Dimensional modelling</b> (from Ralph Kimball) organises analytical data so it's easy to understand and fast to query.</p>
<p><b>Fact tables</b> record business events or measurements: orders, payments, page views, inventory snapshots. They contain foreign keys to dimensions and numeric <b>measures</b> (quantity, revenue, discount). They're long and narrow. <b>Dimension tables</b> describe the context of events: who (customer), what (product), where (store, city), when (date). They're shorter and wide, full of descriptive attributes used for filtering and grouping (category, brand, region, customer segment).</p>
<p>A <b>star schema</b> has one fact table directly joined to denormalised dimensions: simple to understand and efficient for BI tools. A <b>snowflake schema</b> normalises dimensions into sub-tables (product → category → department), saving some space at the cost of more joins; star schemas are usually preferred today, since storage is cheap.</p>
<p>The <b>grain</b> is the most important decision: exactly what one row of a fact table represents (one row per order line, or per order, or per customer per day). Declare it first and never mix grains in one table; mixing is the most common cause of double-counted totals.</p>
<p><b>Slowly changing dimensions</b> (SCDs) handle attributes that change over time, such as a customer moving city. <b>Type 1</b> overwrites the old value (history lost; fine for corrections). <b>Type 2</b> adds a new row with validity dates (<code>valid_from</code>, <code>valid_to</code>, <code>is_current</code>), preserving history, so last year's sales still count towards the city the customer lived in then. dbt <b>snapshots</b> implement Type 2 automatically.</p>
<p>A <b>date dimension</b> (one row per day with month, quarter, weekday, holidays, financial year) makes time analysis consistent.</p>`,
      lang: "sql",
      code: `-- Grain declaration: fct_order_lines = ONE ROW PER PRODUCT LINE ON AN ORDER

CREATE TABLE dim_date (
  date_key      int PRIMARY KEY,          -- 20261018
  date          date,
  month_name    text, quarter text, year int,
  fy            text,                     -- Indian financial year, e.g. 'FY2026-27'
  is_weekend    boolean, is_festival boolean
);

CREATE TABLE dim_customer (               -- SCD Type 2: history of city/segment changes
  customer_sk   bigint PRIMARY KEY,       -- surrogate key (one per version)
  customer_id   text,                     -- natural key from the app
  name text, city text, segment text,
  valid_from    date, valid_to date, is_current boolean
);

CREATE TABLE dim_product (
  product_sk bigint PRIMARY KEY, sku text, name text, category text, brand text
);

CREATE TABLE fct_order_lines (
  order_id     text,
  date_key     int    REFERENCES dim_date,
  customer_sk  bigint REFERENCES dim_customer,   -- the customer VERSION valid at order time
  product_sk   bigint REFERENCES dim_product,
  quantity     int,
  revenue      numeric(12,2),
  discount     numeric(12,2)
);

-- Star-schema query: revenue by festival vs normal days, by customer city AT THE TIME of purchase
SELECT d.fy, d.is_festival, c.city, SUM(f.revenue) AS revenue
FROM fct_order_lines f
JOIN dim_date d     ON d.date_key = f.date_key
JOIN dim_customer c ON c.customer_sk = f.customer_sk
GROUP BY 1, 2, 3;

-- Grain mistake to avoid: putting order-level shipping_fee on every order LINE
-- -> SUM(shipping_fee) multiplies the fee by the number of lines. Keep it in fct_orders (order grain).

-- dbt snapshot for Type 2 history (snapshots/customers.sql)
-- {% snapshot customers_snapshot %}
-- {{ config(target_schema='snapshots', unique_key='customer_id', strategy='check',
--           check_cols=['city', 'segment']) }}
-- select * from {{ source('app', 'customers') }}
-- {% endsnapshot %}`,
      ex: "Design a dimensional model for an online learning platform: declare the grain of two fact tables (enrolments and lesson completions), build date, student (Type 2 for city and plan), course and instructor dimensions, and write five business queries against it. Show with sample data how a mixed-grain table would double-count a measure, and how your design avoids it.",
      q: ["Why declare the grain of a fact table before adding columns?", ["Grain sets the table's font", "Defining exactly what one row represents prevents mixing levels of detail, the most common cause of double-counted totals", "It's needed for primary keys only", "BI tools require a grain field"], 1, "A measure at order level stored on order-line rows gets summed once per line. A clear grain keeps every measure at the right level."]
    },
    {
      t: "Cloud warehouses",
      sub: ["BigQuery, Snowflake, Redshift", "Partitioning and clustering", "Cost control", "DuckDB for local work"],
      body: `<p>The three most common cloud warehouses:</p>
<ul><li><b>BigQuery</b> (Google Cloud): serverless, nothing to provision. On-demand pricing charges per byte scanned; capacity pricing reserves compute. Excellent with GA4, Google Ads and Sheets data.</li>
<li><b>Snowflake</b> (runs on AWS, Azure or GCP): storage separate from independently sized "virtual warehouses" (compute clusters) that you start, stop and scale per workload, billed per second of running time. Strong data sharing features.</li>
<li><b>Amazon Redshift</b>: AWS's warehouse, provisioned clusters or Redshift Serverless, tightly integrated with S3 and the AWS ecosystem.</li></ul>
<p>Also common: Databricks SQL (lakehouse), Azure Synapse and Microsoft Fabric, and ClickHouse for real-time analytics.</p>
<p><b>Partitioning</b> splits a table into segments, usually by date (one partition per day), so queries filtering on that column scan only the relevant partitions. <b>Clustering</b> (BigQuery clustering, Snowflake clustering keys, Redshift sort keys) orders data within storage by frequently filtered columns (customer_id, region) so the engine skips blocks that can't match. Together they can cut scanned data, and therefore cost and time, by orders of magnitude.</p>
<p><b>Cost control</b>: never <code>SELECT *</code> on big tables (columnar pricing charges for every column read); always filter on the partition column; preview data with table previews rather than queries; set maximum bytes billed per query and project budgets with alerts; materialise heavily used aggregates instead of recomputing them; auto-suspend Snowflake warehouses after a minute or two idle; and monitor the most expensive queries regularly.</p>
<p><b>DuckDB</b> is an in-process analytical database: a single library (in Python, R, the CLI or even the browser) that runs fast columnar SQL over local files and DataFrames. It's ideal for prototyping, local development of transformations and analysing gigabytes of data on a laptop at zero cost.</p>`,
      lang: "sql",
      code: `-- BigQuery: partitioned + clustered events table
CREATE TABLE analytics.events (
  event_ts     TIMESTAMP,
  user_id      STRING,
  event_name   STRING,
  country      STRING,
  properties   JSON
)
PARTITION BY DATE(event_ts)                    -- one partition per day
CLUSTER BY event_name, country                 -- skip blocks that can't match filters
OPTIONS (partition_expiration_days = 400, require_partition_filter = TRUE);   -- forces date filters

-- Cheap: scans 7 partitions and 3 columns
SELECT country, COUNT(DISTINCT user_id) AS users
FROM analytics.events
WHERE DATE(event_ts) BETWEEN '2026-10-11' AND '2026-10-17'
  AND event_name = 'purchase'
GROUP BY country;

-- Expensive: every partition, every column (and blocked by require_partition_filter)
-- SELECT * FROM analytics.events;

-- Check cost before running (bq CLI dry run)
-- bq query --dry_run --use_legacy_sql=false 'SELECT ...'
--   -> "Query will process 1.2 GB"
-- Hard cap per query: --maximum_bytes_billed=10000000000

-- Snowflake: right-size compute and stop paying when idle
-- CREATE WAREHOUSE analytics_wh WAREHOUSE_SIZE = 'XSMALL' AUTO_SUSPEND = 60 AUTO_RESUME = TRUE;
-- ALTER TABLE events CLUSTER BY (TO_DATE(event_ts), event_name);

-- DuckDB locally (Python): same SQL over local Parquet, zero cost
-- import duckdb
-- duckdb.sql("""SELECT country, COUNT(DISTINCT user_id) FROM 'events/*.parquet'
--               WHERE event_name = 'purchase' GROUP BY 1""").show()`,
      ex: "In the BigQuery free sandbox, load a public dataset into your own partitioned and clustered table. Run the same query against an unpartitioned copy and the partitioned one with dry runs, and record bytes scanned for each. Set a maximum-bytes-billed limit, then reproduce one of the queries locally with DuckDB on Parquet files and compare the experience.",
      q: ["A BigQuery table is partitioned by date. What makes a query cheap?", ["Using SELECT *", "Filtering on the partition column and selecting only needed columns, so fewer partitions and columns are scanned", "Running it at night", "Adding ORDER BY"], 1, "On-demand pricing charges for bytes scanned. Partition pruning and column selection directly reduce that."]
    }
  ]
});

COURSE.push({
  n: 85, id: "pipelines-lessons", fills: "pipelines", title: "Data pipelines and orchestration", level: 3,
  blurb: "Moving, transforming and checking data reliably.",
  lessons: [
    {
      t: "ETL and ELT",
      sub: ["Extract, transform, load", "ELT with the warehouse", "Batch vs incremental loads", "Idempotent pipelines"],
      body: `<p>A <b>data pipeline</b> moves data from sources (app databases, SaaS APIs, files, event streams) to destinations (a warehouse or lake) and reshapes it for use.</p>
<p><b>ETL</b> (extract, transform, load) transforms data in a separate processing step before loading: the traditional approach when warehouse compute was expensive, and still used when data must be cleaned or anonymised before it lands. <b>ELT</b> (extract, load, transform) loads raw data first, then transforms it inside the warehouse with SQL (typically dbt). Modern cloud warehouses make ELT the default: raw data is kept (so you can rebuild anything), transformations are version-controlled SQL, and analysts can contribute.</p>
<p><b>Extraction</b> options: managed connectors (Fivetran, Airbyte, Stitch) for common SaaS sources; custom Python for niche APIs; and <b>change data capture</b> (CDC, such as Debezium reading the Postgres write-ahead log) to stream every insert, update and delete from operational databases with low load on the source.</p>
<p><b>Full vs incremental loads</b>: a full load copies everything each run, which is simple but slow and expensive at scale. An <b>incremental load</b> copies only new or changed records since the last run, using a high-water mark such as <code>updated_at</code> or an increasing ID, or CDC. Watch out for late-arriving data and hard deletes (which a timestamp filter never sees).</p>
<p><b>Idempotency</b> is the key property: running a pipeline twice for the same period must give the same result, never duplicates. Techniques: <b>merge/upsert</b> on a unique key, or <b>delete-and-replace</b> the partition being processed (rewrite all of 2026-10-17), and parameterise runs by date rather than "now", so failed runs can simply be re-run and historical periods backfilled safely.</p>`,
      lang: "python",
      code: `# Incremental, idempotent extract-load from an app database into the warehouse (ELT)
import os, datetime as dt
import pandas as pd
from sqlalchemy import create_engine, text

src = create_engine(os.environ["APP_DB_URL"])            # read replica
wh = create_engine(os.environ["WAREHOUSE_URL"])

def load_orders_for_day(day: dt.date) -> int:
    """Re-runnable for any day: same input -> same result, no duplicates."""
    start, end = day, day + dt.timedelta(days=1)
    df = pd.read_sql(text("""
        SELECT id, user_id, total, status, created_at, updated_at
        FROM orders WHERE updated_at >= :start AND updated_at < :end
    """), src, params={"start": start, "end": end})
    df["_loaded_at"] = dt.datetime.now(dt.timezone.utc)

    with wh.begin() as conn:                              # one transaction
        df.to_sql("orders_stage", conn, schema="raw", if_exists="replace", index=False)
        conn.execute(text("""
            MERGE INTO raw.orders AS t
            USING raw.orders_stage AS s ON t.id = s.id
            WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET
                 user_id = s.user_id, total = s.total, status = s.status,
                 updated_at = s.updated_at, _loaded_at = s._loaded_at
            WHEN NOT MATCHED THEN INSERT (id, user_id, total, status, created_at, updated_at, _loaded_at)
                 VALUES (s.id, s.user_id, s.total, s.status, s.created_at, s.updated_at, s._loaded_at)
        """))                                             # upsert: re-runs never duplicate
    return len(df)

# Backfill a month safely: each day is independent and idempotent
for d in pd.date_range("2026-09-01", "2026-09-30"):
    print(d.date(), load_orders_for_day(d.date()))

# Hard deletes are invisible to updated_at filters -> use soft deletes (deleted_at)
# in the source, or CDC (Debezium) which emits delete events.`,
      ex: "Write an incremental, idempotent pipeline that copies a Postgres table into DuckDB or BigQuery by day using MERGE, plus a backfill command for a date range. Prove idempotency by running the same day three times and checking row counts and totals don't change, then update and soft-delete source rows and show the next run picks them up.",
      q: ["What makes a pipeline idempotent?", ["It runs very quickly", "Running it more than once for the same input period produces the same result, with no duplicates", "It never fails", "It only uses SQL"], 1, "Idempotent pipelines can be retried and backfilled safely, which is essential because jobs fail and data arrives late."]
    },
    {
      t: "Orchestration with Airflow",
      sub: ["DAGs, tasks and operators", "Scheduling and backfills", "Retries and alerts", "Prefect and Dagster alternatives"],
      body: `<p>Real data platforms have dozens of dependent jobs: extract from five sources, then transform, then run data tests, then refresh dashboards and send a report. An <b>orchestrator</b> runs them in the right order, on schedule, with retries, logging and visibility.</p>
<p><b>Apache Airflow</b> is the most widely used. Pipelines are <b>DAGs</b> (directed acyclic graphs) defined in Python: <b>tasks</b> and their dependencies. Tasks use <b>operators</b> (run Python, run SQL, run a dbt command, trigger a Spark job, call an API) or the TaskFlow API's <code>@task</code> decorator. Airflow should <i>orchestrate</i>, not do the heavy processing itself: tasks trigger work in warehouses, Spark or containers.</p>
<p><b>Scheduling</b>: each DAG run covers a <b>data interval</b> (for a daily DAG, yesterday). Tasks should use the logical date of the run (<code>ds</code>, <code>data_interval_start</code>) rather than "now", which makes them idempotent and enables <b>backfills</b>: re-running a DAG for past dates after a bug fix or for new pipelines (<code>catchup</code> or <code>airflow dags backfill</code>).</p>
<p><b>Reliability</b>: configure retries with delays for transient failures, timeouts, failure callbacks that alert Slack or email, SLAs for critical deliveries, and sensors to wait for upstream data. Keep secrets in Airflow connections or a secret backend, never in DAG code. Managed options: Amazon MWAA, Google Cloud Composer, Astronomer.</p>
<p><b>Alternatives</b>: <b>Dagster</b> is asset-centric (you define the data assets and their dependencies, with built-in lineage, types and testing); <b>Prefect</b> turns ordinary Python functions into flows with a light, developer-friendly API. Simpler needs may be met by cron, GitHub Actions schedules, or dbt Cloud jobs.</p>`,
      lang: "python",
      code: `# dags/daily_sales.py  (Airflow 2.x TaskFlow API)
from datetime import datetime, timedelta
from airflow.decorators import dag, task
from airflow.operators.bash import BashOperator
from airflow.providers.slack.notifications.slack import send_slack_notification

default_args = {
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
    "execution_timeout": timedelta(hours=1),
    "on_failure_callback": send_slack_notification(text="Task {{ ti.task_id }} failed for {{ ds }}",
                                                   channel="#data-alerts"),
}

@dag(schedule="30 1 * * *", start_date=datetime(2026, 9, 1), catchup=True,   # 07:00 IST, backfills enabled
     default_args=default_args, max_active_runs=3, tags=["sales"])
def daily_sales():

    @task
    def extract_orders(ds=None):                     # ds = logical date of THIS run (YYYY-MM-DD)
        from pipelines.orders import load_orders_for_day
        return load_orders_for_day(ds)               # idempotent, parameterised by date

    @task
    def extract_payments(ds=None):
        from pipelines.payments import load_payments_for_day
        return load_payments_for_day(ds)

    dbt_build = BashOperator(                        # transform + test in the warehouse
        task_id="dbt_build",
        bash_command="cd /opt/dbt && dbt build --select tag:sales --vars '{run_date: {{ ds }}}'",
    )

    @task
    def refresh_dashboard():
        import requests
        requests.post("https://bi.example.com/api/refresh/sales", timeout=30).raise_for_status()

    [extract_orders(), extract_payments()] >> dbt_build >> refresh_dashboard()

daily_sales()

# Backfill after fixing a bug:
#   airflow dags backfill daily_sales --start-date 2026-09-01 --end-date 2026-09-30`,
      ex: "Run Airflow locally (the official docker compose or <code>astro dev start</code>) and build a daily DAG: two parallel extract tasks (an API and a database) using the logical date, a dbt build task, a data quality check and a notification. Configure retries and failure alerts, make one task fail intermittently to watch retries, and backfill the last 14 days.",
      q: ["Why should Airflow tasks use the run's logical date (ds) instead of the current time?", ["It runs faster", "So each run processes a fixed data interval, making runs idempotent and backfills for past dates possible", "Airflow can't read the clock", "It's required for retries to work"], 1, "Using 'now' makes reruns and backfills process the wrong data. The logical date ties each run to its own period."]
    },
    {
      t: "Transformations with dbt",
      sub: ["Models and materialisations", "Tests and documentation", "Sources and seeds", "Incremental models"],
      body: `<p><b>dbt</b> (data build tool) brings software engineering practices to SQL transformations in the warehouse. Each <b>model</b> is a <code>SELECT</code> statement in a <code>.sql</code> file; dbt builds it as a table or view. Models reference each other with <code>{{ ref('stg_orders') }}</code>, so dbt knows the dependency graph, runs models in order and draws lineage. Jinja templating adds variables, conditionals and reusable macros.</p>
<p>A common project structure: <b>staging</b> models (one per source table: rename columns, cast types, light cleaning), <b>intermediate</b> models (joins and business logic), and <b>marts</b> (facts and dimensions for BI and analysts).</p>
<p><b>Materialisations</b> decide how a model is built: <code>view</code> (no storage, always fresh, computed on read), <code>table</code> (rebuilt each run, fast to query), <code>incremental</code> (only new or changed rows processed each run) and <code>ephemeral</code> (inlined into other models).</p>
<p><b>Tests</b> run with <code>dbt test</code> or <code>dbt build</code>: generic tests in YAML (<code>unique</code>, <code>not_null</code>, <code>accepted_values</code>, <code>relationships</code>), custom SQL tests that fail if they return rows, and packages like dbt-expectations. <b>Documentation</b>: describe models and columns in YAML, then <code>dbt docs generate</code> creates a browsable site with lineage graphs.</p>
<p><b>Sources</b> declare the raw tables loaded by ingestion (with freshness checks: warn if data is more than 12 hours old). <b>Seeds</b> are small CSV files version-controlled in the project (country codes, mapping tables), loaded with <code>dbt seed</code>.</p>
<p><b>Incremental models</b> process only new data for large tables, using <code>is_incremental()</code> to filter to rows newer than what's already built, with a <code>unique_key</code> so late updates merge instead of duplicating.</p>`,
      lang: "sql",
      code: `-- models/staging/stg_orders.sql : clean one source table
with source as (select * from {{ source('app', 'orders') }})
select
    id                          as order_id,
    user_id                     as customer_id,
    total / 100.0               as revenue_inr,          -- paise -> rupees
    lower(status)               as status,
    created_at::timestamp       as ordered_at,
    updated_at::timestamp       as updated_at
from source
where id is not null

-- models/marts/fct_orders.sql : incremental fact table
{{ config(materialized='incremental', unique_key='order_id', on_schema_change='append_new_columns') }}
select o.order_id, o.customer_id, o.revenue_inr, o.status, o.ordered_at, o.updated_at,
       c.city, c.segment
from {{ ref('stg_orders') }} o
left join {{ ref('dim_customers') }} c using (customer_id)
{% if is_incremental() %}
  where o.updated_at > (select max(updated_at) from {{ this }})   -- only new or changed rows
{% endif %}

-- models/marts/schema.yml : tests and docs
-- version: 2
-- sources:
--   - name: app
--     schema: raw
--     freshness: { warn_after: {count: 12, period: hour}, error_after: {count: 24, period: hour} }
--     loaded_at_field: _loaded_at
--     tables: [ { name: orders }, { name: customers } ]
-- models:
--   - name: fct_orders
--     description: One row per order. Revenue in INR.
--     columns:
--       - name: order_id
--         tests: [unique, not_null]
--       - name: status
--         tests: [ { accepted_values: { values: [pending, paid, refunded, cancelled] } } ]
--       - name: customer_id
--         tests: [ { relationships: { to: ref('dim_customers'), field: customer_id } } ]

-- tests/assert_no_negative_revenue.sql : custom test (fails if any rows returned)
-- select * from {{ ref('fct_orders') }} where revenue_inr < 0

-- Commands: dbt seed && dbt build    (run + test in dependency order)
--           dbt source freshness     dbt docs generate && dbt docs serve`,
      ex: "Create a dbt project on DuckDB (dbt-duckdb) or BigQuery with sources and freshness checks, a seed for a mapping table, staging models for three raw tables, an intermediate model and two marts (one incremental). Add generic and custom tests, document every mart column, generate the docs site and break a test on purpose to see dbt build stop downstream models.",
      q: ["What does {{ ref('stg_orders') }} give you in dbt compared with writing the table name directly?", ["Faster SQL execution", "dbt learns the dependency, builds models in the right order, resolves the correct schema per environment and shows lineage", "Automatic indexing", "Encryption of the table"], 1, "ref() is how dbt builds its dependency graph and environment-aware table names, which powers ordering, lineage and docs."]
    },
    {
      t: "Data quality",
      sub: ["Validation checks", "Great Expectations / Soda", "Data contracts", "Lineage"],
      body: `<p>Bad data quietly breaks dashboards, models and decisions, and is often noticed weeks later by the wrong person. Test data the way you test code.</p>
<p><b>Validation checks</b> to run at ingestion and after transformations:</p>
<ul><li><b>Completeness</b>: required columns not null; expected row counts (today's load isn't 90% smaller than usual).</li>
<li><b>Uniqueness</b>: primary keys unique, no duplicate events.</li>
<li><b>Validity</b>: values in allowed sets, ranges and formats (status in a known list, amounts positive, emails valid).</li>
<li><b>Consistency</b>: referential integrity (every order's customer exists); totals reconcile with the source system.</li>
<li><b>Freshness</b>: data arrived on time.</li>
<li><b>Distribution</b>: no sudden shifts in averages, null rates or category mix (anomaly detection).</li></ul>
<p><b>Tools</b>: dbt tests cover much of this inside transformations. <b>Great Expectations</b> (GX) defines "expectations" in Python for DataFrames and databases, with validation reports. <b>Soda</b> uses readable YAML checks (SodaCL). Observability platforms (Monte Carlo, Elementary for dbt) add automatic anomaly detection and incident workflows. Decide which failures <b>block</b> the pipeline (wrong primary keys) and which only <b>warn</b>.</p>
<p><b>Data contracts</b> are agreements between data producers (usually the application team) and consumers: the schema, meaning, freshness and quality guarantees of a dataset or event, versioned and enforced in CI, so an app developer can't silently rename a column that breaks finance reporting. They make upstream changes deliberate.</p>
<p><b>Lineage</b> shows how data flows from sources through transformations to dashboards (dbt docs, OpenLineage, data catalogs like DataHub). It answers "what breaks if this column changes?" and "where did this number come from?", which is essential for debugging and for trust.</p>`,
      lang: "yaml",
      code: `# Soda checks (checks/orders.yml) -> soda scan -d warehouse -c config.yml checks/orders.yml
checks for fct_orders:
  - row_count > 0
  - anomaly detection for row_count                   # alert on unusual daily volume
  - freshness(updated_at) < 6h
  - missing_count(customer_id) = 0
  - duplicate_count(order_id) = 0
  - invalid_count(status) = 0:
      valid values: [pending, paid, refunded, cancelled]
  - min(revenue_inr) >= 0
  - avg(revenue_inr) between 300 and 5000:            # business sanity range
      warn: when not between 400 and 3000
  - values in (customer_id) must exist in dim_customers (customer_id)

---
# Data contract for the orders events produced by the app team (contracts/orders.v1.yml)
dataset: app.orders
version: 1.2.0
owner: checkout-team@example.com
consumers: [finance-reporting, growth-analytics, fraud-model]
freshness: "available in raw within 1 hour"
schema:
  - { name: id,         type: string,    required: true, unique: true }
  - { name: user_id,    type: string,    required: true }
  - { name: total,      type: integer,   required: true, description: "amount in paise, >= 0" }
  - { name: status,     type: string,    required: true, enum: [pending, paid, refunded, cancelled] }
  - { name: created_at, type: timestamp, required: true }
change_policy: "breaking changes (rename, remove, type change) need a new major version and 30 days notice"
# CI in the app repo validates migrations/events against this contract before merge.

# Great Expectations (Python) equivalent, for a pandas DataFrame:
#   import great_expectations as gx
#   batch = gx.get_context().data_sources.pandas_default.read_dataframe(df)
#   batch.validate(gx.expectations.ExpectColumnValuesToBeUnique(column="order_id"))
#   batch.validate(gx.expectations.ExpectColumnValuesToBeBetween(column="revenue_inr", min_value=0))`,
      ex: "Add data quality to a pipeline you built: Soda or Great Expectations checks covering completeness, uniqueness, validity, referential integrity, freshness and a volume anomaly, wired to fail or warn appropriately in your orchestrator. Write a data contract for one source table, then simulate three upstream problems (duplicate IDs, a renamed column, a day with half the rows) and show each being caught.",
      q: ["What problem do data contracts mainly solve?", ["Slow queries", "Upstream teams changing data (renaming or removing fields) without warning and silently breaking downstream reports and models", "Warehouse costs", "Dashboard colours"], 1, "Contracts make schemas and guarantees explicit and enforced, so breaking changes become deliberate, versioned decisions."]
    }
  ]
});

COURSE.push({
  n: 86, id: "big-data-lessons", fills: "big-data", title: "Big data and streaming", level: 3,
  blurb: "Spark, Kafka and lakehouse storage.",
  lessons: [
    {
      t: "Distributed processing with Spark",
      sub: ["Why distributed processing", "DataFrames in PySpark", "Partitions and shuffles", "Spark on Databricks"],
      body: `<p>When data is too large or computations too heavy for one machine, <b>distributed processing</b> splits the work across a cluster. <b>Apache Spark</b> is the standard engine: a driver plans the job and executors on many machines process partitions of the data in parallel, in memory where possible. Before reaching for Spark, check whether DuckDB, Polars or the warehouse can do the job: a single modern machine handles hundreds of gigabytes, and distributed systems add real complexity.</p>
<p><b>PySpark DataFrames</b> look like pandas or SQL: <code>filter</code>, <code>select</code>, <code>withColumn</code>, <code>groupBy().agg()</code>, <code>join</code>, window functions, or plain Spark SQL. Operations are <b>lazy</b>: transformations build a plan, and nothing runs until an <b>action</b> (<code>count</code>, <code>show</code>, <code>write</code>). The Catalyst optimiser then rewrites the whole plan, pushing filters down and pruning columns. Prefer built-in functions over Python UDFs, which are much slower.</p>
<p><b>Partitions</b> are the chunks of data processed in parallel. A <b>shuffle</b> redistributes data across the network so rows with the same key end up together, needed for <code>groupBy</code>, joins and <code>distinct</code>. Shuffles are the main cost in Spark jobs. Reduce them by filtering early, using <b>broadcast joins</b> for small tables (send the small table to every executor instead of shuffling the big one), and handling <b>skew</b> (one key with far more rows than others, such as a "unknown" customer ID). Read the Spark UI to find slow stages.</p>
<p><b>Databricks</b> is the most popular managed Spark platform: notebooks, managed clusters, Delta Lake, job scheduling, Unity Catalog for governance and SQL warehouses. Spark also runs on AWS EMR, Google Dataproc and Kubernetes.</p>`,
      lang: "python",
      code: `from pyspark.sql import SparkSession, functions as F, Window

spark = SparkSession.builder.appName("daily-revenue").getOrCreate()

orders = spark.read.parquet("s3://lake/raw/orders/")             # billions of rows, many files
customers = spark.read.parquet("s3://lake/raw/customers/")       # small dimension table

daily = (
    orders
    .filter(F.col("status") == "paid")                           # filter early (pushed down to the scan)
    .select("order_id", "customer_id", "amount", "ordered_at")   # only needed columns
    .withColumn("day", F.to_date("ordered_at"))
    .join(F.broadcast(customers.select("customer_id", "city")),  # broadcast: no shuffle of the big table
          on="customer_id", how="left")
    .groupBy("day", "city")                                      # shuffle happens here
    .agg(F.sum("amount").alias("revenue"),
         F.countDistinct("customer_id").alias("customers"))
)

# Window function: 7-day rolling revenue per city
w = Window.partitionBy("city").orderBy("day").rowsBetween(-6, 0)
daily = daily.withColumn("revenue_7d", F.sum("revenue").over(w))

daily.explain()                                                   # inspect the physical plan
(daily.repartition("day")                                         # one set of files per day
      .write.mode("overwrite").partitionBy("day")
      .parquet("s3://lake/marts/daily_city_revenue/"))           # nothing ran until this action

# Same thing in Spark SQL:
# orders.createOrReplaceTempView("orders")
# spark.sql("SELECT to_date(ordered_at) day, SUM(amount) FROM orders WHERE status='paid' GROUP BY 1")`,
      ex: "Using PySpark locally (pip install pyspark) or the Databricks Free Edition, process the NYC taxi Parquet dataset: compute daily revenue and trips per zone with a broadcast join to the zone lookup table, a 7-day rolling average, and write the result partitioned by month. Open the Spark UI, find the shuffle stages, and compare runtime with and without the broadcast hint. Then solve the same problem with DuckDB and compare.",
      q: ["Why use a broadcast join when joining a huge fact table to a small lookup table in Spark?", ["It sorts the output", "The small table is copied to every executor, so the huge table doesn't need to be shuffled across the network", "It encrypts the join", "It's required for left joins"], 1, "Shuffling billions of rows is the expensive part. Broadcasting a small table avoids moving the big one."]
    },
    {
      t: "Streaming with Kafka",
      sub: ["Topics, partitions and consumer groups", "Producers and consumers", "Exactly-once in practice", "Stream processing overview"],
      body: `<p><b>Apache Kafka</b> is a distributed, durable event log used as the backbone for real-time data: clickstreams, payments, IoT readings, CDC from databases, and service events.</p>
<p>Events are written to <b>topics</b>, each split into <b>partitions</b> for parallelism. Within a partition, events are strictly ordered and each has an <b>offset</b>. The event <b>key</b> decides the partition (same key, same partition), so all events for one order or user stay in order. Kafka retains events for a configured time (days or forever), so consumers can replay history.</p>
<p><b>Producers</b> publish events; set <code>acks=all</code> and idempotence for durability. <b>Consumers</b> read events and commit offsets to record progress. A <b>consumer group</b> spreads a topic's partitions across its members for parallel processing; adding consumers (up to the number of partitions) scales throughput, and different groups (analytics, notifications, fraud) each read the full stream independently. Schemas are usually managed with a schema registry (Avro, Protobuf or JSON Schema) to keep producers and consumers compatible. Managed options include Confluent Cloud, Amazon MSK, Redpanda and Azure Event Hubs.</p>
<p><b>Delivery guarantees</b>: by default you get <b>at-least-once</b> delivery, since a consumer may process an event and crash before committing its offset, then see it again. "Exactly-once" exists within Kafka (idempotent producers plus transactions for read-process-write between topics), but side effects outside Kafka (a database write, an email) need <b>idempotent consumers</b>: de-duplicate by event ID or use upserts. In practice, design for at-least-once with idempotency.</p>
<p><b>Stream processing</b> transforms and aggregates events continuously: filtering, enrichment, windowed aggregations (orders per minute), joins between streams. Tools: Kafka Streams, Apache Flink (the leading engine for stateful streaming), Spark Structured Streaming, and streaming SQL engines (ksqlDB, RisingWave, Materialize).</p>`,
      lang: "python",
      code: `# pip install confluent-kafka     (Kafka or Redpanda running locally in Docker)
import json, uuid
from confluent_kafka import Producer, Consumer

# --- Producer: key by order_id so all events of one order stay in order ---
producer = Producer({"bootstrap.servers": "localhost:9092", "acks": "all", "enable.idempotence": True})

def publish(event_type: str, order: dict):
    event = {"event_id": str(uuid.uuid4()), "type": event_type, "order": order}
    producer.produce("orders", key=order["id"], value=json.dumps(event),
                     on_delivery=lambda err, msg: err and print("delivery failed:", err))

publish("OrderPlaced", {"id": "ord_101", "user": "u_7", "total": 1499})
publish("OrderPaid",   {"id": "ord_101", "user": "u_7", "total": 1499})
producer.flush()

# --- Consumer group: run several copies to share the partitions ---
consumer = Consumer({"bootstrap.servers": "localhost:9092", "group.id": "revenue-tracker",
                     "auto.offset.reset": "earliest", "enable.auto.commit": False})
consumer.subscribe(["orders"])
seen = set()                                    # in production: a DB table with a unique event_id

try:
    while True:
        msg = consumer.poll(1.0)
        if msg is None or msg.error():
            continue
        event = json.loads(msg.value())
        if event["event_id"] in seen:           # idempotent: at-least-once delivery may repeat events
            consumer.commit(msg); continue
        if event["type"] == "OrderPaid":
            add_revenue(event["order"]["total"])    # side effect (upsert keyed by order id)
        seen.add(event["event_id"])
        consumer.commit(msg)                     # commit only AFTER successful processing
finally:
    consumer.close()

# Stream processing idea (Flink SQL / ksqlDB style): paid revenue per minute
#   SELECT window_start, SUM(total) FROM TABLE(TUMBLE(TABLE orders_paid, DESCRIPTOR(ts), INTERVAL '1' MINUTE))
#   GROUP BY window_start, window_end;`,
      ex: "Run Redpanda or Kafka in Docker. Write a producer that simulates order events for 1,000 orders keyed by order ID, and a consumer group of two consumers that computes revenue per minute with idempotent processing. Kill one consumer mid-stream and watch partitions rebalance, replay the topic from the beginning with a new group, and deliberately reprocess duplicates to prove totals don't change.",
      q: ["Why key Kafka events by order_id?", ["To encrypt them", "Events with the same key go to the same partition, so all events for one order are processed in order", "Keys make topics smaller", "Consumers ignore unkeyed events"], 1, "Ordering is guaranteed only within a partition. Keying by order_id keeps each order's events in sequence."]
    },
    {
      t: "File formats and lakehouses",
      sub: ["Parquet and Avro", "Delta Lake and Iceberg", "Partitioning strategies", "Object storage"],
      body: `<p><b>Object storage</b> (Amazon S3, Google Cloud Storage, Azure Data Lake Storage, Cloudflare R2, MinIO) is the foundation of data lakes: virtually unlimited, very durable and cheap, accessed over HTTP. It isn't a file system: objects are written whole (no in-place edits), listing millions of objects is slow, and many tiny files hurt performance badly. Organise data with clear prefixes per layer (raw, cleaned, marts) and table.</p>
<p><b>File formats</b>: <b>Parquet</b> is the standard columnar format for analytics: compressed, typed, with statistics that let engines skip row groups. <b>Avro</b> is row-based with an embedded schema and good schema evolution, common for streaming and Kafka messages. CSV and JSON are fine for exchange but slow and untyped for analytics. Aim for files of roughly 128 MB to 1 GB and compact small files regularly.</p>
<p>Plain files lack database features: no transactions (readers may see half-written data), no updates or deletes without rewriting files, no schema enforcement. <b>Open table formats</b> fix this by keeping a transaction log and metadata alongside the Parquet files:</p>
<ul><li><b>Delta Lake</b> (Databricks-led): ACID transactions, <code>MERGE</code>, updates and deletes, schema enforcement and evolution, <b>time travel</b> (query a table as of yesterday), and file compaction and Z-ordering.</li>
<li><b>Apache Iceberg</b>: similar features with hidden partitioning and partition evolution, widely supported by many engines (Spark, Trino, Flink, Snowflake, BigQuery, Athena, DuckDB). Apache Hudi is a third option.</li></ul>
<p><b>Partitioning strategies</b>: partition by columns that queries filter on and that have moderate cardinality, typically date (<code>/date=2026-10-18/</code>), sometimes plus region. Too many partitions (by user ID) creates millions of tiny files; too few means scanning too much. Iceberg's hidden partitioning lets you change strategy later without rewriting queries.</p>`,
      lang: "python",
      code: `# Delta Lake with PySpark (or Databricks) on object storage
from pyspark.sql import SparkSession, functions as F
spark = (SparkSession.builder.appName("lakehouse")
         .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
         .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")
         .getOrCreate())

PATH = "s3://company-lake/silver/orders"

# Initial write: Parquet files + a _delta_log transaction log, partitioned by date
(spark.read.json("s3://company-lake/raw/orders/2026-10-17/")
      .withColumn("order_date", F.to_date("created_at"))
      .write.format("delta").partitionBy("order_date").mode("overwrite").save(PATH))

# Upsert late updates and corrections (ACID MERGE: readers never see half-written data)
from delta.tables import DeltaTable
updates = spark.read.json("s3://company-lake/raw/orders/2026-10-18/")
(DeltaTable.forPath(spark, PATH).alias("t")
   .merge(updates.alias("s"), "t.id = s.id")
   .whenMatchedUpdateAll()
   .whenNotMatchedInsertAll()
   .execute())

# Delete for a privacy request (GDPR / DPDP erasure)
DeltaTable.forPath(spark, PATH).delete("user_id = 'u_123'")

# Time travel: the table exactly as it was yesterday (debugging, audits, reproducible ML)
yesterday = spark.read.format("delta").option("timestampAsOf", "2026-10-17").load(PATH)

# Housekeeping: compact small files, cluster by a common filter, drop old file versions
spark.sql(f"OPTIMIZE delta.\`{PATH}\` ZORDER BY (customer_id)")
spark.sql(f"VACUUM delta.\`{PATH}\` RETAIN 168 HOURS")

# Lake layout (medallion architecture)
#   s3://company-lake/bronze/...   raw, as ingested (JSON, CSV, Avro)
#   s3://company-lake/silver/...   cleaned, de-duplicated Delta/Iceberg tables
#   s3://company-lake/gold/...     business-level aggregates for BI and ML`,
      ex: "Build a mini lakehouse locally (PySpark with delta-spark, or DuckDB with Iceberg/Delta extensions, on a local folder or MinIO as fake S3): load raw JSON into a bronze folder, create a partitioned silver Delta table, MERGE a batch of updates, delete a user's data, query yesterday's version with time travel, and compact small files. Compare query time on many tiny files versus compacted files.",
      q: ["What do table formats like Delta Lake and Iceberg add on top of Parquet files in object storage?", ["Faster internet", "A transaction log and metadata giving ACID transactions, updates and deletes, schema enforcement and time travel", "A graphical interface", "Automatic dashboards"], 1, "Raw files can't be safely updated or read mid-write. Table formats bring database guarantees to cheap open storage."]
    }
  ]
});
