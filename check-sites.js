const https = require('https');
const fs = require('fs');

async function main() {
    let env;
    try {
        env = fs.readFileSync('.env.local', 'utf8');
    } catch (e) {
        console.error('Could not read .env.local');
        return;
    }

    const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);

    if (!urlMatch || !keyMatch) {
        console.error('Missing env vars');
        return;
    }

    const url = urlMatch[1].trim().replace(/^['"]|['"]$/g, '');
    const key = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');

    async function query(table, select = '*') {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: new URL(url).hostname,
                path: `/rest/v1/${table}?select=${select}`,
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`
                }
            };
            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });
    }

    const sites = await query('sites', 'id,name,url,website_url');
    const articles = await query('articles', 'id,site_id,status,published_at,created_at');
    const published = articles.filter(a => a.status === 'published');

    const sitesMap = {};
    sites.forEach(s => sitesMap[s.id] = s);

    const bySite = {};
    published.forEach(a => {
        if (!bySite[a.site_id]) bySite[a.site_id] = [];
        bySite[a.site_id].push(a);
    });

    console.log('--- SITE ACTIVITY ---');
    Object.keys(bySite).forEach(sid => {
        const site = sitesMap[sid] || { name: 'Unknown' };
        const latest = bySite[sid].sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))[0];
        console.log(`Site: ${site.name} (${sid}) | Count: ${bySite[sid].length} | Latest Pub: ${latest.published_at || latest.created_at}`);
    });
}

main().catch(console.error);
