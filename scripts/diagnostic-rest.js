const https = require('https');

const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

function query(table, select = '*') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: url.hostname,
            path: `/rest/v1/${table}?select=${select}`,
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(data);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    console.log('--- REST API AUDIT ---');
    try {
        const platforms = await query('backlink_platforms', 'id,site_name,domain_rating');
        console.log(`Platforms (${platforms.length}):`, platforms.map(p => `${p.site_name} (DR ${p.domain_rating})`).join(', '));

        const campaigns = await query('backlink_campaigns', 'user_id,min_domain_rating,total_backlinks,unique_sources');
        console.log('Campaigns:', campaigns);

        const backlinks = await query('backlinks', 'id,user_id,source_name');
        console.log('Backlinks Total:', backlinks.length);
    } catch (err) {
        console.error('Query failed:', err);
    }
}

run();
