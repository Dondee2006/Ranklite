require('dotenv').config({ path: '.env.local' });
const token = process.env.NOTION_TOKEN;
const targetDbId = process.env.NOTION_DATABASE_ID;

if (!token) {
    console.error('Error: NOTION_TOKEN not found in .env.local');
    process.exit(1);
}

console.log('Target Database ID:', targetDbId);

async function testNotionConnection() {
    console.log('Testing Notion API connection...\n');

    try {
        const response = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filter: { property: 'object', value: 'database' },
            }),
        });

        console.log('Response Status:', response.status, response.statusText);

        const data = await response.json();

        if (!response.ok) {
            console.error('\n❌ Connection Failed!');
            console.error('Error:', JSON.stringify(data, null, 2));

            if (response.status === 401) {
                console.error('\n💡 This means your token is invalid or expired.');
                console.error('   Please check:');
                console.error('   1. Token starts with "secret_"');
                console.error('   2. Token was copied correctly (no extra spaces)');
                console.error('   3. Integration still exists in Notion settings');
            } else if (response.status === 403) {
                console.error('\n💡 This means your integration lacks permissions.');
                console.error('   Please check:');
                console.error('   1. Integration has "Read content" capability');
                console.error('   2. Integration is connected to your workspace');
            }

            process.exit(1);
        }

        console.log('\n✅ Connection Successful!');
        console.log(`Found ${data.results?.length || 0} databases`);

        if (data.results && data.results.length > 0) {
            console.log('\nAvailable Databases:');
            let found = false;
            data.results.forEach((db, i) => {
                const title = db.title?.[0]?.plain_text || 'Untitled';
                const id = db.id.replace(/-/g, '');
                const target = targetDbId.replace(/-/g, '');
                const match = id === target;
                if (match) found = true;
                console.log(`  ${i + 1}. ${title} (ID: ${db.id}) ${match ? '✅ MATCH' : ''}`);
            });

            if (found && targetDbId) {
                console.log('\n--- Querying Target Database ---');
                const queryRes = await fetch(`https://api.notion.com/v1/databases/${targetDbId}/query`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Notion-Version': '2022-06-28',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ page_size: 10 })
                });

                if (queryRes.ok) {
                    const queryData = await queryRes.json();
                    console.log(`Query returned ${queryData.results.length} pages.`);
                    if (queryData.results.length > 0) {
                        const p = queryData.results[0].properties;
                        console.log('First page properties:', Object.keys(p));
                        // Check for Slug
                        if (!p.Slug && !p.slug) {
                            console.log('⚠️  WARNING: "Slug" property not found! (Case sensitive?)');
                        }
                    } else {
                        console.log('⚠️  Database is empty or contains no pages.');
                    }
                } else {
                    console.log('❌ Failed to query database:', queryRes.status);
                    const e = await queryRes.text();
                    console.log(e);
                }
            }
        } else {
            console.log('\n⚠️  No databases found. Make sure to:');
            console.log('   1. Share a database with your integration');
            console.log('   2. Click "..." on the database → Add connections → Select your integration');
        }

    } catch (error) {
        console.error('\n❌ Network Error:', error.message);
        process.exit(1);
    }
}

testNotionConnection();
