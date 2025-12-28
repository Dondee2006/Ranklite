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

    async function querySupabase(table, queryParams = 'select=*') {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: new URL(url).hostname,
                path: `/rest/v1/${table}?${queryParams}`,
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
                        reject(new Error(`Failed to parse response: ${data}`));
                    }
                });
            }).on('error', reject);
        });
    }

    async function queryNotion(token, dbId, slug) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                filter: {
                    property: "Slug",
                    rich_text: {
                        equals: slug
                    }
                }
            });

            const options = {
                hostname: 'api.notion.com',
                path: `/v1/databases/${dbId}/query`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            });

            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }

    const targetSlugs = [
        "transform-your-seo-writing-with-artificial-intelligence",
        "top-choices-for-small-enterprises-ai-driven-seo-solutions"
    ];

    console.log('--- Fetching Articles ---');
    const articles = await querySupabase('articles', 'select=id,slug,integration_id,cms_post_id&status=eq.published');
    console.log('Articles response:', articles);
    if (!Array.isArray(articles)) {
        console.error('Supabase response is not an array!');
        return;
    }
    const matching = articles.filter(a => targetSlugs.includes(a.slug));

    if (matching.length === 0) {
        console.log('No matching articles found in Supabase.');
        return;
    }

    for (const article of matching) {
        console.log(`\nProcessing: ${article.slug}`);
        if (!article.integration_id) {
            console.log('No integration_id for this article.');
            continue;
        }

        const integration = await querySupabase('cms_integrations', `id=eq.${article.integration_id}&select=*`);
        if (!integration || integration.length === 0) {
            console.log(`Integration ${article.integration_id} not found.`);
            continue;
        }

        const creds = integration[0].credentials;
        const config = integration[0].config;
        const token = creds?.access_token;
        const dbId = config?.database_id || creds?.database_id;

        if (!token || !dbId) {
            console.log('Missing Notion token or database ID in integration.');
            console.log('Integration data:', JSON.stringify(integration[0], null, 2));
            continue;
        }

        console.log(`Querying Notion for slug: ${article.slug}`);
        const notionData = await queryNotion(token, dbId, article.slug);

        if (!notionData.results || notionData.results.length === 0) {
            console.log('No results found in Notion.');
            continue;
        }

        const page = notionData.results[0];
        console.log(`Notion Page ID: ${page.id}`);
        console.log('Native Cover:', JSON.stringify(page.cover, null, 2));

        // Find property name that might be an image
        const props = page.properties;
        const imageProps = Object.keys(props).filter(k =>
            k.toLowerCase().includes('image') ||
            k.toLowerCase().includes('cover') ||
            k.toLowerCase().includes('file') ||
            k.toLowerCase().includes('thumbnail')
        );

        imageProps.forEach(pk => {
            console.log(`Property '${pk}':`, JSON.stringify(props[pk], null, 2));
        });
    }
}

main().catch(console.error);
