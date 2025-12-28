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

    async function query(table, filter = '') {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: new URL(url).hostname,
                path: `/rest/v1/${table}?${filter}`,
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

    console.log('--- SITE AUTOPILOT STATUS ---');
    const sites = await query('sites', 'select=id,name,url,website_url');
    const settings = await query('autopilot_settings', 'select=*');

    sites.forEach(site => {
        const s = settings.find(st => st.site_id === site.id);
        console.log(`\nSite: ${site.name} (${site.id})`);
        if (s) {
            console.log(`  Autopilot: ${s.enabled ? 'ENABLED' : 'DISABLED'}`);
            console.log(`  Quota: ${s.articles_per_day} per day`);
            console.log(`  Window: ${s.publish_time_start} - ${s.publish_time_end} UTC`);
            console.log(`  Last Sync: ${s.last_sync_at}`);
        } else {
            console.log('  Autopilot settings NOT FOUND');
        }
    });

    console.log('\n--- USER PLANS & USAGE ---');
    const userIds = [...new Set(sites.map(s => s.user_id))];
    for (const uid of userIds) {
        const plans = await query('user_plans', `select=*&user_id=eq.${uid}`);
        const usage = await query('user_usage', `select=*&user_id=eq.${uid}`);
        console.log(`\nUser: ${uid}`);
        if (plans.length > 0) {
            console.log(`  Plan: ${plans[0].plan_name} (${plans[0].status})`);
            console.log(`  Posts/Mo: ${plans[0].posts_per_month}`);
        } else {
            console.log('  No plan found');
        }
        if (usage.length > 0) {
            console.log(`  Posts Gen: ${usage[0].posts_generated}`);
        } else {
            console.log('  No usage found');
        }
    }

    console.log('\n--- ARTICLES FOR YESTERDAY (2025-12-27) ---');
    const yesterday = '2025-12-27';
    const yArticles = await query('articles', `select=id,title,status,scheduled_date,scheduled_time,site_id&scheduled_date=eq.${yesterday}`);

    if (yArticles.length === 0) {
        console.log('No articles found for yesterday.');
    } else {
        yArticles.forEach(a => {
            const site = sites.find(s => s.id === a.site_id);
            console.log(`- [${a.status}] ${a.title} | Time: ${a.scheduled_time || 'ANY'} | Site: ${site?.name || 'Unknown'}`);
        });
    }

    console.log('\n--- ARTICLES FOR TODAY (2025-12-28) ---');
    const today = '2025-12-28';
    const articles = await query('articles', `select=id,title,status,scheduled_date,scheduled_time,site_id&scheduled_date=eq.${today}`);

    if (articles.length === 0) {
        console.log('No articles found for today.');
    } else {
        articles.forEach(a => {
            const site = sites.find(s => s.id === a.site_id);
            console.log(`- [${a.status}] ${a.title} | Time: ${a.scheduled_time || 'ANY'} | Site: ${site?.name || 'Unknown'}`);
        });
    }

    console.log('\n--- RECENT PUBLISHED ---');
    const published = await query('articles', `select=id,title,status,scheduled_date,published_at,site_id&status=eq.published&limit=5&order=published_at.desc`);
    published.forEach(a => {
        const site = sites.find(s => s.id === a.site_id);
        console.log(`- [${a.status}] ${a.title} | Pub: ${a.published_at} | Site: ${site?.name || 'Unknown'}`);
    });
}

main().catch(console.error);
