
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function triggerAutopilot() {
    console.log(`Triggering Autopilot at ${APP_URL}/api/autopilot/run...`);

    try {
        const response = await fetch(`${APP_URL}/api/autopilot/run`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`
            }
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Body:", JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log(">>> SUCCESS: Autopilot run initiated.");
        } else {
            console.error(">>> FAILED: Check server logs.");
        }
    } catch (error) {
        console.error("Error triggering autopilot:", error.message);
        console.log("Make sure your local server is running (npm run dev)!");
    }
}

triggerAutopilot();
