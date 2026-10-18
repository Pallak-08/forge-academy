/* Forge Academy lessons: CS essentials, security fundamentals, applied crypto, Python packaging, shell scripting */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 32, id: "cs-basics-lessons", fills: "cs-basics", title: "Computer science essentials", level: 1,
  blurb: "How programs run, operating systems, data formats and performance intuition.",
  lessons: [
    {
      t: "How a computer runs a program",
      sub: ["CPU, memory, storage", "Binary and how data is represented", "Compiled vs interpreted languages", "What happens when you run a script"],
      body: `<p>A computer has three main parts you need to picture. The <b>CPU</b> executes instructions, billions per second. <b>Memory</b> (RAM) holds the program and its data while it runs: fast, but erased when power goes. <b>Storage</b> (SSD, disk) keeps files permanently, but is thousands of times slower than RAM.</p>
<p>Everything is stored as <b>binary</b>: bits that are 0 or 1, grouped in bytes of 8 bits (256 possible values). Numbers are stored in binary (13 = <code>1101</code>), text as numeric codes per character, images as numbers for each pixel's colour. The same bytes mean different things depending on how a program interprets them.</p>
<p>The CPU only understands <b>machine code</b>. Languages bridge the gap in two ways:</p>
<ul><li><b>Compiled</b> (C, C++, Go, Rust): a compiler translates the whole program to machine code ahead of time. Fast to run; you build a binary per platform.</li>
<li><b>Interpreted</b> (Python, JavaScript, Ruby): an interpreter reads and runs the program at run time. Easier to start with and portable, but slower. In practice it's a spectrum: Python compiles to bytecode first, and JavaScript engines and Java use JIT (just-in-time) compilation to machine code while running.</li></ul>
<p>When you run <code>python3 app.py</code>, the operating system finds the <code>python3</code> program via PATH, loads it into memory as a new <b>process</b>, and the interpreter reads your file, compiles it to bytecode and executes it line by line. Imports load more files; data you create lives in RAM until the process exits.</p>`,
      lang: "python",
      code: `# Binary and bytes
print(bin(13))            # 0b1101
print(int("1101", 2))     # 13
print(0xFF)               # 255: hexadecimal is shorthand for binary (F = 1111)

# The same bytes, interpreted differently
data = bytes([72, 105, 33])
print(data)               # b'Hi!'  as text
print(list(data))         # [72, 105, 33] as numbers

# Python compiles your code to bytecode before running it
import dis
def add(a, b):
    return a + b
dis.dis(add)
#  LOAD_FAST  a
#  LOAD_FAST  b
#  BINARY_OP  +
#  RETURN_VALUE

# Memory: how big is each object?
import sys
print(sys.getsizeof(1), sys.getsizeof("hello"), sys.getsizeof([1, 2, 3]))`,
      ex: "Convert 42, 255 and 1000 to binary and hex by hand, then check with Python. Write the same 'sum the numbers 1 to 100 million' loop in Python and (if you can) in C or Go, time both, and explain the difference in terms of compiled vs interpreted.",
      q: ["Why is reading from RAM so much faster than reading from an SSD?", ["RAM is bigger", "RAM is electronic memory right next to the CPU with nanosecond access; storage is a separate device with microsecond-to-millisecond access", "SSDs store data in binary and RAM doesn't", "RAM is compressed"], 1, "RAM access is around 100 nanoseconds; an SSD read is around 100 microseconds, a thousand times slower. That's why programs load data into memory to work on it."]
    },
    {
      t: "Operating systems",
      sub: ["Processes and threads", "Memory: stack and heap", "File systems", "System calls", "Scheduling in brief"],
      body: `<p>The <b>operating system</b> (Linux, Windows, macOS) shares the hardware safely between many programs. Programs never touch hardware directly; they ask the OS.</p>
<p>A <b>process</b> is a running program with its own private memory. A crash in one process doesn't corrupt another. A <b>thread</b> is a line of execution inside a process; threads of one process share its memory, so they can cooperate cheaply but must coordinate (locks) to avoid corrupting shared data.</p>
<p>Each process's memory has two main areas. The <b>stack</b> holds function calls and their local variables; it grows and shrinks automatically as functions are called and return, and is small (deep recursion causes a "stack overflow"). The <b>heap</b> holds data that outlives a single function call, like lists and objects; in Python, Java and JavaScript a garbage collector frees heap memory that is no longer referenced.</p>
<p>A <b>file system</b> organises storage into files and folders, tracking where each file's bytes live, plus permissions and timestamps. On Linux, almost everything appears as a file, including devices and process information under <code>/proc</code>.</p>
<p>A <b>system call</b> is how a program asks the OS to do something privileged: open or read a file, send network data, start a process, allocate memory. <code>strace</code> shows them.</p>
<p>The <b>scheduler</b> decides which thread runs on which CPU core and switches between them many times a second, so hundreds of processes appear to run at once on a few cores.</p>`,
      lang: "python",
      code: `import os, threading, time
from concurrent.futures import ProcessPoolExecutor

print("my process id:", os.getpid())

# Threads share memory: both see and change the same counter
counter = 0
lock = threading.Lock()
def work():
    global counter
    for _ in range(100_000):
        with lock:              # without the lock, updates can be lost
            counter += 1
ts = [threading.Thread(target=work) for _ in range(4)]
[t.start() for t in ts]; [t.join() for t in ts]
print("counter:", counter)      # 400000

# Processes have separate memory: each gets its own copy
def square(n):
    return n * n, os.getpid()
if __name__ == "__main__":
    with ProcessPoolExecutor(4) as pool:
        for result, pid in pool.map(square, range(4)):
            print(result, "computed in process", pid)

# Stack: each call adds a frame; too deep and you overflow
import sys
print("recursion limit:", sys.getrecursionlimit())   # 1000 by default

# On Linux, see the system calls a command makes:
#   strace -c ls        (summary)
#   strace -e trace=openat cat /etc/hostname`,
      ex: "Run the counter example without the lock and with 8 threads; observe the wrong totals and explain why. Then on Linux, run <code>strace -c python3 -c 'print(1)'</code> and list the three most frequent system calls and what each one does.",
      q: ["Two threads in the same process update a shared variable without a lock. What can happen?", ["Nothing, threads can't share variables", "Updates can interleave and be lost, giving wrong results (a race condition)", "The OS automatically locks it", "The program refuses to start"], 1, "counter += 1 is read, add, write. If two threads read the same old value, one update overwrites the other."]
    },
    {
      t: "Character encoding and data formats",
      sub: ["ASCII and Unicode / UTF-8", "JSON, CSV, XML, YAML", "Binary vs text formats", "Serialisation"],
      body: `<p>Text is stored as numbers. <b>ASCII</b> maps 128 characters (English letters, digits, punctuation) to numbers 0–127. It has no room for हिन्दी, 中文, é or emoji. <b>Unicode</b> gives every character in every script a number (a code point, like U+0905 for अ). <b>UTF-8</b> is the standard way to store those numbers as bytes: ASCII characters take 1 byte, others 2–4. Use UTF-8 everywhere; most "garbled text" bugs (like <code>Ã©</code> instead of é) are bytes decoded with the wrong encoding.</p>
<p>Common text data formats:</p>
<ul><li><b>JSON</b>: objects, arrays, strings, numbers, booleans, null. The language of web APIs.</li>
<li><b>CSV</b>: rows and columns of plain text. Universal for spreadsheets, but has no types and tricky quoting.</li>
<li><b>YAML</b>: human-friendly config (Docker Compose, Kubernetes, GitHub Actions). Indentation matters.</li>
<li><b>XML</b>: tags and attributes; found in older enterprise systems, RSS, SVG and office files.</li></ul>
<p><b>Binary formats</b> (Protocol Buffers, Parquet, images, MessagePack) are compact and fast to parse but not human-readable. Text formats are easy to debug; binary formats win at large scale.</p>
<p><b>Serialisation</b> turns in-memory objects into bytes or text you can save or send; <b>deserialisation</b> turns them back. Never deserialise untrusted data with formats that can execute code, like Python's <code>pickle</code>; use JSON for anything that crosses a trust boundary.</p>`,
      lang: "python",
      code: `# Unicode and UTF-8
s = "नमस्ते é 👋"
print(len(s))                       # characters (code points)
b = s.encode("utf-8")
print(len(b), b[:6])                # bytes take more space for non-ASCII
print(b.decode("utf-8"))            # round trip works
print("é".encode("utf-8").decode("latin-1"))   # 'Ã©' : the classic wrong-decoding bug

# Same data in different formats
import json, csv, io, yaml   # pip install pyyaml
user = {"id": 7, "name": "Asha", "skills": ["python", "sql"], "active": True}

print(json.dumps(user))                       # {"id": 7, "name": "Asha", ...}
print(yaml.safe_dump(user, sort_keys=False))  # id: 7 / name: Asha / skills: - python ...

buf = io.StringIO()
w = csv.DictWriter(buf, fieldnames=["id", "name", "active"])
w.writeheader(); w.writerow({k: user[k] for k in ["id", "name", "active"]})
print(buf.getvalue())                         # id,name,active / 7,Asha,True

# Deserialise safely
data = json.loads('{"id": 8, "name": "Ravi"}')
config = yaml.safe_load("port: 8080\\ndebug: false")   # safe_load, never yaml.load on untrusted input
print(data["name"], config["port"])`,
      ex: "Write a script that reads a CSV of users (include names with non-English characters), converts it to JSON and YAML files, then reads both back and checks the data is identical. Open the CSV in a spreadsheet app with the wrong encoding to see mojibake, then fix it.",
      q: ["A user's name shows as 'JosÃ©' instead of 'José'. What happened?", ["The database lost data", "UTF-8 bytes were decoded with a different encoding such as Latin-1", "The font is missing", "JSON doesn't support accents"], 1, "é is two bytes in UTF-8. Decoding those bytes as Latin-1 shows them as two separate characters, Ã and ©."]
    },
    {
      t: "Complexity and performance intuition",
      sub: ["Big-O revisited", "Latency numbers every engineer should know", "Caches and locality", "Measuring before optimising"],
      body: `<p><b>Big-O</b> describes how work grows with input size. O(1): constant (dictionary lookup). O(log n): halving each step (binary search). O(n): one pass. O(n log n): good sorting. O(n²): nested loops over the same data. At n = 1,000,000, the difference between O(n) and O(n²) is one second versus eleven days.</p>
<p>Real speed also depends on <b>where data lives</b>. Rough numbers to remember:</p>
<ul><li>CPU cache: about 1 nanosecond.</li><li>RAM: about 100 ns.</li><li>SSD read: about 100 microseconds (1,000× RAM).</li>
<li>Network round trip in the same data centre: about 0.5 ms; across continents: about 150 ms.</li></ul>
<p>So one extra database query per item in a loop (the "N+1 problem") or an API call across the world inside a loop costs far more than any clever code. Batch requests and fetch data together.</p>
<p><b>Caching</b> keeps recently used data somewhere faster: CPU caches, in-process dictionaries, Redis, CDNs. <b>Locality</b> means data used together should be stored together; scanning an array in order is much faster than jumping around memory.</p>
<p>Most importantly: <b>measure before optimising</b>. Programmers guess bottlenecks wrong most of the time. Time the code, use a profiler, fix the biggest cost, measure again.</p>`,
      lang: "python",
      code: `import time, random, cProfile

items = list(range(50_000))
lookup = set(items)
targets = [random.randint(0, 100_000) for _ in range(5_000)]

t = time.perf_counter()
hits = sum(1 for x in targets if x in items)     # list: O(n) per check
print(f"list:  {time.perf_counter() - t:.3f}s")

t = time.perf_counter()
hits = sum(1 for x in targets if x in lookup)    # set: O(1) per check
print(f"set:   {time.perf_counter() - t:.5f}s")  # hundreds of times faster

# Caching an expensive function
from functools import lru_cache
@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
t = time.perf_counter(); fib(300); print(f"fib(300) cached: {time.perf_counter() - t:.5f}s")

# Profile to find where time really goes
def slow_report():
    rows = [{"id": i, "v": random.random()} for i in range(200_000)]
    rows.sort(key=lambda r: r["v"])
    return sum(r["v"] for r in rows)
cProfile.run("slow_report()", sort="cumulative")`,
      ex: "Write a function that finds duplicate emails in a list, first with nested loops, then with a set. Time both for 1,000, 10,000 and 50,000 emails and plot or tabulate the results. Then profile a slow script of your own with cProfile and fix the top hotspot.",
      q: ["A page loops over 200 orders and runs one database query per order to load the customer. What is the best fix?", ["Use a faster CPU", "Fetch all needed customers in one query (or a join), avoiding 200 network round trips", "Add more RAM", "Rewrite the loop in C"], 1, "Each query costs a network round trip. One batched query replaces 200 round trips, which dwarfs any CPU-level optimisation."]
    }
  ]
});

COURSE.push({
  n: 33, id: "sec-fundamentals-lessons", fills: "sec-fundamentals", title: "Security fundamentals", level: 1,
  blurb: "The core ideas, attacker behaviour, frameworks and threat modelling.",
  lessons: [
    {
      t: "Core concepts",
      sub: ["CIA triad", "Threats, vulnerabilities and risk", "Defence in depth", "Least privilege"],
      body: `<p>Security protects three properties, the <b>CIA triad</b>:</p>
<ul><li><b>Confidentiality</b>: only authorised people can see data (encryption, access control).</li>
<li><b>Integrity</b>: data isn't changed without authorisation, and changes are detectable (hashes, signatures, audit logs).</li>
<li><b>Availability</b>: systems work when needed (backups, redundancy, protection against overload).</li></ul>
<p>Three words people mix up: a <b>vulnerability</b> is a weakness (an unpatched server, a weak password policy). A <b>threat</b> is something that could exploit it (a criminal group, an insider, a flood). <b>Risk</b> is the combination: how likely is it to happen, and how bad would it be? Security work is mostly about reducing the biggest risks first, not fixing everything.</p>
<p><b>Defence in depth</b> means layering controls so one failure doesn't mean a breach. For a web app: a firewall, then authentication with MFA, then authorisation checks on every request, then encrypted data, then monitoring and alerts, then backups. An attacker has to beat every layer.</p>
<p><b>Least privilege</b> means every person, service and key gets only the access it needs, for only as long as it needs it. The reporting service gets read-only database access; the intern doesn't get production admin; the CI token can deploy one app, not delete the cloud account. When something is compromised, least privilege limits the damage.</p>`,
      lang: "text",
      code: `Example: assessing a small online store

ASSET                 C  I  A   THREAT                     VULNERABILITY
Customer database     H  H  M   criminal data theft        admin panel public, no MFA
Payment flow          H  H  H   card fraud                 (handled by payment provider)
Product catalogue     L  M  H   defacement, outage         outdated CMS plugin
Order emails          M  M  L   phishing lookalikes        no SPF/DKIM/DMARC

Risk = likelihood x impact (1-5 each)
  admin panel without MFA      4 x 5 = 20   -> fix first: MFA + IP allow-list
  outdated CMS plugin          3 x 4 = 12   -> patch, enable auto-updates
  missing email auth           3 x 3 =  9   -> add DNS records

Defence in depth for the customer database
  1. Network: database not reachable from the internet
  2. Identity: SSO + MFA for staff, separate admin accounts
  3. Authorisation: app checks ownership on every order request
  4. Data: encryption at rest, passwords hashed with argon2
  5. Detection: alerts on unusual exports or logins
  6. Recovery: daily encrypted backups, restore tested monthly

Least privilege
  reporting job   -> read-only DB user, only the orders table
  support staff   -> view orders, no exports
  CI pipeline     -> deploy role for one service, expires after the run`,
      ex: "Pick an app you know (your college portal, a food delivery app). List five assets, rate each for C, I and A, identify one threat and one plausible vulnerability for each, score the risks and propose one control per risk. Note which layer of defence in depth each control belongs to.",
      q: ["A ransomware attack encrypts a company's file server so nobody can work. Which part of the CIA triad is mainly affected?", ["Confidentiality", "Integrity", "Availability", "None"], 2, "The files still exist but can't be used: availability. Many ransomware groups now also steal data, which hits confidentiality too."]
    },
    {
      t: "Attackers and attacks",
      sub: ["Threat actors", "The cyber kill chain", "MITRE ATT&CK", "Social engineering and phishing"],
      body: `<p>Defenders need to understand who attacks and how, in order to prioritise. Common <b>threat actors</b>:</p>
<ul><li><b>Cybercriminals</b>: motivated by money. Ransomware, fraud, stolen data sales. The most common threat for most organisations.</li>
<li><b>Nation-state groups</b>: espionage and disruption; well resourced and patient.</li>
<li><b>Hacktivists</b>: political motives; defacement, leaks, denial of service.</li>
<li><b>Insiders</b>: employees or contractors, malicious or simply careless.</li></ul>
<p>The <b>cyber kill chain</b> describes an intrusion as stages: reconnaissance, weaponisation, delivery, exploitation, installation, command and control, and actions on objectives. The defensive lesson is that breaking any link stops the attack, and earlier is cheaper.</p>
<p><b>MITRE ATT&amp;CK</b> is a free knowledge base of real attacker behaviour, organised as tactics (the goal, such as initial access, persistence, credential access, exfiltration) and techniques (how, such as phishing or valid accounts). SOC teams map their detections to ATT&amp;CK to see which behaviours they can and cannot detect.</p>
<p><b>Social engineering</b> manipulates people instead of systems, and remains the most common way in. Phishing emails, fake login pages, urgent calls from "IT support" and requests from a "CEO" to buy gift cards all rely on urgency, authority and fear. Defences: phishing-resistant MFA (passkeys, security keys), email authentication, training people to verify through a second channel, and making reporting easy and blame-free.</p>`,
      lang: "text",
      code: `Mapping a phishing incident to the kill chain and ATT&CK (defender's view)

STAGE               WHAT HAPPENED                         ATT&CK              CONTROL THAT COULD BREAK IT
Reconnaissance      staff names gathered from LinkedIn    T1593 (search open  limit public org charts,
                                                          websites)           awareness
Delivery            email "Your payroll needs updating"   T1566 Phishing      email filtering, DMARC,
                                                                              external-sender banner
Exploitation        user enters password on a fake page   T1078 Valid         phishing-resistant MFA
                                                          Accounts            (passkeys) defeats this
Actions             mailbox rule forwards invoices        T1114 Email         alert on new forwarding
                    to an outside address                 Collection          rules, block auto-forward
Objective           fake invoice paid                     (fraud)             verify bank changes by phone

Red flags to teach users
  - urgency or threats ("account closes in 2 hours")
  - sender address or link domain doesn't match the brand
  - unexpected attachment or login request
  - requests to bypass normal process (gift cards, new bank details)
  -> verify through a known channel, then report with one click`,
      ex: "Pick a well-documented public breach (search for a post-incident report from a reputable source). Map what happened to the kill chain stages and to at least four ATT&amp;CK techniques using attack.mitre.org. For each stage, name one control that could have stopped it.",
      q: ["Why is phishing-resistant MFA (passkeys or security keys) so effective against credential phishing?", ["It hides the login page", "The key only signs in to the genuine site's domain, so a password typed into a fake site isn't enough to log in", "It blocks all email", "It encrypts the password"], 1, "Passkeys and security keys are bound to the real domain. A lookalike site can't obtain a valid sign-in even if the user is fooled."]
    },
    {
      t: "Security frameworks and compliance",
      sub: ["NIST CSF", "ISO 27001", "SOC 2", "GDPR and India's DPDP Act in brief"],
      body: `<p>Frameworks give organisations a shared, complete checklist so security isn't left to whoever shouts loudest. You will meet these in almost every security job.</p>
<p><b>NIST Cybersecurity Framework (CSF 2.0)</b> organises security into six functions: <b>Govern</b> (strategy, roles, policy), <b>Identify</b> (assets and risks), <b>Protect</b> (controls), <b>Detect</b> (monitoring), <b>Respond</b> and <b>Recover</b>. It's free, flexible and a good mental map of the whole field.</p>
<p><b>ISO/IEC 27001</b> is an international standard for an information security management system (ISMS): a repeatable process to assess risks, choose controls (from the Annex A list), and review and improve. Companies get certified by an external auditor; customers and enterprise buyers often require it.</p>
<p><b>SOC 2</b> is a US attestation, very common for SaaS companies. An auditor reports on controls against trust criteria (security, availability, confidentiality, processing integrity, privacy). A Type I report checks design at a point in time; Type II checks the controls actually operated over months.</p>
<p>Privacy laws regulate personal data. <b>GDPR</b> (EU) requires a lawful basis for processing, data minimisation, user rights (access, deletion), breach notification within 72 hours and heavy fines. India's <b>Digital Personal Data Protection Act, 2023</b> similarly requires consent or other legitimate uses, purpose limitation, security safeguards, breach reporting and rights for data principals. Check the current rules when you work with them, as details and implementing rules evolve.</p>`,
      lang: "text",
      code: `One control, seen through several frameworks

CONTROL: "All staff use MFA for company systems"

NIST CSF 2.0      PR.AA  (Protect > Identity management, authentication
                          and access control)
ISO 27001:2022    Annex A 5.17 Authentication information,
                          8.5  Secure authentication
SOC 2             CC6.1  Logical access security
                  Evidence: identity provider policy screenshot,
                            list of users with MFA status, exceptions log
DPDP / GDPR       "reasonable security safeguards" / "appropriate technical
                  and organisational measures" to protect personal data

A tiny control matrix (what auditors ask for)
ID    Control                         Owner      Frequency   Evidence
AC-1  MFA enforced for all users      IT lead    continuous  IdP report
AC-2  Access reviewed quarterly       Managers   quarterly   signed review sheet
BK-1  Backups run and restore tested  DevOps     monthly     restore test log
IR-1  Incident response plan tested   Security   yearly      tabletop report`,
      ex: "Choose five controls a startup should have (MFA, backups, logging, access reviews, vulnerability patching). Build a control matrix with owner, frequency and evidence, and map each control to a NIST CSF function and an ISO 27001 Annex A control. Then write a one-paragraph summary of what personal data the startup holds and its main duties under DPDP or GDPR.",
      q: ["What is the main difference between a SOC 2 Type I and Type II report?", ["Type II is for small companies", "Type I checks control design at one point in time; Type II tests that controls operated effectively over a period", "Type I covers privacy only", "There is no difference"], 1, "Type II is stronger evidence: the auditor samples activity over months (for example 6–12) to confirm controls actually worked."]
    },
    {
      t: "Threat modelling",
      sub: ["STRIDE", "Data flow diagrams", "Ranking risks", "Choosing controls"],
      body: `<p><b>Threat modelling</b> is thinking like an attacker at design time, when fixes are cheapest. It answers four questions: What are we building? What can go wrong? What are we going to do about it? Did we do a good job?</p>
<p>Start with a <b>data flow diagram</b>: users and external systems, processes (your services), data stores (databases, buckets) and the data flowing between them. Draw <b>trust boundaries</b> wherever data crosses from less trusted to more trusted: browser to API, API to database, your system to a third-party API. Most threats sit on those boundaries.</p>
<p>Then walk each element and flow through <b>STRIDE</b>:</p>
<ul><li><b>S</b>poofing identity → authentication.</li><li><b>T</b>ampering with data → integrity checks, input validation.</li>
<li><b>R</b>epudiation (denying an action) → audit logs.</li><li><b>I</b>nformation disclosure → encryption, access control.</li>
<li><b>D</b>enial of service → rate limits, quotas, scaling.</li><li><b>E</b>levation of privilege → authorisation checks, least privilege.</li></ul>
<p><b>Rank</b> each threat by likelihood and impact (a simple 1–5 × 1–5 score is fine). Then <b>choose a response</b>: mitigate with a control, eliminate the feature, transfer (insurance, a provider) or accept with sign-off. Record decisions, turn mitigations into tickets, and revisit the model when the design changes.</p>`,
      lang: "text",
      code: `Threat model: "Upload a CSV, get a dashboard" feature

Data flow
  [Browser] --HTTPS--> | API (FastAPI) | --> [Object storage: uploads]
                       |               | --> [PostgreSQL: users, dashboards]
                       |               | --> [Worker] --> [LLM API, third party]
  Trust boundaries: browser|API,  API|storage,  worker|LLM API

STRIDE walk (top items)
#  Element         Threat                                      L  I  Score  Response
1  API             E: user changes dashboard_id to view        4  5   20   Mitigate: check owner on
                   another tenant's dashboard                              every query, add tests
2  Upload          D: 2 GB file exhausts worker memory         4  3   12   Mitigate: size limit,
                                                                           streaming parser
3  Storage         I: uploads bucket readable publicly         2  5   10   Mitigate: private bucket,
                                                                           signed URLs, CSPM alert
4  Worker -> LLM   I: customer data sent to third party        3  3    9   Mitigate: DPA with vendor,
                                                                           send only needed columns
5  API             R: user denies deleting a dashboard         2  2    4   Mitigate: audit log
6  Login           S: credential stuffing                      3  4   12   Mitigate: MFA, rate limit,
                                                                           breached-password check`,
      ex: "Draw a data flow diagram for a small app (a notes app with login and file attachments works well). Mark the trust boundaries, run STRIDE on every element and flow, list at least ten threats, score them, and choose a response for the top five. Present it as a one-page table like the example.",
      q: ["In STRIDE, a user editing an ID in the URL to read someone else's invoice is mainly which threat?", ["Spoofing", "Repudiation", "Information disclosure via elevation of privilege (missing authorisation)", "Denial of service"], 2, "The user is authenticated as themselves but gains access beyond their rights: a broken authorisation check, which leads to information disclosure."]
    }
  ]
});

COURSE.push({
  n: 34, id: "crypto-lessons", fills: "crypto", title: "Applied cryptography", level: 2,
  blurb: "Using encryption and certificates correctly.",
  lessons: [
    {
      t: "Encryption in practice",
      sub: ["Symmetric: AES-GCM", "Asymmetric: RSA and elliptic curves", "Key exchange", "Encryption at rest and in transit"],
      body: `<p><b>Symmetric encryption</b> uses one secret key to encrypt and decrypt. It is fast and used for bulk data. The modern default is <b>AES-GCM</b> (or ChaCha20-Poly1305): it encrypts and also authenticates, so tampering is detected. GCM needs a unique <b>nonce</b> for every message with the same key; reusing a nonce breaks its security.</p>
<p><b>Asymmetric encryption</b> uses a key pair: a public key anyone may have and a private key kept secret. Data encrypted with the public key can only be decrypted with the private key, and signatures made with the private key can be verified with the public key. <b>RSA</b> is the classic algorithm; <b>elliptic curve</b> algorithms (ECDSA, Ed25519, X25519) give the same security with much smaller keys and faster operations. Asymmetric operations are slow, so they protect small things: keys and signatures.</p>
<p><b>Key exchange</b> (Diffie-Hellman, today usually ECDHE with X25519) lets two parties agree on a shared secret over an open network without sending it. TLS uses it to create a fresh symmetric key per session, which also gives <b>forward secrecy</b>: stealing the server's long-term key later doesn't decrypt past traffic.</p>
<p>In practice: encrypt <b>in transit</b> with TLS everywhere, including internal services. Encrypt <b>at rest</b> with disk or database encryption, using a key management service (AWS KMS, GCP KMS, Vault) so keys are stored, rotated and access-logged separately from the data. Never invent your own cryptography; use well-reviewed libraries with safe defaults.</p>`,
      lang: "python",
      code: `# pip install cryptography
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

# --- Symmetric, authenticated encryption ---
key = AESGCM.generate_key(bit_length=256)
aes = AESGCM(key)
nonce = os.urandom(12)                      # unique per message, never reuse with this key
ct = aes.encrypt(nonce, b"salary: 12 LPA", b"user:42")   # last arg: authenticated extra data
print(aes.decrypt(nonce, ct, b"user:42"))   # b'salary: 12 LPA'
# Changing a single byte of ct raises InvalidTag: tampering detected

# --- Key exchange: both sides derive the same secret ---
alice, bob = X25519PrivateKey.generate(), X25519PrivateKey.generate()
s1 = alice.exchange(bob.public_key())
s2 = bob.exchange(alice.public_key())
assert s1 == s2
session_key = HKDF(hashes.SHA256(), 32, salt=None, info=b"chat v1").derive(s1)

# --- Signatures: prove who wrote something ---
signer = Ed25519PrivateKey.generate()
msg = b"release v2.1.0 sha256=ab12..."
sig = signer.sign(msg)
signer.public_key().verify(sig, msg)        # raises InvalidSignature if forged
print("signature ok")`,
      ex: "Write a small CLI that encrypts a file with AES-GCM using a key derived from a passphrase (use scrypt or argon2 for the derivation, store the salt and nonce with the ciphertext) and decrypts it again. Show that changing one byte of the encrypted file makes decryption fail.",
      q: ["Why does TLS use asymmetric cryptography only during the handshake and symmetric encryption for the data?", ["Symmetric encryption is less secure, so it's used for less important data", "Asymmetric operations are slow; they're used to authenticate and agree a key, then fast symmetric encryption protects the bulk data", "Browsers don't support asymmetric encryption", "It's a historical accident"], 1, "Each tool does what it's good at: key exchange and signatures set up trust and a shared key, then AES or ChaCha20 encrypts the traffic efficiently."]
    },
    {
      t: "PKI and certificates",
      sub: ["Certificate authorities", "Certificate chains", "mTLS", "Revocation"],
      body: `<p>Public keys alone don't tell you <i>whose</i> key it is. <b>PKI</b> (public key infrastructure) solves this with certificates: a certificate binds a public key to an identity (a domain name, a service, a person) and is signed by a <b>certificate authority</b>.</p>
<p>Certificates form a <b>chain</b>: your server's leaf certificate is signed by an intermediate CA, which is signed by a root CA. Root certificates are pre-installed in operating systems and browsers as trust anchors. Servers must send the leaf <i>and</i> intermediate certificates (the "full chain"); a missing intermediate is a common cause of errors on some devices but not others.</p>
<p>Checks a client performs: the signature chain leads to a trusted root; the name matches (Subject Alternative Name); the certificate is within its validity dates; it's allowed for this use; it hasn't been revoked.</p>
<p><b>mTLS</b> (mutual TLS) makes the client present a certificate too, so both sides authenticate. It's common between microservices (service meshes like Istio and Linkerd issue and rotate these automatically) and for machine-to-machine APIs. Organisations run a <b>private CA</b> for internal certificates.</p>
<p><b>Revocation</b> invalidates a certificate before expiry, for example after its private key leaks. CRLs (lists) and OCSP (online checks) exist but are unreliable in practice, so the industry moved to <b>short-lived certificates</b> with automated renewal (Let's Encrypt's 90 days, internal certificates of hours or days): a stolen key soon becomes useless.</p>`,
      lang: "bash",
      code: `# Inspect a real chain
openssl s_client -connect github.com:443 -servername github.com -showcerts </dev/null 2>/dev/null \\
  | grep -E "^ *[0-9] s:|i:"
#  0 s:CN = github.com             <- leaf
#    i:... Sectigo ECC Domain Validation Secure Server CA   <- intermediate
#  1 s:... Sectigo ECC Domain Validation Secure Server CA
#    i:... USERTrust ECC Certification Authority             <- root

# --- Build a tiny private PKI for mTLS (learning only) ---
# 1. Private root CA
openssl req -x509 -new -nodes -newkey ec -pkeyopt ec_paramgen_curve:P-256 \\
  -keyout ca.key -out ca.crt -days 30 -subj "/CN=Lab Root CA"

# 2. Server certificate signed by the CA (with a SAN)
openssl req -new -nodes -newkey ec -pkeyopt ec_paramgen_curve:P-256 \\
  -keyout server.key -out server.csr -subj "/CN=api.lab.local"
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \\
  -out server.crt -days 7 -extfile <(printf "subjectAltName=DNS:api.lab.local")

# 3. Client certificate the same way (CN=billing-service), then verify:
openssl verify -CAfile ca.crt server.crt          # server.crt: OK

# 4. Nginx enforcing mTLS:
#    ssl_client_certificate /etc/nginx/ca.crt;
#    ssl_verify_client on;`,
      ex: "Build the lab PKI above, run Nginx (Docker is fine) with the server certificate and <code>ssl_verify_client on</code>, and show that curl fails without a client certificate and succeeds with <code>--cert client.crt --key client.key --cacert ca.crt</code>. Then let the server certificate expire (issue one valid for 1 day and change the clock in a VM, or issue with past dates) and record the error.",
      q: ["Why has the industry moved towards short-lived certificates?", ["They are cheaper to print", "Revocation checks are unreliable, so short lifetimes limit how long a stolen key stays useful, and automation makes renewal painless", "Long certificates are not allowed by TLS", "Short certificates encrypt faster"], 1, "If a key leaks and revocation isn't checked, a 90-day or 24-hour certificate expires soon anyway. Automated renewal (ACME) makes this practical."]
    }
  ]
});

COURSE.push({
  n: 35, id: "python-packaging-lessons", fills: "python", title: "Python packaging", level: 1,
  blurb: "Virtual environments, dependencies and publishing.",
  lessons: [
    {
      t: "Virtual environments and packaging",
      sub: ["venv and pip", "requirements.txt and pyproject.toml", "uv / poetry overview", "Publishing a package"],
      body: `<p>Every project should have its own <b>virtual environment</b>: a folder with its own Python and installed packages. Without one, project A's need for Django 4 and project B's need for Django 5 collide in the same global install, and you risk breaking the operating system's Python. <code>python -m venv .venv</code> creates one; activate it and <code>pip</code> installs into it. Add <code>.venv/</code> to <code>.gitignore</code>.</p>
<p>Record dependencies so anyone can rebuild the environment. The simple way is a <b>requirements.txt</b> with pinned versions (<code>pip freeze &gt; requirements.txt</code>). The modern standard is <b>pyproject.toml</b>, one file for project metadata, dependencies and tool settings (ruff, pytest, mypy).</p>
<p>Pinning matters: "fastapi" today and "fastapi" in six months may be different versions. Apps should use a <b>lock file</b> with exact versions of every dependency, including indirect ones, so production matches what you tested. Libraries should state compatible ranges instead.</p>
<p>Tools that manage all of this: <b>uv</b> (very fast; creates the venv, installs, locks, runs scripts and manages Python versions) and <b>Poetry</b> (dependency management, locking and publishing). Both read pyproject.toml.</p>
<p>To <b>publish a package</b> so others can <code>pip install</code> it: give it a pyproject.toml with a name, version and build backend, build a wheel and source distribution, and upload to PyPI (try TestPyPI first). Use trusted publishing from GitHub Actions instead of storing tokens.</p>`,
      lang: "bash",
      code: `# --- The classic way ---
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\\Scripts\\activate
which python                       # .../project/.venv/bin/python
pip install fastapi "uvicorn[standard]"
pip freeze > requirements.txt
deactivate
# teammate:
python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt

# --- The modern way with uv ---
uv init myapp && cd myapp          # creates pyproject.toml
uv add fastapi uvicorn             # installs and writes uv.lock
uv add --dev pytest ruff
uv run uvicorn main:app --reload   # runs inside the project environment
uv sync                            # teammate: exact versions from uv.lock

# pyproject.toml (excerpt)
# [project]
# name = "slugkit"
# version = "0.1.0"
# requires-python = ">=3.10"
# dependencies = ["httpx>=0.27"]
# [build-system]
# requires = ["hatchling"]
# build-backend = "hatchling.build"

# --- Publish a library ---
uv build                           # dist/slugkit-0.1.0-py3-none-any.whl + .tar.gz
uv publish --publish-url https://test.pypi.org/legacy/   # try TestPyPI first`,
      ex: "Create a tiny library (for example a function that turns titles into URL slugs) with pyproject.toml, tests run by pytest and a README. Build it, publish it to TestPyPI, then in a fresh virtual environment install it from TestPyPI and use it.",
      q: ["Why should an application commit a lock file (uv.lock or pinned requirements)?", ["It makes the code run faster", "So every install, including production, gets exactly the dependency versions that were tested", "PyPI requires it", "It replaces the need for tests"], 1, "Without exact pins, a new release of any dependency (even an indirect one) can change behaviour between your laptop and production."]
    }
  ]
});

COURSE.push({
  n: 36, id: "bash-lessons", fills: "bash", title: "Shell scripting", level: 2,
  blurb: "Bash scripts that are correct, safe and useful.",
  lessons: [
    {
      t: "Bash fundamentals",
      sub: ["Variables and quoting", "Conditionals and loops", "Functions and arguments", "Exit codes"],
      body: `<p>A shell script is a file of commands with a <b>shebang</b> line (<code>#!/usr/bin/env bash</code>) and execute permission. Anything you type in the terminal can go in a script.</p>
<p><b>Variables</b>: <code>name="asha"</code> (no spaces around =), used as <code>"$name"</code>. <b>Always double-quote variables</b>: unquoted, a value with spaces or wildcards splits into several words, the source of countless bugs (and deleted files). Single quotes keep text literal; double quotes allow variables. <code>$(command)</code> captures a command's output.</p>
<p><b>Conditionals</b> use <code>[[ ... ]]</code>: <code>-f file</code> (file exists), <code>-d dir</code>, <code>-z "$x"</code> (empty), <code>==</code> for strings, <code>-eq -lt -gt</code> for numbers. <b>Loops</b>: <code>for f in *.log; do ...; done</code>, and <code>while read -r line; do ...; done &lt; file</code> for reading lines.</p>
<p><b>Arguments</b> arrive as <code>$1</code>, <code>$2</code>…, <code>$#</code> is how many, and <code>"$@"</code> is all of them (quoted). <b>Functions</b> take arguments the same way and are defined as <code>name() { ...; }</code>; use <code>local</code> for their variables.</p>
<p>Every command returns an <b>exit code</b>: 0 means success, anything else means failure. <code>$?</code> holds the last one. <code>&amp;&amp;</code> runs the next command only on success, <code>||</code> only on failure. Your scripts should <code>exit 1</code> on errors so callers (cron, CI) know something went wrong.</p>`,
      lang: "bash",
      code: `#!/usr/bin/env bash
# usage: ./report.sh <log_dir> [min_errors]

log_dir="$1"
min_errors="\${2:-5}"                # default value if $2 is missing

usage() { echo "usage: $0 <log_dir> [min_errors]" >&2; exit 1; }

[[ $# -lt 1 ]] && usage
if [[ ! -d "$log_dir" ]]; then
  echo "error: '$log_dir' is not a directory" >&2
  exit 1
fi

count_errors() {
  local file="$1"
  grep -ci "error" "$file" || true   # grep exits 1 when there are no matches
}

total=0
for file in "$log_dir"/*.log; do     # quoted: safe with spaces in names
  [[ -f "$file" ]] || continue
  n=$(count_errors "$file")
  total=$(( total + n ))
  if (( n >= min_errors )); then
    echo "WARN  $(basename "$file"): $n errors"
  fi
done

echo "total errors: $total"
(( total == 0 ))                     # exit code 0 only if there were no errors`,
      ex: "Write a script <code>backup.sh &lt;source&gt; &lt;dest&gt;</code> that checks both arguments, creates a dated tar.gz of the source in the destination, keeps only the 7 newest backups, prints a summary and exits non-zero on any failure. Test it with a folder whose name contains spaces.",
      q: ["Why write <code>rm \"$dir\"/*.tmp</code> rather than <code>rm $dir/*.tmp</code>?", ["Quotes make it faster", "Unquoted, a directory name with spaces splits into separate words, so rm could target the wrong paths", "Bash requires quotes around every word", "There's no difference"], 1, "Word splitting turns 'my files' into two arguments, 'my' and 'files/*.tmp'. Quoting keeps the value as one argument."]
    },
    {
      t: "Writing safe scripts",
      sub: ["set -euo pipefail", "Traps and cleanup", "Input validation", "Idempotent scripts"],
      body: `<p>By default Bash keeps going after errors, which is dangerous: a failed <code>cd</code> followed by <code>rm -rf *</code> deletes the wrong folder. Start scripts with <b>strict mode</b>:</p>
<ul><li><code>set -e</code>: exit when a command fails.</li><li><code>set -u</code>: treat unset variables as errors (catches typos like <code>$DIRR</code>).</li>
<li><code>set -o pipefail</code>: a pipeline fails if any command in it fails, not just the last.</li></ul>
<p><b>trap</b> runs code when the script exits or is interrupted, so temporary files are always cleaned up and locks released, even on errors or Ctrl+C.</p>
<p><b>Validate input</b> before acting on it: check argument counts, that paths exist, that values match an expected pattern (for example an environment must be <code>staging</code> or <code>production</code>). Refuse dangerous values like an empty path or <code>/</code>. Use <code>--</code> before file arguments so names starting with a dash aren't read as options.</p>
<p><b>Idempotent</b> scripts can run twice safely and end in the same state: <code>mkdir -p</code> instead of <code>mkdir</code>, check whether a user exists before creating it, append a config line only if it isn't already there. Deploy and setup scripts always get re-run, often after failing halfway.</p>
<p>Run <b>ShellCheck</b> on every script; it catches quoting bugs and common mistakes automatically.</p>`,
      lang: "bash",
      code: `#!/usr/bin/env bash
set -euo pipefail
IFS=$'\\n\\t'                          # safer word splitting

ENV="\${1:-}"
case "$ENV" in
  staging|production) ;;
  *) echo "usage: $0 staging|production" >&2; exit 2 ;;
esac

APP_DIR="/srv/myapp"
[[ -n "$APP_DIR" && "$APP_DIR" != "/" ]] || { echo "refusing unsafe APP_DIR" >&2; exit 1; }

# Temporary workspace, always removed (success, error or Ctrl+C)
tmp="$(mktemp -d)"
cleanup() { rm -rf -- "$tmp"; echo "cleaned up"; }
trap cleanup EXIT

# Only one deploy at a time
exec 9>/tmp/myapp-deploy.lock
flock -n 9 || { echo "another deploy is running" >&2; exit 1; }

# Idempotent steps
id -u myapp &>/dev/null || sudo useradd --system myapp
mkdir -p "$APP_DIR/releases"
grep -qxF 'vm.swappiness=10' /etc/sysctl.conf || echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

echo "deploying to $ENV"
curl -fsSL "https://example.com/builds/latest.tar.gz" -o "$tmp/app.tar.gz"   # -f: fail on HTTP errors
tar -xzf "$tmp/app.tar.gz" -C "$APP_DIR/releases"

# Check scripts with:  shellcheck deploy.sh`,
      ex: "Take a script you wrote earlier, add strict mode, a cleanup trap, input validation and a lock, then make every step idempotent. Run it twice in a row and show the second run changes nothing. Fix every warning ShellCheck reports.",
      q: ["What does <code>set -o pipefail</code> change?", ["Pipes run in parallel", "A pipeline's exit status reports a failure from any command in it, not only the last one", "It disables pipes", "It logs every command"], 1, "Without it, 'curl url | tar xz' reports success if tar succeeds even when curl failed. pipefail makes the failure visible to set -e."]
    },
    {
      t: "Text processing and automation",
      sub: ["sed and awk", "jq for JSON", "cron and timers", "Scripting APIs with curl"],
      body: `<p>Automation scripts mostly fetch data, transform it and act on it. You already know grep, sed and awk; in scripts, <b>awk</b> shines for column calculations and <b>sed</b> for in-place config edits.</p>
<p>Most APIs return JSON, and <b>jq</b> is the tool for it: <code>.field</code> selects a key, <code>.[]</code> iterates an array, <code>select(...)</code> filters, and <code>-r</code> prints raw strings for use in scripts. <code>jq -n --arg</code> builds JSON safely without string concatenation.</p>
<p><b>curl</b> calls APIs from the shell. Useful flags: <code>-s</code> silent, <code>-f</code> fail on HTTP errors, <code>-H</code> headers (auth tokens), <code>-d</code> request body, <code>-w '%{http_code}'</code> to print the status, <code>--retry</code> for flaky endpoints. Keep tokens in environment variables, never in the script itself.</p>
<p>To run scripts on a schedule, use <b>cron</b> (<code>crontab -e</code>; five fields: minute hour day month weekday) or <b>systemd timers</b> on servers. Cron runs with a minimal environment: use absolute paths, set PATH at the top, and redirect output to a log, otherwise failures vanish silently.</p>`,
      lang: "bash",
      code: `#!/usr/bin/env bash
# Daily: list open GitHub issues labelled "bug" older than 7 days and post a summary to a chat webhook
set -euo pipefail
: "\${GITHUB_TOKEN:?set GITHUB_TOKEN}"   # fail early if missing
: "\${WEBHOOK_URL:?set WEBHOOK_URL}"
REPO="Pallak-08/forge-academy"

cutoff=$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ)   # macOS: date -u -v-7d ...

issues=$(curl -fsS --retry 3 \\
  -H "Authorization: Bearer $GITHUB_TOKEN" \\
  -H "Accept: application/vnd.github+json" \\
  "https://api.github.com/repos/$REPO/issues?state=open&labels=bug&per_page=100")

old=$(echo "$issues" | jq -r --arg c "$cutoff" \\
  '.[] | select(.created_at < $c) | "- #\\(.number) \\(.title)"')
count=$(echo "$issues" | jq --arg c "$cutoff" '[.[] | select(.created_at < $c)] | length')

text="Stale bugs in $REPO: $count"$'\\n'"$old"
payload=$(jq -n --arg t "$text" '{text: $t}')      # safe JSON, no manual escaping

status=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' \\
  -d "$payload" "$WEBHOOK_URL")
[[ "$status" == 2* ]] || { echo "webhook failed: $status" >&2; exit 1; }

# crontab -e   (weekdays at 09:15, with output logged)
# PATH=/usr/local/bin:/usr/bin:/bin
# 15 9 * * 1-5  /home/asha/bin/stale-bugs.sh >> /home/asha/logs/stale-bugs.log 2>&1`,
      ex: "Write a script that calls a public JSON API (for example the GitHub API for a repository you like), extracts five facts with jq, writes them as a line to a CSV with today's date and exits non-zero on any HTTP error. Schedule it with cron or a systemd timer to run daily, and check the log after it runs.",
      q: ["A script works in your terminal but fails silently from cron. What is the most likely cause?", ["cron can't run Bash", "cron uses a minimal environment (short PATH, no shell config), and output isn't captured unless redirected", "The script is too long", "cron only runs Python"], 1, "Use absolute paths or set PATH, load needed variables explicitly, and redirect stdout and stderr to a log file."]
    }
  ]
});
