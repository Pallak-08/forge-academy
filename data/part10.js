/* Forge Academy lessons: how the internet works, networking for engineers */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 28, id: "internet-lessons", fills: "internet", title: "How the internet and the web work", level: 1,
  blurb: "Networks, DNS, HTTPS, browsers and hosting: the path from a URL to a page.",
  lessons: [
    {
      t: "Networks, IP addresses and packets",
      sub: ["What a network is", "IP addresses: IPv4 and IPv6", "Packets and routing", "TCP vs UDP", "Ports"],
      body: `<p>A <b>network</b> is a set of devices that can send data to each other. The internet is a network of networks: your home Wi-Fi joins your internet provider's network, which joins other providers, all the way to the data centre hosting a website.</p>
<p>Every device on a network has an <b>IP address</b>. IPv4 addresses look like <code>142.250.183.14</code> (four numbers, about 4.3 billion possible addresses, which ran out). IPv6 addresses look like <code>2404:6800:4009:82b::200e</code> and have practically unlimited space. Most networks run both.</p>
<p>Data is not sent in one piece. It is split into <b>packets</b>, each with a source address, destination address and a slice of the data. <b>Routers</b> pass each packet one hop closer to its destination, and packets of the same message can take different routes and arrive out of order.</p>
<p>Two transport protocols sit on top of IP:</p>
<ul><li><b>TCP</b> sets up a connection, numbers the packets, resends lost ones and delivers them in order. Web pages, APIs, email and SSH use TCP because every byte matters.</li>
<li><b>UDP</b> just sends packets with no guarantee. It is faster, so video calls, online games and DNS lookups use it: a late packet is useless anyway.</li></ul>
<p>A <b>port</b> picks which program on a machine receives the data. The IP address finds the building; the port finds the flat. Web servers listen on 80 (HTTP) and 443 (HTTPS), SSH on 22, PostgreSQL on 5432.</p>`,
      lang: "bash",
      code: `# Your own addresses
ip addr            # Linux  (macOS: ifconfig, Windows: ipconfig)
curl -s https://ifconfig.me ; echo   # your public IP, as the internet sees you

# Is a host reachable? (ICMP echo; some servers block it)
ping -c 4 google.com

# Every router hop between you and a server
traceroute google.com      # Windows: tracert google.com

# Open a raw TCP connection to port 443 and see it succeed
nc -vz example.com 443
# Connection to example.com 443 port [tcp/https] succeeded!

# Which programs on your machine are listening, and on which ports
ss -tulpn          # macOS: lsof -iTCP -sTCP:LISTEN`,
      ex: "Find your private IP (from <code>ip addr</code> or <code>ipconfig</code>) and your public IP (from ifconfig.me). Explain in two sentences why they are different. Then run <code>traceroute</code> to three websites in different countries and note how many hops each takes and where the time jumps.",
      q: ["A video call app is choosing a transport protocol. Why do most pick UDP?", ["UDP encrypts data and TCP does not", "A late or lost packet is useless in live video, so TCP's resending only adds delay", "UDP packets are larger", "TCP cannot carry audio"], 1, "TCP guarantees delivery by resending, which adds delay. For live media, skipping a lost frame is better than waiting for it."]
    },
    {
      t: "DNS and domain names",
      sub: ["How a name becomes an IP address", "Record types: A, AAAA, CNAME, MX, TXT", "Registrars and nameservers", "DNS caching and TTL", "Using dig and nslookup"],
      body: `<p>Computers connect using IP addresses, but people remember names. <b>DNS</b> (the Domain Name System) is the internet's phone book that turns <code>github.com</code> into an IP address.</p>
<p>When you look up a name, your computer asks a <b>resolver</b> (run by your ISP, or public ones like 1.1.1.1 and 8.8.8.8). If the resolver doesn't have the answer cached, it walks the hierarchy: a <b>root server</b> points to the <code>.com</code> servers, which point to the domain's own <b>authoritative nameservers</b>, which return the answer.</p>
<p>The main <b>record types</b>:</p>
<ul><li><b>A</b>: name → IPv4 address. <b>AAAA</b>: name → IPv6 address.</li>
<li><b>CNAME</b>: name → another name (www.example.com → example.com, or your app → yourapp.vercel.app).</li>
<li><b>MX</b>: which servers receive email for the domain.</li>
<li><b>TXT</b>: free text, used to prove you own a domain and for email security (SPF, DKIM, DMARC).</li></ul>
<p>You buy a domain from a <b>registrar</b> (Namecheap, GoDaddy, Cloudflare). The registrar records which nameservers are authoritative for it; you then add records at those nameservers.</p>
<p>Every record has a <b>TTL</b> (time to live) in seconds: how long resolvers may cache it. That is why DNS changes "take time to propagate". Before a planned migration, lower the TTL to 300 a day early so the switch is quick.</p>`,
      lang: "bash",
      code: `# Simple lookup
nslookup github.com

# dig gives the full answer, including TTL
dig github.com
# github.com.   60   IN   A   20.207.73.82
#               ^ TTL in seconds

# Ask for specific record types
dig +short AAAA google.com
dig +short MX gmail.com
dig +short TXT google.com
dig +short CNAME www.github.com

# Ask a specific resolver (useful to check propagation)
dig @1.1.1.1 +short example.com
dig @8.8.8.8 +short example.com

# Watch the full resolution walk from the root servers
dig +trace example.com`,
      ex: "Pick a site you use daily. Use <code>dig</code> to find its A, AAAA, MX and TXT records and the TTL of its A record. Then run <code>dig +trace</code> on it and write down each step: root, top-level domain, authoritative server, final answer.",
      q: ["You will move your site to a new server tomorrow. Its A record has a TTL of 86400. What should you do today?", ["Nothing, DNS updates instantly", "Lower the TTL (for example to 300) so resolvers stop caching the old address for a full day", "Delete the A record", "Add an MX record"], 1, "Resolvers may cache the old IP for up to the TTL. Lowering it in advance makes the switch take minutes instead of a day."]
    },
    {
      t: "HTTPS and TLS",
      sub: ["Why plain HTTP is unsafe", "Certificates and certificate authorities", "The TLS handshake in plain words", "HSTS", "Inspecting a certificate"],
      body: `<p>Plain HTTP sends everything as readable text. Anyone between you and the server (public Wi-Fi, a compromised router, an ISP) can read passwords and cookies, or change the page on the way. <b>HTTPS</b> is HTTP inside <b>TLS</b>, which gives three guarantees:</p>
<ul><li><b>Encryption</b>: nobody in the middle can read the traffic.</li>
<li><b>Integrity</b>: nobody can change it without being detected.</li>
<li><b>Authentication</b>: you are really talking to the site named in the address bar.</li></ul>
<p>Authentication comes from a <b>certificate</b>: a file holding the site's public key and domain name, signed by a <b>certificate authority</b> (CA) such as Let's Encrypt. Your browser and operating system ship with a list of trusted CAs, so the browser can check the signature chain.</p>
<p>The <b>TLS handshake</b>, in plain words: the browser says hello and lists what encryption it supports; the server replies with its certificate; the browser checks the certificate is valid, unexpired and for this domain; both sides then use key exchange to agree on a shared secret key without ever sending it; from then on all data is encrypted with that key. TLS 1.3 does this in one round trip.</p>
<p><b>HSTS</b> is a response header that tells the browser "only ever use HTTPS for this site", so a user typing the plain address can't be downgraded to HTTP. Certificates from Let's Encrypt are free and renew automatically, so there is no reason for any site to run without HTTPS.</p>`,
      lang: "bash",
      code: `# See the certificate a site presents
openssl s_client -connect github.com:443 -servername github.com </dev/null 2>/dev/null \\
  | openssl x509 -noout -subject -issuer -dates
# subject=CN = github.com
# issuer=C = GB, ... CN = Sectigo ECC Domain Validation Secure Server CA
# notBefore=...   notAfter=...

# See the TLS version and cipher that were negotiated
curl -sv https://example.com -o /dev/null 2>&1 | grep -E "SSL connection|subject|expire"

# Does the site send HSTS?
curl -sI https://github.com | grep -i strict-transport-security
# strict-transport-security: max-age=31536000; includeSubdomains; preload

# What does plain HTTP do? (should redirect to HTTPS)
curl -sI http://github.com | head -3`,
      ex: "For three websites, find the certificate issuer, expiry date and whether they send an HSTS header. Then click the padlock in your browser for one of them and follow the certificate chain up to the root CA. Write down each certificate in the chain.",
      q: ["What does a certificate authority's signature prove?", ["That the website has no vulnerabilities", "That the public key in the certificate really belongs to the named domain", "That the traffic is compressed", "That the server is fast"], 1, "The CA vouches that the key belongs to whoever controls the domain. It says nothing about whether the site is safe or trustworthy otherwise."]
    },
    {
      t: "How browsers render pages",
      sub: ["Parsing HTML into the DOM", "CSS and the render tree", "Layout, paint and composite", "Where JavaScript blocks rendering", "DevTools Network and Performance panels"],
      body: `<p>When HTML arrives, the browser turns it into pixels in stages. Knowing them explains most front-end performance advice.</p>
<ol><li><b>Parse HTML → DOM.</b> The browser reads the HTML top to bottom and builds the DOM, a tree of element objects.</li>
<li><b>Parse CSS → CSSOM.</b> Stylesheets become a tree of style rules. CSS is <b>render-blocking</b>: the browser won't paint until it has the CSS, to avoid a flash of unstyled content.</li>
<li><b>Render tree.</b> DOM + CSSOM, keeping only visible elements (<code>display:none</code> is dropped).</li>
<li><b>Layout.</b> Work out the exact size and position of every box.</li>
<li><b>Paint and composite.</b> Fill in pixels (text, colours, images) in layers, then combine the layers on screen.</li></ol>
<p>A plain <code>&lt;script src&gt;</code> in the <code>&lt;head&gt;</code> <b>stops HTML parsing</b> until the script downloads and runs, because the script might change the page. Use <code>defer</code> (download in parallel, run after parsing, in order) or <code>async</code> (run as soon as it downloads) to avoid this.</p>
<p>After the first render, changing an element's size or position triggers <b>layout again</b> (expensive, especially if repeated in a loop). Changing only <code>transform</code> or <code>opacity</code> can skip layout and paint, which is why smooth animations use them.</p>
<p>The <b>Network</b> panel in DevTools shows every request, its size and a waterfall of when it loaded. The <b>Performance</b> panel records parsing, scripting, layout and paint so you can see what is slow.</p>`,
      lang: "html",
      code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Render order demo</title>

  <!-- CSS blocks rendering, so keep it small and load it early -->
  <link rel="stylesheet" href="styles.css">

  <!-- BAD: blocks HTML parsing until downloaded and run -->
  <!-- <script src="app.js"></script> -->

  <!-- GOOD: downloads in parallel, runs after the HTML is parsed, in order -->
  <script src="app.js" defer></script>

  <!-- Independent scripts (analytics) can run whenever ready -->
  <script src="analytics.js" async></script>
</head>
<body>
  <h1>Hello</h1>
  <!-- Reserve space for images so layout doesn't jump when they load -->
  <img src="hero.jpg" width="1200" height="600" alt="Product screenshot">
</body>
</html>

<style>
  /* Smooth: transform/opacity skip layout and paint */
  .card:hover { transform: translateY(-4px); transition: transform .2s; }
  /* Janky: changing top/height triggers layout on every frame */
  .card-bad:hover { top: -4px; height: 210px; }
</style>`,
      ex: "Open any news site, then DevTools → Network, tick 'Disable cache' and reload. Find the HTML document, the largest file and any render-blocking scripts in the head. Then record 5 seconds in the Performance panel and identify how long scripting, rendering and painting took.",
      q: ["Why does adding <code>defer</code> to a script in the head usually make a page show content sooner?", ["It makes the script smaller", "The browser keeps parsing HTML while the script downloads and runs it only after parsing", "It skips running the script", "It moves CSS loading later"], 1, "Without defer, parsing stops at the script tag. With defer, download happens in parallel and execution waits until the DOM is built."]
    },
    {
      t: "Hosting, servers and the cloud",
      sub: ["What a web server does", "Static vs dynamic hosting", "CDNs", "Shared, VPS, PaaS and serverless hosting", "Domains + hosting = a live site"],
      body: `<p>A <b>web server</b> is a program (Nginx, Apache, or your own Node/Python app) that listens on port 80/443, receives HTTP requests and sends responses.</p>
<p><b>Static hosting</b> serves files exactly as they are: HTML, CSS, JavaScript, images. It is cheap, fast and very hard to break, and suits portfolios, docs and single-page apps. <b>Dynamic hosting</b> runs code for each request, usually talking to a database, so the response can differ per user (logins, carts, dashboards).</p>
<p>A <b>CDN</b> (content delivery network, such as Cloudflare or the one built into Vercel) keeps copies of your files on servers around the world, so a user in Chennai downloads from a nearby city instead of from the US. CDNs also absorb traffic spikes and attacks.</p>
<p>Ways to host, from most control to least work:</p>
<ul><li><b>VPS</b> (DigitalOcean, AWS EC2, Hetzner): a virtual Linux machine. You install and patch everything yourself.</li>
<li><b>Shared hosting</b>: many sites on one machine, managed by the host. Cheap, limited.</li>
<li><b>PaaS</b> (Render, Railway, Heroku-style): push code, they build and run it.</li>
<li><b>Serverless / edge</b> (Vercel, Netlify, Cloudflare Workers, AWS Lambda): you deploy functions or static files; they run only when requested and scale automatically.</li></ul>
<p>To get a live site: deploy to a host, which gives you a URL like <code>myapp.vercel.app</code>; buy a domain; add a CNAME or A record pointing the domain to the host; the host issues an HTTPS certificate automatically.</p>`,
      lang: "bash",
      code: `# Serve a folder as a static site on your own machine
mkdir mysite && cd mysite
echo '<h1>Hello from my server</h1>' > index.html
python3 -m http.server 8000
# open http://localhost:8000

# Look at what a real server sends back
curl -sI https://vercel.com
# server: Vercel
# x-vercel-cache: HIT        <- served from the CDN cache
# age: 1234                  <- seconds since it was cached

# Deploy the folder to the internet for free (static hosting)
npm i -g vercel
vercel deploy --prod         # gives you https://mysite-xxxx.vercel.app

# Point your own domain at it (at your DNS provider):
#   www.mysite.com   CNAME   cname.vercel-dns.com`,
      ex: "Build a one-page personal site (plain HTML and CSS). Deploy it to Vercel, Netlify or GitHub Pages. Use <code>curl -I</code> on your live URL and identify the headers that show it is served through a CDN. Bonus: connect a free subdomain or a cheap domain to it.",
      q: ["Your portfolio is plain HTML, CSS and images. Which hosting fits best?", ["A VPS you patch yourself", "Static hosting behind a CDN", "A dedicated database server", "A Kubernetes cluster"], 1, "Static files need no server-side code. Static hosting with a CDN is free or nearly free, fast everywhere and needs no maintenance."]
    }
  ]
});

COURSE.push({
  n: 29, id: "networking-lessons", fills: "networking", title: "Networking for engineers", level: 2,
  blurb: "Protocols, subnets, DNS, load balancers, troubleshooting and network security.",
  lessons: [
    {
      t: "Network models and protocols",
      sub: ["OSI and TCP/IP models", "Ethernet, IP, TCP, UDP", "ICMP and ping", "Common ports"],
      body: `<p>Networking is built in <b>layers</b>. Each layer does one job and relies on the one below. Engineers use these models to say where a problem is ("it's a layer 7 issue" means the application, not the cable).</p>
<p>The <b>OSI model</b> has seven layers; the practical <b>TCP/IP model</b> merges them into four:</p>
<ul><li><b>Link</b> (OSI 1–2): getting bits across one physical network. Ethernet, Wi-Fi, MAC addresses.</li>
<li><b>Internet</b> (OSI 3): getting packets between networks. IP addresses and routing.</li>
<li><b>Transport</b> (OSI 4): getting data to the right program, reliably (TCP) or quickly (UDP). Ports.</li>
<li><b>Application</b> (OSI 5–7): what the data means. HTTP, DNS, SSH, SMTP, TLS.</li></ul>
<p>Each layer wraps the one above it: an HTTP request goes inside a TCP segment, inside an IP packet, inside an Ethernet frame. This is called <b>encapsulation</b>.</p>
<p><b>TCP</b> starts with a three-way handshake (SYN, SYN-ACK, ACK), then guarantees ordered, complete delivery. <b>UDP</b> sends datagrams with no handshake. <b>ICMP</b> carries control messages; <code>ping</code> sends ICMP echo requests, and "destination unreachable" errors are ICMP too.</p>
<p>Ports worth memorising: 22 SSH, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS, 3306 MySQL, 5432 PostgreSQL, 6379 Redis, 27017 MongoDB, 3389 RDP.</p>`,
      lang: "bash",
      code: `# Watch a TCP three-way handshake (needs sudo)
sudo tcpdump -i any -n 'tcp port 443 and host example.com' -c 6 &
curl -s https://example.com -o /dev/null
# Flags [S]   = SYN       (client: let's talk)
# Flags [S.]  = SYN-ACK   (server: ok)
# Flags [.]   = ACK       (client: connected)

# ICMP: ping and its statistics
ping -c 5 1.1.1.1
# 5 packets transmitted, 5 received, 0% packet loss
# rtt min/avg/max = 3.1/3.4/4.0 ms

# A DNS query is a UDP packet to port 53
dig @1.1.1.1 example.com +short

# Which well-known service lives on a port?
grep -w -E "22|53|443|5432" /etc/services | head`,
      ex: "Run tcpdump (or open Wireshark) while loading a website. Identify the DNS query (UDP 53), the TCP handshake and the TLS Client Hello. For each, write which TCP/IP layer it belongs to.",
      q: ["A user can ping the server's IP but the website won't load. At which layer is the problem most likely?", ["Link layer: the cable is unplugged", "Internet layer: routing is broken", "Transport or application layer: the port is blocked or the web server is down", "There is no problem"], 2, "A successful ping proves IP connectivity. The failure must be higher up: a firewall blocking 443, the web server not running, or an application error."]
    },
    {
      t: "IP addressing and subnets",
      sub: ["CIDR notation", "Subnetting by hand", "Public vs private ranges", "NAT"],
      body: `<p>An IPv4 address is 32 bits, written as four numbers from 0–255. A <b>subnet</b> is a block of addresses that share the same starting bits. <b>CIDR notation</b> writes this as address/prefix: <code>10.0.1.0/24</code> means the first 24 bits are fixed and the last 8 can vary, giving 2<sup>8</sup> = 256 addresses (10.0.1.0 to 10.0.1.255).</p>
<p>Rules of thumb:</p>
<ul><li>Addresses in a block = 2<sup>(32 − prefix)</sup>. /24 = 256, /16 = 65,536, /28 = 16, /32 = one address.</li>
<li>A smaller prefix number means a bigger network.</li>
<li>In a normal subnet the first address is the network address and the last is broadcast, so a /24 has 254 usable hosts. AWS reserves 5 per subnet.</li></ul>
<p><b>Private ranges</b> are not routed on the public internet and are free to use inside any network: <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>. Your laptop at home is probably 192.168.x.x.</p>
<p><b>NAT</b> (network address translation) lets many private devices share one public IP. Your router rewrites outgoing packets to use its public address and remembers which device asked, so replies go back to the right one. In the cloud, a NAT gateway lets servers in private subnets reach the internet without being reachable from it.</p>
<p>When designing a cloud network (a VPC), pick a large private block such as <code>10.0.0.0/16</code> and split it into /24 subnets: public ones for load balancers, private ones for apps and databases.</p>`,
      lang: "python",
      code: `import ipaddress

net = ipaddress.ip_network("10.0.0.0/16")
print(net.num_addresses)            # 65536
print(net.is_private)               # True

# Split a VPC into /24 subnets and take the first four
subnets = list(net.subnets(new_prefix=24))[:4]
for name, s in zip(["public-a", "public-b", "private-a", "private-b"], subnets):
    hosts = list(s.hosts())
    print(f"{name:10} {s}  usable {hosts[0]} - {hosts[-1]}  ({len(hosts)} hosts)")
# public-a   10.0.0.0/24  usable 10.0.0.1 - 10.0.0.254  (254 hosts)
# ...

# Does an address belong to a subnet?
print(ipaddress.ip_address("10.0.2.77") in subnets[2])   # True

# Do two ranges overlap? (overlaps break VPC peering and VPNs)
a = ipaddress.ip_network("10.0.0.0/16")
b = ipaddress.ip_network("10.0.128.0/20")
print(a.overlaps(b))                # True`,
      ex: "By hand first, then check with Python: how many addresses are in a /20, /26 and /29? Split <code>172.20.0.0/16</code> into four equal subnets and give their ranges. Finally, design a VPC with 2 public and 2 private subnets across two availability zones and draw it.",
      q: ["How many addresses are in a /26 block?", ["26", "64", "256", "1024"], 1, "32 − 26 = 6 variable bits, and 2⁶ = 64 addresses."]
    },
    {
      t: "DNS, DHCP and load balancing",
      sub: ["DNS resolution chain", "DHCP", "Layer 4 vs layer 7 load balancers", "Reverse proxies"],
      body: `<p><b>DNS resolution chain</b>: an application asks the operating system, which checks its cache and <code>/etc/hosts</code>, then asks the configured resolver. The resolver checks its own cache, then walks root → top-level domain → authoritative nameserver. Every step caches the result for the record's TTL. When "DNS is broken", check each link: the hosts file, which resolver is configured (<code>/etc/resolv.conf</code>), and what the authoritative server actually returns.</p>
<p><b>DHCP</b> is how a device gets its network settings automatically when it joins: the device broadcasts a request, and the DHCP server (your router at home) leases it an IP address, subnet mask, default gateway and DNS servers for a period of time.</p>
<p>A <b>load balancer</b> spreads traffic across several servers so no single one is overloaded, and stops sending traffic to servers that fail health checks.</p>
<ul><li><b>Layer 4</b> (transport) load balancers forward TCP/UDP connections by IP and port without reading the content. Very fast; cannot route by URL. Example: AWS NLB.</li>
<li><b>Layer 7</b> (application) load balancers read HTTP, so they can route <code>/api</code> to one service and <code>/</code> to another, terminate TLS, add headers and do sticky sessions. Example: AWS ALB, Nginx.</li></ul>
<p>A <b>reverse proxy</b> sits in front of your app servers and receives all client traffic: it terminates HTTPS, serves static files, compresses responses, applies rate limits and forwards requests to the app. Nginx, Caddy, Traefik and Envoy are common. Clients only ever see the proxy.</p>`,
      lang: "nginx",
      code: `# /etc/nginx/conf.d/app.conf : a layer 7 load balancer and reverse proxy
upstream api_servers {
    least_conn;                       # send to the server with fewest active connections
    server 10.0.2.11:8000 max_fails=3 fail_timeout=10s;
    server 10.0.2.12:8000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl;
    server_name app.example.com;
    ssl_certificate     /etc/letsencrypt/live/app.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;

    location /api/ {                  # route by path: only layer 7 can do this
        proxy_pass http://api_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location / {                      # static frontend served directly
        root /var/www/app;
        try_files $uri /index.html;
    }
}`,
      ex: "Run two copies of a tiny web app on ports 8001 and 8002 that each return their own port number. Put Nginx (in Docker is fine) in front with an upstream block. Hit it 10 times with curl and confirm requests alternate. Stop one app and show Nginx keeps serving from the other.",
      q: ["You need to send <code>/api/*</code> to one group of servers and <code>/images/*</code> to another. Which do you need?", ["A layer 4 load balancer", "A layer 7 load balancer or reverse proxy", "DHCP", "A second DNS A record"], 1, "Only a layer 7 balancer reads the HTTP request, so only it can route by URL path."]
    },
    {
      t: "Network troubleshooting",
      sub: ["ping, traceroute, mtr", "dig and nslookup", "netstat / ss", "tcpdump and Wireshark"],
      body: `<p>"The site is down" can mean a dozen different failures. Troubleshoot <b>bottom-up</b>, proving one layer at a time, and write down what you rule out.</p>
<ol><li><b>Does the name resolve?</b> <code>dig +short app.example.com</code>. No answer or the wrong IP means DNS.</li>
<li><b>Is the host reachable?</b> <code>ping</code> the IP (if ICMP is allowed). <code>traceroute</code> or <code>mtr</code> show where along the path packets stop or slow down; <code>mtr</code> runs continuously and shows packet loss per hop.</li>
<li><b>Is the port open?</b> <code>nc -vz host 443</code>. "Connection refused" means the host answered but nothing listens on that port. A timeout usually means a firewall silently dropped it.</li>
<li><b>Is the service listening?</b> On the server, <code>ss -tlnp</code> shows listening ports and the process. Listening on <code>127.0.0.1</code> only? Then it can't be reached from outside.</li>
<li><b>Does the application respond correctly?</b> <code>curl -v</code> shows TLS, headers, status code and body.</li></ol>
<p>When that isn't enough, capture the packets. <b>tcpdump</b> captures on the command line (great on servers); <b>Wireshark</b> opens the capture with a friendly interface and decodes every protocol. Look for repeated SYNs with no reply (dropped), RST packets (refused), or retransmissions (packet loss).</p>`,
      lang: "bash",
      code: `HOST=app.example.com

# 1. DNS
dig +short $HOST                  # expect an IP
dig +short $HOST @8.8.8.8         # compare with another resolver

# 2. Reachability and path
ping -c 3 $HOST
mtr -rwc 20 $HOST                 # 20 probes per hop, report mode

# 3. Port
nc -vz -w 3 $HOST 443
#  succeeded            -> open
#  Connection refused   -> host up, nothing listening
#  timed out            -> probably a firewall

# 4. On the server: is anything listening, and where?
sudo ss -tlnp | grep -E ':443|:8000'
# LISTEN 0 511 127.0.0.1:8000  users:(("gunicorn",pid=812))   <- localhost only!

# 5. Application
curl -sv https://$HOST/health -o /dev/null 2>&1 | grep -E "Connected|HTTP/|expire"

# Capture traffic to a file for Wireshark
sudo tcpdump -i any -w capture.pcap host $HOST and port 443 -c 200`,
      ex: "Create three broken setups and diagnose each with the checklist: (1) a web app bound to 127.0.0.1 only, (2) a firewall rule (ufw or a cloud security group) blocking the port, (3) a hosts-file entry pointing the name to the wrong IP. For each, write the command that revealed the problem.",
      q: ["<code>nc -vz server 5432</code> returns 'Connection refused' immediately. What does that tell you?", ["DNS is broken", "The server is reachable but nothing is listening on port 5432", "A firewall is silently dropping packets", "The network cable is unplugged"], 1, "A refusal is an active reply (a TCP RST) from the host, so the network path works. The database isn't running or isn't listening on that port or interface."]
    },
    {
      t: "Firewalls, VPNs and TLS",
      sub: ["Stateful firewalls and security groups", "VPNs and tunnels", "TLS termination", "Zero trust in brief"],
      body: `<p>A <b>firewall</b> decides which traffic is allowed, based on source, destination, port and protocol. A <b>stateful</b> firewall remembers connections, so if you allow an outgoing request, the reply is automatically allowed back in. Rules should <b>deny by default</b> and allow only what is needed.</p>
<p>In the cloud, <b>security groups</b> are stateful firewalls attached to each server or service. A good pattern is chaining them: the load balancer's group allows 443 from anywhere; the app's group allows 8000 only from the load balancer's group; the database's group allows 5432 only from the app's group. Nothing else can reach the database, even from inside the network.</p>
<p>A <b>VPN</b> creates an encrypted tunnel between networks or from a laptop to a private network, so traffic crosses the internet safely as if on a private link. Site-to-site VPNs connect an office to a cloud VPC; WireGuard is a modern, simple VPN protocol.</p>
<p><b>TLS termination</b> means decrypting HTTPS at a load balancer or reverse proxy, then forwarding to the app. It centralises certificates and offloads work from apps. Traffic behind the terminator can be plain HTTP inside a trusted network, or re-encrypted (end-to-end TLS, or mTLS between services) where policy requires it.</p>
<p><b>Zero trust</b> drops the idea that anything inside the network is safe. Every request must prove who it is (strong identity, device checks) and is authorised individually, whatever network it came from. In practice: SSO and MFA everywhere, short-lived credentials, per-service authentication and least privilege.</p>`,
      lang: "bash",
      code: `# Host firewall on Ubuntu with ufw: deny by default, allow only what's needed
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp            # SSH (better: only from your IP, see below)
sudo ufw allow 443/tcp           # HTTPS
sudo ufw allow from 203.0.113.10 to any port 22 proto tcp
sudo ufw enable
sudo ufw status numbered

# Cloud security groups, chained (AWS CLI)
# app servers accept 8000 only from the load balancer's security group
aws ec2 authorize-security-group-ingress \\
  --group-id sg-app --protocol tcp --port 8000 --source-group sg-alb
# database accepts 5432 only from the app's security group
aws ec2 authorize-security-group-ingress \\
  --group-id sg-db --protocol tcp --port 5432 --source-group sg-app

# WireGuard: bring up a tunnel defined in /etc/wireguard/wg0.conf
sudo wg-quick up wg0 && sudo wg show`,
      ex: "On a small VM (or a local Linux VM), configure ufw to allow only SSH from your IP and HTTPS from anywhere. Prove from another machine that other ports time out. Then write the three chained security group rules for a load balancer → app → database setup and explain what an attacker who compromises the load balancer can and cannot reach.",
      q: ["Why chain security groups (database allows only the app's group) instead of allowing the whole VPC range?", ["It is faster", "Only the app servers can reach the database, so a compromise elsewhere in the network can't connect to it", "VPC ranges can't be used in rules", "It removes the need for passwords"], 1, "Referencing a group limits access to exactly the services that need it: least privilege at the network layer."]
    }
  ]
});
