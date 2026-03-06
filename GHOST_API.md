---
name: ghost-api
description: >
  Ghost API patterns, constraints, and gotchas for The Observatory build.
  Use this skill whenever writing any code that interacts with Ghost CMS —
  including publishing, member data, scratchpad persistence, metadata storage,
  authentication, or API key handling. This doc pre-empts wrong moves before
  they happen.
---

# GHOST API — PATTERNS & CONSTRAINTS SKILL
## Read Before Writing Any Ghost Interaction Code

---

## 1. TWO APIs — KNOW WHICH ONE YOU NEED

Ghost exposes two distinct APIs. Using the wrong one is the most common mistake.

### Ghost Admin API
- **What it can do:** Create, read, update, delete posts. Manage members. Access member metadata. Create integrations. Full write access.
- **Authentication:** Admin API Key — format is `id:secret` (split at the colon). Never expose in client-side code.
- **Use for:** Writing Room publishing, scratchpad persistence, all Observatory data reads, member management.
- **Environment variable:** `GHOST_ADMIN_API_KEY`

### Ghost Content API
- **What it can do:** Read published posts and pages only. No write access. No member data.
- **Authentication:** Content API Key — safe to expose in frontend code.
- **Use for:** Public-facing site reads only (the Stilled frontend, not The Observatory).
- **Environment variable:** `GHOST_CONTENT_API_KEY`

**The Observatory uses the Admin API exclusively.** The Content API is for the public frontend.

---

## 2. AUTHENTICATION PATTERN

```typescript
// Admin API authentication in Astro SSR (server-side only)
// Never call this from client-side code

const GHOST_URL = import.meta.env.GHOST_URL; // e.g. http://localhost:2368
const GHOST_ADMIN_API_KEY = import.meta.env.GHOST_ADMIN_API_KEY;

// Split the key
const [id, secret] = GHOST_ADMIN_API_KEY.split(':');

// Generate JWT token (Ghost Admin API requires JWT auth)
import jwt from 'jsonwebtoken';

const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
  keyid: id,
  algorithm: 'HS256',
  expiresIn: '5m',
  audience: '/admin/'
});

// Use in headers
const headers = {
  'Authorization': `Ghost ${token}`,
  'Content-Type': 'application/json'
};
```

**Important:** JWT tokens expire in 5 minutes. Generate a fresh token per request — do not cache tokens across requests.

---

## 3. SCRATCHPAD PERSISTENCE PATTERN

The scratchpad stores text server-side in Ghost member metadata. This is the established pattern for this project. Do not deviate from it.

**The scratchpad member:**
- Email: `scratchpad@stilled.xyz`
- This is a dedicated Ghost member used solely for scratchpad storage
- It must be hidden from all public member lists, newsletter sends, and analytics zones
- It must never appear in Audience Depth Index data
- It must never receive newsletter emails

**Reading scratchpad content:**
```typescript
// GET /ghost/api/admin/members/?filter=email:scratchpad@stilled.xyz
const response = await fetch(
  `${GHOST_URL}/ghost/api/admin/members/?filter=email:scratchpad@stilled.xyz`,
  { headers }
);
const data = await response.json();
const scratchpadContent = data.members[0]?.note || '';
```

**Writing scratchpad content:**
```typescript
// First get the member ID
const member = data.members[0];

// PUT /ghost/api/admin/members/{id}/
await fetch(`${GHOST_URL}/ghost/api/admin/members/${member.id}/`, {
  method: 'PUT',
  headers,
  body: JSON.stringify({
    members: [{
      note: scratchpadContent
    }]
  })
});
```

**If the scratchpad member doesn't exist yet, create it:**
```typescript
await fetch(`${GHOST_URL}/ghost/api/admin/members/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    members: [{
      email: 'scratchpad@stilled.xyz',
      name: 'Scratchpad',
      note: '',
      subscribed: false, // Never subscribe to newsletters
      labels: [{ name: 'system' }]
    }]
  })
});
```

---

## 4. PUBLISHING POSTS FROM THE WRITING ROOM

```typescript
// Create a draft post
const post = await fetch(`${GHOST_URL}/ghost/api/admin/posts/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    posts: [{
      title: postTitle,
      html: postContent,
      status: 'draft', // or 'published'
      feature_image: coverImageUrl || null,
      custom_excerpt: null,
      // Custom metadata for Observatory tracking
      codeinjection_head: `<meta name="youtube-url" content="${youtubeUrl}">`,
    }]
  })
});
```

**Publishing vs scheduling:**
```typescript
// Publish immediately
status: 'published'

// Schedule for future
status: 'scheduled',
published_at: '2026-04-01T09:00:00.000Z' // ISO 8601 format
```

**Sending as newsletter:**
```typescript
// Add newsletter field when publishing
newsletter: {
  id: newsletterId // Get from /ghost/api/admin/newsletters/
},
email_recipient_filter: 'all'
```

**Subscriber note (private, email-only):**
Ghost does not have a native "subscriber note" field on posts. Implement this by prepending the note to the email template via the newsletter's custom template, or store it in the post's `codeinjection_foot` as a hidden meta tag that the email rendering layer reads. Agreed implementation: store in post metadata and inject into email template only, never rendered on the web.

---

## 5. READING POST PERFORMANCE DATA

For the Resonance Index, Baseline Engine, and Convergence Events — Ghost provides subscriber conversion data. Plausible provides scroll depth, time on page, and return visits.

**Getting posts with member conversion data:**
```typescript
// Get all posts with their tier/access data
const posts = await fetch(
  `${GHOST_URL}/ghost/api/admin/posts/?limit=all&include=authors,tags`,
  { headers }
);
```

**Getting new subscribers per post:**
Ghost does not natively track which post converted a subscriber. The pattern is to track UTM parameters or referrer data via Plausible, then cross-reference with Ghost member creation timestamps. This is Phase 3 work — do not attempt to build this in Phase 1 or 2.

---

## 6. MEMBER DATA FOR AUDIENCE DEPTH INDEX

```typescript
// Get all members (paginated — Ghost returns max 15 per page by default)
const members = await fetch(
  `${GHOST_URL}/ghost/api/admin/members/?limit=all&filter=email:-scratchpad@stilled.xyz`,
  { headers }
);
// The filter excludes the scratchpad member from all audience data
```

**Important:** Always append `&filter=email:-scratchpad@stilled.xyz` to every member query used for analytics. The minus sign negates the filter — it excludes that email.

---

## 7. YOUTUBE URL ASSOCIATION

Ghost does not have a native YouTube URL field on posts. The established pattern for this project is to store the YouTube URL in the post's `codeinjection_head` as a meta tag:

```html
<meta name="stilled-youtube-url" content="https://youtube.com/watch?v=...">
```

The Observatory Writing Room writes this on publish. Zone 7 reads it when building the YouTube Intelligence Feed by fetching posts and parsing this meta tag.

---

## 8. PAPER / PDF ASSOCIATION

Similarly, academic paper uploads are stored as Ghost file uploads, with the URL stored in `codeinjection_head`:

```html
<meta name="stilled-paper-url" content="https://yourdomain.com/content/files/paper.pdf">
```

Zone 7's Commentary-to-Paper Bridge Rate tracks clicks on this URL via Plausible custom events.

---

## 9. ENVIRONMENT VARIABLES — COMPLETE LIST

```bash
# Ghost
GHOST_URL=http://localhost:2368          # Local. Change to https://yourdomain.com at deployment.
GHOST_ADMIN_API_KEY=your_id:your_secret  # From Ghost Admin > Integrations > Observatory

# Analytics (Phase 2 — leave blank until deployment)
PLAUSIBLE_API_KEY=
PLAUSIBLE_SITE_ID=

# YouTube (Phase 2 — can be obtained before deployment)
YOUTUBE_API_KEY=
```

**Security rules:**
- All Ghost Admin API calls are server-side only (Astro SSR). Never in client components.
- Never log API keys. Never commit .env to git (confirm .gitignore includes .env).
- Ghost Admin API key format is `id:secret` — the colon is the delimiter, not part of either value.

---

## 10. KNOWN GHOST GOTCHAS

**CVEs and security posture:**
Ghost has known CVEs including XSS-to-owner-takeover and auth bypass. These are structurally non-applicable in this build because: (a) it's a solo operator with no other admin users, (b) Cloudflare Zero Trust gates the admin URL before Ghost login is reached. If Ghost is ever reconfigured to allow additional admin users, the Zero Trust posture must be re-evaluated first.

**Ghost local vs production URLs:**
`GHOST_URL` in local development is `http://localhost:2368`. At deployment this changes to `https://yourdomain.com`. All API calls use this env variable — never hardcode the URL.

**Ghost Alpine container:**
The Docker setup uses `ghost:5-alpine`. Do not upgrade the major version without verifying Admin API compatibility. Ghost 5.x Admin API is the target version for all patterns in this document.

**SQLite vs MySQL:**
The local Docker setup uses SQLite for simplicity. Production on Hetzner should use MySQL for reliability. The Ghost Admin API is identical between both — no code changes needed when switching databases.

**Rate limiting:**
Ghost Admin API has no official documented rate limit for self-hosted instances, but batch requests should be kept reasonable. For the Intelligence Gap Indicator polling (every 5 minutes), a single lightweight ping per data source is sufficient — do not batch large data pulls on the polling interval.

**Pagination:**
Ghost returns 15 records per page by default. Always use `?limit=all` for analytics queries that need complete datasets. For very large member lists (unlikely at this scale) implement cursor-based pagination.

**Member `note` field character limit:**
The Ghost member `note` field has a practical limit. For the scratchpad, treat anything over 50,000 characters as a warning threshold and surface a notice in the Writing Room. There is no hard API enforcement, but very large notes may cause performance issues.
