/**
 * Ghost Content API data source for Stilled theories.
 * Ghost posts tagged "theory" map to the Syntheses layer.
 * Uses Cloudflare Access service token to bypass Zero Trust gate.
 */

const GHOST_URL = import.meta.env.GHOST_URL || 'https://admin.stilled.page';
const GHOST_CONTENT_API_KEY = import.meta.env.GHOST_CONTENT_API_KEY;
const CF_CLIENT_ID = import.meta.env.CF_ACCESS_CLIENT_ID;
const CF_CLIENT_SECRET = import.meta.env.CF_ACCESS_CLIENT_SECRET;

function getHeaders() {
  const headers = {};
  if (CF_CLIENT_ID && CF_CLIENT_SECRET) {
    headers['CF-Access-Client-Id'] = CF_CLIENT_ID;
    headers['CF-Access-Client-Secret'] = CF_CLIENT_SECRET;
  }
  return headers;
}

function mapPost(post) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || post.custom_excerpt || '',
    publishedAt: post.published_at,
    featureImage: post.feature_image || null,
    html: post.html || undefined,
    readingTime: post.reading_time || 0,
    tags: (post.tags || []).map(t => ({ id: t.id, slug: t.slug, name: t.name })),
    primaryTag: post.primary_tag ? { id: post.primary_tag.id, slug: post.primary_tag.slug, name: post.primary_tag.name } : null,
  };
}

export async function getSyntheses() {
  if (!GHOST_CONTENT_API_KEY) {
    console.warn('Ghost Content API key missing.');
    return [];
  }
  try {
    const url = `${GHOST_URL}/ghost/api/content/posts/?key=${GHOST_CONTENT_API_KEY}&filter=tag:theory&limit=all&fields=slug,title,excerpt,custom_excerpt,published_at,feature_image,reading_time&include=tags`;
    const response = await fetch(url, { headers: getHeaders() });
    const data = await response.json();
    if (!data.posts) return [];
    return data.posts.map(mapPost);
  } catch (error) {
    console.error('Error fetching syntheses:', error);
    return [];
  }
}

export async function getSynthesisBySlug(slug) {
  if (!GHOST_CONTENT_API_KEY) return null;
  try {
    const url = `${GHOST_URL}/ghost/api/content/posts/slug/${slug}/?key=${GHOST_CONTENT_API_KEY}&fields=slug,title,excerpt,custom_excerpt,published_at,feature_image,reading_time&include=tags,html`;
    const response = await fetch(url, { headers: getHeaders() });
    const data = await response.json();
    if (!data.posts || !data.posts[0]) return null;
    return mapPost(data.posts[0]);
  } catch (error) {
    console.error(`Error fetching synthesis ${slug}:`, error);
    return null;
  }
}
