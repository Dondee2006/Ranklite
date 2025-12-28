const https = require('https');
const fs = require('fs');

async function main() {
    let env = fs.readFileSync('.env.local', 'utf8');
    const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim().replace(/^['"]|['"]$/g, '');
    const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim().replace(/^['"]|['"]$/g, '');

    async function query(table, select = '*') {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: new URL(url).hostname,
                path: `/rest/v1/${table}?select=${select}&limit=1`,
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            };
            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });
    }

    console.log('--- Inspecting user_plans Columns ---');
    const result = await query('user_plans');
    if (Array.isArray(result) && result.length > 0) {
        console.log('Columns:', Object.keys(result[0]));
        console.log('Data sample:', JSON.stringify(result[0], null, 2));
    } else {
        console.log('No data or error:', result);
    }
}

main().catch(console.error);
