/* Forge Academy lessons: terminal basics, Linux administration */
window.COURSE = window.COURSE || [];
COURSE.push({
  n: 30, id: "terminal-lessons", fills: "terminal", title: "Terminal and Linux basics", level: 1,
  blurb: "Files, permissions, processes, packages and text tools on the command line.",
  lessons: [
    {
      t: "Files, permissions and users",
      sub: ["Absolute and relative paths", "Permissions: read, write, execute", "chmod and chown", "Users, groups and sudo", "Hidden files and dotfiles"],
      body: `<p>An <b>absolute path</b> starts at the root, <code>/home/asha/projects/app</code>. A <b>relative path</b> starts where you are: <code>projects/app</code>, <code>../notes</code> (one folder up), <code>./run.sh</code> (this folder). <code>~</code> is your home folder.</p>
<p>Every file has an <b>owner</b>, a <b>group</b> and three sets of permissions: for the owner, the group, and everyone else. Each set is a mix of <b>r</b> (read), <b>w</b> (write) and <b>x</b> (execute; for a folder, x means "can enter it"). <code>ls -l</code> shows them as <code>-rwxr-x---</code>.</p>
<p>Permissions are often written as numbers: r=4, w=2, x=1, added per set. <code>755</code> = rwx for owner, r-x for group and others (typical for scripts and folders). <code>644</code> = rw- r-- r-- (typical for files). <code>600</code> = only the owner can read or write (SSH keys, secrets).</p>
<p><code>chmod</code> changes permissions; <code>chown</code> changes owner and group. Linux has normal users and <b>root</b>, who can do anything. Instead of logging in as root, admins use <code>sudo</code> to run single commands with root rights, which is logged and limited to users in the sudo group.</p>
<p>Files starting with a dot are <b>hidden</b>: <code>.bashrc</code>, <code>.gitignore</code>, <code>.env</code>, <code>.ssh/</code>. These "dotfiles" hold configuration. Use <code>ls -a</code> to see them.</p>`,
      lang: "bash",
      code: `pwd                      # where am I?   /home/asha
cd projects/app          # relative
cd /var/log              # absolute
cd ~                     # home
cd -                     # back to the previous folder

ls -la
# drwxr-xr-x  2 asha asha 4096 Oct 18 10:02 scripts
# -rw-r--r--  1 asha asha  220 Oct 18 10:01 notes.txt
# -rw-------  1 asha asha   64 Oct 18 10:03 .env
#  ^type ^owner ^group ^others

chmod +x deploy.sh       # let me run it: ./deploy.sh
chmod 600 .env           # secrets readable only by me
chmod 755 scripts        # folder others can enter and list
chmod -R g+w shared/     # give the group write access, recursively

sudo chown www-data:www-data /var/www/site -R   # web server owns the site files

whoami ; id              # my user, my groups
sudo adduser ravi        # create a user
sudo usermod -aG docker ravi   # add ravi to the docker group`,
      ex: "Create a folder <code>lab</code> with a script, a secrets file and a shared folder. Make the script executable only by you, the secrets file readable only by you, and the shared folder writable by a group. Show <code>ls -l</code> output proving each, and explain what <code>chmod 750</code> means in words.",
      q: ["What does <code>chmod 640 config.yml</code> allow?", ["Everyone can read and write", "Owner reads and writes, group reads, others get nothing", "Owner reads only, group writes", "Only root can read"], 1, "6 = rw for the owner, 4 = r for the group, 0 = nothing for others."]
    },
    {
      t: "Processes, services and logs",
      sub: ["ps, top, kill and signals", "Background jobs", "Services with systemd", "Reading logs with journalctl and tail"],
      body: `<p>Every running program is a <b>process</b> with a process ID (PID). <code>ps aux</code> lists all processes; <code>top</code> or the friendlier <code>htop</code> shows them live, sorted by CPU or memory.</p>
<p>You stop processes by sending <b>signals</b>. <code>kill PID</code> sends SIGTERM, a polite request to shut down cleanly. <code>kill -9 PID</code> sends SIGKILL, which the program can't catch: use it only when SIGTERM doesn't work, because the program gets no chance to save data. Ctrl+C in a terminal sends SIGINT.</p>
<p>Add <code>&amp;</code> to run a command in the <b>background</b>; <code>jobs</code>, <code>fg</code> and <code>bg</code> manage it. A background job dies when you close the terminal, unless you use <code>nohup</code>, <code>tmux</code>, or better, a service.</p>
<p>On modern Linux, long-running programs (web servers, databases, your app) run as <b>systemd services</b>. systemd starts them at boot, restarts them if they crash and collects their output. <code>systemctl</code> controls services; <code>journalctl</code> reads their logs.</p>
<p>Traditional log files live in <code>/var/log</code>. <code>tail -f</code> follows a file as new lines are written, which is the first thing to run when something is failing right now.</p>`,
      lang: "bash",
      code: `ps aux | grep python            # find a process
pgrep -a node                   # same idea, cleaner
top                             # live view (press M to sort by memory, q to quit)

kill 4821                       # SIGTERM: please stop
kill -9 4821                    # SIGKILL: stop now (last resort)
pkill -f "uvicorn main:app"     # kill by command line

# Background jobs
python3 long_task.py &          # runs in background
jobs                            # [1]+ Running  python3 long_task.py &
fg %1                           # bring it back; Ctrl+Z pauses, bg resumes in background

# systemd services
systemctl status nginx
sudo systemctl restart nginx
sudo systemctl enable --now nginx    # start now and at every boot
systemctl --failed                    # anything broken?

# Logs
journalctl -u nginx --since "1 hour ago"
journalctl -u myapp -f                # follow live
sudo tail -f /var/log/nginx/error.log
sudo tail -n 100 /var/log/syslog | grep -i error`,
      ex: "Start <code>sleep 1000 &amp;</code> three times, list the jobs, kill one with SIGTERM and one with SIGKILL, and bring the last to the foreground then stop it with Ctrl+C. Then pick a service on your machine (ssh, cron or nginx) and show its status, its last 20 log lines and whether it starts at boot.",
      q: ["Why try <code>kill PID</code> before <code>kill -9 PID</code>?", ["kill -9 doesn't work on Linux", "SIGTERM lets the program finish writing data and clean up; SIGKILL stops it instantly with no cleanup", "kill without a number restarts the process", "They are identical"], 1, "SIGTERM can be handled by the program to shut down gracefully. SIGKILL can't be caught, which risks corrupted files or lost work."]
    },
    {
      t: "Package managers and environment",
      sub: ["apt, brew, winget", "Environment variables and PATH", "Shell config files (.bashrc, .zshrc)", "Installing language versions (pyenv, nvm)"],
      body: `<p>A <b>package manager</b> installs, updates and removes software along with its dependencies, from trusted repositories. Use it instead of downloading installers from random sites. <b>apt</b> on Ubuntu/Debian, <b>dnf</b> on Fedora/RHEL, <b>brew</b> on macOS, <b>winget</b> on Windows.</p>
<p><b>Environment variables</b> are named values every program can read: <code>HOME</code>, <code>USER</code>, <code>LANG</code>, and your own like <code>DATABASE_URL</code>. Apps read secrets and settings from them, so the same code runs in development and production with different values.</p>
<p><code>PATH</code> is the most important one: a colon-separated list of folders the shell searches when you type a command. "command not found" usually means the program's folder isn't on PATH. <code>which python3</code> shows which file actually runs.</p>
<p>Variables set with <code>export</code> last only for that terminal. To make them permanent, add them to your <b>shell config</b>: <code>~/.bashrc</code> for bash, <code>~/.zshrc</code> for zsh (macOS default). These run every time a new terminal opens. Reload with <code>source ~/.zshrc</code>.</p>
<p>Different projects need different language versions. <b>Version managers</b> install several side by side and switch per project: <code>pyenv</code> for Python, <code>nvm</code> or <code>fnm</code> for Node. Never <code>sudo pip install</code> into the system Python, because the operating system depends on it.</p>`,
      lang: "bash",
      code: `# Packages
sudo apt update && sudo apt install -y git curl jq     # Ubuntu
brew install git jq                                    # macOS
winget install Git.Git                                 # Windows

# Environment variables
echo $HOME $USER
export APP_ENV=development        # only this terminal
env | grep APP_                   # list
APP_ENV=test python3 app.py       # set for one command only

# PATH
echo $PATH | tr ':' '\\n'          # one folder per line
which python3                     # /usr/bin/python3
export PATH="$HOME/.local/bin:$PATH"   # add a folder at the front

# Make it permanent
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Language versions
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22 && nvm use 22 && node -v
pyenv install 3.12 && pyenv local 3.12 && python --version   # writes .python-version`,
      ex: "Install jq with your package manager. Create a folder <code>~/bin</code>, put a small script in it, add the folder to PATH permanently and prove you can run the script from any folder. Then install two Node versions with nvm and switch between them.",
      q: ["You installed a tool but typing its name gives 'command not found'. What's the most likely cause?", ["The tool is a virus", "The folder containing the tool isn't on PATH", "The terminal is out of memory", "You need to reboot the internet"], 1, "The shell only looks in PATH folders. Add the tool's folder to PATH (and reload your shell config) or call it with its full path."]
    },
    {
      t: "Text processing power tools",
      sub: ["grep, sed and awk", "sort, uniq, wc, cut", "Pipes and redirection", "find and xargs"],
      body: `<p>Unix tools each do one small thing and are combined with <b>pipes</b>: <code>|</code> sends one command's output into the next. With a handful of them you can answer real questions about logs and data in one line, without writing a program.</p>
<ul><li><code>grep</code> finds lines matching a pattern (<code>-i</code> ignore case, <code>-v</code> invert, <code>-r</code> recursive, <code>-c</code> count, <code>-E</code> regex).</li>
<li><code>cut</code> takes columns; <code>awk</code> is a tiny language for columns (<code>awk '{print $1}'</code> prints the first field) and sums.</li>
<li><code>sed</code> edits streams, most often find-and-replace: <code>sed 's/old/new/g'</code>.</li>
<li><code>sort</code>, <code>uniq -c</code> (count repeats; needs sorted input), <code>wc -l</code> (count lines), <code>head</code>, <code>tail</code>.</li></ul>
<p><b>Redirection</b>: <code>&gt;</code> writes output to a file (overwrites), <code>&gt;&gt;</code> appends, <code>&lt;</code> reads input from a file, <code>2&gt;</code> redirects errors, <code>2&gt;&amp;1</code> merges errors into output.</p>
<p><code>find</code> searches for files by name, size, age or type. <code>xargs</code> turns lines of input into arguments for another command, so you can act on everything <code>find</code> found.</p>`,
      lang: "bash",
      code: `# access.log lines look like:
# 203.0.113.9 - - [18/Oct/2026:10:01:22 +0530] "GET /api/users HTTP/1.1" 200 512

# Top 5 IP addresses by number of requests
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -5

# How many server errors (5xx)?
awk '$9 ~ /^5/' access.log | wc -l

# Most requested paths
awk '{print $7}' access.log | sort | uniq -c | sort -rn | head

# Total bytes sent
awk '{sum += $10} END {print sum/1024/1024 " MB"}' access.log

# All lines mentioning timeout, ignoring case, saved to a file
grep -i "timeout" app.log > timeouts.txt 2>&1

# Replace a word in every .md file, in place (GNU sed)
sed -i 's/colour/color/g' *.md

# Find log files bigger than 100 MB and older than 7 days
find /var/log -name "*.log" -size +100M -mtime +7

# Count lines of Python in a project
find . -name "*.py" -not -path "./.venv/*" | xargs wc -l | tail -1

# Second column of a CSV, unique values
cut -d, -f2 data.csv | sort -u`,
      ex: "Download a sample web server log (search 'nginx sample access log') or generate one. Using only shell tools, find: the 10 busiest IPs, the share of 4xx and 5xx responses, the busiest hour of the day, and the 5 slowest or largest responses. Write each answer with the one-line command that produced it.",
      q: ["Why is <code>sort</code> placed before <code>uniq -c</code>?", ["uniq only counts adjacent duplicate lines, so identical lines must be next to each other", "sort makes the output colourful", "uniq crashes on unsorted input", "It's just a style choice"], 0, "uniq compares each line only with the previous one. Sorting groups identical lines together so uniq counts them correctly."]
    }
  ]
});

COURSE.push({
  n: 31, id: "linux-admin-lessons", fills: "linux-admin", title: "Linux administration", level: 2,
  blurb: "Running real Linux servers: access, services, storage, performance and web servers.",
  lessons: [
    {
      t: "Users, permissions and SSH",
      sub: ["Users and groups", "sudoers", "SSH keys and config", "Disabling password login", "fail2ban"],
      body: `<p>On a server, every person and every service gets its <b>own user</b>. People log in with their own account and use sudo; services (nginx, postgres, your app) run as unprivileged users so a bug in one can't take over the machine. Groups grant shared access, for example a <code>deploy</code> group that can write to <code>/srv/app</code>.</p>
<p><b>sudoers</b> (<code>/etc/sudoers</code>, always edited with <code>visudo</code>, which checks syntax) controls who may run what as root. Prefer adding users to the <code>sudo</code> group, or drop narrow rules in <code>/etc/sudoers.d/</code>, such as allowing a deploy user to restart only one service.</p>
<p><b>SSH keys</b> replace passwords. You generate a key pair on your laptop; the public key goes into <code>~/.ssh/authorized_keys</code> on the server; the private key never leaves your laptop and should have a passphrase. Ed25519 keys are the modern default.</p>
<p>Once keys work, <b>disable password login</b> and root login in <code>/etc/ssh/sshd_config</code>. Internet-facing servers get thousands of password-guessing attempts a day; with passwords disabled, these attempts simply can't succeed.</p>
<p><b>fail2ban</b> watches logs and temporarily bans IPs with repeated failures, cutting log noise and slowing attackers. Always keep a second session open while changing SSH settings so you can't lock yourself out.</p>`,
      lang: "bash",
      code: `# --- on your laptop ---
ssh-keygen -t ed25519 -C "asha@laptop"         # creates ~/.ssh/id_ed25519(.pub)
ssh-copy-id deploy@203.0.113.20                 # installs the public key

# ~/.ssh/config : short names and settings per host
# Host prod
#     HostName 203.0.113.20
#     User deploy
#     IdentityFile ~/.ssh/id_ed25519
ssh prod

# --- on the server ---
sudo adduser deploy
sudo usermod -aG sudo deploy

# allow the deploy user to restart only the app, without a password
echo 'deploy ALL=(root) NOPASSWD: /bin/systemctl restart myapp' | sudo tee /etc/sudoers.d/deploy
sudo visudo -c                                  # check syntax

# harden sshd (keep another session open while testing!)
sudo sed -i 's/^#\\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\\?PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sshd -t && sudo systemctl reload ssh

# fail2ban
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd`,
      ex: "On a fresh VM (cloud free tier or a local VM), create a personal sudo user and a separate deploy user, set up key-based SSH with an <code>~/.ssh/config</code> alias, disable password and root login, and install fail2ban. Prove that password login is refused and show fail2ban's sshd jail status.",
      q: ["After setting up keys, why disable SSH password authentication?", ["It makes SSH faster", "Automated password-guessing can then never succeed, since only holders of an authorised private key can log in", "Keys stop working otherwise", "It is required by Linux"], 1, "Bots constantly try passwords against public servers. With password login off, a guessed password is useless."]
    },
    {
      t: "Services and systemd",
      sub: ["Unit files", "Starting, enabling and restarting", "Timers instead of cron", "Service logs"],
      body: `<p>systemd manages everything that runs in the background. You describe a service in a <b>unit file</b>: what to run, as which user, in which folder, with which environment, and what to do if it crashes. Your own units go in <code>/etc/systemd/system/</code>.</p>
<p>Key settings in the <code>[Service]</code> section:</p>
<ul><li><code>ExecStart</code>: the command (full paths).</li>
<li><code>User</code> and <code>WorkingDirectory</code>: never run your app as root.</li>
<li><code>EnvironmentFile</code>: load secrets from a file with 600 permissions instead of hard-coding them.</li>
<li><code>Restart=on-failure</code>: restart automatically after a crash.</li></ul>
<p>After creating or editing a unit, run <code>systemctl daemon-reload</code>. <code>start</code> runs it now; <code>enable</code> makes it start at boot; <code>enable --now</code> does both.</p>
<p><b>Timers</b> are systemd's replacement for cron. A <code>.timer</code> unit triggers a matching <code>.service</code> on a schedule. Advantages over cron: output goes to the journal, missed runs can catch up after downtime (<code>Persistent=true</code>), and you can see the next run with <code>systemctl list-timers</code>.</p>
<p>All output a service prints goes to the <b>journal</b>: <code>journalctl -u myapp</code>.</p>`,
      lang: "ini",
      code: `# /etc/systemd/system/myapp.service
[Unit]
Description=My FastAPI app
After=network-online.target
Wants=network-online.target

[Service]
User=myapp
WorkingDirectory=/srv/myapp
EnvironmentFile=/etc/myapp.env
ExecStart=/srv/myapp/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target

# /etc/systemd/system/backup.service
[Unit]
Description=Nightly database backup
[Service]
Type=oneshot
User=myapp
ExecStart=/srv/myapp/scripts/backup.sh

# /etc/systemd/system/backup.timer
[Unit]
Description=Run backup every night at 02:30
[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true
[Install]
WantedBy=timers.target

# Commands:
#   sudo systemctl daemon-reload
#   sudo systemctl enable --now myapp backup.timer
#   systemctl list-timers ; journalctl -u myapp -f`,
      ex: "Write a unit file for a small web app (any language) that runs as its own user, loads environment variables from a file and restarts on failure. Kill the process with <code>kill -9</code> and show systemd restarting it in the journal. Then add a timer that writes the date to a log file every 5 minutes.",
      q: ["You edited a unit file but systemd still runs the old command. What did you forget?", ["To reboot the server", "<code>sudo systemctl daemon-reload</code>, then restart the service", "To delete the journal", "To run it with cron"], 1, "systemd caches unit files. daemon-reload re-reads them; restart then applies the new definition."]
    },
    {
      t: "Storage and filesystems",
      sub: ["Disks, partitions and mounts", "df, du, lsblk", "Permissions on shared folders", "Backups with rsync"],
      body: `<p>A <b>disk</b> (or a cloud volume like AWS EBS) is divided into <b>partitions</b>, each formatted with a <b>filesystem</b> (ext4 and xfs are common on Linux). A filesystem only becomes usable when it is <b>mounted</b> at a folder, for example <code>/data</code>. <code>/etc/fstab</code> lists mounts to restore at boot; refer to disks by UUID there, because device names like <code>/dev/sdb</code> can change.</p>
<p>Three commands answer most storage questions:</p>
<ul><li><code>lsblk</code>: which disks and partitions exist and where they are mounted.</li>
<li><code>df -h</code>: how full each filesystem is. A full root disk is one of the most common causes of outages: databases stop writing and services crash.</li>
<li><code>du -sh *</code>: which folders use the space. Usual suspects: logs, old releases, Docker images (<code>docker system df</code>).</li></ul>
<p>For folders several users share, create a group, give it ownership, and set the <b>setgid</b> bit (<code>chmod 2775</code>) so new files inherit the group automatically.</p>
<p><b>rsync</b> copies only what changed, so repeated backups are fast. Remember the 3-2-1 rule: three copies, on two kinds of storage, one off-site. And a backup you have never restored is only a hope: test restores regularly.</p>`,
      lang: "bash",
      code: `lsblk -f                       # disks, partitions, filesystems, mount points
df -h                          # free space per filesystem
df -i                          # inodes: can run out with millions of tiny files
sudo du -xh /var --max-depth=1 | sort -h | tail   # biggest folders under /var

# Prepare and mount a new data disk (destroys anything on /dev/xvdf!)
sudo mkfs.ext4 /dev/xvdf
sudo mkdir -p /data
sudo mount /dev/xvdf /data
sudo blkid /dev/xvdf           # get the UUID for fstab
echo 'UUID=1234-abcd  /data  ext4  defaults,nofail  0 2' | sudo tee -a /etc/fstab
sudo mount -a                  # test fstab without rebooting

# Shared folder for a team
sudo groupadd devteam
sudo chown root:devteam /srv/shared
sudo chmod 2775 /srv/shared    # 2 = setgid: new files get the devteam group

# Backups with rsync (-a keep attributes, -z compress, --delete mirror deletions)
rsync -az --delete /srv/myapp/uploads/ backup@10.0.5.9:/backups/uploads/
# Dry run first to see what would change
rsync -azn --delete --itemize-changes /srv/myapp/uploads/ /mnt/backup/uploads/`,
      ex: "Fill a test disk or folder with a few large files, then use <code>df</code> and <code>du</code> to find them as if hunting for the cause of a full disk. Attach a second disk (a cloud volume, or a loop file with <code>fallocate</code> and <code>losetup</code>), format and mount it via fstab, and run an rsync backup to it, then restore one deleted file from the backup.",
      q: ["Why reference disks by UUID in /etc/fstab instead of /dev/sdb?", ["UUIDs are shorter", "Device names can change between boots, but a filesystem's UUID stays the same", "fstab doesn't accept device names", "It encrypts the disk"], 1, "The kernel can name disks in a different order after a reboot or hardware change. A UUID always identifies the same filesystem."]
    },
    {
      t: "Performance and troubleshooting",
      sub: ["CPU, memory, disk and network tools", "Load average", "strace and lsof", "A troubleshooting checklist"],
      body: `<p>When a server is slow, check the four resources in turn: <b>CPU</b>, <b>memory</b>, <b>disk</b> and <b>network</b>. Each has a quick tool.</p>
<ul><li><b>CPU</b>: <code>top</code>/<code>htop</code>. High <code>us</code> means your programs are busy; high <code>wa</code> (I/O wait) means CPUs are idle waiting for the disk.</li>
<li><b>Memory</b>: <code>free -h</code>. Look at "available", not "free": Linux uses spare memory as disk cache. If memory runs out, the kernel's OOM killer terminates a process (check <code>dmesg</code> or the journal for "Out of memory").</li>
<li><b>Disk</b>: <code>iostat -xz 1</code> shows utilisation and latency per disk; <code>df -h</code> shows fullness.</li>
<li><b>Network</b>: <code>ss -s</code> for connection counts, <code>iftop</code> or <code>nload</code> for bandwidth.</li></ul>
<p><b>Load average</b> (shown by <code>uptime</code>) is the average number of processes running or waiting, over 1, 5 and 15 minutes. Compare it with your CPU count (<code>nproc</code>): a load of 4 on a 4-core machine is fully busy; 12 means work is queuing.</p>
<p>For a single misbehaving process: <code>strace -p PID</code> shows the system calls it makes (is it stuck reading a file, waiting on the network?), and <code>lsof -p PID</code> lists its open files and connections. <code>lsof -i :8000</code> shows who holds a port.</p>
<p>Work through it in order: what changed recently, which resource is saturated, which process is responsible, what do its logs say. Write down each finding as you go.</p>`,
      lang: "bash",
      code: `# 60-second checklist
uptime                    # load: 7.92, 6.10, 3.05  -> rising
nproc                     # 4 cores -> overloaded
dmesg -T | tail -20       # kernel errors, OOM kills, disk errors
free -h                   # look at 'available'
vmstat 1 5                # r=run queue, wa=io wait, si/so=swapping
iostat -xz 1 3            # %util near 100 and high await = disk bottleneck
df -h                     # any filesystem at 100%?
ss -s                     # connection summary
top -o %CPU               # (or htop) who is using CPU

# Zoom in on one process
PID=$(pgrep -f gunicorn | head -1)
sudo strace -f -tt -p $PID -e trace=network,file 2>&1 | head -30
sudo lsof -p $PID | wc -l           # open files (near the ulimit?)
sudo lsof -i :5432                  # who is connected to the database port

# Who wrote to the journal with errors in the last 15 minutes
journalctl -p err --since "15 min ago"`,
      ex: "Simulate three problems on a test VM and diagnose each using only the checklist: a CPU hog (<code>yes &gt; /dev/null</code> on every core), a memory hog (a Python loop appending to a list), and heavy disk writes (<code>dd if=/dev/zero of=big bs=1M count=5000</code>). For each, write which command revealed it and which numbers showed it.",
      q: ["CPU usage shows 70% <code>wa</code> and low <code>us</code>. What is the bottleneck?", ["The CPU is too slow", "Processes are waiting on disk I/O", "The network is down", "There's no problem"], 1, "wa (I/O wait) means CPUs are idle because processes are blocked waiting for the disk. Look at iostat and the processes doing heavy reads or writes."]
    },
    {
      t: "Web servers and reverse proxies",
      sub: ["Nginx basics", "Reverse proxy to an app", "HTTPS with Let's Encrypt", "Load balancing upstreams"],
      body: `<p><b>Nginx</b> is the most widely used web server and reverse proxy. Its configuration is made of blocks: a <code>server</code> block per site (matched by <code>listen</code> port and <code>server_name</code>), and <code>location</code> blocks inside it matched by URL path. On Ubuntu, site configs live in <code>/etc/nginx/sites-available/</code> and are enabled by symlinking into <code>sites-enabled/</code>.</p>
<p>The standard production setup: your app (Node, Python, Go) listens only on <code>127.0.0.1:8000</code>, and Nginx listens publicly on 80 and 443 and <b>proxies</b> requests to it. Nginx handles HTTPS, compression, static files, upload size limits and timeouts, things app servers are worse at.</p>
<p>Pass the original client details to the app with headers like <code>X-Forwarded-For</code> and <code>X-Forwarded-Proto</code>, otherwise every request appears to come from 127.0.0.1 over plain HTTP.</p>
<p><b>Let's Encrypt</b> issues free certificates. <code>certbot --nginx</code> proves you control the domain, installs the certificate, edits the Nginx config for HTTPS and sets up automatic renewal (certificates last 90 days).</p>
<p>With an <code>upstream</code> block Nginx <b>load balances</b> across several app instances (round robin by default, or <code>least_conn</code>), and stops sending to an instance after repeated failures.</p>
<p>Always run <code>nginx -t</code> before reloading: it checks the config, so a typo doesn't take the site down.</p>`,
      lang: "nginx",
      code: `# /etc/nginx/sites-available/myapp
upstream myapp {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;          # second app process
}

server {
    listen 80;
    server_name myapp.example.com;
    return 301 https://$host$request_uri;      # force HTTPS
}

server {
    listen 443 ssl http2;
    server_name myapp.example.com;
    # certbot fills these in:
    ssl_certificate     /etc/letsencrypt/live/myapp.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myapp.example.com/privkey.pem;

    client_max_body_size 10m;      # upload limit
    gzip on;

    location /static/ {             # Nginx serves static files directly
        alias /srv/myapp/static/;
        expires 7d;
    }

    location / {
        proxy_pass http://myapp;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}

# sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
# sudo nginx -t && sudo systemctl reload nginx
# sudo certbot --nginx -d myapp.example.com`,
      ex: "On a VM with a domain or free subdomain (DuckDNS works), run a small app as a systemd service on 127.0.0.1, put Nginx in front, get a Let's Encrypt certificate, redirect HTTP to HTTPS and serve one folder of static files directly. Check the result at ssllabs.com/ssltest and aim for an A grade.",
      q: ["Why should the app listen on 127.0.0.1:8000 rather than 0.0.0.0:8000 when Nginx is in front?", ["127.0.0.1 is faster", "So the app can't be reached directly from the internet, bypassing Nginx's HTTPS, limits and logging", "Nginx can't proxy to 0.0.0.0", "Ports above 1024 need it"], 1, "Binding to localhost means only Nginx on the same machine can reach the app. All outside traffic must go through the proxy's protections."]
    }
  ]
});
