import { createHmac } from 'node:crypto';

// Ghost Admin API client using native fetch with Cloudflare Access service token auth.
// Bypasses @tryghost/admin-api which doesn't support custom headers for Cloudflare Access.

function getAccessHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const cfId = process.env.CF_ACCESS_CLIENT_ID;
    const cfSecret = process.env.CF_ACCESS_CLIENT_SECRET;
    if (cfId && cfSecret) {
        headers['CF-Access-Client-Id'] = cfId;
        headers['CF-Access-Client-Secret'] = cfSecret;
    }
    return headers;
}

function signJWT(key: string, audience: string): string {
    const [id, secret] = key.split(':');
    if (!id || !secret) return key;

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT', kid: id })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + 300, aud: audience })).toString('base64url');
    const token = `${header}.${payload}`;
    const sig = createHmac('sha256', Buffer.from(secret, 'hex')).update(token).digest('base64url');
    return `${token}.${sig}`;
}

const BASE_URL = process.env.GHOST_URL || 'https://admin.stilled.page';
const API_KEY = process.env.GHOST_ADMIN_API_KEY || '';

async function api(path: string, init: RequestInit = {}): Promise<any> {
    const url = `${BASE_URL}${path}`;
    const token = signJWT(API_KEY, '/admin/');
    const headers: Record<string, string> = {
        'Accept-Version': 'v5.0',
        'Authorization': `Ghost ${token}`,
        'Content-Type': 'application/json',
        ...getAccessHeaders(),
        ...(init.headers as Record<string, string> || {}),
    };
    const res = await fetch(url, { ...init, headers });
    const body = await res.json();
    if (!res.ok) {
        const msg = body.errors?.[0]?.message || res.statusText;
        throw new Error(`Ghost API ${res.status}: ${msg}`);
    }
    return body;
}

function buildQuery(params: Record<string, any> = {}): string {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) qs.append(k, String(v));
    }
    const s = qs.toString();
    return s ? `?${s}` : '';
}

export interface GhostPost {
    id: string;
    slug: string;
    title: string;
    status: string;
    html?: string;
    excerpt?: string;
    custom_excerpt?: string;
    feature_image?: string | null;
    published_at?: string | null;
    created_at: string;
    updated_at: string;
    url?: string;
    reading_time?: number;
    tags?: Array<{ id: string; slug: string; name: string }>;
}

export function getGhostAdmin() {
    return {
        posts: {
            browse: (opts?: Record<string, any>) =>
                api(`/ghost/api/admin/posts/${buildQuery(opts)}`)
                    .then((data: any) => data.posts || []),

            read: (opts: { id?: string; slug?: string }) => {
                const param = opts.id ? `${opts.id}/` : `slug/${opts.slug}/`;
                return api(`/ghost/api/admin/posts/${param}`)
                    .then((data: any) => data.posts?.[0] || null);
            },

            add: (postData: Partial<GhostPost>, queryParams?: Record<string, any>) =>
                api(`/ghost/api/admin/posts/${buildQuery(queryParams)}`, {
                    method: 'POST',
                    body: JSON.stringify({ posts: [postData] }),
                }).then((r: any) => r.posts?.[0] || null),

            edit: (data: { id: string; updated_at?: string } & Partial<GhostPost>) => {
                const { id, updated_at, ...rest } = data;
                return api(`/ghost/api/admin/posts/${id}/`, {
                    method: 'PUT',
                    body: JSON.stringify({ posts: [{ ...rest, updated_at }] }),
                }).then((r: any) => r.posts?.[0] || null);
            },
        },

        members: {
            browse: (opts?: Record<string, any>) =>
                api(`/ghost/api/admin/members/${buildQuery(opts)}`)
                    .then((data: any) => data.members || []),

            read: (opts: { id?: string; slug?: string; email?: string }) => {
                const param = opts.id ? `${opts.id}/` :
                    opts.email ? `email/${opts.email}/` :
                    `slug/${opts.slug}/`;
                return api(`/ghost/api/admin/members/${param}`)
                    .then((data: any) => data.members?.[0] || null);
            },

            add: (memberData: Record<string, any>, queryParams?: Record<string, any>) =>
                api(`/ghost/api/admin/members/${buildQuery(queryParams)}`, {
                    method: 'POST',
                    body: JSON.stringify({ members: [memberData] }),
                }).then((r: any) => r.members?.[0] || null),

            edit: (data: { id: string } & Record<string, any>) => {
                const { id, ...rest } = data;
                return api(`/ghost/api/admin/members/${id}/`, {
                    method: 'PUT',
                    body: JSON.stringify({ members: [rest] }),
                }).then((r: any) => r.members?.[0] || null);
            },
        },
    };
}

export const SCRATCHPAD_SLUG = 'observatory-scratchpad';
