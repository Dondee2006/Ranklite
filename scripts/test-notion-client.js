require('dotenv').config({ path: '.env.local' });
const { Client } = require('@notionhq/client');

const token = process.env.NOTION_TOKEN;
const dbId = process.env.NOTION_DATABASE_ID;

console.log('Creating Notion client...');
const notion = new Client({ auth: token });

console.log('Client object keys:', Object.keys(notion));
console.log('Databases object:', notion.databases);
console.log('Databases keys:', Object.keys(notion.databases || {}));
console.log('Type of databases.query:', typeof notion.databases?.query);

// Try the actual query
async function test() {
    try {
        console.log('\nAttempting query...');
        const result = await notion.databases.query({
            database_id: dbId,
        });
        console.log('SUCCESS! Got', result.results.length, 'results');
    } catch (error) {
        console.error('ERROR:', error.message);
    }
}

test();
