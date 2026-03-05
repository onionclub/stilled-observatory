# Stilled — Backend Infrastructure

This directory contains the Docker infrastructure for Ghost CMS and the Cloudflare Tunnel (`cloudflared`).

## Pre-requisites

- A server (e.g., $6/mo DigitalOcean Droplet) for production.
- Docker and Docker Compose installed (Docker Desktop for local testing).
- A Cloudflare account with Zero Trust enabled (for production).

## Local Development (Testing Phase 1)

If you are running this locally on Windows to test the integration before deploying:

1. Open a terminal in this `infrastructure` folder.
2. Run the local docker-compose configuration:
   ```bash
   docker compose -f docker-compose.local.yml up -d
   ```
3. Open `http://localhost:2368/ghost` in your browser.
4. Complete the initial setup to create your admin account.
5. In Ghost, navigate to **Settings > Integrations > Add custom integration**. Name it "Observatory".
6. Copy the **Admin API Key**.
7. In the `observatory_app` folder, create a `.env` file:
   ```env
   GHOST_URL=http://localhost:2368
   GHOST_ADMIN_API_KEY=your_copied_admin_api_key
   ```

## Production Setup Instructions

1. **Create a Cloudflare Tunnel:**
   - In the Cloudflare Zero Trust dashboard, go to **Networks > Tunnels** and create a new tunnel.
   - Choose the `cloudflared` setup option and copy your given `TUNNEL_TOKEN`.
   - In the Public Hostnames configuration for the tunnel:
     - **Subdomain:** e.g., `admin`
     - **Domain:** `stilled.xyz` (or your actual domain)
     - **Service Type:** `HTTP`
     - **URL:** `stilled_ghost:2368`

2. **Configure Cloudflare Zero Trust Access Application:**
   - Go to **Access > Applications**.
   - Create a new Self-hosted app for your chosen subdomain (e.g., `admin.stilled.xyz`).
   - Create a policy that strictly allows only your email address via OTP or SSO.

3. **Deploy on your Droplet:**
   - Copy this `infrastructure` folder to your Droplet.
   - Create a `.env` file in this folder:
     ```env
     GHOST_URL=https://admin.yourdomain.com
     CLOUDFLARE_TUNNEL_TOKEN=ey... (your token here)
     ```
   - Run the deployment:
     ```bash
     docker-compose up -d
     ```

## Advantages of this Architecture
- **Zero Exposed Ports:** By using `cloudflared` within the docker network, you do not expose any ports to the host or internet. All traffic securely routes from Cloudflare's edge directly to the container.
- **CVE Mitigation:** Because Ghost is totally cordoned off by Zero Trust and has no open ports, automated scanners and random attackers cannot hit the Ghost login screen or exploit Ghost vulnerabilities.
- **Memory Efficient:** Uses `ghost:5-alpine` and `sqlite3` to ensure it comfortably fits inside 1GB of server RAM.
