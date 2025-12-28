const https = require('https');
const fs = require('fs');
const path = require('path');

function parseEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
    return env;
}

const env = parseEnv();
const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
const key = env.SUPABASE_SERVICE_ROLE_KEY;

function query(table, select = '*') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: url.hostname,
            path: `/rest/v1/${table}?select=${select}&action=eq.task_failed&order=created_at.desc`,
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
    console.log('--- ACTION LOG AUDIT ---');
    try {
        const logs = await query('logs', '*');
        console.log(`Failed Task Logs (${logs.length}):`);
        logs.slice(0, 10).forEach(l => {
            console.log(`- Time: ${l.created_at}, Info: ${JSON.stringify(l.metadata)}`);
        });

    } catch (err) {
        console.error('Query failed:', err);
    }
}

run();
