const https = require('https');
const fs = require('fs');

async function main() {
    // Notion Data
    const token = 'ntn_F9011703468xGOt6hpzGkzmHGp2RJ2dvAYVzZ9KtoyT6v0';
    const dbId = '2d321923-aeac-8087-b744-d6f6d497b3b5';

    async function queryNotion() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.notion.com',
                path: `/v1/databases/${dbId}/query`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                }
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            });
            req.on('error', reject);
            req.write(JSON.stringify({}));
            req.end();
        });
    }

    // Supabase Data
    let envContent = fs.readFileSync('.env.local', 'utf8');
    const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim().replace(/^['"]|['"]$/g, '');
    const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim().replace(/^['"]|['"]$/g, '');

    async function querySupabase(table) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: new URL(url).hostname,
                path: `/rest/v1/${table}?select=id,slug&status=eq.published`,
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            };
            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });
    }

    console.log('Fetching data...');
    const notionData = await queryNotion();
    const supabaseArticles = await querySupabase('articles');

    // Hardcoded Integration ID (from previous step)
    const integrationId = 'acb17c05-ed0a-4f17-8777-c09b73e4e029';

    console.log('\n-- REPAIR SQL --\n');
    const sqlLines = [
        '-- 1. Add missing columns',
        'ALTER TABLE articles ADD COLUMN IF NOT EXISTS cms_target text;',
        'ALTER TABLE articles ADD COLUMN IF NOT EXISTS cms_post_id text;',
        'ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_url text;',
        'ALTER TABLE articles ADD COLUMN IF NOT EXISTS integration_id uuid;',
        '\n-- 2. Link articles to Notion'
    ];

    supabaseArticles.forEach(article => {
        const matchingPage = notionData.results.find(page => {
            const nTitle = page.properties.Name?.title[0]?.plain_text || '';
            const nSlug = nTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            return article.slug.includes(nSlug) || nSlug.includes(article.slug);
        });

        if (matchingPage) {
            sqlLines.push(`UPDATE articles SET cms_target = 'notion', cms_post_id = '${matchingPage.id}', integration_id = '${integrationId}' WHERE id = '${article.id}';`);
        }
    });

    const finalSql = sqlLines.join('\n');
    fs.writeFileSync('REPAIR_CMS.sql', finalSql);
    console.log('Final SQL written to REPAIR_CMS.sql');
}

main().catch(console.error);
