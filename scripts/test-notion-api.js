// Test the Notion auth API directly
// Usage: node scripts/test-notion-api.js YOUR_TOKEN_HERE

const token = process.argv[2];

if (!token) {
    console.error('Please provide your Notion token');
    console.error('Usage: node scripts/test-notion-api.js secret_xxxxx');
    process.exit(1);
}

async function testNotionAPI() {
    console.log('Testing Notion auth API endpoint...\n');

    try {
        const response = await fetch('http://localhost:3000/api/cms/notion/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': '' // You'll need to be logged in for this to work
            },
            body: JSON.stringify({
                access_token: token
            })
        });

        console.log('Response status:', response.status);

        const data = await response.json();

        if (!response.ok) {
            console.error('\n❌ API Error:');
            console.error(JSON.stringify(data, null, 2));
        } else {
            console.log('\n✅ Success!');
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('\n❌ Request failed:', error.message);
    }
}

testNotionAPI();
