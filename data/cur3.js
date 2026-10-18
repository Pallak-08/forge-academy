/* Forge Academy curriculum, part 3: data, ML, AI, mobile, career. Original syllabus text. */
window.MODS = window.MODS || [];
(function () {
  const M = (id, t, area, d, les, lab, proj) => MODS.push({ id, t, area, d, les, lab, proj });
  const lab = (t, steps, done) => ({ t, steps, done });
  const proj = (t, brief, features) => ({ t, brief, features });

  /* ================= DATA ANALYSIS ================= */
  M("spreadsheets", "Excel and Google Sheets", "data", "Still the most used analysis tool in business. Analysts are expected to be fast with it.", ["27-0",
    ["Advanced spreadsheet skills", ["Dynamic arrays: FILTER, SORT, UNIQUE", "Power Query for cleaning and joining", "Data validation and protected ranges", "Macros and Apps Script basics"]]
  ], lab("Sales dashboard in a spreadsheet", ["Clean a 500-row sales dataset", "Build SUMIFS summaries and a growth column", "Create a pivot by month and region", "Build a one-page dashboard"], "A manager can answer 'how are we doing?' from your sheet in a minute."),
  proj("Business tracker", "A reusable monthly reporting workbook.", ["Raw data sheet", "Automated summaries", "Pivot dashboard", "Instructions tab"]));

  M("statistics", "Statistics and probability", "data", "Knowing what the numbers really say, and when they don't say anything.", ["27-1",
    ["Probability foundations", ["Random variables", "Common distributions", "Expected value and variance", "Bayes' rule"]],
    ["Inference and regression", ["Sampling distributions", "t-tests and chi-square tests", "Linear regression and interpreting coefficients", "Correlation vs causation"]]
  ], lab("Analyse an A/B test", ["Simulate or download A/B test data", "Compute conversion rates and the lift", "Run a significance test and confidence interval", "Write a recommendation including its limits"], "Your recommendation is correct and honest about uncertainty."),
  proj("Experiment report", "A full analysis of an experiment for a product team.", ["Hypothesis and metrics", "Test and confidence interval", "Segment breakdown", "Recommendation"]));

  M("sql-analytics", "SQL for analytics", "data", "Querying company data directly: the analyst's most important technical skill.", ["5-1", "5-2", "27-2",
    ["Analytics SQL patterns", ["Funnels in SQL", "Sessionisation", "Pivoting with CASE", "Date spines and gaps"]]
  ], lab("Business questions in SQL", ["Load an e-commerce sample database", "Answer 10 business questions", "Use window functions for running totals and growth", "Build a retention cohort"], "You answer typical analyst interview SQL questions without hints."),
  proj("SQL case study", "A documented SQL analysis of a public dataset.", ["15 questions answered", "CTEs and window functions", "Findings summary", "Repo with queries"]));

  M("python-data", "Python for data analysis", "data", "Reproducible analysis in code with pandas and notebooks.", ["27-3", "27-4",
    ["Jupyter and the analysis workflow", ["Notebooks vs scripts", "Exploratory data analysis steps", "Reproducibility", "Sharing notebooks"]],
    ["Working with real data sources", ["Reading from databases and APIs", "Excel files with many sheets", "Large files in chunks", "Parquet"]]
  ], lab("Notebook investigation", ["Load a messy public dataset", "Clean it with a logged script", "Answer five questions with groupby and merges", "Export a clean dataset and summary"], "Re-running the notebook top to bottom reproduces every result."),
  proj("Exploratory analysis", "A complete EDA of a public dataset.", ["Cleaning log", "Distributions and relationships", "Five insights", "Published notebook"]));

  M("data-viz", "Data visualisation and BI", "data", "Making insights obvious with charts and dashboards people use.", ["27-5", "27-6",
    ["Power BI in depth", ["Power Query", "Data modelling and relationships", "DAX measures", "Publishing and sharing"]],
    ["Tableau and Looker Studio", ["Connecting data", "Calculated fields", "Interactive dashboards", "Choosing a BI tool"]]
  ], lab("Published dashboard", ["Model your sales data in a BI tool", "Build KPIs, a trend and filters", "Publish it", "Write a short user guide"], "A published dashboard that answers the top five business questions."),
  proj("Executive dashboard", "A KPI dashboard for a fictional company.", ["Clear KPI definitions", "Interactive filters", "Mobile layout", "Insights note"]));

  /* ================= DATA ENGINEERING ================= */
  M("data-modeling", "Data modelling and warehousing", "data", "Designing data so it is easy and fast to analyse.", [
    ["OLTP vs OLAP", ["Transactional vs analytical workloads", "Row vs column storage", "Data warehouses, lakes and lakehouses", "Modern cloud warehouses"]],
    ["Dimensional modelling", ["Facts and dimensions", "Star and snowflake schemas", "Slowly changing dimensions", "Grain"]],
    ["Cloud warehouses", ["BigQuery, Snowflake, Redshift", "Partitioning and clustering", "Cost control", "DuckDB for local work"]]
  ], lab("Build a star schema", ["Take a transactional dataset", "Design fact and dimension tables", "Load them into DuckDB", "Write five analytical queries"], "Analytical queries are simple and fast on your model."),
  proj("Mini warehouse", "A small analytics warehouse for an e-commerce dataset.", ["Star schema", "Load scripts", "Documentation", "Example dashboard"]));

  M("pipelines", "Data pipelines and orchestration", "data", "Moving and transforming data reliably on a schedule.", [
    ["ETL and ELT", ["Extract, transform, load", "ELT with the warehouse", "Batch vs incremental loads", "Idempotent pipelines"]],
    ["Orchestration with Airflow", ["DAGs, tasks and operators", "Scheduling and backfills", "Retries and alerts", "Prefect and Dagster alternatives"]],
    ["Transformations with dbt", ["Models and materialisations", "Tests and documentation", "Sources and seeds", "Incremental models"]],
    ["Data quality", ["Validation checks", "Great Expectations / Soda", "Data contracts", "Lineage"]]
  ], lab("Daily pipeline", ["Pull data from a public API daily", "Load raw data into a warehouse", "Transform with dbt and add tests", "Schedule with Airflow and alert on failure"], "The pipeline runs daily, recovers from failures and never duplicates data."),
  proj("End-to-end ELT pipeline", "A scheduled pipeline from API to dashboard.", ["Orchestrated extraction", "dbt models and tests", "Data quality checks", "Dashboard on top"]));

  M("big-data", "Big data and streaming", "data", "Processing data too large or too fast for one machine.", [
    ["Distributed processing with Spark", ["Why distributed processing", "DataFrames in PySpark", "Partitions and shuffles", "Spark on Databricks"]],
    ["Streaming with Kafka", ["Topics, partitions and consumer groups", "Producers and consumers", "Exactly-once in practice", "Stream processing overview"]],
    ["File formats and lakehouses", ["Parquet and Avro", "Delta Lake and Iceberg", "Partitioning strategies", "Object storage"]]
  ], lab("Batch and stream", ["Process a multi-GB dataset with PySpark", "Write it as partitioned Parquet", "Produce and consume events with Kafka in Docker", "Aggregate a stream into a table"], "Both the batch job and the stream produce correct results."),
  proj("Real-time analytics", "Events streamed into an analytics table and dashboard.", ["Kafka producer", "Stream consumer", "Lakehouse table", "Live dashboard"]));

  /* ================= MACHINE LEARNING ================= */
  M("ml-math", "Math for machine learning", "ml", "Enough linear algebra, calculus and probability to understand what models do.", [
    ["Linear algebra", ["Vectors and matrices", "Dot products and projections", "Matrix multiplication", "Eigenvectors intuition"]],
    ["Calculus for optimisation", ["Derivatives and gradients", "Chain rule", "Gradient descent", "Learning rates"]],
    ["NumPy for numerical work", ["Arrays and broadcasting", "Vectorisation", "Random numbers and simulation", "Linear algebra in NumPy"]]
  ], lab("Gradient descent by hand", ["Implement matrix multiplication in NumPy", "Compute gradients numerically", "Fit a line with your own gradient descent", "Plot the loss curve"], "Your result matches NumPy's least squares solution."),
  proj("Math notebook", "An illustrated notebook explaining ML maths with code.", ["Linear algebra visuals", "Gradient descent animation", "Clear explanations"]));

  M("ml-core", "Machine learning fundamentals", "ml", "Training and evaluating models that make predictions from data.", [
    ["The ML workflow", ["Framing problems", "Train, validation and test splits", "Baselines", "scikit-learn pipelines"]],
    ["Supervised learning", ["Linear and logistic regression", "Decision trees and random forests", "Gradient boosting (XGBoost, LightGBM)", "k-nearest neighbours and SVMs"]],
    ["Evaluation and tuning", ["Accuracy, precision, recall, F1, ROC-AUC", "Regression metrics", "Cross-validation", "Hyperparameter search"]],
    ["Feature engineering", ["Encoding categories", "Scaling", "Imbalanced data", "Data leakage"]],
    ["Unsupervised learning", ["k-means clustering", "Hierarchical clustering", "PCA", "Anomaly detection"]]
  ], lab("Predict churn", ["Build a baseline and three models", "Use cross-validation and tuning", "Report precision and recall", "Explain feature importance"], "Your model beats the baseline on held-out data and you can explain why."),
  proj("Prediction service", "A churn or price model with a clear business summary.", ["Baseline and tuned model", "Evaluation report", "Feature importance", "Model card"]));

  M("deep-learning", "Deep learning", "ml", "Neural networks for images, text and more, with PyTorch.", [
    ["Neural network basics", ["Neurons, layers and activations", "Loss functions", "Backpropagation", "Overfitting and regularisation"]],
    ["PyTorch", ["Tensors and autograd", "nn.Module", "Training loops", "GPUs and Colab"]],
    ["Computer vision", ["Convolutional networks", "Data augmentation", "Transfer learning", "Image classification"]],
    ["Sequence models and transformers", ["Embeddings", "Attention", "Transformers", "Hugging Face models"]]
  ], lab("Image classifier", ["Train a small CNN on Fashion-MNIST", "Plot training and validation loss", "Fine-tune a pretrained model on a custom set", "Show five mistakes"], "Fine-tuning clearly beats training from scratch."),
  proj("Vision or NLP app", "A fine-tuned model behind a small demo app.", ["Fine-tuned model", "Evaluation", "Demo UI", "Write-up"]));

  M("mlops", "MLOps: models in production", "ml", "Getting models out of notebooks and keeping them healthy.", [
    ["Experiment tracking and reproducibility", ["MLflow tracking", "Data and model versioning (DVC)", "Reproducible environments", "Model registry"]],
    ["Serving models", ["Batch vs online inference", "Serving with FastAPI", "Containerising models", "Latency and cost"]],
    ["ML pipelines and automation", ["Training pipelines", "Feature stores", "CI/CD for ML", "Scheduled retraining"]],
    ["Monitoring models", ["Data and concept drift", "Performance monitoring", "Alerting", "Responsible AI checks"]]
  ], lab("Model as a service", ["Track three runs in MLflow", "Serve the best model with FastAPI in Docker", "Log predictions", "Detect drift on new data"], "Anyone can call your model's API and you can see how it performs over time."),
  proj("Production ML system", "A model with training pipeline, serving, monitoring and retraining.", ["Tracked experiments", "Containerised API", "Drift monitoring", "Retraining job"]));

  /* ================= AI ENGINEERING ================= */
  M("llm-apis", "LLM APIs", "ai", "Calling language models reliably from code.", ["11-0", "11-1", "11-2", "11-3",
    ["Streaming, cost and model choice", ["Streaming tokens to a UI", "Token counting and cost", "Choosing a model per task", "Open vs hosted models"]]
  ], lab("Reliable LLM client", ["Call two providers through one function", "Add retries with backoff", "Add fallback with cooldowns", "Stream output to the terminal"], "Your client keeps working when one provider rate-limits you."),
  proj("LLM gateway", "A small service that routes requests across providers.", ["Fallback and retries", "Cost logging", "Streaming", "Tests with a fake provider"]));

  M("prompting", "Prompt engineering", "ai", "Reliable, structured and safe output from models.", ["12-0", "12-1", "12-2", "12-3"],
  lab("Prompt to production", ["Extract action items from notes as JSON", "Build a robust JSON extractor", "Test on 10 inputs until all pass", "Check validation stops a prompt-injection attempt"], "10 out of 10 inputs give valid, correct JSON."),
  proj("Structured extraction tool", "Turn messy documents into clean structured data.", ["Schema and rules", "Validation", "Eval set", "Simple UI"]));

  M("rag", "RAG and LLM applications", "ai", "Grounding models in your own data, letting them act, and measuring quality.", ["23-0", "23-1", "23-2", "23-3", "23-4", "16-0", "16-1", "16-2", "16-3"],
  lab("Chat with your documents", ["Index three PDFs", "Answer with citations and refuse when unsure", "Add one tool", "Run a 25-case eval"], "Answers cite sources, refusals are honest, and evals pass."),
  proj("AI support assistant", "An assistant over product docs that answers with citations and can create tickets.", ["Hybrid search", "Tool calling with permissions", "Eval dashboard", "Prompt-injection guardrails"]));

  M("agents", "AI agents", "ai", "Multi-step systems with tools, people in the loop and safe stopping.", ["13-0", "13-1", "13-2", "13-3", "14-0", "14-1", "14-2", "14-3", "15-0", "15-1", "15-2", "15-3", "17-2", "17-3", "10-2"],
  lab("Mini agent", ["Turn a brief into a validated JSON plan", "Add clarifying questions and an approval step", "Generate output deterministically and verify it in a sandbox", "Add a fix loop with an attempt budget"], "The agent recovers from one failure and stops on repeated ones."),
  proj("AI app builder (like SaaSForge)", "An agent that turns a plain-English brief into a tested, deployed app.", ["Clarify and approve", "Spec validation and generator", "Sandboxed verification and fix loop", "Architecture document"]));

  /* ================= MOBILE ================= */
  M("kotlin", "Kotlin", "mobile", "The modern language for Android development.", [
    ["Kotlin basics", ["Variables, types and null safety", "Functions and lambdas", "Control flow", "Collections"]],
    ["Object-oriented and functional Kotlin", ["Classes, data classes and objects", "Interfaces and sealed classes", "Extension functions", "Higher-order functions"]],
    ["Coroutines", ["suspend functions", "Scopes and dispatchers", "Flows", "Error handling"]]
  ], lab("Kotlin console app", ["Build a to-do CLI with data classes", "Use sealed classes for commands", "Load data with a coroutine", "Write unit tests"], "The app is idiomatic Kotlin with null-safe code and tests."),
  proj("Kotlin library", "A small, tested Kotlin utility library.", ["Idiomatic API", "Coroutines", "Unit tests", "README"]));

  M("android", "Android development", "mobile", "Building native Android apps with Jetpack Compose.", [
    ["Android Studio and app structure", ["Projects, Gradle and modules", "Activities and the lifecycle", "Resources and the manifest", "Emulators and devices"]],
    ["UI with Jetpack Compose", ["Composables", "State and recomposition", "Layouts and modifiers", "Material 3 theming"]],
    ["Navigation and architecture", ["Navigation Compose", "MVVM with ViewModel", "Dependency injection with Hilt", "Clean architecture layers"]],
    ["Data, networking and storage", ["Retrofit and REST APIs", "Room database", "DataStore", "Offline-first with WorkManager"]],
    ["Testing and publishing", ["Unit and UI tests", "Performance and battery", "Signing and release builds", "Publishing on Google Play"]]
  ], lab("Notes app for Android", ["Build a Compose UI with a list and editor", "Store notes with Room", "Sync with a REST API using Retrofit", "Add UI tests"], "The app works offline and syncs when online."),
  proj("Production Android app", "A complete app published to a Play Store testing track.", ["Compose UI and MVVM", "Room + Retrofit", "Tests", "Play Store listing"]));

  M("swift", "Swift", "mobile", "Apple's language for iOS, macOS and more.", [
    ["Swift basics", ["Constants, variables and types", "Optionals", "Functions and closures", "Collections"]],
    ["Structs, classes and protocols", ["Value vs reference types", "Protocols and extensions", "Enums with associated values", "Generics"]],
    ["Concurrency in Swift", ["async/await", "Tasks and task groups", "Actors", "MainActor"]]
  ], lab("Swift playground exercises", ["Model a shopping cart with structs and protocols", "Handle optionals safely", "Fetch data with async/await", "Write unit tests"], "Idiomatic Swift with safe optionals and tests."),
  proj("Swift package", "A small, tested Swift package.", ["Clean API", "async/await", "Tests", "README"]));

  M("ios", "iOS development", "mobile", "Building native iPhone apps with SwiftUI.", [
    ["Xcode and app structure", ["Projects and targets", "App lifecycle", "Simulators and devices", "Assets and Info.plist"]],
    ["UI with SwiftUI", ["Views and modifiers", "State, Binding and Observable", "Lists and navigation stacks", "Layouts and adaptive design"]],
    ["Architecture and data", ["MVVM in SwiftUI", "Networking with URLSession", "SwiftData / Core Data", "Keychain for secrets"]],
    ["Testing and publishing", ["XCTest and UI tests", "Instruments for performance", "Signing and provisioning", "TestFlight and the App Store"]]
  ], lab("Habit tracker for iOS", ["Build a SwiftUI list and detail flow", "Persist data with SwiftData", "Fetch quotes from an API", "Add tests"], "The app persists data and handles network errors gracefully."),
  proj("Production iOS app", "A complete app on TestFlight.", ["SwiftUI and MVVM", "Persistence and networking", "Tests", "TestFlight build"]));

  M("react-native", "Cross-platform apps with React Native", "mobile", "One codebase for iOS and Android using React.", [
    ["React Native and Expo", ["How React Native renders native views", "Expo setup", "Core components", "Styling with Flexbox"]],
    ["Navigation and data", ["Stack and tab navigation", "Fetching and caching data", "Forms", "Global state"]],
    ["Device features and offline", ["Permissions", "Camera and location", "Secure storage", "Push notifications"]],
    ["Testing and release", ["Jest and Testing Library", "End-to-end with Maestro", "EAS builds", "Store submission and OTA updates"]]
  ], lab("Field journal app", ["Build tabs and stack navigation", "Take photos with location", "Store data offline", "Send a local notification"], "The app runs on your phone and works offline."),
  proj("Cross-platform app", "An app published to a store testing track on both platforms.", ["Navigation and state", "Device features", "Offline sync", "EAS release"]));

  /* ================= CAREER ================= */
  M("career", "Portfolio, interviews and getting hired", "career", "Turning skills into offers.", [
    ["Building a portfolio that gets interviews", ["Choosing 3-4 strong projects", "READMEs with screenshots and live links", "A simple portfolio site", "Writing case studies"]],
    ["GitHub and LinkedIn", ["Pinned repos and profile README", "LinkedIn headline and About", "Posting about what you build", "Networking without awkwardness"]],
    ["Resume and applications", ["One-page resume", "Impact bullets with numbers", "Tailoring for each role", "Referrals and tracking applications"]],
    ["Interviews", ["Behavioural answers with STAR", "Technical and take-home rounds", "System design for juniors", "Questions to ask them"]],
    ["Offers and your first year", ["Comparing offers", "Negotiating", "Onboarding well", "Growing towards your next role"]]
  ], lab("Interview ready", ["Polish your top four repos and portfolio", "Write a one-page resume with numbers", "Prepare five STAR stories", "Do two mock interviews"], "A recruiter sees what you build in 30 seconds and you answer common questions confidently."),
  proj("Job search kit", "Everything you need to start applying.", ["Portfolio site", "Resume", "STAR stories", "Application tracker"]));
})();
