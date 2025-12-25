
require('dotenv').config({ path: '.env.local' });
const { Client } = require('@notionhq/client');

const token = process.env.NOTION_TOKEN;
const dbId = process.env.NOTION_DATABASE_ID;

console.log('Testing Notion Query...');
console.log('Token exists:', !!token);
console.log('DB ID:', dbId);

if (!token || !dbId) {
    console.error('Missing credentials in .env.local');
    process.exit(1);
}

const notion = new Client({
    auth: token,
});

console.log('Notion client keys:', Object.keys(notion));
if (notion.databases) {
    console.log('notion.databases keys:', Object.keys(notion.databases));
}

async function run() {
    try {
        console.log('Querying database (no filter)...');
        // Use the same pattern as notion.ts - cast to any to access query method
        const response = await notion.databases.query({
            database_id: dbId,
            sorts: [
                {
                    property: 'Published Date',
                    direction: 'descending',
                },
            ],
        });

        console.log(`Success! Found ${response.results.length} pages.`);
        if (response.results.length > 0) {
            console.log('First page ID:', response.results[0].id);
            console.log('Sample properties:', JSON.stringify(Object.keys(response.results[0].properties)));
            console.log('\nFirst page full properties:');
            const firstPage = response.results[0];
            for (const [key, value] of Object.entries(firstPage.properties)) {
                console.log(`  ${key}: ${value.type}`);
            }
        } else {
            console.log('Warning: No pages returned. Is the database empty?');
        }

    } catch (error) {
        console.error('Error querying Notion:', error.message);
        console.error('Full error:', error);
    }
}

run();
