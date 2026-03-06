import type { APIRoute } from 'astro';
import { getGhostAdmin } from '../../utils/ghost';

const SCRATCHPAD_EMAIL = 'scratchpad@stilled.xyz';

export const GET: APIRoute = async () => {
    try {
        const api = getGhostAdmin();
        const members = await api.members.browse({ filter: `email:'${SCRATCHPAD_EMAIL}'` });

        if (members && members.length > 0) {
            const content = members[0].note || '';
            return new Response(JSON.stringify({ content }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ content: '' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch scratchpad' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const content = data.content || '';
        const api = getGhostAdmin();

        const members = await api.members.browse({ filter: `email:'${SCRATCHPAD_EMAIL}'` });

        if (members && members.length > 0 && members[0].id) {
            await api.members.edit({
                id: members[0].id,
                email: SCRATCHPAD_EMAIL,
                note: content,
                newsletters: [],
                labels: [{ name: 'System', slug: 'system-scratchpad' }],
            } as any);
        } else {
            await api.members.add({
                email: SCRATCHPAD_EMAIL,
                name: 'Observatory Scratchpad',
                note: content,
                newsletters: [],
                labels: [{ name: 'System', slug: 'system-scratchpad' }]
            } as any);
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to save scratchpad' }), { status: 500 });
    }
};
