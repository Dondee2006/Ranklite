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

function query(table, select = '*', filter = '') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: url.hostname,
            path: `/rest/v1/${table}?select=${select}${filter}`,
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
    console.log('--- STUCK TASK AUDIT ---');
    try {
        const userId = "2e893c56-66e4-44c5-bf00-7a50787fc09d";
        const logs = await query('backlink_logs', '*', `&user_id=eq.${userId}&order=created_at.desc`);
        console.log(`Logs for User (${logs.length}):`);
        logs.slice(0, 20).forEach(l => {
            console.log(`- Action: ${l.action}, Task: ${l.task_id}, Time: ${l.created_at}, Details: ${JSON.stringify(l.details)}`);
        });

    } catch (err) {
        console.error('Query failed:', err);
    }
}

run();
