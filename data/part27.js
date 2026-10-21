/* Forge Academy lessons: math for machine learning, machine learning fundamentals */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 87, id: "ml-math-lessons", fills: "ml-math", title: "Math for machine learning", level: 2,
  blurb: "The linear algebra, calculus and NumPy behind every model.",
  lessons: [
    {
      t: "Linear algebra",
      sub: ["Vectors and matrices", "Dot products and projections", "Matrix multiplication", "Eigenvectors intuition"],
      body: `<p>Machine learning represents everything as numbers in arrays. A <b>vector</b> is a list of numbers: a house as [area, bedrooms, age], a word as a 768-number embedding, an image as its pixel values flattened. A <b>matrix</b> is a table of numbers: a dataset with one row per example and one column per feature, or the weights of a neural network layer.</p>
<p>The <b>dot product</b> of two vectors multiplies matching entries and adds them up. It's everywhere: a linear model's prediction is the dot product of features and weights plus a bias. Geometrically, it measures how much two vectors point the same way; divided by their lengths it gives <b>cosine similarity</b>, which is how semantic search compares text embeddings. A <b>projection</b> of one vector onto another finds the component in that direction, the idea behind PCA and least squares.</p>
<p><b>Matrix multiplication</b> combines many dot products at once: multiplying a data matrix (n examples × d features) by a weight matrix (d × k) gives predictions or transformed features for all examples in one operation, which is exactly what a neural network layer does. Shapes must line up: (n×d) @ (d×k) → (n×k). Most deep learning bugs are shape mismatches, so get in the habit of writing shapes down.</p>
<p><b>Eigenvectors</b> of a matrix are directions that the matrix only stretches, not rotates; the stretch factor is the <b>eigenvalue</b>. For a dataset's covariance matrix, the eigenvectors are the directions of greatest variance, which is precisely what <b>PCA</b> uses to compress many correlated features into a few informative ones. You rarely compute these by hand, but the intuition helps you understand dimensionality reduction, embeddings and why some features are redundant.</p>`,
      lang: "python",
      code: `import numpy as np

# Vectors: one house, and model weights
x = np.array([1200.0, 3, 10])          # area (sq ft), bedrooms, age (years)
w = np.array([4500.0, 200000, -15000]) # learned weights (rupees per unit)
b = 500000
price = x @ w + b                      # dot product + bias = a linear model's prediction
print(f"Predicted price: Rs {price:,.0f}")

# A dataset as a matrix: predictions for all houses at once
X = np.array([[1200, 3, 10],
              [800,  2, 25],
              [1500, 3,  2]], dtype=float)   # shape (3 examples, 3 features)
print((X @ w + b).round())                    # shape (3,)

# Cosine similarity between embeddings (how semantic search ranks results)
def cosine(a, b): return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
query = np.array([0.9, 0.1, 0.4]); doc1 = np.array([0.8, 0.2, 0.5]); doc2 = np.array([-0.3, 0.9, 0.0])
print(cosine(query, doc1), cosine(query, doc2))   # doc1 is far more similar

# A neural network layer is a matrix multiplication
batch = np.random.rand(32, 768)        # 32 sentences, 768-dim embeddings
W = np.random.rand(768, 4)             # layer mapping to 4 classes
logits = batch @ W                     # (32, 768) @ (768, 4) -> (32, 4)
print(logits.shape)

# Eigenvectors of the covariance matrix = directions of most variance (PCA)
rng = np.random.default_rng(0)
data = rng.normal(size=(500, 2)) @ np.array([[3, 1], [1, 0.5]])   # correlated 2-D data
cov = np.cov(data, rowvar=False)
vals, vecs = np.linalg.eigh(cov)
print("variance explained by top direction:", vals[-1] / vals.sum())   # most variance in one direction`,
      ex: "Without libraries first (plain Python lists), implement the dot product, matrix-vector and matrix-matrix multiplication, then verify against NumPy. Compute cosine similarities between five sentence embeddings (use a small embedding model or made-up vectors) to rank them against a query, and run PCA via eigenvectors on a 2-D correlated dataset, plotting the data with the principal directions drawn as arrows.",
      q: ["A batch of 64 examples with 300 features is multiplied by a weight matrix to produce 10 outputs each. What shape must the weight matrix have?", ["(64, 10)", "(300, 10)", "(10, 300)", "(64, 300)"], 1, "(64×300) @ (300×10) → (64×10). The inner dimensions must match."]
    },
    {
      t: "Calculus for optimisation",
      sub: ["Derivatives and gradients", "Chain rule", "Gradient descent", "Learning rates"],
      body: `<p>Training a model means finding parameters that make a <b>loss function</b> (how wrong the predictions are) as small as possible. Calculus tells us which way to adjust each parameter.</p>
<p>A <b>derivative</b> measures how a function's output changes when its input changes slightly: the slope. If increasing a weight increases the loss, the derivative is positive, so we should decrease the weight. With many parameters, the <b>gradient</b> is the vector of partial derivatives, one per parameter; it points in the direction of steepest increase of the loss, so we move in the opposite direction.</p>
<p>The <b>chain rule</b> computes derivatives of composed functions: if the loss depends on a prediction, which depends on a hidden layer, which depends on weights, the derivative with respect to the weights is the product of the derivatives along the chain. <b>Backpropagation</b> is just the chain rule applied efficiently from the loss backwards through a network, and frameworks like PyTorch do it automatically (autograd).</p>
<p><b>Gradient descent</b> repeats: compute the loss, compute the gradient, update each parameter by <code>parameter -= learning_rate × gradient</code>. <b>Stochastic</b> and <b>mini-batch</b> gradient descent estimate the gradient on small random batches instead of the full dataset, which is much faster and adds helpful noise. Optimisers like <b>Adam</b> adapt the step size per parameter and add momentum.</p>
<p>The <b>learning rate</b> is the most important hyperparameter. Too small and training crawls; too large and the loss bounces around or explodes to infinity. Typical practice: try values on a log scale (0.1, 0.01, 0.001), watch the loss curve, and use schedules that warm up and then decay the learning rate.</p>`,
      lang: "python",
      code: `import numpy as np

# Fit y = w*x + b to data by gradient descent on mean squared error, from scratch
rng = np.random.default_rng(1)
x = rng.uniform(0, 10, 200)
y = 3.0 * x + 7.0 + rng.normal(0, 1.5, 200)          # true w=3, b=7

w, b, lr = 0.0, 0.0, 0.01
for step in range(2000):
    pred = w * x + b
    error = pred - y
    loss = (error ** 2).mean()
    # derivatives of MSE via the chain rule: dL/dpred = 2*error/n, dpred/dw = x, dpred/db = 1
    grad_w = 2 * (error * x).mean()
    grad_b = 2 * error.mean()
    w -= lr * grad_w                                  # step against the gradient
    b -= lr * grad_b
    if step % 500 == 0:
        print(f"step {step:4d}  loss {loss:8.3f}  w {w:.3f}  b {b:.3f}")
print(f"learned w={w:.2f}, b={b:.2f}")                 # close to 3 and 7

# Learning rate matters: try lr = 0.0001 (slow) and lr = 0.1 (diverges for this data)

# Check an analytic gradient numerically (a classic debugging trick)
def loss_fn(w_, b_): return ((w_ * x + b_ - y) ** 2).mean()
eps = 1e-5
numeric = (loss_fn(w + eps, b) - loss_fn(w - eps, b)) / (2 * eps)
analytic = 2 * ((w * x + b - y) * x).mean()
print("gradient check:", numeric, analytic)

# The same in PyTorch: autograd applies the chain rule for you
# import torch
# W = torch.zeros(1, requires_grad=True); B = torch.zeros(1, requires_grad=True)
# opt = torch.optim.SGD([W, B], lr=0.01)
# for _ in range(2000):
#     loss = ((W * X + B - Y) ** 2).mean(); opt.zero_grad(); loss.backward(); opt.step()`,
      ex: "Implement gradient descent from scratch for linear regression with two features, and plot the loss curve for learning rates 0.0001, 0.001, 0.01 and 0.1 on one chart (note which one diverges). Add mini-batches of 32 and compare convergence. Then implement logistic regression the same way, deriving its gradient on paper first and checking it numerically.",
      q: ["During training the loss jumps around wildly and then becomes NaN. What's the most likely first thing to try?", ["Increase the learning rate", "Lower the learning rate", "Add more output classes", "Remove the loss function"], 1, "Steps that are too large overshoot the minimum and can blow up. Reducing the learning rate is the standard first fix."]
    },
    {
      t: "NumPy for numerical work",
      sub: ["Arrays and broadcasting", "Vectorisation", "Random numbers and simulation", "Linear algebra in NumPy"],
      body: `<p><b>NumPy</b> is the foundation of numerical Python: pandas, scikit-learn, SciPy and (conceptually) PyTorch all build on its n-dimensional <b>array</b>. Arrays hold one data type in contiguous memory, which makes operations on them run in fast compiled code.</p>
<p>Key ideas: an array's <code>shape</code> (rows, columns, more dimensions), <code>dtype</code> (float64, int32, bool), indexing and slicing (<code>a[2:5]</code>, <code>a[:, 0]</code> for the first column), <b>boolean masks</b> (<code>a[a &gt; 0]</code>), <code>reshape</code>, and aggregation along an <b>axis</b> (<code>X.mean(axis=0)</code> gives column means).</p>
<p><b>Broadcasting</b> lets operations combine arrays of different shapes by stretching dimensions of size 1: subtracting a row of column means (shape <code>(d,)</code>) from a whole matrix (shape <code>(n, d)</code>) works without copying. Rules: compare shapes from the right; dimensions must be equal or one of them must be 1.</p>
<p><b>Vectorisation</b> means replacing Python loops with whole-array operations. A loop over a million numbers in Python takes about a second; the vectorised version takes milliseconds. Think in arrays: <code>np.where</code> for conditional logic, cumulative functions (<code>cumsum</code>), and matrix operations instead of nested loops.</p>
<p><b>Random numbers</b>: use the modern generator <code>rng = np.random.default_rng(seed)</code> with a fixed seed for reproducibility, to sample distributions, shuffle data and run <b>Monte Carlo simulations</b> (estimating probabilities by simulating many random scenarios). <b>Linear algebra</b> lives in <code>np.linalg</code>: <code>solve</code>, <code>inv</code> (rarely needed; prefer <code>solve</code>), <code>norm</code>, <code>eig</code>/<code>eigh</code>, <code>svd</code> and <code>lstsq</code> for least squares.</p>`,
      lang: "python",
      code: `import numpy as np, time
rng = np.random.default_rng(42)                     # reproducible randomness

# Arrays, shapes, axes, masks
X = rng.normal(loc=50, scale=10, size=(1000, 3))   # 1000 students x 3 test scores
print(X.shape, X.dtype, X[:2])
print("column means:", X.mean(axis=0).round(1))    # per test
passed = X[(X >= 40).all(axis=1)]                  # boolean mask: passed every test
print(len(passed), "passed all three")

# Broadcasting: standardise every column at once, no loops
Z = (X - X.mean(axis=0)) / X.std(axis=0)            # (1000,3) - (3,) -> (1000,3)
print(Z.mean(axis=0).round(3), Z.std(axis=0).round(3))

# Vectorisation vs a Python loop
v = rng.random(1_000_000)
t = time.perf_counter(); s = 0.0
for value in v: s += value * value
loop_t = time.perf_counter() - t
t = time.perf_counter(); s2 = (v * v).sum(); vec_t = time.perf_counter() - t
print(f"loop {loop_t:.3f}s  vectorised {vec_t:.4f}s  ({loop_t / vec_t:.0f}x faster)")

grades = np.where(X[:, 0] >= 75, "A", np.where(X[:, 0] >= 50, "B", "C"))   # conditional logic

# Monte Carlo: probability a project with 3 uncertain tasks finishes within 20 days
tasks = rng.triangular(left=[3, 5, 4], mode=[5, 7, 6], right=[9, 12, 10], size=(100_000, 3))
print("P(total <= 20 days) =", (tasks.sum(axis=1) <= 20).mean())

# Linear algebra: solve a system and do least squares
A = np.array([[3.0, 1.0], [1.0, 2.0]]); b = np.array([9.0, 8.0])
print(np.linalg.solve(A, b))                        # [2. 3.]
design = np.column_stack([np.ones(100), rng.uniform(0, 10, 100)])
y = design @ np.array([7.0, 3.0]) + rng.normal(0, 1, 100)
coef, *_ = np.linalg.lstsq(design, y, rcond=None)
print("least squares intercept, slope:", coef.round(2))   # ~[7, 3]`,
      ex: "Write vectorised NumPy functions (no Python loops) to: standardise a feature matrix, compute pairwise Euclidean distances between 1,000 points using broadcasting, implement k-nearest-neighbour classification, and estimate pi with a Monte Carlo simulation. Time each against a loop version, and verify your least-squares fit against scikit-learn's LinearRegression.",
      q: ["X has shape (500, 4) and mu has shape (4,). What does X - mu do?", ["Raises a shape error", "Subtracts mu from every row of X via broadcasting, giving shape (500, 4)", "Subtracts only from the first row", "Returns shape (4,)"], 1, "Broadcasting stretches the (4,) array across all 500 rows, so each column has its mean subtracted."]
    }
  ]
});

COURSE.push({
  n: 88, id: "ml-core-lessons", fills: "ml-core", title: "Machine learning fundamentals", level: 2,
  blurb: "The ML workflow, core algorithms, evaluation, features and unsupervised learning.",
  lessons: [
    {
      t: "The ML workflow",
      sub: ["Framing problems", "Train, validation and test splits", "Baselines", "scikit-learn pipelines"],
      body: `<p><b>Framing</b> comes first, and most ML projects that fail do so here. Define the business decision the model supports, the <b>target</b> you'll predict (will this customer churn in the next 30 days?), the type of problem (classification, regression, ranking, clustering), what data is available <i>at prediction time</i>, how success is measured in business terms and by which metric, and what simpler non-ML solution exists. Sometimes a rule or a SQL query is enough.</p>
<p><b>Splitting data</b>: a model must be judged on data it never saw while learning. Use a <b>training</b> set to fit, a <b>validation</b> set (or cross-validation) to choose models and hyperparameters, and a <b>test</b> set touched only once at the end for an honest final estimate. Split before any exploration that could influence modelling. For time-dependent data, split by <b>time</b> (train on the past, test on the future), never randomly. Use <b>stratified</b> splits for imbalanced classes, and <b>group</b> splits when several rows belong to the same customer or patient.</p>
<p>Always build a <b>baseline</b>: predict the most common class, the average, last week's value, or a simple rule. If a complex model can't clearly beat it, it isn't worth deploying. Then try a simple model (logistic or linear regression) before gradient boosting or deep learning.</p>
<p><b>scikit-learn pipelines</b> chain preprocessing and the model into one object (<code>Pipeline</code>, <code>ColumnTransformer</code>). This guarantees the same transformations at training and prediction time, prevents leaking information from validation data into preprocessing during cross-validation, and gives you a single artefact to save and deploy.</p>`,
      lang: "python",
      code: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.dummy import DummyClassifier
from sklearn.metrics import roc_auc_score
import joblib

df = pd.read_csv("customers.csv")      # one row per customer, snapshot as of 2026-09-01
# Frame: predict churned_next_30d using only features known on the snapshot date
y = df["churned_next_30d"]
X = df.drop(columns=["churned_next_30d", "customer_id", "cancellation_reason"])   # reason is only known AFTER churn: leakage!

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

numeric = ["tenure_months", "monthly_spend", "logins_30d", "support_tickets_90d"]
categorical = ["plan", "city", "payment_method"]
pre = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric),
    ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")),
                      ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical),
])

# 1. Baseline
base = DummyClassifier(strategy="prior").fit(X_train, y_train)
print("baseline AUC:", roc_auc_score(y_test, base.predict_proba(X_test)[:, 1]))      # 0.5

# 2. Simple model in a pipeline (preprocessing is learned from training data only)
model = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000, class_weight="balanced"))])
model.fit(X_train, y_train)
print("logistic AUC:", roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]))

joblib.dump(model, "churn_model.joblib")       # one artefact: preprocessing + model
# later: joblib.load("churn_model.joblib").predict_proba(new_customers)`,
      ex: "Pick a tabular dataset (Telco churn, a loan default dataset, or house prices), write a one-paragraph framing (decision, target, prediction time, metric, non-ML alternative), create proper train, validation and test splits, build a baseline and a logistic or linear regression inside a scikit-learn Pipeline with a ColumnTransformer, and save the fitted pipeline. Identify any column that would leak the target.",
      q: ["Your data is daily sales over three years. How should you split it for evaluation?", ["Randomly shuffle and split", "By time: train on earlier periods and test on later ones", "Use the same data for training and testing", "Split by product name alphabetically"], 1, "Random splits let the model peek at the future. A time-based split mirrors how the model will be used."]
    },
    {
      t: "Supervised learning",
      sub: ["Linear and logistic regression", "Decision trees and random forests", "Gradient boosting (XGBoost, LightGBM)", "k-nearest neighbours and SVMs"],
      body: `<p><b>Linear regression</b> predicts a number as a weighted sum of features; <b>logistic regression</b> predicts the probability of a class by passing a weighted sum through the sigmoid function. Both are fast, interpretable (coefficients show direction and strength, on standardised features), strong baselines, and need scaled features and regularisation (<b>L2/ridge</b> shrinks weights, <b>L1/lasso</b> can zero them out, selecting features).</p>
<p><b>Decision trees</b> split the data with yes/no questions (tenure &lt; 6 months?) to make predictions in the leaves. Easy to explain and handle mixed feature types without scaling, but single trees overfit badly. A <b>random forest</b> trains many trees on random subsets of rows and features and averages them, which greatly reduces overfitting and works well with little tuning.</p>
<p><b>Gradient boosting</b> builds trees sequentially, each correcting the errors of the previous ones. Implementations like <b>XGBoost</b>, <b>LightGBM</b> and <b>CatBoost</b> are usually the most accurate choice for <b>tabular data</b> and dominate industry use and competitions. Key hyperparameters: number of trees, learning rate, tree depth or leaves, row and column subsampling, and early stopping on a validation set.</p>
<p><b>k-nearest neighbours</b> predicts from the k most similar training examples: simple, no real training, but slow on large datasets and sensitive to feature scaling. <b>Support vector machines</b> find the boundary with the widest margin between classes and, with kernels, can model non-linear boundaries; effective on small to medium datasets, but less common now on large tabular data.</p>
<p>Rule of thumb for tabular problems: logistic or linear regression as a baseline, then a gradient-boosted model, compared fairly with cross-validation.</p>`,
      lang: "python",
      code: `from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from lightgbm import LGBMClassifier
import numpy as np

# X_train, y_train and the preprocessing 'pre' (ColumnTransformer) from the previous lesson
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
candidates = {
    "logistic (L2)":   LogisticRegression(C=1.0, max_iter=2000),
    "decision tree":   DecisionTreeClassifier(max_depth=None),            # likely overfits
    "random forest":   RandomForestClassifier(n_estimators=400, min_samples_leaf=5, n_jobs=-1),
    "kNN (k=25)":      KNeighborsClassifier(n_neighbors=25),
    "LightGBM":        LGBMClassifier(n_estimators=600, learning_rate=0.03, num_leaves=31,
                                      subsample=0.8, colsample_bytree=0.8, verbose=-1),
}
for name, clf in candidates.items():
    scores = cross_val_score(make_pipeline(pre, clf), X_train, y_train, cv=cv, scoring="roc_auc")
    print(f"{name:15s} AUC {scores.mean():.3f} ± {scores.std():.3f}")

# Interpreting the logistic model: coefficients on standardised features
logit = make_pipeline(pre, LogisticRegression(max_iter=2000)).fit(X_train, y_train)
names = logit[0].get_feature_names_out()
coefs = logit[-1].coef_[0]
for n, c in sorted(zip(names, coefs), key=lambda t: -abs(t[1]))[:8]:
    print(f"{n:35s} {c:+.2f}")      # e.g. num__logins_30d -0.85 : more logins -> lower churn odds

# Gradient boosting with early stopping on a validation split
# lgbm.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], callbacks=[lightgbm.early_stopping(50)])`,
      ex: "On one classification and one regression dataset, compare linear/logistic regression, a single decision tree, a random forest, kNN and LightGBM with 5-fold cross-validation, reporting mean and standard deviation of the metric and training time. Explain why the single tree underperforms, interpret the top logistic coefficients, and tune the LightGBM model with early stopping.",
      q: ["For a typical business dataset of rows and columns (tabular data), which model family is usually the strongest performer?", ["k-nearest neighbours", "Gradient-boosted trees such as XGBoost or LightGBM", "A single deep decision tree", "Unsupervised clustering"], 1, "Gradient boosting handles mixed feature types, non-linearities and interactions very well on tabular data with modest tuning."]
    },
    {
      t: "Evaluation and tuning",
      sub: ["Accuracy, precision, recall, F1, ROC-AUC", "Regression metrics", "Cross-validation", "Hyperparameter search"],
      body: `<p><b>Classification metrics</b> start from the confusion matrix (true and false positives and negatives):</p>
<ul><li><b>Accuracy</b>: share of correct predictions. Misleading with imbalanced classes: if 2% of transactions are fraud, predicting "never fraud" is 98% accurate and useless.</li>
<li><b>Precision</b>: of the items flagged positive, how many really are. Matters when false alarms are costly (flagging legitimate payments).</li>
<li><b>Recall</b>: of all real positives, how many were caught. Matters when misses are costly (missing a disease or fraud).</li>
<li><b>F1</b>: the harmonic mean of precision and recall. <b>ROC-AUC</b>: how well the model ranks positives above negatives across all thresholds; <b>PR-AUC</b> is more informative for rare positives.</li></ul>
<p>Most classifiers output probabilities; the <b>threshold</b> that turns them into decisions is a business choice. Pick it from costs and capacity (the fraud team can review 500 cases a day), not by default at 0.5. Check <b>calibration</b> if probabilities are used directly.</p>
<p><b>Regression metrics</b>: <b>MAE</b> (average absolute error, in the target's units and easy to explain), <b>RMSE</b> (punishes large errors more), <b>MAPE</b> (percentage error; breaks near zero), and <b>R²</b> (share of variance explained).</p>
<p><b>Cross-validation</b> (k-fold, typically 5) trains and evaluates k times on different splits, giving a more reliable estimate and a sense of variance than a single split. Use stratified, grouped or time-series splits as the data requires.</p>
<p><b>Hyperparameter search</b>: grid search tries every combination (expensive); random search samples combinations (usually better for the same budget); Bayesian optimisation (Optuna) learns which regions are promising. Tune on cross-validation inside the training data, and evaluate the final choice once on the untouched test set.</p>`,
      lang: "python",
      code: `import numpy as np, optuna
from sklearn.metrics import (confusion_matrix, precision_score, recall_score, f1_score,
                             roc_auc_score, average_precision_score, mean_absolute_error, mean_squared_error, r2_score)
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.pipeline import make_pipeline
from lightgbm import LGBMClassifier

proba = model.predict_proba(X_test)[:, 1]          # churn model from earlier lessons

# Threshold chosen from business capacity: retention team can call the top 10% of customers
threshold = np.quantile(proba, 0.90)
pred = (proba >= threshold).astype(int)
tn, fp, fn, tp = confusion_matrix(y_test, pred).ravel()
print(f"threshold {threshold:.2f} | TP {tp} FP {fp} FN {fn} TN {tn}")
print(f"precision {precision_score(y_test, pred):.2f}  recall {recall_score(y_test, pred):.2f}  "
      f"F1 {f1_score(y_test, pred):.2f}  ROC-AUC {roc_auc_score(y_test, proba):.3f}  "
      f"PR-AUC {average_precision_score(y_test, proba):.3f}")

# Regression metrics (e.g. delivery time predictions, in minutes)
# print(mean_absolute_error(y_true, y_hat), mean_squared_error(y_true, y_hat) ** 0.5, r2_score(y_true, y_hat))

# Bayesian hyperparameter search with Optuna, scored by cross-validation on TRAINING data only
cv = StratifiedKFold(5, shuffle=True, random_state=0)
def objective(trial):
    clf = LGBMClassifier(
        n_estimators=trial.suggest_int("n_estimators", 200, 1500),
        learning_rate=trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
        num_leaves=trial.suggest_int("num_leaves", 15, 127),
        min_child_samples=trial.suggest_int("min_child_samples", 10, 100),
        subsample=trial.suggest_float("subsample", 0.6, 1.0), subsample_freq=1,
        colsample_bytree=trial.suggest_float("colsample_bytree", 0.6, 1.0), verbose=-1)
    return cross_val_score(make_pipeline(pre, clf), X_train, y_train, cv=cv, scoring="average_precision").mean()

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=40)
print("best CV PR-AUC:", round(study.best_value, 3), study.best_params)
# Refit with best params on all training data, then evaluate ONCE on the test set.`,
      ex: "For an imbalanced classification problem (fraud or churn), report accuracy, precision, recall, F1, ROC-AUC and PR-AUC, and show why accuracy misleads. Choose a threshold from a stated business constraint and show the confusion matrix. Then tune a gradient boosting model with random search and with Optuna using cross-validation, and evaluate the final model once on the test set.",
      q: ["Only 1% of transactions are fraudulent. A model labels every transaction 'not fraud'. What's its accuracy and usefulness?", ["1%, useless", "99%, but useless: recall for fraud is zero", "50%, somewhat useful", "100%, perfect"], 1, "Accuracy rewards predicting the majority class. With rare positives, use recall, precision and PR-AUC instead."]
    },
    {
      t: "Feature engineering",
      sub: ["Encoding categories", "Scaling", "Imbalanced data", "Data leakage"],
      body: `<p>Good features usually matter more than the choice of algorithm. Features come from domain understanding: for churn, days since last login, trend in usage over the last month versus the previous one, number of support tickets, and payment failures.</p>
<p><b>Encoding categories</b>: <b>one-hot encoding</b> creates a 0/1 column per category, the safe default for low-cardinality features (plan, payment method). <b>Ordinal encoding</b> maps ordered categories to numbers (small &lt; medium &lt; large), and tree models also cope with arbitrary ordinal codes. For high-cardinality features (city, product ID), use <b>target encoding</b> computed out-of-fold to avoid leakage, frequency encoding, or models with native categorical support (CatBoost, LightGBM). Handle categories unseen at training time.</p>
<p><b>Scaling</b> (standardisation to mean 0 and standard deviation 1, or min-max scaling) matters for models based on distances or gradients: linear models with regularisation, kNN, SVMs and neural networks. Tree-based models don't need it. Log-transform heavily skewed features like income or spend.</p>
<p><b>Imbalanced data</b>: use appropriate metrics (PR-AUC, recall at a fixed precision), stratified splits, <b>class weights</b> (<code>class_weight="balanced"</code>), threshold tuning, and only then resampling (undersampling the majority or SMOTE oversampling, applied <i>inside</i> cross-validation on training folds only). Often, more positive examples or better features help more than resampling tricks.</p>
<p><b>Data leakage</b> is when information unavailable at prediction time sneaks into training, producing a model that looks brilliant in testing and fails in production. Common forms: features recorded after the outcome (cancellation reason when predicting churn), preprocessing fitted on all data before splitting, duplicate or related rows across train and test, and random splits on time-series data. If results look too good to be true, suspect leakage first.</p>`,
      lang: "python",
      code: `import numpy as np, pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler, FunctionTransformer, TargetEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

events = pd.read_parquet("events.parquet")         # user activity log
snapshot = pd.Timestamp("2026-09-01")
hist = events[events.ts < snapshot]                 # ONLY data before the prediction date (no leakage)

# Domain features built from history
feats = hist.groupby("user_id").agg(
    days_since_last_login=("ts", lambda s: (snapshot - s.max()).days),
    logins_30d=("ts", lambda s: (s >= snapshot - pd.Timedelta(days=30)).sum()),
    logins_prev_30d=("ts", lambda s: ((s < snapshot - pd.Timedelta(days=30)) & (s >= snapshot - pd.Timedelta(days=60))).sum()),
)
feats["usage_trend"] = (feats.logins_30d + 1) / (feats.logins_prev_30d + 1)    # falling usage -> churn signal
df = feats.join(customers.set_index("user_id"))      # plan, city, monthly_spend, label...

numeric_log = ["monthly_spend"]                       # skewed -> log1p
numeric = ["days_since_last_login", "logins_30d", "usage_trend"]
pre = ColumnTransformer([
    ("log", Pipeline([("log", FunctionTransformer(np.log1p)), ("scale", StandardScaler())]), numeric_log),
    ("num", StandardScaler(), numeric),
    ("onehot", OneHotEncoder(handle_unknown="ignore"), ["plan", "payment_method"]),   # low cardinality
    ("target", TargetEncoder(), ["city"]),           # high cardinality; cross-fitted internally (sklearn >= 1.3)
])
clf = Pipeline([("pre", pre), ("model", LogisticRegression(max_iter=2000, class_weight="balanced"))])
X, y = df.drop(columns="churned_next_30d"), df["churned_next_30d"]
print(cross_val_score(clf, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=1), scoring="average_precision").mean())

# Leakage checklist
#  - every feature computable at prediction time? (no post-outcome columns)
#  - scalers/encoders fitted inside the pipeline (per CV fold), not on the full dataset
#  - no customer appears in both train and test (use GroupKFold if needed)
#  - time-ordered split for time-dependent data`,
      ex: "Starting from a raw event log, engineer at least ten features for a churn or purchase prediction task using only data before a snapshot date, including recency, frequency, trends and ratios. Compare model performance with raw versus engineered features. Then deliberately introduce two kinds of leakage (a post-outcome feature and scaling before splitting), measure the inflated scores, and remove them.",
      q: ["A churn model scores 0.99 AUC in testing. One feature is 'cancellation_reason'. What's likely happening?", ["The model is excellent", "Target leakage: the reason is only known after a customer churns, so it won't exist at prediction time", "The data is too small", "AUC can't exceed 0.95"], 1, "Features that are consequences of the outcome make test scores look perfect and the model useless in production."]
    },
    {
      t: "Unsupervised learning",
      sub: ["k-means clustering", "Hierarchical clustering", "PCA", "Anomaly detection"],
      body: `<p><b>Unsupervised learning</b> finds structure in data without labels: customer segments, compressed representations, unusual behaviour.</p>
<p><b>k-means</b> partitions data into k clusters by repeatedly assigning points to the nearest centroid and moving each centroid to the mean of its points. It's fast and simple, but you must choose k (the elbow method, silhouette scores, and above all whether the segments are useful to the business), it assumes roughly round clusters of similar size, and it needs scaled features. Always profile clusters afterwards (average values per cluster) and give them meaningful names, such as "high-value, infrequent buyers".</p>
<p><b>Hierarchical clustering</b> builds a tree (dendrogram) by repeatedly merging the closest clusters (agglomerative). You can cut the tree at any level to get different numbers of clusters, and the dendrogram itself shows the structure. It suits small to medium datasets. <b>DBSCAN</b> and HDBSCAN find clusters of arbitrary shape and label sparse points as noise.</p>
<p><b>PCA</b> (principal component analysis) projects data onto a few directions that capture the most variance, reducing dozens of correlated features to a handful. Uses: visualising high-dimensional data in 2-D, speeding up models, removing noise. Check the explained variance ratio to choose the number of components. For visualising complex structure such as embeddings, non-linear methods like UMAP and t-SNE often work better.</p>
<p><b>Anomaly detection</b> flags unusual points: fraud, faulty sensors, intrusions, data quality problems. Approaches include statistical thresholds (z-scores, interquartile range), <b>Isolation Forest</b> (anomalies are isolated by few random splits), Local Outlier Factor, and reconstruction error from autoencoders. Since labels are rare, evaluate with the few known cases plus expert review of the top-flagged items.</p>`,
      lang: "python",
      code: `import numpy as np, pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest

# RFM customer features: recency (days), frequency (orders/yr), monetary (Rs/yr)
rfm = pd.read_csv("rfm.csv", index_col="customer_id")
X = StandardScaler().fit_transform(np.log1p(rfm[["recency", "frequency", "monetary"]]))

# Choose k with silhouette scores (and business sense)
for k in range(2, 8):
    labels = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)
    print(k, round(silhouette_score(X, labels), 3))

km = KMeans(n_clusters=4, n_init=10, random_state=0).fit(X)
rfm["segment"] = km.labels_
profile = rfm.groupby("segment").agg(customers=("recency", "size"), recency=("recency", "median"),
                                     frequency=("frequency", "median"), monetary=("monetary", "median"))
print(profile)    # name them: "champions", "at risk", "new", "lapsed"

# Hierarchical clustering on a sample (scipy dendrogram for the tree view)
agg = AgglomerativeClustering(n_clusters=4, linkage="ward").fit_predict(X[:2000])

# PCA: 40 survey questions -> 2 components for a scatter plot
survey = pd.read_csv("survey.csv")
pca = PCA(n_components=10).fit(StandardScaler().fit_transform(survey))
print("explained variance:", pca.explained_variance_ratio_.cumsum().round(2))   # pick enough to reach ~80%
coords = pca.transform(StandardScaler().fit_transform(survey))[:, :2]

# Anomaly detection: unusual transactions
tx = pd.read_csv("transactions.csv")
feats = tx[["amount", "hour", "merchant_risk", "km_from_home", "tx_last_hour"]]
iso = IsolationForest(n_estimators=300, contamination=0.005, random_state=0).fit(feats)
tx["anomaly_score"] = -iso.score_samples(feats)
print(tx.sort_values("anomaly_score", ascending=False).head(10))   # send the top ones for review`,
      ex: "Segment customers from an e-commerce transactions dataset using RFM features with k-means: choose k with silhouette scores and judgement, profile and name each segment, and suggest one marketing action per segment. Compare with hierarchical clustering on a sample. Run PCA on a dataset with many features to plot it in 2-D, and use Isolation Forest to flag the 20 most unusual transactions, explaining why each might be odd.",
      q: ["Why scale features before running k-means?", ["k-means requires integers", "k-means uses distances, so features on large scales (like income in rupees) would dominate clusters over small-scale ones (like number of orders)", "Scaling picks k automatically", "It removes outliers"], 1, "Distance-based methods weigh every unit equally. Without scaling, the feature with the biggest numbers decides the clusters."]
    }
  ]
});
