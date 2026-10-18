/* Forge Academy lessons: web application security, network security (written for defenders and developers) */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 37, id: "web-security-lessons", fills: "web-security", title: "Web application security", level: 2,
  blurb: "The most common web vulnerabilities, how they arise in code, and how to prevent them.",
  lessons: [
    {
      t: "Injection and XSS",
      sub: ["SQL and command injection", "Stored, reflected and DOM XSS", "Template injection", "Defences"],
      body: `<p><b>Injection</b> happens when untrusted input is mixed into something that gets <i>interpreted</i>: a SQL query, a shell command, a template, HTML. The interpreter can't tell your code from the user's data, so data ends up treated as instructions.</p>
<p><b>SQL injection</b> comes from building queries by gluing strings together. The fix is not "escaping" by hand but <b>parameterised queries</b> (placeholders), where the database receives the query and the values separately. ORMs do this for you unless you drop into raw SQL with string formatting.</p>
<p><b>Command injection</b> comes from passing user input to a shell. Avoid the shell entirely: call programs with an argument list (<code>subprocess.run([...])</code> without <code>shell=True</code>), and validate input against an allow-list.</p>
<p><b>Cross-site scripting (XSS)</b> is injection into HTML: the attacker's script runs in another user's browser with that user's session. <b>Stored</b> XSS is saved (in a comment, a profile) and served to everyone; <b>reflected</b> XSS bounces off a request parameter; <b>DOM</b> XSS happens entirely in front-end JavaScript, for example writing URL data into <code>innerHTML</code>.</p>
<p><b>Template injection</b> occurs when user input becomes part of a template's source rather than a value passed into it.</p>
<p>Defences, layered:</p>
<ul><li>Treat all input as data: parameterised queries, argument lists, templates with values passed in.</li>
<li><b>Context-aware output encoding</b>: frameworks like React, Jinja2 and Django auto-escape by default. Don't bypass that (<code>dangerouslySetInnerHTML</code>, <code>|safe</code>, <code>innerHTML</code>) with user data; if you must render user HTML, sanitise it with a library such as DOMPurify.</li>
<li>Validate input with allow-lists (types, lengths, formats).</li>
<li><b>Content-Security-Policy</b> as a second layer that blocks inline and unexpected scripts; <code>HttpOnly</code> cookies so scripts can't read session tokens.</li>
<li>Least-privilege database accounts limit the damage of any injection that slips through.</li></ul>`,
      lang: "python",
      code: `import sqlite3, subprocess, re
from markupsafe import escape

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (id INTEGER, email TEXT)")

# --- SQL: vulnerable vs safe ---
def find_user_bad(email):
    # input becomes part of the SQL text: never do this
    return db.execute(f"SELECT id FROM users WHERE email = '{email}'").fetchall()

def find_user(email):
    # placeholder: the value is sent separately and can never change the query
    return db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchall()

# --- Shell: vulnerable vs safe ---
def ping_bad(host):
    return subprocess.run(f"ping -c 1 {host}", shell=True)       # shell interprets input

HOST_RE = re.compile(r"^[a-zA-Z0-9.-]{1,253}$")
def ping(host):
    if not HOST_RE.fullmatch(host):                               # allow-list validation
        raise ValueError("invalid host")
    return subprocess.run(["ping", "-c", "1", host], timeout=5)   # no shell at all

# --- HTML output: escape by context ---
comment = '<img src=x onerror="stealCookies()">'
print(f"<p>{escape(comment)}</p>")
# <p>&lt;img src=x onerror=&#34;stealCookies()&#34;&gt;</p>   rendered as text, not run

# Front end equivalents:
#   element.textContent = userInput      // safe
#   element.innerHTML   = userInput      // dangerous
#   React: {userInput} is escaped; avoid dangerouslySetInnerHTML with user data

# Second layer: a strict Content-Security-Policy header
CSP = "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"`,
      ex: "Take a small app of your own (or write a 30-line Flask/FastAPI app) with a search box, a comment form and an admin 'ping a host' tool. Review it for injection: find every place input reaches SQL, a shell or HTML, rewrite each safely, add a CSP header, and write unit tests that pass tricky inputs (quotes, angle brackets, semicolons) and assert they are stored and displayed as plain text.",
      q: ["What is the correct primary defence against SQL injection?", ["Removing quote characters from input", "Parameterised queries, so values are sent separately from the SQL text", "Hiding database error messages", "Using a longer database password"], 1, "Filtering characters is fragile and easy to get wrong. Placeholders make it structurally impossible for input to change the query."]
    },
    {
      t: "Access control and session attacks",
      sub: ["IDOR / broken access control", "CSRF", "Session fixation", "JWT pitfalls"],
      body: `<p><b>Broken access control</b> is number one in the OWASP Top 10. Authentication answers "who are you?"; authorisation answers "may you do this, to this record?". The classic bug is an <b>IDOR</b> (insecure direct object reference): <code>GET /invoices/1043</code> returns invoice 1043 to any logged-in user, because the code loads by ID without checking the owner. Hiding IDs or using UUIDs doesn't fix it; checking ownership on <i>every</i> request does.</p>
<p>Good patterns: deny by default; scope every query by the current user or tenant (<code>WHERE id = ? AND tenant_id = ?</code>); centralise checks in one place (a dependency, middleware or policy function) rather than remembering them in every handler; and write tests where user A tries to read and modify user B's data.</p>
<p><b>CSRF</b> (cross-site request forgery): if a site authenticates with cookies, another site can make the victim's browser send a request that carries those cookies. Defences: <code>SameSite=Lax</code> or <code>Strict</code> cookies (the modern baseline), CSRF tokens on state-changing forms, never changing state on GET, and checking the <code>Origin</code> header.</p>
<p><b>Session fixation</b>: an attacker gets a victim to use a session ID the attacker knows, then waits for them to log in. Defence: always issue a <b>new session ID at login</b> (and on privilege changes), and invalidate sessions on logout and password change.</p>
<p><b>JWT pitfalls</b>: accepting <code>alg: none</code> or letting the token choose the algorithm; weak HMAC secrets; not checking <code>exp</code>, <code>aud</code> and <code>iss</code>; putting secrets inside the payload (it is only encoded, not encrypted); and long-lived tokens that can't be revoked. Pin the algorithm, validate every claim, keep access tokens short-lived and use refresh tokens you can revoke.</p>`,
      lang: "python",
      code: `# FastAPI example: authorisation checked in one place, on every request
from fastapi import Depends, FastAPI, HTTPException
import jwt  # PyJWT

app = FastAPI()
SECRET = "load-from-a-secret-manager"     # long, random, never in code in real apps

def current_user(token: str = Depends(get_bearer_token)):
    try:
        claims = jwt.decode(
            token, SECRET,
            algorithms=["HS256"],          # pin the algorithm: never trust the header's choice
            audience="forge-api", issuer="forge-auth",
            options={"require": ["exp", "sub", "aud", "iss"]},
        )
    except jwt.PyJWTError:
        raise HTTPException(401, "invalid token")
    return {"id": claims["sub"], "tenant": claims["tenant"]}

# BAD: any logged-in user can read any invoice by changing the number
@app.get("/bad/invoices/{invoice_id}")
def get_invoice_bad(invoice_id: int, user=Depends(current_user)):
    return db.fetch_one("SELECT * FROM invoices WHERE id = %s", (invoice_id,))

# GOOD: the query itself is scoped to the caller's tenant
@app.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: int, user=Depends(current_user)):
    row = db.fetch_one(
        "SELECT * FROM invoices WHERE id = %s AND tenant_id = %s",
        (invoice_id, user["tenant"]),
    )
    if not row:
        raise HTTPException(404)           # same answer for "not yours" and "doesn't exist"
    return row

# Test that proves it (pytest)
def test_cannot_read_other_tenants_invoice(client, token_for):
    r = client.get("/invoices/1", headers={"Authorization": f"Bearer {token_for('tenant-b')}"})
    assert r.status_code == 404

# Session cookie settings (any framework)
# Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`,
      ex: "In an app with two user accounts, list every endpoint that takes an ID. For each, write an automated test where user B tries to read, update and delete user A's record, and fix any that succeed. Then check your login: confirm a new session ID is issued at login and that the session cookie has HttpOnly, Secure and SameSite set.",
      q: ["Switching invoice IDs from numbers to random UUIDs is enough to fix an IDOR. True or false?", ["True, UUIDs can't be guessed", "False: IDs leak through URLs, logs and sharing; only an ownership check on every request fixes it", "True, if the UUIDs are version 4", "False, UUIDs are slower"], 1, "Unguessable IDs reduce casual discovery but aren't access control. The server must verify the caller may access that specific record."]
    },
    {
      t: "Server-side attacks",
      sub: ["SSRF", "Path traversal", "File upload attacks", "Deserialisation"],
      body: `<p><b>SSRF</b> (server-side request forgery): a feature fetches a URL the user supplies (link previews, webhooks, "import from URL"). An attacker supplies an internal address instead, making your server request things only it can reach: internal admin panels, databases, or the cloud <b>metadata service</b> (<code>169.254.169.254</code>), which can hand out credentials. Defences: allow-list destinations where possible; resolve the hostname and block private, loopback and link-local ranges (check again after redirects, or disable them); run fetchers in an isolated network; and on AWS require IMDSv2, which blocks most SSRF access to metadata.</p>
<p><b>Path traversal</b>: building a file path from input (<code>/uploads/ + name</code>) lets <code>../</code> sequences escape the folder. Defences: never use user input as a path; store files under generated IDs; if you must, resolve the final path and verify it is still inside the base directory.</p>
<p><b>File uploads</b> can carry oversized files (denial of service), files that are really HTML or SVG with scripts (stored XSS when served from your domain), or executables in a folder the web server runs. Defences: size limits; check type by content, not the extension; generate your own file names; store outside the web root or in object storage; serve user files from a separate domain with <code>Content-Disposition: attachment</code> and <code>X-Content-Type-Options: nosniff</code>; scan for malware if users share files.</p>
<p><b>Insecure deserialisation</b>: formats like Python <code>pickle</code>, Java native serialisation and unsafe YAML loaders can construct arbitrary objects, so loading attacker-controlled data can run code. Use data-only formats (JSON) for anything that crosses a trust boundary, and <code>yaml.safe_load</code>.</p>`,
      lang: "python",
      code: `import ipaddress, socket, uuid
from pathlib import Path
from urllib.parse import urlparse
import httpx

# --- SSRF-resistant URL fetch ---
def is_public_host(host: str) -> bool:
    for info in socket.getaddrinfo(host, None):
        ip = ipaddress.ip_address(info[4][0])
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False
    return True

def fetch_preview(url: str) -> str:
    u = urlparse(url)
    if u.scheme not in ("http", "https") or not u.hostname or not is_public_host(u.hostname):
        raise ValueError("URL not allowed")
    # no redirects: a public URL could redirect to an internal one
    r = httpx.get(url, follow_redirects=False, timeout=5)
    return r.text[:50_000]
# (Production: also pin the resolved IP for the request, or route through an egress proxy.)

# --- Path traversal-safe file read ---
BASE = Path("/srv/app/uploads").resolve()
def read_upload(name: str) -> bytes:
    target = (BASE / name).resolve()
    if not target.is_relative_to(BASE):          # Python 3.9+
        raise PermissionError("outside upload folder")
    return target.read_bytes()

# --- Safer uploads ---
ALLOWED = {b"\\x89PNG": "png", b"\\xff\\xd8\\xff": "jpg", b"%PDF": "pdf"}
def save_upload(data: bytes) -> str:
    if len(data) > 5 * 1024 * 1024:
        raise ValueError("too large")
    ext = next((e for magic, e in ALLOWED.items() if data.startswith(magic)), None)
    if not ext:
        raise ValueError("file type not allowed")   # decided by content, not by filename
    name = f"{uuid.uuid4()}.{ext}"                  # never reuse the user's filename
    (BASE / name).write_bytes(data)
    return name

# --- Deserialisation ---
# pickle.loads(request_body)      # NEVER on untrusted data: can execute code
# json.loads(request_body)        # data only`,
      ex: "Write tests for the three helpers above: <code>fetch_preview</code> must reject localhost, 10.x, 169.254.169.254 and non-HTTP schemes; <code>read_upload</code> must reject names containing <code>../</code> and absolute paths; <code>save_upload</code> must reject an HTML file renamed to .png. Then audit one of your own projects for any feature that fetches URLs or reads files by name.",
      q: ["Why is the cloud metadata address (169.254.169.254) a prime SSRF target?", ["It hosts the company website", "From inside a cloud server it can return instance details and temporary credentials", "It is the DNS server", "It stores backups"], 1, "The metadata service trusts any request from the instance itself. IMDSv2 and blocking link-local addresses in fetchers close this path."]
    },
    {
      t: "Testing web apps",
      sub: ["Burp Suite workflow", "OWASP Testing Guide", "Writing findings", "Responsible disclosure"],
      body: `<p>Security testing must always be <b>authorised</b>: your own apps, deliberately vulnerable training apps (OWASP Juice Shop, DVWA) running locally, or programmes that explicitly invite testing within a written scope. Testing other systems without permission is illegal in most countries, including under India's IT Act.</p>
<p>An intercepting proxy such as <b>Burp Suite</b> (Community edition is free) or <b>OWASP ZAP</b> sits between your browser and the app, so you can see every request and response, replay them and change parameters. A typical review workflow on an app you're allowed to test: browse every feature with the proxy recording to map the attack surface; note every input, ID and role; then systematically check each area.</p>
<p>The <b>OWASP Web Security Testing Guide</b> (WSTG) is the free, structured checklist of what to check: information gathering, configuration, identity and authentication, authorisation, session management, input validation, error handling, cryptography, business logic and client-side issues. The <b>OWASP ASVS</b> lists verification requirements developers can build against.</p>
<p>A finding is only useful if it gets fixed, so <b>write findings clearly</b>: a title, severity (CVSS or a simple high/medium/low with reasoning), the affected endpoint, steps to reproduce, impact in business terms, and a specific fix. Developers should be able to reproduce it without asking you anything.</p>
<p><b>Responsible disclosure</b>: if you find a problem in someone else's product by accident, report it privately through their security contact (<code>/.well-known/security.txt</code>) or bug bounty programme, don't access more data than needed to show the issue, and give them time to fix it before discussing it publicly.</p>`,
      lang: "text",
      code: `FINDING TEMPLATE (example from a test of your own app)

Title:      Any logged-in user can view other customers' invoices (IDOR)
Severity:   High   (CVSS 3.1: 6.5  AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N)
Endpoint:   GET /api/invoices/{id}
Found:      2026-10-18, staging build 4f2c1a, tester: A. Sharma

Steps to reproduce
  1. Log in as user A (tenant "acme"); open invoice 1043 -> 200 OK.
  2. Log in as user B (tenant "globex") in a private window.
  3. Request GET /api/invoices/1043 with B's session.
  4. Response 200 with A's invoice (name, address, amounts).

Impact
  Any customer can read every other customer's billing details by changing
  the number in the URL. Personal data exposure; notifiable breach risk.

Recommendation
  - Scope the query by tenant: WHERE id = ? AND tenant_id = ?
  - Return 404 for records outside the caller's tenant
  - Add an automated cross-tenant test for every endpoint that takes an ID

Retest:     Fixed in build 7a91d0 (verified 2026-10-21)

WSTG areas to cover on every app you own
  [ ] WSTG-ATHN authentication     [ ] WSTG-ATHZ authorisation
  [ ] WSTG-SESS session management [ ] WSTG-INPV input validation
  [ ] WSTG-ERRH error handling     [ ] WSTG-BUSL business logic`,
      ex: "Run OWASP Juice Shop locally with Docker (<code>docker run -p 3000:3000 bkimminich/juice-shop</code>). Proxy your browser through ZAP or Burp Community, map every feature, then work through three WSTG categories. Write up three findings in the template above, including a concrete code-level fix for each.",
      q: ["You accidentally notice a security flaw in a company's website. What is the responsible next step?", ["Post about it publicly to warn people", "Explore further to see how much data you can reach", "Report it privately through their security contact or bug bounty, without accessing more data", "Ignore it"], 2, "Private reporting gives them time to fix it. Accessing more data than necessary can be illegal even with good intentions."]
    }
  ]
});

COURSE.push({
  n: 38, id: "network-security-lessons", fills: "network-security", title: "Network security and tools", level: 2,
  blurb: "Knowing your network, watching its traffic and hardening it.",
  lessons: [
    {
      t: "Scanning and enumeration",
      sub: ["Nmap scans", "Service and version detection", "Enumeration", "Legal and ethical boundaries"],
      body: `<p>You can't defend what you don't know exists. Defenders scan their <b>own</b> networks to build an inventory: which hosts are up, which ports are open, which services and versions run on them. Unexpected open ports, forgotten test servers and outdated software versions are exactly what attackers look for first, so find them before they do.</p>
<p><b>Nmap</b> is the standard tool. A <b>host discovery</b> scan finds live machines in a range. A <b>port scan</b> checks which TCP or UDP ports respond. <b>Service and version detection</b> (<code>-sV</code>) identifies what is listening, such as "OpenSSH 8.9" or "nginx 1.18", which you then compare with known vulnerabilities and your patch policy.</p>
<p><b>Enumeration</b> means collecting more detail from discovered services: TLS certificate details and supported versions, HTTP titles and headers, SMB shares, DNS records. On your own network this feeds the asset inventory and shows misconfigurations like an exposed admin panel or a database listening on a public interface.</p>
<p>Use results to act: close or firewall ports that shouldn't be open, patch outdated versions, and re-scan on a schedule so changes are spotted. Compare scans over time (<code>ndiff</code>) to detect new exposure.</p>
<p><b>Boundaries</b>: scan only networks you own or have written permission to test. Scanning others' systems can breach laws and your internet provider's terms. For practice, Nmap's project provides <code>scanme.nmap.org</code>, and you can build a lab of VMs or containers.</p>`,
      lang: "bash",
      code: `# Your own lab network only (for example a home lab or Docker network)
LAB=192.168.56.0/24

# 1. Which hosts are up?
nmap -sn $LAB -oG - | awk '/Up$/{print $2}'

# 2. Top 1000 TCP ports on one of your hosts
nmap 192.168.56.10

# 3. Identify services and versions on open ports, save all formats
nmap -sV -p- --open -oA scans/web01-$(date +%F) 192.168.56.10
# PORT     STATE SERVICE  VERSION
# 22/tcp   open  ssh      OpenSSH 8.9p1 Ubuntu
# 80/tcp   open  http     nginx 1.18.0
# 5432/tcp open  postgres PostgreSQL 14   <- should this be reachable? probably not

# 4. Safe enumeration scripts: TLS versions and HTTP details
nmap --script ssl-enum-ciphers -p 443 192.168.56.10
nmap --script http-title,http-headers -p 80,443 192.168.56.10

# 5. Detect changes since last week's scan
ndiff scans/web01-2026-10-11.xml scans/web01-2026-10-18.xml

# Permitted practice target provided by the Nmap project:
nmap -sV scanme.nmap.org`,
      ex: "Build a small lab: two or three Docker containers or VMs running SSH, a web server and a database. Scan the lab, produce an inventory table (host, port, service, version, should it be exposed?), then fix one exposure (for example bind the database to localhost or firewall it) and show the before and after scans with ndiff.",
      q: ["Why should a company regularly scan its own network?", ["To slow the network down", "To find unexpected open ports, forgotten hosts and outdated services before attackers do", "It is required for DNS to work", "To replace firewalls"], 1, "Attackers scan constantly. Regular internal and external scans keep the inventory accurate and catch new exposure quickly."]
    },
    {
      t: "Traffic analysis",
      sub: ["Wireshark filters", "Spotting suspicious traffic", "Extracting files from captures", "Zeek overview"],
      body: `<p>Packet captures show exactly what crossed the network, which makes them invaluable for troubleshooting and investigations. <b>Wireshark</b> opens captures (<code>.pcap</code>) and decodes hundreds of protocols.</p>
<p>Two kinds of filters: <b>capture filters</b> (BPF syntax, used by tcpdump) decide what gets recorded; <b>display filters</b> (Wireshark syntax) decide what you see. Display filters you'll use constantly: <code>ip.addr == 10.0.0.5</code>, <code>tcp.port == 443</code>, <code>dns</code>, <code>http.request</code>, <code>tls.handshake.type == 1</code> (Client Hello, shows the server name), <code>tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0</code> (new connection attempts).</p>
<p>Patterns that deserve a closer look:</p>
<ul><li><b>Beaconing</b>: a host contacting the same external address at very regular intervals, typical of malware checking in.</li>
<li>Many connection attempts to many ports or hosts from one machine (scanning or worm activity).</li>
<li>Unusual DNS: very long random-looking subdomains or huge volumes of TXT queries (possible data tunnelling).</li>
<li>Large outbound transfers at odd hours, or plaintext protocols carrying credentials.</li></ul>
<p>Wireshark can <b>export objects</b> (File → Export Objects → HTTP) to recover files transferred over unencrypted protocols, useful for checking what a suspicious download was.</p>
<p>Reading raw packets doesn't scale to a whole network. <b>Zeek</b> watches traffic and writes structured logs per connection, DNS query, HTTP request, TLS session and file, which feed a SIEM for searching and alerting. <b>Suricata</b> adds signature-based alerts.</p>`,
      lang: "bash",
      code: `# Capture on your own machine for 60 seconds while browsing
sudo timeout 60 tcpdump -i any -w lab.pcap 'not port 22'

# Wireshark display filters (paste into the filter bar)
#   dns                                   all DNS
#   tls.handshake.extensions_server_name  server names in TLS Client Hellos
#   http.request.method == "POST"         form submissions over plain HTTP
#   tcp.analysis.retransmission           packet loss
#   ip.dst == 203.0.113.50 && tcp.flags.syn == 1

# The same from the command line with tshark
tshark -r lab.pcap -Y dns -T fields -e frame.time -e ip.src -e dns.qry.name | head
tshark -r lab.pcap -q -z conv,ip                          # who talked to whom, how much
tshark -r lab.pcap -Y "tls.handshake.type == 1" -T fields -e tls.handshake.extensions_server_name | sort | uniq -c | sort -rn

# Find regular beaconing: connection times to one destination
tshark -r lab.pcap -Y "ip.dst == 198.51.100.7 && tcp.flags.syn == 1 && tcp.flags.ack == 0" \\
  -T fields -e frame.time_relative
# 0.00  60.01  120.02  180.00 ...  <- every 60 s: suspicious regularity

# Zeek turns a pcap into searchable logs
zeek -r lab.pcap
head conn.log dns.log ssl.log`,
      ex: "Download a public practice capture from malware-traffic-analysis.net or the Wireshark sample captures page. Using filters and tshark statistics, identify the infected host, the suspicious domains it contacted, the timing pattern of its connections, and any files it downloaded. Write a one-page summary of what happened.",
      q: ["A workstation connects to the same unknown external IP every 60 seconds, all day, sending small amounts of data. What could this indicate?", ["Normal web browsing", "Malware beaconing to a command-and-control server", "A DNS outage", "A full disk"], 1, "Machine-regular, low-volume check-ins to an unknown host are a classic beaconing pattern worth investigating."]
    },
    {
      t: "Defensive network controls",
      sub: ["Firewalls and segmentation", "IDS/IPS (Snort, Suricata)", "VPN and zero trust", "Network hardening"],
      body: `<p><b>Segmentation</b> divides a network into zones so a compromise in one can't spread freely. Typical zones: user laptops, servers, databases, management, guest Wi-Fi, and a DMZ for internet-facing services. Firewalls between zones allow only the flows that are needed (web servers to the database on 5432; nothing from guest Wi-Fi to servers). Micro-segmentation applies the same idea between individual workloads, often with cloud security groups or Kubernetes network policies.</p>
<p>An <b>IDS</b> (intrusion detection system) watches traffic and alerts on suspicious patterns; an <b>IPS</b> sits inline and can block them. <b>Suricata</b> and <b>Snort</b> use rules: signatures matching known malicious traffic, plus protocol anomalies. Managed rule sets (Emerging Threats) keep signatures current. Tune rules to your environment, or the alert volume will bury the real signals.</p>
<p><b>VPNs</b> give remote users encrypted access to internal networks, but a traditional VPN often grants broad network access once connected. <b>Zero trust network access</b> (ZTNA) instead grants access per application, after verifying user identity, MFA and device health each time.</p>
<p><b>Network hardening</b> checklist: deny-by-default firewall rules; no management interfaces (SSH, RDP, admin panels) exposed to the internet, using a VPN, bastion or identity-aware proxy instead; disable unused services and legacy protocols (Telnet, SMBv1); change default credentials on network devices and keep their firmware patched; log firewall and DNS traffic centrally; protect DNS with filtering of known-malicious domains.</p>`,
      lang: "yaml",
      code: `# Kubernetes NetworkPolicy: micro-segmentation for a three-tier app
# 1. Deny all ingress in the namespace by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny, namespace: shop }
spec:
  podSelector: {}
  policyTypes: [Ingress]
---
# 2. Only the API may reach the database, only on 5432
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: db-from-api, namespace: shop }
spec:
  podSelector: { matchLabels: { app: postgres } }
  ingress:
    - from: [ { podSelector: { matchLabels: { app: api } } } ]
      ports: [ { protocol: TCP, port: 5432 } ]
---
# 3. A simple Suricata rule (local.rules) alerting on SSH from outside the office range
# alert tcp !192.168.10.0/24 any -> $HOME_NET 22 (msg:"SSH from outside office"; \\
#   flow:to_server,established; classtype:policy-violation; sid:1000001; rev:1;)
#
# Run Suricata on a capture to test rules offline:
#   suricata -r lab.pcap -S local.rules -l ./out && cat out/fast.log`,
      ex: "Design segmentation for a small company (staff laptops, a web app, a database, a file server, guest Wi-Fi, an admin network). Draw the zones and write the firewall allow-list between them. Then run Suricata on a sample capture with the Emerging Threats open rules and categorise the alerts into real concerns and noise.",
      q: ["What is the main benefit of network segmentation?", ["Faster internet", "A compromise in one zone can't move freely to others, limiting the blast radius", "No need for passwords", "Fewer IP addresses"], 1, "Attackers who get in usually move laterally. Segmentation forces them through controlled, monitored chokepoints."]
    },
    {
      t: "Wireless and endpoint security",
      sub: ["Wi-Fi security", "Endpoint protection", "Hardening Windows and Linux", "Patch management"],
      body: `<p><b>Wi-Fi</b>: use <b>WPA3</b> (or WPA2-AES where devices require it) and never WEP or WPA/TKIP. Home and small offices use a pre-shared passphrase (long and unique); organisations should use <b>WPA2/WPA3-Enterprise</b> with 802.1X, where each person authenticates with their own identity or certificate, so leavers can be removed individually. Put guests and IoT devices on separate networks, change router default passwords and keep firmware updated.</p>
<p><b>Endpoints</b> (laptops, phones, servers) are where most attacks land. Modern <b>EDR</b> (endpoint detection and response) tools like Microsoft Defender for Endpoint or CrowdStrike go beyond antivirus: they record process, file and network activity, detect suspicious behaviour and let responders isolate a machine remotely. Pair them with full-disk encryption (BitLocker, FileVault, LUKS) and device management (MDM) to enforce settings.</p>
<p><b>Hardening</b> means removing what isn't needed and tightening defaults. Use benchmarks like the <b>CIS Benchmarks</b>. Common steps: no daily work as admin; disable unused services; enable the host firewall; enforce screen lock and strong authentication; restrict macros and script execution on Windows; turn on audit logging; on Linux, key-only SSH, automatic security updates and minimal packages.</p>
<p><b>Patch management</b> closes known vulnerabilities, and most breaches exploit flaws that already had a patch. Keep an inventory, prioritise by severity and exploitation (CISA's Known Exploited Vulnerabilities list is a good signal), test, roll out in rings, and track compliance. Internet-facing systems with actively exploited flaws should be patched within days, not months.</p>`,
      lang: "bash",
      code: `# --- Linux hardening quick wins (Ubuntu) ---
sudo apt install -y unattended-upgrades && sudo dpkg-reconfigure -plow unattended-upgrades
sudo ufw default deny incoming && sudo ufw allow 22/tcp && sudo ufw enable
systemctl list-unit-files --state=enabled | grep -vE "ssh|ufw|systemd" # review: disable what you don't need
sudo apt install -y auditd && sudo systemctl enable --now auditd
# Audit against a benchmark with Lynis
sudo apt install -y lynis && sudo lynis audit system | tail -30   # hardening index + suggestions

# --- Pending updates and reboots ---
apt list --upgradable 2>/dev/null | head
[ -f /var/run/reboot-required ] && echo "reboot needed"

# --- Windows checks (PowerShell, run as admin) ---
# Get-MpComputerStatus | Select AMServiceEnabled, RealTimeProtectionEnabled, AntivirusSignatureAge
# Get-BitLockerVolume | Select MountPoint, ProtectionStatus
# Get-NetFirewallProfile | Select Name, Enabled
# Get-HotFix | Sort-Object InstalledOn -Descending | Select -First 5
# Get-LocalGroupMember Administrators     # who has admin rights?`,
      ex: "Harden a fresh Linux VM: run Lynis and record the hardening index, apply ten of its suggestions (automatic updates, firewall, SSH settings, audit logging and so on), then re-run Lynis and record the new score. Write a short patch policy for a 50-person company: inventory, severity targets in days, testing and how you'll measure compliance.",
      q: ["Why is WPA2/WPA3-Enterprise preferred over a shared Wi-Fi password in an organisation?", ["It is faster", "Each user authenticates individually, so access can be revoked per person and activity is attributable", "It doesn't need encryption", "Guests can join more easily"], 1, "A shared passphrase must be changed for everyone when one person leaves and can't tell users apart. 802.1X ties access to individual identities."]
    }
  ]
});
