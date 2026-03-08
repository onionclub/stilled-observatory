import jwt from 'jsonwebtoken';

const SITE_ID = process.env.PLAUSIBLE_SITE_ID || 'stilled.xyz';
const GHOST_URL = process.env.GHOST_URL || 'http://localhost:2368';
const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY;

if (!GHOST_ADMIN_API_KEY) {
    console.error("GHOST_ADMIN_API_KEY is required to inject tracking");
    process.exit(1);
}

const [id, secret] = GHOST_ADMIN_API_KEY.split(':');

const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
    keyid: id,
    algorithm: 'HS256',
    expiresIn: '5m',
    audience: '/admin/'
});

const headers = {
    'Authorization': `Ghost ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

const trackingScript = `<script defer data-domain="${SITE_ID}" src="https://plausible.io/js/script.pageview-props.tagged-events.outbound-links.js"></script>
<script>
    window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) };
    
    document.addEventListener("DOMContentLoaded", function() {
        if (!document.body.classList.contains("post-template")) return;
        
        let maxScroll = 0;
        let startTime = Date.now();
        let slug = window.location.pathname.replace(/\\//g, '') || 'unknown';
        
        window.addEventListener("scroll", function() {
            let h = document.documentElement;
            let percent = (h.scrollTop + h.clientHeight) / h.scrollHeight * 100;
            if (percent > maxScroll) maxScroll = Math.round(percent);
        }, {passive: true});
        
        window.addEventListener("pagehide", function() {
            let timeOnPage = Math.round((Date.now() - startTime) / 1000);
            plausible('read-depth', {
                props: {
                    essay_slug: slug,
                    scroll_percent: maxScroll,
                    time_on_page_seconds: timeOnPage
                }
            });
        });

        const paperLinks = document.querySelectorAll('a[href$=".pdf"]');
        paperLinks.forEach(link => {
            link.addEventListener('click', function() {
                plausible('paper-download', {
                    props: { essay_slug: slug }
                });
            });
        });
    });
</script>`;

async function inject() {
    try {
        console.log("Fetching Ghost settings...");
        const res = await fetch(`${GHOST_URL}/ghost/api/admin/settings/`, { headers });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(`Failed to fetch settings: ${JSON.stringify(data)}`);
        }

        const headSetting = data.settings.find(s => s.key === 'codeinjection_head');
        let currentHead = headSetting ? headSetting.value : '';

        if (currentHead && currentHead.includes('plausible(') && currentHead.includes('read-depth')) {
            console.log("Tracking script already injected! Overwriting with updated script...");
            currentHead = currentHead.replace(/<script defer data-domain=.*<\/script>/s, trackingScript.trim());
        } else {
            console.log("Injecting tracking script...");
            currentHead = (currentHead || '') + '\n' + trackingScript;
        }

        console.log("Updating Ghost settings...");
        const updateRes = await fetch(`${GHOST_URL}/ghost/api/admin/settings/`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                settings: [
                    {
                        key: 'codeinjection_head',
                        value: currentHead
                    }
                ]
            })
        });

        if (!updateRes.ok) {
            const errBody = await updateRes.text();
            throw new Error(`Failed to update settings: ${errBody}`);
        }

        console.log("Successfully injected custom tracking into Ghost Site Header.");
    } catch (e) {
        console.error("Error injecting tracking:", e.message || e);
    }
}

inject();
