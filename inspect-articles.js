const https = require('https');
const fs = require('fs');
const path = require('path');

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
                path: `/rest/v1/${table}?select=${select}&limit=1`,
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`
                }
            };
            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
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

    console.log('--- Inspecting Article Columns ---');
    const result = await query('articles');
    if (Array.isArray(result) && result.length > 0) {
        console.log('Columns found:', Object.keys(result[0]));
    } else {
        console.log('Result:', result);
    }
}

main().catch(console.error);
