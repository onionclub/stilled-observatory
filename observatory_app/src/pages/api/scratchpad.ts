import type { APIRoute } from 'astro';
import { getGhostAdmin, SCRATCHPAD_SLUG } from '../../utils/ghost';

export const GET: APIRoute = async () => {
    try {
        const api = getGhostAdmin();
        const posts = await api.posts.browse({ filter: `slug:${SCRATCHPAD_SLUG}`, status: 'all', formats: 'html' });

        if (posts && posts.length > 0) {
            // Strip basic ghost HTML wrapper parts for plain text presentation in the textarea
            const rawHtml = posts[0].html || '';
            const content = rawHtml.replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/<br>/g, '\n').trim();
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

        const posts = await api.posts.browse({ filter: `slug:${SCRATCHPAD_SLUG}`, status: 'all' });
        const htmlContent = content.split('\n').map((line: string) => `<p>${line}</p>`).join('');

        if (posts && posts.length > 0) {
            await api.posts.edit({
                id: posts[0].id,
                updated_at: posts[0].updated_at,
                // The Ghost Admin API automatically converts html input to lexical/mobiledoc format internal to Ghost
                html: htmlContent
            });
        } else {
            await api.posts.add({
                title: 'Observatory Scratchpad',
                slug: SCRATCHPAD_SLUG,
                html: htmlContent,
                status: 'draft'
            }, { source: 'html' }); // Specifying source HTML just in case
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to save scratchpad' }), { status: 500 });
    }
};
