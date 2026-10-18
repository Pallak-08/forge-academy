/* Forge Academy lessons: sessions and OAuth, account security, AWS fundamentals, cloud security */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 39, id: "auth-lessons", fills: "auth", title: "Authentication and authorisation", level: 2,
  blurb: "Sessions, cookies, OAuth, MFA and account recovery done right.",
  lessons: [
    {
      t: "Sessions, cookies and OAuth",
      sub: ["Session cookies vs tokens", "Cookie flags: HttpOnly, Secure, SameSite", "OAuth 2.0 and OpenID Connect", "Sign in with Google/GitHub"],
      body: `<p>After login, the server must recognise the user on every later request. Two common approaches:</p>
<ul><li><b>Server sessions</b>: the server stores session data (in Redis or a database) and gives the browser a random session ID in a cookie. Easy to revoke (delete the session), and the cookie reveals nothing. The usual choice for web apps.</li>
<li><b>Tokens</b> (often JWTs): the server signs a token containing the user's identity and the client sends it in an <code>Authorization</code> header. No server lookup needed, which suits APIs and mobile apps, but tokens can't be revoked before expiry without extra machinery, so keep them short-lived.</li></ul>
<p>Cookie flags matter: <b>HttpOnly</b> stops JavaScript from reading the cookie (so an XSS bug can't steal it); <b>Secure</b> sends it only over HTTPS; <b>SameSite=Lax</b> stops most cross-site requests from carrying it (CSRF protection); <b>Strict</b> is stronger but breaks some flows. Also set a sensible <code>Max-Age</code> and a narrow <code>Path</code>.</p>
<p><b>OAuth 2.0</b> is about <i>authorisation delegation</i>: letting an app act on your behalf at another service (read your GitHub repos) without giving it your password. <b>OpenID Connect</b> (OIDC) adds <i>authentication</i> on top: an ID token that says who the user is. "Sign in with Google" is OIDC.</p>
<p>For web and mobile apps, use the <b>Authorization Code flow with PKCE</b>: the app redirects to the provider, the user consents, the provider redirects back with a one-time code, and your server exchanges the code (plus the PKCE verifier) for tokens. Always check the <code>state</code> parameter, validate the ID token's signature, issuer, audience and expiry, and match users by the provider's stable <code>sub</code> ID, not by email alone. In practice, use a well-maintained library or an auth service (Auth.js, Authlib, Clerk, Auth0, Supabase Auth) rather than hand-rolling the flow.</p>`,
      lang: "python",
      code: `# "Sign in with GitHub" in FastAPI with Authlib (pip install authlib httpx itsdangerous)
from fastapi import FastAPI, Request
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from fastapi.responses import RedirectResponse
import os

app = FastAPI()
# signed session cookie: HttpOnly by default; set Secure and SameSite explicitly
app.add_middleware(SessionMiddleware, secret_key=os.environ["SESSION_SECRET"],
                   https_only=True, same_site="lax", max_age=60 * 60 * 8)

oauth = OAuth()
oauth.register(
    name="github",
    client_id=os.environ["GITHUB_CLIENT_ID"],
    client_secret=os.environ["GITHUB_CLIENT_SECRET"],
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",
    client_kwargs={"scope": "read:user user:email", "code_challenge_method": "S256"},  # PKCE
)

@app.get("/login")
async def login(request: Request):
    # Authlib generates and stores 'state' and the PKCE verifier in the session
    return await oauth.github.authorize_redirect(request, request.url_for("callback"))

@app.get("/auth/callback")
async def callback(request: Request):
    token = await oauth.github.authorize_access_token(request)   # checks state, swaps code
    profile = (await oauth.github.get("user", token=token)).json()
    request.session.clear()                                      # fresh session at login
    request.session["user_id"] = upsert_user(provider="github", sub=str(profile["id"]),
                                             name=profile["login"])
    return RedirectResponse("/dashboard")

@app.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/", status_code=303)`,
      ex: "Add 'Sign in with GitHub' (or Google) to a small app using a library. Store users by provider + subject ID, set the session cookie flags explicitly, and verify in DevTools → Application → Cookies that HttpOnly, Secure and SameSite are set. Then explain in five sentences the difference between OAuth 2.0 and OpenID Connect.",
      q: ["Why should the session cookie be HttpOnly?", ["It makes the cookie smaller", "JavaScript can't read it, so an XSS bug can't steal the session", "It allows the cookie over HTTP", "It disables CSRF"], 1, "HttpOnly doesn't prevent XSS, but it stops injected scripts from simply reading and exfiltrating the session token."]
    },
    {
      t: "Multi-factor and account security",
      sub: ["TOTP two-factor", "Password reset flows", "Account lockout", "Passkeys overview"],
      body: `<p><b>Multi-factor authentication</b> combines something you know (password) with something you have (phone, security key) or are (biometrics). It blocks the vast majority of account takeovers from stolen or reused passwords.</p>
<p><b>TOTP</b> (authenticator apps like Google Authenticator or Authy) works from a shared secret: at enrolment the server generates a random secret and shows it as a QR code; both sides then compute a 6-digit code from the secret and the current 30-second time window. Store the secret encrypted, allow one window of clock drift, prevent reuse of the same code, and issue one-time <b>recovery codes</b> (stored hashed). SMS codes are better than nothing but vulnerable to SIM swapping.</p>
<p><b>Password reset</b> is a common weak spot. A safe flow: always respond "if that email exists, we've sent a link" (no account enumeration); generate a long random single-use token; store only its hash with a short expiry (15–60 minutes); invalidate it after use; on reset, end all existing sessions and notify the user by email.</p>
<p><b>Lockout and rate limiting</b>: permanently locking accounts after N failures lets anyone lock out your users. Better: rate-limit attempts per account and per IP with growing delays, add a CAPTCHA after several failures, check new passwords against breached-password lists (Have I Been Pwned's k-anonymity API), and alert users about new-device logins.</p>
<p><b>Passkeys</b> (WebAuthn/FIDO2) replace passwords with a key pair stored on the device and unlocked by fingerprint, face or PIN. The private key never leaves the device, there's nothing to reuse or leak from your database, and signatures only work for the real domain, so passkeys are <b>phishing-resistant</b>. Use a library (SimpleWebAuthn, py_webauthn) for the ceremony.</p>`,
      lang: "python",
      code: `# pip install pyotp argon2-cffi
import pyotp, secrets, hashlib, time
from argon2 import PasswordHasher

# --- TOTP enrolment ---
secret = pyotp.random_base32()                      # store encrypted, per user
uri = pyotp.TOTP(secret).provisioning_uri(name="asha@example.com", issuer_name="Forge Academy")
print(uri)  # render as a QR code for the authenticator app

def verify_totp(secret: str, code: str, last_used_step: int) -> tuple[bool, int]:
    totp = pyotp.TOTP(secret)
    step = int(time.time() // 30)
    for s in (step - 1, step, step + 1):            # allow +/- one window of clock drift
        if s > last_used_step and totp.at(s * 30) == code:
            return True, s                          # remember s to block replay
    return False, last_used_step

# --- Recovery codes: show once, store hashed ---
ph = PasswordHasher()
codes = [secrets.token_hex(5) for _ in range(10)]
stored = [ph.hash(c) for c in codes]

# --- Password reset token ---
def create_reset_token(user_id: int) -> str:
    token = secrets.token_urlsafe(32)               # sent in the email link
    db.execute("INSERT INTO resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
               (user_id, hashlib.sha256(token.encode()).hexdigest(), time.time() + 1800))
    return token

def use_reset_token(token: str, new_password: str):
    h = hashlib.sha256(token.encode()).hexdigest()
    row = db.fetch_one("SELECT user_id FROM resets WHERE token_hash = ? AND expires_at > ? AND used = 0",
                       (h, time.time()))
    if not row:
        raise ValueError("invalid or expired link")
    db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (ph.hash(new_password), row.user_id))
    db.execute("UPDATE resets SET used = 1 WHERE token_hash = ?", (h,))
    db.execute("DELETE FROM sessions WHERE user_id = ?", (row.user_id,))   # log out everywhere`,
      ex: "Add TOTP two-factor to an app with login: enrolment with a QR code, verification with drift and replay protection, and ten hashed recovery codes. Then implement the password reset flow above and write tests for: expired token, reused token, unknown email (same response) and sessions being cleared after reset.",
      q: ["Why should a 'forgot password' form give the same response whether or not the email exists?", ["To save server time", "To avoid revealing which emails have accounts (account enumeration)", "Because email delivery is slow", "It is required by SMTP"], 1, "Different responses let attackers test lists of emails to learn who uses the service, which helps targeted phishing and credential stuffing."]
    }
  ]
});

COURSE.push({
  n: 40, id: "cloud-aws-lessons", fills: "cloud-aws", title: "Cloud fundamentals with AWS", level: 2,
  blurb: "IAM, compute, storage, networking and cost on the most widely used cloud.",
  lessons: [
    {
      t: "Cloud concepts and IAM",
      sub: ["Regions and availability zones", "Shared responsibility", "IAM users, roles and policies", "Least privilege", "MFA and the root account"],
      body: `<p>AWS runs in <b>regions</b> (geographic areas such as <code>ap-south-1</code> Mumbai and <code>ap-south-2</code> Hyderabad), each with several <b>availability zones</b> (AZs): separate data centres with independent power and networking. Spreading an app across two or more AZs keeps it running if one fails. Choose regions by user latency, service availability, price and data-residency rules.</p>
<p><b>Shared responsibility</b>: AWS secures the cloud itself (hardware, facilities, the hypervisor); you secure what you put in it (your data, IAM, OS patching on EC2, network rules, encryption settings). Most cloud breaches are customer misconfigurations, not AWS failures.</p>
<p><b>IAM</b> controls who can do what:</p>
<ul><li><b>Users</b>: long-term identities for people. In organisations, prefer <b>IAM Identity Center</b> (SSO) so people sign in with company accounts and get temporary credentials.</li>
<li><b>Roles</b>: identities that services and people <i>assume</i> to get temporary credentials. EC2 instances, Lambda functions and CI pipelines should use roles, never stored access keys.</li>
<li><b>Policies</b>: JSON documents listing allowed (or denied) actions on resources, optionally with conditions. Everything is denied unless a policy allows it, and an explicit deny always wins.</li></ul>
<p><b>Least privilege</b>: grant specific actions on specific resources (read one bucket, not <code>s3:*</code> on <code>*</code>). Start narrow and widen when needed; IAM Access Analyzer can generate policies from actual usage.</p>
<p>The <b>root account</b> (the signup email) can do anything, including closing the account. Secure it on day one: strong unique password, MFA (ideally a hardware key or passkey), no access keys, and use it only for the few tasks that require it.</p>`,
      lang: "json",
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadWriteOnlyThisAppsUploads",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::forge-uploads-prod/users/*"
    },
    {
      "Sid": "ListOnlyThatPrefix",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::forge-uploads-prod",
      "Condition": { "StringLike": { "s3:prefix": ["users/*"] } }
    },
    {
      "Sid": "DenyUnencryptedTransport",
      "Effect": "Deny",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::forge-uploads-prod", "arn:aws:s3:::forge-uploads-prod/*"],
      "Condition": { "Bool": { "aws:SecureTransport": "false" } }
    }
  ]
}

// CLI: who am I, and use a role instead of keys
// aws sts get-caller-identity
// aws configure sso                       (sign in through IAM Identity Center)
// aws iam simulate-principal-policy --policy-source-arn <role-arn> \\
//     --action-names s3:DeleteObject --resource-arns arn:aws:s3:::forge-uploads-prod/users/a.txt`,
      ex: "Create a free-tier AWS account. Secure root with MFA and create a billing alarm first. Set up IAM Identity Center with your own admin user, then create a role that can only read and write one S3 prefix. Prove with <code>aws iam simulate-principal-policy</code> or real calls that it can't delete objects or touch other buckets.",
      q: ["An EC2 instance needs to read from S3. What's the right way to give it access?", ["Copy an IAM user's access keys onto the server", "Attach an IAM role with a narrowly scoped policy to the instance", "Make the bucket public", "Use the root account's keys"], 1, "A role provides automatically rotated temporary credentials to the instance, with nothing long-lived to leak."]
    },
    {
      t: "Compute",
      sub: ["EC2 instances", "Auto Scaling groups", "Containers: ECS / Fargate", "Serverless with Lambda"],
      body: `<p><b>EC2</b> gives you virtual machines. You choose an instance type (CPU and memory, for example <code>t3.micro</code> or <code>m7g.large</code>; the "g" means Graviton ARM processors, often cheaper), an AMI (the OS image), storage, a security group and an IAM role. You are responsible for patching the OS. Prefer <b>SSM Session Manager</b> over opening SSH to the internet.</p>
<p>An <b>Auto Scaling group</b> keeps a fleet of identical instances from a launch template: it replaces unhealthy instances automatically and adds or removes instances based on load (for example keep average CPU near 50%). Behind a load balancer across several AZs, this gives high availability without manual work.</p>
<p><b>ECS</b> runs Docker containers. With <b>Fargate</b> you don't manage servers at all: you define a task (image, CPU, memory, environment, IAM task role) and a service that keeps N copies running behind a load balancer. <b>EKS</b> is managed Kubernetes for teams that need it.</p>
<p><b>Lambda</b> runs functions in response to events (HTTP requests via API Gateway or function URLs, S3 uploads, queue messages, schedules). You pay per request and per millisecond, and it scales to zero. Limits to know: maximum 15-minute runs, cold starts after idle periods, and stateless execution, so keep state in databases or S3.</p>
<p>Rough guide: Lambda for event-driven and spiky workloads; Fargate for always-on containerised services; EC2 when you need full control, special hardware (GPUs) or the lowest cost at steady high load.</p>`,
      lang: "python",
      code: `# A Lambda function triggered when an image lands in S3: creates a thumbnail
# handler.py  (package Pillow as a Lambda layer)
import boto3, io, urllib.parse
from PIL import Image

s3 = boto3.client("s3")          # created once per container, reused across invocations

def handler(event, context):
    for record in event["Records"]:
        bucket = record["s3"]["bucket"]["name"]
        key = urllib.parse.unquote_plus(record["s3"]["object"]["key"])
        if key.startswith("thumbs/"):
            continue                                  # avoid triggering ourselves forever
        img = Image.open(io.BytesIO(s3.get_object(Bucket=bucket, Key=key)["Body"].read()))
        img.thumbnail((256, 256))
        out = io.BytesIO(); img.save(out, format="PNG")
        s3.put_object(Bucket=bucket, Key=f"thumbs/{key.rsplit('/', 1)[-1]}.png",
                      Body=out.getvalue(), ContentType="image/png")
    return {"ok": True}

# EC2 from the CLI, without opening SSH:
#   aws ec2 run-instances --image-id resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \\
#     --instance-type t3.micro --iam-instance-profile Name=ssm-managed --subnet-id subnet-abc \\
#     --security-group-ids sg-noinbound --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=lab}]'
#   aws ssm start-session --target i-0123456789abcdef0`,
      ex: "Deploy the same tiny 'hello' web app three ways: on an EC2 instance (accessed via Session Manager, no SSH port), as an ECS Fargate service, and as a Lambda function URL. For each, note setup time, how it scales, and the estimated monthly cost from the AWS pricing calculator at 100,000 requests a month. Delete everything afterwards.",
      q: ["A job runs for 40 minutes every night. Which is a poor fit?", ["An ECS Fargate scheduled task", "AWS Lambda", "An EC2 instance started on a schedule", "AWS Batch"], 1, "Lambda invocations are capped at 15 minutes. Long jobs belong in Fargate tasks, Batch or EC2."]
    },
    {
      t: "Storage and databases",
      sub: ["S3 buckets and policies", "EBS and EFS", "RDS and Aurora", "DynamoDB basics"],
      body: `<p><b>S3</b> stores objects (files) in buckets, with practically unlimited capacity and very high durability. It's used for uploads, backups, static websites, data lakes and logs. Key settings: <b>Block Public Access</b> on (the default; leave it on unless serving public files, ideally through CloudFront instead), default encryption, versioning for important data, lifecycle rules to move old objects to cheaper classes (Infrequent Access, Glacier) or delete them, and bucket policies for access. Give users temporary access to private files with <b>presigned URLs</b>.</p>
<p><b>EBS</b> volumes are block storage disks attached to one EC2 instance in one AZ; snapshot them for backups. <b>EFS</b> is a managed network file system several instances can mount at once.</p>
<p><b>RDS</b> runs managed relational databases (PostgreSQL, MySQL, MariaDB, SQL Server, Oracle): AWS handles provisioning, patching, automated backups with point-in-time restore, and <b>Multi-AZ</b> standby failover. Read replicas offload read traffic. <b>Aurora</b> is AWS's PostgreSQL- and MySQL-compatible engine with storage replicated across AZs and faster failover; Aurora Serverless scales capacity automatically. Put databases in private subnets, never publicly accessible.</p>
<p><b>DynamoDB</b> is a serverless key-value and document database with single-digit-millisecond latency at any scale and pay-per-request pricing. You design tables around access patterns: a <b>partition key</b> (and optional <b>sort key</b>) determines how items are stored and queried, and secondary indexes add extra query patterns. Great for high-scale, predictable lookups; awkward for ad-hoc queries and joins, where a relational database is better.</p>`,
      lang: "python",
      code: `import boto3
s3 = boto3.client("s3")
BUCKET = "forge-uploads-prod"

# Upload privately, then share for 10 minutes with a presigned URL
s3.upload_file("report.pdf", BUCKET, "users/42/report.pdf",
               ExtraArgs={"ContentType": "application/pdf", "ServerSideEncryption": "aws:kms"})
url = s3.generate_presigned_url("get_object", Params={"Bucket": BUCKET, "Key": "users/42/report.pdf"},
                                ExpiresIn=600)

# Let the browser upload directly to S3 (your server never handles the bytes)
post = s3.generate_presigned_post(BUCKET, "users/42/\${filename}",
                                  Conditions=[["content-length-range", 1, 10_000_000]], ExpiresIn=300)

# Lifecycle: move logs to cheaper storage after 30 days, delete after a year
s3.put_bucket_lifecycle_configuration(Bucket="forge-logs", LifecycleConfiguration={"Rules": [{
    "ID": "age-out", "Status": "Enabled", "Filter": {"Prefix": "app/"},
    "Transitions": [{"Days": 30, "StorageClass": "STANDARD_IA"}], "Expiration": {"Days": 365}}]})

# DynamoDB: table designed for "get all orders of a customer, newest first"
ddb = boto3.resource("dynamodb")
orders = ddb.Table("orders")           # partition key: customer_id, sort key: created_at
orders.put_item(Item={"customer_id": "c42", "created_at": "2026-10-18T10:15:00Z", "total": 1499, "status": "paid"})
from boto3.dynamodb.conditions import Key
resp = orders.query(KeyConditionExpression=Key("customer_id").eq("c42"), ScanIndexForward=False, Limit=10)
print(resp["Items"])`,
      ex: "Build a small file-sharing backend: browser uploads go straight to a private S3 bucket via presigned POST, downloads use 10-minute presigned URLs, metadata goes into DynamoDB (designed for 'list my files, newest first'), and a lifecycle rule deletes files after 30 days. Confirm with the S3 console that Block Public Access is on and objects are encrypted.",
      q: ["Your app needs complex reporting queries with joins across customers, orders and products. Which fits best?", ["DynamoDB", "RDS or Aurora PostgreSQL", "S3 alone", "EBS"], 1, "Relational databases excel at ad-hoc queries and joins. DynamoDB is designed for known, key-based access patterns at scale."]
    },
    {
      t: "Networking in the cloud",
      sub: ["VPCs and subnets", "Security groups and NACLs", "Load balancers", "Route 53 DNS", "CloudFront CDN"],
      body: `<p>A <b>VPC</b> is your private network in a region, with a CIDR range such as <code>10.0.0.0/16</code>. You divide it into <b>subnets</b>, each in one AZ. A <b>public subnet</b> has a route to an Internet Gateway; resources there can have public IPs (load balancers, bastions). A <b>private subnet</b> has no direct internet route; app servers and databases go there, and reach the internet for updates through a <b>NAT gateway</b> (which costs money per hour and per GB; VPC endpoints for S3 and DynamoDB avoid some of that traffic).</p>
<p><b>Security groups</b> are stateful firewalls on each resource, allow-rules only, and can reference other security groups. <b>Network ACLs</b> are stateless, apply to whole subnets and support deny rules; most teams rely on security groups and leave NACLs at defaults.</p>
<p><b>Elastic Load Balancing</b>: the <b>Application Load Balancer</b> (layer 7) routes HTTP/HTTPS by host and path, terminates TLS with free ACM certificates and health-checks targets across AZs. The <b>Network Load Balancer</b> (layer 4) handles TCP/UDP at very high throughput with static IPs.</p>
<p><b>Route 53</b> is AWS's DNS service: hosted zones for your domains, alias records that point at load balancers and CloudFront, health checks, and routing policies (weighted, latency-based, failover).</p>
<p><b>CloudFront</b> is the CDN: it caches content at edge locations worldwide, terminates HTTPS close to users and can front S3 (with Origin Access Control so the bucket stays private) or your load balancer. AWS WAF attaches to CloudFront or the ALB to filter malicious requests.</p>`,
      lang: "hcl",
      code: `# Terraform: a two-AZ VPC with public and private subnets (using the community module)
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "forge-prod"
  cidr = "10.0.0.0/16"
  azs             = ["ap-south-1a", "ap-south-1b"]
  public_subnets  = ["10.0.0.0/24", "10.0.1.0/24"]     # ALB lives here
  private_subnets = ["10.0.10.0/24", "10.0.11.0/24"]   # apps and databases
  enable_nat_gateway = true
  single_nat_gateway = true                            # cheaper for labs; one per AZ in prod
}

resource "aws_security_group" "alb" {
  vpc_id = module.vpc.vpc_id
  ingress { from_port = 443, to_port = 443, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }
  egress  { from_port = 0, to_port = 0, protocol = "-1", cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_security_group" "app" {
  vpc_id = module.vpc.vpc_id
  ingress {                       # only the load balancer may reach the app
    from_port = 8000, to_port = 8000, protocol = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress { from_port = 0, to_port = 0, protocol = "-1", cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_route53_record" "app" {
  zone_id = var.zone_id
  name    = "app.example.com"
  type    = "A"
  alias { name = aws_lb.main.dns_name, zone_id = aws_lb.main.zone_id, evaluate_target_health = true }
}`,
      ex: "Draw (then build with Terraform or the console) a VPC across two AZs with public and private subnets, an ALB in the public subnets, two app instances or Fargate tasks in private subnets and an RDS database in private subnets. Chain security groups ALB → app → DB, and confirm the database has no public IP and can't be reached from your laptop.",
      q: ["Servers in a private subnet need to download OS updates from the internet. What provides this without making them reachable from the internet?", ["An Internet Gateway attached to the private subnet", "A NAT gateway in a public subnet", "Route 53", "A security group allowing 0.0.0.0/0 inbound"], 1, "A NAT gateway lets private resources start outbound connections while blocking unsolicited inbound connections."]
    },
    {
      t: "Cost, monitoring and well-architected design",
      sub: ["Billing alerts and budgets", "CloudWatch", "The Well-Architected pillars", "Cleaning up resources"],
      body: `<p>Cloud bills surprise people: a forgotten NAT gateway, an oversized database or a large instance left running can cost thousands of rupees a month. On day one, create an <b>AWS Budget</b> with email alerts (for example at 50%, 80% and 100% of a small monthly amount), and check <b>Cost Explorer</b> weekly, grouped by service. Tag every resource (<code>project</code>, <code>env</code>, <code>owner</code>) so costs can be traced.</p>
<p><b>CloudWatch</b> is AWS's monitoring service: <b>metrics</b> (CPU, request counts, latency, plus your own custom metrics), <b>logs</b> (from Lambda, ECS, EC2 agents; searchable with Logs Insights), <b>alarms</b> that notify via SNS or trigger scaling, and dashboards. Alarm on symptoms users feel: error rate, latency, queue backlog, not just CPU.</p>
<p>The <b>AWS Well-Architected Framework</b> has six pillars: <b>operational excellence</b> (automation, runbooks, small reversible changes), <b>security</b>, <b>reliability</b> (multi-AZ, backups, tested recovery), <b>performance efficiency</b> (right services and sizes), <b>cost optimisation</b> (pay only for what you need, right-size, use savings plans for steady load) and <b>sustainability</b>. Use it as a checklist when reviewing a design.</p>
<p><b>Clean up</b> after experiments: terminate instances, delete NAT gateways, load balancers, unattached EBS volumes, old snapshots, Elastic IPs and idle RDS instances. Infrastructure as code makes this one command (<code>terraform destroy</code>), which is another reason to use it even for labs.</p>`,
      lang: "bash",
      code: `# Monthly budget with an email alert at 80% (amount in USD)
aws budgets create-budget --account-id 123456789012 \\
  --budget '{"BudgetName":"lab","BudgetLimit":{"Amount":"10","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]}]'

# What did I spend this month, by service?
aws ce get-cost-and-usage --time-period Start=2026-10-01,End=2026-10-18 \\
  --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE \\
  --query 'ResultsByTime[0].Groups[].[Keys[0],Metrics.UnblendedCost.Amount]' --output table

# Alarm when the ALB returns too many 5xx errors
aws cloudwatch put-metric-alarm --alarm-name api-5xx \\
  --namespace AWS/ApplicationELB --metric-name HTTPCode_Target_5XX_Count \\
  --dimensions Name=LoadBalancer,Value=app/forge-prod/abc123 \\
  --statistic Sum --period 300 --evaluation-periods 1 --threshold 20 \\
  --comparison-operator GreaterThanThreshold --alarm-actions arn:aws:sns:ap-south-1:123456789012:oncall

# Find forgotten resources that cost money
aws ec2 describe-volumes --filters Name=status,Values=available --query 'Volumes[].VolumeId'
aws ec2 describe-addresses --query 'Addresses[?AssociationId==null].PublicIp'
aws ec2 describe-nat-gateways --query 'NatGateways[?State==\`available\`].NatGatewayId'`,
      ex: "Set up a budget with alerts and a CloudWatch dashboard and alarm for an app you deployed. Then do a 'cost hunt': list every resource in the account, tag each with project and env, delete what you don't need, and write a one-page Well-Architected review of your app with one improvement per pillar.",
      q: ["Which should you set up first in a new personal AWS account?", ["A Kubernetes cluster", "MFA on root and a budget alert", "A multi-region database", "Reserved Instances"], 1, "Securing root and getting warned about unexpected spend protect you from the two most common beginner disasters."]
    }
  ]
});

COURSE.push({
  n: 41, id: "cloud-security-lessons", fills: "cloud-security", title: "Cloud security", level: 3,
  blurb: "Securing cloud accounts: structure, misconfigurations and continuous monitoring.",
  lessons: [
    {
      t: "Cloud security foundations",
      sub: ["Shared responsibility", "Identity as the new perimeter", "Landing zones and account structure", "Guardrails"],
      body: `<p>In the cloud, the provider secures the infrastructure and you secure your <b>configuration, identities and data</b>. The line moves with the service: on EC2 you patch the OS; on Lambda or managed databases the provider does, but you still own IAM, network exposure, encryption settings and the data itself.</p>
<p><b>Identity is the new perimeter.</b> Every cloud resource is managed through an API, so whoever holds valid credentials with enough permissions controls it, from anywhere. Leaked access keys (in GitHub repos, laptops, CI logs) and over-permissive roles are the root cause of most cloud breaches. Hence: SSO with MFA for people, roles with temporary credentials for workloads, no long-lived keys, least privilege, and monitoring of identity activity.</p>
<p>A <b>landing zone</b> is a well-structured multi-account setup created before teams start building. Separate AWS accounts (or Azure subscriptions, GCP projects) act as strong isolation boundaries: a management account for billing and organisation policy only; a security account for audit logs and security tooling; a log archive account; and separate workload accounts for dev, staging and prod. A mistake in dev can't touch prod. AWS Control Tower, Azure Landing Zones and Google's foundation blueprints automate this.</p>
<p><b>Guardrails</b> enforce rules centrally so individual teams can't break them. <b>Preventive</b> guardrails block actions, such as AWS Service Control Policies that deny disabling CloudTrail, leaving approved regions, or making S3 buckets public. <b>Detective</b> guardrails detect drift, such as AWS Config rules flagging unencrypted volumes or open security groups.</p>`,
      lang: "json",
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StayInApprovedRegions",
      "Effect": "Deny",
      "NotAction": ["iam:*", "organizations:*", "sts:*", "support:*", "cloudfront:*", "route53:*", "budgets:*"],
      "Resource": "*",
      "Condition": { "StringNotEquals": { "aws:RequestedRegion": ["ap-south-1", "ap-south-2"] } }
    },
    {
      "Sid": "ProtectAuditTrail",
      "Effect": "Deny",
      "Action": ["cloudtrail:StopLogging", "cloudtrail:DeleteTrail", "cloudtrail:UpdateTrail",
                 "guardduty:DeleteDetector", "config:StopConfigurationRecorder"],
      "Resource": "*"
    },
    {
      "Sid": "NoPublicBucketsOrIAMUsersWithKeys",
      "Effect": "Deny",
      "Action": ["s3:PutAccountPublicAccessBlock", "iam:CreateAccessKey"],
      "Resource": "*",
      "Condition": { "ArnNotLike": { "aws:PrincipalArn": "arn:aws:iam::*:role/platform-admin" } }
    }
  ]
}

// Attach as a Service Control Policy on the "Workloads" organisational unit.
// Account layout:
//   Root (management: billing + SCPs only)
//   ├── Security OU:  security-tooling, log-archive
//   ├── Workloads OU: app-dev, app-staging, app-prod
//   └── Sandbox OU:   personal experiment accounts with strict budgets`,
      ex: "Using AWS Organizations (free), create a small landing zone: a management account, a log-archive account and dev and prod workload accounts in separate OUs. Apply the SCP above to the workloads OU and prove that launching an instance in an unapproved region fails. Draw the structure and explain what each guardrail prevents.",
      q: ["Why use separate cloud accounts for dev and prod instead of one account with naming conventions?", ["Separate accounts are free while one account costs money", "Accounts are hard isolation boundaries: permissions, mistakes and compromises in dev can't affect prod resources", "Naming conventions are not allowed", "Prod needs a different region"], 1, "IAM boundaries inside one account are easy to get wrong. Separate accounts give blast-radius containment by default."]
    },
    {
      t: "Common misconfigurations",
      sub: ["Public storage buckets", "Over-permissive IAM", "Exposed management ports", "Unencrypted data"],
      body: `<p>Most cloud incidents trace back to a handful of misconfigurations. Learn to spot and prevent each one.</p>
<p><b>Public storage buckets.</b> S3 buckets, Azure blob containers or GCS buckets made public "temporarily" to share a file, then forgotten, have leaked millions of records. Prevention: account-level Block Public Access; serve public assets through a CDN with origin access control; share private files with presigned URLs; alert on any bucket policy granting <code>"Principal": "*"</code>.</p>
<p><b>Over-permissive IAM.</b> Policies with <code>"Action": "*"</code> and <code>"Resource": "*"</code>, roles anyone can assume, access keys that never rotate and belong to people who left. Prevention: least-privilege policies, IAM Access Analyzer to find external access and unused permissions, no IAM users with keys for humans, credential reports to find old keys.</p>
<p><b>Exposed management ports.</b> Security groups allowing SSH (22), RDP (3389) or database ports from <code>0.0.0.0/0</code> are scanned within minutes of creation. Prevention: no inbound management ports; use SSM Session Manager, a bastion behind SSO or an identity-aware proxy; databases only in private subnets.</p>
<p><b>Unencrypted data.</b> Volumes, snapshots, databases and backups without encryption, or snapshots shared publicly. Prevention: turn on default EBS encryption per region, require encryption in IaC modules, use KMS keys with restricted key policies, and alert on public snapshots.</p>
<p>Fix things in code (Terraform, CloudFormation) rather than by hand in the console, so fixes don't get overwritten and every environment gets them.</p>`,
      lang: "bash",
      code: `# Audit your own account for the four classics (read-only commands)

# 1. Buckets: account-level public access block, and any public bucket policies
aws s3control get-public-access-block --account-id $(aws sts get-caller-identity --query Account --output text)
for b in $(aws s3api list-buckets --query 'Buckets[].Name' --output text); do
  st=$(aws s3api get-bucket-policy-status --bucket "$b" --query PolicyStatus.IsPublic --output text 2>/dev/null)
  [ "$st" = "True" ] && echo "PUBLIC: $b"
done

# 2. IAM: old access keys and unused credentials
aws iam generate-credential-report >/dev/null; sleep 5
aws iam get-credential-report --query Content --output text | base64 -d \\
  | awk -F, 'NR==1 || $9=="true" {print $1, $9, $10}' | column -t   # user, key1 active, last rotated

# 3. Security groups open to the world on management or database ports
aws ec2 describe-security-groups --query "SecurityGroups[?IpPermissions[?contains(IpRanges[].CidrIp, '0.0.0.0/0') && (FromPort==\`22\` || FromPort==\`3389\` || FromPort==\`5432\` || FromPort==\`3306\`)]].[GroupId,GroupName]" --output table

# 4. Encryption: default EBS encryption and unencrypted volumes
aws ec2 get-ebs-encryption-by-default
aws ec2 describe-volumes --query 'Volumes[?Encrypted==\`false\`].VolumeId'

# Fix examples
aws s3control put-public-access-block --account-id <id> --public-access-block-configuration \\
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws ec2 enable-ebs-encryption-by-default`,
      ex: "In a sandbox account, deliberately create each misconfiguration: a public bucket, an IAM user with an admin policy and an access key, a security group open on port 22, and an unencrypted volume. Run the audit commands (or Prowler: <code>prowler aws</code>) to find them, fix each in Terraform, and re-run to show a clean result.",
      q: ["A security group allows port 22 from 0.0.0.0/0 'just for a quick test'. What's the realistic risk?", ["None, nobody knows the IP", "Automated scanners find it within minutes and begin password and exploit attempts", "Only internal users can connect", "AWS blocks port 22 by default"], 1, "The whole IPv4 internet is scanned continuously. Use Session Manager or restrict to your own IP, and remove the rule after the test."]
    },
    {
      t: "Monitoring and posture management",
      sub: ["CloudTrail and audit logs", "GuardDuty / Defender / Security Command Center", "CSPM tools", "Automated remediation"],
      body: `<p><b>Audit logs</b> record every API call: who did what, when, from where. In AWS that's <b>CloudTrail</b> (Azure: Activity Log; GCP: Cloud Audit Logs). Enable an organisation-wide trail covering all regions, send it to a bucket in a separate log-archive account with object lock or restricted deletion, and keep at least a year. Without it you can't investigate anything.</p>
<p><b>Threat detection services</b> analyse audit logs, DNS and network flow data for known bad behaviour: <b>GuardDuty</b> (AWS), <b>Microsoft Defender for Cloud</b>, <b>Security Command Center</b> (GCP). Typical findings: credentials used from an unusual country or a known malicious IP, an instance contacting crypto-mining pools, unusual API calls such as disabling logging, or S3 data being read at unusual volume. Turn them on in every account and region; they're inexpensive compared with what they catch.</p>
<p><b>CSPM</b> (cloud security posture management) continuously checks configuration against benchmarks (CIS, AWS Foundational Security Best Practices): AWS Security Hub, Defender for Cloud, and open-source tools like <b>Prowler</b> and ScoutSuite. They produce a prioritised list of misconfigurations and a score you can track over time.</p>
<p><b>Automated remediation</b> fixes common, well-understood problems without waiting for a human: an EventBridge rule notices a security group opened to the world on port 22 and a Lambda removes the rule and notifies the owner; AWS Config remediation re-enables bucket encryption. Automate only safe, reversible fixes, log every action, and send everything else to a person.</p>`,
      lang: "python",
      code: `# Lambda triggered by EventBridge when someone changes a security group.
# Removes world-open SSH/RDP rules and notifies the team. (Defensive auto-remediation.)
#
# EventBridge pattern:
# {"source": ["aws.ec2"], "detail-type": ["AWS API Call via CloudTrail"],
#  "detail": {"eventName": ["AuthorizeSecurityGroupIngress"]}}
import boto3, json, os

ec2 = boto3.client("ec2")
sns = boto3.client("sns")
RISKY_PORTS = {22, 3389}

def handler(event, context):
    d = event["detail"]
    group_id = d["requestParameters"]["groupId"]
    who = d["userIdentity"].get("arn", "unknown")
    sg = ec2.describe_security_groups(GroupIds=[group_id])["SecurityGroups"][0]
    removed = []
    for perm in sg["IpPermissions"]:
        port = perm.get("FromPort")
        world = [r for r in perm.get("IpRanges", []) if r["CidrIp"] == "0.0.0.0/0"]
        if port in RISKY_PORTS and world:
            ec2.revoke_security_group_ingress(GroupId=group_id, IpPermissions=[{
                "IpProtocol": perm["IpProtocol"], "FromPort": port, "ToPort": perm["ToPort"],
                "IpRanges": world}])
            removed.append(port)
    if removed:
        sns.publish(TopicArn=os.environ["ALERT_TOPIC"], Subject="Auto-remediated open port",
                    Message=json.dumps({"group": group_id, "ports": removed, "changed_by": who}, indent=2))
    return {"removed": removed}`,
      ex: "In a sandbox account, enable an all-region CloudTrail, GuardDuty and Security Hub with the AWS Foundational Security Best Practices standard. Generate GuardDuty sample findings, then deploy the remediation Lambda above, open port 22 to the world on a test security group and show it being removed automatically with a notification. Record the CloudTrail events for the whole sequence.",
      q: ["Why store CloudTrail logs in a separate log-archive account?", ["It is cheaper", "An attacker who compromises a workload account can't delete or alter the evidence", "CloudTrail can't write to the same account", "It speeds up queries"], 1, "Attackers often try to cover their tracks. Logs in an isolated account with restricted deletion stay trustworthy."]
    }
  ]
});
