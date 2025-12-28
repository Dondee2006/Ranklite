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
    console.log('--- TASK FAILURE AUDIT ---');
    try {
        const failedTasks = await query('backlink_tasks', 'id,user_id,status,error_message,platform_id,platform:backlink_platforms(site_name)');
        const userId = "2e893c56-66e4-44c5-bf00-7a50787fc09d";
        const myTasks = failedTasks.filter(t => t.user_id === userId);

        console.log(`User ${userId} Tasks (${myTasks.length}):`);
        myTasks.forEach(t => {
            console.log(`- ID: ${t.id}, Status: ${t.status}, Platform: ${t.platform?.site_name || t.platform_id}, Error: ${t.error_message || 'None'}`);
        });

        const usage = await query('usage_tracking', '*');
        console.log('Usage Tracking:', usage.filter(u => u.user_id === userId));

    } catch (err) {
        console.error('Query failed:', err);
    }
}

run();
