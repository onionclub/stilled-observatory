# Stilled Observatory — Deployment Checklist
## One-sitting deployment. Follow in order. No steps skipped.

---

### PREREQUISITES
- [ ] Cloudflare account with a domain managed there
- [ ] Cloudflare Zero Trust enabled (Teams dashboard accessible)
- [ ] A credit card for the DigitalOcean droplet

---

### STEP 1 — Provision the droplet

1. Go to https://cloud.digitalocean.com/droplets/new
2. Choose: **Ubuntu 24.04 LTS** (or latest LTS)
3. Choose: **Basic** plan → **$6/mo** (1 GB RAM, 1 vCPU, 25 GB SSD)
4. Choose: Datacenter region **nearest to your audience** (suggest: SFO3 or NYC3)
5. Authentication: **SSH key** (upload your public key) or **password**
6. Hostname: `stilled-ghost`
7. Click **Create Droplet**
8. Note the **public IP address** — you will need it below.

---

### STEP 2 — Install Docker and Docker Compose on the droplet

SSH into the droplet and run:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add your user to the docker group (avoids sudo for docker commands)
sudo usermod -aG docker $USER

# Log out and back in for group to take effect, then verify:
docker --version
docker compose version
```

---

### STEP 3 — Copy the infrastructure/ folder to the droplet

From your local machine (this repo):

```bash
# From the stilled-observatory root:
scp -r infrastructure/ root@<DROPLET_IP>:/opt/stilled/
```

Verify on the droplet:
```bash
ls /opt/stilled/infrastructure/
# Should show: docker-compose.yml  README.md  .env.template
```

---

### STEP 4 — Create the Cloudflare Tunnel

1. Go to Cloudflare Zero Trust dashboard: https://one.dash.cloudflare.com/
2. Navigate: **Networks** → **Tunnels**
3. Click **Create a tunnel**
4. Name: `stilled-ghost`
5. Choose **cloudflared** as the connector
6. Copy the **tunnel token** that is displayed (starts with `eyJ`...)
7. **Do NOT install the connector via the UI instructions** — Docker handles it.
8. Click **Next**, then:
   - **Subdomain:** `admin`
   - **Domain:** your domain (e.g., `stilled.xyz`)
   - **Service Type:** `HTTP`
   - **URL:** `stilled_ghost:2368`
9. Click **Save hostname**

---

### STEP 5 — Create the Cloudflare Access policy

1. In Cloudflare Zero Trust dashboard: **Access** → **Applications**
2. Click **Add an application** → **Self-hosted**
3. Application name: `Stilled Ghost Admin`
4. Session duration: `24 hours`
5. Subdomain: `admin`
6. Domain: your domain (same as above)
7. Click **Next**

On the policy screen:
8. Policy name: `Solo Operator Access`
9. Action: **Allow**
10. Rules:
    - Include → **Emails** → your email address
11. Click **Next**, then **Add application**

---

### STEP 6 — Create the .env file on the droplet

On the droplet:
```bash
cd /opt/stilled/infrastructure
cp .env.template .env
nano .env
```

Fill in:
```env
GHOST_URL=https://admin.yourdomain.com
CLOUDFLARE_TUNNEL_TOKEN=eyJ... (paste the full token from Step 4)
```

---

### STEP 7 — Launch the stack

```bash
cd /opt/stilled/infrastructure
docker compose up -d
```

Verify both containers are running:
```bash
docker ps
# Should show: stilled_ghost (ghost:5-alpine) and stilled_cloudflared (cloudflare/cloudflared)
```

---

### STEP 8 — Complete Ghost setup

1. Open your browser to: `https://admin.yourdomain.com/ghost`
2. You will be prompted for a Cloudflare Access OTP code — check your email.
3. Complete the Ghost initial setup:
   - Site title: `Stilled.`
   - Full name: your name
   - Email: your email
   - Password: choose a strong password

---

### STEP 9 — Create the two Ghost integrations

1. In Ghost Admin: **Settings** (gear icon) → **Integrations** (under Advanced)
2. Click **Add custom integration**

**Integration 1 — "Observatory" (Admin API):**
- Name: `Observatory`
- Click **Add**
- Copy the **Admin API Key** (format: `id:secret`)

**Integration 2 — "Public Frontend" (Content API):**
- Click **Add custom integration** again
- Name: `Public Frontend`
- Click **Add**
- Copy the **Content API Key** (format: `id:secret`)

---

### STEP 10 — Update observatory_app/.env for production

On your local machine, in the stilled-observatory repo:
```bash
cd observatory_app
nano .env
```

Update to:
```env
GHOST_URL=https://admin.yourdomain.com
GHOST_ADMIN_API_KEY=<Observatory Admin API Key from Step 9>
```

The Content API Key will be used for the public frontend (Phase 3), not the Observatory app.

---

### VERIFICATION

- [ ] `https://admin.yourdomain.com/ghost` loads the Ghost admin login
- [ ] Cloudflare Access OTP gate appears before Ghost login
- [ ] Ghost admin is fully functional
- [ ] Observatory app can be configured locally with the production credentials
- [ ] Test post publishes through the production Ghost from a locally-running Observatory app

---

### TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| Tunnel not connecting | Check `docker logs stilled_cloudflared`. Verify TUNNEL_TOKEN is correct in .env. |
| Ghost not loading behind tunnel | Verify hostname URL in Cloudflare Tunnel is exactly `stilled_ghost:2368`. |
| Ghost setup page loops | Ghost `url` env var must match the exact URL you access it at. Check GHOST_URL in .env. |
| Cannot SSH in | Verify firewall on Droplet allows SSH (port 22). Check DigitalOcean console. |
| Out of memory | The $6/mo droplet has 1 GB RAM. SQLite is chosen for this reason. Monitor with `docker stats`. |

---

*Deployment target: $6/mo DigitalOcean droplet, Cloudflare Zero Trust gate, Ghost 5.x Alpine, SQLite3.*
*Last updated: 2026-05-29*
