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
    const cronSecretMatch = env.match(/CRON_SECRET=(.+)/);

    if (!urlMatch || !keyMatch) {
        console.error('Missing env vars');
        return;
    }

    const baseUrl = urlMatch[1].trim().replace(/^['"]|['"]$/g, '');
    const key = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');
    const cronSecret = cronSecretMatch ? cronSecretMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';

    // We can't easily call our own API via HTTPS if it's local and self-signed, 
    // but we can try calling localhost:3000 if it's running.
    // However, it's better to just invoke the logic directly in a script.

    console.log('--- Triggering Autopilot API ---');
    // We'll try to call the API route if the server is running.
    // Otherwise we'll have to use a different approach.

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/autopilot/run',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${cronSecret}`,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            try {
                console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
            } catch (e) {
                console.log('Raw Response:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Error calling API:', e.message);
        console.log('\nTIP: Is the dev server running on port 3000?');
    });

    req.end();
}

main().catch(console.error);
