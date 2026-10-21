/* Forge Academy lessons: deep learning, MLOps */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 89, id: "deep-learning-lessons", fills: "deep-learning", title: "Deep learning", level: 3,
  blurb: "Neural networks, PyTorch, computer vision and transformers.",
  lessons: [
    {
      t: "Neural network basics",
      sub: ["Neurons, layers and activations", "Loss functions", "Backpropagation", "Overfitting and regularisation"],
      body: `<p>A <b>neuron</b> computes a weighted sum of its inputs plus a bias, then applies a non-linear <b>activation function</b>. A <b>layer</b> is many neurons in parallel (a matrix multiplication plus activation), and a network stacks layers: input → hidden layers → output. Without non-linear activations, stacked layers collapse into a single linear model; with them, networks can approximate very complex functions. <b>ReLU</b> (max(0, x)) and its variants (GELU) are the default for hidden layers; <b>sigmoid</b> outputs a probability for binary tasks and <b>softmax</b> turns outputs into a probability distribution over classes.</p>
<p>The <b>loss function</b> measures how wrong predictions are: <b>mean squared error</b> for regression, <b>binary cross-entropy</b> for yes/no classification, <b>cross-entropy</b> for multi-class classification. Training minimises the average loss over the data.</p>
<p><b>Backpropagation</b> computes the gradient of the loss with respect to every weight by applying the chain rule backwards through the network, layer by layer. An <b>optimiser</b> (SGD with momentum, Adam, AdamW) then updates the weights. One pass over the whole training set is an <b>epoch</b>; training runs many epochs in mini-batches.</p>
<p>Networks have many parameters, so they <b>overfit</b> easily: training loss keeps falling while validation loss starts rising. Remedies: more data and <b>data augmentation</b>; <b>dropout</b> (randomly zeroing activations during training); <b>weight decay</b> (L2 regularisation); <b>early stopping</b> (keep the weights with the best validation score); smaller models; and normalisation layers (batch or layer norm), which also stabilise training. Always plot training and validation curves.</p>`,
      lang: "python",
      code: `import numpy as np

# A tiny 2-layer network trained with backpropagation, from scratch, on XOR-like data
rng = np.random.default_rng(0)
X = rng.uniform(-1, 1, size=(400, 2))
y = ((X[:, 0] * X[:, 1]) > 0).astype(float).reshape(-1, 1)      # not linearly separable

W1 = rng.normal(0, 0.5, (2, 16)); b1 = np.zeros(16)
W2 = rng.normal(0, 0.5, (16, 1)); b2 = np.zeros(1)
relu = lambda z: np.maximum(0, z)
sigmoid = lambda z: 1 / (1 + np.exp(-z))
lr = 0.5

for epoch in range(2000):
    # forward pass
    z1 = X @ W1 + b1;  a1 = relu(z1)                  # hidden layer
    z2 = a1 @ W2 + b2; p = sigmoid(z2)                # output probability
    loss = -np.mean(y * np.log(p + 1e-9) + (1 - y) * np.log(1 - p + 1e-9))   # binary cross-entropy

    # backward pass (chain rule, layer by layer)
    dz2 = (p - y) / len(X)                            # dLoss/dz2 for sigmoid + BCE
    dW2 = a1.T @ dz2; db2 = dz2.sum(0)
    da1 = dz2 @ W2.T
    dz1 = da1 * (z1 > 0)                              # ReLU derivative
    dW1 = X.T @ dz1;  db1 = dz1.sum(0)

    # gradient descent update
    W1 -= lr * dW1; b1 -= lr * db1; W2 -= lr * dW2; b2 -= lr * db2
    if epoch % 500 == 0:
        acc = ((p > 0.5) == y).mean()
        print(f"epoch {epoch:4d}  loss {loss:.3f}  accuracy {acc:.2%}")
# A linear model can't beat ~50% here; the hidden layer with ReLU learns the curved boundary.`,
      ex: "Implement the network above, then extend it: add a second hidden layer, try sigmoid instead of ReLU in the hidden layers and compare training speed, and add L2 weight decay. Split the data into train and validation sets, plot both loss curves with a large network to show overfitting, and fix it with weight decay or early stopping.",
      q: ["Why do neural networks need non-linear activation functions?", ["To make training faster", "Without them, stacked linear layers collapse into one linear transformation and can't model curved decision boundaries", "To reduce memory", "They replace the loss function"], 1, "A composition of linear functions is linear. Non-linearities give networks the power to approximate complex functions."]
    },
    {
      t: "PyTorch",
      sub: ["Tensors and autograd", "nn.Module", "Training loops", "GPUs and Colab"],
      body: `<p><b>PyTorch</b> is the most widely used deep learning framework in research and increasingly in industry.</p>
<p><b>Tensors</b> are like NumPy arrays that can live on a GPU and track operations for automatic differentiation. Create one with <code>requires_grad=True</code>, compute a loss, call <code>loss.backward()</code>, and <b>autograd</b> fills in <code>.grad</code> for every parameter using the chain rule. No manual derivatives.</p>
<p><b>nn.Module</b> is the base class for models: define layers in <code>__init__</code> (<code>nn.Linear</code>, <code>nn.Conv2d</code>, <code>nn.Embedding</code>, <code>nn.Dropout</code>, <code>nn.LayerNorm</code>) and the computation in <code>forward</code>. Modules nest, so you build big models from small blocks, and <code>model.parameters()</code> gives the optimiser everything to train.</p>
<p>The <b>training loop</b> is explicit in PyTorch, which helps you understand exactly what happens. For each batch from a <code>DataLoader</code>: move it to the device, run the forward pass, compute the loss, <code>optimizer.zero_grad()</code>, <code>loss.backward()</code>, <code>optimizer.step()</code>. Each epoch, evaluate on validation data inside <code>model.eval()</code> and <code>torch.no_grad()</code> (which disables dropout and gradient tracking), track metrics, and save the best checkpoint. Libraries like PyTorch Lightning and Hugging Face Accelerate remove boilerplate once you know the loop.</p>
<p><b>GPUs</b> make training many times faster through parallel matrix maths: move the model and each batch to the same device with <code>.to(device)</code>. Free options for learning: <b>Google Colab</b> and <b>Kaggle notebooks</b> with free GPU quotas. Mixed precision (<code>torch.autocast</code>) speeds training further and saves memory. On Apple Silicon, the <code>mps</code> device uses the built-in GPU.</p>`,
      lang: "python",
      code: `import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset, random_split

device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")

# Data: tabular features -> 3 classes (replace with your dataset)
X = torch.randn(5000, 20); y = (X[:, 0] + X[:, 1] * 2 > 0).long() + (X[:, 2] > 1).long()
train_ds, val_ds = random_split(TensorDataset(X, y), [4000, 1000], generator=torch.Generator().manual_seed(0))
train_dl = DataLoader(train_ds, batch_size=64, shuffle=True)
val_dl = DataLoader(val_ds, batch_size=256)

class MLP(nn.Module):
    def __init__(self, d_in, d_hidden, n_classes, p_drop=0.2):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(d_in, d_hidden), nn.ReLU(), nn.Dropout(p_drop),
            nn.Linear(d_hidden, d_hidden), nn.ReLU(), nn.Dropout(p_drop),
            nn.Linear(d_hidden, n_classes))           # raw logits; CrossEntropyLoss applies softmax
    def forward(self, x): return self.net(x)

model = MLP(20, 128, 3).to(device)
opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
loss_fn = nn.CrossEntropyLoss()
best = 0.0

for epoch in range(20):
    model.train()
    for xb, yb in train_dl:
        xb, yb = xb.to(device), yb.to(device)
        loss = loss_fn(model(xb), yb)                 # forward
        opt.zero_grad(); loss.backward(); opt.step()  # backward + update

    model.eval(); correct = 0
    with torch.no_grad():                             # no dropout, no gradient tracking
        for xb, yb in val_dl:
            correct += (model(xb.to(device)).argmax(1) == yb.to(device)).sum().item()
    acc = correct / len(val_ds)
    if acc > best:
        best = acc; torch.save(model.state_dict(), "best.pt")   # keep the best checkpoint
    print(f"epoch {epoch:2d}  train loss {loss.item():.3f}  val acc {acc:.3f}")

# Autograd in one line: d/dw of (w*3)^2 at w=2 is 2*(w*3)*3 = 36
w = torch.tensor(2.0, requires_grad=True); ((w * 3) ** 2).backward(); print(w.grad)   # tensor(36.)`,
      ex: "In Colab with a GPU, train an MLP on a tabular dataset and then a small network on Fashion-MNIST (torchvision) with a full training loop: DataLoaders, train and eval modes, AdamW, a learning-rate scheduler, best-checkpoint saving and loss/accuracy curves. Compare CPU and GPU training time per epoch, and try mixed precision.",
      q: ["Why call model.eval() and use torch.no_grad() during validation?", ["To speed up training", "To switch off training-only behaviour like dropout and stop tracking gradients, giving correct and faster evaluation", "To save the model", "To reset the weights"], 1, "Dropout and batch norm behave differently during training. eval() and no_grad() give deterministic predictions and save memory."]
    },
    {
      t: "Computer vision",
      sub: ["Convolutional networks", "Data augmentation", "Transfer learning", "Image classification"],
      body: `<p>Images are grids of pixel values (height × width × 3 colour channels). A fully connected network on raw pixels would need enormous numbers of weights and would ignore the fact that nearby pixels are related.</p>
<p><b>Convolutional neural networks</b> (CNNs) slide small learned filters (such as 3×3) across the image. Each filter detects a pattern (an edge, a texture) wherever it appears, sharing the same weights across positions, which makes CNNs efficient and good at recognising objects anywhere in the image. Stacking convolution layers with <b>pooling</b> (downsampling) builds a hierarchy: early layers detect edges, middle layers shapes and textures, later layers object parts. Classic and modern architectures include ResNet (residual connections enable very deep networks), EfficientNet and ConvNeXt; <b>Vision Transformers</b> (ViT) apply transformer attention to image patches.</p>
<p><b>Data augmentation</b> creates varied training images on the fly: random crops, flips, small rotations, colour jitter, blur. It teaches the model that these changes don't alter the label and is one of the most effective defences against overfitting with limited images. Only augment the training set, and only with changes that preserve the label (flipping a "6" makes a "9").</p>
<p><b>Transfer learning</b> is how most real image projects work: start from a model pretrained on millions of images (ImageNet) and fine-tune it on your small dataset. Replace the final layer with one for your classes, train it first with the backbone frozen, then optionally unfreeze and fine-tune everything with a small learning rate. A few hundred images per class can give strong results.</p>
<p>For <b>image classification</b>, organise data into train/val/test folders per class, check class balance, evaluate with a confusion matrix to see which classes get confused, and inspect misclassified images to find labelling errors and data gaps.</p>`,
      lang: "python",
      code: `import torch
from torch import nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader

device = "cuda" if torch.cuda.is_available() else "cpu"

# Augment training images only; validation uses deterministic preprocessing
weights = models.ResNet18_Weights.DEFAULT
train_tf = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.7, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(0.2, 0.2, 0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),   # ImageNet stats
])
val_tf = weights.transforms()

# data/train/<class>/*.jpg and data/val/<class>/*.jpg  (e.g. healthy / blight / rust leaves)
train_ds = datasets.ImageFolder("data/train", transform=train_tf)
val_ds = datasets.ImageFolder("data/val", transform=val_tf)
train_dl = DataLoader(train_ds, batch_size=32, shuffle=True, num_workers=2)
val_dl = DataLoader(val_ds, batch_size=64, num_workers=2)

# Transfer learning: pretrained backbone, new head for our classes
model = models.resnet18(weights=weights)
for p in model.parameters():
    p.requires_grad = False                                  # stage 1: freeze the backbone
model.fc = nn.Linear(model.fc.in_features, len(train_ds.classes))   # new trainable head
model = model.to(device)

def run(epochs, params, lr):
    opt = torch.optim.AdamW(params, lr=lr)
    for epoch in range(epochs):
        model.train()
        for xb, yb in train_dl:
            loss = nn.functional.cross_entropy(model(xb.to(device)), yb.to(device))
            opt.zero_grad(); loss.backward(); opt.step()
        model.eval(); correct = 0
        with torch.no_grad():
            for xb, yb in val_dl:
                correct += (model(xb.to(device)).argmax(1).cpu() == yb).sum().item()
        print(f"val acc {correct / len(val_ds):.3f}")

run(5, model.fc.parameters(), lr=1e-3)                       # train the head
for p in model.parameters(): p.requires_grad = True          # stage 2: fine-tune everything gently
run(5, model.parameters(), lr=1e-4)`,
      ex: "Collect or download a small image dataset with 3–5 classes (plant diseases, Indian food dishes, or recyclable waste types; a few hundred images per class). Train a small CNN from scratch, then fine-tune a pretrained ResNet or EfficientNet with augmentation, and compare accuracy. Produce a confusion matrix, inspect 20 misclassified images and write down what they reveal about the data.",
      q: ["You have only 300 labelled images per class. What's usually the best approach?", ["Train a large CNN from scratch", "Fine-tune a model pretrained on a large dataset (transfer learning), with data augmentation", "Use k-means clustering", "Convert images to text"], 1, "Pretrained models already know general visual features, so they need far less data to adapt to new classes."]
    },
    {
      t: "Sequence models and transformers",
      sub: ["Embeddings", "Attention", "Transformers", "Hugging Face models"],
      body: `<p>Text, audio and time series are <b>sequences</b>. To feed text to a network, it's split into <b>tokens</b> (words or sub-word pieces) and each token is mapped to an <b>embedding</b>: a learned vector where similar meanings end up close together. Whole sentences and documents can also be embedded, which powers semantic search and RAG.</p>
<p>Earlier sequence models (RNNs, LSTMs) read tokens one at a time, which was slow and struggled with long-range dependencies. <b>Attention</b> lets every token look directly at every other token and decide how much each matters for its own representation: in "The trophy didn't fit in the suitcase because it was too big", attention helps "it" connect to "trophy". Mechanically, each token produces a <b>query</b>, <b>key</b> and <b>value</b> vector; attention weights come from query–key similarity (a softmax over dot products), and the output is a weighted sum of values. <b>Multi-head</b> attention runs several of these in parallel to capture different relationships.</p>
<p>A <b>transformer</b> stacks blocks of multi-head self-attention and feed-forward layers, with residual connections and layer normalisation, plus positional information so word order counts. It processes all tokens in parallel, which makes training on huge datasets on GPUs practical. <b>Encoder</b> models (BERT family) build representations for classification, extraction and embeddings; <b>decoder</b> models (GPT-style, Claude, Llama) generate text one token at a time and power today's large language models; encoder-decoder models (T5) map one sequence to another.</p>
<p>The <b>Hugging Face</b> ecosystem gives access to hundreds of thousands of pretrained models: <code>pipeline()</code> for quick inference, <code>AutoTokenizer</code> and <code>AutoModel</code> classes, <code>datasets</code>, and <code>Trainer</code> or PEFT/LoRA for efficient fine-tuning. For most text tasks, fine-tuning a small pretrained model or calling an LLM API beats training from scratch.</p>`,
      lang: "python",
      code: `import torch, torch.nn.functional as F

# --- Scaled dot-product attention, the core of a transformer, in a few lines ---
def attention(Q, K, V):
    scores = Q @ K.transpose(-2, -1) / K.shape[-1] ** 0.5   # how much each token attends to each other token
    weights = F.softmax(scores, dim=-1)                     # each row sums to 1
    return weights @ V, weights

tokens = 5; d = 8
x = torch.randn(tokens, d)                                  # 5 token embeddings
Wq, Wk, Wv = (torch.randn(d, d) for _ in range(3))          # learned projections
out, w = attention(x @ Wq, x @ Wk, x @ Wv)
print(w.round(decimals=2))                                   # 5x5 attention map

# --- Hugging Face: pretrained transformers in a few lines ---
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

classify = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
print(classify(["The delivery was quick and the food was hot!", "Order arrived cold and late."]))

zero_shot = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print(zero_shot("My refund hasn't arrived after 10 days", candidate_labels=["refund", "delivery", "login issue"]))

# Sentence embeddings for semantic search
from sentence_transformers import SentenceTransformer
emb = SentenceTransformer("all-MiniLM-L6-v2")
docs = ["How to reset my password", "Track my order", "Change delivery address"]
q = emb.encode("I forgot my login password", normalize_embeddings=True)
D = emb.encode(docs, normalize_embeddings=True)
print(docs[int((D @ q).argmax())])                          # -> "How to reset my password"

# Fine-tuning outline (support ticket classifier):
#   tok = AutoTokenizer.from_pretrained("distilbert-base-uncased")
#   model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=5)
#   tokenized = dataset.map(lambda b: tok(b["text"], truncation=True), batched=True)
#   Trainer(model=model, args=TrainingArguments("out", num_train_epochs=3, eval_strategy="epoch"),
#           train_dataset=tokenized["train"], eval_dataset=tokenized["test"]).train()`,
      ex: "Implement single-head scaled dot-product attention in PyTorch and visualise the attention weights for a short sentence. Then with Hugging Face: run sentiment and zero-shot classification on 20 real reviews, build a semantic search over 100 FAQ entries with sentence embeddings, and fine-tune DistilBERT (or a small multilingual model for Hindi or Hinglish text) on a labelled ticket or review dataset, comparing it with the zero-shot baseline.",
      q: ["What does self-attention let each token do?", ["Skip the embedding step", "Weigh and combine information from every other token in the sequence, based on learned query-key similarity", "Only look at the previous token", "Translate itself into another language"], 1, "Attention computes, for each token, how relevant every other token is and mixes their information accordingly."]
    }
  ]
});

COURSE.push({
  n: 90, id: "mlops-lessons", fills: "mlops", title: "MLOps: models in production", level: 3,
  blurb: "Tracking, serving, automating and monitoring machine learning systems.",
  lessons: [
    {
      t: "Experiment tracking and reproducibility",
      sub: ["MLflow tracking", "Data and model versioning (DVC)", "Reproducible environments", "Model registry"],
      body: `<p>ML development is experimental: dozens of runs with different data, features, hyperparameters and code. Without tracking, nobody can say which run produced the model in production, or reproduce a good result from last month.</p>
<p><b>Experiment tracking</b> records every run: parameters, metrics (and their curves), code version (git commit), data version, environment and artefacts (models, plots). <b>MLflow</b> is the most common open-source tool (also built into Databricks); Weights &amp; Biases and Neptune are popular hosted options. Compare runs side by side in the UI and pick winners with evidence.</p>
<p><b>Data and model versioning</b>: Git isn't built for large files. <b>DVC</b> (Data Version Control) stores large data and model files in object storage while keeping small pointer files in Git, so a commit identifies exactly which data and model belong to which code. DVC pipelines also cache steps and rerun only what changed. Lakehouse time travel (Delta, Iceberg) and versioned datasets in feature stores serve a similar purpose.</p>
<p><b>Reproducible environments</b>: pin package versions with a lock file, build Docker images for training and serving, fix random seeds, and record hardware and library versions. Some GPU operations are non-deterministic, so aim for "statistically the same" rather than bit-identical results.</p>
<p>A <b>model registry</b> is the catalogue of trained models ready for use: each registered version links back to its run, metrics and data, and moves through stages or aliases (candidate, staging, production) with approvals. Serving systems load "the production model" from the registry, which makes promotions and rollbacks explicit and auditable.</p>`,
      lang: "python",
      code: `import mlflow, mlflow.sklearn
from sklearn.metrics import roc_auc_score, average_precision_score
from lightgbm import LGBMClassifier
from sklearn.pipeline import make_pipeline

mlflow.set_tracking_uri("http://localhost:5000")       # mlflow server --backend-store-uri sqlite:///mlflow.db
mlflow.set_experiment("churn-prediction")

params = {"n_estimators": 800, "learning_rate": 0.03, "num_leaves": 63, "subsample": 0.8, "subsample_freq": 1}
with mlflow.start_run(run_name="lgbm-v3-usage-trend") as run:
    mlflow.log_params(params)
    mlflow.set_tags({"git_commit": GIT_SHA, "data_version": "dvc:churn@a1b2c3", "features": "v3"})

    model = make_pipeline(pre, LGBMClassifier(**params, verbose=-1)).fit(X_train, y_train)
    proba = model.predict_proba(X_val)[:, 1]
    mlflow.log_metrics({"val_roc_auc": roc_auc_score(y_val, proba),
                        "val_pr_auc": average_precision_score(y_val, proba)})
    mlflow.log_figure(plot_pr_curve(y_val, proba), "pr_curve.png")
    mlflow.sklearn.log_model(model, artifact_path="model", input_example=X_val.head(3),
                             registered_model_name="churn-model")          # creates a new registry version

# Promote after review: point the "production" alias at the chosen version
from mlflow import MlflowClient
MlflowClient().set_registered_model_alias("churn-model", "production", version=7)

# Serving code always loads by alias, so promotion/rollback = moving the alias
prod_model = mlflow.sklearn.load_model("models:/churn-model@production")

# DVC: version the data next to the code
#   dvc init && dvc remote add -d storage s3://ml-artifacts/dvc
#   dvc add data/churn_2026_09.parquet && git add data/churn_2026_09.parquet.dvc && git commit -m "data v3"
#   dvc push            (teammates: git pull && dvc pull)`,
      ex: "Run MLflow locally and log at least ten training runs of a model with different hyperparameters and feature sets, including metrics, plots, git commit and data version tags. Version your dataset with DVC (a local folder remote is fine), register the best model, assign it a production alias and load it by alias in a separate script. Then change the data, retrain, and show you can still reproduce the old model.",
      q: ["Why do serving systems load a model by registry alias (like @production) rather than a file path?", ["It's faster to download", "Promotions and rollbacks become a reviewed alias change, and every deployed model traces back to its run, data and metrics", "Aliases compress the model", "File paths don't work in Python"], 1, "The registry adds traceability and control: what's in production is explicit, and switching versions needs no code change."]
    },
    {
      t: "Serving models",
      sub: ["Batch vs online inference", "Serving with FastAPI", "Containerising models", "Latency and cost"],
      body: `<p><b>Batch inference</b> scores many records on a schedule (every night, score all customers for churn risk, and write results to a table the CRM reads). It's simple, cheap and easy to monitor, and fits whenever predictions don't need to be instant. <b>Online inference</b> answers requests in real time through an API (fraud check during payment, recommendations when a page loads), which needs low latency, high availability and features available at request time. Start with batch if the use case allows it.</p>
<p><b>Serving with FastAPI</b>: load the model <b>once at startup</b> (not per request), validate inputs with Pydantic schemas that match the training features, return predictions with the model version, and add health and readiness endpoints. Apply exactly the same preprocessing as in training, which is the main reason to save a full scikit-learn Pipeline. For heavier models there are specialised servers: BentoML, Ray Serve, NVIDIA Triton, TorchServe, and vLLM or TGI for LLMs; managed options include SageMaker, Vertex AI and Azure ML endpoints.</p>
<p><b>Containerising</b>: package the model artefact, inference code and pinned dependencies into a Docker image, so the same thing runs on a laptop, in CI and in production (Kubernetes, Cloud Run, ECS). Either bake the model into the image (simple, immutable) or download it from the registry at startup (smaller images, flexible).</p>
<p><b>Latency and cost</b>: measure p50/p95/p99 latency and throughput under load. Levers: smaller or distilled models, ONNX Runtime or quantisation (int8) for faster CPU inference, batching requests on GPUs, caching repeated predictions, autoscaling (including scale to zero for spiky traffic), and choosing CPU versus GPU deliberately, since GPUs only pay off for large models or high volume.</p>`,
      lang: "python",
      code: `# serve.py : online inference with FastAPI
import os, time
from contextlib import asynccontextmanager
import mlflow.sklearn, pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

MODEL_URI = os.environ.get("MODEL_URI", "models:/churn-model@production")
state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    state["model"] = mlflow.sklearn.load_model(MODEL_URI)   # load ONCE, not per request
    state["version"] = MODEL_URI
    yield

app = FastAPI(lifespan=lifespan)

class Customer(BaseModel):                                    # mirrors the training features
    tenure_months: int = Field(ge=0)
    monthly_spend: float = Field(ge=0)
    logins_30d: int = Field(ge=0)
    support_tickets_90d: int = Field(ge=0)
    plan: str
    city: str
    payment_method: str

@app.get("/health")
def health(): return {"ok": "model" in state}

@app.post("/predict")
def predict(customers: list[Customer]):                       # batch of 1..N for efficiency
    t = time.perf_counter()
    df = pd.DataFrame([c.model_dump() for c in customers])
    proba = state["model"].predict_proba(df)[:, 1]           # same Pipeline as training
    return {"model": state["version"], "churn_probability": proba.round(4).tolist(),
            "latency_ms": round((time.perf_counter() - t) * 1000, 1)}

# Batch inference instead (nightly job):
#   scores = model.predict_proba(all_customers_df)[:, 1]
#   pd.DataFrame({"customer_id": ids, "churn_p": scores, "scored_at": today}).to_sql("churn_scores", warehouse)

# Dockerfile
#   FROM python:3.12-slim
#   WORKDIR /app
#   COPY requirements.lock . && RUN pip install --no-cache-dir -r requirements.lock
#   COPY serve.py .
#   ENV MODEL_URI=models:/churn-model@production
#   CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2"]
# Load test: k6 / locust -> record p95 latency and requests per second`,
      ex: "Serve a model you trained in two ways: as a nightly batch job writing scores to a database table, and as a FastAPI endpoint in Docker that loads the model once, validates inputs and returns the model version. Load-test the API and record p50/p95 latency and throughput, then try one optimisation (ONNX export, quantisation, or request batching) and measure the improvement.",
      q: ["A marketing team needs churn scores for all customers each morning to plan calls. Which serving approach fits best?", ["A real-time GPU endpoint", "A scheduled batch job that scores everyone overnight and writes results to a table", "Retraining the model every request", "Running the model in the browser"], 1, "No instant predictions are needed, so batch scoring is simpler, cheaper and easier to monitor."]
    },
    {
      t: "ML pipelines and automation",
      sub: ["Training pipelines", "Feature stores", "CI/CD for ML", "Scheduled retraining"],
      body: `<p>Notebook-trained models don't scale as a process. A <b>training pipeline</b> turns the steps into code that runs end to end automatically: data extraction, validation, feature engineering, training, evaluation against the current production model, and registration if it's better. Tools: Airflow, Prefect or Dagster for orchestration; Kubeflow Pipelines, Vertex AI Pipelines, SageMaker Pipelines, Metaflow or ZenML for ML-specific pipelines. Each step is versioned and cached, so reruns are reproducible.</p>
<p>A <b>feature store</b> (Feast, Tecton, Databricks and Vertex feature stores) manages features as shared, versioned assets. It keeps an <b>offline store</b> of historical feature values for training (with point-in-time correct joins, so training never sees values from the future) and an <b>online store</b> (low-latency, often Redis) serving the latest values at prediction time. This solves <b>training-serving skew</b>, where features are computed one way in training and slightly differently in production, quietly degrading accuracy. Not every team needs one; shared feature code and tables may be enough at first.</p>
<p><b>CI/CD for ML</b> tests more than code: unit tests for feature functions, data validation (schema, ranges, nulls), training a small model on a sample to catch breakages, and evaluation gates that block promotion if a candidate performs worse than production on a fixed holdout set or on important slices (new users, small cities). Deployment then follows normal software practices: containers, staged rollouts, shadow or canary deployments that compare the new model's predictions with the old one's on live traffic.</p>
<p><b>Retraining</b>: data drifts, so models go stale. Retrain on a schedule (weekly or monthly, matched to how fast the domain changes) or when monitoring shows drift or performance decline, always through the same pipeline and evaluation gates, never by hand.</p>`,
      lang: "python",
      code: `# A retraining pipeline as a Prefect flow (the same shape works in Airflow or Dagster)
from prefect import flow, task
import mlflow
from mlflow import MlflowClient

@task(retries=2)
def extract(as_of: str):
    return load_training_snapshot(as_of)            # point-in-time correct features + labels

@task
def validate(df):
    assert df["customer_id"].is_unique, "duplicate customers"
    assert df["monthly_spend"].between(0, 1_000_000).all(), "spend out of range"
    assert df["churned_next_30d"].mean() < 0.5, "label rate looks wrong"
    return df

@task
def train_and_evaluate(df):
    X_tr, X_ho, y_tr, y_ho = time_based_split(df)   # holdout = most recent month
    candidate = build_pipeline().fit(X_tr, y_tr)
    champion = mlflow.sklearn.load_model("models:/churn-model@production")
    scores = {"candidate": pr_auc(candidate, X_ho, y_ho), "champion": pr_auc(champion, X_ho, y_ho),
              "candidate_new_users": pr_auc(candidate, *slice_new_users(X_ho, y_ho)),
              "champion_new_users": pr_auc(champion, *slice_new_users(X_ho, y_ho))}
    return candidate, scores

@task
def register_if_better(candidate, scores):
    better = scores["candidate"] >= scores["champion"] + 0.005             # evaluation gate
    no_regression = scores["candidate_new_users"] >= scores["champion_new_users"] - 0.01   # slice check
    with mlflow.start_run(run_name="scheduled-retrain"):
        mlflow.log_metrics(scores)
        if better and no_regression:
            info = mlflow.sklearn.log_model(candidate, "model", registered_model_name="churn-model")
            MlflowClient().set_registered_model_alias("churn-model", "staging", info.registered_model_version)
            return "promoted to staging for review/canary"
    return "kept champion"

@flow(name="churn-retrain")
def retrain(as_of: str):
    df = validate(extract(as_of))
    candidate, scores = train_and_evaluate(df)
    return register_if_better(candidate, scores)

# Schedule monthly:  retrain.serve(name="monthly", cron="0 3 1 * *", parameters={"as_of": "today"})
# Feature store (Feast) idea:
#   training:  store.get_historical_features(entity_df=labels_with_timestamps, features=["customer:logins_30d", ...])
#   serving:   store.get_online_features(features=[...], entity_rows=[{"customer_id": "c42"}])`,
      ex: "Turn a notebook model into an automated retraining pipeline (Prefect, Airflow or Dagster): extraction, data validation, training, evaluation against the current production model on a time-based holdout including one important data slice, and conditional registration. Add a CI workflow that runs feature unit tests and trains on a small sample on every pull request, and schedule the pipeline monthly.",
      q: ["What is training-serving skew?", ["When training takes longer than serving", "When features are computed differently at training time and prediction time, so the live model sees different inputs than it learned from", "When the model is too big to serve", "When servers are in different regions"], 1, "Small differences in feature logic or data freshness silently hurt accuracy. Shared feature definitions and feature stores prevent it."]
    },
    {
      t: "Monitoring models",
      sub: ["Data and concept drift", "Performance monitoring", "Alerting", "Responsible AI checks"],
      body: `<p>A deployed model is never finished: the world changes and the model's performance quietly decays. Monitoring catches this before users or the business do.</p>
<p><b>Data drift</b> (covariate shift) means the input distribution changes: new user demographics after expanding to new cities, a new product category, a changed upstream data pipeline. <b>Concept drift</b> means the relationship between inputs and outcome changes: fraud patterns adapt, customer behaviour shifts after a competitor's launch or a festival season. Detect data drift by comparing live feature distributions with training data using statistics such as PSI (population stability index), KL divergence or Kolmogorov–Smirnov tests, plus simple checks on null rates and category frequencies. Tools: Evidently, NannyML, WhyLabs, Arize and cloud model monitors.</p>
<p><b>Performance monitoring</b>: when true labels arrive (churn is known after 30 days, fraud after chargebacks), compute real metrics over time and by important slices. Until then, use proxies: prediction distribution shifts, confidence levels, business KPIs (approval rate, conversion) and user feedback. Also monitor the system itself: latency, error rates, throughput and cost.</p>
<p><b>Alerting</b>: set thresholds on drift scores, performance drops, prediction-rate anomalies and input data quality, route alerts to an owner, and write runbooks (retrain, roll back to the previous model version, or fall back to a rule-based system). Avoid noisy alerts; review drift trends regularly instead of paging on every wobble.</p>
<p><b>Responsible AI checks</b>: evaluate performance and error rates across groups (gender, region, age band, language) to detect unfair outcomes; document models with <b>model cards</b> (intended use, data, metrics, limitations); keep explanations available for decisions that affect people (SHAP values); protect personal data; allow human review and appeal for high-stakes decisions such as lending or hiring; and comply with applicable regulation.</p>`,
      lang: "python",
      code: `import numpy as np, pandas as pd

# --- Data drift: Population Stability Index per feature (training vs last week's live inputs) ---
def psi(expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
    edges = np.unique(np.quantile(expected, np.linspace(0, 1, bins + 1)))
    e = np.histogram(expected, edges)[0] / len(expected)
    a = np.histogram(np.clip(actual, edges[0], edges[-1]), edges)[0] / len(actual)
    e, a = np.clip(e, 1e-6, None), np.clip(a, 1e-6, None)
    return float(np.sum((a - e) * np.log(a / e)))
# rule of thumb: < 0.1 stable, 0.1-0.25 moderate shift, > 0.25 significant shift

train = pd.read_parquet("training_features.parquet")
live = pd.read_parquet("live_inputs_last_7d.parquet")
report = {col: round(psi(train[col].values, live[col].values), 3)
          for col in ["tenure_months", "monthly_spend", "logins_30d"]}
print(report)                                  # e.g. {'monthly_spend': 0.31, ...} -> investigate
alerts = [c for c, v in report.items() if v > 0.25]

# --- Performance once labels arrive, overall and by slice (fairness/robustness) ---
from sklearn.metrics import average_precision_score
scored = pd.read_parquet("predictions_with_outcomes_aug.parquet")   # prediction + true label 30 days later
print("PR-AUC overall:", average_precision_score(scored.churned, scored.churn_p))
by_slice = scored.groupby("city_tier").apply(lambda g: pd.Series({
    "n": len(g), "pr_auc": average_precision_score(g.churned, g.churn_p),
    "flag_rate": (g.churn_p > 0.6).mean()}))
print(by_slice)                                # big gaps between groups -> investigate before acting

# --- Evidently report (drift + quality dashboard as HTML) ---
# from evidently import Report
# from evidently.presets import DataDriftPreset
# Report([DataDriftPreset()]).run(reference_data=train, current_data=live).save_html("drift.html")

# Model card (excerpt, kept next to the model in the registry)
#   Intended use: prioritise retention calls; NOT for pricing or denying service
#   Training data: customers active Jan 2025 - Jul 2026, India; known gap: few tier-3 city users
#   Metrics: PR-AUC 0.41 overall; tier-1 0.44, tier-2 0.40, tier-3 0.31 (monitor)
#   Owner: growth-ds@  ·  Retraining: monthly  ·  Rollback: previous registry version`,
      ex: "For a model you've deployed (or a simulated one), build a monitoring job that computes PSI for key features weekly, tracks prediction distribution, and computes real performance by slice when labels arrive. Simulate drift (shift a feature's distribution and change the label relationship), show your checks catching both kinds, define alert thresholds and a runbook, and write a model card including a fairness comparison across at least two groups.",
      q: ["A fraud model's input distributions look unchanged, but its precision drops sharply as fraudsters change tactics. What is this?", ["Data drift", "Concept drift: the relationship between inputs and the outcome has changed", "A serving bug only", "Overfitting during training"], 1, "Inputs look the same, but what they mean for the outcome has changed. Monitoring real performance catches it; retraining on recent labels addresses it."]
    }
  ]
});
