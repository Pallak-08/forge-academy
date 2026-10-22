/* Forge Academy lessons: Redis (caching) and Ansible (automation). Original content. */
window.COURSE = window.COURSE || [];

COURSE.push({
  n: 91, id: "redis-lessons", fills: "redis", title: "Redis and caching", level: 2,
  blurb: "Keep hot data in memory: caching patterns, data types and the common production uses of Redis.",
  lessons: [
    {
      t: "Why caching, and what Redis is",
      sub: ["Memory vs disk", "When a cache helps", "Cache, store and broker", "redis-cli basics", "Keys and expiry"],
      body: `<p>Reading from a disk or a database takes milliseconds; reading from memory (RAM) takes microseconds, a thousand times faster. A <b>cache</b> keeps a copy of data you read often in fast memory so most requests never touch the slow source. <b>Redis</b> is an in-memory data store: a separate server that holds key–value data in RAM and answers over the network in well under a millisecond.</p>
<p>A cache pays off when the same data is read far more often than it changes, and when recomputing or re-fetching it is expensive: a product page, a user's profile, the result of a heavy database query, an API response you are allowed to reuse for a minute. It does <i>not</i> help for data that is written as often as it is read, or that must always be perfectly current.</p>
<p>Redis is used three ways, all built on the same key–value core:</p>
<ul>
<li><b>Cache</b> — a fast copy in front of a database. If the key is missing you fall back to the database and store the result.</li>
<li><b>Primary store</b> — the source of truth for data that suits it: sessions, rate-limit counters, leaderboards, queues.</li>
<li><b>Message broker</b> — passing jobs or events between services (lists, streams, or pub/sub).</li>
</ul>
<p>Everything in Redis is stored under a <b>key</b>, a unique string you choose. A good convention is to namespace keys with colons, like <code>user:42:profile</code> or <code>session:abc123</code>, so they are easy to group and reason about. Any key can be given an <b>expiry</b> (a time to live, or TTL); when the TTL runs out Redis deletes the key automatically, which is exactly what you want for cached data that should not live forever.</p>`,
      lang: "bash",
      code: `# Start Redis (Docker is the easiest way)
docker run -d --name redis -p 6379:6379 redis:7

# Open the interactive client
redis-cli                 # connects to localhost:6379

# Set and get a value
SET user:42:name "Ada"
GET user:42:name          # "Ada"

# Store with an expiry: this key deletes itself in 60 seconds
SET session:abc123 "user=42" EX 60
TTL session:abc123        # seconds left, e.g. (integer) 58

# Check, then remove
EXISTS user:42:name       # (integer) 1
DEL user:42:name          # (integer) 1`,
      ex: "Start Redis with Docker. In <code>redis-cli</code>, store three keys for a fake user (<code>user:1:name</code>, <code>user:1:email</code>, <code>user:1:plan</code>). Give the plan key a 30-second expiry and watch <code>TTL</code> count down until <code>GET</code> returns <code>(nil)</code>. Write one sentence explaining when you would want a key to expire like that.",
      q: ["What makes a piece of data a good fit for caching in Redis?", ["It is written far more often than it is read", "It must always reflect the latest value with no delay", "It is read far more often than it changes and is costly to fetch", "It is too large to fit on disk"], 2, "Caches pay off for read-heavy data that is expensive to produce and changes rarely, so a slightly stale copy is acceptable."]
    },
    {
      t: "Core data types and commands",
      sub: ["Strings and counters", "Hashes", "Lists", "Sets and sorted sets", "Eviction policies"],
      body: `<p>Redis values are not just plain strings; it has data structures, each with its own commands. Choosing the right one keeps your code small and fast.</p>
<ul>
<li><b>Strings</b> hold text or numbers. Because numeric strings can be incremented atomically with <code>INCR</code>, they make perfect counters (page views, API calls) with no race conditions even under heavy concurrency.</li>
<li><b>Hashes</b> store a set of field–value pairs under one key, like a small record. <code>user:42</code> can hold <code>name</code>, <code>email</code> and <code>plan</code> fields, read all at once with <code>HGETALL</code> or one at a time with <code>HGET</code>.</li>
<li><b>Lists</b> are ordered sequences you push to and pop from either end, which makes them simple queues (<code>LPUSH</code> to add, <code>RPOP</code> to take the oldest).</li>
<li><b>Sets</b> hold unique unordered members, good for "has this user seen this post?" checks. <b>Sorted sets</b> add a score to each member and keep them ordered by it, which is how leaderboards and "top N" rankings are built.</li>
</ul>
<p>Because Redis keeps everything in RAM, memory is finite. When it fills up, an <b>eviction policy</b> decides what to drop. The common choice for a cache is <code>allkeys-lru</code>, which removes the least-recently-used keys first — the ones you are least likely to miss. For a primary store where losing data is unacceptable you use <code>noeviction</code> instead, so writes fail loudly rather than silently discarding data.</p>`,
      lang: "bash",
      code: `# Strings as an atomic counter
INCR page:home:views        # (integer) 1
INCR page:home:views        # (integer) 2  — safe even with many clients at once

# Hash: a small record in one key
HSET user:42 name "Ada" email "ada@example.com" plan "pro"
HGET user:42 plan           # "pro"
HGETALL user:42             # all fields and values

# List as a simple queue
LPUSH jobs:email "send:welcome:42"
RPOP jobs:email             # "send:welcome:42"  (oldest out first)

# Sorted set as a leaderboard
ZADD leaderboard 100 "ada" 250 "sam" 175 "lee"
ZREVRANGE leaderboard 0 2 WITHSCORES   # top 3: sam 250, lee 175, ada 100`,
      ex: "Build a tiny leaderboard in <code>redis-cli</code>. Add five players to a sorted set with <code>ZADD</code> and random scores, then show the top three with <code>ZREVRANGE ... WITHSCORES</code>. Separately, use <code>INCR</code> to count 'likes' on a post and confirm the value survives running the command from two terminals at once.",
      q: ["You need a real-time 'top 10 players by score' ranking. Which Redis type fits best?", ["A list", "A hash", "A sorted set", "A plain string"], 2, "Sorted sets keep members ordered by a numeric score, so returning the top N is a single range command."]
    },
    {
      t: "Caching patterns in a web app",
      sub: ["Cache-aside", "Setting a TTL", "Invalidation on write", "Sessions and rate limiting", "Avoiding stampedes"],
      body: `<p>The most common pattern is <b>cache-aside</b> (also called lazy loading). On a read, the application first asks Redis. On a <b>hit</b> it returns the cached value. On a <b>miss</b> it reads the database, stores the result in Redis with a TTL, and returns it. The next readers get the fast copy until it expires. The code owns the logic, so it is explicit and easy to reason about.</p>
<p>The hard part of caching is <b>invalidation</b> — making sure a cached copy does not outlive the truth. Two tools cover most cases: a <b>TTL</b> so every entry is wrong for at most a bounded time, and <b>explicit deletion</b> on write, where any code that updates a record also deletes its cache key so the next read refills it. Use both: the TTL is your safety net, the delete keeps things fresh.</p>
<p>Beyond caching, Redis is a natural home for <b>sessions</b> (a key per session with a TTL that refreshes on activity) and <b>rate limiting</b> (<code>INCR</code> a per-user key with a short expiry and reject the request once it passes a limit). One caution: when a popular key expires, many requests can miss at once and all hit the database together — a <b>cache stampede</b>. Mitigate it by adding a little randomness to TTLs so keys do not all expire on the same second, and by refreshing hot keys slightly before they expire.</p>`,
      lang: "javascript",
      code: `import { createClient } from "redis";
const redis = createClient();
await redis.connect();

// Cache-aside read: Redis first, database on a miss
async function getProduct(id) {
  const key = \`product:\${id}\`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);          // HIT

  const product = await db.products.findById(id);  // MISS: slow source
  // store for 5 minutes, with jitter so keys don't all expire together
  const ttl = 300 + Math.floor(Math.random() * 30);
  await redis.set(key, JSON.stringify(product), { EX: ttl });
  return product;
}

// On write, delete the key so the next read refills it
async function updateProduct(id, changes) {
  await db.products.update(id, changes);
  await redis.del(\`product:\${id}\`);               // invalidate
}

// Simple per-user rate limit: 100 requests per minute
async function allow(userId) {
  const key = \`rate:\${userId}\`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 60);
  return n <= 100;
}`,
      ex: "Add cache-aside to one endpoint in any app you have (or a 20-line Express app): read from Redis, fall back to a slow function on a miss, and store the result with a 60-second TTL. Log 'HIT' or 'MISS' each time. Call it in a loop and confirm the first call misses and the rest hit. Then add an update function that deletes the key, and show the next read misses again.",
      q: ["Why should code that updates a database record also delete that record's Redis key?", ["To free memory on every write", "So the next read refills the cache and users don't see a stale copy", "Because Redis cannot store updated values", "To reset the key's data type"], 1, "Deleting the key on write forces the next read to reload fresh data; the TTL is only a backstop for cases you miss."]
    }
  ]
});

COURSE.push({
  n: 92, id: "ansible-lessons", fills: "ansible", title: "Ansible and configuration management", level: 2,
  blurb: "Describe a server's desired state once and apply it repeatably: inventory, playbooks, roles and secrets.",
  lessons: [
    {
      t: "What Ansible is and how it runs",
      sub: ["Configuration as code", "Agentless over SSH", "Inventory", "Modules and idempotency", "Ad-hoc commands"],
      body: `<p>Setting up a server by hand — installing packages, editing config files, starting services — works once and is impossible to reproduce reliably. <b>Configuration management</b> replaces those manual steps with code that describes the <i>desired state</i> of a machine, so you can apply it to one server or a hundred and get the same result every time. <b>Ansible</b> is the most widely used such tool, and the gentlest to start with.</p>
<p>Ansible is <b>agentless</b>: there is nothing to install on the machines you manage. From a control machine (your laptop or a CI runner) it connects to each target over <b>SSH</b> and runs small programs called <b>modules</b>. That means any server you can SSH into, you can manage with Ansible.</p>
<p>The list of machines Ansible manages is the <b>inventory</b> — a file of hostnames or IPs, usually grouped (<code>[web]</code>, <code>[db]</code>). You then tell Ansible to run tasks against a group.</p>
<p>The idea that makes Ansible safe to re-run is <b>idempotency</b>: a task describes a state ("this package is installed", "this service is running"), not an action. If the machine is already in that state, the task makes no change and reports <code>ok</code>; if not, it makes the change and reports <code>changed</code>. So running the same playbook twice is harmless — the second run simply confirms everything is already as declared.</p>`,
      lang: "bash",
      code: `# Inventory file: hosts.ini
# [web]
# 203.0.113.10
# 203.0.113.11
#
# [web:vars]
# ansible_user=ubuntu

# Check Ansible can reach every host (the 'ping' module, not ICMP)
ansible web -i hosts.ini -m ping
# 203.0.113.10 | SUCCESS => {"ping": "pong"}

# Ad-hoc command: run one module without writing a playbook
ansible web -i hosts.ini -m command -a "uptime"

# Install a package on every web host (idempotent: safe to repeat)
ansible web -i hosts.ini -m apt -a "name=nginx state=present" --become
# first run:  changed
# second run: ok  (already installed, nothing to do)`,
      ex: "Create a two-host inventory (you can use two local VMs, containers, or one cloud VM twice). Run the <code>ping</code> module to confirm Ansible reaches both. Then use an ad-hoc <code>apt</code> (or <code>yum</code>) command to install <code>curl</code>, run it twice, and note how the second run reports <code>ok</code> instead of <code>changed</code>. Explain idempotency in one sentence.",
      q: ["What does it mean that an Ansible task is idempotent?", ["It can only run once", "Re-running it makes no further change if the machine is already in the declared state", "It runs faster the second time", "It requires an agent on the target"], 1, "Tasks declare a desired state, so a second run changes nothing when the state already matches — making playbooks safe to re-apply."]
    },
    {
      t: "Playbooks, tasks and variables",
      sub: ["YAML playbook structure", "Tasks and modules", "Variables and facts", "Handlers", "Loops and conditionals"],
      body: `<p>Ad-hoc commands are fine for one-offs. For anything you want to keep and repeat, you write a <b>playbook</b>: a YAML file listing, in order, the tasks to bring a group of hosts to a desired state. A playbook reads almost like a checklist.</p>
<p>A playbook has one or more <b>plays</b>. Each play targets a group (<code>hosts: web</code>) and contains a list of <b>tasks</b>. Each task gives a human name and calls one <b>module</b> (<code>apt</code>, <code>copy</code>, <code>template</code>, <code>service</code>…) with arguments. Ansible runs the tasks top to bottom on every host, reporting <code>ok</code>, <code>changed</code> or <code>failed</code> for each.</p>
<p><b>Variables</b> keep playbooks flexible — a port number, a package version, a username defined once and reused. Ansible also gathers <b>facts</b> about each host automatically (its OS, IP, memory), which you can use in tasks and templates. You can branch with <code>when:</code> conditionals (only run on Ubuntu, say) and repeat a task over a list with <code>loop:</code>.</p>
<p>A <b>handler</b> is a task that runs only when another task reports a change, and only once at the end — the classic use is "restart nginx, but only if its config actually changed". A task <code>notify</code>s the handler; if nothing changed, the handler never fires and the service is not needlessly restarted.</p>`,
      lang: "yaml",
      code: `# site.yml — install and configure nginx on the web group
- name: Configure web servers
  hosts: web
  become: true                      # run tasks with sudo
  vars:
    packages:
      - nginx
      - curl
  tasks:
    - name: Install packages
      apt:
        name: "{{ packages }}"       # a variable (a list)
        state: present
      loop: "{{ packages }}"         # (apt also accepts the list directly)

    - name: Copy the site config
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/sites-available/default
      notify: Restart nginx          # fire the handler only if this changed

    - name: Ensure nginx is running and starts on boot
      service:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Restart nginx
      service:
        name: nginx
        state: restarted

# Run it:  ansible-playbook -i hosts.ini site.yml`,
      ex: "Write a playbook that, on a test VM, installs nginx, copies an <code>index.html</code> you wrote, and makes sure nginx is running. Add a handler that restarts nginx only when the config changes. Run the playbook twice and confirm the second run reports all green with no changes. Then change the config and confirm only then does the handler fire.",
      q: ["In a playbook, when does a handler notified by a task actually run?", ["Before every task", "Only when the task that notifies it reports a change", "Every time the playbook runs, regardless", "Only on the first ever run"], 1, "Handlers run once at the end of a play, and only if a notifying task reported 'changed' — so services restart only when something they depend on actually changed."]
    },
    {
      t: "Roles, templates and real deployments",
      sub: ["Roles and structure", "Jinja2 templates", "Secrets with Ansible Vault", "Deploying an app", "Keeping it idempotent"],
      body: `<p>As playbooks grow, you organise them into <b>roles</b> — reusable, self-contained units for one job ("set up nginx", "deploy the app"), each with a standard folder layout for its tasks, templates, variables and files. A top-level playbook then just lists the roles to apply to each group, and roles can be shared across projects or pulled from Ansible Galaxy.</p>
<p>Configuration files rarely stay identical across environments, so Ansible fills them in from <b>Jinja2 templates</b> — text files with <code>{{ variable }}</code> placeholders and simple logic. The <code>template</code> module renders the file with the host's variables and facts before copying it, so the same template produces the right config for staging and production.</p>
<p>Deployments need <b>secrets</b> — database passwords, API keys — and those must never sit in plain text in your repository. <b>Ansible Vault</b> encrypts files or individual variables; the playbook decrypts them at run time when you supply the vault password, so secrets live safely alongside the code.</p>
<p>A typical app deploy role pulls the latest code, installs dependencies, renders the environment config from a template, runs database migrations, and restarts the service via a handler. Because every task is idempotent, you can run the same deploy repeatedly: unchanged steps stay <code>ok</code>, and only the genuinely new work (new code, a changed config) shows as <code>changed</code>. That is the whole promise of configuration management — one description, applied safely, as many times as you need.</p>`,
      lang: "yaml",
      code: `# Role layout (created by: ansible-galaxy init roles/app)
# roles/app/
#   tasks/main.yml       the steps
#   templates/env.j2     config template
#   handlers/main.yml    restart handler
#   defaults/main.yml    default variables

# roles/app/tasks/main.yml
- name: Pull the latest code
  git:
    repo: "{{ app_repo }}"
    dest: /srv/app
    version: main
  notify: Restart app

- name: Render the environment file from a template
  template:
    src: env.j2
    dest: /srv/app/.env
    mode: "0640"
  notify: Restart app

- name: Install dependencies
  command: npm ci
  args: { chdir: /srv/app }

# Encrypt a secrets file:   ansible-vault encrypt group_vars/web/vault.yml
# Run with the vault open:  ansible-playbook -i hosts.ini site.yml --ask-vault-pass`,
      ex: "Turn your nginx playbook from the last lesson into a role with <code>ansible-galaxy init</code>, then add a second role that deploys a small static or Node app (pull code, render a <code>.env</code> from a Jinja2 template, restart via a handler). Put one secret in an Ansible Vault file and confirm the playbook only runs when you supply the vault password. Run the whole thing twice to prove it is idempotent.",
      q: ["Why render a server's config file from a Jinja2 template instead of copying a fixed file?", ["Templates run faster", "The same template fills in per-host variables and facts, giving each environment the right config", "Copying files is not idempotent", "Jinja2 encrypts the file automatically"], 1, "Templates substitute variables and host facts at run time, so one template produces correct, environment-specific config everywhere it is applied."]
    }
  ]
});
