import fs from 'fs';
import path from 'path';
import process from 'process';

// Helper to manually load .env files
function loadEnv(filePath: string) {
    if (fs.existsSync(filePath)) {
        console.error(`Loading env from ${filePath}`);
        const content = fs.readFileSync(filePath, 'utf-8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

// Load .env and .env.local
const projectDir = process.cwd();
loadEnv(path.join(projectDir, '.env'));
loadEnv(path.join(projectDir, '.env.local'));

const PESAPAL_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';

async function getPesapalAccessToken() {
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        console.error("DEBUG: Credentials missing!");
        console.error("Key present?", !!consumerKey);
        console.error("Secret present?", !!consumerSecret);
        throw new Error("Missing Pesapal credentials (PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET)");
    }
    console.error("DEBUG: Credentials loaded.");

    console.error(`Authenticating with Pesapal (${PESAPAL_BASE_URL})...`);
    console.error(`Key length: ${consumerKey.length}, Secret length: ${consumerSecret.length}`);

    try {
        const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                consumer_key: consumerKey,
                consumer_secret: consumerSecret,
            }),
        });

        console.error("Fetch completed. Status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data.token;
    } catch (e: any) {
        console.error("Fetch failed completely.");
        console.error("Error Name:", e.name);
        console.error("Error Message:", e.message);
        if (e.cause) console.error("Error Cause:", e.cause);
        throw e;
    }
}

async function registerIpn() {
    try {
        const token = await getPesapalAccessToken();
        console.error("Authentication successful. Token received.");

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Allow passing URL as argument: bun scripts/register-ipn.ts <URL>
        const args = process.argv.slice(2);
        let ipnUrl = args[0];

        if (!ipnUrl) {
            ipnUrl = `${appUrl}/api/pesapal/ipn`;
        }


        console.error(`Registering IPN URL: ${ipnUrl}`);

        const response = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                url: ipnUrl,
                ipn_notification_type: 'GET' // Default to GET or POST depending on what you handle. Usually GET for this specific flow or POST. Documentation says GET or POST.
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("IPN Registration Failed. Details:");
            console.error(errorText);
            throw new Error(`Failed to register IPN: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.error("\n============================================");
        console.error("SUCCESS! IPN Registered.");
        console.error(`IPN ID: ${data.ipn_id}`);
        console.error("============================================");
        console.error("\nPlease add this IPN ID to your .env file as PESAPAL_IPN_ID");

        fs.writeFileSync('ipn_id.txt', `PESAPAL_IPN_ID=${data.ipn_id}`);
        console.error("Saved IPN ID to ipn_id.txt");

    } catch (error) {
        console.error("Error:", error);
    }
}

registerIpn();
