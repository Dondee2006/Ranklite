const https = require('https');
const fs = require('fs');

async function main() {
    let env = fs.readFileSync('.env.local', 'utf8');
    const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim().replace(/^['"]|['"]$/g, '');
    const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim().replace(/^['"]|['"]$/g, '');

    async function query(table, filter = '') {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: new URL(url).hostname,
                path: `/rest/v1/${table}?${filter}`,
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            };
            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });
    }

    console.log('--- SITE OWNERS & PLANS ---');
    const sites = await query('sites', 'select=id,name,user_id');
    const plans = await query('user_plans', 'select=*');

    sites.forEach(site => {
        const p = plans.find(pl => pl.user_id === site.user_id);
        console.log(`Site: ${site.name} | User: ${site.user_id}`);
        if (p) {
            console.log(`  Plan: ${p.plan_name} | Status: ${p.status}`);
        } else {
            console.log('  PLAN NOT FOUND');
        }
    });

    // Also check if there's a plan for the user currently logged in (if we knew who it was)
    // But we are using the service role key, so we see everyone.
}

main().catch(console.error);
