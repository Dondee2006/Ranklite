const https = require('https');
const fs = require('fs');
const path = require('path');

function parseEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        throw new Error('.env.local not found at ' + envPath);
    }
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
                    const parsed = JSON.parse(data);
                    resolve(parsed);
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
        const platforms = await query('backlink_platforms', 'id,site_name,domain_rating,automation_allowed');
        console.log(`Platforms (${platforms.length}):`, platforms.map(p => `${p.site_name} (DR ${p.domain_rating}, Auto: ${p.automation_allowed})`).join(', '));

        const campaigns = await query('backlink_campaigns', 'id,user_id,min_domain_rating,total_backlinks,unique_sources,status');
        console.log('Campaigns:', JSON.stringify(campaigns, null, 2));

        const backlinks = await query('backlinks', 'id,user_id,source_name,status');
        console.log('Backlinks Total Sum:', backlinks.length);

        // Check for user-specific counts
        const userCounts = {};
        backlinks.forEach(b => {
            userCounts[b.user_id] = (userCounts[b.user_id] || 0) + 1;
        });
        console.log('Backlinks per user:', userCounts);

        const tasks = await query('backlink_tasks', 'id,user_id,status,platform_id');
        console.log('Tasks Total:', tasks.length);
        const taskCounts = {};
        tasks.forEach(t => {
            taskCounts[t.user_id] = taskCounts[t.user_id] || {};
            taskCounts[t.user_id][t.status] = (taskCounts[t.user_id][t.status] || 0) + 1;
        });
        console.log('Tasks per user/status:', JSON.stringify(taskCounts, null, 2));

    } catch (err) {
        console.error('Query failed:', err);
    }
}

run();
