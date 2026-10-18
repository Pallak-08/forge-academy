/* Forge Academy lessons: infrastructure as code, Kubernetes, observability and SRE */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 51, id: "iac-lessons", fills: "iac", title: "Infrastructure as code", level: 3,
  blurb: "Terraform and Ansible: infrastructure that is versioned, reviewed and repeatable.",
  lessons: [
    {
      t: "Terraform fundamentals",
      sub: ["Providers and resources", "State", "Variables and outputs", "plan, apply, destroy"],
      body: `<p><b>Infrastructure as code</b> (IaC) describes servers, networks, databases and DNS in files instead of clicking in consoles. Changes are reviewed in pull requests, environments are reproducible, and the code documents what exists.</p>
<p><b>Terraform</b> (and its open-source fork OpenTofu) is declarative: you describe the end state, and it works out what to create, change or delete. Code is written in HCL.</p>
<ul><li><b>Providers</b> are plugins that talk to APIs: <code>aws</code>, <code>google</code>, <code>azurerm</code>, <code>cloudflare</code>, <code>github</code>, and hundreds more. Pin their versions.</li>
<li><b>Resources</b> are the things you manage: <code>aws_s3_bucket</code>, <code>aws_instance</code>. Referencing one resource's attribute from another (<code>aws_s3_bucket.site.id</code>) creates a dependency, so Terraform knows the order.</li>
<li><b>Data sources</b> read existing things without managing them (the latest AMI, an existing VPC).</li></ul>
<p><b>State</b> (<code>terraform.tfstate</code>) maps your code to the real resources' IDs. Terraform compares code, state and reality to plan changes. State can contain secrets, so never commit it to Git; store it remotely (next lesson).</p>
<p><b>Variables</b> parameterise code (region, environment, instance size), with types, defaults and validation; values come from <code>.tfvars</code> files or environment variables. <b>Outputs</b> expose values such as a URL or ID for people or other configurations.</p>
<p>The workflow: <code>terraform init</code> (download providers), <code>fmt</code> and <code>validate</code>, <code>plan</code> (preview, which you always read carefully, watching for "destroy"), <code>apply</code> (make the changes), and <code>destroy</code> (remove everything, great for labs).</p>`,
      lang: "hcl",
      code: `# main.tf : a static website bucket on AWS
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = var.region
  default_tags { tags = { project = "forge-site", env = var.env, managed_by = "terraform" } }
}

variable "region" {
  type    = string
  default = "ap-south-1"
}
variable "env" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "env must be dev, staging or prod."
  }
}

resource "aws_s3_bucket" "site" {
  bucket = "forge-site-\${var.env}-\${random_id.suffix.hex}"
}
resource "random_id" "suffix" { byte_length = 3 }

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id    # reference = dependency
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_name" { value = aws_s3_bucket.site.bucket }

# terraform init
# terraform plan -var env=dev -out tf.plan     <- read it: + create, ~ update, - destroy
# terraform apply tf.plan
# terraform destroy -var env=dev`,
      ex: "Write Terraform that creates a private S3 bucket with versioning and encryption plus a DynamoDB table, using variables for environment and region and outputs for both names. Run plan and apply, change one setting and read the plan's diff, then deliberately change something in the console and see Terraform detect it on the next plan. Destroy everything at the end.",
      q: ["Why must the Terraform state file not be committed to a public Git repository?", ["It's too large", "It can contain secrets and sensitive resource details, and concurrent edits from copies cause conflicts", "Git can't store JSON", "Terraform deletes it automatically"], 1, "State often includes passwords and connection strings in plain text. Remote, encrypted, access-controlled storage is the norm."]
    },
    {
      t: "Terraform at scale",
      sub: ["Modules", "Remote state and locking", "Workspaces and environments", "Testing and linting IaC"],
      body: `<p><b>Modules</b> package reusable infrastructure: a folder of Terraform with inputs (variables) and outputs. A team might have modules for "a service on ECS", "a Postgres database" or "a static site", encoding their standards (encryption, tags, logging) so every use is compliant by default. Use well-maintained public modules (terraform-aws-modules) for common pieces, and pin module versions.</p>
<p><b>Remote state</b> stores state in a shared backend (S3, GCS, Azure Storage, Terraform Cloud/HCP) with encryption and access control. <b>Locking</b> prevents two people or pipelines applying at the same time and corrupting state: newer Terraform versions lock natively in S3 (<code>use_lockfile</code>), older setups use a DynamoDB table.</p>
<p><b>Environments</b>: two common approaches. <b>Workspaces</b> keep several states for the same code (<code>terraform workspace new staging</code>), which works for identical environments. Many teams prefer <b>separate directories per environment</b> (<code>envs/dev</code>, <code>envs/prod</code>) that call the same modules with different inputs and separate state and credentials, so a mistake in dev can't touch prod, and differences between environments are explicit.</p>
<p><b>Testing and linting</b>: <code>terraform fmt -check</code> and <code>validate</code>; <b>TFLint</b> for provider-specific mistakes; security scanners (Checkov, Trivy config); policy checks with OPA/Conftest; <code>terraform test</code> for module tests; and running <code>plan</code> on every pull request and posting it as a comment so reviewers see the real changes. Apply only from CI after merge, with credentials scoped per environment.</p>`,
      lang: "hcl",
      code: `# modules/static-site/variables.tf, main.tf, outputs.tf  (reusable module)
variable "name"   { type = string }
variable "domain" { type = string }
resource "aws_s3_bucket" "this" { bucket = var.name }
# ...encryption, public access block, CloudFront with OAC, ACM certificate...
output "url" { value = "https://\${var.domain}" }

# envs/prod/backend.tf : remote state with locking
terraform {
  backend "s3" {
    bucket       = "forge-tfstate-123456789012"
    key          = "prod/site.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true          # native S3 locking (Terraform 1.10+)
  }
}

# envs/prod/main.tf : the environment just wires modules together
module "site" {
  source = "../../modules/static-site"
  name   = "forge-site-prod"
  domain = "forge-academy.example.com"
}
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.13.0"             # pin versions
  name    = "forge-prod"
  cidr    = "10.20.0.0/16"
  # ...
}

# CI on every pull request (per environment directory):
#   terraform fmt -check -recursive
#   terraform init -input=false && terraform validate
#   tflint --recursive
#   trivy config --severity HIGH,CRITICAL .
#   terraform plan -input=false -out tf.plan && terraform show -no-color tf.plan > plan.txt
#   -> post plan.txt as a PR comment; apply only after merge`,
      ex: "Refactor your Terraform from the previous lesson into a reusable module, then create <code>envs/dev</code> and <code>envs/prod</code> that use it with different inputs and separate remote state in S3 with locking. Add a GitHub Actions workflow that runs fmt, validate, TFLint, a security scan and plan on pull requests, posting the plan as a comment.",
      q: ["What problem does state locking solve?", ["It encrypts the state", "It prevents two simultaneous applies from conflicting and corrupting the state", "It speeds up plans", "It deletes old resources"], 1, "Concurrent writes to state can lose track of resources. A lock ensures only one operation modifies state at a time."]
    },
    {
      t: "Configuration management with Ansible",
      sub: ["Inventories", "Playbooks and roles", "Idempotency", "Ansible Vault"],
      body: `<p>Terraform creates infrastructure; <b>configuration management</b> sets up what runs <i>on</i> servers: packages, users, config files, services. <b>Ansible</b> is the most popular tool for this: agentless (it connects over SSH), with tasks written in YAML.</p>
<p>An <b>inventory</b> lists the hosts to manage, grouped (<code>web</code>, <code>db</code>), with variables per host or group. It can be a static file or <b>dynamic</b>, built from your cloud account by tags.</p>
<p>A <b>playbook</b> maps groups of hosts to tasks. Each task calls a <b>module</b>: <code>apt</code>, <code>user</code>, <code>copy</code>, <code>template</code> (Jinja2 templates filled with variables), <code>systemd</code>, <code>ufw</code>. <b>Handlers</b> run only when notified by a change, for example restarting Nginx only if its config actually changed. <b>Roles</b> package related tasks, templates, handlers and defaults into reusable units (<code>roles/nginx</code>, <code>roles/hardening</code>), and community roles are on Ansible Galaxy.</p>
<p><b>Idempotency</b> is the core idea: running a playbook twice gives the same result, and the second run reports no changes. Modules describe desired state ("package installed", "line present") rather than actions, so prefer them over raw <code>shell</code> commands. Use <code>--check --diff</code> to preview what would change.</p>
<p><b>Ansible Vault</b> encrypts secrets (passwords, keys) in files that can be safely committed, decrypted at run time with a vault password, ideally supplied from a secret manager in CI.</p>
<p>In container and Kubernetes-heavy setups, much of this moves into images and manifests, but Ansible remains common for VMs, bare metal, network devices and hardening.</p>`,
      lang: "yaml",
      code: `# inventory.ini
# [web]
# web1 ansible_host=10.0.10.11
# web2 ansible_host=10.0.10.12
# [web:vars]
# ansible_user=deploy

# site.yml
- name: Configure web servers
  hosts: web
  become: true
  vars:
    app_port: 8000
    server_name: app.example.com
  tasks:
    - name: Install packages
      ansible.builtin.apt:
        name: [nginx, ufw, unattended-upgrades]
        state: present
        update_cache: true
        cache_valid_time: 3600

    - name: Nginx site config from template
      ansible.builtin.template:
        src: templates/app.conf.j2          # uses {{ server_name }} and {{ app_port }}
        dest: /etc/nginx/sites-enabled/app.conf
        mode: "0644"
      notify: Reload nginx                  # handler runs only if the file changed

    - name: Firewall allows SSH and HTTPS only
      community.general.ufw: { rule: allow, port: "{{ item }}", proto: tcp }
      loop: ["22", "443"]

    - name: Enable firewall
      community.general.ufw: { state: enabled, policy: deny }

  handlers:
    - name: Reload nginx
      ansible.builtin.systemd: { name: nginx, state: reloaded }

# Run:
#   ansible-playbook -i inventory.ini site.yml --check --diff   # preview
#   ansible-playbook -i inventory.ini site.yml                  # apply (run twice: changed=0)
# Secrets:
#   ansible-vault create group_vars/web/vault.yml
#   ansible-playbook -i inventory.ini site.yml --ask-vault-pass`,
      ex: "Write an Ansible playbook (organised into a role) that hardens and configures two VMs or containers: creates a deploy user with your SSH key, installs and configures Nginx from a template, sets up the firewall and enables automatic updates. Run it twice and confirm the second run reports <code>changed=0</code>. Store one secret with Ansible Vault.",
      q: ["What does it mean that an Ansible playbook is idempotent?", ["It runs on only one server", "Running it repeatedly converges to the same state; a second run makes no further changes", "It can't be undone", "It uses no SSH"], 1, "Modules check current state before acting, so playbooks are safe to re-run, which makes them reliable for ongoing configuration."]
    }
  ]
});

COURSE.push({
  n: 52, id: "kubernetes-lessons", fills: "kubernetes", title: "Kubernetes", level: 3,
  blurb: "Running containers at scale: architecture, workloads, configuration, scaling and the ecosystem.",
  lessons: [
    {
      t: "Kubernetes architecture",
      sub: ["Control plane and nodes", "Pods", "kubectl", "Namespaces"],
      body: `<p><b>Kubernetes</b> (K8s) runs containers across a cluster of machines and keeps them in the state you declare: "run 3 copies of this image, reachable on this port". If a container crashes or a machine dies, Kubernetes notices and fixes it. This is the <b>reconciliation loop</b>: controllers constantly compare desired state with actual state and act to close the gap.</p>
<p>A cluster has two parts:</p>
<ul><li>The <b>control plane</b>: the <b>API server</b> (everything talks to it), <b>etcd</b> (the key-value store holding all cluster state), the <b>scheduler</b> (decides which node runs each pod) and <b>controller managers</b> (the reconciliation loops). Managed services (EKS, GKE, AKS) run this for you.</li>
<li><b>Worker nodes</b>: machines that run your workloads, each with the <b>kubelet</b> (starts containers and reports status), a container runtime (containerd) and <b>kube-proxy</b> (service networking).</li></ul>
<p>A <b>pod</b> is the smallest deployable unit: one or more containers that share a network IP and storage, always scheduled together. Usually one main container per pod, sometimes with helper "sidecar" containers. Pods are disposable; you rarely create them directly, but through controllers like Deployments.</p>
<p><b>kubectl</b> is the command-line client. You mostly <code>apply</code> YAML manifests declaratively and use <code>get</code>, <code>describe</code>, <code>logs</code> and <code>exec</code> to inspect.</p>
<p><b>Namespaces</b> divide a cluster into virtual sections (per team, app or environment) for organisation, access control (RBAC) and resource quotas.</p>`,
      lang: "bash",
      code: `# Local cluster for learning
kind create cluster --name lab          # or: minikube start
kubectl cluster-info
kubectl get nodes -o wide

# Explore what's running
kubectl get pods -A                      # all namespaces (control plane components in kube-system)
kubectl api-resources | head -20         # every kind of object the API knows

# A pod, declaratively
cat <<'EOF' > pod.yaml
apiVersion: v1
kind: Pod
metadata: { name: hello, namespace: demo, labels: { app: hello } }
spec:
  containers:
    - name: web
      image: nginx:1.27
      ports: [ { containerPort: 80 } ]
EOF
kubectl create namespace demo
kubectl apply -f pod.yaml
kubectl get pods -n demo -w              # watch it go Pending -> ContainerCreating -> Running
kubectl describe pod hello -n demo       # events: scheduled to node, image pulled, started
kubectl logs hello -n demo
kubectl exec -it hello -n demo -- sh     # shell inside the container
kubectl port-forward pod/hello 8080:80 -n demo   # http://localhost:8080
kubectl delete pod hello -n demo         # gone for good: nothing recreates a bare pod

kubectl config set-context --current --namespace=demo   # default namespace for later commands`,
      ex: "Create a local cluster with kind or minikube. Deploy a bare pod, inspect it with describe, logs and exec, delete it and note that nothing recreates it. Then list all pods in kube-system and write one sentence on what each control plane component does.",
      q: ["What does the Kubernetes scheduler do?", ["Runs cron jobs", "Chooses which node each new pod should run on, based on resources and constraints", "Stores cluster data", "Builds container images"], 1, "The scheduler assigns pods to nodes; the kubelet on that node then actually starts the containers."]
    },
    {
      t: "Workloads and services",
      sub: ["Deployments and ReplicaSets", "Services and Ingress", "StatefulSets and Jobs", "DaemonSets"],
      body: `<p>Controllers create and manage pods for you:</p>
<ul><li>A <b>Deployment</b> runs N identical, stateless replicas and handles rolling updates. It manages a <b>ReplicaSet</b>, which keeps the right number of pods running. Use it for web apps and APIs.</li>
<li>A <b>StatefulSet</b> gives each pod a stable identity (<code>db-0</code>, <code>db-1</code>) and its own persistent volume, started in order. Use it for databases and clustered systems, though managed databases are usually a better choice.</li>
<li>A <b>Job</b> runs pods to completion (a migration, a batch import); a <b>CronJob</b> runs Jobs on a schedule.</li>
<li>A <b>DaemonSet</b> runs one pod on every node (log collectors, monitoring agents, network plugins).</li></ul>
<p>Pods come and go with changing IPs, so a <b>Service</b> gives a stable name and virtual IP that load-balances to the pods matching a <b>label selector</b>. Types: <code>ClusterIP</code> (internal only, the default), <code>NodePort</code> (a port on every node), <code>LoadBalancer</code> (provisions a cloud load balancer). Inside the cluster, other pods reach it by DNS: <code>http://api.shop.svc.cluster.local</code>, or just <code>http://api</code> from the same namespace.</p>
<p><b>Ingress</b> routes external HTTP/HTTPS traffic by host and path to Services through an ingress controller (ingress-nginx, Traefik, or a cloud controller), with TLS often automated by cert-manager. The newer <b>Gateway API</b> is its more expressive successor.</p>`,
      lang: "yaml",
      code: `apiVersion: apps/v1
kind: Deployment
metadata: { name: api, namespace: shop }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }       # Service and ReplicaSet find pods by these labels
    spec:
      containers:
        - name: api
          image: ghcr.io/pallak-08/forge-api:3f2a91c
          ports: [ { containerPort: 8000 } ]
---
apiVersion: v1
kind: Service
metadata: { name: api, namespace: shop }
spec:
  selector: { app: api }
  ports: [ { port: 80, targetPort: 8000 } ]  # other pods call http://api
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
  namespace: shop
  annotations: { cert-manager.io/cluster-issuer: letsencrypt }
spec:
  ingressClassName: nginx
  tls: [ { hosts: [shop.example.com], secretName: shop-tls } ]
  rules:
    - host: shop.example.com
      http:
        paths:
          - { path: /api, pathType: Prefix, backend: { service: { name: api, port: { number: 80 } } } }
          - { path: /, pathType: Prefix, backend: { service: { name: web, port: { number: 80 } } } }
---
apiVersion: batch/v1
kind: CronJob
metadata: { name: nightly-report, namespace: shop }
spec:
  schedule: "30 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers: [ { name: report, image: ghcr.io/pallak-08/forge-api:3f2a91c, command: ["python", "-m", "jobs.report"] } ]`,
      ex: "Deploy a two-tier app to your local cluster: a Deployment of 3 API replicas with a ClusterIP Service, a front end Deployment, and an Ingress routing /api and / (install ingress-nginx first). Delete an API pod and watch the ReplicaSet replace it; scale to 5 replicas; and add a CronJob that runs every minute and check its logs.",
      q: ["Why do clients talk to a Service rather than directly to pod IP addresses?", ["Pods have no IP addresses", "Pods are replaced often and their IPs change; a Service provides a stable name and load-balances across healthy matching pods", "Services are faster than pods", "It's required for logging"], 1, "Pods are ephemeral. The Service tracks the current set of pods via labels and keeps a constant address for clients."]
    },
    {
      t: "Configuration and secrets",
      sub: ["ConfigMaps", "Secrets", "Resource requests and limits", "Probes"],
      body: `<p>Keep configuration out of images so the same image runs in every environment. <b>ConfigMaps</b> hold non-sensitive settings (feature switches, URLs, config files) and are injected as environment variables or mounted as files. <b>Secrets</b> hold sensitive values (passwords, API keys, TLS certificates) the same way. Note that Secrets are only base64-encoded by default: enable encryption at rest for etcd, restrict access with RBAC, and in production prefer syncing from a real secret manager (External Secrets Operator, Sealed Secrets, or the Secrets Store CSI driver).</p>
<p><b>Resource requests and limits</b>: a <b>request</b> is what the scheduler reserves for the container (CPU in millicores, <code>250m</code> = a quarter core; memory in MiB). A <b>limit</b> is the maximum: exceeding the CPU limit throttles the container; exceeding the memory limit gets it killed (<code>OOMKilled</code>). Always set requests (otherwise scheduling is guesswork) and memory limits; set them from observed usage.</p>
<p><b>Probes</b> tell Kubernetes about container health:</p>
<ul><li><b>Readiness</b>: is it ready for traffic? Failing pods are removed from the Service until they recover. Essential for zero-downtime deploys.</li>
<li><b>Liveness</b>: is it stuck? Failing containers are restarted. Keep it simple, and don't make it depend on the database, or a database blip will restart everything.</li>
<li><b>Startup</b>: gives slow-starting apps time before liveness checks begin.</li></ul>`,
      lang: "yaml",
      code: `apiVersion: v1
kind: ConfigMap
metadata: { name: api-config, namespace: shop }
data:
  LOG_LEVEL: info
  FEATURE_NEW_CHECKOUT: "false"
---
apiVersion: v1
kind: Secret
metadata: { name: api-secrets, namespace: shop }
type: Opaque
stringData:                         # in real setups, synced by External Secrets from a secret manager
  DATABASE_URL: postgresql://app:change-me@db:5432/shop
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: api, namespace: shop }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/pallak-08/forge-api:3f2a91c
          envFrom:
            - configMapRef: { name: api-config }
            - secretRef: { name: api-secrets }
          resources:
            requests: { cpu: 250m, memory: 256Mi }   # reserved for scheduling
            limits:   { memory: 512Mi }              # above this: OOMKilled
          readinessProbe:                            # only receive traffic when ready
            httpGet: { path: /health/ready, port: 8000 }
            periodSeconds: 5
          livenessProbe:                             # restart if the process is stuck
            httpGet: { path: /health/live, port: 8000 }
            initialDelaySeconds: 10
            periodSeconds: 10
          startupProbe:
            httpGet: { path: /health/live, port: 8000 }
            failureThreshold: 30
            periodSeconds: 2

# kubectl top pods -n shop          (needs metrics-server) -> set requests from real usage
# kubectl describe pod <pod> | grep -A3 "Last State"   -> OOMKilled? raise memory or fix the leak`,
      ex: "Add a ConfigMap, a Secret, resource requests and limits, and readiness and liveness probes to your API Deployment. Prove each works: change the ConfigMap and roll the deployment to pick it up; make the readiness endpoint fail and watch the pod leave the Service endpoints (<code>kubectl get endpoints</code>); and set a tiny memory limit to see an OOMKilled restart.",
      q: ["Why shouldn't a liveness probe check the database connection?", ["Databases don't support probes", "If the database has a brief problem, every pod would fail liveness and be restarted at once, turning a blip into an outage", "It is too slow", "Liveness probes can't make network calls"], 1, "Liveness should detect a stuck process. Dependency checks belong in readiness, which just stops traffic temporarily."]
    },
    {
      t: "Scaling and updates",
      sub: ["Horizontal pod autoscaling", "Rolling updates and rollbacks", "Pod disruption budgets", "Cluster autoscaling"],
      body: `<p>The <b>HorizontalPodAutoscaler</b> (HPA) changes the number of replicas based on metrics: by default CPU or memory utilisation relative to requests (which is why requests must be set), or custom metrics like requests per second or queue length. For example, keep average CPU at 60% with between 3 and 20 replicas. KEDA extends this to event sources such as queue depth, including scaling to zero.</p>
<p><b>Rolling updates</b>: changing a Deployment's pod template (usually the image tag) creates a new ReplicaSet and shifts pods over gradually. <code>maxSurge</code> (extra pods allowed during the update) and <code>maxUnavailable</code> (pods that may be down) control the pace; with readiness probes, traffic only goes to new pods once they're ready. <code>kubectl rollout status</code> watches progress, and <code>kubectl rollout undo</code> returns to the previous ReplicaSet.</p>
<p>A <b>PodDisruptionBudget</b> (PDB) protects availability during <i>voluntary</i> disruptions like node upgrades and drains: "keep at least 2 api pods running". Kubernetes then refuses evictions that would break the budget. Spread replicas across nodes and zones with <code>topologySpreadConstraints</code> so one failure doesn't take all of them.</p>
<p>The <b>Cluster Autoscaler</b> (or <b>Karpenter</b> on AWS) adds nodes when pods can't be scheduled for lack of capacity and removes underused nodes. The HPA scales pods; the cluster autoscaler scales the machines under them.</p>`,
      lang: "yaml",
      code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api, namespace: shop }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 60 } }
  behavior:
    scaleDown: { stabilizationWindowSeconds: 300 }   # avoid flapping
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: api, namespace: shop }
spec:
  minAvailable: 2
  selector: { matchLabels: { app: api } }
---
# In the Deployment spec:
#   strategy:
#     type: RollingUpdate
#     rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }    # never drop below desired capacity
#   template.spec.topologySpreadConstraints:
#     - maxSkew: 1
#       topologyKey: topology.kubernetes.io/zone
#       whenUnsatisfiable: ScheduleAnyway
#       labelSelector: { matchLabels: { app: api } }

# Rolling update and rollback
#   kubectl set image deployment/api api=ghcr.io/pallak-08/forge-api:7a91d0 -n shop
#   kubectl rollout status deployment/api -n shop
#   kubectl rollout history deployment/api -n shop
#   kubectl rollout undo deployment/api -n shop
# Load test to watch the HPA react
#   kubectl get hpa api -n shop -w
#   k6 run -e URL=https://shop.example.com/api/products load.js`,
      ex: "On your local cluster, install metrics-server, add an HPA to the API and generate load (k6 or a busybox loop) until it scales up, then watch it scale down. Do a rolling update to a new image with <code>maxUnavailable: 0</code> while a load test runs and check for errors, then roll it back. Add a PDB and try draining a node (on a multi-node kind cluster).",
      q: ["The HPA can't scale your Deployment on CPU even though load is high. What's a likely cause?", ["HPAs only work in the cloud", "The containers have no CPU requests set, so utilisation can't be calculated (or metrics-server isn't installed)", "The Deployment has too many replicas", "Probes are configured"], 1, "CPU utilisation is measured relative to the request. Without requests, or without a metrics source, the HPA has nothing to act on."]
    },
    {
      t: "Helm and the ecosystem",
      sub: ["Helm charts", "Operators", "Service meshes in brief", "Managed Kubernetes (EKS, GKE, AKS)"],
      body: `<p><b>Helm</b> is Kubernetes' package manager. A <b>chart</b> is a set of templated manifests plus a <code>values.yaml</code> of defaults; you install it as a <b>release</b> with your own values. Most third-party software (ingress-nginx, cert-manager, Prometheus, Argo CD, databases) is installed with Helm. You can also chart your own apps, though for simple apps Kustomize overlays are often enough. <code>helm upgrade --install</code> is idempotent, and <code>helm rollback</code> reverts a release.</p>
<p><b>Operators</b> extend Kubernetes with <b>custom resources</b> and controllers that encode operational knowledge for complex software. For example, the CloudNativePG operator lets you declare a <code>Cluster</code> resource with 3 Postgres instances, and it handles replication, failover, backups and upgrades. cert-manager is an operator for certificates.</p>
<p>A <b>service mesh</b> (Istio, Linkerd, Cilium) adds a networking layer between services, giving automatic mTLS encryption and identity between services, retries and timeouts, traffic splitting for canaries, and detailed metrics and traces, without changing app code. It's powerful but adds complexity; adopt one when you have many services and a real need.</p>
<p><b>Managed Kubernetes</b>: <b>EKS</b> (AWS), <b>GKE</b> (Google, including Autopilot, which also manages nodes) and <b>AKS</b> (Azure) run the control plane, handle upgrades and integrate with cloud load balancers, storage, IAM and logging. Running your own control plane is rarely worth it. Plan for regular version upgrades (Kubernetes ships about three minor releases a year), which managed services make far easier.</p>`,
      lang: "bash",
      code: `# Install third-party software with Helm
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx -n ingress --create-namespace
helm upgrade --install cert-manager jetstack/cert-manager -n cert-manager --create-namespace \\
  --set crds.enabled=true
helm list -A

# Your own chart
helm create forge-api            # scaffold: Chart.yaml, values.yaml, templates/
# values-prod.yaml:
#   image: { repository: ghcr.io/pallak-08/forge-api, tag: 3f2a91c }
#   replicaCount: 3
#   resources: { requests: { cpu: 250m, memory: 256Mi }, limits: { memory: 512Mi } }
helm template forge-api ./forge-api -f values-prod.yaml | less    # render before installing
helm upgrade --install forge-api ./forge-api -n shop -f values-prod.yaml
helm history forge-api -n shop
helm rollback forge-api 1 -n shop

# An operator in action: a highly available Postgres from one custom resource
kubectl apply --server-side -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.24/releases/cnpg-1.24.1.yaml
cat <<'EOF' | kubectl apply -f -
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata: { name: shop-db, namespace: shop }
spec:
  instances: 3
  storage: { size: 5Gi }
EOF
kubectl get cluster -n shop -w     # operator creates primary + replicas, handles failover`,
      ex: "Package your API as a Helm chart with values for dev and prod, install it, upgrade it with a new image tag and roll it back with <code>helm rollback</code>. Install the CloudNativePG operator, create a 3-instance Postgres cluster, delete the primary pod and observe automatic failover. Write a paragraph comparing EKS, GKE Autopilot and AKS for a small startup.",
      q: ["What does a Kubernetes operator add?", ["A graphical user interface", "Custom resources plus a controller that automates operating complex software, like failover and backups for databases", "A container runtime", "A replacement for kubectl"], 1, "Operators encode human operational knowledge into a controller, so you declare what you want and it handles the day-2 operations."]
    }
  ]
});

COURSE.push({
  n: 53, id: "observability-lessons", fills: "observability", title: "Observability and reliability", level: 3,
  blurb: "Metrics, logs, traces and the SRE practices that use them.",
  lessons: [
    {
      t: "Metrics with Prometheus and Grafana",
      sub: ["Metric types", "PromQL basics", "Dashboards", "The RED and USE methods"],
      body: `<p><b>Metrics</b> are numbers measured over time: cheap to store, fast to query and ideal for dashboards and alerts. <b>Prometheus</b> scrapes metrics over HTTP from your apps and infrastructure every few seconds and stores them as time series identified by a name and labels, such as <code>http_requests_total{method="GET", route="/orders", status="200"}</code>.</p>
<p>Metric types:</p>
<ul><li><b>Counter</b>: only goes up (requests served, errors). You almost always look at its rate.</li>
<li><b>Gauge</b>: goes up and down (memory in use, queue length, active connections).</li>
<li><b>Histogram</b>: counts observations in buckets (request durations), so you can compute percentiles like p95 across many instances.</li></ul>
<p>Keep label values low-cardinality: route templates, not full URLs; never user IDs. Each unique label combination is a new time series.</p>
<p><b>PromQL</b> essentials: <code>rate(http_requests_total[5m])</code> gives per-second rates; <code>sum by (route) (...)</code> aggregates; dividing error rate by total rate gives an error ratio; <code>histogram_quantile(0.95, ...)</code> gives p95 latency.</p>
<p><b>Grafana</b> builds dashboards on Prometheus (and many other sources). Two methods tell you what to put on them:</p>
<ul><li><b>RED</b> for services: <b>R</b>ate (requests per second), <b>E</b>rrors (failed requests per second or %), <b>D</b>uration (latency percentiles).</li>
<li><b>USE</b> for resources: <b>U</b>tilisation, <b>S</b>aturation (queued work), <b>E</b>rrors, for CPU, memory, disk and network.</li></ul>`,
      lang: "python",
      code: `# Instrument a FastAPI app (pip install prometheus-client)
import time
from fastapi import FastAPI, Request
from prometheus_client import Counter, Histogram, Gauge, make_asgi_app

app = FastAPI()
app.mount("/metrics", make_asgi_app())            # Prometheus scrapes this endpoint

REQUESTS = Counter("http_requests_total", "HTTP requests", ["method", "route", "status"])
LATENCY = Histogram("http_request_duration_seconds", "Request latency", ["route"],
                    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5])
IN_FLIGHT = Gauge("http_requests_in_flight", "Requests being served")

@app.middleware("http")
async def metrics(request: Request, call_next):
    route = request.scope.get("route").path if request.scope.get("route") else "unmatched"
    IN_FLIGHT.inc(); start = time.perf_counter()
    try:
        response = await call_next(request)
    finally:
        IN_FLIGHT.dec()
    route = request.scope["route"].path if request.scope.get("route") else route  # "/orders/{id}", not "/orders/42"
    LATENCY.labels(route).observe(time.perf_counter() - start)
    REQUESTS.labels(request.method, route, str(response.status_code)).inc()
    return response

# --- PromQL for a RED dashboard ---
# Rate:      sum(rate(http_requests_total[5m]))
# Errors %:  100 * sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
# p95:       histogram_quantile(0.95, sum by (le, route) (rate(http_request_duration_seconds_bucket[5m])))
# USE (node exporter):
#   CPU:     1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))
#   Memory:  1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes`,
      ex: "Instrument an API with request counters and latency histograms, run Prometheus and Grafana with Docker Compose (plus node-exporter), and build a dashboard with RED panels per route and USE panels for the host. Generate load with k6, including an endpoint that sometimes fails or sleeps, and confirm the dashboard shows it.",
      q: ["Why shouldn't you use user IDs as a metric label?", ["Prometheus doesn't allow numbers", "Each unique label value creates a new time series; high-cardinality labels explode storage and slow queries", "It's against privacy law in every case", "Labels must be booleans"], 1, "Metrics are for aggregates. Per-user detail belongs in logs or traces, which are designed for high-cardinality data."]
    },
    {
      t: "Logs and traces",
      sub: ["Centralised logging", "Structured logs", "Distributed tracing with OpenTelemetry", "Correlation ids"],
      body: `<p>Metrics tell you <i>that</i> something is wrong; logs and traces tell you <i>why</i>.</p>
<p><b>Centralised logging</b>: with many containers that come and go, logs must leave the machines. Apps write to stdout; an agent (Fluent Bit, Vector, the OpenTelemetry Collector, Promtail) ships them to a backend: Loki, Elasticsearch/OpenSearch, CloudWatch Logs, Datadog. Set retention per log type to control cost.</p>
<p><b>Structured logs</b> are JSON objects with consistent fields (<code>timestamp</code>, <code>level</code>, <code>message</code>, <code>service</code>, <code>request_id</code>, <code>user_id</code>, <code>duration_ms</code>) instead of free text, so you can filter and aggregate: "all errors for tenant 42 on /checkout in the last hour". Log events and context, not secrets or full personal data. Use levels deliberately: ERROR for things someone should look at, INFO for significant events, DEBUG off in production.</p>
<p><b>Distributed tracing</b> follows a single request across services. A <b>trace</b> is a tree of <b>spans</b>, one per operation (HTTP handler, database query, call to another service, LLM call), each with timing and attributes. A trace view shows exactly where a slow request spent its time. Trace context propagates between services in the W3C <code>traceparent</code> header.</p>
<p><b>OpenTelemetry</b> (OTel) is the vendor-neutral standard for traces, metrics and logs: SDKs and auto-instrumentation for most languages and frameworks, exporting to any backend (Jaeger, Tempo, Honeycomb, Datadog, cloud services).</p>
<p><b>Correlation IDs</b> tie it all together: put the request or trace ID in every log line and return it in a response header, so a user's error report leads straight to the logs and the trace.</p>`,
      lang: "python",
      code: `# pip install structlog opentelemetry-distro opentelemetry-exporter-otlp
#            opentelemetry-instrumentation-fastapi opentelemetry-instrumentation-sqlalchemy
import structlog, uuid
from fastapi import FastAPI, Request
from opentelemetry import trace

structlog.configure(processors=[
    structlog.contextvars.merge_contextvars,          # adds request-scoped fields to every line
    structlog.processors.add_log_level,
    structlog.processors.TimeStamper(fmt="iso"),
    structlog.processors.JSONRenderer(),
])
log = structlog.get_logger(service="orders-api")
tracer = trace.get_tracer("orders-api")
app = FastAPI()

@app.middleware("http")
async def correlation(request: Request, call_next):
    span = trace.get_current_span()
    trace_id = format(span.get_span_context().trace_id, "032x")
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    structlog.contextvars.bind_contextvars(request_id=request_id, trace_id=trace_id,
                                           route=request.url.path)
    response = await call_next(request)
    response.headers["x-request-id"] = request_id     # user can quote this in a bug report
    structlog.contextvars.clear_contextvars()
    return response

@app.post("/orders")
async def create_order(order: dict):
    with tracer.start_as_current_span("price_order") as span:   # custom span inside the trace
        span.set_attribute("order.items", len(order.get("items", [])))
        total = await price(order)
    log.info("order_created", total=total, items=len(order["items"]))
    return {"total": total}

# Run with auto-instrumentation (HTTP, DB, outgoing calls get spans automatically):
#   OTEL_SERVICE_NAME=orders-api OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 \\
#   opentelemetry-instrument uvicorn main:app
# Output line:
# {"service":"orders-api","request_id":"9b1f...","trace_id":"4bf92f...","event":"order_created","total":1499,...}`,
      ex: "Add structured JSON logging with request and trace IDs to two small services where one calls the other. Instrument both with OpenTelemetry and send traces to Jaeger (one Docker container). Make one database query slow and use the trace view to find it, then use the trace ID to find the matching log lines.",
      q: ["What problem does distributed tracing solve that logs alone handle poorly?", ["Storing passwords", "Seeing how a single request flows through many services and where its time is spent", "Counting total requests", "Compressing logs"], 1, "A trace links every span of one request across services with timings, so you can pinpoint the slow or failing hop."]
    },
    {
      t: "SRE practices",
      sub: ["SLIs, SLOs and error budgets", "Actionable alerting", "Incident response and on-call", "Blameless postmortems"],
      body: `<p><b>Site reliability engineering</b> (SRE) treats reliability as an engineering problem with measurable targets.</p>
<p>An <b>SLI</b> (service level indicator) measures what users experience: the share of requests that succeed, or that complete in under 300 ms. An <b>SLO</b> (objective) is the target for an SLI over a window: "99.9% of checkout requests succeed over 30 days". 100% is the wrong target: it's impossibly expensive and users can't tell the difference beyond a point. An <b>SLA</b> is a contractual promise with penalties, set looser than the SLO.</p>
<p>The <b>error budget</b> is what the SLO allows to fail: 99.9% over 30 days is about 43 minutes of full downtime, or the equivalent in failed requests. When there's budget left, ship features and take risks; when it's spent, prioritise reliability work. This turns "move fast" versus "be stable" arguments into a shared, data-based decision.</p>
<p><b>Actionable alerting</b>: page a human only when users are affected or soon will be, and when there's something they can do. Alert on symptoms (SLO burn rate, error rate, latency) rather than causes like high CPU. <b>Burn-rate alerts</b> fire when the error budget is being consumed too fast (fast burn: page now; slow burn: ticket). Every alert needs a runbook link. Noisy alerts cause fatigue and get ignored.</p>
<p><b>On-call</b> needs a sustainable rotation, clear escalation, runbooks and handovers. During incidents, restore service first (roll back, fail over, scale) and find the root cause after. Follow every significant incident with a <b>blameless postmortem</b>: timeline, impact, contributing factors, what went well and badly, and action items with owners, focusing on how the system allowed the failure rather than who caused it.</p>`,
      lang: "yaml",
      code: `# SLO: 99.9% of checkout requests succeed over 30 days
# Error budget = 0.1% of requests. Burn rate 1 = spending exactly the budget over 30 days.

# Prometheus recording rule: error ratio over several windows
groups:
  - name: checkout-slo
    rules:
      - record: checkout:error_ratio:rate5m
        expr: |
          sum(rate(http_requests_total{route="/checkout",status=~"5.."}[5m]))
          / sum(rate(http_requests_total{route="/checkout"}[5m]))
      - record: checkout:error_ratio:rate1h
        expr: |
          sum(rate(http_requests_total{route="/checkout",status=~"5.."}[1h]))
          / sum(rate(http_requests_total{route="/checkout"}[1h]))

  - name: checkout-alerts
    rules:
      # Fast burn: at this rate the whole 30-day budget is gone in ~2 days -> page
      - alert: CheckoutErrorBudgetFastBurn
        expr: checkout:error_ratio:rate1h > (14.4 * 0.001) and checkout:error_ratio:rate5m > (14.4 * 0.001)
        for: 2m
        labels: { severity: page }
        annotations:
          summary: "Checkout failing fast: error budget burning at >14x"
          runbook: "https://runbooks.example.com/checkout-errors"
      # Slow burn: ~10% of budget per 3 days -> ticket, not a page
      - alert: CheckoutErrorBudgetSlowBurn
        expr: checkout:error_ratio:rate1h > (1 * 0.001)
        for: 1h
        labels: { severity: ticket }

# Budget math
#   30 days x 24 h x 60 min x 0.1% = 43.2 minutes of total outage allowed per 30 days
#   99%    -> 7.2 hours      99.99% -> 4.3 minutes`,
      ex: "Define two SLIs and SLOs for an app you've built (availability and latency), calculate the monthly error budget for each, and implement Prometheus recording rules and fast and slow burn-rate alerts with runbook links. Write a runbook for one alert, then cause an incident on purpose (break a dependency) and write a blameless postmortem.",
      q: ["Why is 100% usually the wrong SLO target?", ["Monitoring tools can't measure 100%", "It's extremely costly, blocks all change, and users can't distinguish it from very high reliability, since their own networks and devices fail more often", "SLOs must be below 90%", "100% is the SLA, not the SLO"], 1, "Each extra nine costs much more. An appropriate SLO leaves an error budget that lets teams ship changes at a sustainable pace."]
    }
  ]
});
