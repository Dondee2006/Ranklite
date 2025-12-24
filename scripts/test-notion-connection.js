// Test Notion API connection
// Usage: node scripts/test-notion-connection.js YOUR_TOKEN_HERE

const token = process.argv[2];

if (!token) {
    console.error('Please provide a Notion integration token as an argument');
    console.error('Usage: node scripts/test-notion-connection.js secret_xxxxx');
    process.exit(1);
}

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
            data.results.forEach((db, i) => {
                console.log(`  ${i + 1}. ${db.title?.[0]?.plain_text || 'Untitled'} (ID: ${db.id})`);
            });
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
